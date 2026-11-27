import { getStore } from "@/lib/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function eligible(biz: ReturnType<ReturnType<typeof getStore>["getBusiness"]> & {}) {
  const store = getStore();
  const c = store.getConsent(biz.id);
  if (!c || c.consent_status !== "granted") return { ok: false, reason: "Consent not granted" };
  if (biz.pipeline_status === "opted_out" || biz.pipeline_status === "not_interested" || biz.pipeline_status === "archived") return { ok: false, reason: "Opted out / declined / archived" };
  if (!biz.phone_number) return { ok: false, reason: "No phone number" };
  return { ok: true, reason: "Eligible" };
}

export default async function LeadsPage() {
  const store = getStore();
  const today = new Date().toISOString().slice(0, 10);
  const queue = store.listDailyLeads(today);
  const businesses = store.listBusinesses();

  async function generate() {
    "use server";
    const s = getStore();
    const today2 = new Date().toISOString().slice(0, 10);
    const existing = s.listDailyLeads(today2).map((d) => d.business_id);
    let added = 0;
    for (const b of businesses) {
      if (added >= 20) break;
      if (existing.includes(b.id)) continue;
      const c = s.getConsent(b.id);
      if (!c || c.consent_status !== "granted") continue;
      if (["opted_out", "not_interested", "archived"].includes(b.pipeline_status)) continue;
      if (!b.phone_number) continue;
      s.addDailyLead(b.id, "Consent granted, not previously declined");
      added++;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Today&apos;s Leads</h2>
        <form action={generate}><Button type="submit">Generate today&apos;s queue</Button></form>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Review queue ({queue.length})</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b"><tr><th className="p-2 text-left">Business</th><th className="p-2 text-left">Category</th><th className="p-2 text-left">City</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Eligibility</th><th className="p-2"></th></tr></thead>
            <tbody>
              {queue.map((dl) => {
                const b = store.getBusiness(dl.business_id);
                if (!b) return null;
                const e = eligible(b);
                return (
                  <tr key={dl.id} className="border-b">
                    <td className="p-2 font-medium">{b.business_name}</td>
                    <td className="p-2">{b.business_category}</td>
                    <td className="p-2">{b.city}</td>
                    <td className="p-2"><Badge variant="secondary">{dl.status}</Badge></td>
                    <td className="p-2 text-xs">{e.reason}</td>
                    <td className="p-2 flex gap-2">
                      <Link href={`/contacts/${b.id}`} className="text-primary text-xs hover:underline">View</Link>
                      <form action={async () => { "use server"; getStore().removeDailyLead(dl.id); }}>
                        <button className="text-xs text-red-500">Remove</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {queue.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No leads in today&apos;s queue. Generate to review.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">All businesses eligibility</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b"><tr><th className="p-2 text-left">Business</th><th className="p-2 text-left">Reason</th></tr></thead>
            <tbody>
              {businesses.map((b) => {
                const e = eligible(b);
                return (
                  <tr key={b.id} className="border-b">
                    <td className="p-2">{b.business_name}</td>
                    <td className="p-2 text-xs">{e.ok ? "Eligible" : e.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
