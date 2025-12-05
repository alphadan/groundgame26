// src/app/voters/VoterListPage.tsx — FINAL & PERFECT
import { useVoters } from "../../hooks/useVoters";
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
  Button,
  Chip,
  Alert,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { Phone, Message } from "@mui/icons-material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useState } from "react";

const PRECINCTS = [
  { value: "", label: "All Precincts" },
  { value: "5", label: "5 - Atglen" },
  { value: "225", label: "225 - East Fallowfield-E" },
  { value: "230", label: "230 - East Fallowfield-W" },
  { value: "290", label: "290 - Highland Township" },
  { value: "440", label: "440 - Parkesburg North" },
  { value: "445", label: "445 - Parkesburg South" },
  { value: "535", label: "535 - Sadsbury-North" },
  { value: "540", label: "540 - Sadsbury-South" },
  { value: "545", label: "545 - West Sadsbury" },
  { value: "235", label: "235 - West Fallowfield" },
];

export default function VoterListPage() {
  const [selectedPrecinct, setSelectedPrecinct] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Dynamic query based on precinct filter
  const VOTER_LIST_SQL = selectedPrecinct
    ? `
    SELECT
      full_name,
      age,
      gender,
      party,
      phone_home,
      phone_mobile,
      address,
      turnout_score_general,
      mail_ballot_returned,
      likely_mover,
      precinct
    FROM \`groundgame26_voters.chester_county\`
    WHERE precinct = '${selectedPrecinct}'
    ORDER BY turnout_score_general DESC
    LIMIT 1000
  `
    : `
    SELECT
      full_name,
      age,
      gender,
      party,
      phone_home,
      phone_mobile,
      address,
      turnout_score_general,
      mail_ballot_returned,
      likely_mover,
      precinct
    FROM \`groundgame26_voters.chester_county\`
    ORDER BY turnout_score_general DESC
    LIMIT 1000
  `;

  const { data = [], isLoading, error } = useVoters(VOTER_LIST_SQL);

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const call = (phone: string) =>
    window.open(`tel:${phone.replace(/\D/g, "")}`);
  const text = (phone: string) =>
    window.open(`sms:${phone.replace(/\D/g, "")}`);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#B22234" fontWeight="bold">
        Voter Contact List — Your Precincts
      </Typography>

      {/* PRECINCT FILTER */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: "#f5f5f5" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <FormControl fullWidth size="small" sx={{ minWidth: 300 }}>
              <InputLabel
                sx={{ color: "#0A3161", "&.Mui-focused": { color: "#0A3161" } }}
              >
                Filter by Precinct
              </InputLabel>
              <Select
                value={selectedPrecinct}
                onChange={(e) => {
                  setSelectedPrecinct(e.target.value);
                  setPage(0);
                }}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0A3161",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0A3161",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0A3161",
                  },
                  "& .MuiSvgIcon-root": { color: "#0A3161" },
                }}
              >
                {PRECINCTS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            <Typography variant="body2" color="text.secondary">
              {selectedPrecinct
                ? `${data.length.toLocaleString()} voters in precinct ${selectedPrecinct}`
                : `${data.length.toLocaleString()} total voters`}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && (
        <Box textAlign="center" py={8}>
          <CircularProgress />
          <Typography mt={2}>Loading voters...</Typography>
        </Box>
      )}
      {error && <Alert severity="error">{(error as Error).message}</Alert>}

      {!isLoading && !error && (
        <Paper>
          <Box
            p={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {data.length.toLocaleString()} Total Voters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedData.length} per page
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#0A3161" }}>
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
                    Phone
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Turnout
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Mail Ballot
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((voter: any, index: number) => (
                  <TableRow key={index} hover>
                    <TableCell>{voter.full_name || "—"}</TableCell>
                    <TableCell>{voter.age || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={voter.party || "—"}
                        color={
                          voter.party === "R"
                            ? "error"
                            : voter.party === "D"
                            ? "primary"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {voter.phone_mobile || voter.phone_home || "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={voter.turnout_score_general || 0}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {voter.mail_ballot_returned ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                      {(voter.phone_mobile || voter.phone_home) && (
                        <>
                          <Button
                            size="small"
                            startIcon={<Phone />}
                            onClick={() =>
                              call(voter.phone_mobile || voter.phone_home!)
                            }
                            sx={{ mr: 1 }}
                          >
                            Call
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Message />}
                            onClick={() =>
                              text(voter.phone_mobile || voter.phone_home!)
                            }
                          >
                            Text
                          </Button>
                        </>
                      )}
                      {voter.email && (
                        <Button
                          size="small"
                          startIcon={<MailOutlineIcon />}
                          onClick={() => window.open(`mailto:${voter.email}`)}
                          sx={{
                            minWidth: 0,
                            color: "#0A3161",
                            "&:hover": { bgcolor: "#0A316111" },
                          }}
                          title={`Email ${voter.email}`}
                        >
                          Email
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={data.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Rows per page:"
            sx={{
              "& .MuiTablePagination-toolbar": { color: "#0A3161" },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                { color: "#0A3161" },
            }}
          />
        </Paper>
      )}
    </Box>
  );
}
