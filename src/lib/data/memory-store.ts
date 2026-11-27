import { randomUUID } from "crypto";
import type {
  Organization,
  Profile,
  OrganizationMember,
  Business,
  ConsentRecord,
  BusinessAnalysis,
  DailyLead,
  MessageQueueItem,
  Conversation,
  Message,
  FollowUp,
  KnowledgeBaseEntry,
  SalesPipeline,
  Meeting,
  ActivityLog,
  WebhookEvent,
  AIUsageLog,
  Setting,
  PipelineStatus,
  Role,
} from "@/types";

export const DEMO_ORG_ID = "org_demo_1";
export const DEMO_USER_ID = "user_demo_1";

class MemoryStore {
  organizations: Organization[] = [];
  profiles: Profile[] = [];
  members: OrganizationMember[] = [];
  businesses: Business[] = [];
  consent: ConsentRecord[] = [];
  analyses: BusinessAnalysis[] = [];
  dailyLeads: DailyLead[] = [];
  messageQueue: MessageQueueItem[] = [];
  conversations: Conversation[] = [];
  messages: Message[] = [];
  followUps: FollowUp[] = [];
  knowledgeBase: KnowledgeBaseEntry[] = [];
  pipelines: SalesPipeline[] = [];
  pipelineHistory: { id: string; organization_id: string; business_id: string; previous_stage?: string; new_stage: string; changed_by?: string; changed_at: string }[] = [];
  meetings: Meeting[] = [];
  activityLogs: ActivityLog[] = [];
  webhookEvents: WebhookEvent[] = [];
  aiUsage: AIUsageLog[] = [];
  settings: Setting[] = [];

  constructor() {
    this.seed();
  }

  private now() {
    return new Date().toISOString();
  }
  private id() {
    return randomUUID();
  }

  // ---- seed ----
  private seed() {
    const org: Organization = {
      id: DEMO_ORG_ID,
      name: "AKRADHI",
      timezone: "Asia/Kolkata",
      created_at: this.now(),
      updated_at: this.now(),
    };
    this.organizations.push(org);
    this.profiles.push({
      id: DEMO_USER_ID,
      full_name: "Demo Administrator",
      email: "admin@akradhi.local",
      created_at: this.now(),
      updated_at: this.now(),
    });
    this.members.push({
      id: this.id(),
      organization_id: DEMO_ORG_ID,
      user_id: DEMO_USER_ID,
      role: "owner",
      status: "active",
    });

    // knowledge base seed
    const kb: Partial<KnowledgeBaseEntry>[] = [
      { category: "agency_intro", title: "About AKRADHI", content: "AKRADHI is a website design and development agency offering custom-coded websites, WordPress, Shopify, e-commerce, redesign, responsive mobile-friendly sites, basic SEO, domain & hosting setup, enquiry forms, WhatsApp integrations, and maintenance." },
      { category: "services", title: "Custom Website Development", content: "We build custom-coded business and corporate websites tailored to client requirements." },
      { category: "services", title: "E-commerce Development", content: "E-commerce websites with product catalog, cart, checkout and payment gateway integration." },
      { category: "pricing", title: "Starter Package (demo)", content: "Base price: ₹15,000. Includes 5 pages, responsive design, basic SEO, contact form. Delivery: 2 weeks. Minimum approved price: ₹12,000. Approved discount limit: 20%." , structured_data: { package_name: "Starter", base_price: 15000, included_features: ["5 pages", "responsive", "basic SEO", "contact form"], excluded_features: ["e-commerce", "custom CMS"], additional_feature_charges: {}, min_approved_price: 12000, discount_limit_percent: 20, delivery_weeks: 2, active: true } },
      { category: "pricing", title: "Business Package (demo)", content: "Base price: ₹35,000. Includes 10 pages, CMS, blog, SEO, contact form. Delivery: 4 weeks. Minimum approved price: ₹28,000. Approved discount limit: 20%.", structured_data: { package_name: "Business", base_price: 35000, included_features: ["10 pages", "CMS", "blog", "SEO", "contact form"], excluded_features: ["e-commerce", "payments"], additional_feature_charges: {}, min_approved_price: 28000, discount_limit_percent: 20, delivery_weeks: 4, active: true } },
      { category: "faq", title: "Timelines", content: "Typical delivery: 2-6 weeks depending on scope." },
      { category: "communication_guidelines", title: "Tone", content: "Professional, concise, respectful. Never invent prices or links." },
    ];
    for (const k of kb) {
      this.knowledgeBase.push({
        id: this.id(),
        organization_id: DEMO_ORG_ID,
        category: k.category!,
        title: k.title!,
        content: k.content!,
        structured_data: k.structured_data,
        is_active: true,
        version: 1,
        created_by: DEMO_USER_ID,
        created_at: this.now(),
        updated_at: this.now(),
      });
    }

    // synthetic businesses
    const samples = [
      { name: "Sunrise Bakery", person: "Ravi Kumar", phone: "+919876543210", cat: "Bakery", city: "Bengaluru", state: "Karnataka", website: "" },
      { name: "GreenLeaf Organics", person: "Priya Sharma", phone: "+919123456789", cat: "Organic Store", city: "Mumbai", state: "Maharashtra", website: "https://greenleaf.example" },
      { name: "TechNova Solutions", person: "Amit Patel", phone: "+919988776655", cat: "IT Services", city: "Ahmedabad", state: "Gujarat", website: "https://technova.example" },
      { name: "Royal Fitness", person: "Neha Verma", phone: "+919876001122", cat: "Gym", city: "Delhi", state: "Delhi", website: "" },
      { name: "Spice Route Restaurant", person: "Karan Singh", phone: "+919012345678", cat: "Restaurant", city: "Jaipur", state: "Rajasthan", website: "https://spiceroute.example" },
    ];
    for (const s of samples) {
      const b: Business = {
        id: this.id(),
        organization_id: DEMO_ORG_ID,
        business_name: s.name,
        contact_person: s.person,
        phone_number: s.phone,
        normalized_phone_number: s.phone.replace(/\D/g, ""),
        email: `${s.name.toLowerCase().replace(/\s/g, "")}@example.com`,
        business_category: s.cat,
        city: s.city,
        state: s.state,
        country: "India",
        website_url: s.website,
        source: "synthetic",
        notes: "Synthetic demo record.",
        pipeline_status: "new_lead",
        lead_score: 50,
        created_at: this.now(),
        updated_at: this.now(),
      };
      this.businesses.push(b);
      this.consent.push({
        id: this.id(),
        organization_id: DEMO_ORG_ID,
        business_id: b.id,
        communication_channel: "whatsapp",
        consent_status: s.name === "Royal Fitness" ? "pending" : "granted",
        consent_source: "imported",
        consent_scope: "promotional",
        consent_timestamp: this.now(),
        created_at: this.now(),
      });
      this.pipelines.push({
        id: this.id(),
        organization_id: DEMO_ORG_ID,
        business_id: b.id,
        current_stage: "new_lead",
        estimated_value: 20000,
        created_at: this.now(),
        updated_at: this.now(),
      });
    }

    // settings
    const settings: [string, unknown][] = [
      ["agency_name", "AKRADHI"],
      ["timezone", "Asia/Kolkata"],
      ["ai_provider", "simulation"],
      ["ai_model", "gemini-2.0-flash"],
      ["communication_tone", "professional"],
      ["preferred_languages", ["en", "hi"]],
      ["confidence_threshold", 0.7],
      ["daily_ai_budget", 100],
      ["simulation_mode", true],
    ];
    for (const [k, v] of settings) {
      this.settings.push({ id: this.id(), organization_id: DEMO_ORG_ID, setting_key: k, setting_value: v, updated_at: this.now() });
    }
  }

  // ---- businesses ----
  listBusinesses(filter?: { q?: string; pipeline_status?: string; category?: string; assigned?: string; consent?: string }) {
    let out = [...this.businesses];
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      out = out.filter((b) => b.business_name.toLowerCase().includes(q) || (b.contact_person || "").toLowerCase().includes(q) || (b.phone_number || "").includes(q) || (b.business_category || "").toLowerCase().includes(q) || (b.city || "").toLowerCase().includes(q));
    }
    if (filter?.pipeline_status) out = out.filter((b) => b.pipeline_status === filter.pipeline_status);
    if (filter?.category) out = out.filter((b) => b.business_category === filter.category);
    if (filter?.assigned) out = out.filter((b) => b.assigned_to === filter.assigned);
    return out;
  }
  getBusiness(id: string) { return this.businesses.find((b) => b.id === id) || null; }
  createBusiness(data: Partial<Business>) {
    const b: Business = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      business_name: data.business_name || "Untitled",
      pipeline_status: data.pipeline_status || "new_lead",
      lead_score: data.lead_score ?? 0,
      created_at: this.now(),
      updated_at: this.now(),
      ...data,
    } as Business;
    if (!b.normalized_phone_number && b.phone_number) b.normalized_phone_number = b.phone_number.replace(/\D/g, "");
    this.businesses.push(b);
    this.pipelines.push({ id: this.id(), organization_id: b.organization_id, business_id: b.id, current_stage: b.pipeline_status, estimated_value: 0, created_at: this.now(), updated_at: this.now() });
    return b;
  }
  updateBusiness(id: string, data: Partial<Business>) {
    const idx = this.businesses.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.businesses[idx] = { ...this.businesses[idx], ...data, updated_at: this.now() };
    if (data.pipeline_status) {
      const p = this.pipelines.find((x) => x.business_id === id);
      if (p) { this.pipelineHistory.push({ id: this.id(), organization_id: p.organization_id, business_id: id, previous_stage: p.current_stage, new_stage: data.pipeline_status, changed_at: this.now() }); p.current_stage = data.pipeline_status; p.updated_at = this.now(); }
    }
    return this.businesses[idx];
  }
  archiveBusiness(id: string) { return this.updateBusiness(id, { pipeline_status: "archived" }); }

  // ---- consent ----
  getConsent(business_id: string) { return this.consent.find((c) => c.business_id === business_id) || null; }
  listConsent() { return [...this.consent]; }
  upsertConsent(data: Partial<ConsentRecord>) {
    const existing = data.business_id ? this.consent.find((c) => c.business_id === data.business_id) : null;
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    const c: ConsentRecord = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      business_id: data.business_id!,
      communication_channel: data.communication_channel || "whatsapp",
      consent_status: data.consent_status || "pending",
      created_at: this.now(),
      ...data,
    } as ConsentRecord;
    this.consent.push(c);
    return c;
  }
  revokeConsent(business_id: string) {
    const c = this.getConsent(business_id);
    if (c) { c.consent_status = "revoked"; c.revoked_at = this.now(); }
    return c;
  }

  // ---- analyses ----
  listAnalyses() { return [...this.analyses]; }
  getAnalysis(business_id: string) { return this.analyses.find((a) => a.business_id === business_id) || null; }
  upsertAnalysis(data: Partial<BusinessAnalysis>) {
    const existing = data.business_id ? this.analyses.find((a) => a.business_id === data.business_id) : null;
    if (existing) { Object.assign(existing, data); return existing; }
    const a: BusinessAnalysis = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      business_id: data.business_id!,
      analysis_status: data.analysis_status || "completed",
      findings: data.findings || [],
      evidence: data.evidence || {},
      suggested_services: data.suggested_services || [],
      confidence: data.confidence ?? 0.5,
      analyzed_at: this.now(),
      ...data,
    } as BusinessAnalysis;
    this.analyses.push(a);
    return a;
  }

  // ---- daily leads ----
  listDailyLeads(date?: string) {
    let out = [...this.dailyLeads];
    if (date) out = out.filter((d) => d.selection_date === date);
    return out;
  }
  addDailyLead(business_id: string, reason?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const exists = this.dailyLeads.find((d) => d.business_id === business_id && d.selection_date === today);
    if (exists) return exists;
    const dl: DailyLead = {
      id: this.id(),
      organization_id: DEMO_ORG_ID,
      business_id,
      selection_date: today,
      selection_reason: reason,
      status: "queued",
      created_at: this.now(),
    };
    this.dailyLeads.push(dl);
    return dl;
  }
  removeDailyLead(id: string) {
    const idx = this.dailyLeads.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.dailyLeads[idx].status = "removed";
    return true;
  }

  // ---- message queue ----
  listMessageQueue(status?: string) {
    let out = [...this.messageQueue];
    if (status) out = out.filter((m) => m.approval_status === status);
    return out;
  }
  createMessageQueueItem(data: Partial<MessageQueueItem>) {
    const m: MessageQueueItem = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      business_id: data.business_id!,
      message_type: data.message_type || "introduction",
      generated_content: data.generated_content || "",
      approval_status: "pending",
      created_at: this.now(),
      ...data,
    } as MessageQueueItem;
    this.messageQueue.push(m);
    return m;
  }
  updateMessageQueueItem(id: string, data: Partial<MessageQueueItem>) {
    const idx = this.messageQueue.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.messageQueue[idx] = { ...this.messageQueue[idx], ...data };
    if (data.approval_status === "approved") this.messageQueue[idx].approved_at = this.now();
    return this.messageQueue[idx];
  }

  // ---- conversations ----
  listConversations() { return [...this.conversations]; }
  getConversation(id: string) { return this.conversations.find((c) => c.id === id) || null; }
  getConversationByBusiness(business_id: string) { return this.conversations.find((c) => c.business_id === business_id) || null; }
  createConversation(data: Partial<Conversation>) {
    const c: Conversation = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      business_id: data.business_id!,
      provider: data.provider || "simulation",
      conversation_status: "open",
      ai_enabled: true,
      created_at: this.now(),
      ...data,
    } as Conversation;
    this.conversations.push(c);
    return c;
  }
  updateConversation(id: string, data: Partial<Conversation>) {
    const idx = this.conversations.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.conversations[idx] = { ...this.conversations[idx], ...data };
    return this.conversations[idx];
  }

  // ---- messages ----
  listMessages(conversation_id: string) { return this.messages.filter((m) => m.conversation_id === conversation_id).sort((a, b) => a.created_at.localeCompare(b.created_at)); }
  createMessage(data: Partial<Message>) {
    const m: Message = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      conversation_id: data.conversation_id!,
      business_id: data.business_id!,
      direction: data.direction || "outbound",
      sender_type: data.sender_type || "agent",
      message_type: data.message_type || "text",
      content: data.content || "",
      delivery_status: "pending",
      ai_generated: false,
      created_at: this.now(),
      ...data,
    } as Message;
    this.messages.push(m);
    const conv = this.getConversation(m.conversation_id);
    if (conv) { conv.last_message_at = this.now(); if (m.direction === "inbound") conv.last_customer_message_at = this.now(); }
    return m;
  }
  updateMessage(id: string, data: Partial<Message>) {
    const idx = this.messages.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.messages[idx] = { ...this.messages[idx], ...data };
    return this.messages[idx];
  }

  // ---- follow ups ----
  listFollowUps(status?: string) {
    let out = [...this.followUps];
    if (status) out = out.filter((f) => f.status === status);
    return out.sort((a, b) => a.due_at.localeCompare(b.due_at));
  }
  createFollowUp(data: Partial<FollowUp>) {
    const f: FollowUp = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      business_id: data.business_id!,
      due_at: data.due_at || new Date(Date.now() + 86400000).toISOString(),
      reason: data.reason || "Follow up",
      status: "pending",
      created_at: this.now(),
      ...data,
    } as FollowUp;
    this.followUps.push(f);
    return f;
  }
  updateFollowUp(id: string, data: Partial<FollowUp>) {
    const idx = this.followUps.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.followUps[idx] = { ...this.followUps[idx], ...data };
    if (data.status === "completed") this.followUps[idx].completed_at = this.now();
    return this.followUps[idx];
  }

  // ---- knowledge base ----
  listKnowledgeBase(category?: string, activeOnly = false) {
    let out = [...this.knowledgeBase];
    if (category) out = out.filter((k) => k.category === category);
    if (activeOnly) out = out.filter((k) => k.is_active);
    return out;
  }
  getKnowledgeBase(id: string) { return this.knowledgeBase.find((k) => k.id === id) || null; }
  createKnowledgeBase(data: Partial<KnowledgeBaseEntry>) {
    const k: KnowledgeBaseEntry = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      category: data.category || "faq",
      title: data.title || "Untitled",
      content: data.content || "",
      is_active: data.is_active ?? true,
      version: 1,
      created_at: this.now(),
      updated_at: this.now(),
      ...data,
    } as KnowledgeBaseEntry;
    this.knowledgeBase.push(k);
    return k;
  }
  updateKnowledgeBase(id: string, data: Partial<KnowledgeBaseEntry>) {
    const idx = this.knowledgeBase.findIndex((k) => k.id === id);
    if (idx === -1) return null;
    this.knowledgeBase[idx] = { ...this.knowledgeBase[idx], ...data, updated_at: this.now(), version: this.knowledgeBase[idx].version + 1 };
    return this.knowledgeBase[idx];
  }
  archiveKnowledgeBase(id: string) {
    const k = this.getKnowledgeBase(id);
    if (k) k.is_active = false;
    return k;
  }
  searchKnowledgeBase(query: string) {
    const q = query.toLowerCase();
    return this.knowledgeBase.filter((k) => k.is_active && (k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q) || k.category.toLowerCase().includes(q)));
  }

  // ---- pipeline ----
  listPipelines() { return [...this.pipelines]; }
  getPipeline(business_id: string) { return this.pipelines.find((p) => p.business_id === business_id) || null; }
  updatePipeline(business_id: string, data: Partial<SalesPipeline>) {
    const p = this.getPipeline(business_id);
    if (!p) return null;
    Object.assign(p, data, { updated_at: this.now() });
    if (data.current_stage) {
      this.pipelineHistory.push({ id: this.id(), organization_id: p.organization_id, business_id, previous_stage: p.current_stage, new_stage: data.current_stage, changed_at: this.now() });
    }
    return p;
  }

  // ---- meetings ----
  listMeetings() { return [...this.meetings]; }
  createMeeting(data: Partial<Meeting>) {
    const m: Meeting = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      business_id: data.business_id!,
      meeting_date: data.meeting_date || new Date().toISOString(),
      meeting_type: data.meeting_type || "consultation",
      status: "scheduled",
      ...data,
    } as Meeting;
    this.meetings.push(m);
    return m;
  }

  // ---- activity logs ----
  logActivity(action: string, entity_type: string, entity_id?: string, metadata?: Record<string, unknown>, user_id?: string) {
    const l: ActivityLog = {
      id: this.id(),
      organization_id: DEMO_ORG_ID,
      user_id: user_id || DEMO_USER_ID,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at: this.now(),
    };
    this.activityLogs.unshift(l);
    return l;
  }
  listActivityLogs(limit = 100) { return this.activityLogs.slice(0, limit); }

  // ---- webhook events ----
  findWebhookEvent(external_event_id: string) { return this.webhookEvents.find((e) => e.external_event_id === external_event_id) || null; }
  createWebhookEvent(data: Partial<WebhookEvent>) {
    const e: WebhookEvent = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      provider: data.provider || "official",
      external_event_id: data.external_event_id!,
      event_type: data.event_type || "message",
      processing_status: "received",
      received_at: this.now(),
      ...data,
    } as WebhookEvent;
    this.webhookEvents.push(e);
    return e;
  }
  updateWebhookEvent(id: string, data: Partial<WebhookEvent>) {
    const idx = this.webhookEvents.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.webhookEvents[idx] = { ...this.webhookEvents[idx], ...data };
    return this.webhookEvents[idx];
  }

  // ---- ai usage ----
  logAIUsage(data: Partial<AIUsageLog>) {
    const l: AIUsageLog = {
      id: this.id(),
      organization_id: data.organization_id || DEMO_ORG_ID,
      operation: data.operation || "unknown",
      model: data.model || "simulation",
      input_tokens: data.input_tokens || 0,
      output_tokens: data.output_tokens || 0,
      estimated_cost: data.estimated_cost || 0,
      status: data.status || "success",
      created_at: this.now(),
      ...data,
    } as AIUsageLog;
    this.aiUsage.unshift(l);
    return l;
  }
  listAIUsage() { return [...this.aiUsage]; }

  // ---- settings ----
  getSetting(key: string) { return this.settings.find((s) => s.setting_key === key) || null; }
  listSettings() { return [...this.settings]; }
  upsertSetting(key: string, value: unknown) {
    const existing = this.getSetting(key);
    if (existing) { existing.setting_value = value; existing.updated_at = this.now(); return existing; }
    const s: Setting = { id: this.id(), organization_id: DEMO_ORG_ID, setting_key: key, setting_value: value, updated_at: this.now() };
    this.settings.push(s);
    return s;
  }
}

// Singleton
let instance: MemoryStore | null = null;
export function getMemoryStore() {
  if (!instance) instance = new MemoryStore();
  return instance;
}
export const store = getMemoryStore();
