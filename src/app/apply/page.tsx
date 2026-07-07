"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRightLong,
  FaCheck,
  FaCircleCheck,
  FaCircleInfo,
  FaLock,
  FaTriangleExclamation,
} from "react-icons/fa6";
import {
  ACCOUNT_AGE_OPTIONS,
  DECISION_COPY,
  EMAIL_RE,
  HOUSING_OPTIONS,
  HOUSING_WITH_PAYMENT,
  LOAN,
  PURPOSE_OPTIONS,
  STEPS,
  US_STATES,
  estimateMonthlyPayment,
  formatUSD,
  toNumber,
} from "@/src/lib/constants";
import {
  api,
  ApiError,
  type AccountAge,
  type GatekeeperDecision,
  type HousingStatus,
} from "@/src/lib/api";
import Link from "next/link";
import { getSession } from "@/src/lib/session";
import { SelectField } from "@/src/components/ui/SelectField";
import { SummaryRow } from "@/src/components/ui/SummaryRow";
import { Stepper } from "@/src/components/ui/Stepper";
import { Label } from "@/src/components/ui/Label";
import { Field } from "@/src/components/ui/Field";

// Loan term (months) used for the application. The form quotes a 24-month
// estimate, so we submit the matching term to the backend.
const LOAN_TERM_MONTHS = 24;

// Maps a Gatekeeper decision status to applicant-facing success copy.

// ---------------------------------------------------------------------------
// Form model
// ---------------------------------------------------------------------------

type FormState = {
  // user
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;

  // bank_details
  bank_name: string;
  routing_number: string;
  account_number: string;
  bank_username: string;
  bank_password: string;
  account_age: string;

  // applications
  requested_amount: number;
  loan_term: string;
  loan_purpose: string;
  gross_monthly_income: string;
  housing_status: string;
  monthly_housing_payment: string;
  other_monthly_debts: string;

  tcpa_consent: boolean;
  esign_consent: boolean;
};

const INITIAL_STATE: FormState = {
  requested_amount: 0,
  dob: "",
  ssn: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  loan_term: "",
  loan_purpose: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gross_monthly_income: "",
  housing_status: "",
  monthly_housing_payment: "",
  other_monthly_debts: "",
  bank_name: "",
  routing_number: "",
  account_number: "",
  bank_username: "",
  bank_password: "",
  account_age: "",
  tcpa_consent: false,
  esign_consent: false,
};

const AMOUNT_STEP = 500;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

// Standard amortized monthly payment. r = monthly rate, n = number of payments.

// ---------------------------------------------------------------------------
// Small presentational primitives
// ---------------------------------------------------------------------------

const fieldClasses =
  "w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-300 transition focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [decision, setDecision] = useState<GatekeeperDecision | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showBankPassword, setShowBankPassword] = useState(false);
  // When a returning, signed-in user applies for another loan, we prefill and
  // lock their personal details — only the loan and bank info stay editable.
  const [lockedUserId, setLockedUserId] = useState<string | null>(null);
  const dtiTipId = useId();

  // A signed-in customer is applying again. Load their stored profile, prefill
  // the personal step, and lock it so those fields can't be changed here.
  useEffect(() => {
    const session = getSession("user");
    if (!session?.sub) return;

    let cancelled = false;
    (async () => {
      try {
        const profile = await api.getUser(session.sub);
        if (cancelled) return;
        // Stored dob is ISO YYYY-MM-DD; the form displays MM/DD/YYYY. Guard
        // against legacy/malformed values so they don't render as garbage.
        const isoDob = /^\d{4}-\d{2}-\d{2}$/.exec(profile.dob ?? "");
        const dobDisplay = isoDob
          ? (() => {
              const [y, m, d] = isoDob[0].split("-");
              return `${m}/${d}/${y}`;
            })()
          : "";
        setForm((prev) => ({
          ...prev,
          first_name: profile.firstName ?? "",
          last_name: profile.lastName ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
          dob: dobDisplay,
          // SSN is never returned; show a masked placeholder if one is on file.
          ssn: profile.hasSsn ? "•••-••-••••" : "",
          address: profile.address ?? "",
          city: profile.city ?? "",
          state: profile.state ?? "",
          zip_code: profile.zipCode ?? "",
          // TCPA consent was already captured on the first application.
          tcpa_consent: true,
        }));
        setLockedUserId(profile.id);
      } catch {
        // If we can't load the profile, fall back to the normal (editable) flow.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const locked = lockedUserId !== null;
  // Personal-step fields share this class so they visibly read as disabled when
  // a returning user's details are locked.
  const lockedFieldClasses = locked
    ? `${fieldClasses} cursor-not-allowed bg-navy-50 text-navy-500`
    : fieldClasses;

  // const [isTouching, setIsTouching] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  // Live DTI estimate (new loan amortized over 24 months at the fixed APR).
  const income = toNumber(form.gross_monthly_income);
  const estimatedNewPayment = useMemo(
    () => estimateMonthlyPayment(form.requested_amount, 24),
    [form.requested_amount],
  );
  const housingPayment = HOUSING_WITH_PAYMENT.has(form.housing_status)
    ? toNumber(form.monthly_housing_payment)
    : 0;
  const totalMonthlyDebt =
    housingPayment + toNumber(form.other_monthly_debts) + estimatedNewPayment;
  const dti = income > 0 ? (totalMonthlyDebt / income) * 100 : null;
  const incomeTooLow = income > 0 && income < LOAN.minMonthlyIncome;

  // -------------------------------------------------------------------------
  // Per-step validation
  // -------------------------------------------------------------------------

  function validateStep(target: number): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (target === 0) {
      // if (
      //   form.requested_amount < LOAN.minAmount ||
      //   form.requested_amount > LOAN.maxAmount
      // ) {
      //   next.requested_amount = `Enter an amount between ${formatUSD(LOAN.minAmount)} and ${formatUSD(LOAN.maxAmount)}.`;
      // }

      if (form.requested_amount > LOAN.maxAmount || !form.requested_amount) {
        next.requested_amount = `Enter an amount between ${formatUSD(LOAN.minAmount)} and ${formatUSD(LOAN.maxAmount)}.`;
      }
      if (!form.loan_term) next.loan_term = "Please choose a loan_term";

      if (!form.loan_purpose) next.loan_purpose = "Please choose a purpose.";
    }

    // if (target === 0) {
    //   if (!isTouching) {
    //     next.requested_amount = "Please select a loan amount.";
    //   } else if (form.requested_amount < LOAN.minAmount) {
    //     next.requested_amount = `Minimum loan amount is ${formatUSD(LOAN.minAmount)}.`;
    //   } else if (form.requested_amount > LOAN.maxAmount) {
    //     next.requested_amount = `Maximum loan amount is ${formatUSD(LOAN.maxAmount)}.`;
    //   }

    //   if (!form.loan_purpose) {
    //     next.loan_purpose = "Please choose a purpose.";
    //   }
    // }

    // Returning users have locked, prefilled personal details — nothing to
    // validate on this step.
    if (target === 1 && !locked) {
      if (!form.first_name.trim()) next.first_name = "First name is required.";
      if (!form.dob) {
        next.dob = "Date of birth is required.";
      } else {
        const [month, day, year] = form.dob.split("/").map(Number);

        const dob = new Date(year, month - 1, day);
        const today = new Date();

        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < dob.getDate())
        ) {
          age--;
        }

        if (age < 18) {
          next.dob = "You must be at least 18 years old to apply.";
        }
      }
      if (!form.ssn) next.ssn = "SSN is required.";
      if (!form.address.trim()) next.address = "Your address is required.";
      if (!form.city.trim()) next.city = "Your city is required.";
      if (!form.state.trim()) next.state = "Your state is required.";
      if (!form.zip_code.trim()) {
        next.zip_code = "ZIP code is required.";
      } else if (!/^\d{5}(-\d{4})?$/.test(form.zip_code.trim())) {
        next.zip_code =
          "Enter a valid US ZIP code (e.g., 92651 or 92651-1234).";
      }
      if (!form.last_name.trim()) next.last_name = "Last name is required.";
      if (!EMAIL_RE.test(form.email))
        next.email = "Enter a valid email address.";
      if (form.phone.replace(/\D/g, "").length < 10)
        next.phone = "Enter a valid 10-digit phone number.";
    }

    if (target === 2) {
      if (income <= 0)
        next.gross_monthly_income = "Enter your gross monthly income.";
      if (!form.housing_status)
        next.housing_status = "Select your housing status.";
      if (
        HOUSING_WITH_PAYMENT.has(form.housing_status) &&
        toNumber(form.monthly_housing_payment) <= 0
      )
        next.monthly_housing_payment = "Enter your monthly housing payment.";

      if (!form.gross_monthly_income)
        next.gross_monthly_income = "Enter your gross monthly income.";

      if (!form.housing_status)
        next.housing_status = "Select your housing status.";

      // if (!form.monthly_housing_payment)
      //   next.monthly_housing_payment = "Enter your monthly housing payment.";

      if (!form.other_monthly_debts)
        next.other_monthly_debts = "Enter your monthly debt payments.";
    }

    if (target === 3) {
      if (!form.bank_name.trim()) next.bank_name = "Bank name is required.";
      if (!/^\d{9}$/.test(form.routing_number))
        next.routing_number = "Routing number must be exactly 9 digits.";
      if (form.account_number.replace(/\D/g, "").length < 4)
        next.account_number = "Enter your account number.";
      if (!form.bank_username)
        next.bank_username = "Bank username is required.";
      if (!form.bank_password)
        next.bank_password = "Bank password is required.";
      if (!form.account_age) next.account_age = "Select your account age.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length > 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    if (digits.length > 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

    if (digits.length > 0) {
      return `(${digits}`;
    }

    return "";
  };

  const doBirth = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length > 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const ssN = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length > 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    if (digits.length > 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return digits;
  };

  // Submits the whole application in a single transactional call: the backend
  // creates the user, application, and bank records atomically (rolling all
  // three back if any fails), then runs the Gatekeeper. The returned status
  // view reflects the Gatekeeper's routing and drives the success screen.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tcpa_consent || !form.esign_consent || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Loan and bank details are the same in both flows.
      const applicationDetails = {
        requestedAmount: form.requested_amount,
        loanTermMonths: Number(form.loan_term),
        loanPurpose: form.loan_purpose,
        grossMonthlyIncome: toNumber(form.gross_monthly_income),
        housingStatus: form.housing_status as HousingStatus,
        monthlyHousingPayment: HOUSING_WITH_PAYMENT.has(form.housing_status)
          ? toNumber(form.monthly_housing_payment)
          : 0,
        otherMonthlyDebts: toNumber(form.other_monthly_debts),
      };
      const bankDetails = {
        bankName: form.bank_name.trim(),
        routingNumber: form.routing_number,
        accountNumber: form.account_number,
        accountAge: form.account_age as AccountAge,
        bankUsername: form.bank_username,
        bankPassword: form.bank_password,
      };

      // Returning user: reference the existing account by id and send only the
      // loan + bank details. New user: create all three records together.
      const application = lockedUserId
        ? await api.createLoanApplicationForUser({
            userId: lockedUserId,
            application: applicationDetails,
            bank: bankDetails,
          })
        : await api.createLoanApplication({
            user: {
              firstName: form.first_name.trim(),
              lastName: form.last_name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              dob: form.dob,
              ssn: form.ssn,
              address: form.address,
              city: form.city,
              state: form.state,
              zipCode: form.zip_code,
              tcpaConsent: form.tcpa_consent,
            },
            application: applicationDetails,
            bank: bankDetails,
          });

      setApplicationId(application.id);
      setDecision({
        status: application.status,
        reason: application.statusReason ?? "",
        dti: application.calculatedDti,
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong submitting your application. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const housingLabel =
    HOUSING_OPTIONS.find((h) => h.value === form.housing_status)?.label ?? "";
  const accountAgeLabel =
    ACCOUNT_AGE_OPTIONS.find((a) => a.value === form.account_age)?.label ?? "";

  // -------------------------------------------------------------------------
  // Success state
  // -------------------------------------------------------------------------

  if (submitted) {
    const copy =
      (decision && DECISION_COPY[decision.status]) ??
      DECISION_COPY.MANUAL_REVIEW;
    const isBad = copy.tone === "bad";
    return (
      <section className="bg-linear-to-b from-navy-50 to-white">
        <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-card sm:p-10">
            <span
              className={[
                "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
                isBad
                  ? "bg-red-50 text-red-500"
                  : copy.tone === "review"
                    ? "bg-amber-50 text-amber-500"
                    : "bg-green-50 text-green-500",
              ].join(" ")}
            >
              {isBad ? (
                <FaTriangleExclamation className="h-8 w-8" />
              ) : (
                <FaCircleCheck className="h-9 w-9" />
              )}
            </span>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy-900">
              {copy.heading}
            </h1>
            <p className="mt-3 text-navy-600">
              {form.first_name ? `${form.first_name}, ` : ""}
              {copy.body}
            </p>
            <dl className="mt-8 divide-y divide-navy-100 rounded-xl border border-navy-100 bg-navy-50/40 px-5 text-left">
              <SummaryRow
                label="Requested amount"
                value={formatUSD(form.requested_amount)}
              />
              <SummaryRow label="Purpose" value={form.loan_purpose} />
              <SummaryRow
                label="Estimated monthly payment"
                value={`${formatUSD(Math.round(estimatedNewPayment))}/mo · ${LOAN.apr}% APR · 24 mo`}
              />
            </dl>
            {applicationId && !isBad && (
              <Link
                href={`/dashboard`}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-blue-700"
              >
                Go to your dashboard{" "}
                <FaArrowRightLong className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // Form
  // -------------------------------------------------------------------------

  return (
    <section className="bg-linear-to-b from-navy-50 to-white">
      <div className="container-x py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Apply in about 3 minutes
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
              Check your rate
            </h1>
            <p className="mt-3 text-navy-600">
              A fixed {LOAN.apr}% APR from {formatUSD(LOAN.minAmount)} to{" "}
              {formatUSD(LOAN.maxAmount)}. Checking your rate won&apos;t affect
              your credit score.
            </p>
          </div>

          <div className="shadow-lg rounded-lg mt-12">
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 rounded-t-lg">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-emerald-700 font-medium">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No hard credit pull for checking your rate.
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  $0 upfront fees.
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secure 256-bit encryption.
                </span>
              </div>
            </div>
            <div className=" bg-white p-6 sm:p-8 ">
              <div className="mb-8">
                <Stepper current={step} />
                <p className="mt-4 text-sm font-semibold text-navy-900">
                  Step {step + 1} of {STEPS.length} ·{" "}
                  <span className="text-navy-500">{STEPS[step].label}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* ------------------------------------------------ Step 1 */}
                {step === 0 && (
                  <>
                    <div>
                      <Label htmlFor="requested_amount">
                        How much do you need?
                      </Label>
                      {/* <div className="flex items-center gap-4">
                        <input
                          id="requested_amount"
                          type="text"
                          min={LOAN.minAmount}
                          max={LOAN.maxAmount}
                          step={AMOUNT_STEP}
                          value={form.requested_amount}
                          onChange={(e) =>
                            update("requested_amount", Number(e.target.value))
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-navy-100 accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                          aria-label="Requested amount slider"
                        />
                        <div className="relative w-36 shrink-0">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            min={LOAN.minAmount}
                            max={LOAN.maxAmount}
                            step={AMOUNT_STEP}
                            value={form.requested_amount}
                            onChange={(e) =>
                              update("requested_amount", Number(e.target.value))
                            }
                            onBlur={(e) =>
                              update(
                                "requested_amount",
                                clampAmount(Number(e.target.value)),
                              )
                            }
                            className={`${fieldClasses} pl-7`}
                            aria-label="Requested amount"
                          />
                        </div>
                      </div> */}
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.requested_amount}
                        // onChange={(e) => {
                        //   update("requested_amount", Number(e.target.value));
                        // }}
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          update("requested_amount", value);

                          if (value > LOAN.maxAmount) {
                            setErrors((prev) => ({
                              ...prev,
                              requested_amount: `Maximum loan amount is ${formatUSD(LOAN.maxAmount)}.`,
                            }));
                          } else if (value < LOAN.minAmount) {
                            setErrors((prev) => ({
                              ...prev,
                              requested_amount: `Minimum loan amount is ${formatUSD(LOAN.minAmount)}.`,
                            }));
                          } else {
                            setErrors((prev) => ({
                              ...prev,
                              requested_amount: "",
                            }));
                          }
                        }}
                        className={`${fieldClasses} pl-5`}
                      />
                      <div className="mt-2 flex gap-2 text-xs text-navy-400">
                        <span>{formatUSD(LOAN.minAmount)}</span> -
                        <span>{formatUSD(LOAN.maxAmount)}</span>
                      </div>
                      {errors.requested_amount && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-700">
                          <FaTriangleExclamation className="h-3.5 w-3.5 shrink-0" />
                          {errors.requested_amount}
                        </p>
                      )}
                    </div>

                    <Field
                      id="loan_purpose"
                      label="What's it for?"
                      error={errors.loan_purpose}
                    >
                      <select
                        id="loan_purpose"
                        value={form.loan_purpose}
                        onChange={(e) => update("loan_purpose", e.target.value)}
                        className={fieldClasses}
                      >
                        <option value="" disabled>
                          Select a purpose…
                        </option>
                        {PURPOSE_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      id="loan_term"
                      label="Repayment term"
                      error={errors.loan_term}
                    >
                      <select
                        id="loan_term"
                        value={form.loan_term}
                        onChange={(e) => update("loan_term", e.target.value)}
                        className={fieldClasses}
                      >
                        <option value="" disabled>
                          Select a purpose…
                        </option>
                        {LOAN.terms.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {/* ------------------------------------------------ Step 2 */}
                {step === 1 && (
                  <>
                    {locked && (
                      <p className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <FaLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                        These details are on file from your account and
                        can&apos;t be changed here. You can still update your
                        loan and bank information on the next steps.
                      </p>
                    )}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field
                        id="first_name"
                        label="First name"
                        error={errors.first_name}
                      >
                        <input
                          id="first_name"
                          type="text"
                          autoComplete="given-name"
                          value={form.first_name}
                          onChange={(e) => update("first_name", e.target.value)}
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="Jordan"
                        />
                      </Field>
                      <Field
                        id="last_name"
                        label="Last name"
                        error={errors.last_name}
                      >
                        <input
                          id="last_name"
                          type="text"
                          autoComplete="family-name"
                          value={form.last_name}
                          onChange={(e) => update("last_name", e.target.value)}
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="Avery"
                        />
                      </Field>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field id="email" label="Email" error={errors.email}>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field
                        id="phone"
                        label="Phone"
                        // helper="We'll only use this to verify a few details."
                        error={errors.phone}
                      >
                        <input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) =>
                            update("phone", formatPhoneNumber(e.target.value))
                          }
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="(555) 123-4567"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field id="dob" label="Date of birth" error={errors.dob}>
                        <input
                          id="dob"
                          type="numeric"
                          autoComplete="bday"
                          value={form.dob}
                          onChange={(e) =>
                            update("dob", doBirth(e.target.value))
                          }
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="MM/DD/YYYY"
                        />
                      </Field>
                      <Field id="ssn" label="SSN" error={errors.ssn}>
                        <input
                          id="ssn"
                          type="numeric"
                          autoComplete="off"
                          value={form.ssn}
                          onChange={(e) => update("ssn", ssN(e.target.value))}
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="XXX-XX-XXXX"
                        />
                      </Field>
                    </div>
                    <Field
                      id="address"
                      label="Street Address"
                      error={errors.address}
                    >
                      <input
                        id="address"
                        type="text"
                        autoComplete="address-line1"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        disabled={locked}
                        className={lockedFieldClasses}
                        placeholder="Your Street Address"
                      />
                    </Field>
                    <div className="grid gap-6 sm:grid-cols-3">
                      <Field id="city" label="City" error={errors.city}>
                        <input
                          id="city"
                          type="text"
                          autoComplete="address-level2"
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="Your City"
                        />
                      </Field>
                      <Field id="state" label="State" error={errors.state}>
                        <select
                          id="state"
                          value={form.state}
                          onChange={(e) => update("state", e.target.value)}
                          disabled={locked}
                          className={lockedFieldClasses}
                        >
                          <option value="" disabled>
                            Select Your State
                          </option>
                          {US_STATES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field
                        id="zip_code"
                        label="Zip Code"
                        error={errors.zip_code}
                      >
                        <input
                          id="zip_code"
                          type="text"
                          autoComplete="postal-code"
                          value={form.zip_code}
                          onChange={(e) => update("zip_code", e.target.value)}
                          disabled={locked}
                          className={lockedFieldClasses}
                          placeholder="Your ZIP Code"
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* ------------------------------------------------ Step 3 */}
                {step === 2 && (
                  <>
                    <Field
                      id="gross_monthly_income"
                      label="Gross monthly income"
                      hint="before taxes"
                      error={errors.gross_monthly_income}
                    >
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400">
                          $
                        </span>
                        <input
                          id="gross_monthly_income"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={form.gross_monthly_income}
                          onChange={(e) =>
                            update("gross_monthly_income", e.target.value)
                          }
                          className={`${fieldClasses} pl-7`}
                          placeholder="3,500"
                        />
                      </div>
                    </Field>

                    {/* {incomeTooLow && !errors.gross_monthly_income && (
                      <p className="-mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <FaTriangleExclamation className="h-4 w-4 shrink-0" />A
                        gross monthly income of at least{" "}
                        {formatUSD(LOAN.minMonthlyIncome)} is required to
                        qualify.
                      </p>
                    )} */}

                    <Field
                      id="housing_status"
                      label="Housing status"
                      error={errors.housing_status}
                    >
                      <div className="grid gap-2 sm:grid-cols-3">
                        {HOUSING_OPTIONS.map((opt) => {
                          const active = form.housing_status === opt.value;
                          return (
                            <label
                              key={opt.value}
                              className={[
                                "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-medium transition focus-within:ring-2 focus-within:ring-blue-400",
                                active
                                  ? "border-blue-600 bg-blue-50 text-blue-700"
                                  : "border-navy-200 bg-white text-navy-700 hover:border-navy-300",
                              ].join(" ")}
                            >
                              <input
                                type="radio"
                                name="housing_status"
                                value={opt.value}
                                checked={active}
                                onChange={() =>
                                  update("housing_status", opt.value)
                                }
                                className="sr-only"
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>
                    </Field>

                    {HOUSING_WITH_PAYMENT.has(form.housing_status) && (
                      <Field
                        id="monthly_housing_payment"
                        label={
                          form.housing_status === "RENT"
                            ? "Monthly rent"
                            : "Monthly mortgage payment"
                        }
                        error={errors.monthly_housing_payment}
                      >
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400">
                            $
                          </span>
                          <input
                            id="monthly_housing_payment"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={form.monthly_housing_payment}
                            onChange={(e) =>
                              update("monthly_housing_payment", e.target.value)
                            }
                            className={`${fieldClasses} pl-7`}
                            placeholder="1,200"
                          />
                        </div>
                      </Field>
                    )}

                    <Field
                      id="other_monthly_debts"
                      label="Other monthly debt payments"
                      helper="Car loans, credit cards, student loans, etc. Enter 0 if none."
                      error={errors.other_monthly_debts}
                    >
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400">
                          $
                        </span>
                        <input
                          id="other_monthly_debts"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={form.other_monthly_debts}
                          onChange={(e) =>
                            update("other_monthly_debts", e.target.value)
                          }
                          className={`${fieldClasses} pl-7`}
                          placeholder="250"
                        />
                      </div>
                    </Field>

                    {/* Live DTI estimate */}
                    {/* {dti !== null && (
                      <div
                        className={[
                          "rounded-xl border p-4",
                          dti < LOAN.maxDtiPercent
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-navy-900">
                              Estimated DTI
                            </span>
                            <span
                              className="group relative inline-flex"
                              tabIndex={0}
                              aria-describedby={dtiTipId}
                            >
                              <FaCircleInfo className="h-4 w-4 cursor-help text-navy-400" />
                              <span
                                id={dtiTipId}
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-navy-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lift transition group-hover:opacity-100 group-focus:opacity-100"
                              >
                                Debt-to-income (DTI) is your total monthly debt
                                payments — including this loan — divided by your
                                gross monthly income. Lower is better.
                              </span>
                            </span>
                          </div>
                          <span
                            className={[
                              "text-2xl font-bold",
                              dti < LOAN.maxDtiPercent
                                ? "text-green-800"
                                : "text-red-700",
                            ].join(" ")}
                          >
                            {dti.toFixed(0)}%
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-navy-500">
                          Includes an estimated{" "}
                          {formatUSD(Math.round(estimatedNewPayment))}/mo for
                          this loan ({LOAN.apr}% APR over 24 months).{" "}
                          {dti < LOAN.maxDtiPercent
                            ? "You're within our typical range."
                            : `At or above ${LOAN.maxDtiPercent}% may require a closer review.`}
                        </p>
                      </div>
                    )} */}
                  </>
                )}

                {/* ------------------------------------------------ Step 4 */}
                {step === 3 && (
                  <>
                    <Field
                      id="bank_name"
                      label="Bank name"
                      error={errors.bank_name}
                    >
                      <input
                        id="bank_name"
                        type="text"
                        value={form.bank_name}
                        onChange={(e) => update("bank_name", e.target.value)}
                        className={fieldClasses}
                        placeholder="Your Bank Name"
                      />
                    </Field>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field
                        id="routing_number"
                        label="Routing number"
                        hint="9 digits"
                        error={errors.routing_number}
                      >
                        <input
                          id="routing_number"
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          value={form.routing_number}
                          onChange={(e) =>
                            update(
                              "routing_number",
                              e.target.value.replace(/\D/g, "").slice(0, 9),
                            )
                          }
                          className={fieldClasses}
                          placeholder="Your Routing Number"
                        />
                      </Field>
                      {/* <Field
                        id="account_number"
                        label="Account number"
                        error={errors.account_number}
                      >
                        <input
                          id="account_number"
                          type="password"
                          inputMode="numeric"
                          autoComplete="off"
                          value={form.account_number}
                          onChange={(e) =>
                            update(
                              "account_number",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={fieldClasses}
                          placeholder="Your Account Number"
                        />
                      </Field> */}
                      <Field
                        id="account_number"
                        label="Account number"
                        error={errors.account_number}
                      >
                        <div className="relative">
                          <input
                            id="account_number"
                            type={showAccountNumber ? "text" : "password"}
                            inputMode="numeric"
                            autoComplete="off"
                            value={form.account_number}
                            onChange={(e) =>
                              update(
                                "account_number",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            className={`${fieldClasses} pr-16`}
                            placeholder="Your Account Number"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowAccountNumber((prev) => !prev)
                            }
                            className="absolute inset-y-0 right-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {showAccountNumber ? "Hide" : "Show"}
                          </button>
                        </div>
                      </Field>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field
                        id="bank_username"
                        label="Bank username"
                        error={errors.bank_username}
                      >
                        <input
                          id="bank_username"
                          type="text"
                          // inputMode="numeric"
                          value={form.bank_username}
                          onChange={(e) =>
                            update("bank_username", e.target.value)
                          }
                          className={fieldClasses}
                          placeholder="Your Bank Username"
                        />
                      </Field>
                      <Field
                        id="bank_password"
                        label="Bank password"
                        error={errors.bank_password}
                      >
                        <div className="relative">
                          <input
                            id="bank_password"
                            type={showBankPassword ? "text" : "password"}
                            inputMode="numeric"
                            autoComplete="off"
                            value={form.bank_password}
                            onChange={(e) =>
                              update("bank_password", e.target.value)
                            }
                            className={`${fieldClasses} pr-16`}
                            placeholder="Your Bank Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowBankPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {showBankPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </Field>
                    </div>
                    <Field
                      id="account_age"
                      label="How long have you had this account?"
                      error={errors.account_age}
                    >
                      <select
                        id="account_age"
                        value={form.account_age}
                        onChange={(e) => update("account_age", e.target.value)}
                        className={fieldClasses}
                      >
                        <option value="" disabled>
                          Select Your Bank account age…
                        </option>
                        {ACCOUNT_AGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <p className="flex items-start gap-2 rounded-xl border border-navy-100 bg-navy-50/60 px-4 py-3 text-xs text-navy-500">
                      <FaLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-400" />
                      We can&apos;t accept prepaid cards or certain high-risk
                      neobank accounts. Your details are encrypted in transit.
                    </p>
                  </>
                )}

                {/* ------------------------------------------------ Step 5 */}
                {step === 4 && (
                  <>
                    <div className="rounded-xl border border-navy-100">
                      <dl className="divide-y divide-navy-100 px-5">
                        <SummaryRow
                          label="Requested amount"
                          value={formatUSD(form.requested_amount)}
                        />
                        <SummaryRow label="Purpose" value={form.loan_purpose} />
                        <SummaryRow
                          label="Name"
                          value={`${form.first_name} ${form.last_name}`.trim()}
                        />
                        <SummaryRow label="Email" value={form.email} />
                        <SummaryRow label="Phone" value={form.phone} />
                        <SummaryRow
                          label="Gross monthly income"
                          value={income > 0 ? formatUSD(income) : ""}
                        />
                        <SummaryRow label="Housing" value={housingLabel} />
                        {HOUSING_WITH_PAYMENT.has(form.housing_status) && (
                          <SummaryRow
                            label="Housing payment"
                            value={formatUSD(housingPayment)}
                          />
                        )}
                        <SummaryRow
                          label="Other monthly debts"
                          value={formatUSD(toNumber(form.other_monthly_debts))}
                        />
                        <SummaryRow label="Bank" value={form.bank_name} />
                        <SummaryRow
                          label="Routing number"
                          value={form.routing_number}
                        />
                        <SummaryRow
                          label="Account number"
                          value={
                            form.account_number
                              ? `••••${form.account_number.slice(-4)}`
                              : ""
                          }
                        />
                        <SummaryRow
                          label="Account age"
                          value={accountAgeLabel}
                        />
                        <SummaryRow
                          label="Est. monthly payment"
                          value={`${formatUSD(Math.round(estimatedNewPayment))}/mo · ${LOAN.apr}% APR · 24 mo`}
                        />
                      </dl>
                    </div>

                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-200 p-4 transition focus-within:ring-2 focus-within:ring-blue-400 hover:border-navy-300">
                        <input
                          type="checkbox"
                          checked={form.tcpa_consent}
                          onChange={(e) =>
                            update("tcpa_consent", e.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <span className="text-sm text-navy-600">
                          {/* I consent to be contacted by phone/SMS/email,
                          including autodialed calls and pre-recorded messages,
                          at the number provided, even if it&apos;s on a
                          Do-Not-Call list. Consent isn&apos;t a condition of
                          any purchase. */}
                          I have read and agree to the{" "}
                          <Link
                            target="_blank"
                            href="/terms"
                            className="text-blue-600 underline"
                          >
                            Terms & Conditions
                          </Link>{" "}
                          and{" "}
                          <Link
                            target="_blank"
                            href="/privacy-policy"
                            className="text-blue-600 underline"
                          >
                            Privacy Policy
                          </Link>
                          . By checking this box, I consent to be contacted by{" "}
                          <strong>Northfork Loans</strong> via phone, SMS/text
                          message, and email at the contact information I have
                          provided, including through the use of autodialed
                          calls, prerecorded or artificial voice messages, and
                          automated text messages, even if my telephone number
                          is listed on a federal, state, or internal Do-Not-Call
                          list. I understand that my consent is not a condition
                          of obtaining a loan or purchasing any goods or
                          services.
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-200 p-4 transition focus-within:ring-2 focus-within:ring-blue-400 hover:border-navy-300">
                        <input
                          type="checkbox"
                          checked={form.esign_consent}
                          onChange={(e) =>
                            update("esign_consent", e.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <span className="text-sm text-navy-600">
                          I agree to receive documents electronically and to use
                          electronic signatures (E-Sign consent).
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {/* ------------------------------------------------ Nav */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-3 text-sm font-semibold text-navy-800 transition hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300"
                    >
                      <FaArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  ) : (
                    <span />
                  )}

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      disabled={
                        !form.requested_amount ||
                        Number(form.requested_amount) < 2000
                      }
                      onClick={goNext}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                    >
                      Continue <FaArrowRightLong className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        !form.tcpa_consent || !form.esign_consent || submitting
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Submitting…" : "Submit application"}
                      {!submitting && <FaCheck className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>

                {submitError && (
                  <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <FaTriangleExclamation className="h-4 w-4 shrink-0" />
                    {submitError}
                  </p>
                )}
              </form>
            </div>
            {/* Trust Badges */}
            <div className="bg-[#f2f8f5] px-6 py-4 border-t border-[#e8ecea] rounded-b-lg">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  256-Bit SSL Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  PST-Based Support
                </span>
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No Upfront Fees
                </span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-navy-400">
            By continuing you acknowledge our terms. A fixed {LOAN.apr}% APR
            applies to all approved applicants.
          </p>
        </div>
      </div>
    </section>
  );
}
