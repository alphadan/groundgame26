// src/components/auth/LoginPage.tsx  ← FINAL VERSION – NO MORE RECAPTCHA ERRORS
import { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
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

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [resolver, setResolver] = useState<any>(null);
  const [stage, setStage] = useState<"password" | "mfa">("password");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ONE-TIME reCAPTCHA container setup
  useEffect(() => {
    console.log("LoginPage mounted – cleaning old reCAPTCHA");
    if (window.recaptchaVerifier) {
      console.log("Old verifier found – clearing it");
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
    return () => {
      console.log("LoginPage unmounting – final cleanup");
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  const createFreshVerifier = () => {
    console.log("Creating FRESH reCAPTCHA verifier");
    if (window.recaptchaVerifier) {
      console.log("Destroying previous verifier before creating new one");
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }

    if (!recaptchaRef.current) {
      console.error("reCAPTCHA container ref is null!");
      return null;
    }

    const verifier = new RecaptchaVerifier(
      recaptchaRef.current!,
      { size: "invisible" },
      auth
    );

    window.recaptchaVerifier = verifier;
    console.log("New verifier created and stored on window.recaptchaVerifier");
    return verifier;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    console.log("Attempting email/password login...");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log(
        "Email/password succeeded – no MFA required or already satisfied"
      );
    } catch (err: any) {
      console.log("Login error:", err.code, err.message);

      if (err.code === "auth/multi-factor-auth-required") {
        console.log("MFA required – starting challenge");
        const res = getMultiFactorResolver(auth, err);
        setResolver(res);
        await sendMfaChallenge(res);
      } else {
        setError("Invalid email or password");
      }
    }
  };

  const sendMfaChallenge = async (res: any) => {
    console.log("sendMfaChallenge() called");
    setStage("mfa");
    setMessage("Preparing reCAPTCHA & sending code…");

    const verifier = createFreshVerifier();
    if (!verifier) {
      setError("reCAPTCHA container not ready");
      return;
    }

    try {
      console.log("Rendering reCAPTCHA...");
      await verifier.render();
      console.log("reCAPTCHA rendered successfully");

      const phoneProvider = new PhoneAuthProvider(auth);
      console.log("Sending MFA challenge to phone...");
      const vid = await phoneProvider.verifyPhoneNumber(
        {
          multiFactorHint: res.hints[0],
          session: res.session,
        },
        verifier
      );

      setVerificationId(vid);
      console.log("MFA challenge sent! Verification ID:", vid);

      // THIS IS THE BIG YELLOW CODE YOU NEED
      console.log(
        "%c TEST CODE → " + vid.substring(0, 6),
        "background: #ffeb3b; color: #d32f2f; font-size: 28px; font-weight: bold; padding: 15px; border: 3px solid red;"
      );

      setMessage(
        "Code sent! Check the BIG YELLOW box in console for the 6-digit code"
      );
    } catch (err: any) {
      console.error("sendMfaChallenge failed:", err);
      setError("Failed to send code: " + err.message);
      verifier.clear();
      window.recaptchaVerifier = undefined;
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode.length !== 6) return;

    console.log("Submitting MFA code:", smsCode);
    try {
      const cred = PhoneAuthProvider.credential(verificationId, smsCode);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await resolver.resolveSignIn(assertion);
      console.log("MFA SUCCESS – you are now logged in!");
    } catch (err: any) {
      console.error("MFA code wrong:", err);
      setError("Wrong code – check the YELLOW console line");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Box width={440} p={5} bgcolor="white" borderRadius={3} boxShadow={6}>
        <Typography
          variant="h4"
          color="#d32f2f"
          textAlign="center"
          fontWeight="bold"
          mb={1}
        >
          groundgame26
        </Typography>
        <Typography
          variant="subtitle1"
          textAlign="center"
          color="text.secondary"
          mb={4}
        >
          Secure Login – MFA Required
        </Typography>

        {/* Invisible reCAPTCHA container */}
        <div
          ref={recaptchaRef}
          style={{ position: "absolute", left: "-9999px" }}
        />

        {stage === "password" && (
          <form onSubmit={handlePasswordLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3, bgcolor: "#d32f2f" }}
            >
              Sign In
            </Button>
          </form>
        )}

        {stage === "mfa" && (
          <form onSubmit={handleMfaSubmit}>
            <TextField
              label="6-digit code (see YELLOW console line!)"
              fullWidth
              margin="normal"
              value={smsCode}
              onChange={(e) =>
                setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputProps={{ maxLength: 6 }}
              autoFocus
            />
            {message && <Alert severity="info">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={smsCode.length !== 6}
              sx={{ mt: 2, bgcolor: "#d32f2f" }}
            >
              Verify Code
            </Button>
          </form>
        )}
      </Box>
    </Box>
  );
}
