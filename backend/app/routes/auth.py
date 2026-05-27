from fastapi import APIRouter, Depends, HTTPException, Response, Request

from app.core.security import clear_auth_cookies, set_auth_cookies
from app.core.config import settings

from app.database.supabase_client_backend import supabase_admin, supabase_public
from app.schemas.authSchema import AuthResponseSchema, LoginRequestSchema, SignupRequestSchema
from app.utils.auth import AuthContext, get_auth_context



router = APIRouter(prefix="/auth", tags=["Auth"])

# For login purposes
@router.post("/login", response_model=AuthResponseSchema)
def login(login_data: LoginRequestSchema, response: Response):  # response used for the cookies (response headers)

    try:
        auth_response = supabase_public.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password,
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

# auth.sign_in_with_password gives object that has session (access and refresh) and users
    session = auth_response.session
    user = auth_response.user

    if not session or not user:
        raise HTTPException(status_code=401, detail="Could not create session")

    #put those into the auth_cookie values where sessoin contains access_token and refresh
    set_auth_cookies(
        response=response,
        access_token=session.access_token,
        refresh_token=session.refresh_token,
    )

    profile_response = (
        supabase_admin.table("users")
        .select("user_id, username")
        .eq("user_id", str(user.id))
        .limit(1)
        .execute()
    )

#supabase returns a list so need to get first row
    profile = profile_response.data[0] if profile_response.data else {}

    return {
        "id": user.id,
        "email": user.email,
        "username": profile.get("username")
    }


@router.post("/signup", response_model=AuthResponseSchema )
def signup(signup_data: SignupRequestSchema, response: Response):
    username = signup_data.username.strip()

    existing_username = (
        supabase_admin.table("users")
        .select("user_id")
        .eq("username", username)
        .limit(1)
        .execute()
    )

    if existing_username.data:
        raise HTTPException(status_code=409, detail="Username already exists")

    #same logic as above but here we post it instead of get
    try:
        auth_response = supabase_public.auth.sign_up({
            "email": signup_data.email,
            "password": signup_data.password,
            "options": {
                "data": {
                    "username": username,
                },
            },
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Could not create account")

    session = auth_response.session
    user = auth_response.user

    if not user:
        raise HTTPException(status_code=400, detail="Could not create account")

    #saving part
    try:
        supabase_admin.table("users").upsert({
            "user_id": user.id,
            "username": username,
            "email": signup_data.email,
        }).execute()
    except Exception:
        try:
            supabase_admin.auth.admin.delete_user(str(user.id))
        except Exception:
            pass

        raise HTTPException(status_code=400, detail="Could not create user profile")

    if session:
        set_auth_cookies(
            response=response,
            access_token=session.access_token,
            refresh_token=session.refresh_token,
        )

    return {
        "id": user.id,
        "email": user.email,
        "username": username,
    }


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}


@router.get("/me", response_model=AuthResponseSchema )
def get_me(auth: AuthContext = Depends(get_auth_context)):
    profile_response = (
        auth.supabase.table("users")
        .select("user_id, username")
        .eq("user_id", str(auth.user.id))
        .limit(1)
        .execute()
    )

    profile = profile_response.data[0] if profile_response.data else {}

    return {
        "id": str(auth.user.id),
        "email": auth.user.email,
        "username": profile.get("username"),
    }

# for expired tokens
# refreshes the user saved cookies   (new session)
@router.post("/refresh", response_model = AuthResponseSchema)
def refresh(response: Response, request: Request):
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME) # get in browser the refresh_token

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        auth_response = supabase_public.auth.refresh_session(refresh_token)  #passes refresh token to supabase
    except Exception:
        clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    session = auth_response.session
    user = auth_response.user

    if not session or not user or not session.access_token or not session.refresh_token:
        clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Could not refresh session")


    set_auth_cookies(
        response=response,
        access_token=session.access_token,
        refresh_token=session.refresh_token,
    )

    profile_response_admin = (
        supabase_admin.table("users").select("username").eq("user_id", str(user.id))
        .limit(1).execute()
    )
    
    if (profile_response_admin.data):
        profile = profile_response_admin.data[0]
    else:
        profile = {}

    return {
        "id": str(user.id),
        "email": user.email,
        "username": profile.get("username"),
    }

    # return {"message": "Session refreshed"}
