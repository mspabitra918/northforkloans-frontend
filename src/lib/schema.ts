// JSON-LD structured-data builders. These are injected into pages via the
// <JsonLd> component to maximize SEO/AEO indexability. Every loan-bearing page
// declares the 10% APR, the $2k–$50k range, and the lack of collateral
// explicitly so answer engines can quote exact terms.

import { BRAND, LOAN } from "./constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    telephone: BRAND.phone,
    email: BRAND.email,
    areaServed: "US",
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.address.street,
      addressLocality: BRAND.address.city,
      addressRegion: BRAND.address.region,
      postalCode: BRAND.address.postalCode,
      addressCountry: BRAND.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BRAND.geo.lat,
      longitude: BRAND.geo.lng,
    },
  };
}

// Combined FinancialProduct + LoanOrCredit describing the core offering.
export function loanProductSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["FinancialProduct", "LoanOrCredit"],
    "@id": `${SITE_URL}/#personal-loan`,
    name: "Northfork Loans Unsecured Personal Loan",
    description: `Unsecured personal loans from ${formatRange()} at a fixed ${LOAN.apr}% APR, with no upfront fees and funding within ${LOAN.fundingHours} hours. All credit tiers considered.`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "US",
    loanType: "Unsecured Personal Loan",
    requiredCollateral: "None",
    amount: {
      "@type": "MonetaryAmount",
      currency: "USD",
      minValue: LOAN.minAmount,
      maxValue: LOAN.maxAmount,
    },
    annualPercentageRate: {
      "@type": "QuantitativeValue",
      value: LOAN.apr,
      unitText: "PERCENT",
    },
    interestRate: {
      "@type": "QuantitativeValue",
      value: LOAN.apr,
      unitText: "PERCENT",
    },
    feesAndCommissionsSpecification:
      "No application or processing fees ($0 upfront).",
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}

function formatRange(): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  return `${fmt(LOAN.minAmount)} to ${fmt(LOAN.maxAmount)}`;
}
