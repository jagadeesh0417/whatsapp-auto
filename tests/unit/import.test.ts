import { describe, it, expect } from "vitest";
import { getMemoryStore } from "@/lib/data/memory-store";
import { normalizePhone } from "@/lib/security/phone";

describe("import dedup", () => {
  it("prevents duplicate phone", () => {
    const store = getMemoryStore();
    const phone = "+919111111111";
    const b = store.createBusiness({ organization_id: "org_demo_1", business_name: "First", phone_number: phone, normalized_phone_number: phone.replace(/\D/g, "") });
    expect(b).toBeTruthy();
    const existing = store.listBusinesses().find((x) => x.normalized_phone_number === phone.replace(/\D/g, ""));
    expect(existing?.id).toBe(b.id);
  });
});
