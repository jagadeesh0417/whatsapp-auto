# Architecture

AKRADHI is a Next.js 16 App Router full-stack application.

- Frontend: React Server/Client Components, Tailwind, shadcn/ui.
- Backend: Next.js Route Handlers + Server Actions.
- Data: Supabase PostgreSQL (or in-memory store in demo mode).
- AI: Provider abstraction (Gemini / simulation).
- WhatsApp: Provider abstraction (simulation / manual / official).

Flow: UI -> Server Actions/Route Handlers -> Services -> Store (Supabase or memory).

AI workflow: context retrieval -> provider -> Zod validation -> policy checks -> queue/approval.

See AGENTS.md for conventions.
