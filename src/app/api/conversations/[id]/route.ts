import { NextResponse } from "next/server";
import { getServerStore as getStore } from "@/lib/data/server-store";
import { requireMinRole } from "@/lib/auth/rbac";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try { user = await requireMinRole("sales_rep"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const store = await getStore();
  const conv = await store.getConversation(id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const business = await store.getBusiness(conv.business_id);
  const msgs = await store.listMessages(id);
  return NextResponse.json({ conversation: conv, business, messages: msgs });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try { user = await requireMinRole("sales_rep"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const store = await getStore();
  const body = await req.json().catch(() => ({}));
  const conv = await store.updateConversation(id, body);
  return NextResponse.json({ conversation: conv });
}







