"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, GitBranch, LogOut, UserCog } from "lucide-react";
import { signOut } from "@/actions/auth";
import { initials } from "@/lib/format";
import type { AppRole } from "@/lib/database.types";

const NAV = [
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: GitBranch },
];

const MANAGE_NAV = [{ href: "/dashboard/team", label: "Team", icon: UserCog }];

const ROLE_LABEL: Record<AppRole, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  client: "Client",
};

export default function Sidebar({
  agencyName,
  fullName,
  email,
  role,
}: {
  agencyName: string;
  fullName: string | null;
  email: string;
  role: AppRole;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-navy-950 text-navy-ink">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          {agencyName.trim()[0]?.toUpperCase() || "D"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{agencyName}</p>
          <p className="text-[11px] text-navy-ink-dim">DCworker CRM</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-navy-ink hover:bg-navy-800 hover:text-white"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
        {(role === "owner" || role === "admin") &&
          MANAGE_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-white"
                    : "text-navy-ink hover:bg-navy-800 hover:text-white"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-navy-border px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
            {initials(fullName || email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{fullName || email}</p>
            <p className="truncate text-[11px] text-navy-ink-dim">{ROLE_LABEL[role]}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-navy-ink-dim transition-colors hover:bg-navy-800 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
