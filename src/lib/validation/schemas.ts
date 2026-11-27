import { z } from "zod";
import { normalizePhone } from "@/lib/security/phone";

export const businessSchema = z.object({
  business_name: z.string().min(1).max(200),
  contact_person: z.string().max(200).optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  business_category: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  source: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  pipeline_status: z.string().optional(),
});

export const consentSchema = z.object({
  business_id: z.string().min(1),
  consent_status: z.enum(["granted", "pending", "denied", "revoked"]),
  consent_source: z.string().optional(),
  consent_scope: z.string().optional(),
  evidence_reference: z.string().optional(),
});

export const knowledgeSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  is_active: z.boolean().optional(),
  structured_data: z.record(z.string(), z.unknown()).optional(),
});

export const messageDraftSchema = z.object({
  business_id: z.string().min(1),
  message_type: z.string().min(1),
  generated_content: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const followUpSchema = z.object({
  business_id: z.string().min(1),
  due_at: z.string().min(1),
  reason: z.string().min(1),
  suggested_message: z.string().optional(),
});

export const normalizeBusinessInput = (data: z.infer<typeof businessSchema>) => ({
  ...data,
  normalized_phone_number: data.phone_number ? normalizePhone(data.phone_number).replace(/\D/g, "") : undefined,
});
