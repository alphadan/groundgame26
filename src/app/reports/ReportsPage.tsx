// src/app/reports/ReportsPage.tsx — FINAL: Lazy Load Only When Expanded
import { useVoters } from "../../hooks/useVoters";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
} from "@mui/material";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";

import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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

// This Persuadable query only runs when card is expanded
const WEAK_REPUBLICANS_SQL = `
SELECT 
  age_group,
  COUNTIF(party = 'R') AS total_republicans,
  COUNTIF(
    modeled_party = '2 - Weak Republican'
    AND has_mail_ballot = FALSE
    AND voted_2024_general = FALSE
  ) AS weak_republicans
FROM \`groundgame26_voters.chester_county\`
WHERE age_group IS NOT NULL
GROUP BY age_group
ORDER BY 
  CASE age_group WHEN '18-25' THEN 1 WHEN '26-40' THEN 2 WHEN '41-70' THEN 3 ELSE 4 END
`;

// This query only runs when card is expanded
const LIKELY_MOVERS_SQL = `
SELECT 
  age_group,
  COUNTIF(party = 'R') AS republican_movers,
  COUNTIF(party = 'D') AS democrat_movers,
  COUNTIF(party NOT IN ('R','D') AND party IS NOT NULL) AS no_party_movers
FROM \`groundgame26_voters.chester_county\`
WHERE likely_mover = TRUE
  AND age_group IS NOT NULL
GROUP BY age_group
ORDER BY 
  CASE age_group WHEN '18-25' THEN 1 WHEN '26-40' THEN 2 WHEN '41-70' THEN 3 ELSE 4 END
`;

const NEW_REGISTRANTS_SQL = `
SELECT 
  age_group,
  COUNTIF(party = 'R') AS republican_new,
  COUNTIF(party = 'D') AS democrat_new,
  COUNTIF(party NOT IN ('R','D') AND party IS NOT NULL) AS no_party_new
FROM \`groundgame26_voters.chester_county\`
WHERE Date_Registered >= '2025-01-01'
  AND age_group IS NOT NULL
GROUP BY age_group
ORDER BY 
  CASE age_group WHEN '18-25' THEN 1 WHEN '26-40' THEN 2 WHEN '41-70' THEN 3 ELSE 4 END
`;

// Styled Expand Button
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

export default function ReportsPage() {
  const [userMeta, setUserMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // This one loads immediately — always visible
  const { data: chartData = [], isLoading: chartLoading } =
    useVoters(PARTY_AGE_SQL);

  // This one ONLY runs when expanded — fixes 403
  const { data: comparisonData = [], isLoading: compLoading } = useVoters(
    expanded ? WEAK_REPUBLICANS_SQL : "SELECT 1 WHERE FALSE" // ← No query when collapsed
  );

  // NEW: Likely Movers Report — lazy loaded
  const [expandedMovers, setExpandedMovers] = useState(false);
  const { data: moversData = [], isLoading: moversLoading } = useVoters(
    expandedMovers ? LIKELY_MOVERS_SQL : "SELECT 1 WHERE FALSE"
  );

  // New Movers By Party
  const totalMovers = moversData.reduce(
    (sum: number, r: any) =>
      sum +
      (r.republican_movers || 0) +
      (r.democrat_movers || 0) +
      (r.no_party_movers || 0),
    0
  );

  // NEW: New Registrants Since 2025
  const [expandedNewRegs, setExpandedNewRegs] = useState(false);
  const { data: newRegData = [], isLoading: newRegLoading } = useVoters(
    expandedNewRegs ? NEW_REGISTRANTS_SQL : "SELECT 1 WHERE FALSE"
  );

  const totalNewRegs = newRegData.reduce(
    (sum: number, r: any) =>
      sum +
      (r.republican_new || 0) +
      (r.democrat_new || 0) +
      (r.no_party_new || 0),
    0
  );

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "users_meta", user.uid)).then((snap) => {
      if (snap.exists()) setUserMeta(snap.data());
      setLoading(false);
    });
  }, []);

  if (!auth.currentUser) return <Alert severity="warning">Please log in</Alert>;
  if (loading) return <CircularProgress />;
  if (!userMeta || userMeta.role !== "chairman" || userMeta.scope !== "area")
    return (
      <Alert severity="error">Only Area Chairmen can access this report.</Alert>
    );

  const chartDataWithPercent = comparisonData.map((row: any) => ({
    ...row,
    percent_weak:
      row.total_republicans > 0
        ? Math.round((row.weak_republicans / row.total_republicans) * 100)
        : 0,
  }));

  const totalWeak = comparisonData.reduce(
    (s: number, r: any) => s + (r.weak_republicans || 0),
    0
  );
  const totalR = comparisonData.reduce(
    (s: number, r: any) => s + (r.total_republicans || 0),
    0
  );
  const overallPercent =
    totalR > 0 ? Math.round((totalWeak / totalR) * 100) : 0;

  const exportCSV = () => {
    const csv = [
      "Age Group,Total Republicans (party='R'),Weak Republicans (Not Voted),Percent Weak",
      ...chartDataWithPercent.map(
        (r: any) =>
          `${r.age_group},${r.total_republicans},${r.weak_republicans},${r.percent_weak}%`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `Weak_vs_Total_Republicans_${totalWeak}_of_${totalR}.csv`);
  };

  // Export New Movers CSV
  const exportMoversCSV = () => {
    const csv = [
      "Age Group,Republican Movers,Democrat Movers,No Party Movers",
      ...moversData.map(
        (r: any) =>
          `${r.age_group},${r.republican_movers || 0},${
            r.democrat_movers || 0
          },${r.no_party_movers || 0}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `Likely_Movers_By_Age_${totalMovers}_voters.csv`);
  };

  // Export New Registrations CSV
  const exportNewRegsCSV = () => {
    const csv = [
      "Age Group,Republican New,Democrat New,No Party New",
      ...newRegData.map(
        (r: any) =>
          `${r.age_group},${r.republican_new || 0},${r.democrat_new || 0},${
            r.no_party_new || 0
          }`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `New_Registrants_2025_${totalNewRegs}_voters.csv`);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#B22234">
        Chester County — LIVE Voter Intelligence
      </Typography>

      {/* Always Visible: Party by Age */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Party Affiliation by Age Group</Typography>
          <Button variant="contained" disabled={chartLoading}>
            Export CSV
          </Button>
        </Box>
        {chartLoading ? (
          <Box textAlign="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <BarChart
            dataset={chartData}
            xAxis={[{ scaleType: "band", dataKey: "age_group" }]}
            series={[
              { dataKey: "R", label: "Republican", color: "#d32f2f" },
              { dataKey: "D", label: "Democrat", color: "#1976d2" },
              { dataKey: "Other", label: "Other", color: "#666" },
            ]}
            height={420}
          />
        )}
      </Paper>

      {/* Collapsible: Only loads when opened */}
      <Card sx={{ mb: 6, boxShadow: 3, borderRadius: 2 }}>
        <CardActions disableSpacing sx={{ bgcolor: "#D3D3D3", color: "black" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Weak Republicans Who Haven't Voted 2024
            </Typography>
            <Typography variant="body2">
              Click to load high-priority turnout targets
            </Typography>
          </Box>
          <ExpandMore
            expand={expanded}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show report"
          >
            <ExpandMoreIcon sx={{ color: "black" }} />
          </ExpandMore>
        </CardActions>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 3 }}>
            {compLoading ? (
              <Box textAlign="center" py={8}>
                <CircularProgress />
                <Typography mt={2}>Loading turnout targets...</Typography>
              </Box>
            ) : comparisonData.length === 0 ? (
              <Alert severity="info">
                No weak Republicans found who haven't voted.
              </Alert>
            ) : (
              <>
                <Typography
                  variant="h4"
                  align="center"
                  color="#B22234"
                  fontWeight="bold"
                  mb={3}
                >
                  {totalWeak.toLocaleString()} of {totalR.toLocaleString()}{" "}
                  Republicans Haven't Voted ({overallPercent}%)
                </Typography>

                <BarChart
                  dataset={chartDataWithPercent}
                  xAxis={[{ scaleType: "band", dataKey: "age_group" }]}
                  series={[
                    {
                      dataKey: "total_republicans",
                      label: "Total Republicans (party='R')",
                      color: "#d32f2f",
                    },
                    {
                      dataKey: "weak_republicans",
                      label: "Weak R (Not Voted)",
                      color: "#ff6b6b",
                    },
                  ]}
                  height={520}
                  margin={{ top: 80, right: 250, bottom: 80, left: 80 }}
                  barLabel={(item) => {
                    if (
                      item.seriesId === "weak_republicans" &&
                      item.value != null &&
                      item.value > 0
                    ) {
                      const row = chartDataWithPercent[item.dataIndex];
                      return `${item.value} (${row.percent_weak}%)`;
                    }
                    return "";
                  }}
                />

                <Box textAlign="center" mt={4}>
                  <Button variant="contained" size="large" onClick={exportCSV}>
                    Export Full List to CSV
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Collapse>
      </Card>
      {/* NEW: Likely Movers by Age + Party */}
      <Card sx={{ mb: 6, boxShadow: 3, borderRadius: 2 }}>
        <CardActions disableSpacing sx={{ bgcolor: "#D3D3D3", color: "black" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Likely Movers by Age Group (R / D / NF)
            </Typography>
            <Typography variant="body2">
              Voters flagged as likely_mover = true
            </Typography>
          </Box>
          <ExpandMore
            expand={expandedMovers}
            onClick={() => setExpandedMovers(!expandedMovers)}
            aria-expanded={expandedMovers}
            aria-label="show movers report"
          >
            <ExpandMoreIcon sx={{ color: "black" }} />
          </ExpandMore>
        </CardActions>

        <Collapse in={expandedMovers} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 3 }}>
            {moversLoading ? (
              <Box textAlign="center" py={8}>
                <CircularProgress />
                <Typography mt={2}>Loading likely movers...</Typography>
              </Box>
            ) : moversData.length === 0 ? (
              <Alert severity="info">No likely movers found.</Alert>
            ) : (
              <>
                <Typography
                  variant="h4"
                  align="center"
                  color="#1976d2"
                  fontWeight="bold"
                  mb={3}
                >
                  {totalMovers.toLocaleString()} Likely Movers in Chester County
                </Typography>

                <BarChart
                  dataset={moversData}
                  xAxis={[{ scaleType: "band", dataKey: "age_group" }]}
                  series={[
                    {
                      dataKey: "republican_movers",
                      label: "Republican Movers",
                      color: "#d32f2f",
                    },
                    {
                      dataKey: "democrat_movers",
                      label: "Democrat Movers",
                      color: "#1976d2",
                    },
                    {
                      dataKey: "no_party_movers",
                      label: "No Party / Ind. Movers",
                      color: "#666666",
                    },
                  ]}
                  height={480}
                  margin={{ top: 60, right: 180, bottom: 80, left: 80 }}
                  barLabel={(item) => {
                    if (item.value != null && item.value > 0) {
                      return item.value.toString();
                    }
                    return "";
                  }}
                />

                <Box textAlign="center" mt={4}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={exportMoversCSV}
                  >
                    Export Likely Movers to CSV
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Collapse>
      </Card>
      {/* NEW: New Registrants Since 2025 */}
      <Card sx={{ mb: 6, boxShadow: 3, borderRadius: 2 }}>
        <CardActions disableSpacing sx={{ bgcolor: "#D3D3D3", color: "black" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              New Registrants Since Jan 1, 2025
            </Typography>
            <Typography variant="body2">
              Date_Registered ≥ 2025-01-01 • Grouped by Age & Party
            </Typography>
          </Box>
          <ExpandMore
            expand={expandedNewRegs}
            onClick={() => setExpandedNewRegs(!expandedNewRegs)}
            aria-expanded={expandedNewRegs}
            aria-label="show new registrants"
          >
            <ExpandMoreIcon sx={{ color: "black" }} />
          </ExpandMore>
        </CardActions>

        <Collapse in={expandedNewRegs} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 3 }}>
            {newRegLoading ? (
              <Box textAlign="center" py={8}>
                <CircularProgress />
                <Typography mt={2}>Loading new registrants...</Typography>
              </Box>
            ) : newRegData.length === 0 ? (
              <Alert severity="info">
                No new registrants since January 1, 2025.
              </Alert>
            ) : (
              <>
                <Typography
                  variant="h4"
                  align="center"
                  color="#1565c0"
                  fontWeight="bold"
                  mb={3}
                >
                  {totalNewRegs.toLocaleString()} New Voters Registered in 2025
                </Typography>

                <BarChart
                  dataset={newRegData}
                  xAxis={[{ scaleType: "band", dataKey: "age_group" }]}
                  series={[
                    {
                      dataKey: "republican_new",
                      label: "Republican New",
                      color: "#d32f2f",
                    },
                    {
                      dataKey: "democrat_new",
                      label: "Democrat New",
                      color: "#1976d2",
                    },
                    {
                      dataKey: "no_party_new",
                      label: "No Party / Ind. New",
                      color: "#666666",
                    },
                  ]}
                  height={480}
                  margin={{ top: 60, right: 180, bottom: 80, left: 80 }}
                  barLabel={(item) => {
                    if (item.value != null && item.value > 0) {
                      return item.value.toString();
                    }
                    return "";
                  }}
                />

                <Box textAlign="center" mt={4}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={exportNewRegsCSV}
                  >
                    Export New Registrants to CSV
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  );
}
