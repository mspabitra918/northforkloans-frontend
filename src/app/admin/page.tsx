"use client";

import { clearSession, getSession, Session } from "@/src/lib/session";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AdminSearchRow, api, ApiError } from "@/src/lib/api";
import { formatUSD } from "@/src/lib/constants";
import {
  FaArrowsRotate,
  FaChevronRight,
  FaMagnifyingGlass,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import { dtiOver, QUEUE_STATUS_OPTIONS, statusLabel } from "./constants";
import { StatusBadge } from "./ui/StatusBadge";
import { Sidebar } from "./ui/Sidebar";
import { Topbar } from "./ui/TopBar";
import { useRouter, useSearchParams } from "next/navigation";

// Local (not UTC) YYYY-MM-DD for "today".
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function AdminUnderwritingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // --- Filter state derived from the URL (survives navigation + refresh) ----
  // `date` semantics: absent  -> default to today
  //                   "all"   -> no date filter
  //                   YYYY-MM-DD -> that day
  const qParam = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status") ?? "ALL";
  // const dateRaw = searchParams.get("date");
  // const dateParam = dateRaw === null ? todayStr() : dateRaw; // "all" | YYYY-MM-DD
  // const dateInputValue = dateParam === "all" ? "" : dateParam;
  // const effectiveDate = dateParam === "all" ? undefined : dateParam;

  const dateRaw = searchParams.get("date");

  // Show today's date in the input if no date is selected
  const dateInputValue =
    dateRaw === null ? todayStr() : dateRaw === "all" ? "" : dateRaw;

  // Date filter: default to today, "all" means no date filter, otherwise the
  // chosen YYYY-MM-DD.
  const effectiveDate =
    dateRaw === null ? todayStr() : dateRaw === "all" ? undefined : dateRaw;

  const [rows, setRows] = useState<AdminSearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The text input is local; it only commits to the URL (and fires the API)
  // when the user presses Enter or clicks the search icon.
  const [searchInput, setSearchInput] = useState(qParam);

  // Keep the input in sync if the URL's q changes (e.g. back button).
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // --- Auth guard ---------------------------------------------------------
  useEffect(() => {
    const s = getSession("admin");
    if (!s || s.role === "customer") {
      router.replace("/admin/login");
      return;
    }
    setSession(s);
    setReady(true);
  }, [router]);

  const token = session?.accessToken;

  // --- Merge a filter change into the URL (replace, to keep history clean) --
  const setFilters = useCallback(
    (next: { q?: string; status?: string; date?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `/admin?${qs}` : "/admin");
    },
    [router, searchParams],
  );

  // --- Data loading (driven by the URL-derived filters) -------------------
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // A free-text query searches globally: when `q` is present we ignore the
      // status/date filters. Otherwise we filter by status + date.
      const params = qParam.trim()
        ? { q: qParam }
        : statusParam !== "ALL"
          ? { status: statusParam }
          : effectiveDate
            ? { date: effectiveDate }
            : {};

      const data = await api.searchApplications(token, params);
      setRows(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession("admin");
        router.replace("/admin/login");
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Failed to load applications.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, qParam, statusParam, effectiveDate, router]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  function signOut() {
    clearSession("admin");
    router.replace("/admin/login");
  }

  function submitSearch() {
    // Commit the text the user just typed (status/date are committed live by
    // their own onChange handlers).
    setFilters({ q: searchInput.trim() || undefined });
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy-50 text-navy-500">
        <span className="flex items-center gap-2 text-sm">
          <FaArrowsRotate className="h-4 w-4 animate-spin" />
          Loading…
        </span>
      </div>
    );
  }

  const hasActiveFilters =
    qParam !== "" || statusParam !== "ALL" || dateRaw !== null;

  return (
    <div className="flex h-screen overflow-hidden bg-navy-50 text-navy-600">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          session={session}
          onRefresh={() => void load()}
          refreshing={loading}
          onSignOut={signOut}
        />

        {error && (
          <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
            <FaTriangleExclamation className="h-4 w-4" />
            {error}
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-navy-900">Applications</h2>
              <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-600">
                {rows.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Free-text search — commits on Enter */}
              <div className="relative">
                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder="Search name, phone, email, id… (Enter)"
                  className="w-72 rounded-lg border border-navy-200 bg-white py-2 pl-9 pr-9 text-sm text-navy-900 placeholder:text-navy-400 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setFilters({ q: undefined });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
                    aria-label="Clear search"
                  >
                    <FaXmark className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Date filter (default today; clear for all dates) */}
              <input
                type="date"
                value={dateInputValue}
                onChange={(e) => setFilters({ date: e.target.value || "all" })}
                className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              />

              {/* Status filter */}
              <select
                value={statusParam}
                onChange={(e) => setFilters({ status: e.target.value })}
                className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <option value="ALL">All statuses</option>
                {QUEUE_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    router.replace("/admin");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-600 transition hover:bg-navy-50"
                >
                  <FaXmark className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50/60 text-xs font-semibold uppercase tracking-wider text-navy-400">
                    <th className="px-5 py-3">Applicant</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Requested</th>
                    <th className="px-5 py-3 text-right">DTI</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-sm text-navy-400"
                      >
                        Loading applications…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-sm text-navy-400"
                      >
                        No applications match your filters.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const name =
                        `${row.firstName} ${row.lastName}`.trim() || "—";
                      return (
                        <tr
                          key={row.id}
                          onClick={() => router.push(`/admin/${row.id}`)}
                          className="cursor-pointer border-b border-navy-50 transition last:border-0 hover:bg-blue-50/50"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-navy-900">
                              {name}
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] text-navy-400">
                              {row.id}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-navy-700">
                              {row.email || "—"}
                            </div>
                            <div className="mt-0.5 text-xs text-navy-500">
                              {row.phone || "—"}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-navy-800">
                            {formatUSD(row.requestedAmount)}
                          </td>
                          <td
                            className={`px-5 py-4 text-right font-medium ${
                              dtiOver(row.calculatedDti)
                                ? "text-amber-600"
                                : "text-navy-500"
                            }`}
                          >
                            {Number.isFinite(row.calculatedDti)
                              ? `${row.calculatedDti.toFixed(0)}%`
                              : "—"}
                          </td>
                          <td className="px-5 py-4 text-xs text-navy-500">
                            {formatDate(row.createdAt)}
                          </td>
                          <td className="px-5 py-4 text-right text-navy-300">
                            <FaChevronRight className="ml-auto h-3.5 w-3.5" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminUnderwritingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-navy-50 text-navy-500">
          <span className="flex items-center gap-2 text-sm">
            <FaArrowsRotate className="h-4 w-4 animate-spin" />
            Loading…
          </span>
        </div>
      }
    >
      <AdminUnderwritingInner />
    </Suspense>
  );
}
