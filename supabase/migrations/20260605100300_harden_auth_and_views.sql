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
    'deelnemer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.prevent_profile_role_or_cohort_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.jwt() ->> 'role' = 'service_role' then
    return new;
  end if;

  if new.rol is distinct from old.rol or new.cohort_id is distinct from old.cohort_id then
    raise exception 'rol en cohort_id kunnen niet door gebruikers worden aangepast';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_or_cohort_change on public.profiles;
create trigger prevent_profile_role_or_cohort_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_or_cohort_change();

drop policy if exists "Gebruiker werkt eigen profiel bij" on public.profiles;
create policy "Gebruiker werkt eigen profiel bij"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace view public.groepsruimte_overzicht
with (security_invoker = true) as
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
where (public.is_cohort_member(g.cohort_id) and g.verborgen = false)
   or public.is_cohort_begeleider(g.cohort_id)
group by g.id;

create or replace view public.begeleider_zelfscan_aggregaat
with (security_invoker = true) as
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

create or replace view public.dagboek_dimensie_week_aggregaat
with (security_invoker = true) as
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

create or replace view public.begeleider_week_aggregaat
with (security_invoker = true) as
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

create or replace view public.cohort_deelnemers_aantal
with (security_invoker = true) as
select
  p.cohort_id,
  count(*)::int as aantal_deelnemers
from public.profiles p
where p.rol = 'deelnemer'
  and p.cohort_id is not null
  and public.is_cohort_begeleider(p.cohort_id)
group by p.cohort_id;
