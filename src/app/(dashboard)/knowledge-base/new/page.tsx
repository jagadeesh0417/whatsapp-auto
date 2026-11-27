"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { knowledgeSchema } from "@/lib/validation/schemas";
import { getStore } from "@/lib/data/store";

export default function NewKnowledgePage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<z.infer<typeof knowledgeSchema>>({ resolver: zodResolver(knowledgeSchema) });

  function onSubmit(values: z.infer<typeof knowledgeSchema>) {
    startTransition(async () => {
      const store = getStore();
      store.createKnowledgeBase({ ...values, organization_id: "org_demo_1", created_by: "user_demo_1" });
      router.push("/knowledge-base");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>New knowledge entry</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Label>Category</Label><Input {...register("category")} /></div>
            <div><Label>Title</Label><Input {...register("title")} /></div>
            <div><Label>Content</Label><Textarea rows={6} {...register("content")} /></div>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
