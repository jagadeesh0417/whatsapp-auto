-- Seed data for development (run after migration and creating a user)
-- Insert organization
insert into organizations (id, name, timezone) values ('00000000-0000-0000-0000-000000000001', 'AKRADHI', 'Asia/Kolkata') on conflict do nothing;
