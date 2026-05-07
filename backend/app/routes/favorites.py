from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.database.supabase_client_backend import supabase
from app.schemas.favoriteSchema import FavoriteCreate
from app.utils.auth import get_current_user


router = APIRouter(prefix="/favorites", tags=["Favorites"])

# getting 
@router.get("")
def get_user_favorites(user=Depends(get_current_user)):
    user_id = user.id
    response = (
        supabase.table("favorites")
        .select("*")
        .eq("user_id", str(user_id))
        .execute()
    )
    return response.data


@router.get("/{game_id}")
def get_favorite_game(game_id: UUID, user=Depends(get_current_user)):
    user_id = user.id
    response = (
        supabase.table("favorites")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("game_id", str(game_id))
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Favorite not found")

    return response.data[0]

# posting 
@router.post("")
def post_favorite_game(favorite: FavoriteCreate, user=Depends(get_current_user)):
    user_id = user.id
    # this just check if same game already exist
    existing = (
        supabase.table("favorites")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("game_id", str(favorite.game_id))
        .limit(1)
        .execute()
    )
    # if exist then just input it
    if existing.data:
        return existing.data[0]

    response = (
        supabase.table("favorites")
        .insert({
            "user_id": str(user_id),
            "game_id": str(favorite.game_id),
        })
        .execute()
    )
    return response.data[0]

# deleting shit
@router.delete("/{game_id}")
def delete_favorite_game(game_id: UUID, user=Depends(get_current_user)):
    user_id = user.id
    # same as above checking first
    existing = (
        supabase.table("favorites")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("game_id", str(game_id))
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Favorite not found")

    (
        supabase.table("favorites")
        .delete()
        .eq("user_id", str(user_id))
        .eq("game_id", str(game_id))
        .execute()
    )
    return {"message": "Favorite deleted", "favorite": existing.data[0]}
