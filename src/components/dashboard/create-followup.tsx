"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStore } from "@/lib/data/store";

export function CreateFollowUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const store = getStore();
  const businesses = store.listBusinesses();
  const [businessId, setBusinessId] = useState(businesses[0]?.id || "");
  const [due, setDue] = useState("");
  const [reason, setReason] = useState("");

  function create() {
    startTransition(async () => {
      store.createFollowUp({ organization_id: store.getBusiness(businessId)?.organization_id, business_id: businessId, due_at: due || new Date(Date.now() + 86400000).toISOString(), reason: reason || "Follow up" });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Create follow-up</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background w-full">
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.business_name}</option>)}
        </select>
        <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button onClick={create} disabled={pending}>{pending ? "Saving..." : "Create"}</Button>
      </CardContent>
    </Card>
  );
}
