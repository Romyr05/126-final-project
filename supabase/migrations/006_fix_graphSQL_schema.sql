-- users cannot select on the public.users

revoke select on table public.users from anon;
revoke select on table public.users from authenticated;

--email should not be seen in users
grant select (user_id, username, role, created_at, updated_at)
on table public.users
to authenticated;