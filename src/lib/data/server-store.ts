import { isSupabaseConfigured } from "@/lib/config/env";
import { getMemoryStore } from "./memory-store";

export async function getServerStore(): Promise<any> {
  if (isSupabaseConfigured) {
    const { SupabaseStore } = await import("./supabase-store");
    return new SupabaseStore();
  }
  return getMemoryStore();
}


