export interface AIContext {
  business?: Record<string, unknown>;
  analysis?: Record<string, unknown>;
  conversationSummary?: string;
  history?: { role: string; content: string }[];
  knowledge?: { title: string; content: string }[];
  pricing?: Record<string, unknown>[];
  pipelineStage?: string;
  eligibility?: string;
  language?: string;
}

export interface AIDraftResult {
  content: string;
  language: string;
  knowledge_refs: string[];
  model: string;
}

export interface AIReplyResult {
  detected_intent: string;
  suggested_reply: string;
  conversation_summary: string;
  customer_requirements: string[];
  suggested_pipeline_status: string;
  confidence: number;
  knowledge_refs: string[];
  escalation_required: boolean;
  escalation_reason?: string;
  suggested_next_action: string;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  generateDraft(messageType: string, context: AIContext): Promise<AIDraftResult>;
  generateReply(incomingMessage: string, context: AIContext): Promise<AIReplyResult>;
  analyzeBusiness(context: AIContext): Promise<Record<string, unknown>>;
}
