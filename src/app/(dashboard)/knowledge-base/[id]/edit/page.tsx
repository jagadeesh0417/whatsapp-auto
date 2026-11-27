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
import { useState, useEffect } from "react";

export default function EditKnowledgePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<any>(null);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<z.infer<typeof knowledgeSchema>>({ resolver: zodResolver(knowledgeSchema) });

  useEffect(() => {
    fetch(`/api/knowledge-base/${params.id}`).then((r) => r.json()).then((j) => {
      setEntry(j.entry);
      if (j.entry) {
        // set defaults manually
      }
    });
  }, [params.id]);

  function onSubmit(values: z.infer<typeof knowledgeSchema>) {
    startTransition(async () => {
      await fetch(`/api/knowledge-base/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      router.push("/knowledge-base");
      router.refresh();
    });
  }

  if (!entry) return <div>Loading...</div>;

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
