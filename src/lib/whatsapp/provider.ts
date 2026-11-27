import { env } from "@/lib/config/env";
import { SimulationWhatsAppProvider } from "./simulation-provider";
import { ManualWhatsAppProvider } from "./manual-provider";
import { OfficialWhatsAppProvider } from "./official-provider";
import type { WhatsAppProvider } from "./types";

export function getWhatsAppProvider(): WhatsAppProvider {
  const p = env.WHATSAPP_PROVIDER;
  if (p === "official") {
    const o = new OfficialWhatsAppProvider();
    if (o.isConfigured()) return o;
  }
  if (p === "manual") return new ManualWhatsAppProvider();
  return new SimulationWhatsAppProvider();
}
