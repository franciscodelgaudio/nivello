import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Shield, ShieldOff, Users as UsersIcon } from "lucide-react";

import { setUserRole } from "@/app/admin/users/actions";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const ROLE_BADGE_CLASSES = {
  admin: "bg-[var(--teal-50)] text-[var(--teal-700)]",
  user: "bg-[var(--neutral-100)] text-[var(--neutral-600)]",
};

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildHref(params, overrides = {}) {
  const query = new URLSearchParams();
  const nextParams = { ...params, ...overrides };

  Object.entries(nextParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return `/admin/users${queryString ? `?${queryString}` : ""}`;
}

export default function Display({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  userRole,
  users,
  currentUserId,
  pagination,
  search,
  order,
  direction,
  role,
  locale = "pt",
}) {
  const t = getDictionary(locale).adminUsers;
  const params = { search, order, direction, role };

  const FILTERS = [
    { value: "all", label: t.filters.all },
    { value: "admin", label: t.filters.admin },
    { value: "user", label: t.filters.user },
  ];

  return (
    <DashboardShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      workspaces={workspaces}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
      active="admin"
      locale={locale}
    >
      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.eyebrow}</p>
            <h1 className="mt-1 text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">{t.title}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t.subtitle}</p>
          </div>
          <form action="/admin/users" className="w-full max-w-xs">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
                strokeWidth={1.75}
              />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder={t.searchPlaceholder}
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] pl-9 pr-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
              />
            </div>
            <input type="hidden" name="order" value={order} />
            <input type="hidden" name="direction" value={direction} />
            <input type="hidden" name="role" value={role} />
          </form>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => {
              const isActive = role === value;
              return (
                <Link
                  key={value}
                  href={buildHref(params, { role: value, page: 1 })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-fg)]"
                      : "bg-[var(--pill-bg)] text-[var(--pill-fg)] hover:bg-[var(--neutral-200)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {pagination.totalCount} {pagination.totalCount === 1 ? t.countSingular : t.countPlural}
          </p>
        </div>

        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          {users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--neutral-100)]">
                <UsersIcon className="h-6 w-6 text-[var(--text-subtle)]" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-semibold text-[var(--text-strong)]">{t.emptyTitle}</p>
              <p className="max-w-sm text-sm text-[var(--text-muted)]">{t.emptyDescription}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                    <th className="px-6 py-4">{t.table.name}</th>
                    <th className="px-6 py-4">{t.table.email}</th>
                    <th className="px-6 py-4">{t.table.role}</th>
                    <th className="px-6 py-4 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isYou = user._id === currentUserId;
                    const nextRole = user.role === "admin" ? "user" : "admin";

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--surface-hover)]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--teal-100)] text-xs font-semibold text-[var(--teal-700)]">
                              {initials(user.name)}
                            </div>
                            <span className="font-semibold text-[var(--text-strong)]">
                              {user.name || "-"}
                              {isYou ? (
                                <span className="ml-2 rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                  {t.you}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[var(--text-body)]">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              ROLE_BADGE_CLASSES[user.role] ?? ROLE_BADGE_CLASSES.user
                            }`}
                          >
                            {t.role[user.role] ?? user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isYou ? null : (
                            <form action={setUserRole} className="inline-flex">
                              <input type="hidden" name="userId" value={user._id} />
                              <input type="hidden" name="role" value={nextRole} />
                              <Button
                                type="submit"
                                variant={user.role === "admin" ? "destructive" : "default"}
                                size="sm"
                              >
                                {user.role === "admin" ? (
                                  <ShieldOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                                ) : (
                                  <Shield className="h-3.5 w-3.5" strokeWidth={1.75} />
                                )}
                                {user.role === "admin" ? t.removeAdmin : t.makeAdmin}
                              </Button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {pagination.totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t.pagination.page} {pagination.page} {t.pagination.of} {pagination.totalPages} — {pagination.totalCount}{" "}
              {t.pagination.records}
            </p>
            <div className="flex gap-2">
              <Link
                href={buildHref(params, { page: Math.max(1, pagination.page - 1) })}
                className={cn(buttonVariants({ variant: "outline" }), !pagination.hasPrevPage && "pointer-events-none opacity-50")}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                {t.pagination.previous}
              </Link>
              <Link
                href={buildHref(params, { page: pagination.page + 1 })}
                className={cn(buttonVariants({ variant: "outline" }), !pagination.hasNextPage && "pointer-events-none opacity-50")}
              >
                {t.pagination.next}
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
