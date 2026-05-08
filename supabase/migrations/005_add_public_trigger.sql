-- inserts a row into public.user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (user_id,username,email)
  values (new.id,  
  coalesce(new.raw_user_meta_data ->> 'username',  'user_' || substring(new.id::text from 1 for 8)), -- get the first 8 id if no username
                                                        --fallback user_ its id
    new.email
   )
   on conflict (user_id) do nothing;   -- if user_id exist skip
  return new;
end;
$$;


--Trigger for the auth when created
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

  