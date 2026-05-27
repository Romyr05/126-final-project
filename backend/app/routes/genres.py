from fastapi import APIRouter, HTTPException
import httpx

from app.database.supabase_client_backend import supabase_public

router = APIRouter(prefix="/genres", tags=["Genres"])


@router.get("")
def get_genres():
    try:
        response = (
            supabase_public
            .table("genres")
            .select("genre_id,name")
            .order("name")
            .execute()
        )
    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=503,
            detail="Supabase is not reachable. Start local Supabase with `npx supabase start` or check SUPABASE_URL.",
        ) from exc

    return {"genres": response.data}
