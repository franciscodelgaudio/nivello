"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineAlert } from "@/components/ui/inline-alert";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  cancelLabel,
  onConfirm,
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);

    const result = await onConfirm();

    if (result && result.success === false) {
      setError(result.message);
      setPending(false);
      return;
    }

    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setError(null);
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <InlineAlert type={error ? "error" : undefined} message={error} />

        <DialogFooter>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="bg-[var(--danger-600)] text-white hover:bg-[var(--danger-600)]/90"
            loading={pending}
            onClick={handleConfirm}
          >
            {pending ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
