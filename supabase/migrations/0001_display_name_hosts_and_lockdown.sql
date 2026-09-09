-- Run this once, in the Supabase dashboard → SQL Editor → New query → Run.
-- Every statement is safe to run twice.
--
--   1. display_name — the byline on the wall, separate from the envelope greeting
--   2. host         — the couple, who may delete anything on the wall
--   3. an index rate limiting actually uses
--   4. row-level security on every table
--
-- ---------------------------------------------------------------------------

-- 1 & 2 -----------------------------------------------------------------------
-- `name` is how the couple address a guest on the envelope and is printed
-- exactly as written — «خاله عزیز», «مامان جون». `display_name` is the byline
-- above their messages, where an endearment addressed *to* someone reads as
-- nonsense coming *from* them. Null falls back to `name`.
alter table public.guests add column if not exists display_name text;

-- Set from content/config.ts by `npm run guests`; do not edit by hand or the
-- next run will put it back.
alter table public.guests add column if not exists host boolean not null default false;

-- 3 ---------------------------------------------------------------------------
-- Every post, reaction, comment, edit, delete and GIF search writes a row here
-- and `tooMany` counts them by key over a time window. Without this index that
-- count is a sequential scan of a table that only ever grows.
create index if not exists rate_limits_key_created_idx
  on public.rate_limits (key, created_at desc);

-- 4 ---------------------------------------------------------------------------
-- The app reaches Postgres only through the service-role key, from the server,
-- and the service role bypasses RLS — so turning it on costs this application
-- nothing and it is the only thing standing between the anon key and a table of
-- 61 real names, phone numbers and invitation tokens. No policies are added on
-- purpose: with RLS on and no policy, anon and authenticated get nothing.
alter table public.guests      enable row level security;
alter table public.posts       enable row level security;
alter table public.comments    enable row level security;
alter table public.reactions   enable row level security;
alter table public.rsvps       enable row level security;
alter table public.rate_limits enable row level security;
alter table public.uploads     enable row level security;

-- ---------------------------------------------------------------------------
-- Optional tidying. Neither is referenced by any code in this repository:
-- `upload_count` was never written (the 20-photo cap counts posts instead), and
-- nothing has ever inserted into `uploads`. Drop them only if you agree.
--
--   alter table public.guests drop column upload_count;
--   drop table public.uploads;
