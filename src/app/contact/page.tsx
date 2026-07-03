"use client";

import { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaArrowRightLong,
  FaCheck,
} from "react-icons/fa6";
import { BRAND, telHref } from "@/src/lib/constants";

type ContactMethod = {
  icon: typeof FaPhone;
  label: string;
  lines: { text: string; href?: string }[];
};

const CONTACT_METHODS: ContactMethod[] = [
  {
    icon: FaPhone,
    label: "Call us",
    lines: [
      { text: BRAND.phone, href: telHref(BRAND.phone) },
      { text: BRAND.phoneAlt, href: telHref(BRAND.phoneAlt) },
      { text: "Mon–Fri, 8am–6pm PT" },
    ],
  },
  {
    icon: FaEnvelope,
    label: "Email us",
    lines: [{ text: BRAND.email, href: `mailto:${BRAND.email}` }],
  },
  {
    icon: FaLocationDot,
    label: "Mailing address",
    lines: [
      { text: BRAND.address.street },
      {
        text: `${BRAND.address.city}, ${BRAND.address.region} ${BRAND.address.postalCode}`,
      },
    ],
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST to support inbox / NestJS
    setSubmitted(true);
  }

  return (
    <>
      {/* Plain header (kept inside the Client Component to avoid any
          server/client friction with shared layout components). */}

      <section className="relative overflow-hidden bg-navy-950 text-white">
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
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-star-400" />
              <span className="text-sm font-medium text-navy-100">
                Contact us
              </span>
            </div>
            <h1 className="mt-7 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              We&apos;re here{" "}
              <span className="bg-linear-to-r from-blue-400 to-star-300 bg-clip-text text-transparent">
                to help.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">
              Questions about your application or an existing loan? Reach our
              support team by phone, email, or mail — we serve borrowers in all
              50 states.
            </p>
          </div>
        </div>
      </section>

      {/* <section className="bg-linear-to-b from-navy-50 to-white">
        <div className="container-x py-16 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Contact us
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-navy-900 md:text-5xl">
              We&apos;re here to help
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">
              Questions about your application or an existing loan? Reach our
              support team by phone, email, or mail — we serve borrowers in all
              50 states.
            </p>
          </div>
        </div>
      </section> */}

      <section className="container-x py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-1 lg:gap-16">
          {/* LEFT — contact methods */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy-900">
              Get in touch
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {CONTACT_METHODS.map(({ icon: Icon, label, lines }) => (
                <li
                  key={label}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300  hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900">
                    {label}
                  </h3>

                  <div className="mt-3 space-y-2">
                    {lines.map((line) =>
                      line.href ? (
                        <a
                          key={line.text}
                          href={line.href}
                          className="block text-slate-600 transition hover:text-blue-600"
                        >
                          {line.text}
                        </a>
                      ) : (
                        <p key={line.text} className="text-slate-600">
                          {line.text}
                        </p>
                      ),
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — contact form */}
          <div className="rounded-3xl border border-navy-100 bg-white p-7 shadow-card sm:p-8 min-w-2xl mx-auto">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-800">
                  <FaCheck className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-bold text-navy-900">
                  Message sent
                </h2>
                <p className="mt-2 text-base text-navy-600">
                  Thanks — we&apos;ll reply within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-navy-900"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-navy-900"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-navy-900"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-navy-900"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 block w-full resize-y rounded-xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                  Send message <FaArrowRightLong />
                </button>
              </form>
            )}
            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center justify-center gap-2 bg-[#dbe4fa] rounded-lg py-3 px-4">
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-xs font-medium text-text-secondary">
                  Secure 256-Bit SSL Encrypted
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-[#dbe4fa] rounded-lg py-3 px-4">
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="text-xs font-medium text-text-secondary">
                  Proudly Based in California
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-[#dbe4fa] rounded-lg py-3 px-4">
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <span className="text-xs font-medium text-text-secondary">
                  $0 Upfront Application Fees
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
