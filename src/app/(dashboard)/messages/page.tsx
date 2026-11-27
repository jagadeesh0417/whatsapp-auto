import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const sp = await searchParams;
  const store = await getStore();
  const items = await store.listMessageQueue();
  const businesses = await store.listBusinesses();
  const businessById = new Map(businesses.map((b) => [b.id, b]));

  async function generateDraft(formData: FormData) {
    "use server";
    const business_id = String(formData.get("business_id"));
    const message_type = String(formData.get("message_type"));
    const s = await getStore();
    const b = await s.getBusiness(business_id);
    if (!b) return;
    const { getAIProvider } = await import("@/lib/ai/provider");
    const provider = getAIProvider();
    const kb = (await s.listKnowledgeBase(undefined, true)).map((k) => ({ title: k.title, content: k.content }));
    const res = await provider.generateDraft(message_type, { business: b as unknown as Record<string, unknown>, knowledge: kb });
    await s.createMessageQueueItem({ organization_id: b.organization_id, business_id, message_type, generated_content: res.content, approval_status: "pending" });
    await s.logAIUsage({ organization_id: b.organization_id, operation: "draft_message", model: res.model, status: "success" });
    await s.logActivity("generate_draft", "message_queue", business_id, { message_type }, undefined);
  }

  async function approve(id: string) {
    "use server";
    const s = await getStore();
    await s.updateMessageQueueItem(id, { approval_status: "approved", approved_by: "demo", approved_at: new Date().toISOString() });
    await s.logActivity("approve_message", "message_queue", id, {}, undefined);
  }
  async function reject(id: string) {
    "use server";
    const s = await getStore();
    await s.updateMessageQueueItem(id, { approval_status: "rejected", rejection_reason: "Rejected by reviewer" });
    await s.logActivity("reject_message", "message_queue", id, {}, undefined);
  }

  const rows = items.map((q) => ({ q, b: businessById.get(q.business_id) }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Message Queue</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Generate draft</CardTitle></CardHeader>
        <CardContent>
          <form action={generateDraft} className="flex gap-2 flex-wrap items-end">
            <div>
              <label className="text-xs text-muted-foreground">Business</label>
              <select name="business_id" defaultValue={sp.business || businesses[0]?.id} className="border rounded px-2 py-1 text-sm bg-background">
                {businesses.map((b) => <option key={b.id} value={b.id}>{b.business_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select name="message_type" className="border rounded px-2 py-1 text-sm bg-background">
                {["introduction","service information","consultation request","follow-up","meeting confirmation","pricing information","portfolio sharing"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Button type="submit">Generate</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr><th className="p-3 text-left">Business</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Content</th><th className="p-3 text-left">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(({ q, b }) => (
                <tr key={q.id} className="border-b align-top">
                  <td className="p-3 font-medium">{b?.business_name}</td>
                  <td className="p-3">{q.message_type}</td>
                  <td className="p-3"><Badge variant="secondary">{q.approval_status}</Badge></td>
                  <td className="p-3 max-w-md">
                    <div className="text-xs text-muted-foreground line-clamp-3">{q.edited_content || q.generated_content}</div>
                    {q.approval_status === "approved" && (
                      <a href={`https://wa.me/${(b?.phone_number || "").replace(/\\D/g, "")}?text=${encodeURIComponent(q.edited_content || q.generated_content)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open WhatsApp</a>
                    )}
                  </td>
                  <td className="p-3 flex gap-2">
                    {q.approval_status === "pending" && (
                      <>
                        <form action={async () => { "use server"; await approve(q.id); }}><Button size="sm" type="submit">Approve</Button></form>
                        <form action={async () => { "use server"; await reject(q.id); }}><Button size="sm" variant="destructive" type="submit">Reject</Button></form>
                      </>
                    )}
                    {q.approval_status === "approved" && (
                      <form action={async () => { "use server"; const s = await getStore(); await s.updateMessageQueueItem(q.id, { approval_status: "sent" }); await s.logActivity("manual_send_confirmed", "message_queue", q.id, {}, undefined); }}>
                        <Button size="sm" variant="outline" type="submit">Mark sent</Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No messages.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}



