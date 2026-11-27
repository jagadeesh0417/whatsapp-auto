import type { WhatsAppProvider, WhatsAppMessagePayload, SendResult } from "./types";

export class SimulationWhatsAppProvider implements WhatsAppProvider {
  name = "simulation";
  mode = "simulation" as const;
  isConfigured() { return true; }
  async send(payload: WhatsAppMessagePayload): Promise<SendResult> {
    return { ok: true, providerMessageId: `sim_${Date.now()}`, status: "delivered", simulated: true };
  }
  buildClickToChatLink(phone: string, text: string) {
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }
}


