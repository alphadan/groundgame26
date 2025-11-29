// src/app/admin/ManageTeamPage.tsx — FINAL WORKING VERSION
import { useState } from "react";
import { auth } from "../../lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
} from "@mui/material";
import { Add } from "@mui/icons-material";

const functions = getFunctions();
const assignRole = httpsCallable(functions, "assignRole");

// Your precincts data — move to this file temporarily (we'll fix path later)
const PRECINCTS = [
  {
    "Precinct Name": "Atglen",
    "Precinct Id": "005",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [{ name: "VACANT", email: "VACANT" }],
  },
  {
    "Precinct Name": "East Fallowfield-E",
    "Precinct Id": "225",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Carol Kulp", email: "" },
      { name: "Robert Kulp", email: "" },
    ],
  },
  {
    "Precinct Name": "East Fallowfield-W",
    "Precinct Id": "230",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Robert Knecht", email: "" },
      { name: "Nina Petro", email: "" },
    ],
  },
  {
    "Precinct Name": "Highland Township",
    "Precinct Id": "290",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Dana Young", email: "" },
      { name: "Joshua Wall", email: "" },
    ],
  },
  {
    "Precinct Name": "Parkesburg North",
    "Precinct Id": "440",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Sharon Wolf", email: "" },
      { name: "VACANT", email: "" },
    ],
  },
  {
    "Precinct Name": "Parkesburg South",
    "Precinct Id": "445",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "VACANT", email: "" },
      { name: "Nick Ohar", email: "" },
    ],
  },
  {
    "Precinct Name": "Sadsbury-North",
    "Precinct Id": "535",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Brendan Murphy", email: "" },
      { name: "Tricia Daller", email: "" },
    ],
  },
  {
    "Precinct Name": "Sadsbury-South",
    "Precinct Id": "540",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Richard Felice", email: "" },
      { name: "Joseph Felice", email: "" },
    ],
  },
  {
    "Precinct Name": "West Sadsbury",
    "Precinct Id": "545",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Art Wright", email: "" },
      { name: "Herb Myers", email: "" },
    ],
  },
  {
    "Precinct Name": "West Fallowfield",
    "Precinct Id": "235",
    County: "15",
    "Rep Area": "15",
    "Committee Persons": [
      { name: "Joseph Piazza", email: "" },
      { name: "Herb Phillips", email: "" },
    ],
  },
];


export default function ManageTeamPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("committeeman");
  const [areaDistrict, setAreaDistrict] = useState("");
  const [selectedPrecincts, setSelectedPrecincts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentUser = auth.currentUser;
  const claims = (window as any).userClaims || {};

  if (!currentUser) {
    return <Typography>Please log in</Typography>;
  }

  if (!["county_chair", "area_rep"].includes(claims.role || "")) {
    return (
      <Box p={4}>
        <Alert severity="error">
          You do not have permission to manage team members.
        </Alert>
      </Box>
    );
  }

  const handleAssign = async () => {
    setError("");
    setMessage("");

    try {
      await assignRole({
        email: email.trim().toLowerCase(),
        role,
        county_code: claims.county_code || "15",
        area_district: role === "area_rep" ? areaDistrict : null,
        precincts: role === "committeeman" ? selectedPrecincts : [],
        affiliation: claims.affiliation || "gop",
      });

      setMessage(`Successfully assigned ${role} to ${email}!`);
      setEmail("");
      setSelectedPrecincts([]);
    } catch (err: any) {
      setError(err.message || "Failed to assign role");
    }
  };

  const myPrecincts = PRECINCTS.filter((p: any) =>
    claims.role === "area_rep" ? p["Rep Area"] === claims.area_district : true
  );

  return (
    <Box maxWidth={900} mx="auto" p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
        Manage Team — Chester County
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" mb={3}>
          Assign New Team Member
        </Typography>

        <TextField
          label="Email Address"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {claims.role === "county_chair" && (
              <MenuItem value="area_rep">Area Representative</MenuItem>
            )}
            <MenuItem value="committeeman">Committeeman</MenuItem>
          </Select>
        </FormControl>

        {role === "area_rep" && (
          <TextField
            label="Area District"
            fullWidth
            value={areaDistrict}
            onChange={(e) => setAreaDistrict(e.target.value)}
            margin="normal"
          />
        )}

        {role === "committeeman" && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Precincts</InputLabel>
            <Select
              multiple
              value={selectedPrecincts}
              onChange={(e) => setSelectedPrecincts(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const precinct = PRECINCTS.find(
                      (p: any) => p["Precinct Id"] === value
                    );
                    return (
                      <Chip
                        key={value}
                        label={precinct?.["Precinct Name"] || value}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {myPrecincts.map((p: any) => (
                <MenuItem key={p["Precinct Id"]} value={p["Precinct Id"]}>
                  {p["Precinct Name"]} ({p["Precinct Id"]})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, bgcolor: "#d32f2f" }}
          onClick={handleAssign}
        >
          Assign Role
        </Button>
      </Paper>
    </Box>
  );
}
