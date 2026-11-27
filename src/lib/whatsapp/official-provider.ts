import type { WhatsAppProvider, WhatsAppMessagePayload, SendResult } from "./types";
import { env } from "@/lib/config/env";

export class OfficialWhatsAppProvider implements WhatsAppProvider {
  name = "official";
  mode = "official" as const;
  isConfigured() {
    return Boolean(env.WHATSAPP_API_ENABLED && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }
  async send(_payload: WhatsAppMessagePayload): Promise<SendResult> {
    if (!this.isConfigured()) {
      return { ok: false, status: "not_configured", error: "Official WhatsApp API not configured or disabled", simulated: false };
    }
    // Production implementation would call Meta Graph API here.
    // Disabled by default; never send during development.
    return { ok: false, status: "disabled", error: "Live sending disabled in development", simulated: false };
  }
  buildClickToChatLink(phone: string, text: string) {
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }
}
