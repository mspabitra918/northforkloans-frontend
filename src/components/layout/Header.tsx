"use client";

import { BRAND, NAV_LINKS } from "@/src/lib/constants";
import { clearSession, getSession, SESSION_EVENT } from "@/src/lib/session";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import ProfileMenu from "../ui/ProfileMenu";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Keep the header in sync with the session. The Header lives in a persistent
  // layout that doesn't remount on navigation, so a one-time read on mount would
  // go stale after login/logout. Re-read on our custom same-tab event, on the
  // native cross-tab `storage` event, and whenever the route changes.
  useEffect(() => {
    const sync = () => setSession(getSession("user"));
    sync();
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  function signOut() {
    clearSession("user");
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={BRAND.name}
        >
          <span className="text-xl font-bold tracking-tight text-navy-900 ">
            Northfork
            <span className="text-blue-700"> Loans</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-navy-700 transition hover:bg-navy-50 hover:text-navy-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            Apply Now <FaArrowRightLong />
          </Link>

          <ProfileMenu
            session={session}
            onLogout={() => {
              signOut();
            }}
          />
        </div>

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-navy-700 hover:bg-navy-50"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* {open && (
        <nav
          className="border-t border-navy-100 bg-white md:hidden"
          aria-label="Mobile"
        >
          <div className="container-x flex flex-col gap-1 py-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              onClick={() => setOpen(false)}
              href="/apply"
              className="inline-flex items-center justify-center gap-2 rounded-md  font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-blue-600 text-white shadow-lift hover:bg-blue-700 focus-visible:ring-star-400  ml-2 px-5 py-3 text-sm"
            >
              Apply Now <FaArrowRightLong />
            </Link>
            <ProfileMenu
              session={session}
              onLogout={() => {
                signOut();
              }}
            />
          </div>
        </nav>
      )} */}
      {open && (
        <nav
          className="border-t border-navy-100 bg-white md:hidden"
          aria-label="Mobile"
        >
          <div className="container-x py-4">
            <div className="space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-navy-700 transition hover:bg-navy-50"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="my-4 h-px bg-navy-100" />

            {session ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-navy-700 hover:bg-navy-50"
                >
                  Dashboard
                </Link>

                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="w-full rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-navy-700 hover:bg-navy-50"
              >
                Dashboard Login <FaArrowRightLong />
              </Link>
            )}

            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Apply Now <FaArrowRightLong />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
