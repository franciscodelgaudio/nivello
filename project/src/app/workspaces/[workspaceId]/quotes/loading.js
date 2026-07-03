import { SidebarSkeleton } from "@/components/dashboard/SidebarSkeleton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <SidebarSkeleton />
      <TableSkeleton pillCount={2} columns={6} />
    </div>
  );
}
