"use client";

import { clearSession, getSession, Session } from "@/src/lib/session";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, DualView } from "@/src/lib/api";
import { formatUSD } from "@/src/lib/constants";
import {
  FaArrowLeft,
  FaArrowsRotate,
  FaCircleCheck,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import { disbursementGate, TERMINAL_STATUSES } from "../constants";
import { Sidebar } from "../ui/Sidebar";
import { Topbar } from "../ui/TopBar";
import { DetailPanel } from "../ui/DetailPanel";
import { useParams, useRouter } from "next/navigation";

export default function AdminApplicationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const [detail, setDetail] = useState<DualView | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  // --- Data loading -------------------------------------------------------
  const loadDetail = useCallback(async () => {
    if (!token || !id) return;
    setLoadingDetail(true);
    setError(null);
    try {
      const dv = await api.getDualView(id, token);
      setDetail(dv);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession("admin");
        router.replace("/admin/login");
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Failed to load application.",
      );
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [token, id, router]);

  useEffect(() => {
    if (ready) void loadDetail();
  }, [ready, loadDetail]);

  function signOut() {
    clearSession("admin");
    router.replace("/admin/login");
  }

  // --- Actions ------------------------------------------------------------
  async function releaseFunds() {
    if (!token || !detail) return;
    setBusy(true);
    setError(null);
    try {
      await api.releaseFunds(detail.application.id, token);
      const name =
        `${detail.selfReported.firstName} ${detail.selfReported.lastName}`.trim();
      setToast(
        `${formatUSD(detail.application.requestedAmount)} released to ${name} via ACH.`,
      );
      setConfirming(false);
      await loadDetail();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fund release failed.");
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    if (!token || !detail || !declineReason.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.decline(detail.application.id, token, declineReason.trim());
      setToast(`Application ${detail.application.id} declined.`);
      setDeclining(false);
      setDeclineReason("");
      await loadDetail();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Decline failed.");
    } finally {
      setBusy(false);
    }
  }

  async function advanceToSign() {
    if (!token || !detail) return;
    setBusy(true);
    setError(null);
    try {
      await api.advance(detail.application.id, token, "SIGN_LOAN_AGREEMENT");
      setToast(`Application ${detail.application.id} moved to Sign Agreement.`);
      await loadDetail();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not advance application.",
      );
    } finally {
      setBusy(false);
    }
  }

  // --- Derived ------------------------------------------------------------
  const gate = detail ? disbursementGate(detail) : null;
  const isTerminal = detail
    ? TERMINAL_STATUSES.includes(detail.application.status)
    : true;

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

  return (
    <div className="flex h-screen overflow-hidden bg-navy-50 text-navy-600">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          session={session}
          onRefresh={() => void loadDetail()}
          refreshing={loadingDetail}
          onSignOut={signOut}
        />

        {toast && (
          <div className="flex items-center justify-between gap-3 border-b border-green-200 bg-green-50 px-6 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-green-800">
              <FaCircleCheck className="h-4 w-4" />
              {toast}
            </span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-green-700 hover:text-green-900"
              aria-label="Dismiss"
            >
              <FaXmark className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
            <FaTriangleExclamation className="h-4 w-4" />
            {error}
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-navy-500 transition hover:text-navy-800"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
            Back to applications
          </button>

          {loadingDetail && !detail ? (
            <div className="rounded-2xl border border-navy-100 bg-white p-10 text-center text-sm text-navy-400 shadow-card">
              Loading application…
            </div>
          ) : !detail ? (
            <div className="rounded-2xl border border-navy-100 bg-white p-10 text-center text-sm text-navy-400 shadow-card">
              Application not found.
            </div>
          ) : (
            <DetailPanel
              detail={detail}
              gate={gate!}
              isTerminal={isTerminal}
              busy={busy}
              confirming={confirming}
              setConfirming={setConfirming}
              onRelease={releaseFunds}
              declining={declining}
              setDeclining={setDeclining}
              declineReason={declineReason}
              setDeclineReason={setDeclineReason}
              onDecline={decline}
              onAdvanceSign={advanceToSign}
            />
          )}
        </main>
      </div>
    </div>
  );
}
