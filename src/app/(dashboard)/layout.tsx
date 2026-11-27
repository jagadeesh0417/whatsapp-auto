import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/logout-button";
import { isSupabaseConfigured } from "@/lib/config/env";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  async function logout() {
    "use server";
    // server action
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium text-muted-foreground">AKRADHI — AI Sales Intelligence &amp; CRM</h1>
            {!isSupabaseConfigured && (
              <span className="rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 text-xs">
                Simulation Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user.full_name}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
