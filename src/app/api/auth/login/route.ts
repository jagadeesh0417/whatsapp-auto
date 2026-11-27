import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/config/env";
import { rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`login:${ip}`, 10, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  // Demo fallback: accept configured demo credentials even when Supabase is configured.
  // Supabase login is attempted first on the client; this endpoint provides a local fallback.
  const demoEmail = process.env.DEMO_ADMIN_EMAIL || "admin@akradhi.local";
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD || "demo1234";
  if (parsed.data.email !== demoEmail || parsed.data.password !== demoPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("akradhi_session", "demo", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return NextResponse.json({ ok: true });
}


