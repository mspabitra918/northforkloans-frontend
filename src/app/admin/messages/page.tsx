"use client";

import { clearSession, getSession, Session } from "@/src/lib/session";
import { Suspense, useCallback, useEffect, useState } from "react";
import { api, ApiError, MessageRecord } from "@/src/lib/api";
import {
  FaArrowsRotate,
  FaEnvelope,
  FaMagnifyingGlass,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import { Sidebar } from "../ui/Sidebar";
import { Topbar } from "../ui/TopBar";
import { useRouter, useSearchParams } from "next/navigation";

// Local (not UTC) YYYY-MM-DD for "today".
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

function AdminMessagesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // --- Filter state derived from the URL (survives navigation + refresh) ----
  // `date` semantics: absent  -> default to today
  //                   "all"   -> no date filter
  //                   YYYY-MM-DD -> that day
  const subjectParam = searchParams.get("subject") ?? "";
  const dateRaw = searchParams.get("date");

  const dateInputValue =
    dateRaw === null ? todayStr() : dateRaw === "all" ? "" : dateRaw;
  const effectiveDate =
    dateRaw === null ? todayStr() : dateRaw === "all" ? undefined : dateRaw;

  const [rows, setRows] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MessageRecord | null>(null);

  // The subject input is local; it only commits to the URL (and fires the API)
  // when the user presses Enter or clicks the search icon.
  const [searchInput, setSearchInput] = useState(subjectParam);

  useEffect(() => {
    setSearchInput(subjectParam);
  }, [subjectParam]);

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

  const setFilters = useCallback(
    (next: { subject?: string; date?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `/admin/messages?${qs}` : "/admin/messages");
    },
    [router, searchParams],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMessages(token, {
        subject: subjectParam || undefined,
        date: effectiveDate,
      });
      setRows(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession("admin");
        router.replace("/admin/login");
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Failed to load messages.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, subjectParam, effectiveDate, router]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  function signOut() {
    clearSession("admin");
    router.replace("/admin/login");
  }

  function submitSearch() {
    setFilters({ subject: searchInput.trim() || undefined });
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

  const hasActiveFilters = subjectParam !== "" || dateRaw !== null;

  return (
    <div className="flex h-screen overflow-hidden bg-navy-50 text-navy-600">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          session={session}
          onRefresh={() => void load()}
          refreshing={loading}
          onSignOut={signOut}
          title="Messages"
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
              <h2 className="text-lg font-bold text-navy-900">
                Contact messages
              </h2>
              <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-600">
                {rows.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Subject search — commits on Enter */}
              <div className="relative">
                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder="Search subject… (Enter)"
                  className="w-72 rounded-lg border border-navy-200 bg-white py-2 pl-9 pr-9 text-sm text-navy-900 placeholder:text-navy-400 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setFilters({ subject: undefined });
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

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    router.replace("/admin/messages");
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
                    <th className="px-5 py-3">From</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Message</th>
                    <th className="px-5 py-3">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-navy-400"
                      >
                        Loading messages…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-navy-400"
                      >
                        No messages match your filters.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelected(row)}
                        className="cursor-pointer border-b border-navy-50 transition last:border-0 hover:bg-blue-50/50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-navy-900">
                            {row.full_name || "—"}
                          </div>
                          <div className="mt-0.5 text-xs text-navy-500">
                            {row.email}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-navy-800">
                          {row.subject || "—"}
                        </td>
                        <td className="max-w-xs px-5 py-4 text-navy-600">
                          <span className="line-clamp-2">{row.message}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-navy-500">
                          {formatDateTime(row.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Detail drawer */}
      {selected && (
        <MessageDetail message={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function MessageDetail({
  message,
  onClose,
}: {
  message: MessageRecord;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-navy-950/40"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <div className="flex items-center gap-2 text-navy-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FaEnvelope className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold">Message</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-navy-400 transition hover:text-navy-800"
            aria-label="Close"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6 text-sm">
          <Field label="From">{message.full_name}</Field>
          <Field label="Email">
            <a
              href={`mailto:${message.email}`}
              className="text-blue-600 hover:underline"
            >
              {message.email}
            </a>
          </Field>
          <Field label="Phone">
            <a
              href={`tel:${message.number}`}
              className="text-blue-600 hover:underline"
            >
              {message.number || "—"}
            </a>
          </Field>
          <Field label="Subject">{message.subject}</Field>
          <Field label="Received">{formatDateTime(message.created_at)}</Field>
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-navy-400">
              Message
            </div>
            <p className="whitespace-pre-wrap rounded-xl border border-navy-100 bg-navy-50/60 px-4 py-3 leading-relaxed text-navy-800">
              {message.message}
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-navy-100 px-6 py-4">
          <a
            href={`mailto:${message.email}?subject=${encodeURIComponent(
              `Re: ${message.subject}`,
            )}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FaEnvelope className="h-4 w-4" />
            Reply by email
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-navy-400">
        {label}
      </div>
      <div className="font-medium text-navy-800">{children}</div>
    </div>
  );
}

export default function AdminMessagesPage() {
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
      <AdminMessagesInner />
    </Suspense>
  );
}
