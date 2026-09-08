import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK, SAGE_LIGHT, ROSE } from "./adminTheme";
import { AdminLoadingState, AdminErrorState } from "./AdminStateViews";

function StatCard({ label, value, accent }) {
  return (
    <div className="p-5" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}>
      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: INK_SOFT, letterSpacing: "0.08em" }}>
        {label}
      </p>
      <p className="text-3xl" style={{ color: accent || INK, fontFamily: "'Playfair Display', serif" }}>
        {value}
      </p>
    </div>
  );
}

export default function DashboardTab({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingEnquiries: 0,
    completedOrders: 0,
    newCount: 0,
    contactedCount: 0,
    inProgressCount: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(false);

    const { count: totalProducts, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const [
      { count: newCount, error: newError },
      { count: contactedCount, error: contactedError },
      { count: inProgressCount, error: inProgressError },
      { count: completedOrders, error: completedError },
    ] = await Promise.all([
      supabase.from("enquiries").select("*", { count: "exact", head: true }).or("status.eq.new,status.is.null"),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "contacted"),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).or("status.eq.completed,status.eq.done"),
    ]);

    const firstError = productsError || newError || contactedError || inProgressError || completedError;
    if (firstError) {
      console.error("Could not load dashboard stats:", firstError.message);
      setError(true);
      setLoading(false);
      return;
    }

    setStats({
      totalProducts: totalProducts || 0,
      pendingEnquiries: newCount + contactedCount + inProgressCount,
      completedOrders,
      newCount,
      contactedCount,
      inProgressCount,
    });
    setLoading(false);
  }

  if (loading) return <AdminLoadingState message="Loading dashboard..." />;
  if (error) return <AdminErrorState message="We couldn't load your dashboard." onRetry={fetchStats} />;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Pending Enquiries" value={stats.pendingEnquiries} accent={ROSE} />
        <StatCard label="Completed Orders" value={stats.completedOrders} accent={SAGE_DARK} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="New" value={stats.newCount} />
        <StatCard label="Contacted" value={stats.contactedCount} />
        <StatCard label="In Progress" value={stats.inProgressCount} />
      </div>

      <div className="flex gap-3">
        <button onClick={() => onNavigate("enquiries")} className="text-sm px-5 py-2" style={{ background: SAGE_DARK, color: "#F6F0E3" }}>
          View enquiries
        </button>
        <button onClick={() => onNavigate("products")} className="text-sm px-5 py-2" style={{ background: CREAM_DARK, color: INK }}>
          Manage products
        </button>
      </div>
    </div>
  );
}