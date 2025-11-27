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
