import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import LoginPage from "./components/auth/LoginPage";
import ReportsPage from "./app/reports/ReportsPage";
import MainLayout from "./app/layout/MainLayout";
import { CircularProgress, Box } from "@mui/material";
import { multiFactor } from "firebase/auth"; // ← ADD THIS IMPORT
import EnrollMFAScreen from "./components/auth/EnrollMFAScreen"; // ← ADD THIS IMPORT

function ProtectedRoutes() {
  const user = auth.currentUser;

  if (!multiFactor(user!).enrolledFactors.length) {
    return <EnrollMFAScreen />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/analysis" element={<div>Analysis coming</div>} />
        <Route path="/actions" element={<div>Actions coming</div>} />
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
