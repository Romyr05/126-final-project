import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parents[2] / ".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


if not SUPABASE_URL or not SUPABASE_ROLE_KEY or not SUPABASE_ANON_KEY:
    raise RuntimeError("Missing Dependency so either (Supabase URL, anon key, or service role key)")

# admin priviliges tbd 
supabase_admin = create_client(SUPABASE_URL, SUPABASE_ROLE_KEY)


# supabase client for users
def create_user_supabase(token: str):
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)   #supabase wrapper
    client.postgrest.auth(token)  # attaches jwt to postgress of the supabase
    return client

supabase_public = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)   #for the public supabase use para d na mag auth.supabase
                                                                    # since public man no need user auth
