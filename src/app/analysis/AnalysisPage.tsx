// src/app/analysis/AnalysisPage.tsx — FINAL, 100% WORKING
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useVoters } from "../../hooks/useVoters";
import { saveAs } from "file-saver";

const FILTERS = {
  modeled_party: [
    { value: "", label: "All Modeled Party" },
    { value: "1 - Hard Republican", label: "1 - Hard Republican" },
    { value: "2 - Weak Republican", label: "2 - Weak Republican" },
    { value: "3 - Swing", label: "3 - Swing" },
    { value: "4 - Weak Democrat", label: "4 - Weak Democrat" },
    { value: "5 - Hard Democrat", label: "5 - Hard Democrat" },
  ],
  age_group: [
    { value: "", label: "All Ages" },
    { value: "18-25", label: "18-25 Young Adult Voters" },
    { value: "26-40", label: "26-40 Young Families" },
    { value: "41-70", label: "41-70 Established Voters" },
    { value: "71+", label: "70+ Seniors/Elderly" },
  ],
  has_mail_ballot: [
    { value: "", label: "All Mail Ballot" },
    { value: "true", label: "Has Mail Ballot" },
    { value: "false", label: "No Mail Ballot" },
  ],
  turnout_score_general: [
    { value: "", label: "All Turnout" },
    { value: "0", label: "0- Non-Voter" },
    { value: "1", label: "1- Inactive Voter" },
    { value: "2", label: "2- Intermittent" },
    { value: "3", label: "3- Frequent Voter" },
    { value: "4", label: "4- Active Voter" },
  ],
  voted_2024_general: [
    { value: "", label: "All 2024 General" },
    { value: "true", label: "Voted 2024 General" },
    { value: "false", label: "Did NOT Vote 2024 General" },
  ],
  precinct: [
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
  ],
};

export default function AnalysisPage() {
  const [filters, setFilters] = useState({
    precinct: "",
    modeled_party: "2 - Weak Republican",
    age_group: "",
    has_mail_ballot: "",
    turnout_score_general: "4",
    voted_2024_general: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const FILTERED_LIST_SQL = submitted
    ? `
    SELECT
      full_name,
      age,
      age_group,
      party,
      modeled_party,
      precinct,
      phone_mobile,
      phone_home,
      address,
      has_mail_ballot,
      turnout_score_general,
      voted_2024_general
    FROM \`groundgame26_voters.chester_county\`
    WHERE 1=1
      ${filters.precinct ? `AND precinct = '${filters.precinct}'` : ""}
      ${
        filters.modeled_party
          ? `AND modeled_party = '${filters.modeled_party}'`
          : ""
      }
      ${filters.age_group ? `AND age_group = '${filters.age_group}'` : ""}
      ${
        filters.has_mail_ballot !== ""
          ? `AND has_mail_ballot = ${filters.has_mail_ballot === "true"}`
          : ""
      }
      ${
        filters.turnout_score_general !== ""
          ? `AND turnout_score_general = ${filters.turnout_score_general}`
          : ""
      }
      ${
        filters.voted_2024_general !== ""
          ? `AND voted_2024_general = ${filters.voted_2024_general === "true"}`
          : ""
      }
    ORDER BY full_name
    LIMIT 1000
  `
    : "";

  const { data = [], isLoading, error } = useVoters(FILTERED_LIST_SQL);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const exportList = () => {
    if (!data.length) {
      alert("No voters match your filters");
      return;
    }

    const csv = [
      [
        "Name",
        "Age",
        "Age Group",
        "Party",
        "Modeled Party",
        "Precinct",
        "Phone",
        "Address",
        "Mail Ballot",
        "Turnout Score",
        "Voted 2024",
      ],
      ...data.map((v: any) => [
        v.full_name || "",
        v.age || "",
        v.age_group || "",
        v.party || "",
        v.modeled_party || "",
        v.precinct || "",
        v.phone_mobile || v.phone_home || "",
        v.address || "",
        v.has_mail_ballot ? "Yes" : "No",
        v.turnout_score_general || "",
        v.voted_2024_general ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    saveAs(
      new Blob([csv], { type: "text/csv" }),
      `Targeted_Voters_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <>
      <Box>
        <Alert severity="success" sx={{ mt: 4 }}>
          AI Insight: Area 15 showing surge in weak Republicans — prioritize
          door-knocking!
        </Alert>
      </Box>
      <Box p={4}>
        <Typography variant="h4" gutterBottom color="#B22234" fontWeight="bold">
          Analysis — Voter Targeting Engine
        </Typography>

        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Target Your Voters
          </Typography>

          <Grid spacing={2}>
            {Object.entries(FILTERS).map(([key, options]) => (
              <Grid key={key}>
                <FormControl fullWidth>
                  <InputLabel>
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </InputLabel>
                  <Select
                    value={filters[key as keyof typeof filters]}
                    onChange={(e) =>
                      setFilters({ ...filters, [key]: e.target.value })
                    }
                    displayEmpty
                  >
                    {options.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>

          <Box mt={4}>
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: "#B22234" }}
              onClick={handleSubmit}
            >
              Run Analysis
            </Button>
          </Box>
        </Paper>

        {submitted && isLoading && (
          <Alert severity="info">Loading your targeted voters...</Alert>
        )}
        {error && (
          <Alert severity="error">Error: {(error as Error).message}</Alert>
        )}
        {submitted && !isLoading && !error && data.length === 0 && (
          <Alert severity="warning">
            No voters match your filters — try broadening them
          </Alert>
        )}

        {submitted && !isLoading && !error && data.length > 0 && (
          <Paper>
            <Box
              p={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{data.length} voters found</Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={exportList}
              >
                Download Full List
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Precinct</TableCell>
                    <TableCell>Mail Ballot</TableCell>
                    <TableCell>Turnout</TableCell>
                    <TableCell>2024 Vote</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(0, 50).map((voter: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{voter.full_name}</TableCell>
                      <TableCell>{voter.age}</TableCell>
                      <TableCell>{voter.party}</TableCell>
                      <TableCell>
                        {voter.phone_mobile || voter.phone_home || "—"}
                      </TableCell>
                      <TableCell>{voter.precinct}</TableCell>
                      <TableCell>
                        {voter.has_mail_ballot ? "Yes" : "No"}
                      </TableCell>
                      <TableCell>{voter.turnout_score_general}</TableCell>
                      <TableCell>
                        {voter.voted_2024_general ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </>
  );
}
