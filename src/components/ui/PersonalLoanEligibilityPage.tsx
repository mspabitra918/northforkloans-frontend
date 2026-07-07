export default function PersonalLoanEligibilityPage() {
  const requirements = [
    {
      title: "Minimum Monthly Income",
      description:
        "Applicants must have a minimum gross monthly income of $1,000. Applications below this amount are automatically declined.",
    },
    {
      title: "Eligible U.S. Bank Account",
      description:
        "A valid U.S. checking account is required. Prepaid cards and restricted bank routing numbers are not accepted.",
    },
    {
      title: "Debt-to-Income (DTI) Review",
      description:
        "We calculate your Debt-to-Income (DTI) ratio using your housing payment, other monthly debts, estimated loan payment, and gross monthly income.",
    },
    {
      title: "Identity & Bank Verification",
      description:
        "Approved applicants may be required to complete bank verification before funding.",
    },
    {
      title: "Electronic Signature",
      description:
        "Approved applicants must review and electronically sign their loan documents before funds can be released.",
    },
    {
      title: "Funding Timeline",
      description:
        "After bank verification and e-sign completion, our goal is to fund approved loans within 24 hours.",
    },
  ];

  const checklist = [
    "Minimum gross monthly income of $1,000",
    "Valid U.S. checking account",
    "Monthly housing payment information",
    "Other monthly debt information",
    "Requested loan amount",
    "Phone number and email address",
  ];

  return (
    <main className="bg-gray-50">
      {/* Hero */}
      {/* <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
               Northfork Loans
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl">
              Personal Loan Eligibility
            </h1>

            <p className="mt-6 text-lg text-slate-300">
              Review the basic eligibility requirements before applying for a
              personal loan. Our application process is simple, transparent, and
              designed to provide fast decisions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/apply"
                className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Apply Now
              </a>

              <a
                href="/rates-terms"
                className="rounded-lg border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
              >
                Rates & Terms
              </a>
            </div>
          </div>
        </div>
      </section> */}

      {/* Basic Requirements */}
      {/* <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Basic Requirements
          </h2>

          <p className="mt-4 text-gray-600">
            Every application is reviewed using our internal lending guidelines.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {requirements.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                ✅
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-7">{item.description}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Before You Apply */}
      <section className="bg-white  pt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Basic Requirements
          </h2>

          <p className="mt-4 text-gray-600">
            Every application is reviewed using our internal lending guidelines.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Before You Apply
            </h2>

            <p className="mt-4 text-gray-600 leading-7">
              Having the following information ready can help you complete your
              application more quickly.
            </p>

            <ul className="mt-8 space-y-4">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-emerald-600">✔</span>

                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-900 p-10 text-white">
            <h3 className="text-2xl font-bold">
              How Your Application Is Reviewed
            </h3>

            <div className="mt-8 space-y-6">
              <div>
                <span className="font-semibold">Step 1</span>
                <p className="mt-2 text-slate-300">
                  Submit your application with your financial and bank
                  information.
                </p>
              </div>

              <div>
                <span className="font-semibold">Step 2</span>
                <p className="mt-2 text-slate-300">
                  Our system reviews your income, bank routing number, and
                  debt-to-income ratio.
                </p>
              </div>

              <div>
                <span className="font-semibold">Step 3</span>
                <p className="mt-2 text-slate-300">
                  Qualified applicants continue through verification before
                  funding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* <section className="bg-emerald-600">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center text-white">
          <h2 className="text-4xl font-bold">Ready to Apply?</h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-emerald-100">
            If you meet the eligibility requirements, you can complete your
            online application in just a few minutes.
          </p>

          <a
            href="/apply"
            className="mt-10 inline-flex rounded-xl bg-white px-8 py-4 font-semibold text-emerald-700 transition hover:bg-gray-100"
          >
            Start Your Application
          </a>
        </div>
      </section> */}
    </main>
  );
}
