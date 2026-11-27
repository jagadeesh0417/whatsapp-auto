export type Role = "owner" | "administrator" | "sales_rep" | "viewer";

export interface Organization {
  id: string;
  name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: Role;
  status: "active" | "invited" | "disabled";
}

export type PipelineStatus =
  | "new_lead"
  | "consent_pending"
  | "eligible"
  | "message_prepared"
  | "awaiting_approval"
  | "contacted"
  | "replied"
  | "interested"
  | "follow_up_required"
  | "meeting_scheduled"
  | "proposal_sent"
  | "negotiation"
  | "converted"
  | "not_interested"
  | "opted_out"
  | "archived";

export interface Business {
  id: string;
  organization_id: string;
  business_name: string;
  contact_person?: string;
  phone_number?: string;
  normalized_phone_number?: string;
  email?: string;
  business_category?: string;
  city?: string;
  state?: string;
  country?: string;
  website_url?: string;
  source?: string;
  notes?: string;
  pipeline_status: PipelineStatus;
  lead_score: number;
  assigned_to?: string;
  last_contacted_at?: string;
  last_replied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  organization_id: string;
  business_id: string;
  communication_channel: "whatsapp" | "email" | "sms";
  consent_status: "granted" | "pending" | "denied" | "revoked";
  consent_source?: string;
  consent_scope?: string;
  consent_timestamp?: string;
  evidence_reference?: string;
  revoked_at?: string;
  created_at: string;
}

export interface BusinessAnalysis {
  id: string;
  organization_id: string;
  business_id: string;
  analysis_status: "pending" | "completed" | "failed";
  website_status?: "reachable" | "unreachable" | "not_provided" | "unknown";
  findings: string[];
  evidence: Record<string, unknown>;
  suggested_services: string[];
  confidence: number;
  analyzed_at?: string;
}

export interface DailyLead {
  id: string;
  organization_id: string;
  business_id: string;
  selection_date: string;
  selection_reason?: string;
  status: "queued" | "reviewed" | "removed" | "contacted";
  created_at: string;
}

export interface MessageQueueItem {
  id: string;
  organization_id: string;
  business_id: string;
  conversation_id?: string;
  message_type: string;
  generated_content: string;
  edited_content?: string;
  approval_status: "pending" | "approved" | "rejected" | "sent";
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  scheduled_at?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  organization_id: string;
  business_id: string;
  provider: "simulation" | "manual" | "official";
  external_conversation_id?: string;
  conversation_status: "open" | "closed" | "paused";
  ai_enabled: boolean;
  assigned_to?: string;
  last_message_at?: string;
  last_customer_message_at?: string;
  created_at: string;
}

export interface Message {
  id: string;
  organization_id: string;
  conversation_id: string;
  business_id: string;
  direction: "inbound" | "outbound";
  sender_type: "customer" | "agent" | "ai" | "system";
  message_type: string;
  content: string;
  provider_message_id?: string;
  delivery_status: "pending" | "sent" | "delivered" | "read" | "failed";
  ai_generated: boolean;
  approved_by?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  organization_id: string;
  business_id: string;
  conversation_id?: string;
  due_at: string;
  reason: string;
  suggested_message?: string;
  status: "pending" | "completed" | "cancelled" | "rescheduled";
  assigned_to?: string;
  completed_at?: string;
  created_at: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  organization_id: string;
  category: string;
  title: string;
  content: string;
  structured_data?: Record<string, unknown>;
  is_active: boolean;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesPipeline {
  id: string;
  organization_id: string;
  business_id: string;
  current_stage: PipelineStatus;
  estimated_value?: number;
  actual_value?: number;
  assigned_to?: string;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  organization_id: string;
  business_id: string;
  meeting_date: string;
  meeting_type: string;
  meeting_link?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  organization_id: string;
  provider: string;
  external_event_id: string;
  event_type: string;
  processing_status: "received" | "processed" | "failed" | "duplicate";
  received_at: string;
  processed_at?: string;
}

export interface AIUsageLog {
  id: string;
  organization_id: string;
  operation: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  status: "success" | "failed";
  created_at: string;
}

export interface Setting {
  id: string;
  organization_id: string;
  setting_key: string;
  setting_value: unknown;
  updated_at: string;
}
