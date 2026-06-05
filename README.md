# Moreel Vakmanschap platform

Next.js 14 App Router applicatie voor de leergang Moreel Vakmanschap.

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Supabase Auth, Postgres en RLS
- Supabase Edge Functions + Resend voor e-mailreminders

## Lokaal starten

```bash
npm install
cp .env.example .env.local
npm run dev
```

Vul de Supabase keys in `.env.local` in. Het project-ID uit de briefing is al verwerkt in de voorbeeld-URL.

## Database

De initiële migratie staat in:

```bash
supabase/migrations/20260604210900_init_moreel_vakmanschap.sql
```

Deze migratie maakt alle tabellen, RLS policies en aggregate views aan. De tabel `groepsruimte`
bevat bewust geen `gebruiker_id`, zodat posts ook voor begeleiders anoniem blijven.

## Deployment

Zet in Vercel minimaal deze variabelen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (alleen voor reminder-webhook)
- `RESEND_API_KEY`
- `REMINDERS_FROM_EMAIL`
- `REMINDERS_CRON_SECRET`

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
