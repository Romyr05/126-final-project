-- Enabling RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

/* Creating policies here */

-- Users -- 
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated  
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can udpate own profile"
ON public.users
FOR UPDATE
TO authenticated  -- built in na
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);  -- select is much faster


-- Tables (public)
CREATE POLICY "Public read games"
ON public.games
FOR SELECT
USING (true);

CREATE POLICY "Public read genres"
ON public.genres
FOR SELECT
USING (true);

CREATE POLICY "Public read tags"
ON public.tags
FOR SELECT
USING (true);

CREATE POLICY "Public read game_genres"
ON public.game_genres
FOR SELECT
USING (true);

CREATE POLICY "Public read game_tags"
ON public.game_tags
FOR SELECT
USING (true);

-- For the Review
CREATE POLICY "Public read reviews"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Users insert own reviews"
ON public.reviews
FOR INSERT
TO authenticated   -- NO using since its insert
WITH CHECK ((SELECT auth.uid()) = user_id);


CREATE POLICY "Users update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own reviews"
ON public.reviews
FOR delete
To authenticated
USING((SELECT auth.uid()) = user_id);


-- Favorites
CREATE POLICY "Users read own favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users insert own favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own favorites"
ON public.favorites
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- Game Logs

CREATE POLICY "Users read own logs"
ON public.game_logs
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users insert own logs"
ON public.game_logs
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own logs"
ON public.game_logs
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own logs"
ON public.game_logs
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- Lists

CREATE POLICY "Read lists"
ON public.lists
FOR SELECT
USING (
  is_public = true   -- Either public or not
  OR (SELECT auth.uid()) = user_id
);

CREATE POLICY "Users insert lists"
ON public.lists
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own lists"
ON public.lists
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own lists"
ON public.lists
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- List items

CREATE POLICY "Read list items"
ON public.list_items
FOR SELECT
USING (
  EXISTS (  -- This if it just exist and if same id and user or if public
    SELECT 1 FROM public.lists
    WHERE lists.list_id = list_items.list_id
    AND (
      lists.is_public = true
      OR lists.user_id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "Insert list items"
ON public.list_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lists
    WHERE lists.list_id = list_items.list_id
    AND lists.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Delete list items"
ON public.list_items
FOR DELETE
TO authenticated
USING (  
  EXISTS (
    SELECT 1 FROM public.lists
    WHERE lists.list_id = list_items.list_id
    AND lists.user_id = (SELECT auth.uid())
  )
);


