from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.schemas.favoriteSchema import FavoriteCreate
from app.utils.auth import AuthContext, get_auth_context
from app.utils.supabase import first_row


router = APIRouter(prefix="/favorites", tags=["Favorites"])

# getting 
@router.get("")
def get_user_favorites(auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("favorites")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    return response.data


@router.get("/{game_id}")
def get_favorite_game(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("favorites")
        .select("*")
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .limit(1)
        .execute()
    )

    return first_row(response, "Favorite not found", 404)

# posting 
@router.post("")
def post_favorite_game(favorite: FavoriteCreate, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    # this just check if same game already exist
    existing = (
        auth.supabase.table("favorites")
        .select("*")
        .eq("user_id", user_id)
        .eq("game_id", str(favorite.game_id))
        .limit(1)
        .execute()
    )
    # if exist then just input it
    if existing.data:
        return existing.data[0]

    response = (
        auth.supabase.table("favorites")
        .insert({
            "user_id": user_id,
            "game_id": str(favorite.game_id),
        })
        .execute()
    )
    return first_row(response, "Could not create favorite")

# deleting shit
@router.delete("/{game_id}")
def delete_favorite_game(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    # same as above checking first
    existing = (
        auth.supabase.table("favorites")
        .select("*")
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Favorite not found")

    delete_response = (
        auth.supabase.table("favorites")
        .delete()
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .execute()
    )
    deleted_favorite = first_row(delete_response, "Favorite not found", 404)

    return {"message": "Favorite deleted", "favorite": deleted_favorite}
