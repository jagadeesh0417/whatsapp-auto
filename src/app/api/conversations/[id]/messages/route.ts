import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const store = getStore();
  const conv = store.getConversation(id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const msg = store.createMessage({
    organization_id: conv.organization_id,
    conversation_id: id,
    business_id: conv.business_id,
    direction: body.direction || "outbound",
    sender_type: body.sender_type || "agent",
    message_type: body.message_type || "text",
    content: body.content || "",
    ai_generated: Boolean(body.ai_generated),
    approved_by: body.direction === "outbound" ? user.id : undefined,
    delivery_status: body.direction === "outbound" ? "sent" : "delivered",
    sent_at: body.direction === "outbound" ? new Date().toISOString() : undefined,
  });
  return NextResponse.json({ message: msg });
}
