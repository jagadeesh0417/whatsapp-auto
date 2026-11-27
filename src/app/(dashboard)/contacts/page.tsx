import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string }> }) {
  const sp = await searchParams;
  const store = await getStore();
  const businesses = await store.listBusinesses({ q: sp.q, pipeline_status: sp.status, category: sp.category });
  const consentMap = new Map();
  for (const b of businesses) consentMap.set(b.id, await store.getConsent(b.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Contacts</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Link href="/contacts/import">Import</Link></Button>
          <Button size="sm"><Link href="/contacts/new">Add business</Link></Button>
        </div>
      </div>
      <form className="flex gap-2 flex-wrap" method="get">
        <Input name="q" placeholder="Search name, phone, category, city" defaultValue={sp.q} className="max-w-xs" />
        <select name="status" defaultValue={sp.status || ""} className="border rounded px-2 py-1 text-sm bg-background">
          <option value="">All statuses</option>
          {["new_lead","consent_pending","eligible","message_prepared","awaiting_approval","contacted","replied","interested","follow_up_required","meeting_scheduled","proposal_sent","negotiation","converted","not_interested","opted_out","archived"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button type="submit" size="sm" variant="outline">Filter</Button>
      </form>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-3">Business</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">City</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Consent</th>
                <th className="text-left p-3"></th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b: any) => {
                const c = consentMap.get(b.id);
                return (
                  <tr key={b.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{b.business_name}</td>
                    <td className="p-3">{b.contact_person || "—"}</td>
                    <td className="p-3">{b.phone_number || "—"}</td>
                    <td className="p-3">{b.business_category || "—"}</td>
                    <td className="p-3">{b.city || "—"}</td>
                    <td className="p-3"><Badge variant="secondary">{b.pipeline_status}</Badge></td>
                    <td className="p-3">{c?.consent_status || "none"}</td>
                    <td className="p-3"><Link href={`/contacts/${b.id}`} className="text-primary hover:underline">View</Link></td>
                  </tr>
                );
              })}
              {businesses.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No contacts found.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}









