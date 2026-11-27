import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OverviewPage() {
  const store = await getStore();
  const businesses = await store.listBusinesses();
  const eligible = businesses.filter((b) => b.pipeline_status === "eligible").length;
  const consentMap = new Map();
  for (const b of businesses) consentMap.set(b.id, await store.getConsent(b.id));
  const consentPending = businesses.filter((b) => {
    const c = consentMap.get(b.id);
    return !c || c.consent_status === "pending";
  }).length;
  const queue = await store.listMessageQueue("pending").length;
  const sent = (await store.listMessageQueue("sent")).length + (await store.listMessageQueue("approved")).length;
  const conversations = await store.listConversations();
  const allMsgs = store.messages || [];
  const replies = allMsgs.filter((m: any) => m.direction === "inbound").length;
  const interested = businesses.filter((b) => b.pipeline_status === "interested").length;
  const followUpsDue = await store.listFollowUps("pending").filter((f) => new Date(f.due_at) <= new Date()).length;
  const meetings = await store.listMeetings().filter((m) => m.status === "scheduled").length;
  const converted = businesses.filter((b) => b.pipeline_status === "converted").length;
  const conversionRate = businesses.length ? Math.round((converted / businesses.length) * 100) : 0;
  const revenue = store.pipelines.reduce((s, p) => s + (p.actual_value || 0), 0);
  const aiUsage = await store.listAIUsage().length;

  const metrics = [
    { label: "Total businesses", value: businesses.length },
    { label: "Eligible", value: eligible },
    { label: "Consent pending", value: consentPending },
    { label: "Today's review queue", value: store.listDailyLeads().filter((d) => d.selection_date === new Date().toISOString().slice(0, 10)).length },
    { label: "Messages awaiting approval", value: queue },
    { label: "Confirmed sent", value: sent },
    { label: "Customer replies", value: replies },
    { label: "Interested prospects", value: interested },
    { label: "Follow-ups due", value: followUpsDue },
    { label: "Meetings scheduled", value: meetings },
    { label: "Proposals sent", value: businesses.filter((b) => b.pipeline_status === "proposal_sent").length },
    { label: "Converted clients", value: converted },
    { label: "Conversion rate", value: `${conversionRate}%` },
    { label: "Confirmed revenue", value: `₹${revenue.toLocaleString()}` },
    { label: "AI usage calls", value: aiUsage },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Link href="/contacts">Import contacts</Link></Button>
          <Button size="sm"><Link href="/messages">Review messages</Link></Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{m.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline"><Link href="/contacts">Add business</Link></Button>
            <Button size="sm" variant="outline"><Link href="/leads">Generate today&apos;s queue</Link></Button>
            <Button size="sm" variant="outline"><Link href="/conversations">Open inbox</Link></Button>
            <Button size="sm" variant="outline"><Link href="/follow-ups">View follow-ups</Link></Button>
            <Button size="sm" variant="outline"><Link href="/knowledge-base">Update knowledge base</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {store.listActivityLogs(8).map((a) => (
                <li key={a.id} className="flex justify-between text-muted-foreground">
                  <span>{a.action} · {a.entity_type}</span>
                  <span className="text-xs">{new Date(a.created_at).toLocaleString()}</span>
                </li>
              ))}
              {store.listActivityLogs(8).length === 0 && <li className="text-muted-foreground">No activity yet.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







