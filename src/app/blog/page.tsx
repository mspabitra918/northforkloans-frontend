import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { PageHeader } from "@/src/components/ui/PageHeader";

export const metadata: import("next").Metadata = {
  title: "Blog — Financial Literacy, Explained | Oakhill Loans",
  description:
    "Practical guides on credit, debt, and borrowing smarter from the Oakhill Loans team.",
  alternates: { canonical: "/blog" },
};

type Post = {
  slug?: string;
  category: string;
  title: string;
  excerpt: string;
};

const POSTS: Post[] = [
  {
    slug: "dti-explained",
    category: "Borrowing basics",
    title: "DTI Explained: What Your Debt-to-Income Ratio Means",
    excerpt:
      "Learn how lenders calculate your debt-to-income ratio and how to improve it.",
  },
  {
    slug: "rebuilding-credit",
    category: "Credit",
    title: "Rebuilding Credit: A Practical Step-by-Step Guide",
    excerpt:
      "A clear, actionable plan for rebuilding your credit one step at a time.",
  },
  {
    category: "Budgeting",
    title: "Building an Emergency Fund That Actually Sticks",
    excerpt:
      "Simple strategies to set aside cash before the next surprise bill.",
  },
  {
    category: "Debt",
    title: "Snowball vs. Avalanche: Which Payoff Method Wins?",
    excerpt:
      "Two popular debt-payoff methods compared, with the math made plain.",
  },
  {
    category: "Credit",
    title: "How Credit Utilization Really Affects Your Score",
    excerpt:
      "Why the amount you owe matters as much as whether you pay on time.",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Financial literacy"
        intro="Practical guides on credit, debt, and borrowing smarter."
        highlight="explained"
      />
      <section className="container-x pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-7">
          {POSTS.map((post) => {
            const cardBody = (
              <>
                <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {post.category}
                </span>
                <h2 className="mt-4 text-lg font-bold leading-snug text-navy-900">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  {post.slug ? (
                    <span className="text-blue-600">
                      Read more <FaArrowRightLong className="inline" />
                    </span>
                  ) : (
                    <span className="text-navy-400">Coming soon</span>
                  )}
                </span>
              </>
            );

            if (post.slug) {
              return (
                <Link
                  key={post.title}
                  href={`/blog/${post.slug}`}
                  className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                  {cardBody}
                </Link>
              );
            }

            return (
              <div
                key={post.title}
                className="flex flex-col rounded-2xl border border-navy-100 bg-navy-50/40 p-6 shadow-card"
              >
                {cardBody}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
