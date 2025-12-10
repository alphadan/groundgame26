// src/components/auth/LoginPage.tsx — FINAL WITH FORGOT PASSWORD + VOLUNTEER FORM
import { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Modal,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Volunteer Modal
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [volName, setVolName] = useState("");
  const [volEmail, setVolEmail] = useState("");
  const [volComment, setVolComment] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (
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

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError("Please enter your email");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err) {
      setResetSent(true); // Still show success — security best practice
    }
  };

  // Inside your component, add this function
  const handleVolunteerSubmit = async () => {
    if (!volName || !volEmail) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Execute reCAPTCHA
      const token = await window.recaptchaVerifier?.verify();

      // Call secure Cloud Function (we'll create this next)
      const submitVolunteer = httpsCallable(getFunctions(), "submitVolunteer");
      await submitVolunteer({
        name: volName,
        email: volEmail,
        comment: volComment || "",
        recaptchaToken: token,
      });

      // Success → show thank you page
      setShowThankYou(true);
    } catch (err: any) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* THANK YOU PAGE — AFTER SUCCESSFUL VOLUNTEER SUBMISSION */}
      {showThankYou ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="#f5f5f5"
          p={3}
        >
          <Box
            width={{ xs: "95%", sm: 500 }}
            p={6}
            bgcolor="white"
            borderRadius={3}
            boxShadow={6}
            textAlign="center"
          >
            {/* Logo */}
            <Box
              component="img"
              src="/icons/icon-blue-512x512.png"
              alt="GroundGame26"
              sx={{
                width: "100%",
                maxWidth: 320,
                height: "auto",
                mx: "auto",
                display: "block",
                mb: 1,
              }}
            />

            {/* Thank You Message */}
            <Typography
              variant="h4"
              fontWeight="bold"
              color="#B22234"
              mb={2}
              sx={{ fontSize: { xs: "1.8rem", sm: "2.2rem" } }}
            >
              Thank You!
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              lineHeight={1.7}
              mb={5}
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              Thank you for your interest in volunteering.
              <br />
              We will have an Area Captain reach out to you
              <br />
              within one business day.
            </Typography>

            {/* Return to Login Button */}
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setShowThankYou(false);
                setVolunteerOpen(false);
                setVolName("");
                setVolEmail("");
                setVolComment("");
              }}
              sx={{
                bgcolor: "#B22234",
                "&:hover": { bgcolor: "#8B1A1A" },
                px: 6,
                py: 1.8,
                fontSize: "1.1rem",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Return to Login
            </Button>
          </Box>
        </Box>
      ) : (
        /* MAIN LOGIN PAGE + MODALS */
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="#f5f5f5"
        >
          <Box width={420} p={5} bgcolor="white" borderRadius={3} boxShadow={4}>
            {/* Logo */}
            <Box
              component="img"
              src="/icons/icon-blue-512x512.png"
              alt="GroundGame26"
              sx={{
                width: "100%",
                maxWidth: 320,
                height: "auto",
                mx: "auto",
                display: "block",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              textAlign="center"
              fontWeight="bold"
              color="#212121"
              mb={4}
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              A Republican Get Out The Vote App
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

              {/* Forgot Password Link */}
              <Link
                component="button"
                variant="body2"
                onClick={() => setForgotOpen(true)}
                sx={{
                  display: "block",
                  textAlign: "right",
                  mt: 1,
                  color: "#B22234",
                }}
              >
                Forgot Password?
              </Link>

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
                  py: 1.8,
                  bgcolor: "#B22234",
                  "&:hover": { bgcolor: "#8B1A1A" },
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Want to Volunteer Link */}
            <Typography textAlign="center" mt={3}>
              <Link
                component="button"
                variant="body1"
                onClick={() => setVolunteerOpen(true)}
                sx={{
                  color: "#B22234",
                  fontWeight: "bold",
                  fontSize: "1.05rem",
                }}
              >
                Want to Volunteer?
              </Link>
            </Typography>
          </Box>

          {/* FORGOT PASSWORD MODAL */}
          <Dialog
            open={forgotOpen}
            onClose={() => setForgotOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ bgcolor: "#B22234", color: "white" }}>
              Reset Password
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {resetSent ? (
                <Alert severity="success">
                  If an account exists with that email, a password reset link
                  has been sent.
                </Alert>
              ) : (
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  sx={{ mt: 1 }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setForgotOpen(false)}>Close</Button>
              {!resetSent && (
                <Button
                  onClick={handleForgotPassword}
                  variant="contained"
                  sx={{ bgcolor: "#B22234" }}
                >
                  Send Reset Link
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* VOLUNTEER FORM MODAL */}
          <Dialog
            open={volunteerOpen}
            onClose={() => setVolunteerOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ bgcolor: "#B22234", color: "white" }}>
              Want to Volunteer?
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <TextField
                label="Full Name *"
                fullWidth
                margin="normal"
                value={volName}
                onChange={(e) => setVolName(e.target.value)}
              />
              <TextField
                label="Email *"
                type="email"
                fullWidth
                margin="normal"
                value={volEmail}
                onChange={(e) => setVolEmail(e.target.value)}
              />
              <TextField
                label="How would you like to help?"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                value={volComment}
                onChange={(e) => setVolComment(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setVolunteerOpen(false)}>Cancel</Button>
              <Button
                onClick={handleVolunteerSubmit}
                variant="contained"
                disabled={loading || !volName || !volEmail}
                sx={{ bgcolor: "#B22234", "&:hover": { bgcolor: "#8B1A1A" } }}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
}
