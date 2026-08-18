# Stylist App

## Setup
```bash
npm install
npm run dev
```
Open http://localhost:3000 for onboarding, http://localhost:3000/dashboard for the dashboard.

If styles don't apply, make sure:
1. `tailwind.config.ts` `content` paths match where your files live.
2. `postcss.config.js` exists and loads tailwindcss + autoprefixer.
3. `app/globals.css` is imported in `app/layout.tsx` (it is, by default).
4. You're actually running `npm run dev` from this folder, not pasting files into an existing project missing Tailwind setup.
