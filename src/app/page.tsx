import Link from "next/link";
import {
  FaArrowRightLong,
  FaBolt,
  FaShieldHalved,
  FaStar,
  FaSackDollar,
  FaPercent,
  FaRegClock,
  FaRegFileLines,
  FaRegCreditCard,
  FaHeartPulse,
  FaScrewdriverWrench,
  FaUmbrella,
} from "react-icons/fa6";
import { Faq } from "@/src/components/ui/Faq";
import { CtaBand } from "@/src/components/ui/CtaBand";
import { JsonLd } from "@/src/components/layout/JsonLd";
import { faqSchema } from "@/src/lib/schema";
import {
  LOAN,
  HOW_IT_WORKS,
  SEO_PAGES,
  FAQS,
  formatUSD,
} from "@/src/lib/constants";
import BenefitsSection from "../components/ui/BenefitsFeatures";
import PersonalLoanEligibilityPage from "../components/ui/PersonalLoanEligibilityPage";

// The four rows in the floating "Borrow with confidence" card, driven off the
// shared LOAN constants so the headline figures never drift from the schema.
const CARD_ROWS = [
  {
    icon: FaSackDollar,
    label: "Loan amounts",
    value: `${formatUSD(LOAN.minAmount)} – ${formatUSD(LOAN.maxAmount)}`,
  },
  { icon: FaPercent, label: "Fixed APR", value: `${LOAN.apr}%` },
  {
    icon: FaRegClock,
    label: "Funding time",
    value: `Within ${LOAN.fundingHours} hours`,
  },
  { icon: FaRegFileLines, label: "Hidden fees", value: "No hidden fees" },
];

const TRUST_BADGES = [
  {
    icon: FaBolt,
    title: "Fast funding",
    blurb: `Within ${LOAN.fundingHours} hours`,
  },
  {
    icon: FaShieldHalved,
    title: "Safe & secure",
    blurb: "Bank-grade encryption",
  },
  {
    icon: FaStar,
    title: "Trusted by thousands",
    blurb: "4.9/5 average rating",
  },
];

// Icon lookup so each "what people borrow for" card gets a relevant glyph.
const PURPOSE_ICONS: Record<string, typeof FaRegCreditCard> = {
  "debt-consolidation": FaRegCreditCard,
  "bad-credit-loans": FaShieldHalved,
  "medical-loans": FaHeartPulse,
  "home-improvement-loans": FaScrewdriverWrench,
  "emergency-loans": FaUmbrella,
};

export default function Home() {
  return (
    <>
      {/* FAQ rich result for the homepage. Organization + LoanOrService schema
          already ship from the root layout. */}
      <JsonLd data={[faqSchema([...FAQS])]} />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {/* Decorative gradient glows + grid for depth. */}
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
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Left — value proposition */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-star-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-star-400" />
                </span>
                <span className="text-sm font-medium text-navy-100">
                  Now lending in all 50 states
                </span>
              </div>

              <h1 className="mt-7 text-5xl font-bold leading-[1.04] tracking-tight md:text-6xl">
                Personal loans
                <br />
                that move{" "}
                <span className="bg-linear-to-r from-blue-400 to-star-300 bg-clip-text text-transparent">
                  as fast
                </span>
                <br />
                <span className="bg-linear-to-r from-blue-400 to-star-300 bg-clip-text text-transparent">
                  as you do.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">
                Borrow {formatUSD(LOAN.minAmount)}–{formatUSD(LOAN.maxAmount)}{" "}
                at a fixed {LOAN.apr}% APR. No collateral, no upfront fees, and
                funding within {LOAN.fundingHours} hours of approval.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/apply"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                >
                  Apply Now — it&apos;s fast{" "}
                  <FaArrowRightLong className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                >
                  How it works <FaArrowRightLong />
                </Link>
              </div>

              <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
                {TRUST_BADGES.map(({ icon: Icon, title, blurb }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-star-300 ring-1 ring-inset ring-white/10">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <dt className="text-sm font-semibold text-white">
                        {title}
                      </dt>
                      <dd className="text-sm text-navy-300">{blurb}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right — floating product card */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-4xl bg-linear-to-br from-blue-500/30 via-transparent to-star-500/20 blur-2xl" />
              <div className="overflow-hidden rounded-3xl bg-linear-to-br from-white/15 to-white/5 p-px shadow-lift ring-1 ring-white/10">
                <div className="rounded-[1.45rem] bg-white p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Borrow with confidence
                    </p>
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      Soft check
                    </span>
                  </div>
                  <div className="mt-5 divide-y divide-navy-100">
                    {CARD_ROWS.map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium text-navy-500">
                            {label}
                          </span>
                        </div>
                        <span className="text-base font-bold text-navy-900">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/apply"
                    className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Check your rate{" "}
                    <FaArrowRightLong className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <p className="mt-3 text-center text-xs text-navy-400">
                    Checking your rate won&apos;t affect your credit score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <section className="container-x py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            From application to deposit in three steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-600">
            The whole process is built to be fast and transparent — most
            applicants are funded within {LOAN.fundingHours} hours of signing.
          </p>
        </div>
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
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
              <h3 className="mt-6 text-xl font-bold text-navy-900">{title}</h3>
              <p className="mt-3 text-base leading-relaxed text-navy-600">
                {blurb}
              </p>
            </div>
          ))}
        </div>
      </section>

      <BenefitsSection />

      <PersonalLoanEligibilityPage />

      {/* ─── What people borrow for ───────────────────────────────────────── */}
      <section className="bg-linear-to-b from-white to-navy-50">
        <div className="container-x py-16 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              One loan, many reasons
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              What people use Northfork for
            </h2>
            <p className="mt-4 text-base leading-relaxed text-navy-600">
              Whatever you need it for, the terms stay the same — a fixed{" "}
              {LOAN.apr}% APR, no collateral, and no upfront fees.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SEO_PAGES.map(({ slug, eyebrow, h1 }) => {
              const Icon = PURPOSE_ICONS[slug] ?? FaSackDollar;
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="group flex flex-col rounded-3xl border border-navy-100 bg-white p-7 shadow-card transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-navy-900">
                    {eyebrow}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">
                    {h1}.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    Learn more
                    <FaArrowRightLong className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Faq items={FAQS} />

      {/* <CtaBand /> */}
    </>
  );
}
