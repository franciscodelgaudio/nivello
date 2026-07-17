"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { ChevronLeft, ChevronRight, FileText, HardHat, Pencil, Plus, Search, SlidersHorizontal, Trash2, UserPlus, X } from "lucide-react";

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
import { createQuote, deleteQuote, updateQuote } from "@/lib/actions/quote";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatGuarani } from "@/lib/format";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_META,
  PRODUCT_SECTIONS,
  sectionForCategory,
} from "@/lib/constants/quote-items";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORY = PRODUCT_CATEGORIES[0];

const STATUS_CLASSES = {
  pendente: "bg-[var(--warning-50)] text-[var(--warning-600)]",
  em_analise: "bg-[var(--info-50)] text-[var(--info-600)]",
  aprovado: "bg-[var(--success-50)] text-[var(--success-600)]",
};

function StatusBadge({ status, t }) {
  const value = STATUS_CLASSES[status] ? status : "pendente";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[value]}`}>
      {t.status[value]}
    </span>
  );
}

function emptyItem(category = DEFAULT_CATEGORY) {
  return {
    category,
    name: "",
    description: "",
    depthFrom: "",
    depthTo: "",
    diameter: "",
    quantity: "",
    unit: PRODUCT_CATEGORY_META[category]?.defaultUnit ?? "",
    unitPrice: "",
    equipmentSpecs: { model: "", power: "", voltage: "", brand: "", cableSpec: "", pipeSpec: "" },
  };
}

function itemFromProduct(product) {
  return {
    category: product.category,
    name: product.name ?? "",
    description: product.description ?? "",
    depthFrom: product.depthFrom ?? "",
    depthTo: product.depthTo ?? "",
    diameter: product.diameter ?? "",
    quantity: product.quantity ?? "",
    unit: product.unit ?? "",
    unitPrice: product.unitPrice ?? "",
    equipmentSpecs: {
      model: product.equipmentSpecs?.model ?? "",
      power: product.equipmentSpecs?.power ?? "",
      voltage: product.equipmentSpecs?.voltage ?? "",
      brand: product.equipmentSpecs?.brand ?? "",
      cableSpec: product.equipmentSpecs?.cableSpec ?? "",
      pipeSpec: product.equipmentSpecs?.pipeSpec ?? "",
    },
  };
}

function TextField({ label, error, registration, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</span>
      <input
        aria-invalid={error ? "true" : undefined}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20 aria-invalid:border-[var(--danger-600)]"
        {...registration}
        {...props}
      />
      {error ? <span className="text-xs text-[var(--danger-600)]">{error.message}</span> : null}
    </label>
  );
}

function SelectField({ label, error, registration, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
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

function TextareaField({ label, registration, placeholder, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</span>
      <textarea
        placeholder={placeholder}
        rows={2}
        className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
        {...registration}
      />
    </label>
  );
}

function QuoteForm({ workspaceId, quote = null, clients, works, t, tStatus, labels, submitAction, onSaved, onCancel }) {
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: quote?.name ?? "",
      clientId: quote?.clientId ?? "",
      workId: quote?.workId ?? "",
      description: quote?.description ?? "",
      paymentTerms: quote?.paymentTerms ?? "",
      deliveryTerm: quote?.deliveryTerm ?? "",
      validityDays: quote?.validityDays ?? 30,
      taxIncluded: quote?.taxIncluded ?? true,
      status: quote?.status ?? "pendente",
      items: quote?.products?.length > 0 ? quote.products.map(itemFromProduct) : [emptyItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  const subtotals = PRODUCT_SECTIONS.reduce((acc, section) => {
    acc[section] = (items || [])
      .filter((item) => sectionForCategory(item.category) === section)
      .reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
    return acc;
  }, {});
  const grandTotal = Object.values(subtotals).reduce((sum, value) => sum + value, 0);

  function handleCategoryChange(index, category) {
    const meta = PRODUCT_CATEGORY_META[category];
    if (meta) setValue(`items.${index}.unit`, meta.defaultUnit);
  }

  const onSubmit = async (values) => {
    setFeedback(null);

    const payload = {
      ...values,
      items: values.items.map((item) => ({
        ...item,
        depthFrom: item.depthFrom === "" ? undefined : item.depthFrom,
        depthTo: item.depthTo === "" ? undefined : item.depthTo,
      })),
    };

    const result = await submitAction(payload);

    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <InlineAlert type={feedback?.type} message={feedback?.message} />

      {/* Cabeçalho do orçamento */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
        <h3 className="mb-5 text-sm font-semibold text-[var(--text-strong)]">{t.headerSectionTitle}</h3>
        <div className="flex flex-col gap-5">
          <TextField
            label={t.fields.name}
            placeholder={t.fields.namePlaceholder}
            error={errors.name}
            registration={register("name", { required: t.fields.name })}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <SelectField
                label={t.fields.client}
                error={errors.clientId}
                registration={register("clientId", { required: t.fields.client })}
              >
                <option value="">{t.fields.clientPlaceholder}</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </SelectField>
              <Link
                href={`/workspaces/${workspaceId}/clients?new=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 self-start text-xs font-semibold text-[var(--teal-600)] hover:text-[var(--teal-700)] hover:underline"
              >
                <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t.fields.clientNewLink}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <SelectField
                label={t.fields.work}
                error={errors.workId}
                registration={register("workId", { required: t.fields.work })}
              >
                <option value="">{t.fields.workPlaceholder}</option>
                {works.map((work) => (
                  <option key={work._id} value={work._id}>{work.name}</option>
                ))}
              </SelectField>
              <Link
                href={`/workspaces/${workspaceId}/works?new=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 self-start text-xs font-semibold text-[var(--teal-600)] hover:text-[var(--teal-700)] hover:underline"
              >
                <HardHat className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t.fields.workNewLink}
              </Link>
            </div>
          </div>

          <TextareaField
            label={t.fields.description}
            placeholder={t.fields.descriptionPlaceholder}
            registration={register("description")}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t.fields.paymentTerms}
              placeholder={t.fields.paymentTermsPlaceholder}
              registration={register("paymentTerms")}
            />
            <TextField
              label={t.fields.deliveryTerm}
              placeholder={t.fields.deliveryTermPlaceholder}
              registration={register("deliveryTerm")}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
            <TextField
              type="number"
              min="1"
              label={t.fields.validityDays}
              error={errors.validityDays}
              registration={register("validityDays", { required: true })}
            />
            <label className="flex h-10 items-center gap-2 text-sm text-[var(--text-body)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--border-subtle)]"
                {...register("taxIncluded")}
              />
              {t.fields.taxIncluded}
            </label>
          </div>

          <SelectField label={t.fields.status} registration={register("status")}>
            {Object.entries(tStatus).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
        </div>
      </section>

      {/* Itens do orçamento */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-[var(--text-strong)]">{t.itemsSectionTitle}</h3>
          <p className="text-xs text-[var(--text-muted)]">{t.itemsSectionSubtitle}</p>
        </div>

        <div className="flex flex-col gap-5">
          {fields.map((field, index) => {
            const category = items?.[index]?.category ?? field.category;
            const meta = PRODUCT_CATEGORY_META[category] ?? {};
            const rowQuantity = Number(items?.[index]?.quantity) || 0;
            const rowUnitPrice = Number(items?.[index]?.unitPrice) || 0;

            return (
              <div key={field.id} className="flex flex-col gap-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                    Item {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={t.removeItem}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label={t.itemFields.category}
                    registration={register(`items.${index}.category`, {
                      onChange: (e) => handleCategoryChange(index, e.target.value),
                    })}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{t.categories[cat]}</option>
                    ))}
                  </SelectField>
                  <TextField
                    label={t.itemFields.name}
                    placeholder={t.itemFields.namePlaceholder}
                    error={errors.items?.[index]?.name}
                    registration={register(`items.${index}.name`, { required: true })}
                  />
                </div>

                {meta.hasDepthRange ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      type="number"
                      step="0.1"
                      label={t.itemFields.depthFrom}
                      registration={register(`items.${index}.depthFrom`)}
                    />
                    <TextField
                      type="number"
                      step="0.1"
                      label={t.itemFields.depthTo}
                      registration={register(`items.${index}.depthTo`)}
                    />
                  </div>
                ) : null}

                {meta.hasDiameter ? (
                  <TextField
                    label={t.itemFields.diameter}
                    placeholder={t.itemFields.diameterPlaceholder}
                    registration={register(`items.${index}.diameter`)}
                  />
                ) : null}

                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField
                    type="number"
                    step="0.01"
                    label={t.itemFields.quantity}
                    error={errors.items?.[index]?.quantity}
                    registration={register(`items.${index}.quantity`, { required: true })}
                  />
                  <TextField
                    label={t.itemFields.unit}
                    placeholder={t.itemFields.unitPlaceholder}
                    error={errors.items?.[index]?.unit}
                    registration={register(`items.${index}.unit`, { required: true })}
                  />
                  <TextField
                    type="number"
                    step="1"
                    label={t.itemFields.unitPrice}
                    error={errors.items?.[index]?.unitPrice}
                    registration={register(`items.${index}.unitPrice`, { required: true })}
                  />
                </div>

                {meta.hasEquipmentSpecs ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label={t.itemFields.equipmentModel} registration={register(`items.${index}.equipmentSpecs.model`)} />
                    <TextField label={t.itemFields.equipmentPower} registration={register(`items.${index}.equipmentSpecs.power`)} />
                    <TextField label={t.itemFields.equipmentVoltage} registration={register(`items.${index}.equipmentSpecs.voltage`)} />
                    <TextField label={t.itemFields.equipmentBrand} registration={register(`items.${index}.equipmentSpecs.brand`)} />
                    <TextField label={t.itemFields.cableSpec} registration={register(`items.${index}.equipmentSpecs.cableSpec`)} />
                    <TextField label={t.itemFields.pipeSpec} registration={register(`items.${index}.equipmentSpecs.pipeSpec`)} />
                  </div>
                ) : null}

                <TextareaField label={t.itemFields.description} registration={register(`items.${index}.description`)} />

                <p className="text-right text-sm font-semibold text-[var(--text-strong)]">
                  {t.itemFields.total}: {formatGuarani(rowQuantity * rowUnitPrice)}
                </p>
              </div>
            );
          })}

          {fields.length === 0 ? (
            <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] px-5 py-6 text-center text-sm text-[var(--text-muted)]">
              {t.noItems}
            </p>
          ) : null}

          <Button
            type="button"
            onClick={() => append(emptyItem())}
            className="justify-center border-2 border-dashed border-[var(--teal-500)] bg-[var(--teal-50)] py-5 text-[var(--teal-700)] hover:bg-[var(--teal-100)]"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {t.addItem}
          </Button>
        </div>
      </section>

      {/* Totais */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
        <div className="flex flex-col gap-2">
          {PRODUCT_SECTIONS.map((section) => (
            <div key={section} className="flex items-center justify-between text-sm text-[var(--text-body)]">
              <span>{t.sections[section]}</span>
              <span className="font-mono tabular-nums">{formatGuarani(subtotals[section] || 0)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-base font-semibold text-[var(--text-strong)]">
            <span>{t.grandTotal}</span>
            <span className="font-mono tabular-nums">{formatGuarani(grandTotal)}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
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
  clients,
  works,
  pagination,
  search,
  order,
  direction,
  filter,
  status,
  advancedFilters,
  locale = "pt",
}) {
  const dictionary = getDictionary(locale).quotes;
  const t = dictionary;
  const tForm = dictionary.new.form;
  const tNew = dictionary.new;
  const tEdit = dictionary.edit;
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = { search, order, direction, filter, status, ...advancedFilters };
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [deletingQuote, setDeletingQuote] = useState(null);
  const [creatingQuote, setCreatingQuote] = useState(() => searchParams.get("new") === "1");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasAdvancedFilters = Object.values(advancedFilters).some((value) => value !== "");

  const FILTERS = [
    { value: "all", label: t.filters.all },
    { value: "month", label: t.filters.month },
  ];

  const STATUS_FILTERS = [
    { value: "all", label: t.filters.all },
    { value: "pendente", label: t.status.pendente },
    { value: "em_analise", label: t.status.em_analise },
    { value: "aprovado", label: t.status.aprovado },
  ];

  const products = selectedQuote?.products ?? [];
  const subtotals = PRODUCT_SECTIONS.reduce((acc, section) => {
    acc[section] = products
      .filter((item) => sectionForCategory(item.category) === section)
      .reduce((sum, item) => sum + (item.total ?? 0), 0);
    return acc;
  }, {});

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
              <input type="hidden" name="status" value={status} />
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
            <button type="button" onClick={() => setCreatingQuote(true)} className={buttonVariants({ variant: "dark" })}>
              {t.newQuote}
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
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
            <div className="flex flex-wrap gap-2 border-l border-[var(--border-subtle)] pl-4">
              {STATUS_FILTERS.map(({ value, label }) => {
                const isActive = status === value;
                return (
                  <Link
                    key={value}
                    href={buildHref(workspaceId, params, { status: value, page: 1 })}
                    className={buttonVariants({ variant: isActive ? "dark" : "outline", size: "sm" })}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
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
              <button type="button" onClick={() => setCreatingQuote(true)} className={buttonVariants({ variant: "dark", className: "mt-4" })}>
                {t.emptyCta}
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--border-subtle)] text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] hover:bg-transparent">
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">Nº</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.quote}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.client}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.work}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.items}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.status}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-right text-[var(--text-muted)]">{t.table.total}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-[var(--text-muted)]">{t.table.createdAt}</TableHead>
                  <TableHead className="h-auto px-6 py-4 text-right text-[var(--text-muted)]">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow
                    key={quote._id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedQuote(quote)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedQuote(quote);
                      }
                    }}
                    className="cursor-pointer border-b border-[var(--border-subtle)] outline-none last:border-0 hover:bg-[var(--surface-hover)] focus-visible:bg-[var(--surface-hover)]"
                  >
                    <TableCell className="px-6 py-4 font-mono tabular-nums text-[var(--text-muted)]">
                      {quote.quoteNumber ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-semibold text-[var(--text-strong)]">
                      {quote.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[var(--text-body)]">
                      {quote.client?.name || "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[var(--text-body)]">
                      {quote.work?.name || "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono tabular-nums text-[var(--text-body)]">
                      {quote.itemCount}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={quote.status} t={t} />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-mono font-medium tabular-nums text-[var(--text-strong)]">
                      {formatGuarani(quote.total ?? 0)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[var(--text-body)]">
                      {quote.createdAt ? formatDate(quote.createdAt) : "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingQuote(quote);
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
                            setDeletingQuote(quote);
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
      <Sheet open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-2xl">
          {selectedQuote ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <SheetTitle>{selectedQuote.name}</SheetTitle>
                  <StatusBadge status={selectedQuote.status} t={t} />
                </div>
                <SheetDescription>
                  {t.details.quoteNumberPrefix} {selectedQuote.quoteNumber} · {selectedQuote.createdAt ? formatDate(selectedQuote.createdAt) : "-"}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 pb-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.client}</p>
                  <p className="mt-1 font-semibold text-[var(--text-strong)]">{selectedQuote.client?.name || "-"}</p>
                  {selectedQuote.client?.address ? <p className="text-sm text-[var(--text-body)]">{selectedQuote.client.address}</p> : null}
                  {selectedQuote.client?.cellphone ? <p className="text-sm font-mono text-[var(--text-body)]">{selectedQuote.client.cellphone}</p> : null}
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.work}</p>
                  <p className="mt-1 font-semibold text-[var(--text-strong)]">{selectedQuote.work?.name || "-"}</p>
                  {selectedQuote.work?.address ? <p className="text-sm text-[var(--text-body)]">{selectedQuote.work.address}</p> : null}
                  {selectedQuote.work?.deadline ? (
                    <p className="text-sm text-[var(--text-body)]">{t.details.deadline}: {formatDate(selectedQuote.work.deadline)}</p>
                  ) : null}
                </div>
              </div>

              {selectedQuote.description ? (
                <p className="text-sm text-[var(--text-body)]">{selectedQuote.description}</p>
              ) : null}

              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.paymentTerms}</p>
                  <p className="text-[var(--text-body)]">{selectedQuote.paymentTerms || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.deliveryTerm}</p>
                  <p className="text-[var(--text-body)]">{selectedQuote.deliveryTerm || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.details.validityDays}</p>
                  <p className="text-[var(--text-body)]">{selectedQuote.validityDays} {t.details.validityDaysSuffix}</p>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)]">
                {selectedQuote.taxIncluded ? t.details.taxIncluded : t.details.taxNotIncluded}
              </p>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-strong)]">{t.details.itemsTitle}</h3>
                {products.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">{t.details.noItems}</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {PRODUCT_SECTIONS.filter((section) => subtotals[section] > 0).map((section) => (
                      <div key={section} className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                          {tForm.sections[section]}
                        </p>
                        <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                          <Table>
                            <TableBody>
                              {products
                                .filter((item) => sectionForCategory(item.category) === section)
                                .map((item, index) => (
                                  <TableRow key={index} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-transparent">
                                    <TableCell className="px-4 py-2.5 whitespace-normal">
                                      <p className="font-medium text-[var(--text-strong)]">{item.name}</p>
                                      <p className="text-xs text-[var(--text-muted)]">{tForm.categories[item.category] ?? item.category}</p>
                                    </TableCell>
                                    <TableCell className="px-4 py-2.5 text-right font-mono tabular-nums text-[var(--text-body)]">
                                      {item.quantity} {item.unit}
                                    </TableCell>
                                    <TableCell className="px-4 py-2.5 text-right font-mono font-medium tabular-nums text-[var(--text-strong)]">
                                      {formatGuarani(item.total)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                        <p className="text-right text-sm font-medium text-[var(--text-body)]">
                          {formatGuarani(subtotals[section])}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-base font-semibold text-[var(--text-strong)]">
                <span>{t.details.grandTotal}</span>
                <span className="font-mono tabular-nums">{formatGuarani(selectedQuote.total ?? 0)}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedQuote(null);
                    setEditingQuote(selectedQuote);
                  }}
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                  {t.editActionShort}
                </Button>
                <Button
                  type="button"
                  className="bg-[var(--danger-600)] text-white hover:bg-[var(--danger-600)]/90"
                  onClick={() => {
                    setSelectedQuote(null);
                    setDeletingQuote(selectedQuote);
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
      <Sheet open={!!editingQuote} onOpenChange={(open) => !open && setEditingQuote(null)}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-2xl">
          {editingQuote ? (
            <>
              <SheetHeader>
                <SheetTitle>{tEdit.title}</SheetTitle>
                <SheetDescription>{tEdit.subtitle}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4">
                <QuoteForm
                  key={editingQuote._id}
                  workspaceId={workspaceId}
                  quote={editingQuote}
                  clients={clients}
                  works={works}
                  t={tForm}
                  tStatus={t.status}
                  labels={{ save: tEdit.save, cancel: tEdit.cancel }}
                  submitAction={(payload) => updateQuote(workspaceId, editingQuote._id, payload)}
                  onSaved={() => {
                    setEditingQuote(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingQuote(null)}
                />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Painel de criação */}
      <Sheet
        open={creatingQuote}
        onOpenChange={(open) => {
          setCreatingQuote(open);
          if (!open && searchParams.get("new") === "1") {
            router.replace(`/workspaces/${workspaceId}/quotes`);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{tNew.title}</SheetTitle>
            <SheetDescription>{tNew.subtitle}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <QuoteForm
              workspaceId={workspaceId}
              clients={clients}
              works={works}
              t={tForm}
              tStatus={t.status}
              labels={{ save: tForm.save, cancel: tForm.cancel }}
              submitAction={(payload) => createQuote(workspaceId, payload)}
              onSaved={() => {
                setCreatingQuote(false);
                if (searchParams.get("new") === "1") {
                  router.replace(`/workspaces/${workspaceId}/quotes`);
                }
                router.refresh();
              }}
              onCancel={() => setCreatingQuote(false)}
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
          <form action={`/workspaces/${workspaceId}/quotes`} className="flex flex-col gap-5 px-4 pb-4">
            <input type="hidden" name="search" value={search} />
            <input type="hidden" name="order" value={order} />
            <input type="hidden" name="direction" value={direction} />
            <input type="hidden" name="filter" value={filter} />
            <input type="hidden" name="status" value={status} />

            <SelectField
              label={t.advancedFilters.client}
              registration={{ name: "clientId", defaultValue: advancedFilters.clientId }}
            >
              <option value="">{t.advancedFilters.clientPlaceholder}</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </SelectField>

            <SelectField
              label={t.advancedFilters.work}
              registration={{ name: "workId", defaultValue: advancedFilters.workId }}
            >
              <option value="">{t.advancedFilters.workPlaceholder}</option>
              {works.map((work) => (
                <option key={work._id} value={work._id}>{work.name}</option>
              ))}
            </SelectField>

            <TextField
              type="number"
              min="1"
              label={t.advancedFilters.quoteNumber}
              registration={{ name: "quoteNumber", defaultValue: advancedFilters.quoteNumber }}
            />

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.advancedFilters.total}</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  name="totalMin"
                  placeholder={t.advancedFilters.min}
                  defaultValue={advancedFilters.totalMin}
                  className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                />
                <input
                  type="number"
                  min="0"
                  name="totalMax"
                  placeholder={t.advancedFilters.max}
                  defaultValue={advancedFilters.totalMax}
                  className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.advancedFilters.items}</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  name="itemsMin"
                  placeholder={t.advancedFilters.min}
                  defaultValue={advancedFilters.itemsMin}
                  className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                />
                <input
                  type="number"
                  min="0"
                  name="itemsMax"
                  placeholder={t.advancedFilters.max}
                  defaultValue={advancedFilters.itemsMax}
                  className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.advancedFilters.createdAt}</span>
              <div className="grid grid-cols-2 gap-3">
                <TextField type="date" label={t.advancedFilters.dateFrom} registration={{ name: "dateFrom", defaultValue: advancedFilters.dateFrom }} />
                <TextField type="date" label={t.advancedFilters.dateTo} registration={{ name: "dateTo", defaultValue: advancedFilters.dateTo }} />
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
        open={!!deletingQuote}
        onOpenChange={(open) => !open && setDeletingQuote(null)}
        title={t.deleteConfirm.title}
        description={t.deleteConfirm.message}
        confirmLabel={t.deleteConfirm.confirm}
        confirmingLabel={t.deleteConfirm.deleting}
        cancelLabel={t.deleteConfirm.cancel}
        onConfirm={async () => {
          const result = await deleteQuote(workspaceId, deletingQuote?._id);
          if (result.success) router.refresh();
          return result;
        }}
      />
    </DashboardShell>
  );
}
