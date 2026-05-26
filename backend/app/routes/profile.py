
from fastapi import APIRouter, Depends
from uuid import UUID
from app.utils.auth import AuthContext, get_auth_context

from app.services.profile import (
    get_profile_user,
    get_profile_favorites,
    get_profile_reviews,
    get_profile_stats,
)


router = APIRouter(prefix = "/profiles", tags = ["profile"])


@router.get("/me")
def get_my_profile(auth: AuthContext = Depends(get_auth_context)):
    return {
        "user": get_profile_user(auth),
        "stats": get_profile_stats(auth),
        "favorites": get_profile_favorites(auth),
        "recent_reviews": get_profile_reviews(auth),
    }