import { URL } from "url";

const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"];
const PRIVATE_RANGES = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^127\./,
  /^0\./,
];

export function isSafeUrl(raw: string): { safe: boolean; reason?: string } {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { safe: false, reason: "invalid url" };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { safe: false, reason: "unsupported protocol" };
  }
  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.includes(host)) return { safe: false, reason: "blocked host" };
  if (PRIVATE_RANGES.some((r) => r.test(host))) return { safe: false, reason: "private network" };
  if (host.endsWith(".local") || host.endsWith(".internal")) return { safe: false, reason: "internal host" };
  return { safe: true };
}
