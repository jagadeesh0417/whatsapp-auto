import { describe, it, expect } from "vitest";
import { normalizePhone, isValidPhone } from "@/lib/security/phone";

describe("phone normalization", () => {
  it("normalizes 10-digit Indian number", () => {
    expect(normalizePhone("9876543210")).toBe("+919876543210");
  });
  it("keeps country code", () => {
    expect(normalizePhone("+91 98765-43210")).toBe("+919876543210");
  });
  it("validates phone", () => {
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
  });
});
