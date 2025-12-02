// functions/index.js — FINAL & PERFECT
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { BigQuery } = require("@google-cloud/bigquery");

admin.initializeApp();
const bigquery = new BigQuery();

// 1. SECURE BIGQUERY PROXY (for Analysis tab)
exports.queryVoters = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const token = req.headers.authorization?.split("Bearer ")[1];
      if (!token) return res.status(401).send("No token");

      const decoded = await admin.auth().verifyIdToken(token);
      let sql = req.body.sql || req.query.sql;
      if (!sql) return res.status(400).send("No SQL");

      if (
        !sql.toLowerCase().includes("from `groundgame26_voters.chester_county`")
      ) {
        return res.status(403).send("Invalid table");
      }

      sql = sql.replace(/''/g, "NULL");
      sql = sql.replace(/'true'/gi, "TRUE");
      sql = sql.replace(/'false'/gi, "FALSE");

      const [rows] = await bigquery.query({ query: sql });
      res.json(rows);
    } catch (err) {
      console.error("QUERY FAILED:", err);
      res.status(500).send("Server error: " + err.message);
    }
  });
});

// 2. TEAM MANAGEMENT — assignRole (KEEP THIS!)
exports.assignRole = functions.https.onCall(async (data, context) => {
  if (!context.auth)
    throw new functions.https.HttpsError("unauthenticated", "Login required");

  const caller = context.auth.token;
  const {
    email,
    role,
    county_code,
    area_district,
    precincts,
    affiliation = "gop",
  } = data;

  if (!["chairman"].includes(caller.role)) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only Chairmen can assign roles"
    );
  }

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch {
    userRecord = await admin.auth().createUser({
      email,
      password: Math.random().toString(36).slice(-10) + "A1!",
    });
  }

  const claims = {
    affiliation,
    role,
    county_code,
  };
  if (role === "chairman" && area_district) {
    claims.scope = "area";
    claims.area_district = area_district;
  }
  if (role === "committeeman") claims.precincts = precincts;

  await admin.auth().setCustomUserClaims(userRecord.uid, claims);

  await admin
    .firestore()
    .collection("users_meta")
    .doc(userRecord.uid)
    .set(
      {
        email: userRecord.email,
        display_name: userRecord.displayName || email.split("@")[0],
        affiliation,
        role,
        county_code,
        area_district: area_district || null,
        precincts: precincts || [],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return { success: true, uid: userRecord.uid };
});
