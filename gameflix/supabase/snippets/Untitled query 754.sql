-- 1. Add slug column
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS slug text;

-- 2. Generate slugs from titles
UPDATE public.games
SET slug = lower(
  regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'),
    '^-|-$',
    '',
    'g'
  )
)
WHERE slug IS NULL;

-- 3. Check duplicates first
SELECT slug, COUNT(*)
FROM public.games
GROUP BY slug
HAVING COUNT(*) > 1;

-- 4. Fix duplicates, keeping the first one clean
WITH ranked AS (
  SELECT
    game_id,
    slug,
    igdb_id,
    ROW_NUMBER() OVER (
      PARTITION BY slug
      ORDER BY release_year NULLS LAST, igdb_id
    ) AS rn
  FROM public.games
)
UPDATE public.games AS g
SET slug = ranked.slug || '-' || ranked.igdb_id
FROM ranked
WHERE g.game_id = ranked.game_id
AND ranked.rn > 1;

-- 5. Check again
SELECT slug, COUNT(*)
FROM public.games
GROUP BY slug
HAVING COUNT(*) > 1;

-- 6. Add unique constraint
ALTER TABLE public.games
ADD CONSTRAINT games_slug_unique UNIQUE (slug);