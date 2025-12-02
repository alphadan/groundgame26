// src/app/analysis/AnalysisPage.tsx — FINAL WITH YOUR REAL SCHEMA
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
} from "@mui/material";
import { useVoters } from "../../hooks/useVoters";
import { saveAs } from "file-saver";

const FILTERS = {
  modeled_party: [
    { value: "", label: "All Modeled Party" },
    { value: "1", label: "1- Hard Republican" },
    { value: "2", label: "2- Weak Republican" },
    { value: "3", label: "3- Swing" },
    { value: "4", label: "4- Weak Democrat" },
    { value: "5", label: "5- Hard Democrat" },
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
};

export default function AnalysisPage() {
  const [filters, setFilters] = useState({
    modeled_party: "",
    age_group: "",
    has_mail_ballot: "",
    turnout_score_general: "",
    voted_2024_general: "",
  });

  const FILTERED_LIST_SQL = `
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
  WHERE (${filters.modeled_party === ""} OR modeled_party = '${
    filters.modeled_party
  }')
    AND (${filters.age_group === ""} OR age_group = '${filters.age_group}')
    AND (${filters.has_mail_ballot === ""} OR has_mail_ballot = ${
    filters.has_mail_ballot === "true"
  })
    AND (${filters.turnout_score_general === ""} OR turnout_score_general = ${
    filters.turnout_score_general
  })
    AND (${filters.voted_2024_general === ""} OR voted_2024_general = ${
    filters.voted_2024_general === "true"
  })
  ORDER BY full_name
  LIMIT 1000
`;

  const { data = [], isLoading, error } = useVoters(FILTERED_LIST_SQL);

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
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
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
            color="primary"
            onClick={exportList}
          >
            Download Targeted List ({data.length} voters)
          </Button>
        </Box>
      </Paper>

      {isLoading && (
        <Alert severity="info">Loading your targeted voters...</Alert>
      )}
      {error && (
        <Alert severity="error">Error: {(error as Error).message}</Alert>
      )}
      {!isLoading && !error && data.length === 0 && (
        <Alert severity="warning">
          No voters match your filters — try broadening them
        </Alert>
      )}

      {!isLoading && !error && data.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Party</TableCell>
                  <TableCell>Modeled</TableCell>
                  <TableCell>Precinct</TableCell>
                  <TableCell>Phone</TableCell>
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
                    <TableCell>{voter.modeled_party}</TableCell>
                    <TableCell>{voter.precinct}</TableCell>
                    <TableCell>
                      {voter.phone_mobile || voter.phone_home || "—"}
                    </TableCell>
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
  );
}
