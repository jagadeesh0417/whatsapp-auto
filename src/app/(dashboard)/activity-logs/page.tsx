import { getStore } from "@/lib/data/store";
import { Card, CardContent } from "@/components/ui/card";

export default function ActivityLogsPage() {
  const store = getStore();
  const logs = store.listActivityLogs(200);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Activity Logs</h2>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">Time</th><th className="p-3 text-left">Action</th><th className="p-3 text-left">Entity</th><th className="p-3 text-left">ID</th><th className="p-3 text-left">Metadata</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-3 text-xs">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-3">{l.action}</td>
                <td className="p-3">{l.entity_type}</td>
                <td className="p-3 text-xs">{l.entity_id || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{l.metadata ? JSON.stringify(l.metadata) : "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No activity.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
