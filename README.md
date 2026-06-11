# 🏆 Polla Mundialista 2026

Prediction pool app for the 2026 World Cup — built for a baby shower, works for any group.

## Quick start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:5173
```

## Project structure

```
src/
├── components/
│   ├── ui/            # Reusable primitives: Button, Card, Input, Badge
│   ├── layout/        # AppShell, Navbar, TickerStrip, Footer
│   ├── auth/          # Route guards: RequireAuth, RequireAdmin
│   └── participant/   # MatchCard (shared between predict/view/admin modes)
├── pages/
│   ├── LandingPage.jsx
│   ├── AuthPages.jsx  # Login + Register
│   ├── LeaderboardPage.jsx
│   ├── participant/   # PredictionsPage, DashboardPage
│   └── admin/         # AdminPage (matches + users tabs)
├── services/
│   ├── storage.service.js  # All data reads/writes
│   └── auth.service.js     # Login, register, session
├── store/
│   └── index.js       # Zustand global state
└── utils/
    ├── scoring.utils.js  # Pure scoring engine (testable)
    └── date.utils.js     # Match timing helpers
public/
└── data/
    ├── matches.json      # Match fixtures and results
    ├── users.json        # Base users (seed data)
    ├── predictions.json  # Base predictions (seed data)
    └── config.json       # Scoring rules and prizes
```

## How data works (Phase 1)

Reads come from static JSON files in `/public/data/`. Writes go to `localStorage`
(admin score updates, new registrations, predictions). This means:

- **Reads**: instant, served from CDN
- **Writes**: saved in the browser — persistent per device, not shared across devices

This is ideal for a small group (baby shower). Everyone shares the same base data
from the JSON files, and their personal predictions live in their own browser.

**Admin note**: When you update a match score as admin, it saves in your browser's
localStorage and shows up for you immediately. To publish results to all participants,
update the `public/data/matches.json` file and push to GitHub.

## Scoring rules

| Event | Points |
|-------|--------|
| Exact score (e.g. 2-1 correct) | 3 pts |
| Correct result (W/D/L) | 1 pt |
| Champion pick | 10 pts |
| Finalist pick | 4 pts |
| Golden boot | 5 pts |

Edit `public/data/config.json` to change rules.

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Edit `.github/workflows/deploy.yml` and set `VITE_BASE_PATH` to your repo name
4. Push to `main` — the workflow builds and deploys automatically
5. Your app will be at: `https://yourusername.github.io/polla-mundialista/`

## Upgrade to Phase 2 (Supabase)

When you need real shared state:
1. Create a Supabase project
2. Replace `src/services/storage.service.js` with Supabase client calls
3. Replace `src/services/auth.service.js` with `supabase.auth.*`
4. All other code stays the same — the store and components are backend-agnostic

## Run tests

```bash
npm test
```

Tests cover the scoring engine: exact scores, result matching, tiebreakers, leaderboard sort.
