import React, { useState, useEffect } from "react";
import { Package, Inbox, CheckCircle2, Mail, PhoneCall, Clock } from "lucide-react";
import { supabase } from "../supabaseClient";
import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK, SAGE_LIGHT, ROSE } from "./adminTheme";
import { AdminLoadingState, AdminErrorState } from "./AdminStateViews";

function StatCard({ label, value, accent, icon: Icon }) {
  return <div className="p-3.5 sm:p-5" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}><div className="flex items-center justify-between mb-2 gap-1"><p className="text-[10px] sm:text-xs uppercase tracking-wide" style={{ color: INK_SOFT, letterSpacing: "0.06em" }}>{label}</p>{Icon && <span className="hidden sm:flex items-center justify-center w-7 h-7 shrink-0" style={{ background: SAGE_LIGHT, color: accent || SAGE_DARK }}><Icon size={14} /></span>}</div><p className="text-xl sm:text-3xl" style={{ color: accent || INK, fontFamily: "'Playfair Display', serif" }}>{value}</p></div>;
}

export default function DashboardTab({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({ totalProducts: 0, pendingEnquiries: 0, completedOrders: 0, newCount: 0, contactedCount: 0, inProgressCount: 0 });
  useEffect(() => { fetchStats(); }, []);
  async function fetchStats() {
    setLoading(true); setError(false);
    const { count: totalProducts, error: productsError } = await supabase.from("products").select("*", { count: "exact", head: true });
    const [{ count: newCount, error: newError }, { count: contactedCount, error: contactedError }, { count: inProgressCount, error: inProgressError }, { count: completedOrders, error: completedError }] = await Promise.all([
      supabase.from("enquiries").select("*", { count: "exact", head: true }).or("status.eq.new,status.is.null"), supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "contacted"), supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "in_progress"), supabase.from("enquiries").select("*", { count: "exact", head: true }).or("status.eq.completed,status.eq.done"),
    ]);
    const firstError = productsError || newError || contactedError || inProgressError || completedError;
    if (firstError) { console.error("Could not load dashboard stats:", firstError.message); setError(true); setLoading(false); return; }
    setStats({ totalProducts: totalProducts || 0, pendingEnquiries: newCount + contactedCount + inProgressCount, completedOrders, newCount, contactedCount, inProgressCount }); setLoading(false);
  }
  if (loading) return <AdminLoadingState message="Loading dashboard..." />;
  if (error) return <AdminErrorState message="We couldn't load your dashboard." onRetry={fetchStats} />;
  return <div><div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6"><StatCard label="Products" value={stats.totalProducts} icon={Package} /><StatCard label="Pending" value={stats.pendingEnquiries} accent={ROSE} icon={Inbox} /><StatCard label="Completed" value={stats.completedOrders} accent={SAGE_DARK} icon={CheckCircle2} /></div><p className="text-[10px] sm:text-xs uppercase tracking-wide mb-2" style={{ color: INK_SOFT, letterSpacing: "0.06em" }}>Enquiry breakdown</p><div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-8"><StatCard label="New" value={stats.newCount} icon={Mail} /><StatCard label="Contacted" value={stats.contactedCount} icon={PhoneCall} /><StatCard label="In progress" value={stats.inProgressCount} icon={Clock} /></div><div className="flex flex-col sm:flex-row gap-3"><button onClick={() => onNavigate("enquiries")} className="text-sm px-5 py-2.5 sm:py-2 w-full sm:w-auto" style={{ background: SAGE_DARK, color: "#F6F0E3" }}>View enquiries</button><button onClick={() => onNavigate("products")} className="text-sm px-5 py-2.5 sm:py-2 w-full sm:w-auto" style={{ background: CREAM_DARK, color: INK }}>Manage products</button></div></div>;
}
