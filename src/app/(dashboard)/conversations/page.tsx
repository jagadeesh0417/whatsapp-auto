import { getStore } from "@/lib/data/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ConversationsPage() {
  const store = getStore();
  const convs = store.listConversations();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Conversations</h2>
        <Button size="sm"><Link href="/conversations/new">New conversation</Link></Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">Business</th><th className="p-3 text-left">Provider</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">AI</th><th className="p-3 text-left">Last message</th><th className="p-3"></th></tr></thead>
            <tbody>
              {convs.map((c) => {
                const b = store.getBusiness(c.business_id);
                return (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{b?.business_name}</td>
                    <td className="p-3">{c.provider}</td>
                    <td className="p-3"><Badge variant="secondary">{c.conversation_status}</Badge></td>
                    <td className="p-3">{c.ai_enabled ? "On" : "Off"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "—"}</td>
                    <td className="p-3"><Link href={`/conversations/${c.id}`} className="text-primary hover:underline">Open</Link></td>
                  </tr>
                );
              })}
              {convs.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No conversations.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

