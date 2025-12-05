// src/app/walk/WalkListPage.tsx — FINAL & 100% WORKING
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
} from "@mui/material";
import { saveAs } from "file-saver";

export default function WalkListPage() {
  const [zipInput, setZipInput] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Extract first 5 digits (handles ZIP+4)
  useEffect(() => {
    const cleaned = zipInput.replace(/\D/g, "").slice(0, 5);
    setZipCode(cleaned);
  }, [zipInput]);

  const WALK_LIST_SQL =
    submitted && zipCode.length === 5
      ? `
    SELECT
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

  // FIXED: These two handlers were missing!
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#B22234" fontWeight="bold">
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
              helperText={
                zipCode.length === 5 ? "Ready to generate!" : "Enter 5 digits"
              }
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
              sx={{ bgcolor: "#B22234", "&:hover": { bgcolor: "#B22234DD" } }}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEntries.map(([address, voters]) => {
                  const typedVoters = voters as any[];
                  return typedVoters.map((voter, i) => (
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
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION — NOW WORKING */}
          <TablePagination
            component="div"
            count={addressEntries.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Addresses per page:"
            sx={{
              "& .MuiTablePagination-toolbar": { color: "#0A3161" },
            }}
          />
        </Paper>
      )}
    </Box>
  );
}
