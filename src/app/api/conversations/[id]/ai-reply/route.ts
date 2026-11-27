import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getAIProvider } from "@/lib/ai/provider";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const store = getStore();
  const conv = store.getConversation(id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const incoming = String(body.incoming_message || "");
  const business = store.getBusiness(conv.business_id);
  const history = store.listMessages(id).map((m) => ({ role: m.direction === "inbound" ? "customer" : "agent", content: m.content }));
  const kb = store.listKnowledgeBase(undefined, true).map((k) => ({ title: k.title, content: k.content }));
  const provider = getAIProvider();
  const result = await provider.generateReply(incoming, {
    business: business as unknown as Record<string, unknown>,
    history,
    knowledge: kb,
    pipelineStage: store.getPipeline(conv.business_id)?.current_stage,
    eligibility: "check consent",
  });
  store.logAIUsage({ organization_id: conv.organization_id, operation: "conversation_reply", model: (result as { model?: string }).model || "gemini", status: "success" });
  // store suggested reply as a message? No, return to UI. Also log activity.
  store.logActivity("ai_reply_generated", "conversation", id, { intent: result.detected_intent }, user.id);
  return NextResponse.json({ result });
}
