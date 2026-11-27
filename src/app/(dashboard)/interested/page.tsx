import { getStore } from "@/lib/data/store";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function InterestedPage() {
  const store = getStore();
  const items = store.listBusinesses().filter((b) => b.pipeline_status === "interested");
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Interested Clients</h2>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">Business</th><th className="p-3 text-left">Category</th><th className="p-3 text-left">City</th><th className="p-3 text-left">Phone</th><th className="p-3"></th></tr></thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-b"><td className="p-3 font-medium">{b.business_name}</td><td className="p-3">{b.business_category}</td><td className="p-3">{b.city}</td><td className="p-3">{b.phone_number}</td><td className="p-3"><Link href={`/contacts/${b.id}`} className="text-primary hover:underline">View</Link></td></tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No interested clients yet.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
