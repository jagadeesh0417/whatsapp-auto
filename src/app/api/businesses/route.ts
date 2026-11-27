import { NextResponse } from "next/server";
import { getServerStore } from "@/lib/data/server-store";
import { requireMinRole } from "@/lib/auth/rbac";

export async function GET() {
  try { await requireMinRole("viewer"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const store = await getServerStore();
  const businesses = await store.listBusinesses();
  return NextResponse.json({ businesses });
}
