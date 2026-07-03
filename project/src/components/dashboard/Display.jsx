import Link from "next/link";
import { FileText, HardHat, Plus, UserPlus, Users } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";

export default function Display({ workspaceId, workspaceName, userName, metrics }) {
  const quotesHref = `/workspaces/${workspaceId}/quotes`;
  const worksHref = `/workspaces/${workspaceId}/works`;
  const newQuoteHref = `/workspaces/${workspaceId}/quotes/new`;
  const newClientHref = `/workspaces/${workspaceId}/clients/new`;

  const metricCards = [
    { label: "Orçamentos", helper: "Neste mês", value: metrics.quotesThisMonth, icon: FileText, tone: "brand" },
    { label: "Obras", helper: "Ativas", value: metrics.activeWorks, icon: HardHat, tone: "accent" },
    { label: "Clientes", helper: "Cadastrados", value: metrics.totalClients, icon: Users, tone: "neutral" },
  ];

  const toneClasses = {
    brand: "bg-[var(--teal-50)] text-[var(--teal-600)]",
    accent: "bg-[var(--terra-50)] text-[var(--terra-500)]",
    neutral: "bg-[var(--neutral-100)] text-[var(--neutral-600)]",
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <Sidebar workspaceId={workspaceId} workspaceName={workspaceName} userName={userName} active="painel" />

      <main className="flex-1 px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Painel de controle
            </p>
            <h1 className="mt-2 text-[32px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
              Bem-vindo
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Acompanhe orçamentos, obras e clientes em um só lugar.
            </p>
          </div>
          <Button asChild>
            <Link href={newQuoteHref}>
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Novo orçamento
            </Link>
          </Button>
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
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">Ações rápidas</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={newQuoteHref}>
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                Novo orçamento
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={newClientHref}>
                <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                Novo cliente
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={worksHref}>
                <HardHat className="h-4 w-4" strokeWidth={1.75} />
                Ver obras
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
