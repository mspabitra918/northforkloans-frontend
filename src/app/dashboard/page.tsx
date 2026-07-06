"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowRightLong,
  FaArrowRightFromBracket,
  FaCheck,
  FaCircle,
  FaRegClock,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import {
  BRAND,
  LOAN,
  LIFECYCLE_STAGES,
  ACCOUNT_AGE_OPTIONS,
  formatUSD,
  telHref,
} from "@/src/lib/constants";
import {
  api,
  ApiError,
  type ApplicationStatusView,
  type ApplicationListItem,
  type AccountAge,
} from "@/src/lib/api";
import { clearSession, getSession } from "@/src/lib/session";
import { SignAgreementBlock } from "@/src/components/marketing/SignAgreementBlock";

// Per-stage "next action" copy keyed off the backend status. Only the current
// status's CTA is surfaced. SIGN_LOAN_AGREEMENT is interactive (e-sign).
const NEXT_ACTIONS: Record<
  string,
  { heading: string; body: string; cta: string }
> = {
  APPLICATION_SUBMITTED: {
    heading: "Connect your bank to continue",
    body: "Securely link your bank account so we can verify your details and keep your application moving.",
    cta: "Verify your bank",
  },
  BANK_VERIFICATION_PENDING: {
    heading: "Verify your bank to continue",
    body: "We need to confirm your bank account before we can move forward.",
    cta: "Verify your bank",
  },
  PENDING_VERIFICATION: {
    heading: "You're pre-qualified — verification next",
    body: "Great news. We're verifying your details and a specialist may reach out to confirm a few things.",
    cta: "View details",
  },
  PHONE_VERIFICATION_PENDING: {
    heading: "A specialist will call you shortly",
    body: "Keep your phone handy — a loan specialist needs to confirm a few details before you sign.",
    cta: "View call details",
  },
  MANUAL_REVIEW: {
    heading: "Your application is under review",
    body: "Our underwriting team is taking a closer look. We'll be in touch within one business day.",
    cta: "View details",
  },
  SIGN_LOAN_AGREEMENT: {
    heading: "Review & e-sign your agreement",
    body: "Your loan agreement is ready. Review the terms and e-sign from this portal to move toward funding.",
    cta: "Review & e-sign",
  },
  FUNDED: {
    heading: "Your funds are on the way",
    body: "Your loan has been funded and sent via ACH — funds typically arrive within 24 hours.",
    cta: "View loan details",
  },
};

export const formatPhoneNumber = (phone: string) => {
  let digits = phone.replace(/\D/g, "");

  // Remove leading country code (1) if present
  if (digits.startsWith("1") && digits.length === 11) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  function signOut() {
    clearSession("user");
    router.replace("/login");
  }

  const [app, setApp] = useState<ApplicationStatusView | null>(null);
  // The full list of the user's applications, shown when no `id` is selected.
  const [apps, setApps] = useState<ApplicationListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  // True while we're redirecting an unauthenticated visitor to /login — keeps
  // the loading UI up so the error state doesn't flash before navigation.
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Reveals the review-and-sign agreement document once the borrower clicks
  // "Review & e-sign" (status SIGN_LOAN_AGREEMENT).
  const [showAgreement, setShowAgreement] = useState(false);
  // No application to show: neither an `id` in the URL nor a signed-in user.
  const [noApplication, setNoApplication] = useState(false);
  // Controls the "Update bank details" popup shown after BANK_REJECTED. The
  // "update bank" email link deep-links in with ?bankModalOpen=open, so seed
  // the initial open state from the URL once (see the cleanup effect below).
  const [bankModalOpen, setBankModalOpen] = useState(
    () => searchParams.get("bankModalOpen") === "open",
  );

  const pathname = usePathname();

  const handleOpenBankModal = () => setBankModalOpen(true);

  const handleCloseBankModal = () => setBankModalOpen(false);

  // The modal open state is seeded from ?bankModalOpen=open above (the email
  // deep-link). Treat that flag as one-shot: once consumed, strip it from the
  // address bar via history.replaceState (not router.replace) so the URL is
  // cleaned without a Next navigation. Keeping the modal state independent of
  // the URL means closing it sticks and links like "All applications" aren't
  // blocked or re-opened by a lingering param.
  const bankDeepLinkConsumed = useRef(false);
  useEffect(() => {
    if (bankDeepLinkConsumed.current) return;
    if (searchParams.get("bankModalOpen") === "open") {
      bankDeepLinkConsumed.current = true;

      const params = new URLSearchParams(searchParams.toString());
      params.delete("bankModalOpen");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query ? `${pathname}?${query}` : pathname,
      );
    }
  }, [searchParams, pathname]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoApplication(false);

    // Every dashboard view requires a signed-in customer. Without a session
    // there's no token to authorize the request with, so send them to login —
    // even when an `id` is present in the URL. This is the client-side half of
    // the fix; the backend independently enforces auth + ownership.
    const session = getSession("user");
    if (!session) {
      setRedirecting(true);
      router.replace("/login");
      return;
    }

    try {
      // With an explicit application id from the URL, show that application's
      // detail/lifecycle view. Otherwise list every application for the
      // logged-in user so they can pick one.
      if (id) {
        setApp(await api.getApplication(id, session.accessToken));
      } else {
        const list = await api.getApplicationsByUser(
          session.phone,
          session.accessToken,
        );
        if (list.length === 0) {
          setApps(null);
          setNoApplication(true);
          return;
        }
        setApp(null);
        setApps(list);
      }
    } catch (err) {
      // A signed-in user who hasn't applied yet gets the friendly empty state
      // rather than an error.
      if (err instanceof ApiError && err.status === 404) {
        setApp(null);
        setNoApplication(true);
      } else if (err instanceof ApiError && err.status === 403) {
        // The id in the URL belongs to someone else's application.
        setError("You don't have access to this application.");
      } else if (err instanceof ApiError && err.status === 401) {
        // Expired/invalid token — force a fresh login.
        clearSession("user");
        setRedirecting(true);
        router.replace("/login");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "We couldn't load your application.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  // --- Empty / error states ---
  if (loading || redirecting) {
    return (
      <Centered>
        <p className="text-navy-500">Loading your application…</p>
      </Centered>
    );
  }

  if (noApplication) {
    return (
      <Centered>
        <h1 className="text-2xl font-bold text-navy-900">
          No application found
        </h1>
        <p className="mt-3 text-navy-600">
          Sign in to view your application, or start a new one.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/apply" className="btn-primary">
            Apply now
          </Link>
        </div>
      </Centered>
    );
  }

  // No application id selected: show the list of the user's applications.
  if (!error && !id && apps) {
    return (
      <ApplicationList
        apps={apps}
        onSelect={(appId) => router.push(`/dashboard?id=${appId}`)}
        onSignOut={signOut}
      />
    );
  }

  if (error || !app) {
    return (
      <Centered>
        <FaTriangleExclamation className="mx-auto h-8 w-8 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-navy-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-navy-600">{error}</p>
        <button onClick={load} className="btn-primary mt-6">
          Try again
        </button>
      </Centered>
    );
  }

  const isTerminalOfframp = app.stageIndex < 0; // DECLINED / BANK_REJECTED
  // FUNDED is a terminal success state — the whole lifecycle is done, so every
  // stage (including "Funded" itself) should render as Complete rather than
  // leaving the final stage stuck showing "In progress".
  const isFunded = app.status === "FUNDED";
  // Once the borrower e-signs, the status stays SIGN_LOAN_AGREEMENT (signed,
  // awaiting a manual fund release). Nudge the tracker half a step so "Sign
  // Agreement" reads as Complete while "Funded" stays a pending step (not yet
  // in progress) — funds haven't been released.
  const esignAction =
    app.esign === true && app.status === "SIGN_LOAN_AGREEMENT";
  const currentIndex = esignAction ? app.stageIndex + 1 : app.stageIndex;
  const action = NEXT_ACTIONS[app.status];

  const hideCTA = ["PENDING_VERIFICATION", "MANUAL_REVIEW"].includes(
    app.status,
  );

  const summaryRows = [
    { label: "Loan amount", value: formatUSD(app.requestedAmount) },
    { label: "Fixed APR", value: `${LOAN.apr}%` },
    { label: "Term", value: `${app.loanTermMonths} months` },
    {
      label: "Est. monthly payment",
      value: formatUSD(Math.round(app.monthlyPayment)),
    },
  ];

  return (
    <section className="bg-linear-to-b from-navy-50 to-white">
      {bankModalOpen && (
        <BankUpdateModal
          applicationId={app.id}
          onClose={handleCloseBankModal}
          onUpdated={() => {
            setBankModalOpen(false);
            void load();
          }}
        />
      )}
      <div className="container-x py-12 lg:py-16">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              <FaArrowRightLong className="h-3 w-3 rotate-180" />
              All applications
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Your dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-900 md:text-5xl">
              Application status
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-600">
              Here&apos;s where your application stands and what comes next.
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-600 transition hover:bg-navy-50 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <FaArrowRightFromBracket className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="space-y-8 lg:col-span-2">
            {/* Terminal off-ramp (declined / bank rejected) */}
            {isTerminalOfframp ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 sm:p-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
                  <FaTriangleExclamation className="h-3 w-3" />
                  {app.stageLabel}
                </span>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-navy-900">
                  {app.status === "BANK_REJECTED"
                    ? "We need a different bank account"
                    : "We're unable to approve this application"}
                </h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-navy-700">
                  {app.statusReason ??
                    "Please check your email for details and next steps."}
                </p>
                {app.status === "BANK_REJECTED" && (
                  <button
                    type="button"
                    onClick={handleOpenBankModal}
                    className="btn-primary mt-6 inline-flex items-center gap-2"
                  >
                    Update bank details <FaArrowRightLong />
                  </button>
                )}
              </div>
            ) : (
              action && (
                // <div className="overflow-hidden rounded-3xl bg-linear-to-br from-navy-800 to-navy-950 p-8 shadow-lift sm:p-10">
                //   <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                //     <FaRegClock className="h-3 w-3" />
                //     Next step
                //   </span>
                //   <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
                //     {esignAction
                //       ? "Agreement signed — awaiting funding"
                //       : action.heading}
                //   </h2>
                //   <p className="mt-3 max-w-xl text-base leading-relaxed text-navy-200">
                //     {esignAction
                //       ? "Thanks for signing. Our team will review your executed agreement and release your funds — typically within 24 hours via ACH. No further action is needed right now."
                //       : action.body}
                //   </p>
                //   {esignAction ? (
                //     <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-base font-semibold text-white">
                //       <FaCheck className="h-4 w-4" /> Agreement signed
                //     </span>
                //   ) : app.status === "SIGN_LOAN_AGREEMENT" ? (
                //     <button
                //       onClick={() => setShowAgreement(true)}
                //       disabled={showAgreement}
                //       className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                //     >
                //       {action.cta} <FaArrowRightLong />
                //     </button>
                //   ) : (
                //     <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white">
                //       {action.cta} <FaArrowRightLong />
                //     </span>
                //   )}
                // </div>
                <div className="overflow-hidden rounded-3xl bg-linear-to-br from-navy-800 to-navy-950 p-8 shadow-lift sm:p-10">
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                    <FaRegClock className="h-3 w-3" />
                    {isFunded ? "Completed" : "Next step"}
                  </span>

                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
                    {isFunded
                      ? "Funds have been disbursed"
                      : esignAction
                        ? "Agreement signed — awaiting funding"
                        : action.heading}
                  </h2>

                  <p className="mt-3 max-w-xl text-base leading-relaxed text-navy-200">
                    {isFunded
                      ? "Congratulations! Your loan has been successfully funded and the money has been sent to your designated bank account. Please allow your bank time to process the deposit."
                      : esignAction
                        ? "Thanks for signing. Our team will review your executed agreement and release your funds—typically within 24 hours via ACH. No further action is needed right now."
                        : action.body}
                  </p>

                  {/* {isFunded ? (
                    <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-base font-semibold text-white">
                      <FaCheck className="h-4 w-4" />
                      Funds Disbursed
                    </span>
                  ) : esignAction ? (
                    <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-base font-semibold text-white">
                      <FaCheck className="h-4 w-4" />
                      Agreement Signed
                    </span>
                  ) : app.status === "SIGN_LOAN_AGREEMENT" ? (
                    <button
                      onClick={() => setShowAgreement(true)}
                      disabled={showAgreement}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {action.cta} <FaArrowRightLong />
                    </button>
                  ) : (
                    <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white">
                      {action.cta} <FaArrowRightLong />
                    </span>
                  )} */}
                  {isFunded ? (
                    <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-base font-semibold text-white">
                      <FaCheck className="h-4 w-4" />
                      Funds Disbursed
                    </span>
                  ) : esignAction ? (
                    <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-base font-semibold text-white">
                      <FaCheck className="h-4 w-4" />
                      Agreement Signed
                    </span>
                  ) : hideCTA ? null : app.status === "SIGN_LOAN_AGREEMENT" ? (
                    <button
                      onClick={() => setShowAgreement(true)}
                      disabled={showAgreement}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {action.cta} <FaArrowRightLong />
                    </button>
                  ) : (
                    <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white">
                      {action.cta} <FaArrowRightLong />
                    </span>
                  )}
                </div>
              )
            )}

            {/* Review-and-sign agreement — revealed when the borrower clicks
                "Review & e-sign" while awaiting signature. */}
            {app.status === "SIGN_LOAN_AGREEMENT" && showAgreement && (
              <SignAgreementBlock
                applicationId={app.id}
                amount={app.requestedAmount}
                termMonths={app.loanTermMonths}
                onSigned={load}
              />
            )}

            {/* Status timeline */}
            <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-xl font-bold tracking-tight text-navy-900">
                Application progress
              </h2>
              <ol className="mt-8">
                {LIFECYCLE_STAGES.map((stage, i) => {
                  const isComplete = i < currentIndex || isFunded;
                  const isCurrent = !isFunded && i === currentIndex;
                  const isLast = i === LIFECYCLE_STAGES.length - 1;
                  return (
                    <li
                      key={stage.key}
                      className="relative flex gap-5 pb-8 last:pb-0"
                    >
                      {!isLast && (
                        <span
                          aria-hidden
                          className={`absolute left-5 top-11 h-[calc(100%-1.75rem)] w-px ${
                            isComplete ? "bg-green-500" : "bg-navy-100"
                          }`}
                        />
                      )}
                      <span
                        className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isComplete
                            ? "bg-green-500 text-white"
                            : isCurrent
                              ? "bg-amber-100 text-amber-700 ring-4 ring-amber-200"
                              : "bg-navy-100 text-navy-400"
                        }`}
                      >
                        {isComplete ? (
                          <FaCheck className="h-4 w-4" />
                        ) : (
                          <FaCircle className="h-2.5 w-2.5" />
                        )}
                      </span>
                      <div className="pt-1">
                        <div className="flex items-center gap-3">
                          <h3
                            className={`text-base font-semibold ${
                              isComplete || isCurrent
                                ? "text-navy-900"
                                : "text-navy-400"
                            }`}
                          >
                            {stage.label}
                          </h3>
                          {isComplete && (
                            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                              Complete
                            </span>
                          )}
                          {isCurrent && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                              In progress
                            </span>
                          )}
                        </div>
                        <p
                          className={`mt-1.5 text-sm leading-relaxed ${
                            isComplete || isCurrent
                              ? "text-navy-600"
                              : "text-navy-400"
                          }`}
                        >
                          {stage.blurb}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-lg font-bold tracking-tight text-navy-900">
                Loan summary
              </h2>
              <dl className="mt-5 divide-y divide-navy-100">
                {summaryRows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0"
                  >
                    <dt className="text-sm font-medium text-navy-500">
                      {label}
                    </dt>
                    <dd className="text-base font-bold text-navy-900">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-xs leading-relaxed text-green-800">
                Funds arrive within {LOAN.fundingHours} hours of final
                verification, sent via ACH.
              </p>
            </div>

            <div className="rounded-3xl border border-navy-100 bg-navy-50 p-6 sm:p-8">
              <h2 className="text-lg font-bold tracking-tight text-navy-900">
                Need help?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                Our team is here to help with any step of your application.
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-navy-500">Call us</dt>
                  <dd>
                    <a
                      href={telHref(BRAND.phone)}
                      className="font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      {BRAND.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-navy-500">Email us</dt>
                  <dd>
                    <a
                      href={`mailto:${BRAND.email}`}
                      className="font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      {BRAND.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ApplicationList({
  apps,
  onSelect,
  onSignOut,
}: {
  apps: ApplicationListItem[];
  onSelect: (id: string) => void;
  onSignOut: () => void;
}) {
  return (
    <section className="bg-linear-to-b from-navy-50 to-white">
      <div className="container-x py-12 lg:py-16">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Your dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-900 md:text-5xl">
              Your applications
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-600">
              Select an application to view its status and next steps.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/apply"
              className=" hidden md:inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Apply for a new loan <FaArrowRightLong className="h-3.5 w-3.5" />
            </Link>
            {/* <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-600 transition hover:bg-navy-50 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <FaArrowRightFromBracket className="h-3.5 w-3.5" />
              Sign out
            </button> */}
          </div>
        </div>

        <ul className="mt-12 space-y-4">
          {apps.map((app) => {
            const isOfframp = app.stageIndex < 0; // DECLINED / BANK_REJECTED
            return (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => onSelect(app.id)}
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-6 text-left shadow-card transition hover:border-blue-200 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:p-8"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xl font-bold text-navy-900">
                        {formatUSD(app.requestedAmount)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isOfframp
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {app.stageLabel}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm text-navy-600">
                      {[
                        `${app.user?.firstName ?? ""} ${app.user?.lastName ?? ""}`.trim(),
                        app.user?.phone
                          ? formatPhoneNumber(app.user.phone)
                          : "",
                        app.user?.email,
                        app.user?.address,
                        app.user?.city && app.user?.state
                          ? `${app.user.city}, ${app.user.state}`
                          : app.user?.city || app.user?.state,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-2 truncate text-sm text-navy-600">
                      {app.loanPurpose} · {app.loanTermMonths} months · Applied{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <FaArrowRightLong className="h-4 w-4 shrink-0 text-navy-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// Popup form for resubmitting a corrected bank account after BANK_REJECTED.
// PATCHes the existing record (no duplicate row) and re-runs the Gatekeeper.
function BankUpdateModal({
  applicationId,
  onClose,
  onUpdated,
}: {
  applicationId: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountAge: "" as AccountAge | "",
    bankUsername: "",
    bankPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const canSubmit =
    /^\d{9}$/.test(form.routingNumber) &&
    /^\d{4,17}$/.test(form.accountNumber) &&
    form.bankName.trim() !== "" &&
    form.accountAge !== "" &&
    form.bankUsername.trim() !== "" &&
    form.bankPassword.trim() !== "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.updateBankDetails(applicationId, {
        bankName: form.bankName.trim(),
        routingNumber: form.routingNumber,
        accountNumber: form.accountNumber,
        accountAge: form.accountAge as AccountAge,
        bankUsername: form.bankUsername.trim(),
        bankPassword: form.bankPassword,
      });
      onUpdated();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't update your bank details. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-navy-900">
              Update your bank account
            </h2>
            <p className="mt-1 text-sm text-navy-600">
              Enter a different, eligible bank account so we can continue your
              application.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-navy-400 transition hover:bg-navy-50 hover:text-navy-700"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-navy-700">
              Bank name
            </label>
            <input
              value={form.bankName}
              onChange={(e) => set("bankName", e.target.value)}
              placeholder="e.g. Chase"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-navy-700">
                Routing number
              </label>
              <input
                value={form.routingNumber}
                onChange={(e) =>
                  set("routingNumber", e.target.value.replace(/\D/g, ""))
                }
                inputMode="numeric"
                maxLength={9}
                placeholder="9 digits"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-700">
                Account number
              </label>
              <input
                value={form.accountNumber}
                onChange={(e) =>
                  set("accountNumber", e.target.value.replace(/\D/g, ""))
                }
                inputMode="numeric"
                maxLength={17}
                placeholder="4–17 digits"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-navy-700">
              Account age
            </label>
            <select
              value={form.accountAge}
              onChange={(e) => set("accountAge", e.target.value as AccountAge)}
              className={inputClass}
            >
              <option value="" disabled>
                Select account age
              </option>
              {ACCOUNT_AGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-navy-700">
                Online banking username
              </label>
              <input
                value={form.bankUsername}
                onChange={(e) => set("bankUsername", e.target.value)}
                autoComplete="off"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-700">
                Online banking password
              </label>
              <input
                type="password"
                value={form.bankPassword}
                onChange={(e) => set("bankPassword", e.target.value)}
                autoComplete="off"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit & re-check"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-linear-to-b from-navy-50 to-white">
      <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-card sm:p-10">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <Centered>
          <p className="text-navy-500">Loading…</p>
        </Centered>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
