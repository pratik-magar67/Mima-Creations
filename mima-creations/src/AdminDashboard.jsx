import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AdminLogin from "./AdminLogin";
import DashboardTab from "./DashboardTab";
import EnquiriesTab from "./EnquiriesTab";
import ProductsTab from "./ProductsTab";
import { CREAM, CREAM_DARK, INK, INK_SOFT, SAGE_DARK, ROSE } from "./adminTheme";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [newEnquiryCount, setNewEnquiryCount] = useState(0);

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

  useEffect(() => {
    if (!session) return;
    async function fetchCount() {
      const { count } = await supabase
        .from("enquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      setNewEnquiryCount(count || 0);
    }
    fetchCount();
  }, [session, tab]);

  if (checking) return null;
  if (!session) return <AdminLogin />;

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 md:px-10 py-4 border-b" style={{ borderColor: CREAM_DARK, background: "#fff" }}>
        <div>
          <p className="script text-lg leading-none" style={{ color: ROSE, fontFamily: "'Parisienne', cursive" }}>Mima Creations</p>
          <p className="text-sm" style={{ color: INK, fontFamily: "'Playfair Display', serif" }}>Admin dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs hidden sm:block" style={{ color: INK_SOFT }}>{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs px-4 py-2"
            style={{ background: CREAM_DARK, color: INK }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="px-6 md:px-10 pt-6">
        <div className="flex gap-2 mb-6">
          {[["dashboard", "Dashboard"], ["enquiries", "Enquiries"], ["products", "Products"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="text-sm px-5 py-2 flex items-center gap-2"
              style={{
                background: tab === id ? SAGE_DARK : "#fff",
                color: tab === id ? CREAM : INK_SOFT,
                border: `1px solid ${tab === id ? SAGE_DARK : CREAM_DARK}`,
              }}
            >
              {label}
              {id === "enquiries" && newEnquiryCount > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5"
                  style={{ background: ROSE, color: CREAM }}
                >
                  {newEnquiryCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {tab === "dashboard" && <DashboardTab onNavigate={setTab} />}
          {tab === "enquiries" && <EnquiriesTab />}
          {tab === "products" && <ProductsTab />}
        </div>
      </div>
    </div>
  );
}
