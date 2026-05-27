#same imports as usual

from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.database.supabase_client_backend import supabase_public
from app.schemas.reviewSchema import ReviewCreate, ReviewUpdate
from app.utils.auth import AuthContext, get_auth_context
from app.utils.supabase import first_row


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
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("reviews")
        .select("*")
        .eq("user_id", user_id)
        .order("date_updated", desc=True)
        .execute()
    )
    return response.data


@router.get("/{game_id}")
def get_my_review_for_game(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("reviews")
        .select("*")
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .limit(1)
        .execute()
    )

    return first_row(response, "Review not found", 404)

# posting
@router.post("")
def post_review(review: ReviewCreate, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    # check if existing game in that game 
    existing = (
        auth.supabase.table("reviews")
        .select("*")
        .eq("user_id", user_id)
        .eq("game_id", str(review.game_id))
        .limit(1)
        .execute()
    )

    if existing.data:
        raise HTTPException(status_code=409, detail="Review already exists")

    response = (
        auth.supabase.table("reviews")
        .insert({
            "user_id": user_id,
            "game_id": str(review.game_id),
            "rating": review.rating,
            "review_text": review.review_text,
            "likes": 0,
        })
        .execute()
    )
    return first_row(response, "Could not create review")

# updating  
@router.patch("/{game_id}")
def patch_review(
    game_id: UUID,
    review: ReviewUpdate,
    auth: AuthContext = Depends(get_auth_context),
):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("reviews")
        .update({
            "rating": review.rating,
            "review_text": review.review_text,
        })
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .execute()
    )

    return first_row(response, "Review not found", 404)

# Deleting
@router.delete("/{game_id}")
def delete_review(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("reviews")
        .delete()
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .execute()
    )

    deleted_review = first_row(response, "Review not found", 404)

    return {"message": "Review deleted", "review": deleted_review}
