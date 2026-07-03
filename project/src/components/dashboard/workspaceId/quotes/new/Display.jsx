import Link from "next/link";
import { ArrowRight, CheckCircle2, HardHat, User } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Selecionar cliente ou criar um novo",
  "Escolher ou criar obra",
  "Adicionar serviços e materiais",
  "Revisar, gerar PDF e compartilhar",
];

export default function Display({ workspaceId, workspaceName, userName }) {
  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <Sidebar workspaceId={workspaceId} workspaceName={workspaceName} userName={userName} active="quotes" />

      <main className="flex-1 px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Novo orçamento
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
              Criar orçamento de obra
            </h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Escolha um cliente e uma obra, depois adicione serviços e materiais para gerar o orçamento.
            </p>
          </div>

          {/* Card com passos */}
          <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-[var(--text-strong)]">
              <CheckCircle2 className="h-5 w-5 text-[var(--teal-600)]" strokeWidth={1.75} />
              Passos recomendados
            </h2>
            <ol className="mt-6 space-y-3 text-sm text-[var(--text-body)]">
              {STEPS.map((step, index) => (
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
                  <h3 className="font-semibold text-[var(--text-strong)]">Cliente</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Selecione um cliente existente ou cadastre um novo.
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
                  <h3 className="font-semibold text-[var(--text-strong)]">Obra</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Escolha a obra onde este orçamento será aplicado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/workspaces/${workspaceId}/quotes/new/step-1`}>
                Começar
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/workspaces/${workspaceId}/quotes`}>
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
