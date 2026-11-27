import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const stages = ["new_lead","consent_pending","eligible","message_prepared","awaiting_approval","contacted","replied","interested","follow_up_required","meeting_scheduled","proposal_sent","negotiation","converted","not_interested","opted_out","archived"];

export default async function PipelinePage() {
  const store = await getStore();
  const businesses = await store.listBusinesses();
  const pipelines = await store.listPipelines();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Sales Pipeline</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {stages.map((stage) => {
          const items = businesses.filter((b) => b.pipeline_status === stage);
          return (
            <Card key={stage}>
              <CardHeader className="pb-2"><CardTitle className="text-xs">{stage.replace(/_/g, " ")} ({items.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {items.map((b) => (
                  <div key={b.id} className="rounded border p-2 text-xs">
                    <Link href={`/contacts/${b.id}`} className="font-medium hover:underline">{b.business_name}</Link>
                    <div className="text-muted-foreground">{b.business_category}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Table view</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b"><tr><th className="p-2 text-left">Business</th><th className="p-2 text-left">Stage</th><th className="p-2 text-left">Est. value</th><th className="p-2 text-left">Assigned</th><th className="p-2 text-left">Actions</th></tr></thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="p-2">{b.business_name}</td>
                  <td className="p-2"><Badge variant="secondary">{b.pipeline_status}</Badge></td>
                  <td className="p-2">₹{(pipelines.find((p) => p.business_id === b.id)?.estimated_value || 0).toLocaleString()}</td>
                  <td className="p-2">{b.assigned_to || "—"}</td>
                  <td className="p-2">
                    <form className="flex gap-1" action={async (fd) => { "use server"; const stage = String(fd.get("stage")); (await getStore()).updateBusiness(b.id, { pipeline_status: stage as never }); }}>
                      <select name="stage" defaultValue={b.pipeline_status} className="border rounded px-1 py-0.5 text-xs bg-background">
                        {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="text-xs text-primary">Update</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}






