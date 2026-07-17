import Link from "next/link";
import { ChevronRight, FileText, HardHat, Plus, UserPlus, Users } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatGuarani } from "@/lib/format";

const QUOTE_STATUS_CLASSES = {
  pendente: "bg-[var(--warning-50)] text-[var(--warning-600)]",
  em_analise: "bg-[var(--info-50)] text-[var(--info-600)]",
  aprovado: "bg-[var(--success-50)] text-[var(--success-600)]",
};

export default function Display({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  userRole,
  metrics,
  recentQuotes = [],
  worksInProgress = [],
  locale = "pt",
}) {
  const t = getDictionary(locale).dashboard;
  const tQuotesStatus = getDictionary(locale).quotes.status;

  const quotesHref = `/workspaces/${workspaceId}/quotes`;
  const worksHref = `/workspaces/${workspaceId}/works`;
  const newQuoteHref = `/workspaces/${workspaceId}/quotes?new=1`;
  const newClientHref = `/workspaces/${workspaceId}/clients?new=1`;

  const metricCards = [
    { ...t.metrics.quotes, value: metrics.quotesThisMonth, icon: FileText, tone: "brand" },
    { ...t.metrics.works, value: metrics.activeWorks, icon: HardHat, tone: "accent" },
    { ...t.metrics.clients, value: metrics.totalClients, icon: Users, tone: "neutral" },
  ];

  const toneClasses = {
    brand: "bg-[var(--teal-50)] text-[var(--teal-600)]",
    accent: "bg-[var(--terra-50)] text-[var(--terra-500)]",
    neutral: "bg-[var(--neutral-100)] text-[var(--neutral-600)]",
  };

  const quickActions = [
    { ...t.quickActions.newQuote, href: newQuoteHref, icon: Plus, tone: "brand" },
    { ...t.quickActions.newClient, href: newClientHref, icon: UserPlus, tone: "neutral" },
    { ...t.quickActions.viewWorks, href: worksHref, icon: HardHat, tone: "accent" },
  ];

  return (
    <DashboardShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      workspaces={workspaces}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
      active="painel"
      locale={locale}
    >
      <div className="flex-1 px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              {t.eyebrow}
            </p>
            <h1 className="mt-2 text-[32px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {t.subtitle}
            </p>
          </div>
          <Link href={newQuoteHref} className={buttonVariants()}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            {t.newQuote}
          </Link>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {metricCards.map(({ label, helper, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-sm)] transition hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</p>
                  <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[var(--text-strong)]">{value}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{helper}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] ${toneClasses[tone]}`}>
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Atalhos */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t.quickActionsTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {quickActions.map(({ label, description, href, icon: Icon, tone }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)] transition hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${toneClasses[tone]}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-strong)]">{label}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{description}</p>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-[var(--text-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[var(--text-muted)]"
                  strokeWidth={1.75}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Orçamentos recentes + Obras em andamento */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t.recentQuotes.title}</h2>
              <Link href={quotesHref} className="text-sm font-semibold text-[var(--teal-600)] hover:text-[var(--teal-700)] hover:underline">
                {t.recentQuotes.viewAll}
              </Link>
            </div>
            {recentQuotes.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--text-muted)]">{t.recentQuotes.emptyTitle}</p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-[var(--border-subtle)]">
                {recentQuotes.map((quote) => (
                  <li key={quote._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--teal-50)] text-[var(--teal-600)]">
                      <FileText className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text-strong)]">{quote.name}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{quote.client?.name || "-"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${QUOTE_STATUS_CLASSES[quote.status] ?? QUOTE_STATUS_CLASSES.pendente}`}>
                      {tQuotesStatus[quote.status] ?? tQuotesStatus.pendente}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-[var(--text-strong)]">
                      {formatGuarani(quote.total ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t.worksInProgress.title}</h2>
              <Link href={worksHref} className="text-sm font-semibold text-[var(--teal-600)] hover:text-[var(--teal-700)] hover:underline">
                {t.worksInProgress.viewAll}
              </Link>
            </div>
            {worksInProgress.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--text-muted)]">{t.worksInProgress.emptyTitle}</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-5">
                {worksInProgress.map((work) => {
                  const pct = Math.max(0, Math.min(100, Math.round(work.progress ?? 0)));
                  return (
                    <li key={work._id}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--text-strong)]">{work.name}</p>
                          <p className="truncate text-xs text-[var(--text-muted)]">{work.client?.name || "-"}</p>
                        </div>
                        <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-[var(--teal-600)]">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[var(--neutral-100)]">
                        <div className="h-full rounded-full bg-[var(--teal-600)]" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
