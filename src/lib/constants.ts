// Central source of truth for the business rules from the brief. Keeping these
// in one place means the marketing copy, JSON-LD schema, and form validation
// never drift apart.

export const BRAND = {
  name: "Oakhill Loans",
  legalName: "Oakhill Loans, LLC",
  domain: "oakhillloans.com",
  tagline: "Modern personal loans, funded in 24 hours.",
  phone: "888-392-2321",
  phoneAlt: "747-200-5220",
  email: "support@oakhillloans.com",
  address: {
    street: "1968 South Coast Highway #2900",
    city: "Laguna Beach",
    region: "CA",
    postalCode: "92651",
    country: "US",
  },
  geo: { lat: 33.5427, lng: -117.7854 },
} as const;

export const LOAN = {
  minAmount: 2000,
  maxAmount: 50000,
  apr: 10, // % fixed APR for all applicants
  collateral: false,
  upfrontFees: 0,
  fundingHours: 24,
  // Available term lengths in months.
  terms: [12, 24, 36, 48, 60],
  // Gatekeeper thresholds (mirror the backend Rules Engine).
  minMonthlyIncome: 1000, // gross; auto-decline below this
  maxDtiPercent: 45, // DTI at/above this routes to manual underwriting
} as const;

// The five sequential milestones a user can see on their status page, in order.
// DECLINED is a terminal off-ramp handled separately.
export const LIFECYCLE_STAGES = [
  {
    key: "APPLICATION_SUBMITTED",
    label: "Application Submitted",
    blurb:
      "Your details are safely stored. Next, connect your bank to verify your account.",
  },
  {
    key: "PHONE_VERIFICATION_PENDING",
    label: "Phone Verification",
    blurb: "A loan specialist will confirm a few details with you by phone.",
  },
  {
    key: "SIGN_LOAN_AGREEMENT",
    label: "Sign Agreement",
    blurb: "Review and e-sign your loan agreement from this portal.",
  },
  {
    key: "FUNDED",
    label: "Funded",
    blurb: "Your funds are on the way — typically within 24 hours via ACH.",
  },
] as const;

// BANK_VERIFICATION_PENDING is a real backend status but is treated as part of
// the first milestone from the user's point of view (it just means "go verify").
export const STATUS_TO_STAGE_INDEX: Record<string, number> = {
  APPLICATION_SUBMITTED: 0,
  PENDING: 0,
  PENDING_VERIFICATION: 0,
  MANUAL_REVIEW: 0,

  SIGN_LOAN_AGREEMENT: 1,

  FUNDED: 2,

  DECLINED: -1,
  BANK_REJECTED: -1,
};

export const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/rates-terms", label: "Rates & Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
] as const;

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Tel-href safe version of a display phone number ("888-392-2321" -> "+18883922321").
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+1${digits.replace(/^1/, "")}`;
}

// The 3-step process shown on the homepage and /how-it-works.
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Apply in minutes",
    blurb:
      "Tell us how much you need and a few details about your income and housing. It takes about 3 minutes and won't affect your credit score.",
  },
  {
    step: 2,
    title: "Verify your details",
    blurb:
      "Securely connect your bank so we can confirm your account, then e-sign your agreement. A specialist may call to confirm a few details.",
  },
  {
    step: 3,
    title: "Get funded",
    blurb:
      "Once you're approved and verified, we send your funds by ACH — typically within 24 hours of signing.",
  },
] as const;

export type SeoPage = {
  slug: string;
  eyebrow: string;
  h1: string;
  span: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  benefits: { title: string; blurb: string }[];
};

// SEO/AEO landing pages. Each renders through the shared landing template so the
// 10% APR / $2k–$50k / 24-hour terms stay identical across every keyword page.
export const SEO_PAGES: SeoPage[] = [
  {
    slug: "debt-consolidation",
    eyebrow: "Debt consolidation loans",
    h1: "Consolidate your debt into",
    span: "one fixed payment",
    intro:
      "Roll high-interest balances into a single personal loan with a fixed 10% APR — no collateral, no upfront fees, and a predictable monthly payment.",
    metaTitle: "Debt Consolidation Loans — Fixed 10% APR, Funded in 24 Hours",
    metaDescription:
      "Consolidate credit cards and high-interest debt with a fixed 10% APR personal loan from $2,000 to $50,000. No upfront fees. Funded within 24 hours, nationwide.",
    benefits: [
      {
        title: "One predictable payment",
        blurb:
          "Replace several variable-rate balances with a single fixed monthly payment you can plan around.",
      },
      {
        title: "A rate that never changes",
        blurb:
          "Every applicant gets the same fixed 10% APR — no teaser rates, no surprises later.",
      },
      {
        title: "No collateral required",
        blurb:
          "Your loan is unsecured, so you never have to put up your home or car.",
      },
    ],
  },
  {
    slug: "bad-credit-loans",
    eyebrow: "Personal loans for all credit tiers",
    h1: "Personal loans for ",
    span: "less-than-perfect credit",
    intro:
      "We use 100% internal decisioning — not a single credit-bureau cutoff — so all credit tiers are welcome to apply for a fixed 10% APR loan.",
    metaTitle: "Bad Credit Personal Loans — All Credit Tiers, Fixed 10% APR",
    metaDescription:
      "Personal loans for bad credit with a fixed 10% APR from $2,000 to $50,000. All credit tiers considered using internal decisioning. No upfront fees, funded in 24 hours.",
    benefits: [
      {
        title: "All credit tiers welcome",
        blurb:
          "We look at your full picture — income and affordability — not just a single score.",
      },
      {
        title: "Checking your rate is soft",
        blurb:
          "Seeing your offer won't affect your credit score, so it's safe to apply.",
      },
      {
        title: "The same fixed 10% APR",
        blurb:
          "Your rate doesn't change based on your credit tier — everyone gets 10% APR.",
      },
    ],
  },
  {
    slug: "medical-loans",
    eyebrow: "Medical & dental loans",
    h1: "Cover medical bills",
    span: "without the wait",
    intro:
      "From dental work to an unexpected procedure, fund medical expenses with a fixed 10% APR personal loan and get money in as little as 24 hours.",
    metaTitle: "Medical Loans — Fund Health Bills at a Fixed 10% APR",
    metaDescription:
      "Pay for medical, dental, and health expenses with a fixed 10% APR personal loan from $2,000 to $50,000. No collateral, no upfront fees, funded within 24 hours.",
    benefits: [
      {
        title: "Money when you need it",
        blurb:
          "Funded within 24 hours of signing so you can move forward with care.",
      },
      {
        title: "Use it anywhere",
        blurb:
          "Unlike provider financing, your funds go to your bank — use them at any clinic.",
      },
      {
        title: "No upfront fees",
        blurb: "$0 origination fees, so the full amount goes toward your care.",
      },
    ],
  },
  {
    slug: "home-improvement-loans",
    eyebrow: "Home improvement loans",
    h1: "Fund your next ",
    span: "home project",
    intro:
      "Repairs, renovations, or that long-overdue upgrade — finance home improvements with a fixed 10% APR personal loan and no home equity required.",
    metaTitle: "Home Improvement Loans — Fixed 10% APR, No Equity Needed",
    metaDescription:
      "Finance home improvements with a fixed 10% APR personal loan from $2,000 to $50,000. No collateral or home equity required. No upfront fees, funded in 24 hours.",
    benefits: [
      {
        title: "No home equity required",
        blurb:
          "An unsecured loan means no liens on your home and no lengthy appraisals.",
      },
      {
        title: "Start sooner",
        blurb:
          "Funded within 24 hours of signing so your project doesn't stall.",
      },
      {
        title: "A fixed, plannable payment",
        blurb:
          "Budget your renovation around one steady monthly payment at 10% APR.",
      },
    ],
  },
  {
    slug: "emergency-loans",
    eyebrow: "Emergency loans",
    h1: "Fast funding for life's emergencies",
    span: "life's emergencies",
    intro:
      "When something unexpected hits, get a fixed 10% APR personal loan funded in as little as 24 hours — no collateral and no upfront fees.",
    metaTitle: "Emergency Loans — Funded in 24 Hours at a Fixed 10% APR",
    metaDescription:
      "Emergency personal loans with a fixed 10% APR from $2,000 to $50,000, funded within 24 hours. No collateral, no upfront fees, all credit tiers considered.",
    benefits: [
      {
        title: "24-hour funding goal",
        blurb:
          "Once you sign and verify your bank, we aim to fund within 24 hours.",
      },
      {
        title: "No upfront cost",
        blurb: "Nothing to pay to apply — $0 origination fees, ever.",
      },
      {
        title: "Apply any time",
        blurb:
          "The application is online and takes only a few minutes to complete.",
      },
    ],
  },
];

// Shared FAQ used on the homepage, rates page, and landing pages (also powers
// FAQPage JSON-LD for AEO).
export const FAQS = [
  {
    question: "What is the interest rate?",
    answer:
      "Every approved applicant receives the same fixed 10% APR. The rate does not vary by credit score, loan amount, or term.",
  },
  {
    question: "How much can I borrow?",
    answer:
      "Personal loans range from $2,000 to $50,000. The amount you're approved for depends on your income and existing monthly obligations.",
  },
  {
    question: "Are there any upfront fees?",
    answer:
      "No. There are $0 origination or application fees. You never pay anything to apply or to receive your funds.",
  },
  {
    question: "How fast will I get my money?",
    answer:
      "Our goal is to fund within 24 hours after you e-sign your agreement and your bank account is verified, sent via ACH.",
  },
  {
    question: "Will applying affect my credit score?",
    answer:
      "Checking your rate does not affect your credit score. We use our own internal decisioning rather than external credit-bureau cutoffs.",
  },
  {
    question: "What do I need to qualify?",
    answer:
      "You'll need a gross monthly income of at least $1,000, a valid U.S. bank account (no prepaid cards), and to be a U.S. resident.",
  },
] as const;

// Housing options for the application form. Conditional fields key off these.
export const HOUSING_OPTIONS = [
  { value: "RENT", label: "Rent" },
  { value: "OWN_MORTGAGE", label: "Own — with a mortgage" },
  { value: "OWN_PAID", label: "Own — paid off" },
] as const;

// Account-age buckets collected during bank verification.
export const ACCOUNT_AGE_OPTIONS = [
  { value: "LT_3M", label: "Less than 3 months" },
  { value: "3_12M", label: "3–12 months" },
  { value: "1_3Y", label: "1–3 years" },
  { value: "GT_3Y", label: "More than 3 years" },
] as const;

export const DECISION_COPY: Record<
  string,
  { heading: string; body: string; tone: "good" | "review" | "bad" }
> = {
  PENDING_VERIFICATION: {
    heading: "You're pre-qualified",
    body: "Great news — based on your details you're pre-qualified. We'll verify your bank and reach out with next steps, typically within one business day.",
    tone: "good",
  },
  MANUAL_REVIEW: {
    heading: "Application received — under review",
    body: "Thanks for applying. Your application needs a quick look from our underwriting team. We'll be in touch within one business day.",
    tone: "review",
  },
  BANK_REJECTED: {
    heading: "We need a different bank account",
    body: "We can't use the bank account you provided (prepaid cards and certain neobank accounts aren't eligible). Check your email for a link to add a different checking account.",
    tone: "bad",
  },
  DECLINED: {
    heading: "We're unable to approve this application",
    body: "Based on the details provided we're unable to move forward at this time. Thank you for considering Oakhill Loans.",
    tone: "bad",
  },
};

export const PURPOSE_OPTIONS = [
  "Debt consolidation",
  "Medical",
  "Home improvement",
  "Emergency",
  "Other",
] as const;

// Housing statuses that imply a recurring monthly housing payment.
export const HOUSING_WITH_PAYMENT = new Set(["RENT", "OWN_MORTGAGE"]);

export const STEPS = [
  { id: 0, label: "Loan basics" },
  { id: 1, label: "About you" },
  { id: 2, label: "Income & housing" },
  { id: 3, label: "Bank details" },
  { id: 4, label: "Review" },
] as const;

export function estimateMonthlyPayment(principal: number, term = 24): number {
  const r = LOAN.apr / 100 / 12;
  const n = term;
  if (principal <= 0) return 0;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

export function clampAmount(value: number): number {
  if (Number.isNaN(value)) return LOAN.minAmount;
  return Math.min(LOAN.maxAmount, Math.max(LOAN.minAmount, value));
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
];
