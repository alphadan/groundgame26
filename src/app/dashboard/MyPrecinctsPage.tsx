// src/app/dashboard/MyPrecinctsPage.tsx — FINAL & PERFECT
import { useVoters } from "../../hooks/useVoters";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { auth, db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const MY_STATS_SQL = `
SELECT
  COUNT(*) AS total_voters,
  COUNTIF(party = 'R') AS republicans,
  COUNTIF(party = 'D') AS democrats,
  COUNTIF(party NOT IN ('R','D') AND party IS NOT NULL) AS other_independent,
  COUNTIF(has_mail_ballot = true) AS mail_ballots_requested,
  COUNTIF(mail_ballot_returned = true) AS mail_ballots_returned,
  COUNTIF(voted_2024_general = true) AS voted_2024_general,
  COUNTIF(voted_2024_primary = true) AS voted_2024_primary,
  COUNTIF(likely_mover = true) AS likely_movers,
  COUNTIF(turnout_score_general >= 80) AS high_propensity
FROM \`groundgame26_voters.chester_county\`
`;

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

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function MyPrecinctsPage() {
  const [userMeta, setUserMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState(false);

  // Live Intelligence — NOW WITH isLoading & error
  const {
    data = [],
    isLoading: statsLoading,
    error: statsError,
  } = useVoters(MY_STATS_SQL);
  const stats = data[0] || {};

  // Team Management
  const [committeemen, setCommitteemen] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "users_meta", user.uid)).then((snap) => {
      if (snap.exists()) {
        setUserMeta(snap.data());
        if (snap.data().role === "chairman" && snap.data().scope === "area") {
          const q = query(
            collection(db, "users_meta"),
            where("role", "==", "committeeman"),
            where("area_district", "==", snap.data().area_district)
          );
          getDocs(q).then((snapshot) => {
            setCommitteemen(
              snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            );
          });
        }
      }
      setLoading(false);
    });
  }, []);

  if (!auth.currentUser) return <Alert severity="warning">Please log in</Alert>;
  if (loading) return <CircularProgress />;
  if (!userMeta) return <Alert severity="error">User profile not found</Alert>;

  const areaDistrict = userMeta.area_district;

  const exportMyVoters = () => {
    const csv = [
      ["Metric", "Count"],
      ["Total Voters", stats.total_voters || 0],
      ["Republicans", stats.republicans || 0],
      ["Democrats", stats.democrats || 0],
      ["Other/Independent", stats.other_independent || 0],
      ["Mail Ballots Requested", stats.mail_ballots_requested || 0],
      ["Mail Ballots Returned", stats.mail_ballots_returned || 0],
      ["Voted 2024 General", stats.voted_2024_general || 0],
      ["High Propensity (80+)", stats.high_propensity || 0],
      ["Likely Movers", stats.likely_movers || 0],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(
      blob,
      `My_Precincts_Summary_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const startEdit = (member: any) => {
    setEditingId(member.id);
    setEditForm({
      display_name: member.display_name || "",
      email: member.email || "",
      precincts: member.precincts || [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (uid: string) => {
    try {
      await updateDoc(doc(db, "users_meta", uid), {
        display_name: editForm.display_name,
        email: editForm.email,
        precincts: editForm.precincts,
      });
      setCommitteemen((prev) =>
        prev.map((m) =>
          m.id === uid
            ? {
                ...m,
                display_name: editForm.display_name,
                email: editForm.email,
                precincts: editForm.precincts,
              }
            : m
        )
      );
      cancelEdit();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
        My Precincts & Team — Area {areaDistrict}
      </Typography>

      {/* Live Intelligence */}
      {statsLoading && (
        <Alert severity="info">
          Loading your precinct data from BigQuery...
        </Alert>
      )}
      {statsError && (
        <Alert severity="error">Error: {(statsError as Error).message}</Alert>
      )}

      {!statsLoading && !statsError && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#d32f2f",
                  color: "white",
                }}
              >
                <Typography variant="h6">Total Voters</Typography>
                <Typography variant="h4">{stats.total_voters || 0}</Typography>
              </Paper>
            </Grid>

            <Grid>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#b71c1c",
                  color: "white",
                }}
              >
                <Typography variant="h6">Republicans</Typography>
                <Typography variant="h4">{stats.republicans || 0}</Typography>
              </Paper>
            </Grid>

            <Grid>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#1976d2",
                  color: "white",
                }}
              >
                <Typography variant="h6">Mail Ballots Requested</Typography>
                <Typography variant="h4">
                  {stats.mail_ballots_requested || 0}
                </Typography>
                <Chip
                  label={`${stats.mail_ballots_returned || 0} returned`}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>

            <Grid>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#388e3c",
                  color: "white",
                }}
              >
                <Typography variant="h6">High Propensity</Typography>
                <Typography variant="h4">
                  {stats.high_propensity || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 4, mb: 6 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Turnout History</Typography>
              <Button variant="outlined" onClick={exportMyVoters}>
                Export Summary CSV
              </Button>
            </Box>
            <BarChart
              dataset={[
                {
                  year: "2024 General",
                  turnout: stats.voted_2024_general || 0,
                },
                {
                  year: "2024 Primary",
                  turnout: stats.voted_2024_primary || 0,
                },
              ]}
              xAxis={[{ scaleType: "band", dataKey: "year" }]}
              series={[
                { dataKey: "turnout", label: "Voters", color: "#d32f2f" },
              ]}
              height={300}
            />
          </Paper>
        </>
      )}

      {/* Collapsible Team Management */}
      {userMeta.role === "chairman" && userMeta.scope === "area" && (
        <Card sx={{ mb: 6 }}>
          <CardActions
            disableSpacing
            sx={{ bgcolor: "#d32f2f", color: "white" }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Manage Committeemen ({committeemen.length} total)
              </Typography>
            </Box>
            <ExpandMore
              expand={expandedTeam}
              onClick={() => setExpandedTeam(!expandedTeam)}
            >
              <ExpandMoreIcon sx={{ color: "white" }} />
            </ExpandMore>
          </CardActions>

          <Collapse in={expandedTeam} timeout="auto" unmountOnExit>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Precincts</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {committeemen
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            {editingId === member.id ? (
                              <TextField
                                value={editForm.display_name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    display_name: e.target.value,
                                  })
                                }
                                size="small"
                                fullWidth
                              />
                            ) : (
                              member.display_name || "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === member.id ? (
                              <TextField
                                value={editForm.email}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    email: e.target.value,
                                  })
                                }
                                size="small"
                                fullWidth
                              />
                            ) : (
                              member.email || "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === member.id ? (
                              <FormControl fullWidth size="small">
                                <InputLabel>Precincts</InputLabel>
                                <Select
                                  multiple
                                  value={editForm.precincts}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      precincts: e.target.value as string[],
                                    })
                                  }
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
                              </FormControl>
                            ) : (
                              member.precincts?.map((p: string) => {
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
                              }) || "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === member.id ? (
                              <>
                                <IconButton
                                  color="primary"
                                  onClick={() => saveEdit(member.id)}
                                >
                                  <Save />
                                </IconButton>
                                <IconButton
                                  color="inherit"
                                  onClick={cancelEdit}
                                >
                                  <Cancel />
                                </IconButton>
                              </>
                            ) : (
                              <IconButton
                                color="primary"
                                onClick={() => startEdit(member)}
                              >
                                <Edit />
                              </IconButton>
                            )}
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
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </CardContent>
          </Collapse>
        </Card>
      )}
    </Box>
  );
}
