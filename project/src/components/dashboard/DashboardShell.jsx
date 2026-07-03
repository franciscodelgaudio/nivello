import { AppSidebar } from "@/components/dashboard/Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardShell({
  workspaceId,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  active,
  locale,
  children,
}) {
  return (
    <SidebarProvider className="bg-[var(--surface-page)]">
      <AppSidebar
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        workspaces={workspaces}
        userName={userName}
        userEmail={userEmail}
        active={active}
        locale={locale}
      />
      <SidebarInset className="bg-[var(--surface-page)]">
        <div className="flex items-center gap-2 px-4 pt-4">
          <SidebarTrigger variant="outline" className="text-muted-foreground hover:text-foreground" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
