import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F0E3" }}>
      <form onSubmit={handleLogin} style={{ background: "#fff", padding: "32px", width: "320px", border: "1px solid #ECE2CC" }}>
        <h1 style={{ fontSize: "20px", marginBottom: "20px", color: "#2B2620" }}>Mima Creations — Admin</h1>
        <label style={{ display: "block", marginBottom: "12px" }}>
          <span style={{ fontSize: "13px", color: "#6B6357" }}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginTop: "4px", padding: "8px", border: "1px solid #ccc" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "20px" }}>
          <span style={{ fontSize: "13px", color: "#6B6357" }}>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginTop: "4px", padding: "8px", border: "1px solid #ccc" }}
          />
        </label>
        {error && <p style={{ color: "#B3261E", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", background: "#5F7A5C", color: "#fff", border: "none" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}