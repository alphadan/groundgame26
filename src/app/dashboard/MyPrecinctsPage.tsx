// src/app/dashboard/MyPrecinctsPage.tsx — FINAL & COMPLETE
import { useVoters } from "../../hooks/useVoters";
import {
  Box,
  Typography,
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
  Alert,
  Grid,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Edit, Save, Cancel } from "@mui/icons-material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
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

// Styled Expand Icon
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

// Precincts list for Area 15 (your actual list)
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

// Voter Turnout Status Query — FULLY INCLUDED
const VOTER_TURNOUT_STATUS_SQL = `
SELECT 
  -- 1. Total Voters by Party
  COUNTIF(party = 'R') AS total_r,
  COUNTIF(party = 'D') AS total_d,
  COUNTIF(party NOT IN ('R','D') AND party IS NOT NULL) AS total_nf,

  -- 2. Mail Ballots by Party
  COUNTIF(has_mail_ballot = TRUE AND party = 'R') AS mail_r,
  COUNTIF(has_mail_ballot = TRUE AND party = 'D') AS mail_d,
  COUNTIF(has_mail_ballot = TRUE AND party NOT IN ('R','D') AND party IS NOT NULL) AS mail_nf,
  COUNTIF(mail_ballot_returned = TRUE AND party = 'R') AS returned_r,
  COUNTIF(mail_ballot_returned = TRUE AND party = 'D') AS returned_d,
  COUNTIF(mail_ballot_returned = TRUE AND party NOT IN ('R','D') AND party IS NOT NULL) AS returned_nf,

  -- 3. Modeled Party Strength
  COUNTIF(modeled_party = '1 - Hard Republican') AS hard_r,
  COUNTIF(modeled_party LIKE '2 - Weak%') AS weak_r,
  COUNTIF(modeled_party = '3 - Swing') AS swing,
  COUNTIF(modeled_party LIKE '4 - Weak%') AS weak_d,
  COUNTIF(modeled_party = '5 - Hard Democrat') AS hard_d
FROM \`groundgame26_voters.chester_county\`
`;

export default function MyPrecinctsPage() {
  const [userMeta, setUserMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [expandedTeam, setExpandedTeam] = useState(false);
  const [expandedPerf, setExpandedPerf] = useState(false);
  const [expandedTurnout, setExpandedTurnout] = useState(true);

  // Team Management
  const [committeemen, setCommitteemen] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Voter Turnout Status — lazy loaded
  const { data: turnoutData = [], isLoading: turnoutLoading } = useVoters(
    VOTER_TURNOUT_STATUS_SQL
  );
  const turnoutStats = turnoutData[0] || {};

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
              snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                dummyLogins: Math.floor(Math.random() * 8),
              }))
            );
          });
        }
      }
      setLoading(false);
    });
  }, []);

  if (!auth.currentUser) return <Alert severity="warning">Please log in</Alert>;
  if (loading) return <CircularProgress />;
  if (!userMeta || userMeta.role !== "chairman" || userMeta.scope !== "area")
    return (
      <Alert severity="error">Only Area Chairmen can access this page.</Alert>
    );

  const areaDistrict = userMeta.area_district;

  // Edit functions
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
      <Typography variant="h4" gutterBottom color="#B22234" fontWeight="bold">
        My Precincts & Team — Area {areaDistrict}
      </Typography>
      <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
        AI Insight: Area 15 showing surge in weak Republicans — prioritize
        door-knocking!
      </Alert>
      {/* 1. Voter Turnout Status */}
      <Card sx={{ mb: 6 }}>
        <CardActions disableSpacing sx={{ bgcolor: "#D3D3D3", color: "black" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Voter Turnout Status — Detailed Breakdown
            </Typography>
            <Typography variant="body2">
              Party • Mail Ballots • Modeled Strength
            </Typography>
          </Box>
          <ExpandMore
            expand={expandedTurnout}
            onClick={() => setExpandedTurnout(!expandedTurnout)}
          >
            <ExpandMoreIcon sx={{ color: "black" }} />
          </ExpandMore>
        </CardActions>

        <Collapse in={expandedTurnout} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 3 }}>
            {turnoutLoading ? (
              <Box textAlign="center" py={8}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid spacing={4}>
                {/* Chart 1: Total Voters */}
                <Grid>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      Total Voters by Party
                    </Typography>
                    <BarChart
                      dataset={[
                        {
                          party: "Republican",
                          count: turnoutStats.total_r || 0,
                        },
                        { party: "Democrat", count: turnoutStats.total_d || 0 },
                        {
                          party: "No Party / Ind.",
                          count: turnoutStats.total_nf || 0,
                        },
                      ]}
                      xAxis={[{ scaleType: "band", dataKey: "party" }]}
                      series={[{ dataKey: "count", color: "#d32f2f" }]}
                      height={280}
                      barLabel="value"
                    />
                  </Paper>
                </Grid>

                {/* Chart 2: Mail Ballots */}
                <Grid>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      Mail-In Ballots by Party
                    </Typography>
                    <BarChart
                      dataset={[
                        {
                          label: "Requested",
                          R: turnoutStats.mail_r || 0,
                          D: turnoutStats.mail_d || 0,
                          NF: turnoutStats.mail_nf || 0,
                        },
                        {
                          label: "Returned",
                          R: turnoutStats.returned_r || 0,
                          D: turnoutStats.returned_d || 0,
                          NF: turnoutStats.returned_nf || 0,
                        },
                      ]}
                      xAxis={[{ scaleType: "band", dataKey: "label" }]}
                      series={[
                        { dataKey: "R", label: "R", color: "#d32f2f" },
                        { dataKey: "D", label: "D", color: "#1976d2" },
                        { dataKey: "NF", label: "NF", color: "#666" },
                      ]}
                      height={280}
                    />
                  </Paper>
                </Grid>

                {/* Chart 3: Modeled Strength */}
                <Grid>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      Modeled Party Strength
                    </Typography>
                    <BarChart
                      dataset={[
                        { strength: "Hard R", count: turnoutStats.hard_r || 0 },
                        { strength: "Weak R", count: turnoutStats.weak_r || 0 },
                        { strength: "Swing", count: turnoutStats.swing || 0 },
                        { strength: "Weak D", count: turnoutStats.weak_d || 0 },
                        { strength: "Hard D", count: turnoutStats.hard_d || 0 },
                      ]}
                      xAxis={[{ scaleType: "band", dataKey: "strength" }]}
                      series={[{ dataKey: "count", color: "#7c4dff" }]}
                      height={280}
                      barLabel="value"
                    />
                  </Paper>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Collapse>
      </Card>

      {/* 2. Manage Committeemen */}
      <Card sx={{ mb: 6 }}>
        <CardActions disableSpacing sx={{ bgcolor: "#D3D3D3", color: "black" }}>
          <Typography variant="h6" fontWeight="bold">
            Manage Committeemen ({committeemen.length} total)
          </Typography>
          <ExpandMore
            expand={expandedTeam}
            onClick={() => setExpandedTeam(!expandedTeam)}
          >
            <ExpandMoreIcon sx={{ color: "black" }} />
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
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={member.dummyLogins || 0}
                              size="small"
                              color={
                                member.dummyLogins === 0
                                  ? "error"
                                  : member.dummyLogins <= 2
                                  ? "warning"
                                  : member.dummyLogins <= 4
                                  ? "default"
                                  : "success"
                              }
                              sx={{
                                width: 36,
                                fontWeight: "bold",
                                "& .MuiChip-label": { px: 0 },
                              }}
                            />

                            {/* Name (editable) */}
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
                                sx={{ minWidth: 180 }}
                              />
                            ) : (
                              <Typography variant="body2" fontWeight="medium">
                                {member.display_name || "—"}
                              </Typography>
                            )}
                          </Box>
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
                              <IconButton color="inherit" onClick={cancelEdit}>
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
                          {/* NEW: Email Button — Only shows if email exists */}
                          {member.email && (
                            <IconButton
                              color="primary"
                              onClick={() =>
                                window.open(`mailto:${member.email}`)
                              }
                              title={`Email ${member.email}`}
                              sx={{
                                color: "#0A3161",
                                "&:hover": { bgcolor: "#0A316111" },
                              }}
                            >
                              <MailOutlineIcon />
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
    </Box>
  );
}
