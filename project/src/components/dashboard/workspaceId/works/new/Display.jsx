"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { HardHat } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { getDictionary } from "@/lib/i18n/dictionaries";

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

export default function Display({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  userRole,
  clients,
  createWork,
  locale = "pt",
}) {
  const t = getDictionary(locale).worksNew;
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      clientId: "",
      address: "",
      startDate: "",
      deadline: "",
      description: "",
    },
  });

  const onSubmit = async (values) => {
    setFeedback(null);

    const result = await createWork(values);

    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    setFeedback({ type: "success", message: result.message });
    reset();
  };

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
      <div className="flex-1 px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              {t.eyebrow}
            </p>
            <h1 className="text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
              {t.title}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {t.subtitle}
            </p>
          </div>

          <InlineAlert type={feedback?.type} message={feedback?.message} />

          {/* Form */}
          <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--terra-50)]">
                <HardHat className="h-5 w-5 text-[var(--terra-600)]" strokeWidth={1.75} />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t.formTitle}</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Field
                label={t.fields.name}
                placeholder={t.fields.namePlaceholder}
                error={errors.name}
                registration={register("name", { required: t.fields.name })}
              />

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

              <Field
                label={t.fields.address}
                placeholder={t.fields.addressPlaceholder}
                error={errors.address}
                registration={register("address", { required: t.fields.address })}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  type="date"
                  label={t.fields.startDate}
                  error={errors.startDate}
                  registration={register("startDate", { required: t.fields.startDate })}
                />
                <Field
                  type="date"
                  label={t.fields.deadline}
                  error={errors.deadline}
                  registration={register("deadline", { required: t.fields.deadline })}
                />
              </div>

              <TextareaField
                label={t.fields.description}
                placeholder={t.fields.descriptionPlaceholder}
                registration={register("description")}
              />

              <div className="mt-2 flex flex-wrap gap-3">
                <Button type="submit" loading={isSubmitting}>
                  {t.save}
                </Button>
                <Link href={`/workspaces/${workspaceId}/works`} className={buttonVariants({ variant: "outline" })}>
                  {t.cancel}
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
