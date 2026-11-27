import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const store = getStore();
  const conv = store.getConversation(id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const business = store.getBusiness(conv.business_id);
  const msgs = store.listMessages(id);
  return NextResponse.json({ conversation: conv, business, messages: msgs });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const store = getStore();
  const body = await req.json().catch(() => ({}));
  const conv = store.updateConversation(id, body);
  return NextResponse.json({ conversation: conv });
}
