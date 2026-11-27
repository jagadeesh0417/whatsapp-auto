import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function ConvertedPage() {
  const store = await getStore();
  const items = await store.listBusinesses().filter((b) => b.pipeline_status === "converted");
  const revenue = store.pipelines.filter((p) => store.getBusiness(p.business_id)?.pipeline_status === "converted").reduce((s, p) => s + (p.actual_value || 0), 0);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Converted Clients</h2>
      <div className="text-sm text-muted-foreground">Confirmed revenue: ₹{revenue.toLocaleString()}</div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">Business</th><th className="p-3 text-left">Category</th><th className="p-3 text-left">City</th><th className="p-3 text-left">Actual value</th><th className="p-3"></th></tr></thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-b"><td className="p-3 font-medium">{b.business_name}</td><td className="p-3">{b.business_category}</td><td className="p-3">{b.city}</td><td className="p-3">₹{(store.getPipeline(b.id)?.actual_value || 0).toLocaleString()}</td><td className="p-3"><Link href={`/contacts/${b.id}`} className="text-primary hover:underline">View</Link></td></tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No converted clients yet.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}






