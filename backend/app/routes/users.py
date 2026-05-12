from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import AuthContext, get_auth_context
from app.schemas.userSchema import UserUpdate


router = APIRouter(prefix="/users", tags=["Users"])

# getter
@router.get("/me")
def get_my_user(auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("users")
        .select("*")
        .eq("id", str(auth.user.id))
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return response.data[0]


#updater
@router.patch("/me")
def update_my_user(user_update: UserUpdate, auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("users")
        .update({"username": user_update.username})
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    return response.data[0]
