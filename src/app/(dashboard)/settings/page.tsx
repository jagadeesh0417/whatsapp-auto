import { getServerStore as getStore } from "@/lib/data/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, isGeminiConfigured, env } from "@/lib/config/env";

export default async function SettingsPage() {
  const store = await getStore();
  const settings = await store.listSettings();
  const get = (k: string) => settings.find((s) => s.setting_key === k)?.setting_value;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <Card>
        <CardHeader><CardTitle className="text-base">Organization</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>Agency name: {String(get("agency_name") || "AKRADHI")}</div>
          <div>Timezone: {String(get("timezone") || env.APP_TIMEZONE)}</div>
          <form action={async (fd) => { "use server"; const s = await getStore(); await s.upsertSetting("agency_name", String(fd.get("agency_name") || "AKRADHI")); await s.upsertSetting("timezone", String(fd.get("timezone") || env.APP_TIMEZONE)); }} className="flex gap-2 items-end">
            <input name="agency_name" placeholder="Agency name" className="border rounded px-2 py-1 text-sm bg-background" />
            <input name="timezone" placeholder="Timezone" className="border rounded px-2 py-1 text-sm bg-background" />
            <Button type="submit" size="sm">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">AI configuration</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>Provider: {env.AI_PROVIDER}</div>
          <div>Model: {env.GEMINI_MODEL}</div>
          <div>Gemini configured: {isGeminiConfigured ? "Yes" : "No"}</div>
          <div>Communication tone: {String(get("communication_tone") || "professional")}</div>
          <div>Confidence threshold: {String(get("confidence_threshold") || 0.7)}</div>
          <div>Daily AI budget: {String(get("daily_ai_budget") || 100)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Communication</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>WhatsApp provider: {env.WHATSAPP_PROVIDER}</div>
          <div>WhatsApp API enabled: {env.WHATSAPP_API_ENABLED ? "true" : "false"}</div>
          <div>Simulation mode: {env.ENABLE_SIMULATION_MODE ? "enabled" : "disabled"}</div>
          <div>Supabase configured: {isSupabaseConfigured ? "Yes" : "No"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Integration health</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>Supabase: {isSupabaseConfigured ? "Configured" : "Not configured"}</div>
          <div>Gemini: {isGeminiConfigured ? "Configured" : "Not configured"}</div>
          <div>WhatsApp Official API: {env.WHATSAPP_API_ENABLED ? "Enabled (verify eligibility)" : "Disabled"}</div>
          <div>Simulation mode: Active by default</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>Roles: owner, administrator, sales_rep, viewer</div>
          <div>Public registration: disabled</div>
          <div>RLS: enforced in migrations</div>
        </CardContent>
      </Card>
    </div>
  );
}






