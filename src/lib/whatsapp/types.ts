export interface WhatsAppMessagePayload {
  to: string;
  body: string;
  templateName?: string;
}

export interface SendResult {
  ok: boolean;
  providerMessageId?: string;
  status: string;
  error?: string;
  simulated: boolean;
}

export interface WhatsAppProvider {
  name: string;
  mode: "simulation" | "manual" | "official";
  isConfigured(): boolean;
  send(payload: WhatsAppMessagePayload): Promise<SendResult>;
  // manual mode helpers
  buildClickToChatLink(phone: string, text: string): string;
}
