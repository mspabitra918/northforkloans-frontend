import {
  FaCheck,
  FaPercent,
  FaSackDollar,
  FaRegClock,
  FaRegFileLines,
  FaBan,
  FaCalendarDays,
  FaArrowRightLong,
} from "react-icons/fa6";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { CtaBand } from "@/src/components/ui/CtaBand";
import { Faq } from "@/src/components/ui/Faq";
import { JsonLd } from "@/src/components/layout/JsonLd";
import { breadcrumbSchema } from "@/src/lib/schema";
import { LOAN, FAQS, formatUSD } from "@/src/lib/constants";
import Link from "next/link";

export const metadata: import("next").Metadata = {
  title: `Rates & Terms — One Fixed ${LOAN.apr}% APR | Northfork Loans`,
  description: `Every approved applicant gets the same fixed ${LOAN.apr}% APR. Loans from ${formatUSD(
    LOAN.minAmount,
  )} to ${formatUSD(LOAN.maxAmount)}, terms of ${LOAN.terms.join(
    "/",
  )} months, $0 origination fees, and no prepayment penalty.`,
  alternates: { canonical: "/rates-terms" },
};

// Two-decimal currency for payment figures (formatUSD rounds to whole dollars,
// which is wrong for a payment example, so format cents explicitly here).
function formatUSDCents(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Standard amortization: M = P*r*(1+r)^n / ((1+r)^n - 1).
function monthlyPayment(principal: number, aprPercent: number, months: number) {
  const r = aprPercent / 100 / 12;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

// Key terms, driven off LOAN so the headline figures match the schema/JSON-LD.
const KEY_TERMS = [
  { icon: FaPercent, label: "APR", value: `${LOAN.apr}% fixed` },
  {
    icon: FaSackDollar,
    label: "Loan amounts",
    value: `${formatUSD(LOAN.minAmount)} – ${formatUSD(LOAN.maxAmount)}`,
  },
  {
    icon: FaCalendarDays,
    label: "Terms",
    value: `${LOAN.terms.join(" / ")} months`,
  },
  {
    icon: FaRegFileLines,
    label: "Origination fee",
    value: formatUSD(LOAN.upfrontFees),
  },
  { icon: FaBan, label: "Prepayment penalty", value: "None" },
  {
    icon: FaRegClock,
    label: "Funding",
    value: `Within ${LOAN.fundingHours} hours`,
  },
];

const ELIGIBILITY = [
  `A gross monthly income of at least ${formatUSD(LOAN.minMonthlyIncome)}`,
  "A valid U.S. bank account (no prepaid cards)",
  "U.S. residency and basic ID",
  "All credit tiers welcome — no credit-bureau cutoffs",
];

export default function RatesTermsPage() {
  // Representative example computed at render time so it can never drift.
  const exampleAmount = 5000;
  const exampleTerm = 24;
  const example = monthlyPayment(exampleAmount, LOAN.apr, exampleTerm);
  const exampleTotal = example * exampleTerm;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Rates & Terms", path: "/rates-terms" },
        ])}
      />

      {/* <PageHeader
        eyebrow="Rates & terms"
        title="One fixed rate. No surprises."
        intro={`Every approved applicant receives the same fixed ${LOAN.apr}% APR — it doesn't change with your credit, loan amount, or term. Here's exactly what that looks like.`}
      /> */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-40 h-144 w-144 rounded-full bg-blue-500/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-32 h-[32rem] w-[32rem] rounded-full bg-star-500/15 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]"
        />
        <div className="container-x relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-star-400" />
              <span className="text-sm font-medium text-navy-100">
                Rates & terms
              </span>
            </div>
            <h1 className="mt-7 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              One fixed rate.{" "}
              <span className="bg-linear-to-r from-blue-400 to-star-300 bg-clip-text text-transparent">
                No surprises.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">
              {`Every approved applicant receives the same fixed ${LOAN.apr}% APR — it doesn't change with your credit, loan amount, or term. Here's exactly what that looks like.`}
            </p>
            <div className="mt-8">
              <Link
                href="/apply"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
              >
                Apply Now{" "}
                <FaArrowRightLong className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent fixed-APR hero card. */}
      <section className="container-x py-16 lg:py-20">
        <div className="overflow-hidden rounded-4xl bg-linear-to-br from-navy-800 to-navy-950 px-8 py-12 text-center shadow-lift sm:px-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-star-400">
            Fixed APR for every applicant
          </p>
          <p className="mt-4 text-7xl font-bold tracking-tight text-white sm:text-8xl">
            {LOAN.apr}%
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-navy-200">
            No teaser rates and no risk-based pricing. The same {LOAN.apr}%
            fixed APR applies whether you borrow {formatUSD(LOAN.minAmount)} or{" "}
            {formatUSD(LOAN.maxAmount)}.
          </p>
        </div>
      </section>

      {/* Key-terms grid, driven off LOAN. */}
      <section className="container-x pb-16 lg:pb-20">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">
          Key terms at a glance
        </h2>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KEY_TERMS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-4 w-4" />
              </span>
              <dt className="mt-4 text-sm font-medium text-navy-500">
                {label}
              </dt>
              <dd className="mt-1 text-xl font-bold text-navy-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Representative example + eligibility, side by side. */}
      <section className="container-x pb-16 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-card lg:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-navy-900">
              Representative example
            </h2>
            <p className="mt-3 text-base leading-relaxed text-navy-600">
              A {formatUSD(exampleAmount)} loan at a fixed {LOAN.apr}% APR over{" "}
              {exampleTerm} months.
            </p>
            <dl className="mt-6 divide-y divide-navy-100">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <dt className="text-sm font-medium text-navy-500">
                  Amount borrowed
                </dt>
                <dd className="text-base font-bold text-navy-900">
                  {formatUSD(exampleAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm font-medium text-navy-500">Fixed APR</dt>
                <dd className="text-base font-bold text-navy-900">
                  {LOAN.apr}%
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm font-medium text-navy-500">Term</dt>
                <dd className="text-base font-bold text-navy-900">
                  {exampleTerm} months
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm font-medium text-navy-500">
                  Monthly payment
                </dt>
                <dd className="text-base font-bold text-blue-600">
                  {formatUSDCents(example)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3 last:pb-0">
                <dt className="text-sm font-medium text-navy-500">
                  Total of payments
                </dt>
                <dd className="text-base font-bold text-navy-900">
                  {formatUSDCents(exampleTotal)}
                </dd>
              </div>
            </dl>
            <p className="mt-6 rounded-xl bg-navy-50 px-4 py-3 text-xs leading-relaxed text-navy-500">
              For illustration only. Your actual payment depends on the amount
              and term you choose; the {LOAN.apr}% fixed APR is the same for all
              approved applicants. With {formatUSD(LOAN.upfrontFees)}{" "}
              origination fees and no prepayment penalty, paying early only
              saves you interest.
            </p>
          </div>

          <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-card lg:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-navy-900">
              Who&apos;s eligible
            </h2>
            <p className="mt-3 text-base leading-relaxed text-navy-600">
              We look at affordability — your income and obligations — rather
              than a single credit score.
            </p>
            <ul className="mt-6 space-y-4">
              {ELIGIBILITY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800">
                    <FaCheck className="h-3 w-3" />
                  </span>
                  <span className="text-base text-navy-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Compliance disclosures. */}
        <p className="mt-8 text-xs leading-relaxed text-navy-400">
          Disclosures: The {LOAN.apr}% APR is fixed and identical for every
          approved applicant; it does not vary by credit tier, loan amount, or
          term. All loans are subject to approval and successful bank
          verification. Funding timelines are goals, not guarantees, and begin
          after you e-sign your agreement and your bank account is verified.
          Northfork Loans handles your personal and financial information in
          accordance with the Gramm-Leach-Bliley Act (GLBA) and the California
          Consumer Privacy Act (CCPA).
        </p>
      </section>

      <Faq items={FAQS} />
      <CtaBand />
    </>
  );
}
