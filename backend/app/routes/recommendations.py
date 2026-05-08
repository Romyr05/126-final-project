from fastapi import APIRouter


router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

#TBD if recommendation system is done
@router.get("")
def get_recommendations():
    return ("TBD")
