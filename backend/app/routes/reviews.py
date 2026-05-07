#same imports as usual

from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.database.supabase_client_backend import supabase
from app.schemas.reviewSchema import ReviewCreate, ReviewUpdate
from app.utils.auth import get_current_user


router = APIRouter(prefix = "/reviews", tags = ["Reviews"])

#getting
@router.get("/game/{game_id}")
def get_review_by_game(game_id: UUID):
    response = (
        supabase.table("reviews")
        .select("*")
        .eq("game_id", str(game_id))
        .order("date_updated", desc=True)
        .execute()
    )
    return response.data


@router.get("/me")
def get_my_reviews(user = Depends(get_current_user)):
    user_id = user.id
    response = (
        supabase.table("reviews")
        .select("*")
        .eq("user_id", str(user_id))
        .order("date_updated", desc=True)
        .execute()
    )
    return response.data


@router.get("/{game_id}")
def get_my_review_for_game(game_id: UUID, user = Depends(get_current_user)):
    user_id = user.id
    response = (
        supabase.table("reviews")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("game_id", str(game_id))
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Review not found")

    return response.data[0]

# posting
@router.post("")
def post_review(review: ReviewCreate, user = Depends(get_current_user)):
    user_id = user.id
    # check if existing game in that game 
    existing = (
        supabase.table("reviews")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("game_id", str(review.game_id))
        .limit(1)
        .execute()
    )

    if existing.data:
        raise HTTPException(status_code=409, detail="Review already exists")

    response = (
        supabase.table("reviews")
        .insert({
            "user_id": str(user_id),
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
def patch_review(game_id: UUID, review: ReviewUpdate, user = Depends(get_current_user)):
    user_id = user.id
    response = (
        supabase.table("reviews")
        .update({
            "rating": review.rating,
            "review_text": review.review_text,
        })
        .eq("user_id", str(user_id))
        .eq("game_id", str(game_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Review not found")

    return response.data[0]

# Deleting
@router.delete("/{game_id}")
def delete_review(game_id: UUID, user = Depends(get_current_user)):
    user_id = user.id
    response = (
        supabase.table("reviews")
        .delete()
        .eq("user_id", str(user_id))
        .eq("game_id", str(game_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review deleted", "review": response.data[0]}
