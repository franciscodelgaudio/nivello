import { Skeleton } from "@/components/ui/skeleton";

export function MetricsSkeleton() {
  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-[var(--radius-lg)]" />
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-72 rounded-[var(--radius-lg)]" />
      </div>
    </main>
  );
}
