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
import { updateBusinessAction } from "../../actions";
import { businessSchema } from "@/lib/validation/schemas";

import { useParams } from "next/navigation";
export default function EditContactPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<z.infer<typeof businessSchema>>({ resolver: zodResolver(businessSchema) });

  function onSubmit(values: z.infer<typeof businessSchema>) {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
    startTransition(async () => {
      await updateBusinessAction(params.id, fd);
      router.push(`/contacts/${params.id}`);
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Edit business</CardTitle></CardHeader>
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
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
