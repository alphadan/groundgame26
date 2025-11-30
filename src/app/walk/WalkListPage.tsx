import { useVoters } from "../../hooks/useVoters";
import { Box, Typography, Button, Alert } from "@mui/material";
import { saveAs } from "file-saver";

const WALK_LIST_SQL = `
SELECT
  full_name,
  address,
  age,
  party,
  phone_mobile,
  turnout_score_general
FROM \`groundgame26_voters.chester_county\`
WHERE turnout_score_general >= 70
  AND (phone_mobile IS NOT NULL OR phone_home IS NOT NULL)
ORDER BY address
`;

export default function WalkListPage() {
  const { data = [], isLoading } = useVoters(WALK_LIST_SQL);

  const generatePDF = () => {
    const csv = data
      .map(
        (v: any) =>
          `${v.full_name},${v.address},${v.age},${v.party},${v.phone_mobile}`
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "Walk_List_High_Turnout.csv");
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f">
        Walk List Generator
      </Typography>
      <Button
        variant="contained"
        onClick={generatePDF}
        disabled={isLoading || data.length === 0}
      >
        Download Walk List (CSV)
      </Button>
      <Typography mt={2}>
        High-turnout voters with phones: {data.length}
      </Typography>
    </Box>
  );
}
