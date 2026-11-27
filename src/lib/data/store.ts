import { isSupabaseConfigured } from "@/lib/config/env";
import { getMemoryStore } from "./memory-store";

export function isDemoMode() {
  return !isSupabaseConfigured;
}

// Client-side / demo store (synchronous)
export function getStore() {
  return getMemoryStore();
}

export { getMemoryStore } from "./memory-store";
export const demoStore = getMemoryStore();


