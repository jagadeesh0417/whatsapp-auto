"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
// Switch replaced with button

interface Msg { id: string; direction: string; sender_type: string; content: string; created_at: string; delivery_status: string; ai_generated: boolean; }
interface Conv { id: string; conversation_status: string; ai_enabled: boolean; provider: string; }
interface Biz { business_name: string; contact_person?: string; phone_number?: string; business_category?: string; city?: string; pipeline_status: string; }
interface AIResult { detected_intent: string; suggested_reply: string; conversation_summary: string; customer_requirements: string[]; suggested_pipeline_status: string; confidence: number; knowledge_refs: string[]; escalation_required: boolean; escalation_reason?: string; suggested_next_action: string; }

export default function ConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [conv, setConv] = useState<Conv | null>(null);
  const [biz, setBiz] = useState<Biz | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [composer, setComposer] = useState("");
  const [incoming, setIncoming] = useState("");
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  async function load() {
    const res = await fetch(`/api/conversations/${id}`);
    const j = await res.json();
    setConv(j.conversation); setBiz(j.business); setMsgs(j.messages || []);
  }
  useEffect(() => { void load(); }, [id]); // eslint-disable-line react-hooks/set-state-in-effect

  async function sendOutbound() {
    if (!composer.trim()) return;
    await fetch(`/api/conversations/${id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ direction: "outbound", sender_type: "agent", content: composer }) });
    setComposer("");
    load();
  }
  async function recordInbound() {
    if (!incoming.trim()) return;
    await fetch(`/api/conversations/${id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ direction: "inbound", sender_type: "customer", content: incoming }) });
    setIncoming("");
    load();
  }
  async function genAIReply() {
    setLoadingAI(true);
    try {
      const res = await fetch(`/api/conversations/${id}/ai-reply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ incoming_message: incoming || msgs.filter((m) => m.direction === "inbound").slice(-1)[0]?.content || "" }) });
      const j = await res.json();
      setAiResult(j.result);
      if (j.result?.suggested_reply) setComposer(j.result.suggested_reply);
    } finally { setLoadingAI(false); }
  }
  async function toggleAI(v: boolean) {
    await fetch(`/api/conversations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ai_enabled: v }) });
    load();
  }

  if (!conv) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      {/* center messages */}
      <div className="lg:col-span-2 flex flex-col border rounded-lg overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-medium">{biz?.business_name}</div>
          <div className="flex items-center gap-2 text-sm">
            <span>AI: {conv.ai_enabled ? "On" : "Off"}</span>
            <Button size="sm" variant="outline" onClick={() => toggleAI(!conv.ai_enabled)}>Toggle</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${m.direction === "outbound" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div>{m.content}</div>
                <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()} · {m.delivery_status}{m.ai_generated ? " · AI" : ""}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t space-y-2">
          <Textarea value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Type a reply..." rows={2} />
          <div className="flex gap-2">
            <Button onClick={sendOutbound}>Send</Button>
            <Button variant="outline" onClick={genAIReply} disabled={loadingAI}>{loadingAI ? "Generating..." : "AI suggest"}</Button>
          </div>
          <div className="flex gap-2 items-center">
            <Input value={incoming} onChange={(e) => setIncoming(e.target.value)} placeholder="Record incoming customer message..." />
            <Button variant="outline" onClick={recordInbound}>Record inbound</Button>
          </div>
        </div>
      </div>
      {/* right panel */}
      <div className="space-y-4 overflow-y-auto">
        <Card>
          <CardHeader><CardTitle className="text-sm">Business profile</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>{biz?.business_name}</div>
            <div className="text-muted-foreground">{biz?.contact_person}</div>
            <div className="text-muted-foreground">{biz?.phone_number}</div>
            <div className="text-muted-foreground">{biz?.business_category} · {biz?.city}</div>
            <Badge variant="secondary">{biz?.pipeline_status}</Badge>
          </CardContent>
        </Card>
        {aiResult && (
          <Card>
            <CardHeader><CardTitle className="text-sm">AI analysis</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div><span className="text-muted-foreground">Intent:</span> {aiResult.detected_intent}</div>
              <div><span className="text-muted-foreground">Confidence:</span> {aiResult.confidence}</div>
              <div><span className="text-muted-foreground">Summary:</span> {aiResult.conversation_summary}</div>
              <div><span className="text-muted-foreground">Requirements:</span> {aiResult.customer_requirements?.join(", ") || "—"}</div>
              <div><span className="text-muted-foreground">Suggested status:</span> {aiResult.suggested_pipeline_status}</div>
              <div><span className="text-muted-foreground">Escalation:</span> {aiResult.escalation_required ? aiResult.escalation_reason : "No"}</div>
              <div><span className="text-muted-foreground">Next action:</span> {aiResult.suggested_next_action}</div>
              <div><span className="text-muted-foreground">Knowledge refs:</span> {aiResult.knowledge_refs?.join(", ")}</div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle className="text-sm">Human takeover</CardTitle></CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={async () => { await toggleAI(false); }}>Pause AI</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
