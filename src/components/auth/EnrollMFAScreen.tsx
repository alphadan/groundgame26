import { useState } from "react";
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function EnrollMFAScreen() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    setError("");
    if (!/^\+\d{8,15}$/.test(phone))
      return setError("Valid international format required (+1...)");

    const session = await multiFactor(auth.currentUser!).getSession();
    const phoneInfoOptions = { phoneNumber: phone, session };
    const provider = new PhoneAuthProvider(auth);
    try {
      const vid = await provider.verifyPhoneNumber(
        phoneInfoOptions,
        (window as any).recaptchaVerifier
      );
      setVerificationId(vid);
      setStage("code");
      setMessage("SMS sent – enter the 6-digit code");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      const cred = PhoneAuthProvider.credential(verificationId, code);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(auth.currentUser!).enroll(
        assertion,
        "Committee Member Phone"
      );
      window.location.reload(); // Redirect to dashboard
    } catch (err: any) {
      setError("Invalid code");
    }
  };

  return (
    <Box
      maxWidth={420}
      mx="auto"
      mt={8}
      p={4}
      bgcolor="white"
      borderRadius={2}
      boxShadow={3}
    >
      <Typography variant="h5" color="#d32f2f" textAlign="center" mb={3}>
        Complete Security Setup
      </Typography>
      <Typography textAlign="center" mb={4}>
        All committee members must add a real phone number for two-factor
        authentication.
      </Typography>

      {stage === "phone" && (
        <>
          <TextField
            label="Phone Number (e.g. +16105551234)"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            margin="normal"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2, bgcolor: "#d32f2f" }}
            onClick={handleSendCode}
          >
            Send Code
          </Button>
        </>
      )}

      {stage === "code" && (
        <>
          <TextField
            label="6-digit code"
            fullWidth
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputProps={{ maxLength: 6 }}
            autoFocus
          />
          {message && <Alert severity="info">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            variant="contained"
            fullWidth
            disabled={code.length !== 6}
            sx={{ mt: 2, bgcolor: "#d32f2f" }}
            onClick={handleVerify}
          >
            Verify & Finish
          </Button>
        </>
      )}
    </Box>
  );
}
