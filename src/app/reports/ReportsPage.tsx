// src/app/reports/ReportsPage.tsx
import { Box, Typography, Paper } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

const partyByAgeData = [
  { age: "18-25", R: 2800, D: 4200, Other: 900 },
  { age: "26-40", R: 8900, D: 7200, Other: 1800 },
  { age: "41-70", R: 15200, D: 9800, Other: 2100 },
  { age: "71+", R: 6200, D: 5400, Other: 800 },
];

export default function ReportsPage() {
  return (
    <Box>
      <Typography variant="h4" mb={4} fontWeight="bold">
        Chester County – Reports Dashboard
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Party Affiliation by Age Group
        </Typography>
        <BarChart
          dataset={partyByAgeData}
          xAxis={[{ scaleType: "band", dataKey: "age" }]}
          series={[
            { dataKey: "R", label: "Republican", color: "#d32f2f" },
            { dataKey: "D", label: "Democrat", color: "#1976d2" },
            { dataKey: "Other", label: "Other", color: "#9e9e9e" },
          ]}
          height={400}
          slotProps={{
            legend: {
              position: { vertical: "top", horizontal: "center" as const }, // ← "center" instead of "middle"
            },
          }}
          sx={{
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              transform: "translate(-10px, 0)",
            },
          }}
        />
      </Paper>

      <Paper
        sx={{
          p: 4,
          height: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Interactive Chester County Map - Coming Next
        </Typography>
      </Paper>
    </Box>
  );
}
