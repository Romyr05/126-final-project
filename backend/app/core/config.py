# this is sort of the settings portion nga i gamition everytime we need a env 
import os
from pathlib import Path
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[2]/ ".env.local")  # local env get

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    FRONTEND_ORIGINS = [
        origin.strip().rstrip("/")
        for origin in os.getenv("FRONTEND_ORIGINS", FRONTEND_ORIGIN).split(",")
        if origin.strip()
    ]

    COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"   #for https purposes
    COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax").lower()  # default lax (cross site scripting security)
    ACCESS_COOKIE_NAME = os.getenv("ACCESS_COOKIE_NAME", "access_token") # this is where store supabase access token
    REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "refresh_token") # refresh token of supabase (get new one)


    #validation of required supabase values
    def validate(self): 
        needed_values = {
            "SUPABASE_URL": self.SUPABASE_URL,
            "SUPABASE_ANON_KEY": self.SUPABASE_ANON_KEY,
            "SUPABASE_SERVICE_ROLE_KEY": self.SUPABASE_SERVICE_ROLE_KEY,
        }

        missing = [name for name, value in needed_values.items() if not value]

        if missing:
            raise RuntimeError(f"Missing required environment variables: {','.join(missing)}")


settings = Settings()
settings.validate()









# import os

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
# SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
# FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
# COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
# ACCESS_COOKIE_NAME = os.getenv("ACCESS_COOKIE_NAME", "access_token")
# REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "refresh_token")
