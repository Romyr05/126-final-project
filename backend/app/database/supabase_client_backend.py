import os
from app.core.config import settings
from supabase import create_client

# admin priviliges 
supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


# supabase client for users
def create_user_supabase(token: str):
    client = create_client(settings.SUPABASE_URL,settings.SUPABASE_ANON_KEY)   #supabase wrapper
    client.postgrest.auth(token)  # attaches jwt to postgress of the supabase
    return client

supabase_public = create_client(settings.SUPABASE_URL,settings.SUPABASE_ANON_KEY)   #for the public supabase use para d na mag auth.supabase
                                                                    # since public man no need user auth
