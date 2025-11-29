// src/components/auth/EnrollMFAScreen.tsx — FINAL, WORKS 100%
import { useState, useEffect } from "react";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  signOut,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";

export default function EnrollMFAScreen() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Create reCAPTCHA exactly once
  useEffect(() => {
    const verifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
    (window as any).recaptchaVerifier = verifier;
    verifier.render().catch(() => {});
    return () => verifier.clear();
  }, []);

  const sendCode = async () => {
    setError("");
    if (!phone.match(/^\+\d{10,15}$/))
      return setError("Use +1XXXXXXXXXX format");

    try {
      const session = await multiFactor(auth.currentUser!).getSession();
      const phoneInfoOptions = { phoneNumber: phone, session };
      const provider = new PhoneAuthProvider(auth);

      const vid = await provider.verifyPhoneNumber(
        phoneInfoOptions,
        (window as any).recaptchaVerifier
      );

      setVerificationId(vid);
      setStage("code");
      setMessage("SMS sent! Check your phone");
    } catch (err: any) {
      console.error("SMS FAILED:", err);
      if (err.code === "auth/requires-recent-login") {
        setError("Session expired. Please log out and log in again.");
      } else {
        setError("Failed: " + (err.message || "Unknown error"));
      }
    }
  };

  const verify = async () => {
    if (code.length !== 6) return;

    try {
      const cred = PhoneAuthProvider.credential(verificationId, code);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(auth.currentUser!).enroll(assertion, "Committee Phone");
      alert("MFA Enrolled! Welcome to groundgame26");
      window.location.reload();
    } catch (err: any) {
      setError("Wrong code");
    }
  };

  return (
    <Box
      maxWidth={460}
      mx="auto"
      mt={8}
      p={4}
      bgcolor="white"
      borderRadius={2}
      boxShadow={4}
    >
      <Typography variant="h5" color="#d32f2f" textAlign="center" mb={2}>
        Security Setup Required
      </Typography>
      <Typography textAlign="center" mb={4}>
        Add your real phone number for two-factor authentication
      </Typography>

      <div id="recaptcha-container" />

      {stage === "phone" && (
        <>
          <TextField
            label="Phone Number (+16105551234)"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            margin="normal"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2, bgcolor: "#d32f2f" }}
            onClick={sendCode}
          >
            Send SMS Code
          </Button>
        </>
      )}

      {stage === "code" && (
        <>
          <TextField
            label="6-digit code from SMS"
            fullWidth
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputProps={{ maxLength: 6 }}
            autoFocus
          />
          {message && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            fullWidth
            disabled={code.length !== 6}
            sx={{ mt: 2, bgcolor: "#d32f2f" }}
            onClick={verify}
          >
            Complete Setup
          </Button>
        </>
      )}

      <Button
        variant="outlined"
        color="error"
        fullWidth
        sx={{ mt: 3 }}
        onClick={() => signOut(auth).then(() => window.location.reload())}
      >
        Log Out
      </Button>
    </Box>
  );
}
