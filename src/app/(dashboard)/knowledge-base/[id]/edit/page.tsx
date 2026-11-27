"use client";
import { useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditKnowledgePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const store = getStore();
  const entry = store.getKnowledgeBase(params.id);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<z.infer<typeof knowledgeSchema>>({ resolver: zodResolver(knowledgeSchema), defaultValues: { category: entry?.category, title: entry?.title, content: entry?.content, is_active: entry?.is_active } });

  function onSubmit(values: z.infer<typeof knowledgeSchema>) {
    startTransition(async () => {
      store.updateKnowledgeBase(params.id, values);
      router.push("/knowledge-base");
      router.refresh();
    });
  }

  if (!entry) return <div>Not found.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Edit knowledge entry</CardTitle></CardHeader>
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
