import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Northfork Loans account to track your application and loan.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
