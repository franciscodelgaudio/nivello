import Link from "next/link";
import { FileText, HardHat, LayoutGrid, Users } from "lucide-react";

import { UserMenu } from "@/components/dashboard/UserMenu";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function AppSidebar({
  workspaceId,
  workspaceName,
  workspaces = [],
  userName,
  userEmail,
  active,
  locale = "pt",
}) {
  const t = getDictionary(locale);

  const navItems = [
    { key: "painel", href: `/workspaces/${workspaceId}`, label: t.sidebar.nav.painel, icon: LayoutGrid },
    { key: "quotes", href: `/workspaces/${workspaceId}/quotes`, label: t.sidebar.nav.quotes, icon: FileText },
    { key: "works", href: `/workspaces/${workspaceId}/works`, label: t.sidebar.nav.works, icon: HardHat },
    { key: "clients", href: `/workspaces/${workspaceId}/clients`, label: t.sidebar.nav.clients, icon: Users },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={workspaceId}
          activeWorkspaceName={workspaceName}
          t={t.sidebar}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map(({ key, href, label, icon: Icon }) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={key === active}
                    tooltip={label}
                    className="h-9 gap-3"
                  >
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu userName={userName} userEmail={userEmail} locale={locale} t={t.sidebar} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
