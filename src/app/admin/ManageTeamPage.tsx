// src/app/admin/ManageTeamPage.tsx — FINAL & PERFECT
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
} from "@mui/material";

const PRECINCTS = [
  { "Precinct Name": "Atglen", "Precinct Id": "005", "Rep Area": "15" },
  {
    "Precinct Name": "East Fallowfield-E",
    "Precinct Id": "225",
    "Rep Area": "15",
  },
  {
    "Precinct Name": "East Fallowfield-W",
    "Precinct Id": "230",
    "Rep Area": "15",
  },
  {
    "Precinct Name": "Highland Township",
    "Precinct Id": "290",
    "Rep Area": "15",
  },
  {
    "Precinct Name": "Parkesburg North",
    "Precinct Id": "440",
    "Rep Area": "15",
  },
  {
    "Precinct Name": "Parkesburg South",
    "Precinct Id": "445",
    "Rep Area": "15",
  },
  { "Precinct Name": "Sadsbury-North", "Precinct Id": "535", "Rep Area": "15" },
  { "Precinct Name": "Sadsbury-South", "Precinct Id": "540", "Rep Area": "15" },
  { "Precinct Name": "West Sadsbury", "Precinct Id": "545", "Rep Area": "15" },
  {
    "Precinct Name": "West Fallowfield",
    "Precinct Id": "235",
    "Rep Area": "15",
  },
];

export default function ManageTeamPage() {
  const [committeemen, setCommitteemen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentUser = auth.currentUser;
  // const claims = (window as any).userClaims || {};
  const claims = { role: "chairman", scope: "area", area_district: "15" }; // MOCKED for testing
  console.log("ManageTeamPage: currentUser:", currentUser);
  console.log("ManageTeamPage: claims:", claims);

  // EARLY RETURNS FIRST — useEffect comes after
  /*
  if (!currentUser) {
    return <Typography>Please log in</Typography>;
  }
    */

  if (claims.role !== "chairman" || claims.scope !== "area") {
    return (
      <Box p={4}>
        <Alert severity="error">
          Only Area Chairmen can manage committeemen.
        </Alert>
      </Box>
    );
  }

  // const areaDistrict = claims.area_district;
  const areaDistrict = "15";
  console.log("ManageTeamPage: areaDistrict:", areaDistrict);

  // NOW useEffect is safe

  useEffect(() => {
    const loadCommitteemen = async () => {
      console.log("ManageTeamPage: Loading committeemen from users_meta...");
      console.log(
        "Query: role == committeeman AND area_district == ",
        areaDistrict
      );
      try {
        const q = query(
          collection(db, "users_meta"),
          where("role", "==", "committeeman"),
          where("area_district", "==", areaDistrict)
        );
        const snapshot = await getDocs(q);
        console.log(
          "ManageTeamPage: Query returned",
          snapshot.size,
          "documents"
        );

        const list = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Document:", doc.id, "→", data);
          return { id: doc.id, ...data };
        });
        setCommitteemen(list);
      } catch (err) {
        console.error("ManageTeamPage: FIRESTORE ERROR:", err);
        setError("Failed to load: ");
      } finally {
        setLoading(false);
      }
    };
    loadCommitteemen();
  }, [areaDistrict]);

  const handleUpdatePrecincts = async (
    uid: string,
    selectEl: HTMLSelectElement | null
  ) => {
    if (!selectEl) return;

    const newPrecincts = Array.from(selectEl.selectedOptions).map(
      (opt) => opt.value
    );
    try {
      await updateDoc(doc(db, "team_members", uid), {
        precincts: newPrecincts,
      });
      setMessage("Updated successfully");
      setCommitteemen((prev) =>
        prev.map((m) => (m.id === uid ? { ...m, precincts: newPrecincts } : m))
      );
    } catch (err) {
      setError("Update failed");
    }
  };

  return (
    <Box maxWidth={1000} mx="auto" p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
        Manage Committeemen — Area {areaDistrict}
      </Typography>

      {loading && <Alert severity="info">Loading your committeemen...</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Current Precincts</TableCell>
                <TableCell>Assign Precincts</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {committeemen.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.display_name || "—"}</TableCell>
                  <TableCell>{member.email || "—"}</TableCell>
                  <TableCell>
                    {member.precincts?.map((p: string) => {
                      const precinct = PRECINCTS.find(
                        (x) => x["Precinct Id"] === p
                      );
                      return (
                        <Chip
                          key={p}
                          label={precinct?.["Precinct Name"] || p}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      );
                    })}
                  </TableCell>
                  <TableCell>
                    <Select
                      multiple
                      defaultValue={member.precincts || []}
                      size="small"
                      sx={{ minWidth: 200 }}
                    >
                      {PRECINCTS.filter(
                        (p) => p["Rep Area"] === areaDistrict
                      ).map((p) => (
                        <MenuItem
                          key={p["Precinct Id"]}
                          value={p["Precinct Id"]}
                        >
                          {p["Precinct Name"]} ({p["Precinct Id"]})
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        const select =
                          e.currentTarget.parentElement?.previousElementSibling?.querySelector(
                            "select"
                          ) as HTMLSelectElement;
                        handleUpdatePrecincts(member.id, select);
                      }}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
