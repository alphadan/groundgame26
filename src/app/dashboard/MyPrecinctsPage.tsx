// src/app/dashboard/MyPrecinctsPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
  onSnapshotsInSync,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

interface County {
  id: string;
  name: string;
  code: string;
  active: boolean;
  [key: string]: any;
}

export default function MyPrecinctsPage() {
  const { user, claims } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counties, setCounties] = useState<any[]>([]);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [hasConnection, setHasConnection] = useState(false);

  useEffect(() => {
    // Listen to Firestore sync state
    const unsubscribe = onSnapshotsInSync(db, () => {
      console.log("Firestore is in sync — connection ready");
      setHasConnection(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const testSimpleQuery = async () => {
      console.log("=== SIMPLE TEST QUERY STARTED ===");

      try {
        const testRef = collection(db, "test_data");
        const q = query(testRef); // no filter — fetch all
        const snapshot = await getDocs(q);

        console.log("Test query snapshot size:", snapshot.size);

        if (snapshot.empty) {
          console.log("No documents found in 'test_data'");
        } else {
          snapshot.docs.forEach((doc) => {
            console.log("Test document:", doc.id, doc.data());
          });
        }
      } catch (err) {
        console.error("Test query failed:", err);
      }

      console.log("=== SIMPLE TEST QUERY END ===");
    };

    testSimpleQuery();
  }, [user]); // re-run if user changes

  useEffect(() => {
    const testRawQuery = async () => {
      console.log("=== RAW UNFILTERED TEST_DATA QUERY ===");
      try {
        const snapshot = await getDocs(collection(db, "test_data"));
        console.log("RAW test_data size:", snapshot.size);
        if (snapshot.size > 0) {
          snapshot.forEach((doc) => {
            console.log("RAW doc ID:", doc.id, "data:", doc.data());
          });
        } else {
          console.log(
            "No documents returned — collection might be empty or offline"
          );
        }
      } catch (err) {
        console.error("RAW query error:", err);

        // Proper way to handle unknown error in TS
        if (err instanceof Error) {
          console.error("Error code:", (err as any).code); // Firebase errors have .code
          console.error("Error message:", err.message);
        } else {
          console.error("Unknown error type:", err);
        }
      }
    };

    testRawQuery();
  }, []);

  useEffect(() => {
    const testDbConnection = async () => {
      try {
        // Simple query on a collection you know has data
        const testRef = collection(db, "test_data"); // or "users" to test your user doc
        const q = query(testRef); // only fetch 1 document
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log(
            "DB CONNECTION TEST: Connected, but no documents in 'test_data' (or filtered out)"
          );
        } else {
          console.log("DB CONNECTION TEST: SUCCESS! Connected and read data:");
          snapshot.docs.forEach((doc) => {
            console.log("Sample document:", doc.id, doc.data());
          });
        }
      } catch (err: any) {
        console.error("DB CONNECTION TEST FAILED:", err);
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
      }
    };

    testDbConnection();
  }, []);

  const runDiagnostics = async () => {
    console.log("=== FIRESTORE DIAGNOSTICS STARTED ===");

    // 2. Test a known collection (users should have your user doc)
    try {
      const usersRef = collection(db, "users");
      const usersQ = query(usersRef, limit(1));
      const usersSnap = await getDocs(usersQ);
      console.log("Users collection test snapshot size:", usersSnap.size);
    } catch (err) {
      console.error("Users test failed:", err);
    }

    // 3. Direct document read from test_data (use your document ID from screenshot)
    try {
      const knownDocId = "8EBBlwaSwmR3mdxFXMm"; // ← replace with your actual test_data doc ID
      const testDocRef = doc(db, "test_data", knownDocId);
      const testSnap = await getDoc(testDocRef);
      if (testSnap.exists()) {
        console.log("DIRECT READ SUCCESS! Document data:", testSnap.data());
      } else {
        console.log("DIRECT READ: Document not found (wrong ID or collection)");
      }
    } catch (err) {
      console.error("Direct read failed:", err);
    }

    // 4. Your test_data query
    try {
      const testRef = collection(db, "test_data");
      const q = query(testRef); // no filter
      const snapshot = await getDocs(q);
      console.log("test_data query snapshot size:", snapshot.size);
      snapshot.docs.forEach((doc) => {
        console.log("test_data document:", doc.id, doc.data());
      });
    } catch (err) {
      console.error("test_data query failed:", err);
    }

    console.log("=== FIRESTORE DIAGNOSTICS END ===");
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  useEffect(() => {
    if ("indexedDB" in window) {
      indexedDB.deleteDatabase("firebase-local-storage");
      console.log("Offline cache cleared — queries will go to server");
    }
  }, []);

  const fetchCounties = async () => {
    // console.log("fetchCounties STARTED");

    setLoading(true);
    try {
      const countiesRef = collection(db, "counties");
      const q = query(countiesRef, where("active", "==", true));

      const snapshot = await getDocs(q);

      // console.log("Counties snapshot size:", snapshot.size);

      const fetchedCounties: County[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      fetchedCounties.sort((a, b) => a.name.localeCompare(b.name));

      setCounties(fetchedCounties);

      if (fetchedCounties.length > 0) {
        setSelectedCounty(fetchedCounties[0].code);
      }
    } catch (err) {
      console.error("Failed to load counties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !claims) return;

    if (claims.role === "state_admin") {
      fetchCounties();
    } else {
      setLoading(false);
    }
  }, [user, claims]);

  if (!user || !claims) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const role = claims.role || "unknown";
  const isStateAdmin = role === "state_admin";

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#B22234" fontWeight="bold">
        My Precincts Dashboard
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {user.email}
        </Typography>
        <Typography variant="body1">
          <strong>Role:</strong> {role.replace("_", " ").toUpperCase()}
        </Typography>
      </Paper>

      {/* County Selector — Only for state_admin */}

      {/* Placeholder for future content */}
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          {isStateAdmin
            ? selectedCounty
              ? `Ready to load data for county ${selectedCounty}...`
              : "Please select a county to continue."
            : "Area-specific dashboard coming soon."}
        </Alert>
        <Button variant="outlined" sx={{ mt: 2 }}>
          Refresh Counties (test)
        </Button>
        <Button onClick={runDiagnostics} variant="outlined">
          Run Firestore Diagnostics
        </Button>

        <Typography variant="body2" color="text.secondary" mt={2}>
          Next: We'll add area selector, precincts, voter stats, and team
          management.
        </Typography>
      </Paper>
    </Box>
  );
}
