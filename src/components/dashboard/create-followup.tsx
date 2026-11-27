"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
export function CreateFollowUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [due, setDue] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetch("/api/businesses").then((r) => r.json()).then((j) => {
      setBusinesses(j.businesses || []);
      if (j.businesses?.length) setBusinessId(j.businesses[0].id);
    });
  }, []);

  function create() {
    startTransition(async () => {
      await fetch("/api/follow-ups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, due_at: due || new Date(Date.now() + 86400000).toISOString(), reason: reason || "Follow up" }) });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Create follow-up</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background w-full">
          {businesses.map((b: any) => <option key={b.id} value={b.id}>{b.business_name}</option>)}
        </select>
        <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button onClick={create} disabled={pending}>{pending ? "Saving..." : "Create"}</Button>
      </CardContent>
    </Card>
  );
}
