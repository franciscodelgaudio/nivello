import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Com obra ativa" },
  { value: "inactive", label: "Sem obra ativa" },
];

const AVATAR_TONES = [
  "bg-[var(--teal-100)] text-[var(--teal-700)]",
  "bg-[var(--terra-100)] text-[var(--terra-700)]",
  "bg-[var(--neutral-200)] text-[var(--neutral-700)]",
  "bg-[var(--teal-50)] text-[var(--teal-600)]",
  "bg-[var(--terra-50)] text-[var(--terra-600)]",
];

function avatarTone(name) {
  const hash = [...(name || "")].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildHref(workspaceId, params, overrides = {}) {
  const query = new URLSearchParams();
  const nextParams = { ...params, ...overrides };

  Object.entries(nextParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return `/workspaces/${workspaceId}/clients${queryString ? `?${queryString}` : ""}`;
}

export default function Display({
  workspaceId,
  workspaceName,
  userName,
  clients,
  pagination,
  search,
  order,
  direction,
  filter,
}) {
  const params = { search, order, direction, filter };

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <Sidebar workspaceId={workspaceId} workspaceName={workspaceName} userName={userName} active="clients" />

      <main className="flex-1 px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">Clientes</h1>
          <div className="flex flex-1 items-center gap-3 sm:justify-end">
            <form
              action={`/workspaces/${workspaceId}/clients`}
              className="w-full max-w-xs"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" strokeWidth={1.75} />
                <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Buscar cliente..."
                  className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] pl-9 pr-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                />
              </div>
              <input type="hidden" name="order" value={order} />
              <input type="hidden" name="direction" value={direction} />
              <input type="hidden" name="filter" value={filter} />
            </form>
            <Button asChild variant="dark">
              <Link href={`/workspaces/${workspaceId}/clients/new`}>+ Novo cliente</Link>
            </Button>
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
            {pagination.totalCount} {pagination.totalCount === 1 ? "cliente" : "clientes"}
          </p>
        </div>

        {/* Content */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--neutral-100)]">
                <Users className="h-6 w-6 text-[var(--text-subtle)]" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-semibold text-[var(--text-strong)]">
                Nenhum cliente por aqui ainda
              </p>
              <p className="max-w-sm text-sm text-[var(--text-muted)]">
                Clientes cadastrados neste workspace vão aparecer aqui.
              </p>
              <Button asChild className="mt-4" variant="dark">
                <Link href={`/workspaces/${workspaceId}/clients/new`}>+ Novo cliente</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4">Local</th>
                    <th className="px-6 py-4">Obras ativas</th>
                    <th className="px-6 py-4">Última obra</th>
                    <th className="px-6 py-4 text-right">Valor total</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client._id}
                      className="border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--surface-hover)]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTone(client.name)}`}>
                            {initials(client.name)}
                          </div>
                          <span className="font-semibold text-[var(--text-strong)]">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[var(--text-body)]">{client.cellphone}</td>
                      <td className="px-6 py-4 text-[var(--text-body)]">{client.address}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-[var(--radius-sm)] px-1.5 font-mono text-xs font-semibold tabular-nums ${
                            client.activeWorkCount > 0
                              ? "bg-[var(--teal-50)] text-[var(--teal-700)]"
                              : "bg-[var(--neutral-100)] text-[var(--text-subtle)]"
                          }`}
                        >
                          {client.activeWorkCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-body)]">{client.lastWork || "-"}</td>
                      <td className="px-6 py-4 text-right font-mono font-medium tabular-nums text-[var(--text-strong)]">
                        {currencyFormatter.format(client.totalValue ?? 0)}
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
              Página {pagination.page} de {pagination.totalPages} — {pagination.totalCount} registros
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild disabled={!pagination.hasPrevPage}>
                <Link
                  href={buildHref(workspaceId, params, { page: Math.max(1, pagination.page - 1) })}
                  className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                  Anterior
                </Link>
              </Button>
              <Button variant="outline" asChild disabled={!pagination.hasNextPage}>
                <Link
                  href={buildHref(workspaceId, params, { page: pagination.page + 1 })}
                  className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
