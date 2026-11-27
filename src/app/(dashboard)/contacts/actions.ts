"use server";
import { z } from "zod";
import { getServerStore as getStore } from "@/lib/data/server-store";
import { businessSchema, normalizeBusinessInput } from "@/lib/validation/schemas";
import { normalizePhone } from "@/lib/security/phone";
import { getCurrentUser } from "@/lib/auth/session";
import { requireMinRole } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

export async function createBusinessAction(formData: FormData) {
  const user = await requireMinRole("sales_rep");
  const raw = Object.fromEntries(formData.entries());
  const parsed = businessSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.message);
  const store = await getStore();
  const data = normalizeBusinessInput(parsed.data);
  const b = await store.createBusiness({ ...data, organization_id: user.organization_id } as unknown as Partial<import("@/types").Business>);
  // consent record
  const consentStatus = (raw.consent_status as string) || "pending";
  await store.upsertConsent({ organization_id: user.organization_id, business_id: b.id, communication_channel: "whatsapp", consent_status: consentStatus as "granted" | "pending" | "denied" | "revoked", consent_source: (raw.consent_source as string) || "manual", evidence_reference: (raw.consent_evidence as string) || undefined });
  await store.logActivity("create_business", "business", b.id, { name: b.business_name }, user.id);
  revalidatePath("/contacts");
  return b.id;
}

export async function updateBusinessAction(id: string, formData: FormData) {
  const user = await requireMinRole("sales_rep");
  const raw = Object.fromEntries(formData.entries());
  const parsed = businessSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.message);
  const store = await getStore();
  const data = normalizeBusinessInput(parsed.data);
  await store.updateBusiness(id, data as unknown as Partial<import("@/types").Business>);
  await store.logActivity("update_business", "business", id, {}, user.id);
  revalidatePath(`/contacts/${id}`);
  revalidatePath("/contacts");
}

export async function archiveBusinessAction(id: string) {
  const user = await requireMinRole("administrator");
  const store = await getStore();
  await store.archiveBusiness(id);
  await store.logActivity("archive_business", "business", id, {}, user.id);
  revalidatePath("/contacts");
}

export async function updateConsentAction(formData: FormData) {
  const user = await requireMinRole("sales_rep");
  const business_id = String(formData.get("business_id"));
  const consent_status = String(formData.get("consent_status")) as "granted" | "pending" | "denied" | "revoked";
  const store = await getStore();
  await store.upsertConsent({ organization_id: user.organization_id, business_id, communication_channel: "whatsapp", consent_status, consent_source: String(formData.get("consent_source") || "manual"), evidence_reference: String(formData.get("evidence_reference") || "") });
  await store.logActivity("update_consent", "consent", business_id, { consent_status }, user.id);
  revalidatePath(`/contacts/${business_id}`);
}

export async function revokeConsentAction(business_id: string) {
  const user = await requireMinRole("sales_rep");
  const store = await getStore();
  await store.revokeConsent(business_id);
  await store.logActivity("revoke_consent", "consent", business_id, {}, user.id);
  revalidatePath(`/contacts/${business_id}`);
}

// keep normalizePhone imported usage
void normalizePhone;
void z;






