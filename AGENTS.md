# AKRADHI CRM

## Architecture
Next.js 16 App Router + TypeScript + Tailwind + shadcn/ui. Supabase (optional) or in-memory store. AI provider abstraction. WhatsApp provider abstraction.

## Conventions
- Strict TypeScript.
- Zod validation at boundaries.
- Server actions for mutations; route handlers for API.
- Use `getStore()` for data access.
- Demo mode works without credentials.

## Security
- Never expose service role key to browser.
- RLS in migrations.
- No unofficial WhatsApp automation.
- Live messaging disabled by default.

## Commands
- dev: `npm run dev`
- build: `npm run build`
- test: `npm test`
- lint: `npm run lint`
