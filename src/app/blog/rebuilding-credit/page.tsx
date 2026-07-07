import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { CtaBand } from "@/src/components/ui/CtaBand";

export const metadata: import("next").Metadata = {
  title: "Rebuilding Credit: A Practical Step-by-Step Guide | Northfork Loans",
  description:
    "An actionable, step-by-step guide to rebuilding your credit, from checking your reports to lowering utilization and building consistent on-time payments.",
  alternates: { canonical: "/blog/rebuilding-credit" },
};

export default function RebuildingCreditPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Rebuilding Credit: A Practical"
        highlight="Step-by-Step Guide"
      />
      <section className="container-x pb-16">
        <div className="max-w-3xl space-y-6 mt-7">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            &larr; Back to blog
          </Link>

          <p className="text-navy-700 leading-relaxed">
            Rebuilding credit can feel overwhelming, but it is far more
            achievable than most people expect. Credit scores respond to
            consistent, positive habits over time. There is no overnight fix,
            but there is a clear path. Here is a practical, step-by-step guide
            to get you moving in the right direction.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Step 1: Check your credit reports
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Start by pulling your credit reports from all three major bureaus.
            You are entitled to free copies, and reviewing them is the only way
            to know exactly where you stand. Look for errors, accounts you do
            not recognize, and any negative marks. Disputing inaccurate
            information is one of the fastest ways to improve your score.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Step 2: Pay every bill on time
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Payment history is the single largest factor in most credit scores.
            Going forward, make every payment on time, every month. Setting up
            automatic payments or calendar reminders helps you avoid missed due
            dates. Even one late payment can set you back, so consistency here
            matters more than anything else.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Step 3: Lower your credit utilization
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Credit utilization is the percentage of your available credit you
            are using. Aim to keep it below 30%, and lower is better. If you
            can, pay balances down before the statement closing date so a
            smaller figure gets reported. Reducing utilization is often the
            quickest way to see your score move.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Step 4: Consider a secured card
          </h2>
          <p className="text-navy-700 leading-relaxed">
            If you are having trouble getting approved for new credit, a secured
            credit card can help. You put down a refundable deposit that becomes
            your credit limit, then use the card for small purchases and pay it
            off in full each month. Used responsibly, it builds a positive
            payment history that reports to the bureaus.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Step 5: Avoid new hard inquiries
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Each time you apply for new credit, a hard inquiry can shave a few
            points off your score. While you are rebuilding, apply only when you
            genuinely need to. Where possible, look for lenders that let you
            check your rate with a soft inquiry that does not affect your score.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Step 6: Be patient and consistent
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Credit rebuilding is a marathon, not a sprint. Negative marks fade
            in impact over time, and the length of your positive history grows
            with every on-time payment. Keep your habits steady, review your
            progress every few months, and trust that the work compounds.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Where Northfork fits in
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Rebuilding credit does not mean you have to wait for funding when
            you need it. At Northfork Loans, all credit tiers are welcome to
            apply. We use internal decisioning that looks at your full financial
            picture, not just a single score, and checking your rate never
            affects your credit. A well-managed loan can even become another
            positive entry in your payment history.
          </p>
        </div>
      </section>

      <div className="container-x pb-8">
        <Link
          href="/blog"
          className="inline-flex max-w-3xl items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Back to blog <FaArrowRightLong />
        </Link>
      </div>

      <CtaBand />
    </>
  );
}
