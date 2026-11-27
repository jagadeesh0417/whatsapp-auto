import type { AIProvider, AIContext, AIDraftResult, AIReplyResult } from "./types";

const DRAFTS: Record<string, string> = {
  introduction: "Hello! I'm reaching out from AKRADHI. We help businesses build professional, mobile-friendly websites. I noticed you may benefit from an online presence. Would you be open to a quick chat?",
  "service information": "Thanks for your interest! AKRADHI offers custom website development, WordPress, Shopify, e-commerce, redesigns, basic SEO, hosting & domain setup. Happy to share details tailored to your needs.",
  "consultation request": "We'd love to schedule a short consultation to understand your requirements and suggest the best approach. What day/time works for you?",
  "follow-up": "Just following up on our earlier conversation. Let me know if you have any questions or would like to proceed.",
  "meeting confirmation": "Confirming our meeting. Looking forward to discussing your website project.",
};

export class SimulationAIProvider implements AIProvider {
  name = "simulation";
  isConfigured() { return true; }
  async generateDraft(messageType: string, context: AIContext): Promise<AIDraftResult> {
    const base = DRAFTS[messageType.toLowerCase()] || `Hello from AKRADHI. Regarding ${messageType}, we'd be happy to help. (Simulation mode draft)`;
    const biz = (context.business?.business_name as string) || "your business";
    const content = base.replace("your business", biz);
    return { content, language: context.language || "en", knowledge_refs: ["agency_intro"], model: "simulation" };
  }
  async generateReply(incomingMessage: string, context: AIContext): Promise<AIReplyResult> {
    const lower = incomingMessage.toLowerCase();
    let intent = "general_enquiry";
    if (lower.includes("price") || lower.includes("cost") || lower.includes("quote")) intent = "pricing_question";
    if (lower.includes("ecommerce") || lower.includes("e-commerce") || lower.includes("online store")) intent = "ecommerce_enquiry";
    if (lower.includes("wordpress")) intent = "wordpress_enquiry";
    if (lower.includes("shopify")) intent = "shopify_enquiry";
    if (lower.includes("no") || lower.includes("not interested")) intent = "decline";
    if (lower.includes("stop") || lower.includes("unsubscribe") || lower.includes("opt out")) intent = "opt_out";
    const escalation = intent === "opt_out" || intent === "decline" || lower.includes("discount");
    return {
      detected_intent: intent,
      suggested_reply: `Thanks for your message! (Simulation) We'll get back to you shortly with details. Could you share a bit more about your requirements?`,
      conversation_summary: `Customer asked: ${incomingMessage.slice(0, 120)}`,
      customer_requirements: [],
      suggested_pipeline_status: intent === "opt_out" ? "opted_out" : intent === "decline" ? "not_interested" : "replied",
      confidence: 0.6,
      knowledge_refs: ["services"],
      escalation_required: escalation,
      escalation_reason: escalation ? "Requires human review" : undefined,
      suggested_next_action: escalation ? "Human takeover" : "Send suggested reply",
    };
  }
  async analyzeBusiness(context: AIContext): Promise<Record<string, unknown>> {
    const website = context.business?.website_url as string;
    const findings = website ? ["Website provided; manual review recommended"] : ["No website URL provided (unverified)"];
    return {
      business_summary: `${context.business?.business_name || "Business"} in ${context.business?.business_category || "unknown industry"}`,
      industry: context.business?.business_category || "unknown",
      verified_findings: [],
      evidence: {},
      suggested_services: ["Custom website development", "Basic SEO"],
      potential_requirements: [],
      confidence: 0.4,
      recommended_next_action: "Review and contact",
      ai_suggestions: findings,
      unverified_assumptions: ["Website status not verified by inspection"],
    };
  }
}
