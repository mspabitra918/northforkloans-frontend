import Link from "next/link";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { BRAND } from "@/src/lib/constants";

export const metadata: import("next").Metadata = {
  title: "Privacy Policy | Northfork Loans",
  description:
    "How Northfork Loans collects, uses, protects, and shares your personal information, including your GLBA and CCPA privacy rights.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <section className="container-x pb-20">
        <div className="max-w-3xl space-y-6">
          <div className="rounded-xl border border-star-200 bg-star-50 p-4 text-sm text-navy-700 mt-4">
            This is a template and should be reviewed by qualified counsel
            before launch.
          </div>

          <p className="text-navy-700 leading-relaxed">
            Last updated: June 2026
          </p>

          <p className="text-navy-700 leading-relaxed">
            {BRAND.legalName} (&ldquo;{BRAND.name},&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This
            Privacy Policy explains what information we collect when you apply
            for or service a loan through {BRAND.domain}, how we use it, and the
            rights you have over it.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Information we collect
          </h2>
          <p className="text-navy-700 leading-relaxed">
            To evaluate and service a loan application, we collect personally
            identifiable information (PII) that may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>
              Your name, date of birth, and contact details (address, email,
              phone)
            </li>
            <li>Income, employment, and housing information</li>
            <li>
              Bank account and routing details used for verification and funding
            </li>
            <li>Your Social Security number (SSN) for identity verification</li>
            <li>
              Device and usage information generated when you visit our site
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            How we use your information
          </h2>
          <p className="text-navy-700 leading-relaxed">
            We use the information we collect to make loan decisions, verify
            your identity and bank account, fund and service your loan,
            communicate with you, prevent fraud, and comply with applicable law.
            We do not sell your personal information.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            How we protect your information
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Sensitive PII is encrypted at rest and in transit using industry-
            standard encryption. Access is restricted to personnel and service
            providers who need it to perform their duties, and we maintain
            administrative, technical, and physical safeguards designed to
            protect your data.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            How we share your information
          </h2>
          <p className="text-navy-700 leading-relaxed">
            We share information only as needed to operate our business,
            including with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>
              Service providers who help us verify identity, process payments,
              fund loans, and operate our platform under contractual
              confidentiality obligations
            </li>
            <li>
              Regulators, law enforcement, or other parties when required by law
              or to protect our rights
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Conversion measurement
          </h2>
          <p className="text-navy-700 leading-relaxed">
            We measure advertising performance using server-side conversion
            measurement. We do not load third-party browser pixels that carry
            your loan data, and sensitive application details are never embedded
            in client-side tracking tags.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Your privacy rights
          </h2>
          <p className="text-navy-700 leading-relaxed">
            As a financial institution, we provide privacy notices consistent
            with the Gramm-Leach-Bliley Act (GLBA). Depending on where you live,
            the California Consumer Privacy Act (CCPA) and similar state laws
            may give you the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>
              Request access to the personal information we hold about you
            </li>
            <li>
              Request deletion of your personal information, subject to legal
              exceptions
            </li>
            <li>Opt out of certain sharing of your personal information</li>
            <li>Not be discriminated against for exercising your rights</li>
          </ul>
          <p className="text-navy-700 leading-relaxed">
            To exercise any of these rights, contact us at {BRAND.email}.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Data retention
          </h2>
          <p className="text-navy-700 leading-relaxed">
            We retain your information for as long as needed to provide our
            services and to satisfy legal, regulatory, tax, accounting, and
            recordkeeping obligations. When information is no longer required,
            we securely delete or de-identify it.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Children&apos;s privacy
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Our services are intended only for adults 18 and older. We do not
            knowingly collect personal information from children. If we learn we
            have collected such information, we will delete it.
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
