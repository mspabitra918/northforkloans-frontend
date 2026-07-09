"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowRightLong,
  FaLock,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { BRAND } from "@/src/lib/constants";
import { api, ApiError } from "@/src/lib/api";
import { getSession, saveSession } from "@/src/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile login states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [checkingSession, setCheckingSession] = useState(true);

  // Already signed in? Skip the login form and go straight to the dashboard.
  useEffect(() => {
    const session = getSession("user");
    if (session) {
      router.replace("/dashboard");
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const session = await api.login(phone, password || undefined);
      // This public form is customer-only; staff use /admin/login.
      saveSession("user", session);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to sign in. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  const formatUSPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  // Handle sending OTP
  const handleSendOtp = async () => {
    if (!email) {
      // toast.error("Please enter a valid 10-digit mobile email");
      return;
    }
    setOtpLoading(true);
    setError(null);
    try {
      await api.sendOtp(email);
      setOtpSent(true);
      setOtpTimer(30); // 30 seconds countdown for resend
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't send a code. Try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP verification and login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      // toast.error("Please enter a valid OTP");
      return;
    }
    setOtpLoading(true);
    setError(null);
    try {
      const response = await api.verifyOtp(email, otp);
      // Persist a session so the dashboard knows which user to load.
      saveSession("user", {
        accessToken: response.access_token,
        sub: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        role: "customer",
      });
      setOtpSent(false);
      setEmail("");
      setOtp("");
      // No application id in the URL — the dashboard resolves the user's latest
      // application from the saved session.
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't verify that code. Try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // While we check for an existing session, hold the form back so logged-in
  // users don't see a flash of the phone/OTP entry before the redirect.
  if (checkingSession) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center bg-linear-to-b from-navy-50 to-white">
        <p className="text-navy-500">Loading…</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-[80vh] items-center bg-linear-to-b from-navy-50 to-white">
      <div className="container-x w-full py-16 lg:py-24">
        <div className="mx-auto w-full max-w-md">
          {/* Wordmark */}
          <div className="text-center">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-navy-900"
            >
              Northfork<span className="text-blue-600 ml-1.5">Loans</span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy-900">
              Welcome back
            </h1>
            <p className="mt-2 text-base text-navy-600">
              Sign in to track your application and loan.
            </p>
          </div>

          {/* Sign-in card */}
          <div className="mt-8 rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
            {/* <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy-900 mb-10">
              Login with Mobile Number
            </h1> */}
            {/* <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-navy-900"
                >
                  Mobile Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="phone"
                  autoComplete="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatUSPhone(e.target.value))}
                  placeholder="(555) 123-4567"
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
                {loading ? "Sending..." : "Send OTP"}
                {!loading && <FaArrowRightLong />}
              </button>
            </form> */}

            {!otpSent ? (
              <div className="space-y-4 p-4 sm:p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter your application email
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    We&apos;ll send you a 6-digit OTP to verify your email.
                  </p>
                  <div className="flex">
                    {/* <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span> */}
                    <input
                      type="email"
                      // maxLength={10}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      // className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-600"
                      className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-300 transition focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {error && (
                  <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <FaTriangleExclamation className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !email}
                  className="w-full rounded-lg bg-purple-600 text-white py-3 font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 p-4 sm:p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-600 text-center tracking-widest text-lg"
                    placeholder="- - - - - -"
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
                  disabled={otpLoading || otp.length < 4}
                  className="w-full rounded-lg bg-purple-600 text-white py-2 font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Verifying..." : "Verify & Login"}
                </button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in{" "}
                      <span className="font-semibold text-purple-600">
                        {otpTimer}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="text-sm font-medium text-purple-600 hover:text-purple-500"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Change application email
                </button>
              </form>
            )}

            {/* Encryption reassurance */}
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-navy-500">
              <FaLock className="h-3 w-3 text-green-500" />
              Your connection is encrypted
            </p>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-navy-100" />
              <span className="text-xs font-medium uppercase tracking-wider text-navy-400">
                or
              </span>
              <span className="h-px flex-1 bg-navy-100" />
            </div>

            <p className="text-center text-sm text-navy-600">
              New here?{" "}
              <Link
                href="/apply"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Apply for a loan
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-navy-400">
            Need help? Call{" "}
            <span className="font-medium text-navy-600">{BRAND.phone}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
