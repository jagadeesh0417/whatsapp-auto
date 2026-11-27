import { describe, it, expect } from "vitest";
import { SimulationAIProvider } from "@/lib/ai/simulation-provider";
import { z } from "zod";

const replySchema = z.object({
  detected_intent: z.string(),
  suggested_reply: z.string(),
  conversation_summary: z.string(),
  customer_requirements: z.array(z.string()),
  suggested_pipeline_status: z.string(),
  confidence: z.number().min(0).max(1),
  knowledge_refs: z.array(z.string()),
  escalation_required: z.boolean(),
  suggested_next_action: z.string(),
});

describe("AI reply validation", () => {
  it("simulation provider returns valid structured reply", async () => {
    const p = new SimulationAIProvider();
    const r = await p.generateReply("What is your price?", { business: { business_name: "Acme" } });
    const parsed = replySchema.safeParse(r);
    expect(parsed.success).toBe(true);
  });
  it("does not invent price", async () => {
    // heuristic: suggested reply should not contain currency amounts
    const p = new SimulationAIProvider();
    const r = await p.generateReply("price?", { business: { business_name: "Acme" } });
    expect(r.suggested_reply).not.toMatch(/₹\d/);
  });
});
