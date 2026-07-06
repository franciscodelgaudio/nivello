import { SidebarSkeleton } from "@/components/dashboard/SidebarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <SidebarSkeleton />
      <div className="flex-1 px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-8">
              <Skeleton className="mb-6 h-5 w-48" />
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
