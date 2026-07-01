"use client";

import Link from "next/link";
import {
  BadgeInfo,
  BarChart3,
  Calculator,
  History,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { ThemeToggle } from "@/features/dashboard/components/theme-toggle";
import { appRelease } from "@/config/app-release";
import type { AuthUser } from "@/types/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/formatters";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Personal overview",
    icon: BarChart3,
    comingSoon: false,
  },
  {
    href: "/payroll",
    label: "My Calculator",
    description: "Run your payroll preview",
    icon: Calculator,
    comingSoon: false,
  },
  {
    href: "/settings",
    label: "My Settings",
    description: "Salary and contribution controls",
    icon: Wrench,
    comingSoon: false,
  },
  {
    href: "/how-to-use",
    label: "How to Use",
    description: "Quick usage guide",
    icon: Sparkles,
    comingSoon: false,
  },
  {
    href: "/about",
    label: "About This App",
    description: "Version and release history",
    icon: BadgeInfo,
    comingSoon: false,
  },
  {
    href: "/reports",
    label: "My History",
    description: "Saved previews and exports",
    icon: History,
    comingSoon: true,
  },
] as const;

type AppShellProps = {
  children: ReactNode;
  user: AuthUser;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const userName = useMemo(() => user.email.split("@")[0] ?? user.email, [user.email]);

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,color-mix(in_oklch,var(--color-muted),transparent_15%),transparent_45%),radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-chart-1),white_28%),transparent_35%),radial-gradient(circle_at_bottom_right,color-mix(in_oklch,var(--color-chart-3),transparent_10%),transparent_34%)] text-foreground">
      <div className="flex min-h-screen">
        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "bg-sidebar/88 border-sidebar-border fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r px-4 py-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out lg:sticky lg:translate-x-0 lg:shadow-none",
            sidebarCollapsed ? "lg:w-24" : "lg:w-80",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between gap-3 px-2">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-11 items-center justify-center rounded-2xl shadow-sm">
                <ShieldCheck className="size-5" />
              </div>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100",
                )}
              >
                <div>
                  <p className="text-sm font-semibold tracking-[0.18em] uppercase">PayEngine</p>
                  <p className="text-sidebar-foreground/70 text-xs">Personal Payroll Companion</p>
                </div>
              </div>
            </Link>

            <button
              type="button"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hidden lg:inline-flex"
              aria-label="Toggle sidebar width"
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
              <span className="relative inline-flex size-4 items-center justify-center">
                <PanelLeftClose
                  className={cn(
                    "absolute size-4 transition-all duration-300 ease-out",
                    sidebarCollapsed ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
                  )}
                />
                <PanelLeftOpen
                  className={cn(
                    "absolute size-4 transition-all duration-300 ease-out",
                    sidebarCollapsed ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
                  )}
                />
              </span>
            </button>
          </div>

          <div className="mt-6 px-2">
            <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-primary/6 p-3">
              <div className="flex items-center gap-3">
                <Avatar className="bg-sidebar-primary/12 text-sidebar-primary">
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "min-w-0 overflow-hidden transition-all duration-300 ease-out",
                    sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{userName}</p>
                    <p className="text-sidebar-foreground/70 truncate text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1 px-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group relative rounded-2xl border px-3 py-3 transition-all duration-200",
                    isActive
                      ? "border-sidebar-primary/25 bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "border-transparent text-sidebar-foreground/80 hover:-translate-y-0.5 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  {isActive ? <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-sidebar-primary-foreground/70" /> : null}
                  <div className="flex items-center gap-2.5 text-sm font-medium">
                    <span className={cn("inline-flex size-7 items-center justify-center rounded-xl", isActive ? "bg-sidebar-primary-foreground/16" : "bg-sidebar-accent/70")}> 
                      <Icon className="size-4" />
                    </span>
                    <span
                      className={cn(
                        "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out",
                        sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100",
                      )}
                    >
                      {item.label}
                    </span>
                    {sidebarCollapsed ? (
                      <span className="text-xs">{item.label.slice(0, 1)}</span>
                    ) : null}
                    {!sidebarCollapsed && item.comingSoon ? (
                      <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", isActive ? "bg-sidebar-primary-foreground/18 text-sidebar-primary-foreground" : "bg-sidebar-accent text-sidebar-foreground")}>Soon</span>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "mt-1 overflow-hidden transition-all duration-300 ease-out",
                      sidebarCollapsed ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
                    )}
                  >
                    <div className={cn("text-xs", isActive ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/60")}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <Separator className="mb-4 mt-2 bg-sidebar-border/70" />

          <div
            className={cn(
              "mb-4 overflow-hidden px-2 transition-all duration-300 ease-out",
              sidebarCollapsed ? "max-h-0 opacity-0" : "max-h-20 opacity-100",
            )}
          >
            <div className="mb-4 px-2">
              <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-2 text-xs text-sidebar-foreground/70">
                Version {appRelease.version}
              </div>
            </div>
          </div>

          <form action={logoutAction} className="px-2">
            <Button type="submit" variant="outline" className="w-full justify-center border-sidebar-border bg-sidebar hover:bg-sidebar-accent">
              {sidebarCollapsed ? "Out" : "Logout"}
            </Button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/72 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="icon-sm" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu />
                </Button>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">Workspace</p>
                  <h1 className="text-lg font-semibold tracking-tight">Personal Payroll Dashboard</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm text-muted-foreground sm:block">
                  Signed in as <span className="font-medium text-foreground">{user.email}</span>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
