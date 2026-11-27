import { env } from "@/lib/config/env";
import { SimulationAIProvider } from "./simulation-provider";
import { GeminiAIProvider } from "./gemini-provider";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  const p = env.AI_PROVIDER;
  if (p === "gemini") {
    const g = new GeminiAIProvider();
    if (g.isConfigured()) return g;
  }
  if (p === "local") {
    // Local provider falls back to simulation for now
    return new SimulationAIProvider();
  }
  return new SimulationAIProvider();
}

export type { AIProvider, AIContext, AIDraftResult, AIReplyResult } from "./types";


