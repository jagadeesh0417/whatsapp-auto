import { NextResponse } from "next/server";
import { getServerStore } from "@/lib/data/server-store";
import { requireMinRole } from "@/lib/auth/rbac";

export async function GET() {
  try { await requireMinRole("viewer"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const store = await getServerStore();
  const businesses = await store.listBusinesses();
  const converted = businesses.filter((b: any) => b.pipeline_status === "converted").length;
  return NextResponse.json({
    total: businesses.length,
    converted,
    conversionRate: businesses.length ? Math.round((converted / businesses.length) * 100) : 0,
    conversations: (await store.listConversations()).length,
    messages: 0,
    followUpsPending: (await store.listFollowUps("pending")).length,
    aiUsage: (await store.listAIUsage()).length,
    businesses,
  });
}
