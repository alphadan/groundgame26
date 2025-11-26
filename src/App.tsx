import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import LoginPage from "./components/auth/LoginPage";
import MainLayout from "./app/layout/MainLayout";
import { CircularProgress, Box } from "@mui/material";

function ProtectedRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route
          path="/reports"
          element={<div>Reports Page – MVP coming next</div>}
        />
        <Route path="/analysis" element={<div>Analysis Page</div>} />
        <Route path="/actions" element={<div>Actions Page</div>} />
        <Route path="*" element={<Navigate to="/reports" />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return user ? <ProtectedRoutes /> : <LoginPage />;
}
