import { describe, it, expect } from "vitest";
import { isSafeUrl } from "@/lib/security/ssrf";

describe("ssrf protection", () => {
  it("blocks localhost", () => { expect(isSafeUrl("http://localhost/foo").safe).toBe(false); });
  it("blocks private ip", () => { expect(isSafeUrl("http://192.168.1.1/").safe).toBe(false); });
  it("blocks metadata endpoint", () => { expect(isSafeUrl("http://169.254.169.254/").safe).toBe(false); });
  it("allows public https", () => { expect(isSafeUrl("https://example.com/").safe).toBe(true); });
  it("blocks ftp", () => { expect(isSafeUrl("ftp://example.com/").safe).toBe(false); });
});
