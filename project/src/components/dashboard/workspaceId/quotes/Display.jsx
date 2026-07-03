import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function buildHref(workspaceId, params, overrides = {}) {
  const query = new URLSearchParams();
  const nextParams = { ...params, ...overrides };

  Object.entries(nextParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return `/workspaces/${workspaceId}/quotes${queryString ? `?${queryString}` : ""}`;
}

export default function Display({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  userRole,
  quotes,
  pagination,
  search,
  order,
  direction,
  filter,
  locale = "pt",
}) {
  const t = getDictionary(locale).quotes;
  const params = { search, order, direction, filter };

  const FILTERS = [
    { value: "all", label: t.filters.all },
    { value: "month", label: t.filters.month },
  ];

  return (
    <DashboardShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      workspaces={workspaces}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
      active="quotes"
      locale={locale}
    >
      <div className="flex-1 px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">{t.title}</h1>
          <div className="flex flex-1 items-center gap-3 sm:justify-end">
            <form
              action={`/workspaces/${workspaceId}/quotes`}
              className="w-full max-w-xs"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" strokeWidth={1.75} />
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
              <input type="hidden" name="filter" value={filter} />
            </form>
            <Link href={`/workspaces/${workspaceId}/quotes/new`} className={buttonVariants({ variant: "dark" })}>
              {t.newQuote}
            </Link>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => {
              const isActive = filter === value;
              return (
                <Link
                  key={value}
                  href={buildHref(workspaceId, params, { filter: value, page: 1 })}
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

        {/* Content */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--neutral-100)]">
                <FileText className="h-6 w-6 text-[var(--text-subtle)]" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-semibold text-[var(--text-strong)]">
                {t.emptyTitle}
              </p>
              <p className="max-w-sm text-sm text-[var(--text-muted)]">
                {t.emptyDescription}
              </p>
              <Link href={`/workspaces/${workspaceId}/quotes/new`} className={buttonVariants({ variant: "dark", className: "mt-4" })}>
                {t.emptyCta}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                    <th className="px-6 py-4">{t.table.quote}</th>
                    <th className="px-6 py-4">{t.table.client}</th>
                    <th className="px-6 py-4">{t.table.work}</th>
                    <th className="px-6 py-4">{t.table.items}</th>
                    <th className="px-6 py-4 text-right">{t.table.total}</th>
                    <th className="px-6 py-4">{t.table.createdAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr
                      key={quote._id}
                      className="border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--surface-hover)]"
                    >
                      <td className="px-6 py-4 font-semibold text-[var(--text-strong)]">
                        {quote.name}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-body)]">
                        {quote.client?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-body)]">
                        {quote.work?.name || "-"}
                      </td>
                      <td className="px-6 py-4 font-mono tabular-nums text-[var(--text-body)]">
                        {quote.itemCount}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium tabular-nums text-[var(--text-strong)]">
                        {currencyFormatter.format(quote.total ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-body)]">
                        {quote.createdAt ? dateFormatter.format(new Date(quote.createdAt)) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {pagination.totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t.pagination.page} {pagination.page} {t.pagination.of} {pagination.totalPages} — {pagination.totalCount} {t.pagination.records}
            </p>
            <div className="flex gap-2">
              <Link
                href={buildHref(workspaceId, params, { page: Math.max(1, pagination.page - 1) })}
                className={cn(buttonVariants({ variant: "outline" }), !pagination.hasPrevPage && "pointer-events-none opacity-50")}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                {t.pagination.previous}
              </Link>
              <Link
                href={buildHref(workspaceId, params, { page: pagination.page + 1 })}
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
