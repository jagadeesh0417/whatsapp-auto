"use client";
import { useState } from "react";
import { getStore } from "@/lib/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AIResult { detected_intent: string; suggested_reply: string; conversation_summary: string; customer_requirements: string[]; suggested_pipeline_status: string; confidence: number; knowledge_refs: string[]; escalation_required: boolean; escalation_reason?: string; suggested_next_action: string; }

export default function AssistantPage() {
  const store = getStore();
  const businesses = store.listBusinesses();
  const [businessId, setBusinessId] = useState(businesses[0]?.id || "");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, message }) });
      const j = await res.json();
      setResult(j.result);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-2xl font-semibold">AI Assistant</h2>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <Select value={businessId} onValueChange={(v) => { if (v) setBusinessId(v); }}>
            <SelectTrigger><SelectValue placeholder="Business" /></SelectTrigger>
            <SelectContent>
              {businesses.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.business_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Customer message..." rows={4} />
          <Button onClick={ask} disabled={loading || !message.trim()}>{loading ? "Thinking..." : "Generate reply"}</Button>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardHeader><CardTitle className="text-base">Result</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="text-muted-foreground">Intent:</span> {result.detected_intent}</div>
            <div><span className="text-muted-foreground">Suggested reply:</span> {result.suggested_reply}</div>
            <div><span className="text-muted-foreground">Summary:</span> {result.conversation_summary}</div>
            <div><span className="text-muted-foreground">Requirements:</span> {result.customer_requirements?.join(", ") || "—"}</div>
            <div><span className="text-muted-foreground">Suggested status:</span> {result.suggested_pipeline_status}</div>
            <div><span className="text-muted-foreground">Confidence:</span> {result.confidence}</div>
            <div><span className="text-muted-foreground">Escalation:</span> {result.escalation_required ? result.escalation_reason : "No"}</div>
            <div><span className="text-muted-foreground">Next action:</span> {result.suggested_next_action}</div>
            <div><span className="text-muted-foreground">Knowledge refs:</span> {result.knowledge_refs?.join(", ")}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
