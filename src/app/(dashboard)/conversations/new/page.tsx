"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function NewConversationPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [provider, setProvider] = useState("simulation");

  useEffect(() => {
    fetch("/api/businesses").then((r) => r.json()).then((j) => {
      setBusinesses(j.businesses || []);
      if (j.businesses?.length) setBusinessId(j.businesses[0].id);
    });
  }, []);

  function create() {
    startTransition(async () => {
      const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, provider }) });
      const j = await res.json();
      if (j.conversation?.id) router.push(`/conversations/${j.conversation.id}`);
    });
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader><CardTitle>New conversation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm">Business</label>
            <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background w-full">
              {businesses.map((b: any) => <option key={b.id} value={b.id}>{b.business_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm">Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background w-full">
              <option value="simulation">simulation</option>
              <option value="manual">manual</option>
              <option value="official">official</option>
            </select>
          </div>
          <Button onClick={create} disabled={pending}>{pending ? "Creating..." : "Create"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
