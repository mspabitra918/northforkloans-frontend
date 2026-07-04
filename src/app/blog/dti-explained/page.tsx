import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { CtaBand } from "@/src/components/ui/CtaBand";

export const metadata: import("next").Metadata = {
  title: "DTI Explained: What Your Debt-to-Income Ratio Means | Oakhill Loans",
  description:
    "A plain-language guide to your debt-to-income ratio: how it's calculated, why lenders use it, what counts as a good DTI, and how to improve yours.",
  alternates: { canonical: "/blog/dti-explained" },
};

export default function DtiExplainedPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="DTI Explained: What Your"
        highlight=" Debt-to-Income Ratio Means"
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
            If you have ever applied for a loan, you may have come across the
            term &ldquo;DTI,&rdquo; or debt-to-income ratio. It is one of the
            most important numbers in personal finance, yet it rarely gets
            explained clearly. Understanding your DTI can help you borrow more
            confidently and make better decisions about your money.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            What is debt-to-income ratio?
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Your debt-to-income ratio is the percentage of your gross monthly
            income that goes toward paying your monthly debt obligations.
            &ldquo;Gross&rdquo; income means your pay before taxes and
            deductions. In short, DTI compares what you owe each month to what
            you earn each month. A lower ratio means a smaller share of your
            income is already committed to debt.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            How DTI is calculated
          </h2>
          <p className="text-navy-700 leading-relaxed">
            The formula is straightforward: divide your total monthly debt
            payments by your gross monthly income, then multiply by 100 to get a
            percentage. Lenders often look at two versions of this ratio:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>
              <strong>Front-end DTI</strong> includes only housing costs, such
              as rent or your mortgage payment.
            </li>
            <li>
              <strong>Back-end DTI</strong> includes all recurring debt: housing
              plus car loans, student loans, credit card minimums, and personal
              loans. This is the figure most lenders focus on.
            </li>
          </ul>
          <p className="text-navy-700 leading-relaxed">
            Here is a quick example. Say you earn $4,000 in gross monthly
            income. Your rent is $1,200, your car payment is $300, and your
            credit card minimums total $100. Your total monthly debt is $1,600.
            Dividing $1,600 by $4,000 gives 0.40, or a back-end DTI of 40%.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Why lenders use DTI
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Lenders use DTI as a measure of affordability. Your credit score
            tells a lender how reliably you have repaid debt in the past, but
            DTI tells them whether you can realistically take on a new payment
            today. A borrower with a low DTI has more room in their budget,
            which generally means a lower risk of falling behind on a new loan.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            What counts as a good DTI?
          </h2>
          <p className="text-navy-700 leading-relaxed">
            As a general guide, a back-end DTI below 36% is considered healthy,
            and gives you the most flexibility. Ratios between 36% and 43% are
            often still workable but leave less breathing room. Once your DTI
            climbs above 43%, many lenders begin to view new borrowing as
            higher-risk. These are rules of thumb, not hard rules, and they vary
            by lender and loan type.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            How to improve your DTI
          </h2>
          <p className="text-navy-700 leading-relaxed">
            There are two levers you can pull: reduce your debt or increase your
            income. Practical steps include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>
              Paying down high-balance accounts to lower your monthly minimums
            </li>
            <li>Avoiding new debt while you work toward a goal</li>
            <li>Refinancing or consolidating to a lower monthly payment</li>
            <li>
              Adding income through a raise, side work, or a second earner
            </li>
          </ul>
          <p className="text-navy-700 leading-relaxed">
            Even small reductions in monthly obligations can move your ratio in
            the right direction over time.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            How Oakhill approaches it
          </h2>
          <p className="text-navy-700 leading-relaxed">
            At Oakhill Loans, we use our own internal decisioning rather than a
            single credit-bureau cutoff. We look at your full picture, including
            income and affordability, so your DTI is one factor among several
            rather than a hard pass-or-fail gate. That means it is always worth
            checking your rate, which never affects your credit score.
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
