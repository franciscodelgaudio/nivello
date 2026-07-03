import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  error: "border-[var(--danger-600)]/20 bg-[var(--danger-50)] text-[var(--danger-600)]",
  success: "border-[var(--teal-600)]/20 bg-[var(--teal-50)] text-[var(--teal-600)]",
};

const VARIANT_ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
};

export function InlineAlert({ type, message, className }) {
  if (!message) return null;

  const Icon = VARIANT_ICONS[type];

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm",
        VARIANT_CLASSES[type],
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {message}
    </div>
  );
}
