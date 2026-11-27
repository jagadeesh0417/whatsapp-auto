import { NextResponse } from "next/server";
import { getServerStore } from "@/lib/data/server-store";
import { requireMinRole } from "@/lib/auth/rbac";

export async function POST(req: Request) {
  let user;
  try { user = await requireMinRole("sales_rep"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json().catch(() => ({}));
  const store = await getServerStore();
  const b = await store.getBusiness(body.business_id);
  if (!b) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  const c = await store.createConversation({ organization_id: b.organization_id, business_id: b.id, provider: body.provider || "simulation" });
  return NextResponse.json({ conversation: c });
}
