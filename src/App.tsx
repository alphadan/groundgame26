// src/App.tsx — MAX DEBUG VERSION
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { multiFactor } from "firebase/auth";
import { auth } from "./lib/firebase";
import LoginPage from "./components/auth/LoginPage";
import EnrollMFAScreen from "./components/auth/EnrollMFAScreen";
import MainLayout from "./app/layout/MainLayout";
import ReportsPage from "./app/reports/ReportsPage";
import ManageTeamPage from "./app/admin/ManageTeamPage";
import MyPrecinctsPage from "./app/dashboard/MyPrecinctsPage";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App.tsx: Setting up auth listener...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AUTH STATE CHANGED!");
      console.log("→ currentUser:", currentUser);
      console.log("→ email:", currentUser?.email || "none");
      console.log("→ uid:", currentUser?.uid || "none");

      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      console.log("App.tsx: Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  if (loading) {
    console.log("App.tsx: Still loading auth state...");
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography ml={2}>Loading...</Typography>
      </Box>
    );
  }

  console.log("App.tsx: Render decision time");
  console.log("→ user exists?", !!user);
  if (user) {
    console.log("→ user.email:", user.email);
    const mfaFactors = multiFactor(user).enrolledFactors;
    console.log("→ enrolledFactors:", mfaFactors);
    console.log("→ has MFA?", mfaFactors.length > 0);

    if (mfaFactors.length === 0) {
      console.log("NO MFA → SHOWING ENROLLMENT SCREEN NOW");
      return <EnrollMFAScreen />;
    } else {
      console.log("MFA already enrolled → showing main app");
      return (
        <MainLayout>
          <Routes>
            <Route path="/reports" element={<ReportsPage />} />
            <Route
              path="/analysis"
              element={<div>Analysis – Coming Soon</div>}
            />
            <Route path="/actions" element={<div>Actions – Coming Soon</div>} />
            <Route path="*" element={<Navigate to="/reports" replace />} />
            <Route path="/manage-team" element={<ManageTeamPage />} />
            <Route path="/my-precincts" element={<MyPrecinctsPage />} />
          </Routes>
        </MainLayout>
      );
    }
  }

  console.log("No user → showing LoginPage");
  return <LoginPage />;
}
