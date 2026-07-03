import { SidebarSkeleton } from "@/components/dashboard/SidebarSkeleton";
import { MetricsSkeleton } from "@/components/dashboard/MetricsSkeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <SidebarSkeleton />
      <MetricsSkeleton />
    </div>
  );
}
