import React, { useState, useEffect } from "react";
import { Home, Inbox, Package, MessageSquare } from "lucide-react";
import { supabase } from "../supabaseClient";
import AdminLogin from "./AdminLogin";
import DashboardTab from "./DashboardTab";
import EnquiriesTab from "./EnquiriesTab";
import ProductsTab from "./ProductsTab";
import FeedbackTab from "./FeedbackTab";
import { CREAM, CREAM_DARK, INK, INK_SOFT, SAGE_DARK, ROSE } from "./adminTheme";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "products", label: "Products", icon: Package },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    async function fetchCount() {
      const { count } = await supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new");
      setNewEnquiryCount(count || 0);
    }
    fetchCount();
  }, [session, tab]);

  if (checking) return null;
  if (!session) return <AdminLogin />;
  const activeLabel = TABS.find((t) => t.id === tab)?.label || "";

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3 sm:py-4 border-b" style={{ borderColor: CREAM_DARK, background: "#fff" }}>
        <div className="min-w-0">
          <p className="script text-base sm:text-lg leading-none truncate" style={{ color: ROSE, fontFamily: "'Parisienne', cursive" }}>Mima Creations</p>
          <p className="text-xs sm:text-sm truncate" style={{ color: INK, fontFamily: "'Playfair Display', serif" }}>Admin &middot; {activeLabel}</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <span className="text-xs hidden md:block" style={{ color: INK_SOFT }}>{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} className="text-xs px-3 sm:px-4 py-2 whitespace-nowrap" style={{ background: CREAM_DARK, color: INK }}>Sign out</button>
        </div>
      </header>
      <div className="hidden sm:block px-6 md:px-10 pt-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className="text-sm px-5 py-2 flex items-center gap-2" style={{ background: tab === id ? SAGE_DARK : "#fff", color: tab === id ? CREAM : INK_SOFT, border: `1px solid ${tab === id ? SAGE_DARK : CREAM_DARK}` }}>
              <Icon size={15} />{label}
              {id === "enquiries" && newEnquiryCount > 0 && <span className="text-xs px-1.5 py-0.5" style={{ background: ROSE, color: CREAM }}>{newEnquiryCount}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-10 pt-4 sm:pt-6"><div className="pb-24 sm:pb-16">
        {tab === "dashboard" && <DashboardTab onNavigate={setTab} />}
        {tab === "enquiries" && <EnquiriesTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "feedback" && <FeedbackTab />}
      </div></div>
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 flex" style={{ background: "#fff", borderTop: `1px solid ${CREAM_DARK}`, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5" style={{ color: tab === id ? SAGE_DARK : INK_SOFT }}>
            <span className="relative inline-flex"><Icon size={20} strokeWidth={tab === id ? 2.3 : 1.8} />{id === "enquiries" && newEnquiryCount > 0 && <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center text-[10px] leading-none px-1" style={{ background: ROSE, color: CREAM, minWidth: "15px", height: "15px" }}>{newEnquiryCount}</span>}</span>
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
