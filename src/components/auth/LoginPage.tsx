// src/components/auth/LoginPage.tsx — MAXIMUM DEBUG LOGS
import { useState, useEffect, useRef } from "react";
import { signInWithEmailAndPassword, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("LoginPage: Setting up invisible reCAPTCHA");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("LOGIN BUTTON CLICKED");
    console.log("Email being sent:", email);
    console.log(
      "Password being sent: ***HIDDEN*** (length:",
      password.length,
      ")"
    );

    try {
      console.log("Calling Firebase signInWithEmailAndPassword...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("FIREBASE LOGIN SUCCESS!");
      console.log("User UID:", userCredential.user.uid);
      console.log("User email:", userCredential.user.email);
    } catch (err: any) {
      console.log("FIREBASE LOGIN FAILED");
      console.log("Error code:", err.code);
      console.log("Error message:", err.message);

      if (err.code === "auth/multi-factor-auth-required") {
        console.log(
          "MFA REQUIRED — this is expected when user has enrolled phone"
        );
        console.log(
          "App.tsx will now check MFA status and redirect to enrollment if needed"
        );
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password");
      } else {
        setError("Login failed: " + err.message);
      }
    } finally {
      setLoading(false);
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
      <Box width={420} p={5} bgcolor="white" borderRadius={3} boxShadow={4}>
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
          Secure Committee Portal
        </Typography>

        <div
          ref={recaptchaRef}
          style={{ position: "absolute", left: "-9999px" }}
        />

        <form onSubmit={handleLogin}>
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

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              bgcolor: "#d32f2f",
              "&:hover": { bgcolor: "#b71c1c" },
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}
