"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ChevronLeft, ChevronRight, HardHat, Pencil, Search, SlidersHorizontal, Trash2, X } from "lucide-react";

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
import { createWork, deleteWork, updateWork } from "@/lib/actions/work";
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

const STATUS_CLASSES = {
  planned: "bg-[var(--work-planned-bg)] text-[var(--work-planned)]",
  active: "bg-[var(--work-active-bg)] text-[var(--work-active)]",
  late: "bg-[var(--work-late-bg)] text-[var(--work-late)]",
};

function buildHref(workspaceId, params, overrides = {}) {
  const query = new URLSearchParams();
  const nextParams = { ...params, ...overrides };

  Object.entries(nextParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return `/workspaces/${workspaceId}/works${queryString ? `?${queryString}` : ""}`;
}

function toDateInputValue(date) {
  if (!date) return "";
  return String(date).slice(0, 10);
}

function Field({ label, type = "text", placeholder, error, registration }) {
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

function SelectField({ label, error, registration, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</span>
      <select
        aria-invalid={error ? "true" : undefined}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20 aria-invalid:border-[var(--danger-600)]"
        {...registration}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-[var(--danger-600)]">{error.message}</span> : null}
    </label>
  );
}

function TextareaField({ label, placeholder, registration }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</span>
      <textarea
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
        {...registration}
      />
    </label>
  );
}

function WorkForm({ workspaceId, work = null, clients, t, tFields, labels, submitAction, onSaved, onCancel }) {
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: work?.name ?? "",
      clientId: work?.clientId ?? "",
      address: work?.address ?? "",
      startDate: toDateInputValue(work?.startDate),
      deadline: toDateInputValue(work?.deadline),
      description: work?.description ?? "",
    },
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

      <SelectField
        label={tFields.client}
        error={errors.clientId}
        registration={register("clientId", { required: tFields.client })}
      >
        <option value="">{tFields.clientPlaceholder}</option>
        {clients.map((client) => (
          <option key={client._id} value={client._id}>{client.name}</option>
        ))}
      </SelectField>

      <Field
        label={tFields.address}
        placeholder={tFields.addressPlaceholder}
        error={errors.address}
        registration={register("address", { required: tFields.address })}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          type="date"
          label={tFields.startDate}
          error={errors.startDate}
          registration={register("startDate", { required: tFields.startDate })}
        />
        <Field
          type="date"
          label={tFields.deadline}
          error={errors.deadline}
          registration={register("deadline", { required: tFields.deadline })}
        />
      </div>

      <TextareaField
        label={tFields.description}
        placeholder={tFields.descriptionPlaceholder}
        registration={register("description")}
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

export default function Display({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  userRole,
  works,
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
  const t = dictionary.works;
  const tEdit = dictionary.worksEdit;
  const tNew = dictionary.worksNew;
  const tFields = dictionary.worksNew.fields;
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = { search, order, direction, filter, ...advancedFilters };
  const [editingWork, setEditingWork] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [deletingWork, setDeletingWork] = useState(null);
  const [creatingWork, setCreatingWork] = useState(() => searchParams.get("new") === "1");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasAdvancedFilters = Object.values(advancedFilters).some((value) => value !== "");

  const FILTERS = [
    { value: "all", label: t.filters.all },
    { value: "active", label: t.filters.active },
    { value: "late", label: t.filters.late },
    { value: "planned", label: t.filters.planned },
  ];

  return (
    <DashboardShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      workspaces={workspaces}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
      active="works"
      locale={locale}
    >
      <div className="flex-1 px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">{t.title}</h1>
          <div className="flex flex-1 items-center gap-3 sm:justify-end">
            <form
              action={`/workspaces/${workspaceId}/works`}
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
            <button type="button" onClick={() => setCreatingWork(true)} className={buttonVariants({ variant: "dark" })}>
              {t.newWork}
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
          {works.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--neutral-100)]">
                <HardHat className="h-6 w-6 text-[var(--text-subtle)]" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-semibold text-[var(--text-strong)]">
                {t.emptyTitle}
              </p>
              <p className="max-w-sm text-sm text-[var(--text-muted)]">
                {t.emptyDescription}
              </p>
              <button type="button" onClick={() => setCreatingWork(true)} className={buttonVariants({ variant: "dark", className: "mt-4" })}>
                {t.newWork}
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--border-subtle)] text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] hover:bg-transparent">
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.name}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.client}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.location}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.deadline}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.status}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-right text-[var(--text-muted)]">{t.table.value}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-right text-[var(--text-muted)]">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {works.map((work) => (
                  <TableRow
                    key={work._id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedWork(work)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedWork(work);
                      }
                    }}
                    className="cursor-pointer border-b border-[var(--border-subtle)] outline-none last:border-0 hover:bg-[var(--surface-hover)] focus-visible:bg-[var(--surface-hover)]"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--terra-50)] text-[var(--terra-600)]">
                          <HardHat className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <span className="font-semibold text-[var(--text-strong)]">{work.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[var(--text-body)]">{work.client?.name || "-"}</TableCell>
                    <TableCell className="px-6 py-4 text-[var(--text-body)]">{work.address}</TableCell>
                    <TableCell className="px-6 py-4 font-mono tabular-nums text-[var(--text-body)]">
                      {work.deadline ? dateFormatter.format(new Date(work.deadline)) : "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[work.status]}`}>
                        {t.status[work.status] ?? work.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-mono font-medium tabular-nums text-[var(--text-strong)]">
                      {currencyFormatter.format(work.totalValue ?? 0)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWork(work);
                          }}
                          aria-label={t.editAction}
                          title={t.editAction}
                          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border-2 border-[var(--teal-500)] bg-[var(--teal-50)] px-3 text-xs font-semibold text-[var(--teal-700)] transition hover:bg-[var(--teal-100)]"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2} />
                          {t.editActionShort}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingWork(work);
                          }}
                          aria-label={t.deleteAction}
                          title={t.deleteAction}
                          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border-2 border-[var(--danger-600)] bg-[var(--danger-50)] px-3 text-xs font-semibold text-[var(--danger-600)] transition hover:bg-[var(--danger-600)] hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                          {t.deleteActionShort}
                        </button>
                      </div>
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

      {/* Painel de detalhes (somente leitura) */}
      <Sheet open={!!selectedWork} onOpenChange={(open) => !open && setSelectedWork(null)}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-lg">
          {selectedWork ? (
            <>
              <SheetHeader>
                <SheetTitle>{selectedWork.name}</SheetTitle>
                <SheetDescription>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[selectedWork.status]}`}>
                    {t.status[selectedWork.status] ?? selectedWork.status}
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 pb-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.client}</p>
                <p className="mt-1 font-semibold text-[var(--text-strong)]">{selectedWork.client?.name || "-"}</p>
                {selectedWork.client?.address ? <p className="text-sm text-[var(--text-body)]">{selectedWork.client.address}</p> : null}
                {selectedWork.client?.cellphone ? <p className="text-sm font-mono text-[var(--text-body)]">{selectedWork.client.cellphone}</p> : null}
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.address}</p>
                  <p className="text-[var(--text-body)]">{selectedWork.address || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.totalValue}</p>
                  <p className="font-mono font-medium tabular-nums text-[var(--text-strong)]">{currencyFormatter.format(selectedWork.totalValue ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.startDate}</p>
                  <p className="font-mono tabular-nums text-[var(--text-body)]">
                    {selectedWork.startDate ? dateFormatter.format(new Date(selectedWork.startDate)) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.deadline}</p>
                  <p className="font-mono tabular-nums text-[var(--text-body)]">
                    {selectedWork.deadline ? dateFormatter.format(new Date(selectedWork.deadline)) : "-"}
                  </p>
                </div>
              </div>

              {selectedWork.description ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.description}</p>
                  <p className="mt-1 text-sm text-[var(--text-body)]">{selectedWork.description}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedWork(null);
                    setEditingWork(selectedWork);
                  }}
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                  {t.editActionShort}
                </Button>
                <Button
                  type="button"
                  className="bg-[var(--danger-600)] text-white hover:bg-[var(--danger-600)]/90"
                  onClick={() => {
                    setSelectedWork(null);
                    setDeletingWork(selectedWork);
                  }}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                  {t.deleteActionShort}
                </Button>
              </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Painel de edição */}
      <Sheet open={!!editingWork} onOpenChange={(open) => !open && setEditingWork(null)}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-lg">
          {editingWork ? (
            <>
              <SheetHeader>
                <SheetTitle>{tEdit.title}</SheetTitle>
                <SheetDescription>{tEdit.subtitle}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4">
                <WorkForm
                  key={editingWork._id}
                  workspaceId={workspaceId}
                  work={editingWork}
                  clients={clients}
                  tFields={tFields}
                  labels={{ save: tEdit.save, cancel: tEdit.cancel }}
                  submitAction={(values) => updateWork(workspaceId, editingWork._id, values)}
                  onSaved={() => {
                    setEditingWork(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingWork(null)}
                />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Painel de criação */}
      <Sheet
        open={creatingWork}
        onOpenChange={(open) => {
          setCreatingWork(open);
          if (!open && searchParams.get("new") === "1") {
            router.replace(`/workspaces/${workspaceId}/works`);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{tNew.title}</SheetTitle>
            <SheetDescription>{tNew.subtitle}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <WorkForm
              workspaceId={workspaceId}
              clients={clients}
              tFields={tFields}
              labels={{ save: tNew.save, cancel: tNew.cancel }}
              submitAction={(values) => createWork(workspaceId, values)}
              onSaved={() => {
                setCreatingWork(false);
                if (searchParams.get("new") === "1") {
                  router.replace(`/workspaces/${workspaceId}/works`);
                }
                router.refresh();
              }}
              onCancel={() => setCreatingWork(false)}
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
          <form action={`/workspaces/${workspaceId}/works`} className="flex flex-col gap-5 px-4 pb-4">
            <input type="hidden" name="search" value={search} />
            <input type="hidden" name="order" value={order} />
            <input type="hidden" name="direction" value={direction} />
            <input type="hidden" name="filter" value={filter} />

            <SelectField
              label={t.advancedFilters.client}
              registration={{ name: "clientId", defaultValue: advancedFilters.clientId }}
            >
              <option value="">{t.advancedFilters.clientPlaceholder}</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </SelectField>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.advancedFilters.value}</span>
              <div className="grid grid-cols-2 gap-3">
                <Field type="number" placeholder={t.advancedFilters.min} registration={{ name: "valueMin", defaultValue: advancedFilters.valueMin, min: 0 }} />
                <Field type="number" placeholder={t.advancedFilters.max} registration={{ name: "valueMax", defaultValue: advancedFilters.valueMax, min: 0 }} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.advancedFilters.deadline}</span>
              <div className="grid grid-cols-2 gap-3">
                <Field type="date" label={t.advancedFilters.dateFrom} registration={{ name: "dateFrom", defaultValue: advancedFilters.dateFrom }} />
                <Field type="date" label={t.advancedFilters.dateTo} registration={{ name: "dateTo", defaultValue: advancedFilters.dateTo }} />
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
        open={!!deletingWork}
        onOpenChange={(open) => !open && setDeletingWork(null)}
        title={t.deleteConfirm.title}
        description={t.deleteConfirm.message}
        confirmLabel={t.deleteConfirm.confirm}
        confirmingLabel={t.deleteConfirm.deleting}
        cancelLabel={t.deleteConfirm.cancel}
        onConfirm={async () => {
          const result = await deleteWork(workspaceId, deletingWork?._id);
          if (result.success) router.refresh();
          return result;
        }}
      />
    </DashboardShell>
  );
}
