import { FaUserShield } from "react-icons/fa6";

export function Sidebar() {
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
        <span className="flex w-full items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white">
          <FaUserShield className="h-4 w-4" />
          Underwriting Queue
        </span>
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-navy-400">
        Internal underwriting tool · v1
      </div>
    </aside>
  );
}
