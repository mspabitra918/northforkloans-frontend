import Link from "next/link";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { BRAND, LOAN, formatUSD } from "@/src/lib/constants";

export const metadata: import("next").Metadata = {
  title: "Terms of Service | Northfork Loans",
  description:
    "The terms and conditions that govern your use of Northfork Loans, including eligibility, loan offer details, disclaimers, and governing law.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" />
      <section className="container-x pb-20">
        <div className="max-w-3xl space-y-6">
          <div className="rounded-xl border border-star-200 bg-star-50 p-4 text-sm text-navy-700 mt-4">
            This is a template and should be reviewed by qualified counsel
            before launch.
          </div>

          <p className="text-navy-700 leading-relaxed">
            Last updated: June 2026
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Acceptance of these terms
          </h2>
          <p className="text-navy-700 leading-relaxed">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
            and use of {BRAND.domain} and the services offered by{" "}
            {BRAND.legalName} (&ldquo;{BRAND.name}&rdquo;). By accessing our
            site or applying for a loan, you agree to these Terms. If you do not
            agree, do not use our services.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Eligibility
          </h2>
          <p className="text-navy-700 leading-relaxed">To apply, you must:</p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>Be at least 18 years old</li>
            <li>Be a U.S. resident with a valid U.S. bank account</li>
            <li>
              Have a gross monthly income of at least{" "}
              {formatUSD(LOAN.minMonthlyIncome)}
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            The loan offer
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Subject to approval and bank verification, we offer unsecured
            personal loans with the following terms:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>A fixed {LOAN.apr}% APR for every approved applicant</li>
            <li>
              Loan amounts from {formatUSD(LOAN.minAmount)} to{" "}
              {formatUSD(LOAN.maxAmount)}
            </li>
            <li>
              {formatUSD(LOAN.upfrontFees)} origination and application fees
            </li>
            <li>
              A funding goal of {LOAN.fundingHours} hours after you sign and
              your bank account is verified
            </li>
          </ul>
          <p className="text-navy-700 leading-relaxed">
            All offers are subject to approval, identity verification, and
            successful bank account verification. We may decline any application
            at our discretion.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Electronic communications
          </h2>
          <p className="text-navy-700 leading-relaxed">
            By using our services, you consent to receive communications,
            disclosures, and agreements from us electronically. Your consent to
            electronic records and signatures is described in our{" "}
            <Link
              href="/e-sign-consent"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              E-Sign Consent Disclosure
            </Link>
            .
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Eligible accounts
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Loans must be funded to a standard U.S. checking account in your
            name. Prepaid cards and high-risk neobank accounts are not eligible
            and may result in a declined or reversed funding.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Accuracy of information
          </h2>
          <p className="text-navy-700 leading-relaxed">
            You agree that all information you provide is true, accurate, and
            complete, and that you will keep it up to date. Providing false
            information may result in denial of your application or other
            action.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Intellectual property
          </h2>
          <p className="text-navy-700 leading-relaxed">
            All content on this site, including text, graphics, logos, and
            software, is owned by or licensed to {BRAND.name} and is protected
            by applicable intellectual property laws. You may not reproduce or
            distribute it without our written permission.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Disclaimers
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Our services are provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, whether express or
            implied. We do not warrant that the service will be uninterrupted,
            error-free, or secure.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Limitation of liability
          </h2>
          <p className="text-navy-700 leading-relaxed">
            To the fullest extent permitted by law, {BRAND.name} will not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising from your use of our services.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Governing law
          </h2>
          <p className="text-navy-700 leading-relaxed">
            These Terms are governed by the laws of the State of California,
            without regard to its conflict-of-laws principles.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Changes to these terms
          </h2>
          <p className="text-navy-700 leading-relaxed">
            We may update these Terms from time to time. Material changes will
            be posted on this page with an updated date, and your continued use
            of our services constitutes acceptance of the revised Terms.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Contact us
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Questions? Contact support@northforkloans.com or visit our{" "}
            <Link
              href="/contact"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              contact page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
