import { NextResponse } from "next/server";
import { getServerStore } from "@/lib/data/server-store";
import { requireMinRole } from "@/lib/auth/rbac";

export async function POST(req: Request) {
  let user;
  try { user = await requireMinRole("sales_rep"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json().catch(() => ({}));
  const store = await getServerStore();
  const f = await store.createFollowUp({ organization_id: user.organization_id, business_id: body.business_id, due_at: body.due_at, reason: body.reason, suggested_message: body.suggested_message });
  return NextResponse.json({ followUp: f });
}
