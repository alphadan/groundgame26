// src/app/maps/MapsPage.tsx — Interactive Precinct Map Only
import { Box, Typography, Paper, Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const GEOJSON_URL =
  "https://gis.chesco.org/server/rest/services/ChesterCountyPublicView/MapServer/29/query?where=1%3D1&outFields=*&outSR=4326&f=geojson";

export default function MapsPage() {
  const [userMeta, setUserMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Fix Leaflet icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Load GeoJSON
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((res) =>
        setGeoJsonData({
          type: "FeatureCollection",
          features: res.features || [],
        })
      )
      .catch(() => setGeoJsonData({ type: "FeatureCollection", features: [] }));
  }, []);

  // Auth
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "users_meta", user.uid)).then((snap) => {
      if (snap.exists()) setUserMeta(snap.data());
      setLoading(false);
    });
  }, []);

  if (!auth.currentUser) return <Alert severity="warning">Please log in</Alert>;
  if (loading) return <CircularProgress />;
  if (!userMeta || userMeta.role !== "chairman" || userMeta.scope !== "area")
    return <Alert severity="error">Only Area Chairmen can view maps.</Alert>;

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
        Chester County — Interactive Precinct Map
      </Typography>

      <Paper sx={{ p: 4, height: "85vh", overflow: "hidden", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          2024 Voting Precincts — Click for Details
        </Typography>
        <Box sx={{ height: "calc(100% - 50px)" }}>
          {geoJsonData && geoJsonData.features.length > 0 ? (
            <MapContainer
              center={[40.0025, -75.7069]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
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
              <Typography ml={2}>
                Loading official precinct boundaries...
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
