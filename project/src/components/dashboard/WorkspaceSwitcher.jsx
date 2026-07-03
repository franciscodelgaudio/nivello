"use client";

import Link from "next/link";
import { Building2, ChevronsUpDown, Droplet, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId, activeWorkspaceName, t }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-foreground"
              />
            }
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--teal-500)] to-[var(--terra-500)] text-white">
              <Droplet className="h-4 w-4" strokeWidth={1.75} fill="currentColor" fillOpacity={0.25} />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">{activeWorkspaceName}</span>
              <span className="truncate text-[11px] text-sidebar-foreground/60">Nivello</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t.workspaces.label}</DropdownMenuLabel>
              {workspaces.map((workspace) => (
                <DropdownMenuItem key={workspace._id} render={<Link href={`/workspaces/${workspace._id}`} />}>
                  <Building2 className="size-4" />
                  <span className="truncate">{workspace.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/workspaces" />}>
              <Plus className="size-4" />
              {t.workspaces.viewAll}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
