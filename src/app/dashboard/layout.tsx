import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Dashboard",
  description:
    "Track your Northfork Loans application status, next steps, and loan summary from your customer portal.",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
