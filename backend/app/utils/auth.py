from dataclasses import dataclass
from typing import Annotated, Any
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database.supabase_client_backend import create_user_supabase, supabase_public

# expect a header like Bearer shit
security = HTTPBearer()


@dataclass
class AuthContext:
    user: Any
    supabase: Any

# this if for the protected routes (ones that need user and supabase)
def get_auth_context(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> AuthContext:
    token = credentials.credentials
    supabase = create_user_supabase(token)

    try:
        response = supabase.auth.get_user(token)
        user = response.user

        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate user")

    return AuthContext(user=user, supabase=supabase)

# for public 
def get_public_supabase() -> Any:
    return supabase_public