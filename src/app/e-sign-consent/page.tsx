import Link from "next/link";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { BRAND } from "@/src/lib/constants";

export const metadata: import("next").Metadata = {
  title: "E-Sign Consent Disclosure | Northfork Loans",
  description:
    "Your consent to receive records electronically and to use electronic signatures when applying for a loan with Northfork Loans.",
  alternates: { canonical: "/e-sign-consent" },
};

export default function ESignConsentPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="E-Sign Consent Disclosure" />
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
            Consent to electronic records and signatures
          </h2>
          <p className="text-navy-700 leading-relaxed">
            By applying with {BRAND.legalName} (&ldquo;{BRAND.name}&rdquo;), you
            agree to receive disclosures, notices, agreements, and other records
            electronically, and to use electronic signatures, under the federal
            E-Sign Act and applicable state law. Your electronic signature has
            the same legal effect as a handwritten signature.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Scope of your consent
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Your consent applies to all records related to your application and
            any loan you receive, including your loan agreement, account
            statements, privacy notices, and required legal disclosures. We may
            still choose to provide certain records on paper when required by
            law.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Hardware and software requirements
          </h2>
          <p className="text-navy-700 leading-relaxed">
            To access and retain electronic records, you will need:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>A computer or mobile device with internet access</li>
            <li>A current version of a major web browser</li>
            <li>A valid email account and the ability to receive email</li>
            <li>Software capable of viewing and saving PDF documents</li>
            <li>
              Sufficient storage or a printer to retain copies of your records
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Right to withdraw consent
          </h2>
          <p className="text-navy-700 leading-relaxed">
            You may withdraw your consent to receive records electronically at
            any time by contacting us at {BRAND.email}. Withdrawing consent will
            not affect the legal validity of records provided before your
            withdrawal, and may delay or prevent your ability to complete an
            application online.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Requesting paper copies
          </h2>
          <p className="text-navy-700 leading-relaxed">
            You may request a paper copy of any electronic record at no charge
            by contacting us at {BRAND.email} or by calling {BRAND.phone}.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Keeping your contact information current
          </h2>
          <p className="text-navy-700 leading-relaxed">
            It is your responsibility to keep your email address and other
            contact information current so that we can deliver records to you.
            You can update your information by contacting us at {BRAND.email}.
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
