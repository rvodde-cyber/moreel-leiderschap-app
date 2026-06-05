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

  if current_setting('app.allow_profile_bootstrap', true) = 'true' then
    return new;
  end if;

  if new.rol is distinct from old.rol or new.cohort_id is distinct from old.cohort_id then
    raise exception 'rol en cohort_id kunnen niet door gebruikers worden aangepast';
  end if;

  return new;
end;
$$;

create or replace function public.bootstrap_first_begeleider(
  p_cohort_naam text default 'Eerste cohort',
  p_begeleider_naam text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  other_profile_count int;
  new_cohort_id uuid;
  normalized_cohort_naam text := coalesce(nullif(trim(p_cohort_naam), ''), 'Eerste cohort');
  normalized_begeleider_naam text := nullif(trim(p_begeleider_naam), '');
begin
  if current_user_id is null then
    raise exception 'Je moet ingelogd zijn om de setup uit te voeren';
  end if;

  select count(*)
    into other_profile_count
  from public.profiles
  where id <> current_user_id;

  if other_profile_count > 0 then
    raise exception 'Setup is alleen beschikbaar voor de eerste gebruiker';
  end if;

  perform set_config('app.allow_profile_bootstrap', 'true', true);

  insert into public.profiles (id, naam, rol, cohort_id)
  values (
    current_user_id,
    coalesce(normalized_begeleider_naam, 'Begeleider'),
    'begeleider',
    null
  )
  on conflict (id) do update
    set naam = coalesce(excluded.naam, public.profiles.naam),
        rol = 'begeleider',
        cohort_id = null;

  select id
    into new_cohort_id
  from public.cohorten
  where begeleider_id = current_user_id
  order by startdatum nulls last, naam nulls last
  limit 1;

  if new_cohort_id is null then
    insert into public.cohorten (naam, startdatum, begeleider_id)
    values (normalized_cohort_naam, current_date, current_user_id)
    returning id into new_cohort_id;
  else
    update public.cohorten
      set naam = coalesce(nullif(normalized_cohort_naam, ''), naam)
    where id = new_cohort_id;
  end if;

  update public.profiles
    set cohort_id = new_cohort_id
  where id = current_user_id;

  return new_cohort_id;
end;
$$;

grant execute on function public.bootstrap_first_begeleider(text, text) to authenticated;
