import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/config/env";
import type { AIProvider, AIContext, AIDraftResult, AIReplyResult } from "./types";

export class GeminiAIProvider implements AIProvider {
  name = "gemini";
  private client: GoogleGenAI | null = null;
  isConfigured() { return Boolean(env.GEMINI_API_KEY); }
  private getClient() {
    if (!this.client) {
      if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
    return this.client;
  }
  private model() { return env.GEMINI_MODEL; }

  private async call(prompt: string): Promise<string> {
    const client = this.getClient();
    const res = await client.models.generateContent({ model: this.model(), contents: prompt });
    return (res as { text?: string }).text || "";
  }

  async generateDraft(messageType: string, context: AIContext): Promise<AIDraftResult> {
    const kb = (context.knowledge || []).map((k) => `- ${k.title}: ${k.content}`).join("\n");
    const prompt = `You are an assistant for AKRADHI, a website development agency. Draft a concise WhatsApp message (max 300 chars) for message type: ${messageType}. Business: ${JSON.stringify(context.business || {})}. Knowledge:\n${kb}\nLanguage: ${context.language || "en"}. Return only the message text, no quotes.`;
    const content = await this.call(prompt);
    return { content: content.trim(), language: context.language || "en", knowledge_refs: (context.knowledge || []).map((k) => k.title), model: this.model() };
  }

  async generateReply(incomingMessage: string, context: AIContext): Promise<AIReplyResult> {
    const kb = (context.knowledge || []).map((k) => `- ${k.title}: ${k.content}`).join("\n");
    const prompt = `You are AKRADHI sales assistant. Incoming customer message: "${incomingMessage}". Context business: ${JSON.stringify(context.business || {})}. Pipeline: ${context.pipelineStage}. Knowledge:\n${kb}\nReturn strict JSON with keys: detected_intent (string), suggested_reply (string, max 400 chars), conversation_summary (string), customer_requirements (string array), suggested_pipeline_status (string), confidence (number 0-1), knowledge_refs (string array), escalation_required (boolean), escalation_reason (string or null), suggested_next_action (string).`;
    const text = await this.call(prompt);
    let parsed: Partial<AIReplyResult> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      parsed = {};
    }
    return {
      detected_intent: parsed.detected_intent || "general_enquiry",
      suggested_reply: parsed.suggested_reply || "Thanks for your message. We'll get back shortly.",
      conversation_summary: parsed.conversation_summary || incomingMessage.slice(0, 120),
      customer_requirements: parsed.customer_requirements || [],
      suggested_pipeline_status: parsed.suggested_pipeline_status || context.pipelineStage || "replied",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      knowledge_refs: parsed.knowledge_refs || [],
      escalation_required: Boolean(parsed.escalation_required),
      escalation_reason: parsed.escalation_reason || undefined,
      suggested_next_action: parsed.suggested_next_action || "Review",
    };
  }

  async analyzeBusiness(context: AIContext): Promise<Record<string, unknown>> {
    const prompt = `Analyze business for website development opportunity. Business: ${JSON.stringify(context.business || {})}. Return strict JSON with keys: business_summary, industry, verified_findings (array), evidence (object), suggested_services (array), potential_requirements (array), confidence (number), recommended_next_action, ai_suggestions (array), unverified_assumptions (array). Do not claim website inspection if URL not provided.`;
    const text = await this.call(prompt);
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return { business_summary: "", industry: "unknown", verified_findings: [], evidence: {}, suggested_services: [], potential_requirements: [], confidence: 0.3, recommended_next_action: "Review", ai_suggestions: [], unverified_assumptions: ["Parse failed"] };
    }
  }
}


