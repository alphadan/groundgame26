// functions/index.js — FINAL, DEPLOY-READY (Dec 2025)
const functions = require("firebase-functions");
const functionsV1 = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { BigQuery } = require("@google-cloud/bigquery");

admin.initializeApp();
const db = admin.firestore();
const bigquery = new BigQuery();

// ================================================================
// 1. BIGQUERY PROXY — GEN 2 (perfect)
// ================================================================
exports.queryVoters = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split("Bearer ")[1];
      if (!token) return res.status(401).send("No token");

      await admin.auth().verifyIdToken(token);

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
  }
);

// ================================================================
// 2. AUTO-CREATE users/{uid} — GEN 1 (still works in v7)
// ================================================================

exports.createUserProfile = functionsV1.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email?.toLowerCase() || "";
  const displayName = user.displayName || email.split("@")[0];

  try {
    await db.doc(`users/${uid}`).set({
      uid,
      display_name: displayName,
      email,
      phone: user.phoneNumber || "",
      photo_url: user.photoURL || "",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login: admin.firestore.FieldValue.serverTimestamp(),
      last_ip: "auth-trigger",
      login_count: 1,
    });

    await db.collection("login_attempts").add({
      uid,
      email,
      success: true,
      ip: "auth-trigger",
      user_agent: "firebase-auth",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("createUserProfile failed:", err);
  }
});

// ================================================================
// 3. SYNC org_roles → Custom Claims — GEN 1 (perfect)
// ================================================================

exports.syncOrgRolesToClaims = functionsV1.firestore
  .document("org_roles/{docId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;

    if (!after || after.is_vacant || !after.uid) {
      if (before?.uid) {
        await admin.auth().setCustomUserClaims(before.uid, null);
      }
      return;
    }

    const uid = after.uid;

    const snap = await db
      .collection("org_roles")
      .where("uid", "==", uid)
      .where("is_vacant", "==", false)
      .get();

    if (snap.empty) {
      await admin.auth().setCustomUserClaims(uid, null);
      return;
    }

    const precincts = [];
    const counties = new Set();
    const areas = new Set();
    const roles = new Set();

    snap.forEach((doc) => {
      const d = doc.data();
      roles.add(d.role);
      if (d.county_code) counties.add(d.county_code);
      if (d.area_district) areas.add(d.area_district);
      if (d.precinct_code) precincts.push(d.precinct_code);
    });

    const claims = {
      role: [...roles][0] || "user",
      roles: [...roles],
      counties: [...counties],
      areas: [...areas],
      precincts,
      scope: [
        ...[...counties].map((c) => `county:${c}`),
        ...[...areas].map((a) => `area:${a}`),
        ...precincts.map((p) => `precinct:${p}`),
      ],
    };

    await admin.auth().setCustomUserClaims(uid, claims);

    await db.doc(`users/${uid}`).set(
      {
        primary_county: claims.counties[0] || null,
        primary_precinct: precincts[0] || null,
        role_summary: claims.role,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
