import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[var(--surface-deep)] px-5 py-7 lg:flex">
      <div className="mb-10 flex items-center gap-3 px-1">
        <Skeleton className="h-9 w-9 rounded-[var(--radius-md)] bg-white/10" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-20 bg-white/10" />
          <Skeleton className="h-2.5 w-24 bg-white/10" />
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-[var(--radius-md)] bg-white/10" />
        ))}
      </nav>

      <div className="mt-auto border-t border-[var(--surface-deep-border)] px-1 pt-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-white/10" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24 bg-white/10" />
            <Skeleton className="h-2.5 w-20 bg-white/10" />
          </div>
        </div>
        <Skeleton className="mt-3 h-8 w-full rounded-full bg-white/10" />
        <Skeleton className="mt-3 h-8 w-full rounded-[var(--radius-md)] bg-white/10" />
      </div>
    </aside>
  );
}
