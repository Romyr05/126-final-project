#same imports as usual

from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.database.supabase_client_backend import supabase_public
from app.schemas.reviewSchema import ReviewCreate, ReviewUpdate
from app.utils.auth import AuthContext, get_auth_context


router = APIRouter(prefix = "/reviews", tags = ["Reviews"])

#getting
@router.get("/game/{game_id}")
def get_review_by_game(game_id: UUID):
    response = (
        supabase_public.table("reviews")
        .select("*")
        .eq("game_id", str(game_id))
        .order("date_updated", desc=True)
        .execute()
    )
    return response.data


@router.get("/me")
def get_my_reviews(auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("reviews")
        .select("*")
        .order("date_updated", desc=True)
        .execute()
    )
    return response.data


@router.get("/{game_id}")
def get_my_review_for_game(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("reviews")
        .select("*")
        .eq("game_id", str(game_id))
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Review not found")

    return response.data[0]

# posting
@router.post("")
def post_review(review: ReviewCreate, auth: AuthContext = Depends(get_auth_context)):
    # check if existing game in that game 
    existing = (
        auth.supabase.table("reviews")
        .select("*")
        .eq("game_id", str(review.game_id))
        .limit(1)
        .execute()
    )

    if existing.data:
        raise HTTPException(status_code=409, detail="Review already exists")

    response = (
        auth.supabase.table("reviews")
        .insert({
            "user_id": str(auth.user.id),
            "game_id": str(review.game_id),
            "rating": review.rating,
            "review_text": review.review_text,
            "likes": 0,
        })
        .execute()
    )
    return response.data[0]

# updating
@router.patch("/{game_id}")
def patch_review(
    game_id: UUID,
    review: ReviewUpdate,
    auth: AuthContext = Depends(get_auth_context),
):
    response = (
        auth.supabase.table("reviews")
        .update({
            "rating": review.rating,
            "review_text": review.review_text,
        })
        .eq("game_id", str(game_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Review not found")

    return response.data[0]

# Deleting
@router.delete("/{game_id}")
def delete_review(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("reviews")
        .delete()
        .eq("game_id", str(game_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review deleted", "review": response.data[0]}
