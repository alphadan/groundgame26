// src/app/admin/ManageTeamPage.tsx — FINAL WITH DEBUG LOGS & FULL LIST
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
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
  TablePagination,
} from "@mui/material";

const PRECINCTS = [
  { "Precinct Name": "Atglen", "Precinct Id": "005", "Rep Area": "15" },
  { "Precinct Name": "East Fallowfield-E", "Precinct Id": "225", "Rep Area": "15" },
  { "Precinct Name": "East Fallowfield-W", "Precinct Id": "230", "Rep Area": "15" },
  { "Precinct Name": "Highland Township", "Precinct Id": "290", "Rep Area": "15" },
  { "Precinct Name": "Parkesburg North", "Precinct Id": "440", "Rep Area": "15" },
  { "Precinct Name": "Parkesburg South", "Precinct Id": "445", "Rep Area": "15" },
  { "Precinct Name": "Sadsbury-North", "Precinct Id": "535", "Rep Area": "15" },
  { "Precinct Name": "Sadsbury-South", "Precinct Id": "540", "Rep Area": "15" },
  { "Precinct Name": "West Sadsbury", "Precinct Id": "545", "Rep Area": "15" },
  { "Precinct Name": "West Fallowfield", "Precinct Id": "235", "Rep Area": "15" },
];

export default function ManageTeamPage() {
  const [committeemen, setCommitteemen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const currentUser = auth.currentUser;
  const claims = (window as any).userClaims || {};

  console.log("ManageTeamPage: currentUser UID:", currentUser?.uid);
  console.log("ManageTeamPage: claims:", claims);
  console.log("ManageTeamPage: areaDistrict:", claims.area_district);

  /*
  if (!currentUser) return <Typography>Please log in</Typography>;
  if (claims.role !== "chairman" || claims.scope !== "area") {
    return (
      <Box p={4}>
        <Alert severity="error">Only Area Chairmen can manage committeemen.</Alert>
      </Box>
    );
  }
*/
  let areaDistrict = claims.area_district;
  areaDistrict = "15";

  useEffect(() => {
    const loadCommitteemen = async () => {
      console.log("LOADING COMMITTEEMEN — START");
      try {
        const q = query(
          collection(db, "users_meta"),
          where("role", "==", "committeeman"),
          where("area_district", "==", areaDistrict)
        );
        console.log("QUERY SENT:", q);

        const snapshot = await getDocs(q);
        console.log("QUERY RESULT — SIZE:", snapshot.size);
        snapshot.forEach(doc => {
          console.log("Document:", doc.id, "→", doc.data());
        });

        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("FINAL LIST LENGTH:", list.length);
        setCommitteemen(list);
      } catch (err: any) {
        console.error("LOAD FAILED:", err);
        setError("Failed: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCommitteemen();
  }, [areaDistrict]);

  const handleSave = async (uid: string, selectEl: HTMLSelectElement | null) => {
    if (!selectEl) return;
    const newPrecincts = Array.from(selectEl.selectedOptions).map(opt => opt.value);
    console.log("SAVING for UID:", uid, "precincts:", newPrecincts);

    try {
      await updateDoc(doc(db, "users_meta", uid), { precincts: newPrecincts });
      setMessage("Saved!");
      setCommitteemen(prev => prev.map(m => (m.id === uid ? { ...m, precincts: newPrecincts } : m)));
    } catch (err: any) {
      setError("Save failed");
    }
  };

  // PAGINATION — FIXED
  const handleChangePage = (event: unknown, newPage: number) => {
    console.log("Page changed to:", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = parseInt(event.target.value, 10);
    console.log("Rows per page changed to:", newRows);
    setRowsPerPage(newRows);
    setPage(0);
  };

  const paginated = committeemen.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  console.log("PAGINATED LIST LENGTH:", paginated.length, "Total:", committeemen.length);

  return (
    <Box maxWidth={1200} mx="auto" p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
        Manage Committeemen — Area {areaDistrict} ({committeemen.length} total)
      </Typography>

      {loading && <Alert severity="info">Loading committeemen...</Alert>}
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
              {paginated.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No committeemen found.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.display_name || "—"}</TableCell>
                  <TableCell>{member.email || "—"}</TableCell>
                  <TableCell>
                    {member.precincts?.map((p: string) => {
                      const precinct = PRECINCTS.find(x => x["Precinct Id"] === p);
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
                      sx={{ minWidth: 250 }}
                    >
                      {PRECINCTS.filter(p => p["Rep Area"] === areaDistrict).map((p) => (
                        <MenuItem key={p["Precinct Id"]} value={p["Precinct Id"]}>
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
                        const select = (e.currentTarget.parentElement?.previousElementSibling?.querySelector("select")) as HTMLSelectElement;
                        handleSave(member.id, select);
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

        <TablePagination
          component="div"
          count={committeemen.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}