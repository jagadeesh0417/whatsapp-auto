import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { normalizePhone } from "@/lib/security/phone";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { rows?: Record<string, string>[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const rows = body.rows || [];
  const store = getStore();
  const errors: string[] = [];
  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const name = (r.business_name || "").trim();
    if (!name) { errors.push(`Row ${i + 2}: missing business name`); continue; }
    const phone = r.phone_number ? normalizePhone(r.phone_number) : "";
    // dedup
    if (phone) {
      const existing = store.listBusinesses().find((b) => b.normalized_phone_number === phone.replace(/\D/g, ""));
      if (existing) { errors.push(`Row ${i + 2}: duplicate phone ${phone}`); continue; }
    }
    const b = store.createBusiness({
      organization_id: user.organization_id,
      business_name: name,
      contact_person: r.contact_person || undefined,
      phone_number: phone || undefined,
      normalized_phone_number: phone ? phone.replace(/\D/g, "") : undefined,
      email: r.email || undefined,
      business_category: r.business_category || undefined,
      city: r.city || undefined,
      state: r.state || undefined,
      website_url: r.website_url || undefined,
      notes: r.notes || undefined,
      source: "import",
    });
    store.upsertConsent({
      organization_id: user.organization_id,
      business_id: b.id,
      communication_channel: "whatsapp",
      consent_status: (r.consent_status as "granted" | "pending" | "denied" | "revoked") || "pending",
      consent_source: r.consent_source || "imported",
      evidence_reference: r.consent_evidence || undefined,
    });
    imported++;
  }
  store.logActivity("import_contacts", "business", undefined, { imported, errors: errors.length }, user.id);
  return NextResponse.json({ imported, errors });
}
