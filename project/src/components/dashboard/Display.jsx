import Link from "next/link";
import { ChevronRight, FileText, HardHat, Plus, UserPlus, Users } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function Display({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  metrics,
  locale = "pt",
}) {
  const t = getDictionary(locale).dashboard;

  const quotesHref = `/workspaces/${workspaceId}/quotes`;
  const worksHref = `/workspaces/${workspaceId}/works`;
  const newQuoteHref = `/workspaces/${workspaceId}/quotes/new`;
  const newClientHref = `/workspaces/${workspaceId}/clients/new`;

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
      </div>
    </DashboardShell>
  );
}
