import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Business, ConsentRecord, BusinessAnalysis, DailyLead, MessageQueueItem, Conversation, Message, FollowUp, KnowledgeBaseEntry, SalesPipeline, Meeting, ActivityLog, WebhookEvent, AIUsageLog, Setting } from "@/types";

import type { DataStore } from "./types";

export class SupabaseStore implements DataStore {
  private clientSupplier: () => Promise<any>;
  constructor(clientSupplier?: () => Promise<any>) {
    this.clientSupplier = clientSupplier || (async () => createServerSupabaseClient());
  }
  private async sb() { return this.clientSupplier(); }
  async listBusinesses(filter?: { q?: string; pipeline_status?: string; category?: string }) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    let q = client.from("businesses").select("*").order("created_at", { ascending: false });
    if (filter?.pipeline_status) q = q.eq("pipeline_status", filter.pipeline_status);
    if (filter?.category) q = q.eq("business_category", filter.category);
    const { data, error } = await q;
    if (error) throw error;
    let out = (data || []) as Business[];
    if (filter?.q) {
      const qq = filter.q.toLowerCase();
      out = out.filter((b) => b.business_name.toLowerCase().includes(qq) || (b.contact_person || "").toLowerCase().includes(qq) || (b.phone_number || "").includes(qq));
    }
    return out;
  }
  async getBusiness(id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("businesses").select("*").eq("id", id).single();
    return (data as Business) || null;
  }
  async createBusiness(data: Partial<Business>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("businesses").insert(data).select().single();
    if (error) throw error;
    // ensure pipeline row
    await client.from("sales_pipeline").insert({ organization_id: data.organization_id, business_id: row.id, current_stage: data.pipeline_status || "new_lead" });
    return row as Business;
  }
  async updateBusiness(id: string, data: Partial<Business>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("businesses").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    if (data.pipeline_status) {
      await client.from("pipeline_history").insert({ organization_id: (row as Business).organization_id, business_id: id, new_stage: data.pipeline_status });
      await client.from("sales_pipeline").update({ current_stage: data.pipeline_status, updated_at: new Date().toISOString() }).eq("business_id", id);
    }
    return row as Business;
  }
  async archiveBusiness(id: string) { return this.updateBusiness(id, { pipeline_status: "archived" }); }

  async getConsent(business_id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("consent_records").select("*").eq("business_id", business_id).maybeSingle();
    return (data as ConsentRecord) || null;
  }
  async listConsent() {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("consent_records").select("*");
    return (data || []) as ConsentRecord[];
  }
  async upsertConsent(data: Partial<ConsentRecord>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const existing = await this.getConsent(data.business_id!);
    if (existing) {
      const { data: row } = await client.from("consent_records").update(data).eq("id", existing.id).select().single();
      return row as ConsentRecord;
    }
    const { data: row, error } = await client.from("consent_records").insert(data).select().single();
    if (error) throw error;
    return row as ConsentRecord;
  }
  async revokeConsent(business_id: string) {
    const c = await this.getConsent(business_id);
    if (!c) return null;
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("consent_records").update({ consent_status: "revoked", revoked_at: new Date().toISOString() }).eq("id", c.id).select().single();
    return data as ConsentRecord;
  }

  async listAnalyses() {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("business_analyses").select("*");
    return (data || []) as BusinessAnalysis[];
  }
  async getAnalysis(business_id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("business_analyses").select("*").eq("business_id", business_id).maybeSingle();
    return (data as BusinessAnalysis) || null;
  }
  async upsertAnalysis(data: Partial<BusinessAnalysis>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const existing = await this.getAnalysis(data.business_id!);
    if (existing) {
      const { data: row } = await client.from("business_analyses").update(data).eq("id", existing.id).select().single();
      return row as BusinessAnalysis;
    }
    const { data: row, error } = await client.from("business_analyses").insert(data).select().single();
    if (error) throw error;
    return row as BusinessAnalysis;
  }

  async listDailyLeads(date?: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    let q = client.from("daily_leads").select("*");
    if (date) q = q.eq("selection_date", date);
    const { data } = await q;
    return (data || []) as DailyLead[];
  }
  async addDailyLead(business_id: string, selection_reason?: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const today = new Date().toISOString().slice(0, 10);
    const { data: row, error } = await client.from("daily_leads").insert({ business_id, selection_date: today, selection_reason, status: "queued" }).select().single();
    if (error) throw error;
    return row as DailyLead;
  }
  async removeDailyLead(id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    await client.from("daily_leads").update({ status: "removed" }).eq("id", id);
    return true;
  }

  async listMessageQueue(status?: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    let q = client.from("message_queue").select("*").order("created_at", { ascending: false });
    if (status) q = q.eq("approval_status", status);
    const { data } = await q;
    return (data || []) as MessageQueueItem[];
  }
  async createMessageQueueItem(data: Partial<MessageQueueItem>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("message_queue").insert(data).select().single();
    if (error) throw error;
    return row as MessageQueueItem;
  }
  async updateMessageQueueItem(id: string, data: Partial<MessageQueueItem>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row } = await client.from("message_queue").update(data).eq("id", id).select().single();
    return row as MessageQueueItem;
  }

  async listConversations() {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("conversations").select("*").order("created_at", { ascending: false });
    return (data || []) as Conversation[];
  }
  async getConversation(id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("conversations").select("*").eq("id", id).single();
    return (data as Conversation) || null;
  }
  async getConversationByBusiness(business_id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("conversations").select("*").eq("business_id", business_id).maybeSingle();
    return (data as Conversation) || null;
  }
  async createConversation(data: Partial<Conversation>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("conversations").insert(data).select().single();
    if (error) throw error;
    return row as Conversation;
  }
  async updateConversation(id: string, data: Partial<Conversation>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row } = await client.from("conversations").update(data).eq("id", id).select().single();
    return row as Conversation;
  }

  async listMessages(conversation_id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("messages").select("*").eq("conversation_id", conversation_id).order("created_at", { ascending: true });
    return (data || []) as Message[];
  }
  async createMessage(data: Partial<Message>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("messages").insert(data).select().single();
    if (error) throw error;
    return row as Message;
  }
  async updateMessage(id: string, data: Partial<Message>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row } = await client.from("messages").update(data).eq("id", id).select().single();
    return row as Message;
  }

  async listFollowUps(status?: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    let q = client.from("follow_ups").select("*").order("due_at", { ascending: true });
    if (status) q = q.eq("status", status);
    const { data } = await q;
    return (data || []) as FollowUp[];
  }
  async createFollowUp(data: Partial<FollowUp>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("follow_ups").insert(data).select().single();
    if (error) throw error;
    return row as FollowUp;
  }
  async updateFollowUp(id: string, data: Partial<FollowUp>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row } = await client.from("follow_ups").update(data).eq("id", id).select().single();
    return row as FollowUp;
  }

  async listKnowledgeBase(category?: string, activeOnly = false) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    let q = client.from("knowledge_base").select("*");
    if (category) q = q.eq("category", category);
    if (activeOnly) q = q.eq("is_active", true);
    const { data } = await q;
    return (data || []) as KnowledgeBaseEntry[];
  }
  async getKnowledgeBase(id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("knowledge_base").select("*").eq("id", id).single();
    return (data as KnowledgeBaseEntry) || null;
  }
  async createKnowledgeBase(data: Partial<KnowledgeBaseEntry>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("knowledge_base").insert(data).select().single();
    if (error) throw error;
    return row as KnowledgeBaseEntry;
  }
  async updateKnowledgeBase(id: string, data: Partial<KnowledgeBaseEntry>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row } = await client.from("knowledge_base").update({ ...data, updated_at: new Date().toISOString(), version: undefined }).eq("id", id).select().single();
    return row as KnowledgeBaseEntry;
  }
  async archiveKnowledgeBase(id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("knowledge_base").update({ is_active: false }).eq("id", id).select().single();
    return data as KnowledgeBaseEntry;
  }
  async searchKnowledgeBase(query: string) {
    const all = await this.listKnowledgeBase(undefined, true);
    const q = query.toLowerCase();
    return all.filter((k) => k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q));
  }

  async listPipelines() {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("sales_pipeline").select("*");
    return (data || []) as SalesPipeline[];
  }
  async getPipeline(business_id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("sales_pipeline").select("*").eq("business_id", business_id).maybeSingle();
    return (data as SalesPipeline) || null;
  }
  async updatePipeline(business_id: string, data: Partial<SalesPipeline>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row } = await client.from("sales_pipeline").update({ ...data, updated_at: new Date().toISOString() }).eq("business_id", business_id).select().single();
    return row as SalesPipeline;
  }

  async listMeetings() {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("meetings").select("*").order("meeting_date", { ascending: true });
    return (data || []) as Meeting[];
  }
  async createMeeting(data: Partial<Meeting>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("meetings").insert(data).select().single();
    if (error) throw error;
    return row as Meeting;
  }

  async logActivity(action: string, entity_type: string, entity_id?: string, metadata?: Record<string, unknown>, user_id?: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    await client.from("activity_logs").insert({ action, entity_type, entity_id, metadata, user_id });
  }
  async listActivityLogs(limit = 100) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(limit);
    return (data || []) as ActivityLog[];
  }

  async findWebhookEvent(external_event_id: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("webhook_events").select("*").eq("external_event_id", external_event_id).maybeSingle();
    return (data as WebhookEvent) || null;
  }
  async createWebhookEvent(data: Partial<WebhookEvent>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row, error } = await client.from("webhook_events").insert(data).select().single();
    if (error) throw error;
    return row as WebhookEvent;
  }
  async updateWebhookEvent(id: string, data: Partial<WebhookEvent>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data: row } = await client.from("webhook_events").update(data).eq("id", id).select().single();
    return row as WebhookEvent;
  }

  async logAIUsage(data: Partial<AIUsageLog>) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    await client.from("ai_usage_logs").insert(data);
  }
  async listAIUsage() {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("ai_usage_logs").select("*").order("created_at", { ascending: false });
    return (data || []) as AIUsageLog[];
  }

  async getSetting(key: string) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("settings").select("*").eq("setting_key", key).maybeSingle();
    return (data as Setting) || null;
  }
  async listSettings() {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const { data } = await client.from("settings").select("*");
    return (data || []) as Setting[];
  }
  async upsertSetting(key: string, value: unknown) {
    const client = await this.sb(); if (!client) throw new Error("Supabase not configured");
    const existing = await this.getSetting(key);
    if (existing) {
      const { data } = await client.from("settings").update({ setting_value: value, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single();
      return data as Setting;
    }
    const { data } = await client.from("settings").insert({ setting_key: key, setting_value: value }).select().single();
    return data as Setting;
  }

  // memory-store compatibility aliases
  get messages() { return [] as Message[]; }
}



