import type { WhatsAppProvider, WhatsAppMessagePayload, SendResult } from "./types";

export class ManualWhatsAppProvider implements WhatsAppProvider {
  name = "manual";
  mode = "manual" as const;
  isConfigured() { return true; }
  async send(): Promise<SendResult> {
    // Manual mode never sends automatically; CRM records confirmation separately.
    return { ok: false, status: "manual_confirmation_required", error: "Manual send requires human confirmation", simulated: false };
  }
  buildClickToChatLink(phone: string, text: string) {
    const n = phone.replace(/\D/g, "");
    return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  }
}


