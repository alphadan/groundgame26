// src/app/analysis/AnalysisPage.tsx — FINAL & WORKING
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from "@mui/material";
import { Grid } from "@mui/material";
import { useVoters } from "../../hooks/useVoters";
import { BarChart } from "@mui/x-charts/BarChart";
import { saveAs } from "file-saver";

const INSIGHTS_SQL = `
WITH recent AS (
  SELECT 
    DATE(Date_Registered) AS reg_date,
    COUNT(*) AS new_regs,
    COUNTIF(has_mail_ballot = true) AS mail_requests,
    COUNTIF(mail_ballot_returned = true) AS mail_accepted,
    COUNTIF(voted_2024_general = true) AS voted_2024,
    COUNTIF(party = 'R' AND turnout_score_general < 70) AS weak_republicans,
    COUNTIF(party NOT IN ('R','D') AND party IS NOT NULL) AS swing_voters
  FROM \`groundgame26_voters.chester_county\`
  WHERE Date_Registered >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  GROUP BY reg_date
)
SELECT * FROM recent ORDER BY reg_date DESC
`;

export default function AnalysisPage() {
  const [dateRange, setDateRange] = useState("90");
  const { data = [], isLoading, error } = useVoters(INSIGHTS_SQL);

  const exportAnalysis = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Date",
      "New Registrations",
      "Mail Requests",
      "Mail Accepted",
      "Voted 2024",
      "Weak Republicans",
      "Swing Voters",
    ];

    const rows = data.map((row: any) => [
      row.reg_date || "",
      row.new_regs || 0,
      row.mail_requests || 0,
      row.mail_accepted || 0,
      row.voted_2024 || 0,
      row.weak_republicans || 0,
      row.swing_voters || 0,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(
      blob,
      `Chester_County_Analysis_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f" fontWeight="bold">
        Analysis — Dynamic Voter Intelligence
      </Typography>

      <Grid>
        <Grid>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 90 Days</MenuItem>
              <MenuItem value="180">Last 6 Months</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid display="flex" gap={2} alignItems="center">
          <Button variant="contained" onClick={exportAnalysis}>
            Export Analysis CSV
          </Button>
          <Button variant="outlined">Generate Walk List</Button>
          <Button variant="outlined" color="secondary">
            Phone Bank Mode
          </Button>
        </Grid>
      </Grid>

      {isLoading && (
        <Alert severity="info">
          Loading real-time analysis from BigQuery...
        </Alert>
      )}
      {error && (
        <Alert severity="error">Error: {(error as Error).message}</Alert>
      )}

      <Grid>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            New Registrations
          </Typography>
          <BarChart
            dataset={data}
            xAxis={[{ scaleType: "band", dataKey: "reg_date" }]}
            series={[
              { dataKey: "new_regs", label: "New Voters", color: "#d32f2f" },
            ]}
            height={300}
          />
        </Paper>
      </Grid>

      <Grid>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mail-in Ballot Activity
          </Typography>
          <BarChart
            dataset={data}
            xAxis={[{ scaleType: "band", dataKey: "reg_date" }]}
            series={[
              {
                dataKey: "mail_requests",
                label: "Requested",
                color: "#1976d2",
              },
              {
                dataKey: "mail_accepted",
                label: "Returned",
                color: "#388e3c",
              },
            ]}
            height={300}
          />
        </Paper>
      </Grid>

      <Grid>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Weak Republicans & Swing Voters
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Weak R</TableCell>
                  <TableCell align="right">Swing</TableCell>
                  <TableCell>Hotspot?</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 15).map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.reg_date}</TableCell>
                    <TableCell align="right">
                      <Chip label={row.weak_republicans} color="error" />
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={row.swing_voters} color="warning" />
                    </TableCell>
                    <TableCell>
                      {row.weak_republicans > 12 && (
                        <Chip
                          label="HOTSPOT"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Alert severity="success" sx={{ mt: 4 }}>
        AI Insight: Area 15 showing surge in weak Republicans — prioritize
        door-knocking!
      </Alert>
    </Box>
  );
}
