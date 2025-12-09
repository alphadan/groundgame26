// src/App.tsx — FINAL: Your exact style + MapsPage fully integrated
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { multiFactor } from "firebase/auth";
import { auth } from "./lib/firebase";

import LoginPage from "./components/auth/LoginPage";
import EnrollMFAScreen from "./components/auth/EnrollMFAScreen";
import MainLayout from "./app/layout/MainLayout";

import ReportsPage from "./app/reports/ReportsPage";
import ActionsPage from "./app/actions/ActionsPage";
import MapsPage from "./app/maps/MapsPage";
import AnalysisPage from "./app/analysis/AnalysisPage";
import MyPrecinctsPage from "./app/dashboard/MyPrecinctsPage";
import VoterListPage from "./app/voters/VoterListPage";
import WalkListPage from "./app/walk/WalkListPage";
import NameSearchPage from "./app/voters/NameSearchPage";
import SettingsPage from "./app/settings/SettingsPage";

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
        <Typography ml={2}>Loading GroundGame26...</Typography>
      </Box>
    );
  }

  console.log("App.tsx: Render decision time");
  console.log("→ user exists?", !!user);

  if (!user) {
    console.log("No user → showing LoginPage");
    return <LoginPage />;
  }

  // User is logged in — check MFA
  const mfaFactors = multiFactor(user).enrolledFactors;
  console.log("→ enrolledFactors:", mfaFactors);
  console.log("→ has MFA?", mfaFactors.length > 0);

  if (mfaFactors.length === 0) {
    console.log("NO MFA → SHOWING ENROLLMENT SCREEN NOW");
    return <EnrollMFAScreen />;
  }

  console.log("MFA enrolled → showing main app with MainLayout");
  return (
    <MainLayout>
      <Routes>
        {/* Core Pages */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/maps" element={<MapsPage />} /> {/* ← Fully integrated */}
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        {/* Admin / User Pages */}
        <Route path="/my-precincts" element={<MyPrecinctsPage />} />
        <Route path="/voters" element={<VoterListPage />} />
        <Route path="/walk-lists" element={<WalkListPage />} />
        <Route path="/name-search" element={<NameSearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/reports" replace />} />
        <Route path="*" element={<Navigate to="/reports" replace />} />
      </Routes>
    </MainLayout>
  );
}
