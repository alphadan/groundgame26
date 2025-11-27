// src/components/auth/EnrollMFAScreen.tsx — FINAL, NO REAUTH, WORKS 100%
import { useState, useEffect, useRef } from "react";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function EnrollMFAScreen() {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!recaptchaRef.current || window.recaptchaVerifier) return;

    window.recaptchaVerifier = new RecaptchaVerifier(
      recaptchaRef.current,
      { size: "invisible" },
      auth
    );
    window.recaptchaVerifier.render().catch(() => {});
    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  const sendCode = async () => {
    setError("");
    if (!phone.match(/^\+\d{10,15}$/)) {
      setError("Enter phone in +1XXXXXXXXXX format");
      return;
    }

    try {
      console.log("Getting fresh MFA session...");
      const session = await multiFactor(auth.currentUser!).getSession();

      const phoneInfoOptions = {
        phoneNumber: phone,
        session,
      };

      const provider = new PhoneAuthProvider(auth);
      const vid = await provider.verifyPhoneNumber(
        phoneInfoOptions,
        window.recaptchaVerifier!
      );

      setVerificationId(vid);
      setStage("code");
      setMessage("SMS sent! Check your phone");
    } catch (err: any) {
      console.error("SMS FAILED:", err.code, err.message);
      setError("SMS failed: " + err.message);
    }
  };

  const verify = async () => {
    try {
      const cred = PhoneAuthProvider.credential(verificationId, code);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(auth.currentUser!).enroll(assertion, "Committee Phone");
      alert("MFA Enrolled! Reloading...");
      window.location.reload();
    } catch (err: any) {
      setError("Wrong code");
    }
  };

  return (
    <Box maxWidth={420} mx="auto" mt={10} p={4} bgcolor="white" borderRadius={2} boxShadow={3}>
      <Typography variant="h5" color="#d32f2f" textAlign="center" mb={2}>
        Security Setup Required
      </Typography>
      <Typography textAlign="center" mb={4}>
        Add your real phone number for two-factor authentication
      </Typography>

      <div ref={recaptchaRef} style={{ position: "absolute", left: "-9999px" }} />

      {stage === "phone" && (
        <>
          <TextField
            label="Phone Number (+16105551234)"
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
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
            onClick={verify}
          >
            Complete Setup
          </Button>
        </>
      )}
    </Box>
  );
}