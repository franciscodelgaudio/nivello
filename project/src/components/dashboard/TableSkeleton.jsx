import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ pillCount = 3, columns = 6, rows = 6 }) {
  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-1 items-center gap-3 sm:justify-end">
          <Skeleton className="h-10 w-full max-w-xs rounded-[var(--radius-md)]" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: pillCount }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, r) => (
                <tr key={r} className="border-b border-[var(--border-subtle)] last:border-0">
                  {Array.from({ length: columns }).map((_, c) => (
                    <td key={c} className="px-6 py-4">
                      <Skeleton className="h-4 w-full max-w-32" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
