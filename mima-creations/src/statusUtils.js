// Shared helpers for enquiry status values.
// Kept in one place so EnquiriesTab and DashboardTab (and anything else
// that reads enquiry.status) can't drift out of sync.

/**
 * Normalizes a raw enquiry status value.
 * - Defaults missing/empty status to "new".
 * - Maps the legacy "done" value to "completed".
 */
export function normalizeStatus(status) {
  const normalized = status || "new";
  return normalized === "done" ? "completed" : normalized;
}