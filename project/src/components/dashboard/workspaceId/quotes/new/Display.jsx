import Link from "next/link";
import { ArrowRight, CheckCircle2, HardHat, User } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function Display({ workspaceId, workspaceName, workspaces, userName, userEmail, locale = "pt" }) {
  const t = getDictionary(locale).quotes.new;

  return (
    <DashboardShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      workspaces={workspaces}
      userName={userName}
      userEmail={userEmail}
      active="quotes"
      locale={locale}
    >
      <div className="flex-1 px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              {t.eyebrow}
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
              {t.title}
            </h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              {t.subtitle}
            </p>
          </div>

          {/* Card com passos */}
          <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-[var(--text-strong)]">
              <CheckCircle2 className="h-5 w-5 text-[var(--teal-600)]" strokeWidth={1.75} />
              {t.stepsTitle}
            </h2>
            <ol className="mt-6 space-y-3 text-sm text-[var(--text-body)]">
              {t.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--teal-50)] font-mono text-xs font-semibold tabular-nums text-[var(--teal-700)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Cards de ações */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-sm)]">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--teal-50)]">
                  <User className="h-5 w-5 text-[var(--teal-600)]" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-strong)]">{t.clientCardTitle}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t.clientCardDescription}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-sm)]">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--terra-50)]">
                  <HardHat className="h-5 w-5 text-[var(--terra-500)]" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-strong)]">{t.workCardTitle}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t.workCardDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/workspaces/${workspaceId}/quotes/new/step-1`} className={buttonVariants()}>
              {t.start}
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <Link href={`/workspaces/${workspaceId}/quotes`} className={buttonVariants({ variant: "outline" })}>
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
