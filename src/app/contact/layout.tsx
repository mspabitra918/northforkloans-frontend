// The contact page itself is a Client Component (it owns a stateful form), so
// its metadata lives here in a Server layout where `export const metadata` is
// allowed.
export const metadata: import("next").Metadata = {
  title: "Contact Us",
  description:
    "Reach Northfork Loans by phone, email, or mail. Serving all 50 states.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
