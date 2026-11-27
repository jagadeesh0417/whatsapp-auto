import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/config/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEMO_USER_ID, DEMO_ORG_ID } from "@/lib/data/memory-store";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  organization_id: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return null;
    return {
      id: data.user.id,
      email: data.user.email || "",
      full_name: (data.user.user_metadata?.full_name as string) || data.user.email || "",
      organization_id: (data.user.user_metadata?.organization_id as string) || DEMO_ORG_ID,
      role: (data.user.user_metadata?.role as string) || "owner",
    };
  }
  const cookieStore = await cookies();
  if (!cookieStore.get("akradhi_session")?.value) return null;
  return {
    id: DEMO_USER_ID,
    email: "admin@akradhi.local",
    full_name: "Demo Administrator",
    organization_id: DEMO_ORG_ID,
    role: "owner",
  };
}


