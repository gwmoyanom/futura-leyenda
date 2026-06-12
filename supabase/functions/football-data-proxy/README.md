# football-data-proxy

Supabase Edge Function used by GitHub Pages to avoid browser CORS errors when
syncing live World Cup match status/results from football-data.org.

## Deploy

```bash
supabase secrets set FOOTBALL_DATA_API_KEY=your-football-data-token
supabase secrets set PUBLIC_SITE_ORIGIN=https://gwmoyanom.github.io
supabase functions deploy football-data-proxy --no-verify-jwt
```

Then add this GitHub repository variable:

```text
VITE_FOOTBALL_DATA_PROXY_URL=https://YOUR_PROJECT_REF.functions.supabase.co/football-data-proxy
```

Keep `VITE_FOOTBALL_DATA_API_KEY` out of GitHub Pages builds. The token belongs
in Supabase secrets, not in the browser bundle.
