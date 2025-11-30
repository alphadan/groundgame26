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
} from "@mui/material";
import { Phone, Message, Home } from "@mui/icons-material";

const VOTER_LIST_SQL = `
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
  likely_mover
FROM \`groundgame26_voters.chester_county\`
ORDER BY turnout_score_general DESC
LIMIT 500
`;

export default function VoterListPage() {
  const { data = [], isLoading, error } = useVoters(VOTER_LIST_SQL);

  const call = (phone: string) =>
    window.open(`tel:${phone.replace(/\D/g, "")}`);
  const text = (phone: string) =>
    window.open(`sms:${phone.replace(/\D/g, "")}`);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#d32f2f">
        Voter Contact List — Your Precincts
      </Typography>

      {isLoading && <Alert severity="info">Loading voters...</Alert>}
      {error && <Alert severity="error">{(error as Error).message}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Turnout</TableCell>
              <TableCell>Mail Ballot</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((voter: any, index: number) => (
              <TableRow key={index} hover>
                <TableCell>{voter.full_name}</TableCell>
                <TableCell>{voter.age}</TableCell>
                <TableCell>
                  <Chip
                    label={voter.party}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
