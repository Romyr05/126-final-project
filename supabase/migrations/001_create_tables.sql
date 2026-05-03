/*Created for users  */

create TABLE if not exists public.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create TABLE if not exists public.games (
  game_id uuid primary key default gen_random_uuid(),   /* random uuid because each game contains diff id */
  igdb_id bigint unique not null,
  title text not null,
  description text,
  release_year int,
  external_rating numeric(5,2),
  avg_user_rating numeric(4,2) default 0,
  cover_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

/* games index */ 
CREATE INDEX idx_games_title ON games (title);

CREATE INDEX idx_games_release_year ON games (release_year);

CREATE INDEX idx_games_avg_user_rating ON games (avg_user_rating);

CREATE INDEX idx_games_external_rating ON games (external_rating);

create unique index if not exists idx_games_igdb_id on public.games(igdb_id) where igdb_id is not null;



CREATE TABLE if not exists public.genres (
  genre_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- index genres
CREATE INDEX idx_genres_name ON genres (name);


create table if not exists public.tags(
  tag_id uuid primary key default gen_random_uuid(),
  name TEXT unique NOT null
);

-- index tags
CREATE INDEX idx_tags_name ON tags (name);

create table if not exists public.game_genres(
  game_id uuid references games(game_id) ON delete cascade,
  genre_id uuid references genres(genre_id) ON delete cascade,
  primary key (game_id, genre_id) 
);

-- index game genres 

CREATE INDEX idx_game_genres_game_id ON game_genres (game_id);

CREATE INDEX idx_game_genres_genre_id ON game_genres (genre_id);

CREATE UNIQUE INDEX idx_game_genres_game_genre ON game_genres (game_id, genre_id);


create table if not exists public.game_tags(
  game_id uuid references games(game_id) ON delete cascade,
  tag_id uuid references tags(tag_id) ON delete cascade,
  primary key (game_id, tag_id) 
);

-- index for game_tags
CREATE INDEX idx_game_tags_game_id ON game_tags (game_id);

CREATE INDEX idx_game_tags_tag_id ON game_tags (tag_id);

CREATE UNIQUE INDEX idx_game_tags_game_tag ON game_tags (game_id, tag_id);



create table if not exists public.reviews(
  review_id uuid primary key default gen_random_uuid(),
  user_id uuid references users(user_id) ON delete cascade,
  game_id uuid references games(game_id) ON delete cascade,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  date_created timestamptz default now(),
  date_updated timestamptz default now(),
  likes INT not null
);

-- For the reviews
CREATE INDEX idx_reviews_user_id ON reviews (user_id);

CREATE INDEX idx_reviews_game_id ON reviews (game_id);

CREATE INDEX idx_reviews_game_date_updated ON reviews (game_id, date_updated DESC);

CREATE UNIQUE INDEX idx_reviews_user_game ON reviews (user_id, game_id);

CREATE index idx_reviews_rating on reviews(rating);


-- For the favorites
create table if not exists public.favorites(
  favorite_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id) on delete cascade,
  game_id uuid references public.games(game_id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, game_id)   /* user can only favorite 1 game */
);

-- Favorites index
CREATE INDEX idx_favorites_user_id ON favorites (user_id);

CREATE INDEX idx_favorites_game_id ON favorites (game_id);

CREATE INDEX idx_favorites_user_created_at ON favorites (user_id, created_at DESC);

CREATE UNIQUE INDEX idx_favorites_user_game ON favorites (user_id, game_id);

create table if not exists public.game_logs (
  log_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id) on delete cascade,
  game_id uuid references public.games(game_id) on delete cascade,
  status text not null check (status in ('played', 'playing', 'completed', 'dropped', 'wishlist')),  /* not sure */
  date_logged timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, game_id)  /* no duplicate game logged per user */
);

-- Index for game logs

CREATE INDEX idx_game_logs_user_id ON game_logs (user_id);

CREATE INDEX idx_game_logs_game_id ON game_logs (game_id);

CREATE INDEX idx_game_logs_user_status ON game_logs (user_id, status);

CREATE UNIQUE INDEX idx_game_logs_user_game ON game_logs (user_id, game_id);




/* Users List of games */

create table if not exists public.lists (
  list_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id) on delete cascade,
  list_name text not null,
  description text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
--Index for lists

CREATE index idx_lists_user_id on lists(user_id);

CREATE index idx_lists_list_name on lists(user_id, list_name);

CREATE index idx_lists_user_updated_at on lists(user_id, updated_at DESC);


create table if not exists public.list_items (
  list_id uuid references public.lists(list_id) on delete cascade,
  game_id uuid references public.games(game_id) on delete cascade,
  added_at timestamptz default now(),
  primary key (list_id, game_id)
);

-- INdex for list items

CREATE INDEX idx_list_items_list_id ON list_items (list_id);

CREATE INDEX idx_list_items_game_id ON list_items (game_id);

CREATE INDEX idx_list_items_list_added_at ON list_items (list_id, added_at DESC);

CREATE UNIQUE INDEX idx_list_items_list_game ON list_items (list_id, game_id);