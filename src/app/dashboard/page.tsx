"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowRightLong, FaTriangleExclamation } from "react-icons/fa6";
import { formatUSD } from "@/src/lib/constants";
import { api, ApiError, type ApplicationListItem } from "@/src/lib/api";
import { clearSession, getSession } from "@/src/lib/session";

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

function DashboardListInner() {
  const router = useRouter();

  function signOut() {
    clearSession("user");
    router.replace("/login");
  }

  // The full list of the user's applications. Selecting a row opens the detail
  // route (/dashboard/[id]).
  const [apps, setApps] = useState<ApplicationListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  // True while we're redirecting an unauthenticated visitor to /login — keeps
  // the loading UI up so the error state doesn't flash before navigation.
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // No application to show: a signed-in user who hasn't applied yet.
  const [noApplication, setNoApplication] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoApplication(false);

    // Every dashboard view requires a signed-in customer. Without a session
    // there's no token to authorize the request with, so send them to login.
    // This is the client-side half of the guard; the backend independently
    // enforces auth + ownership.
    const session = getSession("user");
    if (!session) {
      setRedirecting(true);
      router.replace("/login");
      return;
    }

    try {
      const list = await api.getApplicationsByUser(
        session.phone,
        session.accessToken,
      );
      if (list.length === 0) {
        setApps(null);
        setNoApplication(true);
        return;
      }
      setApps(list);
    } catch (err) {
      // A signed-in user who hasn't applied yet gets the friendly empty state
      // rather than an error.
      if (err instanceof ApiError && err.status === 404) {
        setApps(null);
        setNoApplication(true);
      } else if (err instanceof ApiError && err.status === 401) {
        // Expired/invalid token — force a fresh login.
        clearSession("user");
        setRedirecting(true);
        router.replace("/login");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "We couldn't load your applications.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // --- Empty / error states ---
  if (loading || redirecting) {
    return (
      <Centered>
        <p className="text-navy-500">Loading your applications…</p>
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

  if (error || !apps) {
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

  return (
    <ApplicationList
      apps={apps}
      onSelect={(appId) => router.push(`/dashboard/${appId}`)}
      onSignOut={signOut}
    />
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
  return <DashboardListInner />;
}
