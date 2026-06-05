create extension if not exists pgcrypto;

create table public.cohorten (
  id uuid primary key default gen_random_uuid(),
  naam text,
  startdatum date,
  begeleider_id uuid
);

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  naam text,
  rol text not null default 'deelnemer' check (rol in ('deelnemer', 'begeleider')),
  cohort_id uuid references public.cohorten(id) on delete set null,
  aangemaakt_op timestamptz default now()
);

alter table public.cohorten
  add constraint cohorten_begeleider_id_fkey
  foreign key (begeleider_id) references public.profiles(id) on delete set null;

create table public.dagboek (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid not null references public.profiles(id) on delete cascade,
  week int not null check (week between 1 and 18),
  dimensie text not null check (dimensie in ('waarnemen','buik','hart','handen','ruggegraat')),
  tekst text not null,
  aangemaakt_op timestamptz default now()
);

create table public.groepsruimte (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorten(id) on delete cascade,
  week int not null check (week between 1 and 18),
  tekst text not null,
  dimensie text check (dimensie in ('waarnemen','buik','hart','handen','ruggegraat')),
  verborgen boolean not null default false,
  gespreksstarter boolean not null default false,
  aangemaakt_op timestamptz default now()
);

create table public.reacties (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.groepsruimte(id) on delete cascade,
  gebruiker_id uuid not null references public.profiles(id) on delete cascade,
  unique(post_id, gebruiker_id)
);

create table public.weekthemas (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorten(id) on delete cascade,
  week int not null check (week between 1 and 18),
  thema text not null,
  vraag text not null,
  aangemaakt_op timestamptz default now(),
  unique(cohort_id, week)
);

create table public.zelfscan (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid not null references public.profiles(id) on delete cascade,
  moment text not null check (moment in ('begin','einde')),
  waarnemen int not null check (waarnemen between 1 and 5),
  buik int not null check (buik between 1 and 5),
  hart int not null check (hart between 1 and 5),
  handen int not null check (handen between 1 and 5),
  ruggegraat int not null check (ruggegraat between 1 and 5),
  toelichting text,
  aangemaakt_op timestamptz default now(),
  unique(gebruiker_id, moment)
);

create table public.reminder_voorkeuren (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid not null references public.profiles(id) on delete cascade,
  reminder text not null check (
    reminder in (
      'dinsdag_avond',
      'donderdag_ochtend',
      'zondag_voor_bijeenkomst',
      'dag_na_bijeenkomst'
    )
  ),
  actief boolean not null default true,
  bijgewerkt_op timestamptz default now(),
  unique(gebruiker_id, reminder)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, naam, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'naam', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'rol', 'deelnemer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.bijgewerkt_op = now();
  return new;
end;
$$;

create trigger reminder_voorkeuren_updated_at
  before update on public.reminder_voorkeuren
  for each row execute function public.set_updated_at();

create or replace function public.current_profile_cohort()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cohort_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.profiles where id = auth.uid()
$$;

create or replace function public.is_cohort_member(cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and rol = 'deelnemer'
      and cohort_id = cohort
  )
$$;

create or replace function public.is_cohort_begeleider(cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.cohorten c on c.id = cohort
    where p.id = auth.uid()
      and p.rol = 'begeleider'
      and (p.cohort_id = cohort or c.begeleider_id = p.id)
  )
$$;

alter table public.profiles enable row level security;
alter table public.cohorten enable row level security;
alter table public.dagboek enable row level security;
alter table public.groepsruimte enable row level security;
alter table public.reacties enable row level security;
alter table public.weekthemas enable row level security;
alter table public.zelfscan enable row level security;
alter table public.reminder_voorkeuren enable row level security;

create policy "Gebruiker leest eigen profiel"
  on public.profiles for select
  using (id = auth.uid());

create policy "Gebruiker werkt eigen profiel bij"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Cohort zichtbaar voor leden en begeleiders"
  on public.cohorten for select
  using (
    public.is_cohort_member(id)
    or public.is_cohort_begeleider(id)
  );

create policy "Dagboek alleen eigen notities lezen"
  on public.dagboek for select
  using (gebruiker_id = auth.uid());

create policy "Dagboek alleen eigen notities schrijven"
  on public.dagboek for insert
  with check (gebruiker_id = auth.uid());

create policy "Dagboek alleen eigen notities aanpassen"
  on public.dagboek for update
  using (gebruiker_id = auth.uid())
  with check (gebruiker_id = auth.uid());

create policy "Dagboek alleen eigen notities verwijderen"
  on public.dagboek for delete
  using (gebruiker_id = auth.uid());

create policy "Groepsruimte lezen binnen cohort"
  on public.groepsruimte for select
  using (
    (public.is_cohort_member(cohort_id) and verborgen = false)
    or public.is_cohort_begeleider(cohort_id)
  );

create policy "Deelnemer schrijft anoniem in eigen cohort"
  on public.groepsruimte for insert
  with check (public.is_cohort_member(cohort_id));

create policy "Begeleider modereert groepsruimte"
  on public.groepsruimte for update
  using (public.is_cohort_begeleider(cohort_id))
  with check (public.is_cohort_begeleider(cohort_id));

create policy "Reacties alleen eigen markeringen lezen"
  on public.reacties for select
  using (gebruiker_id = auth.uid());

create policy "Reacties eigen herkenbaar plaatsen"
  on public.reacties for insert
  with check (
    gebruiker_id = auth.uid()
    and exists (
      select 1
      from public.groepsruimte g
      where g.id = post_id
        and g.verborgen = false
        and public.is_cohort_member(g.cohort_id)
    )
  );

create policy "Reacties eigen herkenbaar verwijderen"
  on public.reacties for delete
  using (gebruiker_id = auth.uid());

create policy "Weekthema lezen binnen cohort"
  on public.weekthemas for select
  using (
    public.is_cohort_member(cohort_id)
    or public.is_cohort_begeleider(cohort_id)
  );

create policy "Begeleider schrijft weekthema"
  on public.weekthemas for insert
  with check (public.is_cohort_begeleider(cohort_id));

create policy "Begeleider werkt weekthema bij"
  on public.weekthemas for update
  using (public.is_cohort_begeleider(cohort_id))
  with check (public.is_cohort_begeleider(cohort_id));

create policy "Zelfscan alleen eigen scans lezen"
  on public.zelfscan for select
  using (gebruiker_id = auth.uid());

create policy "Zelfscan alleen eigen scans schrijven"
  on public.zelfscan for insert
  with check (gebruiker_id = auth.uid());

create policy "Zelfscan alleen eigen scans aanpassen"
  on public.zelfscan for update
  using (gebruiker_id = auth.uid())
  with check (gebruiker_id = auth.uid());

create policy "Reminders alleen eigen voorkeuren lezen"
  on public.reminder_voorkeuren for select
  using (gebruiker_id = auth.uid());

create policy "Reminders alleen eigen voorkeuren schrijven"
  on public.reminder_voorkeuren for insert
  with check (gebruiker_id = auth.uid());

create policy "Reminders alleen eigen voorkeuren aanpassen"
  on public.reminder_voorkeuren for update
  using (gebruiker_id = auth.uid())
  with check (gebruiker_id = auth.uid());

create or replace view public.groepsruimte_overzicht as
select
  g.*,
  count(r.id)::int as herkenbaar_count,
  exists (
    select 1
    from public.reacties eigen_reactie
    where eigen_reactie.post_id = g.id
      and eigen_reactie.gebruiker_id = auth.uid()
  ) as door_mij_herkend
from public.groepsruimte g
left join public.reacties r on r.post_id = g.id
where public.is_cohort_member(g.cohort_id)
   or public.is_cohort_begeleider(g.cohort_id)
group by g.id;

create or replace view public.begeleider_zelfscan_aggregaat as
select
  p.cohort_id,
  z.moment,
  round(avg(z.waarnemen)::numeric, 2)::float8 as waarnemen,
  round(avg(z.buik)::numeric, 2)::float8 as buik,
  round(avg(z.hart)::numeric, 2)::float8 as hart,
  round(avg(z.handen)::numeric, 2)::float8 as handen,
  round(avg(z.ruggegraat)::numeric, 2)::float8 as ruggegraat,
  count(*)::int as aantal
from public.zelfscan z
join public.profiles p on p.id = z.gebruiker_id
where p.cohort_id is not null
  and public.is_cohort_begeleider(p.cohort_id)
group by p.cohort_id, z.moment;

create or replace view public.dagboek_dimensie_week_aggregaat as
select
  p.cohort_id,
  d.week,
  d.dimensie,
  count(*)::int as aantal
from public.dagboek d
join public.profiles p on p.id = d.gebruiker_id
where p.cohort_id is not null
  and public.is_cohort_begeleider(p.cohort_id)
group by p.cohort_id, d.week, d.dimensie;

create or replace view public.begeleider_week_aggregaat as
with weken as (
  select p.cohort_id, d.week
  from public.dagboek d
  join public.profiles p on p.id = d.gebruiker_id
  union
  select cohort_id, week from public.groepsruimte
),
actief as (
  select p.cohort_id, d.week, count(distinct d.gebruiker_id)::int as actieve_deelnemers
  from public.dagboek d
  join public.profiles p on p.id = d.gebruiker_id
  group by p.cohort_id, d.week
),
posts as (
  select cohort_id, week, count(*)::int as groepsruimte_posts
  from public.groepsruimte
  where verborgen = false
  group by cohort_id, week
),
dimensie_rank as (
  select
    p.cohort_id,
    d.week,
    d.dimensie,
    row_number() over (
      partition by p.cohort_id, d.week
      order by count(*) desc, d.dimensie asc
    ) as positie
  from public.dagboek d
  join public.profiles p on p.id = d.gebruiker_id
  group by p.cohort_id, d.week, d.dimensie
)
select
  w.cohort_id,
  w.week,
  coalesce(a.actieve_deelnemers, 0) as actieve_deelnemers,
  coalesce(p.groepsruimte_posts, 0) as groepsruimte_posts,
  dr.dimensie as meest_gebruikte_dimensie
from weken w
left join actief a on a.cohort_id = w.cohort_id and a.week = w.week
left join posts p on p.cohort_id = w.cohort_id and p.week = w.week
left join dimensie_rank dr on dr.cohort_id = w.cohort_id and dr.week = w.week and dr.positie = 1
where public.is_cohort_begeleider(w.cohort_id);

create or replace view public.cohort_deelnemers_aantal as
select
  p.cohort_id,
  count(*)::int as aantal_deelnemers
from public.profiles p
where p.rol = 'deelnemer'
  and p.cohort_id is not null
  and public.is_cohort_begeleider(p.cohort_id)
group by p.cohort_id;

create index dagboek_gebruiker_week_idx on public.dagboek(gebruiker_id, week);
create index dagboek_week_dimensie_idx on public.dagboek(week, dimensie);
create index groepsruimte_cohort_week_idx on public.groepsruimte(cohort_id, week);
create index reacties_post_idx on public.reacties(post_id);
create index zelfscan_gebruiker_moment_idx on public.zelfscan(gebruiker_id, moment);
