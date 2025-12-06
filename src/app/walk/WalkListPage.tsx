// src/app/walk/WalkListPage.tsx — FINAL & 100% WORKING WITH NOTES
import { useState, useEffect } from "react";
import { useVoters } from "../../hooks/useVoters";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import { saveAs } from "file-saver";
import { AddComment } from "@mui/icons-material";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function WalkListPage() {
  const [zipInput, setZipInput] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Notes state
  const [openNote, setOpenNote] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [noteText, setNoteText] = useState("");
  const [voterNotes, setVoterNotes] = useState<Record<string, any[]>>({});

  // Extract first 5 digits
  useEffect(() => {
    const cleaned = zipInput.replace(/\D/g, "").slice(0, 5);
    setZipCode(cleaned);
  }, [zipInput]);

  const WALK_LIST_SQL =
    submitted && zipCode.length === 5
      ? `
    SELECT
      voter_id,
      address,
      full_name,
      age,
      party,
      modeled_party,
      turnout_score_general,
      has_mail_ballot,
      voted_2024_general
    FROM \`groundgame26_voters.chester_county\`
    WHERE ZIP_CODE = ${zipCode}
    ORDER BY address, full_name
  `
      : "";

  const { data = [], isLoading, error } = useVoters(WALK_LIST_SQL);

  // Real-time notes using voter_id
  useEffect(() => {
    if (!data.length) return;

    const unsubscribes: Unsubscribe[] = data.map((voter: any) => {
      if (!voter.voter_id) return () => {};

      const q = query(
        collection(db, "voter_notes"),
        where("voter_id", "==", voter.voter_id),
        orderBy("created_at", "desc")
      );

      return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVoterNotes((prev) => ({ ...prev, [voter.voter_id]: notes }));
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub?.());
  }, [data]);

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedVoter || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "voter_notes"), {
        voter_id: selectedVoter.voter_id,
        full_name: selectedVoter.full_name,
        address: selectedVoter.address,
        note: noteText,
        created_by_uid: auth.currentUser.uid,
        created_by_name:
          auth.currentUser.displayName ||
          auth.currentUser.email?.split("@")[0] ||
          "User",
        created_at: new Date(),
      });

      setNoteText("");
      setOpenNote(false);
    } catch (err) {
      console.error("Failed to save note", err);
      alert("Failed to save note");
    }
  };

  const handleSubmit = () => {
    if (zipCode.length !== 5) {
      alert("Please enter a valid 5-digit ZIP code");
      return;
    }
    setSubmitted(true);
    setPage(0);
  };

  const exportCSV = () => {
    const csv = [
      "Address,Name,Age,Party,Modeled Party,Turnout Score,Mail Ballot,Voted 2024",
      ...data.map(
        (v: any) =>
          `${v.address || ""},"${v.full_name || ""}",${v.age || ""},${
            v.party || ""
          },${v.modeled_party || ""},${v.turnout_score_general || ""},${
            v.has_mail_ballot ? "Yes" : "No"
          },${v.voted_2024_general ? "Yes" : "No"}`
      ),
    ].join("\n");

    saveAs(
      new Blob([csv], { type: "text/csv" }),
      `Walk_List_ZIP_${zipCode}.csv`
    );
  };

  // Group by address
  const groupedByAddress = data.reduce(
    (acc: Record<string, any[]>, voter: any) => {
      const addr = voter.address || "Unknown Address";
      if (!acc[addr]) acc[addr] = [];
      acc[addr].push(voter);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const addressEntries = Object.entries(groupedByAddress);
  const paginatedEntries = addressEntries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
        Walk List Generator — Street-by-Street Targets
      </Typography>

      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h6" gutterBottom color="#0A3161">
          Enter ZIP Code to Generate Walk List
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid>
            <TextField
              label="ZIP Code"
              fullWidth
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              placeholder="19320 or 19320-1234"
              helperText={zipCode.length === 5 ? "Ready!" : "Enter 5 digits"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: zipCode.length === 5 ? "#0A3161" : undefined,
                  },
                  "&.Mui-focused fieldset": { borderColor: "#0A3161" },
                },
              }}
            />
          </Grid>
          <Grid>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#0A3161",
                "&:hover": { bgcolor: "#0d47a1" },
                px: 6,
              }}
              onClick={handleSubmit}
              disabled={zipCode.length !== 5 || isLoading}
            >
              {isLoading ? "Loading..." : "Generate List"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {submitted && isLoading && (
        <Box textAlign="center" py={8}>
          <CircularProgress />
          <Typography mt={2}>
            Building your walk list for ZIP {zipCode}...
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error">Error loading data. Try again.</Alert>}

      {submitted && !isLoading && !error && data.length === 0 && (
        <Alert severity="info">
          No high-value targets found in ZIP {zipCode}. Try another area!
        </Alert>
      )}

      {submitted && !isLoading && !error && data.length > 0 && (
        <Paper>
          <Box
            p={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">
              {data.length.toLocaleString()} Targets in ZIP {zipCode}
            </Typography>
            <Button
              variant="contained"
              sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}
              onClick={exportCSV}
            >
              Export Walk List
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#0A3161" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Address
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Age
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Party
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Modeled
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Turnout
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    2024 Vote
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Notes
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEntries.map(([address, voters]) => {
                  const typedVoters = voters as any[];
                  return typedVoters.map((voter, i) => {
                    const notes = voterNotes[voter.voter_id] || [];

                    return (
                      <TableRow key={`${address}-${i}`} hover>
                        {i === 0 && (
                          <TableCell
                            rowSpan={typedVoters.length}
                            sx={{ verticalAlign: "top", fontWeight: "bold" }}
                          >
                            {address}
                            <br />
                            <Chip
                              label={`${typedVoters.length} voter${
                                typedVoters.length > 1 ? "s" : ""
                              }`}
                              size="small"
                              color="primary"
                              sx={{ mt: 1 }}
                            />
                          </TableCell>
                        )}
                        <TableCell>{voter.full_name || "—"}</TableCell>
                        <TableCell>{voter.age || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={voter.party || "NF"}
                            size="small"
                            color={
                              voter.party === "R"
                                ? "error"
                                : voter.party === "D"
                                ? "primary"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={voter.modeled_party || "—"}
                            size="small"
                            color={
                              voter.modeled_party?.includes("Hard R")
                                ? "error"
                                : voter.modeled_party?.includes("Weak R")
                                ? "warning"
                                : voter.modeled_party?.includes("Swing")
                                ? "default"
                                : voter.modeled_party?.includes("Weak D")
                                ? "info"
                                : voter.modeled_party?.includes("Hard D")
                                ? "primary"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={voter.turnout_score_general || 0}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {voter.voted_2024_general ? "Yes" : "No"}
                        </TableCell>

                        {/* NOTES + ADD BUTTON */}
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedVoter(voter);
                                setOpenNote(true);
                              }}
                            >
                              <AddComment />
                            </IconButton>
                            {notes.length > 0 && (
                              <Chip
                                label={notes.length}
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>

                          {/* Always-visible notes */}
                          {notes.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              {notes.map((note: any) => (
                                <Paper
                                  key={note.id}
                                  sx={{
                                    p: 2,
                                    mb: 1,
                                    bgcolor: "#f0f7ff",
                                    borderLeft: "4px solid #0A3161",
                                  }}
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mb={1}
                                  >
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {note.created_by_name?.[0] || "U"}
                                    </Avatar>
                                    <Typography
                                      variant="caption"
                                      fontWeight="bold"
                                    >
                                      {note.created_by_name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        note.created_at?.seconds * 1000
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {note.note}
                                  </Typography>
                                </Paper>
                              ))}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={addressEntries.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>
      )}

      {/* ADD NOTE DIALOG */}
      <Dialog
        open={openNote}
        onClose={() => setOpenNote(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Note for {selectedVoter?.full_name}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Homeowner very supportive — will vote R"
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNote(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={!noteText.trim()}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
