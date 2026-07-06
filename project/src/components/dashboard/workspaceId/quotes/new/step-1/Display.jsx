"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatGuarani } from "@/lib/format";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_META,
  PRODUCT_SECTIONS,
  sectionForCategory,
} from "@/lib/constants/quote-items";

const DEFAULT_CATEGORY = PRODUCT_CATEGORIES[0];

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

export default function Display({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  userRole,
  clients,
  works,
  createQuote,
  locale = "pt",
}) {
  const t = getDictionary(locale).quotes.new.form;
  const router = useRouter();
  const [feedback, setFeedback] = useState(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      clientId: "",
      workId: "",
      description: "",
      paymentTerms: "",
      deliveryTerm: "",
      validityDays: 30,
      taxIncluded: true,
      items: [emptyItem()],
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

    const result = await createQuote(payload);

    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    startTransition(() => {
      router.push(`/workspaces/${workspaceId}/quotes`);
    });
  };

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
      <div className="flex-1 px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{t.eyebrow}</p>
            <h1 className="text-[32px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">{t.title}</h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">{t.subtitle}</p>
          </div>

          <InlineAlert type={feedback?.type} message={feedback?.message} />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Cabeçalho do orçamento */}
            <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]">
              <h2 className="mb-6 text-lg font-semibold text-[var(--text-strong)]">{t.headerSectionTitle}</h2>
              <div className="flex flex-col gap-5">
                <TextField
                  label={t.fields.name}
                  placeholder={t.fields.namePlaceholder}
                  error={errors.name}
                  registration={register("name", { required: t.fields.name })}
                />
                <div className="grid gap-5 sm:grid-cols-2">
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
              </div>
            </section>

            {/* Itens do orçamento */}
            <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]">
              <div className="mb-6 flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t.itemsSectionTitle}</h2>
                <p className="text-sm text-[var(--text-muted)]">{t.itemsSectionSubtitle}</p>
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
                        {fields.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t.removeItem}
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                        ) : null}
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

                <Button type="button" variant="outline" onClick={() => append(emptyItem())} className="self-start">
                  <Plus className="h-4 w-4" strokeWidth={1.75} />
                  {t.addItem}
                </Button>
              </div>
            </section>

            {/* Totais */}
            <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]">
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
              <Button type="submit" loading={isSubmitting || isPending}>
                {t.save}
              </Button>
              <Link href={`/workspaces/${workspaceId}/quotes/new`} className={buttonVariants({ variant: "outline" })}>
                {t.cancel}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
