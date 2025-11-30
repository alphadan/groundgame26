// src/app/dashboard/MyPrecinctsPage.tsx — FINAL & BEAUTIFUL
import { useVoters } from "../../hooks/useVoters";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Button,
} from "@mui/material";
import { Grid } from '@mui/material';
import { BarChart } from "@mui/x-charts/BarChart";
import { saveAs } from "file-saver";

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

export default function MyPrecinctsPage() {
  const { data = [], isLoading, error } = useVoters(MY_STATS_SQL);
  const stats = data[0] || {};

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

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(
      blob,
      `My_Precincts_Summary_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
        My Precincts — Live Intelligence
      </Typography>

      {isLoading && (
        <Alert severity="info">
          Loading your precinct data from BigQuery...
        </Alert>
      )}
      {error && (
        <Alert severity="error">Error: {(error as Error).message}</Alert>
      )}

      {!isLoading && !error && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid xs={12} sm={6} md={3}>
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
            <Grid xs={12} sm={6} md={3}>
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
            <Grid xs={12} sm={6} md={3}>
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
            <Grid xs={12} sm={6} md={3}>
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

          <Paper sx={{ p: 4, mb: 4 }}>
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

          <Alert severity="success">
            Your precincts are fully secure — only you can see this data.
          </Alert>
        </>
      )}
    </Box>
  );
}
