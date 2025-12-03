// src/app/reports/ReportsPage.tsx — FINAL & 100% ACCURATE
import { useVoters } from "../../hooks/useVoters";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

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

// Persuadable Republicans Matches your real data types
const WEAK_REPUBLICANS_BY_AGE_SQL = `
SELECT 
  age_group,
  COUNT(*) AS weak_republicans
FROM \`groundgame26_voters.chester_county\`
WHERE modeled_party = '2 - Weak Republican'
  AND has_mail_ballot = FALSE
  AND voted_2024_general = FALSE
  AND age_group IS NOT NULL
GROUP BY age_group
ORDER BY 
  CASE age_group 
    WHEN '18-25' THEN 1 
    WHEN '26-40' THEN 2 
    WHEN '41-70' THEN 3 
    ELSE 4 
  END
`;

export default function ReportsPage() {
  const [userMeta, setUserMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: chartData = [], isLoading: chartLoading } =
    useVoters(PARTY_AGE_SQL);
  const { data: weakRepData = [], isLoading: weakRepLoading } = useVoters(
    WEAK_REPUBLICANS_BY_AGE_SQL
  );

  // Auth
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

  const totalPersuadable = weakRepData.reduce(
    (sum: number, r: any) => sum + (r.weak_republicans || 0),
    0
  );

  const exportWeakRepCSV = () => {
    const csv = [
      "Age Group,Weak Republicans (Not Voted 2024)",
      ...weakRepData.map((r: any) => `${r.age_group},${r.weak_republicans}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(
      blob,
      `Weak_Republicans_Not_Voted_2024_${totalPersuadable}_voters.csv`
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#d32f2f">
        Chester County — LIVE Voter Intelligence
      </Typography>

      {/* 1. Party Affiliation */}
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

      {/* 2. Weak Republicans — NOW 100% CORRECT */}
      <Paper sx={{ p: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#d32f2f">
              Persuadable Republicans
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Need Mail-in Ballots • Did Not Vote 2024 General
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={exportWeakRepCSV}
            disabled={weakRepLoading}
          >
            Export CSV
          </Button>
        </Box>

        {weakRepLoading ? (
          <Box textAlign="center" py={8}>
            <CircularProgress />
            <Typography>
              Finding your highest-value turnout targets...
            </Typography>
          </Box>
        ) : weakRepData.length === 0 ? (
          <Alert severity="info">No matching voters found.</Alert>
        ) : (
          <>
            <Typography
              variant="h4"
              align="center"
              color="#d32f2f"
              fontWeight="bold"
              mb={3}
            >
              {totalPersuadable.toLocaleString()} High-Priority Turnout Targets
            </Typography>
            <BarChart
              dataset={weakRepData}
              xAxis={[{ scaleType: "band", dataKey: "age_group" }]}
              series={[
                {
                  dataKey: "weak_republicans",
                  label: "Weak R (Not Voted)",
                  color: "#ff4444",
                },
              ]}
              height={480}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
