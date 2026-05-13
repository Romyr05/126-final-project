from dataclasses import dataclass
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.supabase_client_backend import create_user_supabase, supabase_public
from app.core.config import settings

# expect a header like Bearer shit
# auto_error -> do not reject requests that have no Authorization header
security = HTTPBearer(auto_error = False) 


@dataclass
class AuthContext:
    user: Any
    supabase: Any

# this if for the protected routes (ones that need user and supabase)
def get_auth_context(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    # none due to security
) -> AuthContext:
    token = request.cookies.get(settings.ACCESS_COOKIE_NAME) #this get the 

    if not token and credentials:
        token = credentials.credentials

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")


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