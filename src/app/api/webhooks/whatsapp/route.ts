import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerStore } from "@/lib/data/server-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "";
  if (mode === "subscribe" && token && token === verifyToken) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";
  const appSecret = process.env.WHATSAPP_APP_SECRET || "";
  if (appSecret) {
    const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(raw).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { createServiceRoleClient } = await import("@/lib/supabase/server");
  const serviceClient = await createServiceRoleClient();
  const store = serviceClient
    ? new (await import("@/lib/data/supabase-store")).SupabaseStore(async () => serviceClient)
    : await getServerStore();
  const entries = body?.entry || [];
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      // incoming messages
      for (const msg of value.messages || []) {
        const externalId = msg.id;
        const existing = await store.findWebhookEvent(externalId);
        if (existing) {
          await store.updateWebhookEvent(existing.id, { processing_status: "duplicate", processed_at: new Date().toISOString() });
          continue;
        }
        const event = await store.createWebhookEvent({ provider: "official", external_event_id: externalId, event_type: "message", processing_status: "received" });
        try {
          const from = msg.from;
          const text = msg.text?.body || "";
          // find business by phone
          const businesses = await store.listBusinesses();
          const biz = businesses.find((b: any) => (b.normalized_phone_number || "") === String(from).replace(/\D/g, ""));
          if (biz) {
            let conv = await store.getConversationByBusiness(biz.id);
            if (!conv) conv = await store.createConversation({ organization_id: biz.organization_id, business_id: biz.id, provider: "official", external_conversation_id: externalId });
            await store.createMessage({ organization_id: biz.organization_id, conversation_id: conv.id, business_id: biz.id, direction: "inbound", sender_type: "customer", message_type: msg.type || "text", content: text, provider_message_id: externalId, delivery_status: "delivered" });
          }
          await store.updateWebhookEvent(event.id, { processing_status: "processed", processed_at: new Date().toISOString() });
        } catch (e) {
          await store.updateWebhookEvent(event.id, { processing_status: "failed", processed_at: new Date().toISOString() });
        }
      }
      // delivery statuses
      for (const status of value.statuses || []) {
        const externalId = status.id;
        const existing = await store.findWebhookEvent(externalId + "_status");
        if (!existing) {
          const ev = await store.createWebhookEvent({ provider: "official", external_event_id: externalId + "_status", event_type: "status", processing_status: "received" });
          // update message delivery status if exists
          const msgs = await store.listMessages ? [] : [];
          await store.updateWebhookEvent(ev.id, { processing_status: "processed", processed_at: new Date().toISOString() });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
