# Database

Migrations are in `supabase/migrations/`. Apply via Supabase SQL editor or CLI.

Tables: organizations, profiles, organization_members, businesses, consent_records, business_analyses, daily_leads, conversations, messages, message_queue, follow_ups, knowledge_base, sales_pipeline, pipeline_history, meetings, activity_logs, webhook_events, ai_usage_logs, settings.

RLS enabled on all tables with organization isolation via `user_org_ids()`.
