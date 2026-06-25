# Supabase consolidatie

Deze repository is het hoofdproject voor het gedeelde Supabase-project van de Moreel
Vakmanschap-apps.

## Projecten die Supabase houden

### Moreel Vakmanschap app

Houd dit project gekoppeld aan Supabase. De app gebruikt Supabase voor:

- magic-link login;
- profielen, rollen en cohorten;
- dagboek, groepsruimte, zelfscan en reminders;
- begeleiderdashboards en RLS/privacyregels.

### Moral Maps

Moral Maps hoeft geen eigen Supabase-project te hebben. Gebruik hetzelfde Supabase-project als deze
app en draai de migratie:

```txt
supabase/migrations/20260625065300_add_moral_maps_results.sql
```

Zet in alle Vercel-projecten van Moral Maps dezelfde waarden als in dit hoofdproject:

```txt
VITE_SUPABASE_URL=<waarde van NEXT_PUBLIC_SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<waarde van NEXT_PUBLIC_SUPABASE_ANON_KEY>
```

Als `CRON_SECRET` op Moral Maps staat, mag die blijven staan voor `/api/keep-alive`. Die endpoint
pingt dan dezelfde gedeelde tabel `moralmaps_results`.

De directe Moral Maps-wijziging staat ook klaar als patch:

```txt
docs/moral-maps-shared-supabase.patch
```

Deze patch zet `.env.example`, `README.md`, `supabase_setup.sql` en de keep-alive toelichting van
Moral Maps op het gedeelde Supabase-project. De Cloud Agent kon deze patch niet naar de
`moral-maps` repository pushen, omdat `cursor[bot]` daar geen schrijfrechten heeft.

## Projecten die zonder Supabase kunnen

De volgende repositories hadden bij de scan geen Supabase dependency of Supabase-bestanden:

- `heroes-project`
- `ethos-studio`
- `rvodde-cyber-community-moreel-vakmanschap`
- `Lakmoesproef`
- `moreel-vakmanschap-leergang`
- `dilemmagenerator`
- `riasec-studiekeuze`
- `Organisatievertrouwen`

## Heroes verwijderen

`heroes-project` gebruikt volgens de repositoryscan geen Supabase. Een los Supabase-project voor
Heroes kan daarom worden verwijderd via het Supabase dashboard:

1. Open Supabase dashboard.
2. Kies het Heroes-project.
3. Controleer onder **Table Editor** en **Auth** dat er geen relevante data/users meer nodig zijn.
4. Ga naar **Project Settings > General > Delete project**.
5. Verwijder daarna eventuele Vercel environment variables die naar dat Heroes Supabase-project
   wijzen.

Deze Cloud Agent heeft geen Supabase management-token of CLI in de omgeving, dus het daadwerkelijke
verwijderen van externe Supabase-projecten moet in het dashboard gebeuren.
