-- Keep derived game and activity fields correct after fresh seeds and API writes.

create extension if not exists pg_trgm;

create index if not exists idx_games_title_trgm
on public.games
using gin (title gin_trgm_ops);

create or replace function public.make_game_slug(game_title text, game_igdb_id bigint)
returns text
language sql
immutable
as $$
  select trim(
    both '-' from regexp_replace(
      lower(coalesce(game_title, 'game') || '-' || game_igdb_id::text),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );
$$;

create or replace function public.set_game_slug()
returns trigger
language plpgsql
as $$
begin
  new.slug = public.make_game_slug(new.title, new.igdb_id);
  return new;
end;
$$;

drop trigger if exists set_game_slug_before_write on public.games;

create trigger set_game_slug_before_write
before insert or update of title, igdb_id on public.games
for each row
execute function public.set_game_slug();

update public.games
set slug = public.make_game_slug(title, igdb_id);

alter table public.reviews
alter column likes set default 0;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_review_date_updated()
returns trigger
language plpgsql
as $$
begin
  new.date_updated = now();
  return new;
end;
$$;

drop trigger if exists set_games_updated_at_before_update on public.games;
drop trigger if exists set_game_logs_updated_at_before_update on public.game_logs;
drop trigger if exists set_lists_updated_at_before_update on public.lists;
drop trigger if exists set_reviews_date_updated_before_update on public.reviews;

create trigger set_games_updated_at_before_update
before update on public.games
for each row
execute function public.set_updated_at();

create trigger set_game_logs_updated_at_before_update
before update on public.game_logs
for each row
execute function public.set_updated_at();

create trigger set_lists_updated_at_before_update
before update on public.lists
for each row
execute function public.set_updated_at();

create trigger set_reviews_date_updated_before_update
before update on public.reviews
for each row
execute function public.set_review_date_updated();

create or replace function public.refresh_game_avg_user_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_game_id uuid;
begin
  target_game_id = coalesce(new.game_id, old.game_id);

  update public.games
  set avg_user_rating = coalesce(
    (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where game_id = target_game_id
    ),
    0
  )
  where game_id = target_game_id;

  return null;
end;
$$;

drop trigger if exists refresh_game_avg_user_rating_after_write on public.reviews;

create trigger refresh_game_avg_user_rating_after_write
after insert or update of rating or delete on public.reviews
for each row
execute function public.refresh_game_avg_user_rating();
