// ---------------------------------------------------------------------------
// Labels + helpers
// ---------------------------------------------------------------------------

export type QueueRow = {
  id: string;
  status: string;
  requestedAmount: number;
  calculatedDti: number;
  statusReason: string | null;
  createdAt: string;
};

import { DualView, Queues } from "@/src/lib/api";
import {
  ACCOUNT_AGE_OPTIONS,
  HOUSING_OPTIONS,
  LOAN,
} from "@/src/lib/constants";

export const ACCOUNT_AGE_LABEL: Record<string, string> = Object.fromEntries(
  ACCOUNT_AGE_OPTIONS.map((o) => [o.value, o.label]),
);

export const HOUSING_LABEL: Record<string, string> = Object.fromEntries(
  HOUSING_OPTIONS.map((o) => [o.value, o.label]),
);

// Statuses an underwriter may release funds from — mirrors the backend's
// RELEASABLE_STATUSES (src/common/constants.ts).
export const RELEASABLE_STATUSES = [
  "PENDING_VERIFICATION",
  "SIGN_LOAN_AGREEMENT",
  "MANUAL_REVIEW",
];

// Terminal / non-actionable statuses — Decline is hidden for these.
export const TERMINAL_STATUSES = ["DECLINED", "FUNDED", "BANK_REJECTED"];

// The work-queue statuses surfaced in the admin table's status filter. Mirrors
// the backend's QUEUE_STATUSES (underwriting.service).
export const QUEUE_STATUS_OPTIONS = [
  "PENDING_VERIFICATION",
  "MANUAL_REVIEW",
  "BANK_REJECTED",
  "PHONE_VERIFICATION_PENDING",
  "SIGN_LOAN_AGREEMENT",
  "DECLINED",
  "FUNDED",
];

// A flat list row built from the per-status queue buckets.
export function flattenQueues(queues: Queues): QueueRow[] {
  return Object.entries(queues).flatMap(([status, items]) =>
    items.map((it) => ({
      id: it.id,
      status,
      requestedAmount: it.requestedAmount,
      calculatedDti: it.calculatedDti,
      statusReason: it.statusReason,
      createdAt: it.createdAt,
    })),
  );
}

export function allBanksVerified(detail: DualView): boolean {
  const banks = detail.apiVerified.banks;
  return banks.length > 0 && banks.every((b) => b.apiVerified);
}

export function disbursementGate(detail: DualView): {
  ok: boolean;
  reason: string;
} {
  const status = detail.application.status;
  if (status === "FUNDED")
    return { ok: false, reason: "Already funded — disbursement is complete." };
  if (status === "DECLINED")
    return { ok: false, reason: "Application was declined." };
  if (status === "BANK_REJECTED")
    return { ok: false, reason: "Bank rejected — routing on banned list." };
  if (!RELEASABLE_STATUSES.includes(status))
    return {
      ok: false,
      reason: `Status ${status.replaceAll("_", " ").toLowerCase()} is not eligible for release.`,
    };
  if (!allBanksVerified(detail))
    return { ok: false, reason: "Bank not yet API-verified." };
  return { ok: true, reason: "Verified and clear for ACH disbursement." };
}

// ---------------------------------------------------------------------------
// Status badge mapping (falls back gracefully for any backend status)
// ---------------------------------------------------------------------------

export const STATUS_BADGE: Record<string, string> = {
  PENDING_VERIFICATION: "bg-blue-50 text-blue-700 border-blue-200",
  PHONE_VERIFICATION_PENDING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SIGN_LOAN_AGREEMENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  MANUAL_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  BANK_REJECTED: "bg-red-50 text-red-700 border-red-200",
  DECLINED: "bg-red-50 text-red-700 border-red-200",
  FUNDED: "bg-green-50 text-green-700 border-green-200",
};
export function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
export function dtiOver(dti: number): boolean {
  return Number.isFinite(dti) && dti >= LOAN.maxDtiPercent;
}
