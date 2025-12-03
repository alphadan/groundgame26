// src/app/reports/ReportsPage.tsx
import { useVoters } from "../../hooks/useVoters";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correct Firebase path
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const PARTY_AGE_SQL = `
SELECT 
  age_group,
  COUNTIF(party = 'R') AS R,
  COUNTIF(party = 'D') AS D,
  COUNTIF(party NOT IN ('R','D') AND party IS NOT NULL) AS Other
FROM \`groundgame26_voters.chester_county\`
GROUP BY age_group
ORDER BY 
  CASE age_group WHEN '18-25' THEN 1 WHEN '26-40' THEN 2 WHEN '41-70' THEN 3 ELSE 4 END
`;

// NEW: Weak Republicans 
const WEAK_REPUBLICANS_SQL = `
SELECT 
  age_group,
  precinct,
  COUNT(*) AS voters
FROM \`groundgame26_voters.chester_county\`
WHERE party = 'R'
  AND voter_strength <= 2
  AND (mail_ballot IS NULL OR mail_ballot = FALSE)
  AND age_group IS NOT NULL
  AND precinct IS NOT NULL
GROUP BY age_group, precinct
ORDER BY voters DESC
`;

// Official Chester County Precincts GeoJSON (2024) - from chesco.org GIS
const GEOJSON_URL =
  "https://gis.chesco.org/server/rest/services/ChesterCountyPublicView/MapServer/29/query?where=1%3D1&outFields=*&outSR=4326&f=geojson";

export default function ReportsPage() {
  console.log("ReportsPage component rendered");

  // ─── States ───
  const [userMeta, setUserMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  const { data: chartData = [], isLoading: chartLoading } =
    useVoters(PARTY_AGE_SQL);

    

  // ─── Fix Leaflet icons — NOW INSIDE COMPONENT! ───
  useEffect(() => {
    console.log("Fixing Leaflet default icons...");
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    console.log("Leaflet icons fixed");
  }, []); // ← This is now allowed!

  // ─── Load GeoJSON ───
  useEffect(() => {
    console.log("Fetching official Chester County precinct GeoJSON...");
    fetch(GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then((response) => {
        // Official ArcGIS query response wraps features in an array
        const data = {
          type: "FeatureCollection",
          features: response.features || [],
        };
        console.log("Precinct map loaded! Features:", data.features.length);
        setGeoJsonData(data);
      })
      .catch((err) => {
        console.error("Failed to load official GeoJSON:", err);
        // Set a fallback empty data so spinner stops (you can replace with a static map image if needed)
        setGeoJsonData({ type: "FeatureCollection", features: [] });
      });
  }, []);

  // ─── Auth: Load user_meta ───
  useEffect(() => {
    const currentUser = auth.currentUser;
    console.log("Current auth user:", currentUser?.uid || "none");

    if (!currentUser) {
      console.log("No user logged in → stopping auth check");
      setLoading(false);
      return;
    }

    const loadUserMeta = async () => {
      try {
        console.log("Fetching user_meta for UID:", currentUser.uid);
        const docSnap = await getDoc(doc(db, "users_meta", currentUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("user_meta loaded:", data);
          setUserMeta(data);
        } else {
          console.warn("No user_meta document found");
          setError("User profile not found");
        }
      } catch (err: any) {
        console.error("Error loading user_meta:", err);
        setError("Failed to load profile: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserMeta();
  }, []);

  // ─── Early Returns (Auth Guards) ───
  if (!auth.currentUser) {
    console.log("Blocked: No authenticated user");
    return (
      <Box p={4}>
        <Alert severity="warning">Please log in to view reports.</Alert>
      </Box>
    );
  }

  if (loading) {
    console.log("Showing loading state...");
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress />
        <Typography ml={2}>Loading your profile...</Typography>
      </Box>
    );
  }

  if (error) {
    console.log("Showing error:", error);
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!userMeta || userMeta.role !== "chairman" || userMeta.scope !== "area") {
    console.log("Access denied. userMeta:", userMeta);
    return (
      <Box p={4}>
        <Alert severity="error">
          Only Area Chairmen can access this report.
        </Alert>
      </Box>
    );
  }

  console.log("Access granted! Rendering full report for Area Chairman");

  // ─── Authorized Content ───
  const exportCSV = () => {
    if (!chartData.length) return;
    const csv = [
      "Age Group,Republican,Democrat,Other",
      ...chartData.map((r: any) =>
        [r.age_group || "Unknown", r.R || 0, r.D || 0, r.Other || 0].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "Chester_County_Party_by_Age.csv");
    console.log("CSV exported");
  };

  const precinctStyle = () => ({ color: "#333", weight: 2, fillOpacity: 0.2 });
  const onEachFeature = (feature: any, layer: any) => {
    const p = feature.properties;
    layer.bindPopup(
      `<strong>${p.PRECINCT || "Unknown Precinct"}</strong><br/>
       ${p.MUNICIPALITY || ""}${p.WARD ? ` Ward ${p.WARD}` : ""}`
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#d32f2f">
        Chester County — LIVE Voter Intelligence
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Party by Age Group</Typography>
          <Button
            variant="contained"
            onClick={exportCSV}
            disabled={chartLoading}
          >
            Export CSV
          </Button>
        </Box>

        {chartLoading ? (
          <Box textAlign="center" py={8}>
            <CircularProgress />
            <Typography>Loading voter data...</Typography>
          </Box>
        ) : (
          <BarChart
            dataset={chartData}
            xAxis={[{ scaleType: "band", dataKey: "age_group" }]}
            series={[
              { dataKey: "R", label: "Republican", color: "#d32f2f" },
              { dataKey: "D", label: "Democrat", color: "#1976d2" },
              { dataKey: "Other", label: "Other", color: "#666" },
            ]}
            height={420}
          />
        )}
      </Paper>

      <Paper sx={{ p: 4, height: 720, overflow: "hidden", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Interactive Precinct Map (2024)
        </Typography>
        <Box sx={{ height: 660 }}>
          {geoJsonData ? (
            <MapContainer
              center={[40.0025, -75.7069]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON
                data={geoJsonData}
                style={precinctStyle}
                onEachFeature={onEachFeature}
              />
            </MapContainer>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              bgcolor="#fafafa"
            >
              <CircularProgress />
              <Typography ml={2}>Loading map...</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
