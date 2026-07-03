import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-[var(--radius-md)]" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full max-w-xs rounded-[var(--radius-md)]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </main>
    </div>
  );
}
