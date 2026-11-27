import { isSupabaseConfigured } from "@/lib/config/env";
import { getMemoryStore } from "./memory-store";

export function isDemoMode() {
  return !isSupabaseConfigured;
}

// For Version 1, the store is memory-backed unless Supabase is configured.
// When Supabase is configured, services should prefer the Supabase client directly.
// This factory keeps a single entry point for data access in simulation/dev mode.
export function getStore() {
  return getMemoryStore();
}

export { getMemoryStore } from "./memory-store";
export const demoStore = getMemoryStore();
