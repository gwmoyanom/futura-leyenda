# Supabase setup

This project can persist `users`, `matches`, `predictions`, and `config` in the Supabase free tier.

## 1. Create the project

1. Create a free Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.

## 2. Configure the app

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Find these values in Supabase under **Project Settings > API**.

Restart Vite after editing `.env.local`.

## 3. Behavior

When both env vars exist, `src/services/storage.service.js` reads and writes through Supabase REST.
Without them, the app keeps using `public/data/*.json` plus `localStorage`.

## Security note

The current app uses friendly client-side username/password auth, so the Supabase RLS policies are intentionally permissive for the anon key. This matches the current baby-shower-pool model, but it is not strong security. Do not store private data here, and never put the Supabase service role key in the frontend.
