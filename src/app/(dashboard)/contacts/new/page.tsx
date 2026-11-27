"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBusinessAction } from "../actions";
import { businessSchema } from "@/lib/validation/schemas";

const formSchema = businessSchema.extend({ consent_status: z.string().optional(), consent_source: z.string().optional(), consent_evidence: z.string().optional() });

export default function NewContactPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
    startTransition(async () => {
      const id = await createBusinessAction(fd);
      router.push(`/contacts/${id}`);
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Add business</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Business name *</Label><Input {...register("business_name")} /></div>
              <div><Label>Contact person</Label><Input {...register("contact_person")} /></div>
              <div><Label>Phone</Label><Input {...register("phone_number")} /></div>
              <div><Label>Email</Label><Input {...register("email")} /></div>
              <div><Label>Category</Label><Input {...register("business_category")} /></div>
              <div><Label>City</Label><Input {...register("city")} /></div>
              <div><Label>State</Label><Input {...register("state")} /></div>
              <div><Label>Website URL</Label><Input {...register("website_url")} /></div>
            </div>
            <div><Label>Notes</Label><Input {...register("notes")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Consent status</Label>
                <select {...register("consent_status")} className="border rounded px-2 py-1 text-sm bg-background w-full">
                  <option value="pending">pending</option>
                  <option value="granted">granted</option>
                  <option value="denied">denied</option>
                </select>
              </div>
              <div><Label>Consent source</Label><Input {...register("consent_source")} /></div>
            </div>
            <div><Label>Consent evidence</Label><Input {...register("consent_evidence")} /></div>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
