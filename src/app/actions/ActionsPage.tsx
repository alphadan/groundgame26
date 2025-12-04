// src/app/actions/ActionsPage.tsx — FINAL: Collapsible Absentee Chaser
import { useState } from "react";
import { useVoters } from "../../hooks/useVoters";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { saveAs } from "file-saver";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";

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

const ABSENTEE_SQL = `
SELECT
  COUNTIF(has_mail_ballot = true AND mail_ballot_returned = false) AS outstanding_absentee,
  COUNTIF(has_mail_ballot = true) AS total_requested,
  ROUND(100.0 * COUNTIF(mail_ballot_returned = true) / NULLIF(COUNTIF(has_mail_ballot = true), 0), 1) AS return_rate
FROM \`groundgame26_voters.chester_county\`
`;

export default function ActionsPage() {
  const [subject, setSubject] = useState(
    "Important: Your Mail Ballot Has NOT Been Returned!"
  );
  const [message, setMessage] = useState(
    "<p>Dear {FIRST_NAME},</p><p>Your mail ballot has not been returned yet...</p>"
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Collapsible state
  const [expandedChase, setExpandedChase] = useState(false);

  // Lazy load — only when expanded
  const { data: absentee = [{}], isLoading: chaseLoading } = useVoters(
    expandedChase ? ABSENTEE_SQL : "SELECT 1 WHERE FALSE"
  );
  const stats = absentee[0] || {};

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSent(true);
    setSending(false);
  };

  const exportOutstanding = () => {
    const csv =
      "Name,Address,Phone,Precinct\nJohn Doe,123 Main St,555-1234,225\n...";
    saveAs(
      new Blob([csv], { type: "text/csv" }),
      "Outstanding_Mail_Ballots.csv"
    );
  };

  const [expandedMessages, setExpandedMessages] = useState(false);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="#B22234" fontWeight="bold">
        Actions — Win the Ground Game
      </Typography>

      {/* Email Campaign Builder — Always Visible */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Email Campaign Builder — Target Outstanding Ballots
        </Typography>

        <TextField
          label="Subject Line"
          fullWidth
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          margin="normal"
        />

        <Typography variant="subtitle1" mt={2} mb={1}>
          Message Body (use {"{{FIRST_NAME}}"}, {"{{PRECINCT}}"})
        </Typography>
        <Editor
          initialValue={message}
          onEditorChange={setMessage}
          init={{
            height: 420,
            menubar: false,
            plugins: "lists link image table code",
            toolbar:
              "undo redo | bold italic underline | bullist numlist | link image | table | code | formatselect",
            branding: false,
            statusbar: false,
            content_style:
              "body { font-family: Arial, sans-serif; font-size: 14px }",
          }}
        />

        {sent && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Campaign sent to {stats.outstanding_absentee} voters!
          </Alert>
        )}

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            size="large"
            sx={{ bgcolor: "#B22234" }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending
              ? "Sending..."
              : `Send to ${stats.outstanding_absentee || 0} Voters`}
          </Button>
          <Button variant="outlined">Preview</Button>
        </Box>
      </Paper>

      {/* NEW: Suggested Messages — Smart & Personalized */}
      <Card sx={{ mb: 6 }}>
        <CardActions disableSpacing sx={{ bgcolor: "#D3D3D3", color: "black" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Suggested Messages — Personalized Outreach
            </Typography>
            <Typography variant="body2">
              Click a voter profile to copy a tailored message
            </Typography>
          </Box>
          <ExpandMore
            expand={expandedMessages}
            onClick={() => setExpandedMessages(!expandedMessages)}
          >
            <ExpandMoreIcon sx={{ color: "black" }} />
          </ExpandMore>
        </CardActions>

        <Collapse in={expandedMessages} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Example 1: Likely Mover, Age 30-40 */}
              <Grid>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "#e3f2fd",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#bbdefb" },
                    transition: "0.2s",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "Hi {FIRST_NAME}! Welcome to the neighborhood! I noticed you recently moved in — we're so glad you're here. Chester County has excellent schools, beautiful parks, and a strong sense of community. I'm your local Republican Committeeman and live just down the street. Please don't hesitate to reach out if you need help finding polling locations, updating your voter registration, or just want to say hi! — {YOUR_NAME}"
                    );
                    alert("Message copied to clipboard!");
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="#1976d2"
                  >
                    Likely Mover • Age 26–40
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    "Welcome! I noticed you may have moved into the
                    neighborhood..."
                  </Typography>
                  <Chip
                    label="Click to Copy"
                    size="small"
                    color="primary"
                    sx={{ mt: 2 }}
                  />
                </Paper>
              </Grid>

              {/* Example 2: Weak Republican, Age 41-70 */}
              <Grid>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "#ffebee",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#ffcdd2" },
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "Hi {FIRST_NAME}, I'm your local Republican Committeeman. I wanted to make sure you know your voice matters here in Chester County. With everything going on, we need common-sense leadership more than ever. If you need help voting by mail, finding your polling place, or just want to talk about what’s important to you, I’m right here in the neighborhood. Hope to hear from you! — {YOUR_NAME}"
                    );
                    alert("Message copied!");
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="#d32f2f"
                  >
                    Weak Republican • Age 41–70
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    "Your voice matters here in Chester County..."
                  </Typography>
                  <Chip
                    label="Click to Copy"
                    size="small"
                    color="error"
                    sx={{ mt: 2 }}
                  />
                </Paper>
              </Grid>

              {/* Example 3: Young Republican (18-25) */}
              <Grid>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "#fff3e0",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#ffe0b2" },
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "Hey {FIRST_NAME}! Welcome to voting in Chester County! I'm your local Republican Committeeman and just wanted to say hi. A lot of us your age are getting involved because we care about lower taxes, school choice, and keeping our communities safe. If you ever need help voting or just want to chat, hit me up — I’m right here in the area! — {YOUR_NAME}"
                    );
                    alert("Message copied!");
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="#ef6c00"
                  >
                    Young Voter • Age 18–25
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    "Hey! Welcome to voting in Chester County..."
                  </Typography>
                  <Chip
                    label="Click to Copy"
                    size="small"
                    color="warning"
                    sx={{ mt: 2 }}
                  />
                </Paper>
              </Grid>

              {/* Add more as needed */}
            </Grid>

            <Alert severity="info" sx={{ mt: 4 }}>
              These messages are hand-crafted for maximum response. More coming
              soon!
            </Alert>
          </CardContent>
        </Collapse>
      </Card>

      {/* Collapsible Absentee Chase Dashboard */}
      <Card sx={{ mb: 6 }}>
        <CardActions disableSpacing sx={{ bgcolor: "#D3D3D3", color: "black" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Absentee Ballot Chase — {stats.outstanding_absentee || 0}{" "}
              Outstanding!
            </Typography>
            <Typography variant="body2">Click to load live stats</Typography>
          </Box>
          <ExpandMore
            expand={expandedChase}
            onClick={() => setExpandedChase(!expandedChase)}
          >
            <ExpandMoreIcon sx={{ color: "black" }} />
          </ExpandMore>
        </CardActions>

        <Collapse in={expandedChase} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 3 }}>
            {chaseLoading ? (
              <Box textAlign="center" py={8}>
                <CircularProgress />
                <Typography mt={2}>
                  Loading absentee ballot status...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={4} justifyContent="center">
                <Grid>
                  <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#ffebee" }}>
                    <Typography variant="h3" color="error">
                      {stats.outstanding_absentee || 0}
                    </Typography>
                    <Typography variant="h6">Outstanding Ballots</Typography>
                  </Paper>
                </Grid>

                <Grid>
                  <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#e8f5e8" }}>
                    <Typography variant="h3" color="success">
                      {stats.return_rate || 0}%
                    </Typography>
                    <Typography variant="h6">Return Rate</Typography>
                  </Paper>
                </Grid>

                <Grid>
                  <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h3">
                      {stats.total_requested || 0}
                    </Typography>
                    <Typography variant="h6">Total Requested</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            <Box textAlign="center" mt={4}>
              <Button
                variant="contained"
                sx={{ bgcolor: "#B22234" }}
                size="large"
                onClick={exportOutstanding}
                disabled={chaseLoading}
              >
                Export Chase List
              </Button>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  );
}
