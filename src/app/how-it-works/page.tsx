import Link from "next/link";
import { FaArrowRightLong, FaCheck } from "react-icons/fa6";
import { CtaBand } from "@/src/components/ui/CtaBand";
import { Faq } from "@/src/components/ui/Faq";
import { JsonLd } from "@/src/components/layout/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/src/lib/schema";
import {
  HOW_IT_WORKS,
  LIFECYCLE_STAGES,
  FAQS,
  LOAN,
  formatUSD,
} from "@/src/lib/constants";

export const metadata: import("next").Metadata = {
  title: "How It Works — Get Funded in 3 Simple Steps | Northfork Loans",
  description: `Apply in minutes, verify your details, and get funded within ${LOAN.fundingHours} hours. See exactly what you'll need and how an Northfork personal loan works, step by step.`,
  alternates: { canonical: "/how-it-works" },
};

// "What you'll need" eligibility checklist. Mirrors the backend gatekeeper rules
// (min income, valid bank account) so the marketing copy and rules engine agree.
const REQUIREMENTS = [
  `A gross income of at least ${formatUSD(LOAN.minMonthlyIncome)} per month`,
  "A valid U.S. bank account (no prepaid cards)",
  "U.S. residency",
  "Basic ID to confirm your identity",
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "How It Works", path: "/how-it-works" },
          ]),
          // FAQS is readonly; spread to a mutable array for the builder's signature.
          faqSchema([...FAQS]),
        ]}
      />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
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
                How it works
              </span>
            </div>
            <h1 className="mt-7 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Funded in three{" "}
              <span className="bg-linear-to-r from-blue-400 to-star-300 bg-clip-text text-transparent">
                simple steps
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">
              From application to ACH deposit, the whole process is built to be
              fast and transparent — most applicants are funded within{" "}
              {LOAN.fundingHours} hours of signing.
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

      {/* Three-step process, driven off the shared HOW_IT_WORKS constant. */}
      <section className="container-x py-16 lg:py-24">
        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Connecting line behind the step badges on larger screens. */}
          <div
            aria-hidden
            className="absolute inset-x-[16%] top-7 hidden h-px bg-linear-to-r from-blue-200 via-navy-200 to-blue-200 md:block"
          />
          {HOW_IT_WORKS.map(({ step, title, blurb }) => (
            <div
              key={step}
              className="group relative rounded-3xl border border-navy-100 bg-white p-8 shadow-card transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lift"
            >
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-navy-700 text-2xl font-bold text-white shadow-lift">
                {step}
              </span>
              <h2 className="mt-6 text-xl font-bold text-navy-900">{title}</h2>
              <p className="mt-3 text-base leading-relaxed text-navy-600">
                {blurb}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What you'll need — eligibility checklist in a single card. */}
      <section className="container-x pb-16 lg:pb-20">
        <div className="grid items-center gap-10 rounded-4xl bg-linear-to-br from-navy-50 to-white p-8 shadow-card md:grid-cols-2 lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Before you start
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900">
              What you&apos;ll need
            </h2>
            <p className="mt-4 text-base leading-relaxed text-navy-600">
              We use our own internal decisioning — there are no credit-bureau
              cutoffs and all credit tiers are welcome. You just need the
              essentials below to apply.
            </p>
          </div>
          <ul className="space-y-4">
            {REQUIREMENTS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800">
                  <FaCheck className="h-3 w-3" />
                </span>
                <span className="text-base text-navy-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Post-approval lifecycle timeline, driven off LIFECYCLE_STAGES so it
          stays in lockstep with the user's status page. */}
      {/* <section className="container-x pb-16 lg:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-900">
            What happens after you apply
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-600">
            You can track every milestone in real time from your portal.
          </p>
        </div>

        <ol className="mt-12 space-y-6 md:space-y-0">
          {LIFECYCLE_STAGES.map((stage, i) => (
            <li
              key={stage.key}
              className="relative flex gap-5 md:gap-6 md:pb-8 md:last:pb-0"
            >
              {i < LIFECYCLE_STAGES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-12 h-[calc(100%-1.5rem)] w-px bg-linear-to-b from-blue-200 to-navy-100 md:left-6"
                />
              )}
              <span
                className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lift md:h-12 md:w-12 md:text-base ${
                  i === LIFECYCLE_STAGES.length - 1
                    ? "bg-linear-to-br from-star-400 to-star-600"
                    : "bg-linear-to-br from-blue-600 to-navy-700"
                }`}
              >
                {i + 1}
              </span>
              <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition hover:border-blue-200 hover:shadow-lift md:flex-1">
                <h3 className="text-base font-semibold text-navy-900">
                  {stage.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">
                  {stage.blurb}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section> */}

      <Faq items={FAQS} />
      <CtaBand />
    </>
  );
}
