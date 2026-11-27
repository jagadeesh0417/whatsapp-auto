import { NextResponse } from "next/server";
import { getServerStore } from "@/lib/data/server-store";
import { requireMinRole } from "@/lib/auth/rbac";

export async function POST(req: Request) {
  let user;
  try { user = await requireMinRole("sales_rep"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json().catch(() => ({}));
  const store = await getServerStore();
  const k = await store.createKnowledgeBase({ organization_id: user.organization_id, category: body.category, title: body.title, content: body.content, is_active: body.is_active ?? true, created_by: user.id });
  return NextResponse.json({ entry: k });
}
