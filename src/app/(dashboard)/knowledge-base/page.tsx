import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function KnowledgeBasePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const sp = await searchParams;
  const store = await getStore();
  const entries = await store.listKnowledgeBase(sp.category);
  const allKb = await store.listKnowledgeBase();
  const categories = Array.from(new Set(allKb.map((k: any) => k.category)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Knowledge Base</h2>
        <Button size="sm"><Link href="/knowledge-base/new">New entry</Link></Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Link href="/knowledge-base"><Button variant={!sp.category ? "default" : "outline"} size="sm">All</Button></Link>
        {categories.map((c: any) => (
          <Link key={c} href={`/knowledge-base?category=${c}`}><Button variant={sp.category === c ? "default" : "outline"} size="sm">{c}</Button></Link>
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">Category</th><th className="p-3 text-left">Title</th><th className="p-3 text-left">Active</th><th className="p-3 text-left">Version</th><th className="p-3 text-left">Actions</th></tr></thead>
            <tbody>
              {entries.map((e: any) => (
                <tr key={e.id} className="border-b">
                  <td className="p-3">{e.category}</td>
                  <td className="p-3 font-medium">{e.title}</td>
                  <td className="p-3"><Badge variant={e.is_active ? "default" : "secondary"}>{e.is_active ? "active" : "archived"}</Badge></td>
                  <td className="p-3">{e.version}</td>
                  <td className="p-3 flex gap-2">
                    <Link href={`/knowledge-base/${e.id}/edit`} className="text-xs text-primary hover:underline">Edit</Link>
                    <form action={async () => { "use server"; (await getStore()).archiveKnowledgeBase(e.id); }}><button className="text-xs text-red-500">Archive</button></form>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No entries.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}







