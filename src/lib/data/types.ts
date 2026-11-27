import type { Business, ConsentRecord, BusinessAnalysis, DailyLead, MessageQueueItem, Conversation, Message, FollowUp, KnowledgeBaseEntry, SalesPipeline, Meeting, ActivityLog, WebhookEvent, AIUsageLog, Setting } from "@/types";

export interface DataStore {
  listBusinesses(filter?: any): Promise<Business[]>;
  getBusiness(id: string): Promise<Business | null>;
  createBusiness(data: any): Promise<Business>;
  updateBusiness(id: string, data: any): Promise<Business | null>;
  archiveBusiness(id: string): Promise<Business | null>;
  getConsent(business_id: string): Promise<ConsentRecord | null>;
  listConsent(): Promise<ConsentRecord[]>;
  upsertConsent(data: any): Promise<ConsentRecord>;
  revokeConsent(business_id: string): Promise<ConsentRecord | null>;
  listAnalyses(): Promise<BusinessAnalysis[]>;
  getAnalysis(business_id: string): Promise<BusinessAnalysis | null>;
  upsertAnalysis(data: any): Promise<BusinessAnalysis>;
  listDailyLeads(date?: string): Promise<DailyLead[]>;
  addDailyLead(business_id: string, reason?: string): Promise<DailyLead>;
  removeDailyLead(id: string): Promise<boolean>;
  listMessageQueue(status?: string): Promise<MessageQueueItem[]>;
  createMessageQueueItem(data: any): Promise<MessageQueueItem>;
  updateMessageQueueItem(id: string, data: any): Promise<MessageQueueItem | null>;
  listConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  getConversationByBusiness(business_id: string): Promise<Conversation | null>;
  createConversation(data: any): Promise<Conversation>;
  updateConversation(id: string, data: any): Promise<Conversation | null>;
  listMessages(conversation_id: string): Promise<Message[]>;
  createMessage(data: any): Promise<Message>;
  updateMessage(id: string, data: any): Promise<Message | null>;
  listFollowUps(status?: string): Promise<FollowUp[]>;
  createFollowUp(data: any): Promise<FollowUp>;
  updateFollowUp(id: string, data: any): Promise<FollowUp | null>;
  listKnowledgeBase(category?: string, activeOnly?: boolean): Promise<KnowledgeBaseEntry[]>;
  getKnowledgeBase(id: string): Promise<KnowledgeBaseEntry | null>;
  createKnowledgeBase(data: any): Promise<KnowledgeBaseEntry>;
  updateKnowledgeBase(id: string, data: any): Promise<KnowledgeBaseEntry | null>;
  archiveKnowledgeBase(id: string): Promise<KnowledgeBaseEntry | null>;
  searchKnowledgeBase(query: string): Promise<KnowledgeBaseEntry[]>;
  listPipelines(): Promise<SalesPipeline[]>;
  getPipeline(business_id: string): Promise<SalesPipeline | null>;
  updatePipeline(business_id: string, data: any): Promise<SalesPipeline | null>;
  listMeetings(): Promise<Meeting[]>;
  createMeeting(data: any): Promise<Meeting>;
  logActivity(action: string, entity_type: string, entity_id?: string, metadata?: any, user_id?: string): Promise<void>;
  listActivityLogs(limit?: number): Promise<ActivityLog[]>;
  findWebhookEvent(external_event_id: string): Promise<WebhookEvent | null>;
  createWebhookEvent(data: any): Promise<WebhookEvent>;
  updateWebhookEvent(id: string, data: any): Promise<WebhookEvent | null>;
  logAIUsage(data: any): Promise<void>;
  listAIUsage(): Promise<AIUsageLog[]>;
  getSetting(key: string): Promise<Setting | null>;
  listSettings(): Promise<Setting[]>;
  upsertSetting(key: string, value: unknown): Promise<Setting>;
}


