// src/app/reports/ReportsPage.tsx
import { useVoters } from "../../hooks/useVoters";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { saveAs } from "file-saver";

const PARTY_AGE_SQL = `
SELECT 
  age_group,
  COUNTIF(party = 'R') AS R,
  COUNTIF(party = 'D') AS D,
  COUNTIF(party NOT IN ('R','D') AND party IS NOT NULL) AS Other
FROM \`groundgame26_voters.chester_county\`
GROUP BY age_group
ORDER BY 
  CASE age_group WHEN '18-25' THEN 1 WHEN '26-40' THEN 2 WHEN '41-70' THEN 3 ELSE 4 END
`;

export default function ReportsPage() {
  const { data: chartData = [], isLoading, error } = useVoters(PARTY_AGE_SQL);

  const exportCSV = () => {
    if (!chartData.length) return;
    const csv = [
      ["Age Group", "Republican", "Democrat", "Other"],
      ...chartData.map((row: any) => [
        row.age_group || "Unknown",
        row.R || 0,
        row.D || 0,
        row.Other || 0,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "Chester_County_Party_by_Age.csv");
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Chester County – Live Voter Intelligence
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            Party Affiliation by Age Group (Real Data)
          </Typography>
          <Button
            variant="contained"
            onClick={exportCSV}
            disabled={isLoading || !chartData.length}
          >
            Export CSV
          </Button>
        </Box>

        {isLoading && (
          <Box textAlign="center" py={4}>
            <CircularProgress />
            <Typography mt={2}>Loading live voter data...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error">
            Error loading data: {(error as Error).message}
          </Alert>
        )}

        {!isLoading && !error && chartData.length > 0 && (
          <BarChart
            dataset={chartData}
            xAxis={[{ scaleType: "band", dataKey: "age_group" }]}
            series={[
              { dataKey: "R", label: "Republican", color: "#d32f2f" },
              { dataKey: "D", label: "Democrat", color: "#1976d2" },
              { dataKey: "Other", label: "Other", color: "#666666" },
            ]}
            height={420}
            margin={{ top: 60, right: 30, bottom: 60, left: 80 }}
          />
        )}
      </Paper>

      <Paper sx={{ p: 4, height: 600 }}>
        <Typography variant="h6" gutterBottom>
          Interactive Chester County Precinct Map
        </Typography>
        <iframe
          src="https://alphadan.github.io/chester-county-precincts/"
          width="100%"
          height="560"
          style={{ border: 0, borderRadius: 8 }}
          title="Chester County Precincts"
        />
      </Paper>
    </Box>
  );
}
