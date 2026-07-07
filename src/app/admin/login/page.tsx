"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowRightLong,
  FaLock,
  FaTriangleExclamation,
  FaUserShield,
} from "react-icons/fa6";
import { api, ApiError } from "@/src/lib/api";
import { getSession, saveSession } from "@/src/lib/session";

// Dedicated staff (admin / underwriter) sign-in. Customers use the public
// /login OTP flow; this email + password path authenticates against the
// `admins` table on the backend.
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in as staff? Skip straight to the queue.
  useEffect(() => {
    const s = getSession("admin");
    if (s && s.role !== "customer") router.replace("/admin");
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const session = await api.login(email, password);
      if (session.role === "customer") {
        setError("This portal is for staff accounts only.");
        return;
      }
      saveSession("admin", session);
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to sign in. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-linear-to-b from-navy-900 to-navy-950">
      <div className="container-x w-full py-16">
        <div className="mx-auto w-full max-w-md">
          {/* Wordmark */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <FaUserShield className="h-4 w-4" />
              </span>
              Northfork<span className="text-blue-400">Admin</span>
            </span>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
              Underwriting portal
            </h1>
            <p className="mt-2 text-sm text-navy-300">
              Staff sign-in for admins and underwriters.
            </p>
          </div>

          {/* Sign-in card */}
          <div className="mt-8 rounded-3xl border border-white/10 bg-white p-6 shadow-card sm:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-navy-900"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@northfork.example"
                  className="mt-2 block w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 transition focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-navy-900"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 block w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 transition focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <FaTriangleExclamation className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <FaArrowRightLong />}
              </button>
            </form>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-navy-500">
              <FaLock className="h-3 w-3 text-green-500" />
              Your connection is encrypted
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-navy-400">
            Not a staff member?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Customer sign-in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
