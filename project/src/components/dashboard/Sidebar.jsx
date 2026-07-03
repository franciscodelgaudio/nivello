import Link from "next/link";
import { Droplet, FileText, HardHat, LayoutGrid, Users } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";

export function Sidebar({ workspaceId, workspaceName, userName, active }) {
  const navItems = [
    { key: "painel", href: "/dashboard", label: "Painel", icon: LayoutGrid },
    { key: "quotes", href: `/workspaces/${workspaceId}/quotes`, label: "Orçamentos", icon: FileText },
    { key: "works", href: `/workspaces/${workspaceId}/works`, label: "Obras", icon: HardHat },
    { key: "clients", href: `/workspaces/${workspaceId}/clients`, label: "Clientes", icon: Users },
  ];

  const initials = (userName || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[var(--surface-deep)] px-5 py-7 lg:flex">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--teal-500)] to-[var(--terra-500)] text-white">
          <Droplet className="h-4.5 w-4.5" strokeWidth={1.75} fill="currentColor" fillOpacity={0.25} />
        </div>
        <div>
          <p className="text-sm font-bold tracking-[-0.015em] text-white">Nivello</p>
          <p className="text-[11px] text-[var(--neutral-400)]">Obras e orçamentos</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ key, href, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              href={href}
              className={
                isActive
                  ? "flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--surface-deep-hover)] px-3 py-2.5 text-sm font-semibold text-white transition"
                  : "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--neutral-400)] transition hover:bg-[var(--surface-deep-hover)]/60 hover:text-white"
              }
            >
              <Icon
                className={isActive ? "h-4 w-4 text-[var(--teal-400)]" : "h-4 w-4"}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sessão / Logout */}
      <div className="mt-auto border-t border-[var(--surface-deep-border)] px-1 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--teal-700)] text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-[11px] text-[var(--neutral-400)]">{workspaceName}</p>
          </div>
        </div>
        <div className="mt-3">
          <SignOutButton className="w-full border-[var(--surface-deep-hover)] bg-transparent text-[var(--neutral-300)] hover:bg-[var(--surface-deep-hover)] hover:text-white" />
        </div>
      </div>
    </aside>
  );
}
