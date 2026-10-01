-- The trusted server role (the secret key) gets every table, as Supabase grants by default.
-- With "Automatically expose new tables" off it otherwise has none. It bypasses RLS, so it
-- is for server-side tooling only (tests, maintenance); the key never reaches the browser.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
