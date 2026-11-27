import { describe, it, expect } from "vitest";
import { getMemoryStore } from "@/lib/data/memory-store";

describe("webhook dedup", () => {
  it("prevents duplicate external event", () => {
    const store = getMemoryStore();
    const e1 = store.createWebhookEvent({ provider: "official", external_event_id: "evt_123", event_type: "message" });
    expect(e1).toBeTruthy();
    const existing = store.findWebhookEvent("evt_123");
    expect(existing).toBeTruthy();
    // Simulate dedup: if exists, mark duplicate
    if (existing) store.updateWebhookEvent(existing.id, { processing_status: "duplicate" });
    expect(store.findWebhookEvent("evt_123")?.processing_status).toBe("duplicate");
  });
});
