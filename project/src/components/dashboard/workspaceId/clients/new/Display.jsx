import Link from "next/link";
import { AlertCircle, UserPlus } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";

function Field({ label, name, placeholder, type = "text" }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</span>
      <input
        type={type}
        name={name}
        required
        placeholder={placeholder}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
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
  createClient,
  error,
  locale = "pt",
}) {
  const t = getDictionary(locale).clientsNew;

  return (
    <DashboardShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      workspaces={workspaces}
      userName={userName}
      userEmail={userEmail}
      active="clients"
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

          {error ? (
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--danger-600)]/20 bg-[var(--danger-50)] px-4 py-3 text-sm text-[var(--danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {error}
            </div>
          ) : null}

          {/* Form */}
          <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--teal-50)]">
                <UserPlus className="h-5 w-5 text-[var(--teal-600)]" strokeWidth={1.75} />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t.formTitle}</h2>
            </div>

            <form action={createClient} className="flex flex-col gap-5">
              <Field label={t.fields.name} name="name" placeholder={t.fields.namePlaceholder} />
              <Field label={t.fields.address} name="address" placeholder={t.fields.addressPlaceholder} />
              <Field label={t.fields.cellphone} name="cellphone" placeholder={t.fields.cellphonePlaceholder} />

              <div className="mt-2 flex flex-wrap gap-3">
                <Button type="submit">{t.save}</Button>
                <Link href={`/workspaces/${workspaceId}/clients`} className={buttonVariants({ variant: "outline" })}>
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
