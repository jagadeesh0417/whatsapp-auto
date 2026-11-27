"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ListChecks, BarChart3, Send, MessageSquare, Bot, CalendarClock,
  Kanban, Star, CheckCircle2, BookOpen, FileBarChart, Activity, Settings, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/leads", label: "Today's Leads", icon: ListChecks },
  { href: "/analysis", label: "Business Analysis", icon: BarChart3 },
  { href: "/messages", label: "Message Queue", icon: Send },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/pipeline", label: "Sales Pipeline", icon: Kanban },
  { href: "/interested", label: "Interested Clients", icon: Star },
  { href: "/converted", label: "Converted Clients", icon: CheckCircle2 },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/activity-logs", label: "Activity Logs", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("border-r bg-card transition-all duration-200 flex flex-col", collapsed ? "w-16" : "w-60")}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <span className="font-semibold text-sm">AKRADHI</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              title={it.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{it.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
