"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Trash2, Users, X } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createClient, deleteClient } from "@/lib/actions/client";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

function Field({ label, placeholder, type = "text", error, registration }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? "true" : undefined}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20 aria-invalid:border-[var(--danger-600)]"
        {...registration}
      />
      {error ? <span className="text-xs text-[var(--danger-600)]">{error.message}</span> : null}
    </label>
  );
}

function ClientForm({ workspaceId, tFields, labels, submitAction, onSaved, onCancel }) {
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", address: "", cellphone: "" },
  });

  const onSubmit = async (values) => {
    setFeedback(null);

    const result = await submitAction(values);

    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <InlineAlert type={feedback?.type} message={feedback?.message} />

      <Field
        label={tFields.name}
        placeholder={tFields.namePlaceholder}
        error={errors.name}
        registration={register("name", { required: tFields.name })}
      />
      <Field
        label={tFields.address}
        placeholder={tFields.addressPlaceholder}
        error={errors.address}
        registration={register("address", { required: tFields.address })}
      />
      <Field
        label={tFields.cellphone}
        placeholder={tFields.cellphonePlaceholder}
        error={errors.cellphone}
        registration={register("cellphone", { required: tFields.cellphone })}
      />

      <div className="mt-2 flex flex-wrap gap-3">
        <Button type="submit" loading={isSubmitting}>
          {labels.save}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {labels.cancel}
        </Button>
      </div>
    </form>
  );
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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
  workspaces,
  userName,
  userEmail,
  userRole,
  clients,
  pagination,
  search,
  order,
  direction,
  filter,
  advancedFilters,
  locale = "pt",
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.clients;
  const tNew = dictionary.clientsNew;
  const params = { search, order, direction, filter, ...advancedFilters };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingClient, setDeletingClient] = useState(null);
  const [creatingClient, setCreatingClient] = useState(() => searchParams.get("new") === "1");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasAdvancedFilters = Object.values(advancedFilters).some((value) => value !== "");

  const FILTERS = [
    { value: "all", label: t.filters.all },
    { value: "active", label: t.filters.active },
    { value: "inactive", label: t.filters.inactive },
  ];

  return (
    <DashboardShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      workspaces={workspaces}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
      active="clients"
      locale={locale}
    >
      <div className="flex-1 px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">{t.title}</h1>
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
                  placeholder={t.searchPlaceholder}
                  className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] pl-9 pr-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                />
              </div>
              <input type="hidden" name="order" value={order} />
              <input type="hidden" name="direction" value={direction} />
              <input type="hidden" name="filter" value={filter} />
              {Object.entries(advancedFilters).map(([key, value]) =>
                value ? <input key={key} type="hidden" name={key} value={value} /> : null
              )}
            </form>
            <Button type="button" variant="outline" onClick={() => setFiltersOpen(true)} className="relative">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              {t.advancedFilters.trigger}
              {hasAdvancedFilters ? (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--teal-500)]" />
              ) : null}
            </Button>
            <button type="button" onClick={() => setCreatingClient(true)} className={buttonVariants({ variant: "dark" })}>
              {t.newClient}
            </button>
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
                  className={buttonVariants({ variant: isActive ? "dark" : "outline", size: "sm" })}
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
          {clients.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--neutral-100)]">
                <Users className="h-6 w-6 text-[var(--text-subtle)]" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-semibold text-[var(--text-strong)]">
                {t.emptyTitle}
              </p>
              <p className="max-w-sm text-sm text-[var(--text-muted)]">
                {t.emptyDescription}
              </p>
              <button type="button" onClick={() => setCreatingClient(true)} className={buttonVariants({ variant: "dark", className: "mt-4" })}>
                {t.newClient}
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--border-subtle)] text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] hover:bg-transparent">
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.name}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.contact}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.location}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.activeWorks}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.lastWork}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-right text-[var(--text-muted)]">{t.table.totalValue}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-right text-[var(--text-muted)]">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client._id}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-hover)]"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTone(client.name)}`}>
                          {initials(client.name)}
                        </div>
                        <span className="font-semibold text-[var(--text-strong)]">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-[var(--text-body)]">{client.cellphone}</TableCell>
                    <TableCell className="px-6 py-4 text-[var(--text-body)]">{client.address}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-[var(--radius-sm)] px-1.5 font-mono text-xs font-semibold tabular-nums ${
                          client.activeWorkCount > 0
                            ? "bg-[var(--teal-50)] text-[var(--teal-700)]"
                            : "bg-[var(--neutral-100)] text-[var(--text-subtle)]"
                        }`}
                      >
                        {client.activeWorkCount}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[var(--text-body)]">{client.lastWork || "-"}</TableCell>
                    <TableCell className="px-6 py-4 text-right font-mono font-medium tabular-nums text-[var(--text-strong)]">
                      {currencyFormatter.format(client.totalValue ?? 0)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeletingClient(client)}
                        aria-label={t.deleteAction}
                        title={t.deleteAction}
                        className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border-2 border-[var(--danger-600)] bg-[var(--danger-50)] px-3 text-xs font-semibold text-[var(--danger-600)] transition hover:bg-[var(--danger-600)] hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                        {t.deleteActionShort}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {/* Painel de criação */}
      <Sheet
        open={creatingClient}
        onOpenChange={(open) => {
          setCreatingClient(open);
          if (!open && searchParams.get("new") === "1") {
            router.replace(`/workspaces/${workspaceId}/clients`);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{tNew.title}</SheetTitle>
            <SheetDescription>{tNew.subtitle}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <ClientForm
              workspaceId={workspaceId}
              tFields={tNew.fields}
              labels={{ save: tNew.save, cancel: tNew.cancel }}
              submitAction={(values) => createClient(workspaceId, values)}
              onSaved={() => {
                setCreatingClient(false);
                if (searchParams.get("new") === "1") {
                  router.replace(`/workspaces/${workspaceId}/clients`);
                }
                router.refresh();
              }}
              onCancel={() => setCreatingClient(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Painel de filtros avançados */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t.advancedFilters.title}</SheetTitle>
            <SheetDescription>{t.advancedFilters.subtitle}</SheetDescription>
          </SheetHeader>
          <form action={`/workspaces/${workspaceId}/clients`} className="flex flex-col gap-5 px-4 pb-4">
            <input type="hidden" name="search" value={search} />
            <input type="hidden" name="order" value={order} />
            <input type="hidden" name="direction" value={direction} />
            <input type="hidden" name="filter" value={filter} />

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.advancedFilters.value}</span>
              <div className="grid grid-cols-2 gap-3">
                <Field type="number" placeholder={t.advancedFilters.min} registration={{ name: "valueMin", defaultValue: advancedFilters.valueMin, min: 0 }} />
                <Field type="number" placeholder={t.advancedFilters.max} registration={{ name: "valueMax", defaultValue: advancedFilters.valueMax, min: 0 }} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.advancedFilters.activeWorks}</span>
              <div className="grid grid-cols-2 gap-3">
                <Field type="number" placeholder={t.advancedFilters.min} registration={{ name: "activeWorksMin", defaultValue: advancedFilters.activeWorksMin, min: 0 }} />
                <Field type="number" placeholder={t.advancedFilters.max} registration={{ name: "activeWorksMax", defaultValue: advancedFilters.activeWorksMax, min: 0 }} />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              <Button type="submit">{t.advancedFilters.apply}</Button>
              <Link
                href={buildHref(workspaceId, { search, order, direction }, {})}
                className={buttonVariants({ variant: "outline" })}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
                {t.advancedFilters.clear}
              </Link>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
        title={t.deleteConfirm.title}
        description={t.deleteConfirm.message}
        confirmLabel={t.deleteConfirm.confirm}
        confirmingLabel={t.deleteConfirm.deleting}
        cancelLabel={t.deleteConfirm.cancel}
        onConfirm={async () => {
          const result = await deleteClient(workspaceId, deletingClient?._id);
          if (result.success) router.refresh();
          return result;
        }}
      />
    </DashboardShell>
  );
}
