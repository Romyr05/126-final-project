import os 
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parents[2] /".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


if not SUPABASE_ROLE_KEY or not SUPABASE_URL:
    raise RuntimeError("Missing dependencies (Either RoleKey or URL)")

supabase = create_client(SUPABASE_URL,SUPABASE_ROLE_KEY)
