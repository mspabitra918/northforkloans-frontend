import Link from "next/link";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { BRAND, telHref } from "@/src/lib/constants";

export const metadata: import("next").Metadata = {
  title: "Accessibility Statement | Northfork Loans",
  description:
    "Northfork Loans is committed to making its website accessible to everyone, targeting WCAG 2.1 AA conformance.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Accessibility Statement" />
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
            Our commitment
          </h2>
          <p className="text-navy-700 leading-relaxed">
            {BRAND.legalName} is committed to ensuring that {BRAND.domain} is
            accessible to everyone, including people with disabilities. We aim
            to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at
            the AA level, which describe how to make web content more accessible
            to a wide range of people.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Ongoing efforts
          </h2>
          <p className="text-navy-700 leading-relaxed">
            Accessibility is an ongoing effort. We regularly review our site,
            test with assistive technologies, and work to improve the experience
            for all users. We also consider accessibility as part of our design
            and development process for new features.
          </p>

          <h2 className="text-2xl font-bold text-navy-900 mt-10 mb-3">
            Feedback
          </h2>
          <p className="text-navy-700 leading-relaxed">
            We welcome your feedback. If you encounter any accessibility
            barriers or have suggestions for improvement, please contact us:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-navy-700">
            <li>
              Email:{" "}
              <a
                href={`mailto:${BRAND.email}`}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {BRAND.email}
              </a>
            </li>
            <li>
              Phone:{" "}
              <a
                href={telHref(BRAND.phone)}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {BRAND.phone}
              </a>
            </li>
            <li>
              Alternate Phone:{" "}
              <a
                href={telHref(BRAND.phoneAlt)}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {BRAND.phoneAlt}
              </a>
            </li>
          </ul>
          <p className="text-navy-700 leading-relaxed">
            We aim to respond to accessibility feedback within a reasonable
            timeframe.
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
