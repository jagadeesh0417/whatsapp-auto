import { getStore } from "@/lib/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { archiveBusinessAction } from "../actions";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const b = store.getBusiness(id);
  if (!b) return <div className="text-muted-foreground">Contact not found.</div>;
  const consent = store.getConsent(id);
  const analysis = store.getAnalysis(id);
  const pipeline = store.getPipeline(id);
  const conv = store.getConversationByBusiness(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{b.business_name}</h2>
        <div className="flex gap-2">
          {conv && <Button variant="outline" size="sm"><Link href={`/conversations/${conv.id}`}>Open conversation</Link></Button>}
          <Button size="sm"><Link href={`/messages?business=${b.id}`}>Draft message</Link></Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Business info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Contact:</span> {b.contact_person || "—"}</div>
            <div><span className="text-muted-foreground">Phone:</span> {b.phone_number || "—"}</div>
            <div><span className="text-muted-foreground">Email:</span> {b.email || "—"}</div>
            <div><span className="text-muted-foreground">Category:</span> {b.business_category || "—"}</div>
            <div><span className="text-muted-foreground">Location:</span> {[b.city, b.state, b.country].filter(Boolean).join(", ") || "—"}</div>
            <div><span className="text-muted-foreground">Website:</span> {b.website_url || "—"}</div>
            <div><span className="text-muted-foreground">Source:</span> {b.source || "—"}</div>
            <div><span className="text-muted-foreground">Notes:</span> {b.notes || "—"}</div>
            <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary">{b.pipeline_status}</Badge></div>
            <div><span className="text-muted-foreground">Lead score:</span> {b.lead_score}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Consent</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Status:</span> {consent?.consent_status || "none"}</div>
            <div><span className="text-muted-foreground">Source:</span> {consent?.consent_source || "—"}</div>
            <div><span className="text-muted-foreground">Scope:</span> {consent?.consent_scope || "—"}</div>
            <div><span className="text-muted-foreground">Evidence:</span> {consent?.evidence_reference || "—"}</div>
            <div><span className="text-muted-foreground">Timestamp:</span> {consent?.consent_timestamp ? new Date(consent.consent_timestamp).toLocaleString() : "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {analysis ? (
              <>
                <div><span className="text-muted-foreground">Status:</span> {analysis.analysis_status}</div>
                <div><span className="text-muted-foreground">Website status:</span> {analysis.website_status || "—"}</div>
                <div><span className="text-muted-foreground">Confidence:</span> {analysis.confidence}</div>
                <div><span className="text-muted-foreground">Findings:</span> {analysis.findings.join(", ") || "—"}</div>
                <div><span className="text-muted-foreground">Suggested services:</span> {analysis.suggested_services.join(", ") || "—"}</div>
              </>
            ) : <div className="text-muted-foreground">No analysis yet.</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Stage:</span> {pipeline?.current_stage || b.pipeline_status}</div>
            <div><span className="text-muted-foreground">Estimated value:</span> ₹{(pipeline?.estimated_value || 0).toLocaleString()}</div>
            <div><span className="text-muted-foreground">Actual value:</span> ₹{(pipeline?.actual_value || 0).toLocaleString()}</div>
            <div><span className="text-muted-foreground">Expected close:</span> {pipeline?.expected_close_date || "—"}</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm"><Link href={`/contacts/${id}/edit`}>Edit</Link></Button>
        <form action={async () => { "use server"; await archiveBusinessAction(id); }}>
          <Button type="submit" variant="destructive" size="sm">Archive</Button>
        </form>
      </div>
    </div>
  );
}

