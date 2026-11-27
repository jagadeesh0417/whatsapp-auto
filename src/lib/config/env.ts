import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(["gemini", "simulation", "local"]).default("simulation"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  WHATSAPP_PROVIDER: z.enum(["simulation", "manual", "official"]).default("simulation"),
  WHATSAPP_API_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  APP_TIMEZONE: z.string().default("Asia/Kolkata"),
  ENABLE_SIMULATION_MODE: z
    .string()
    .optional()
    .transform((v) => v !== "false"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const raw = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER,
    WHATSAPP_API_ENABLED: process.env.WHATSAPP_API_ENABLED,
    APP_TIMEZONE: process.env.APP_TIMEZONE,
    ENABLE_SIMULATION_MODE: process.env.ENABLE_SIMULATION_MODE,
  };
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
     
    console.error("Invalid environment variables", parsed.error.flatten());
    // Fall back to defaults rather than crashing
    return envSchema.parse({});
  }
  return parsed.data;
}

export const env = loadEnv();

export const isSupabaseConfigured = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export const isGeminiConfigured = Boolean(env.GEMINI_API_KEY);

export const isSimulationMode = env.ENABLE_SIMULATION_MODE || !isSupabaseConfigured;


