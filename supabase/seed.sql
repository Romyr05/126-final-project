begin;

-- Remove old recommender-test data that should not appear in the app.
delete from public.games
where igdb_id in (900000001, 900000002, 900000003)
   or title in ('Test Source RPG', 'Test Similar RPG', 'Test Racing Game');

delete from public.genres
where name in ('test rpg', 'test racing')
  and not exists (
    select 1
    from public.game_genres
    where game_genres.genre_id = genres.genre_id
  );

delete from public.tags
where name in ('test fantasy', 'test open world', 'test cars')
  and not exists (
    select 1
    from public.game_tags
    where game_tags.tag_id = tags.tag_id
  );

-- Remove the old placeholder review account and its dependent public activity.
delete from auth.users
where id in (
    select user_id from public.users where username = 'vault_user'
  )
  or email = 'vault_user@example.com';

delete from public.users
where username = 'vault_user';

-- Recreate demo users so the landing/profile review surfaces feel populated.
delete from auth.users
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'maya@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"maya"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'dante@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"dante"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'kei@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"kei"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-8444-444444444444',
    'authenticated',
    'authenticated',
    'luna@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"luna"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-4555-8555-555555555555',
    'authenticated',
    'authenticated',
    'noah@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"noah"}'::jsonb,
    now(),
    now()
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '{"sub":"11111111-1111-4111-8111-111111111111","email":"maya@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '{"sub":"22222222-2222-4222-8222-222222222222","email":"dante@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    '{"sub":"33333333-3333-4333-8333-333333333333","email":"kei@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-444444444444',
    '{"sub":"44444444-4444-4444-8444-444444444444","email":"luna@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    '55555555-5555-4555-8555-555555555555',
    '{"sub":"55555555-5555-4555-8555-555555555555","email":"noah@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.users (user_id, username, email)
values
  ('11111111-1111-4111-8111-111111111111', 'maya', 'maya@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'dante', 'dante@example.com'),
  ('33333333-3333-4333-8333-333333333333', 'kei', 'kei@example.com'),
  ('44444444-4444-4444-8444-444444444444', 'luna', 'luna@example.com'),
  ('55555555-5555-4555-8555-555555555555', 'noah', 'noah@example.com')
on conflict (user_id) do update set
  username = excluded.username,
  email = excluded.email,
  updated_at = now();

with seeded_games as (
  select
    game_id,
    title,
    row_number() over (
      order by avg_user_rating desc nulls last, external_rating desc nulls last, title
    ) as rn
  from public.games
  where title not in ('Test Source RPG', 'Test Similar RPG', 'Test Racing Game')
),
seed_reviews(user_id, game_rank, rating, review_text, likes) as (
  values
    (
      '11111111-1111-4111-8111-111111111111'::uuid,
      1,
      5,
      'Tight combat, memorable pacing, and a world that kept pulling me back in.',
      12
    ),
    (
      '22222222-2222-4222-8222-222222222222'::uuid,
      2,
      4,
      'A strong pick when you want something polished without feeling too predictable.',
      8
    ),
    (
      '33333333-3333-4333-8333-333333333333'::uuid,
      3,
      5,
      'The kind of game that makes side quests feel worth slowing down for.',
      15
    ),
    (
      '44444444-4444-4444-8444-444444444444'::uuid,
      4,
      4,
      'Great atmosphere and smart progression. A few rough edges, but still easy to recommend.',
      6
    ),
    (
      '55555555-5555-4555-8555-555555555555'::uuid,
      5,
      5,
      'Excellent from the first hour. The mechanics and soundtrack carry a lot of personality.',
      10
    )
)
insert into public.reviews (user_id, game_id, rating, review_text, likes)
select
  seed_reviews.user_id,
  seeded_games.game_id,
  seed_reviews.rating,
  seed_reviews.review_text,
  seed_reviews.likes
from seed_reviews
join seeded_games on seeded_games.rn = seed_reviews.game_rank
on conflict (user_id, game_id) do update set
  rating = excluded.rating,
  review_text = excluded.review_text,
  likes = excluded.likes,
  date_updated = now();

with seeded_games as (
  select
    game_id,
    row_number() over (
      order by avg_user_rating desc nulls last, external_rating desc nulls last, title
    ) as rn
  from public.games
  where title not in ('Test Source RPG', 'Test Similar RPG', 'Test Racing Game')
),
seed_logs(user_id, game_rank, status) as (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid, 1, 'completed'),
    ('11111111-1111-4111-8111-111111111111'::uuid, 6, 'playing'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 2, 'completed'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 7, 'wishlist'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 3, 'completed'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 4, 'playing'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 5, 'completed')
)
insert into public.game_logs (user_id, game_id, status)
select seed_logs.user_id, seeded_games.game_id, seed_logs.status
from seed_logs
join seeded_games on seeded_games.rn = seed_logs.game_rank
on conflict (user_id, game_id) do update set
  status = excluded.status,
  updated_at = now();

with seeded_games as (
  select
    game_id,
    row_number() over (
      order by avg_user_rating desc nulls last, external_rating desc nulls last, title
    ) as rn
  from public.games
  where title not in ('Test Source RPG', 'Test Similar RPG', 'Test Racing Game')
),
seed_favorites(user_id, game_rank) as (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid, 1),
    ('22222222-2222-4222-8222-222222222222'::uuid, 2),
    ('33333333-3333-4333-8333-333333333333'::uuid, 3),
    ('44444444-4444-4444-8444-444444444444'::uuid, 4),
    ('55555555-5555-4555-8555-555555555555'::uuid, 5)
)
insert into public.favorites (user_id, game_id)
select seed_favorites.user_id, seeded_games.game_id
from seed_favorites
join seeded_games on seeded_games.rn = seed_favorites.game_rank
on conflict (user_id, game_id) do nothing;

commit;
