import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function FollowUpsPage() {
  const store = await getStore();
  const items = await store.listFollowUps();
  const businessById = new Map();
  for (const f of items) businessById.set(f.business_id, await store.getBusiness(f.business_id));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Follow-ups</h2>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">Business</th><th className="p-3 text-left">Due</th><th className="p-3 text-left">Reason</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Actions</th></tr></thead>
            <tbody>
              {items.map((f) => {
                const b = businessById.get(f.business_id);
                return (
                  <tr key={f.id} className="border-b">
                    <td className="p-3">{b?.business_name}</td>
                    <td className="p-3 text-xs">{new Date(f.due_at).toLocaleString()}</td>
                    <td className="p-3">{f.reason}</td>
                    <td className="p-3"><Badge variant="secondary">{f.status}</Badge></td>
                    <td className="p-3 flex gap-2">
                      {f.status === "pending" && (
                        <>
                          <form action={async () => { "use server"; (await getStore()).updateFollowUp(f.id, { status: "completed" }); }}><Button size="sm" type="submit">Complete</Button></form>
                          <form action={async () => { "use server"; (await getStore()).updateFollowUp(f.id, { status: "cancelled" }); }}><Button size="sm" variant="destructive" type="submit">Cancel</Button></form>
                        </>
                      )}
                      <Link href={`/contacts/${f.business_id}`} className="text-xs text-primary hover:underline">View</Link>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No follow-ups.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <CreateFollowUpForm />
    </div>
  );
}

import { CreateFollowUpForm } from "@/components/dashboard/create-followup";






