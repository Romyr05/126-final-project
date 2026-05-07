from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.database.supabase_client_backend import supabase
from app.utils.auth import get_current_user
from app.schemas.userSchema import UserUpdate


router = APIRouter(prefix="/users", tags=["Users"])

# getter
@router.get("/me")
def get_my_user(user = Depends(get_current_user)):
    user_id = user.id

    response = (
        supabase.table("users")
        .select("*")
        .eq("user_id", str(user_id))
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return response.data[0]



# updater
@router.patch("/me")
def update_my_user(user_update: UserUpdate, user = Depends(get_current_user)):
    user_id = user.id

    
