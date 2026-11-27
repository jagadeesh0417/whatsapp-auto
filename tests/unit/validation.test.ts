import { describe, it, expect } from "vitest";
import { businessSchema, knowledgeSchema, loginSchema } from "@/lib/validation/schemas";

describe("validation", () => {
  it("rejects empty business name", () => {
    const r = businessSchema.safeParse({ business_name: "" });
    expect(r.success).toBe(false);
  });
  it("accepts valid business", () => {
    const r = businessSchema.safeParse({ business_name: "Acme", email: "a@b.com" });
    expect(r.success).toBe(true);
  });
  it("validates knowledge entry", () => {
    const r = knowledgeSchema.safeParse({ category: "faq", title: "T", content: "C" });
    expect(r.success).toBe(true);
  });
  it("validates login", () => {
    const r = loginSchema.safeParse({ email: "x@y.com", password: "123456" });
    expect(r.success).toBe(true);
  });
});
