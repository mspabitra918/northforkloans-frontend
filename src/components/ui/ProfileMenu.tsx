"use client";

import { formatPhoneNumber } from "@/src/app/dashboard/page";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { FiLogOut, FiUser, FiGrid } from "react-icons/fi";

export default function ProfileMenu({ session, onLogout }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session?.email?.split("@")[0]?.slice(0, 2)?.toUpperCase();

  if (!session) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-lg border border-blue-700 px-5 py-2.5 text-sm font-semibold text-blue-600"
      >
        Dashboard Login <FaArrowRightLong />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <FaUserCircle className="h-10 w-10" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white bg-white shadow-lg">
          <div className="border-b border-b-gray-300 px-4 py-3">
            <p className="font-semibold">{session.email || "User"}</p>
            <p className="text-sm text-gray-500">
              {formatPhoneNumber(session.phone)}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <FiGrid />
            Dashboard
          </Link>

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
