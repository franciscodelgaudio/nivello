"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { getDictionary } from "@/lib/i18n/dictionaries";

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

export default function Display({ workspaceId, workspaceName, userName, createClient, locale = "pt" }) {
  const t = getDictionary(locale).clientsNew;
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", address: "", cellphone: "" },
  });

  const onSubmit = async (values) => {
    setFeedback(null);

    const result = await createClient(values);

    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    setFeedback({ type: "success", message: result.message });
    reset();
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <Sidebar workspaceId={workspaceId} workspaceName={workspaceName} userName={userName} active="clients" locale={locale} />

      <main className="flex-1 px-6 py-12 sm:px-10">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--teal-50)]">
                <UserPlus className="h-5 w-5 text-[var(--teal-600)]" strokeWidth={1.75} />
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
              <Field
                label={t.fields.address}
                placeholder={t.fields.addressPlaceholder}
                error={errors.address}
                registration={register("address", { required: t.fields.address })}
              />
              <Field
                label={t.fields.cellphone}
                placeholder={t.fields.cellphonePlaceholder}
                error={errors.cellphone}
                registration={register("cellphone", { required: t.fields.cellphone })}
              />

              <div className="mt-2 flex flex-wrap gap-3">
                <Button type="submit" loading={isSubmitting}>
                  {t.save}
                </Button>
                <Link href={`/workspaces/${workspaceId}/clients`} className={buttonVariants({ variant: "outline" })}>
                  {t.cancel}
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
