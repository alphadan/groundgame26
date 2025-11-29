const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { BigQuery } = require("@google-cloud/bigquery");
admin.initializeApp();

const bigquery = new BigQuery();

exports.queryVoters = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const idToken = req.headers.authorization?.split("Bearer ")[1];
      if (!idToken) return res.status(401).send("No token");

      const decoded = await admin.auth().verifyIdToken(idToken);
      const uid = decoded.uid;

      // TODO: Add custom claims for precinct access here later
      const allowedPrecincts = ["*"]; // temporary full access

      let sql = req.body.sql || req.query.sql;
      if (!sql) return res.status(400).send("No SQL");

      // Security: restrict to our table + precinct filter
      if (!sql.includes("FROM `groundgame26_voters.chester_county`")) {
        return res.status(403).send("Invalid table");
      }

      console.log("Executing for user:", decoded.email);
      const [rows] = await bigquery.query({ query: sql });
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });
});

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

  // Permission check
  if (!["county_chair", "area_rep"].includes(caller.role)) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch {
    // Create user if doesn't exist
    userRecord = await admin.auth().createUser({
      email,
      password: Math.random().toString(36).slice(-10) + "A1!",
    });
  }

  const claims: any = {
    affiliation,
    role,
    county_code,
  };
  if (role === "area_rep") claims.area_districts = [area_district];
  if (role === "committeeman") claims.precincts = precincts;

  await admin.auth().setCustomUserClaims(userRecord.uid, claims);

  // Create users_meta
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
