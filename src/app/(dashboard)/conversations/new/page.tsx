"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStore } from "@/lib/data/store";

export default function NewConversationPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const store = getStore();
  const businesses = store.listBusinesses();
  const [businessId, setBusinessId] = useState(businesses[0]?.id || "");
  const [provider, setProvider] = useState("simulation");

  function create() {
    startTransition(async () => {
      const b = store.getBusiness(businessId);
      if (!b) return;
      const c = store.createConversation({ organization_id: b.organization_id, business_id: b.id, provider: provider as "simulation" | "manual" | "official" });
      router.push(`/conversations/${c.id}`);
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
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.business_name}</option>)}
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
