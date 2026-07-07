import { FaPercentage, FaWifi, FaRegCalendarAlt } from "react-icons/fa";

const features = [
  {
    icon: <FaPercentage className="text-5xl text-amber-500" />,
    title: "Low Interest Rates",
    description: "Starting from 10% p.a.",
  },
  {
    icon: <FaWifi className="text-5xl text-purple-500" />,
    title: "100% Digital Process",
    description: "Complete online application",
  },
  {
    icon: <FaRegCalendarAlt className="text-5xl text-orange-500" />,
    title: "Flexible Tenure",
    description: "Up to 60 months repayment",
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-800">
            Benefits & Features
          </h2>

          <p className="mt-4 text-xl text-slate-500">
            Why choose Northfork Loans for your personal loan needs
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-[#FFFFFF] px-8 py-10 text-center shadow-lg transition duration-300 border border-navy-100  sh hover:-translate-y-1 hover:border-blue-200 hover:shadow-lift"
            >
              <div className="flex justify-center">{feature.icon}</div>

              <h3 className="mt-8 text-xl font-semibold text-navy-900">
                {feature.title}
              </h3>

              <p className="mt-6 text-sm text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
