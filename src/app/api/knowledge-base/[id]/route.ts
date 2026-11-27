import { NextResponse } from "next/server";
import { getServerStore } from "@/lib/data/server-store";
import { requireMinRole } from "@/lib/auth/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try { user = await requireMinRole("sales_rep"); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const store = await getServerStore();
  const k = await store.updateKnowledgeBase(id, body);
  return NextResponse.json({ entry: k });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await getServerStore();
  const k = await store.getKnowledgeBase(id);
  return NextResponse.json({ entry: k });
}
