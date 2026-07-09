"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaEnvelope, FaUserShield } from "react-icons/fa6";

const NAV_ITEMS = [
  { href: "/admin", label: "Underwriting Queue", icon: FaUserShield },
  { href: "/admin/messages", label: "Messages", icon: FaEnvelope },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-navy-100 bg-linear-to-b from-navy-900 to-navy-950 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <FaUserShield className="h-4 w-4" />
        </span>
        <span className="text-lg font-bold tracking-tight text-white">
          Northfork
        </span>
        <span className="text-xs font-medium text-navy-300">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          // The queue lives at exactly /admin; message routes are nested, so we
          // treat any /admin/messages* path as active for that item.
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-navy-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-navy-400">
        Internal underwriting tool · v1
      </div>
    </aside>
  );
}
