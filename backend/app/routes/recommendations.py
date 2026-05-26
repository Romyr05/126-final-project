from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.services.recommender import get_recommendations_for_user
from app.utils.auth import AuthContext, get_auth_context

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("")
def get_recommendations(
    limit: Annotated[int, Query(ge=1, le=50)] = 20, 
    auth: AuthContext = Depends(get_auth_context),  # need to be user
):
    user_id = str(auth.user.id)
    recommendations = get_recommendations_for_user(auth.supabase, user_id, limit)

    return {
        "count": len(recommendations),
        "recommendations": recommendations,
    }
