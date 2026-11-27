import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getAIProvider } from "@/lib/ai/provider";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const store = getStore();
  const business = store.getBusiness(String(body.business_id));
  const kb = store.listKnowledgeBase(undefined, true).map((k) => ({ title: k.title, content: k.content }));
  const provider = getAIProvider();
  const result = await provider.generateReply(String(body.message || ""), {
    business: business as unknown as Record<string, unknown>,
    knowledge: kb,
    pipelineStage: business ? store.getPipeline(business.id)?.current_stage : undefined,
  });
  store.logAIUsage({ organization_id: user.organization_id, operation: "assistant", model: (result as { model?: string }).model || "gemini", status: "success" });
  return NextResponse.json({ result });
}
