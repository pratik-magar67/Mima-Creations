import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AdminLogin from "./AdminLogin";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return null;
  if (!session) return <AdminLogin />;

  return (
    <div style={{ minHeight: "100vh", background: "#F6F0E3", padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", color: "#2B2620" }}>Mima Creations — Dashboard</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ padding: "8px 16px", background: "#ECE2CC", border: "none", fontSize: "13px" }}
        >
          Sign out
        </button>
      </div>
      <p style={{ color: "#6B6357" }}>Logged in as {session.user.email}. Enquiries and Products tabs go here next.</p>
    </div>
  );
}