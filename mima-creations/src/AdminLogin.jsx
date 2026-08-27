import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { CREAM, INK, INK_SOFT, SAGE_DARK, ROSE, CREAM_DARK } from "./adminTheme";

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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: CREAM }}>
      <form onSubmit={handleLogin} className="w-full max-w-sm p-8" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}>
        <p className="script text-2xl mb-1" style={{ color: ROSE, fontFamily: "'Parisienne', cursive" }}>Mima Creations</p>
        <h1 className="text-xl mb-6" style={{ color: INK, fontFamily: "'Playfair Display', serif" }}>Admin sign in</h1>

        <label className="block mb-4">
          <span className="text-xs" style={{ color: INK_SOFT }}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border text-sm"
            style={{ borderColor: CREAM_DARK }}
          />
        </label>
        <label className="block mb-5">
          <span className="text-xs" style={{ color: INK_SOFT }}>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-2 border text-sm"
            style={{ borderColor: CREAM_DARK }}
          />
        </label>

        {error && <p className="text-sm mb-4" style={{ color: "#B3261E" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-sm"
          style={{ background: SAGE_DARK, color: CREAM }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}