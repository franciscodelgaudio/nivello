"use client";

import { useTheme } from "next-themes";
import { ChevronsUpDown, Languages, LogOut, SunMoon } from "lucide-react";

import { signOutAction } from "@/components/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES } from "@/lib/i18n/dictionaries";

const LANGUAGE_LABELS = { pt: "Português", es: "Español" };

export function UserMenu({ userName, userEmail, locale, t }) {
  const { theme, setTheme } = useTheme();

  const initials = (userName || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function handleLocaleChange(nextLocale) {
    const formData = new FormData();
    formData.set("locale", nextLocale);
    setLocale(formData);
  }

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
            <Avatar className="h-8 w-8 rounded-[var(--radius-md)]">
              <AvatarFallback className="rounded-[var(--radius-md)] bg-[var(--teal-700)] text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">{userName}</span>
              <span className="truncate text-[11px] text-sidebar-foreground/60">{userEmail}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" side="top" align="end" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-[var(--radius-md)]">
                    <AvatarFallback className="rounded-[var(--radius-md)] bg-[var(--teal-700)] text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SunMoon className="size-4" />
                {t.theme.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">{t.theme.light}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">{t.theme.dark}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">{t.theme.system}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="size-4" />
                {t.language.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
                    {LOCALES.map((code) => (
                      <DropdownMenuRadioItem key={code} value={code}>
                        {LANGUAGE_LABELS[code]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
              <LogOut className="size-4" />
              {t.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
