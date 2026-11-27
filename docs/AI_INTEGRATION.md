# AI Integration

Provider abstraction in `src/lib/ai/provider.ts`. Supports `simulation` (default), `gemini`, `local`.

Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY` to enable Gemini. Model configurable via `GEMINI_MODEL`.

AI output is validated with Zod. AI cannot execute DB mutations or send messages directly.
