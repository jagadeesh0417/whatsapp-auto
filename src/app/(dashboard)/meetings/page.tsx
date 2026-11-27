import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function MeetingsPage() {
  const store = await getStore();
  const meetings = await store.listMeetings();
  const businesses = await store.listBusinesses();
  const businessById = new Map<any, any>(businesses.map((b: any) => [b.id, b]));
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Meetings</h2>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">Business</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Link</th></tr></thead>
            <tbody>
              {meetings.map((m: any) => (
                <tr key={m.id} className="border-b">
                  <td className="p-3">{businessById.get(m.business_id)?.business_name || "—"}</td>
                  <td className="p-3 text-xs">{new Date(m.meeting_date).toLocaleString()}</td>
                  <td className="p-3">{m.meeting_type}</td>
                  <td className="p-3">{m.status}</td>
                  <td className="p-3">{m.meeting_link ? <a href={m.meeting_link} className="text-primary hover:underline" target="_blank" rel="noreferrer">Link</a> : "—"}</td>
                </tr>
              ))}
              {meetings.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No meetings.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Schedule meeting</CardTitle></CardHeader>
        <CardContent>
          <form action={async (fd) => { "use server"; const s = await getStore(); await s.createMeeting({ organization_id: "org_demo_1", business_id: String(fd.get("business_id")), meeting_date: new Date(String(fd.get("date"))).toISOString(), meeting_type: String(fd.get("type") || "consultation"), meeting_link: String(fd.get("link") || "") }); }} className="flex gap-2 flex-wrap items-end">
            <select name="business_id" className="border rounded px-2 py-1 text-sm bg-background">{businesses.map((b: any) => <option key={b.id} value={b.id}>{b.business_name}</option>)}</select>
            <input type="datetime-local" name="date" className="border rounded px-2 py-1 text-sm bg-background" />
            <select name="type" className="border rounded px-2 py-1 text-sm bg-background"><option>consultation</option><option>demo</option><option>proposal</option></select>
            <input name="link" placeholder="Meeting link" className="border rounded px-2 py-1 text-sm bg-background" />
            <Button type="submit">Schedule</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
