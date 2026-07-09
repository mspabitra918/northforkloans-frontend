import { Session } from "@/src/lib/session";
import { FaArrowsRotate } from "react-icons/fa6";

export function Topbar({
  session,
  onRefresh,
  refreshing,
  onSignOut,
  title = "Underwriting Queue",
}: {
  session: Session | null;
  onRefresh: () => void;
  refreshing: boolean;
  onSignOut: () => void;
  title?: string;
}) {
  const initials = (session?.email ?? "?").slice(0, 2).toUpperCase();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-navy-100 bg-white px-6">
      <h1 className="text-lg font-bold text-navy-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy-600 transition hover:bg-navy-50 disabled:opacity-50"
        >
          <FaArrowsRotate
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
        <div className="text-right">
          <div className="text-sm font-semibold text-navy-900">
            {session?.email ?? "—"}
          </div>
          <div className="text-xs capitalize text-navy-500">
            {session?.role ?? "underwriter"}
          </div>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {initials}
        </span>
        <button
          type="button"
          onClick={onSignOut}
          className="text-xs font-medium text-navy-500 transition hover:text-navy-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
