from fastapi import APIRouter, HTTPException, Query
from typing import Annotated
from app.database.supabase_client_backend import supabase
from uuid import UUID

router = APIRouter(prefix="/games", tags=["Games"])  #tags = Documentation purposes lang


def _get_single_game(column: str, value):
    response = (
        supabase
        .table("games")
        .select("*")
        .eq(column, value)
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Game not found")

    return response.data[0]


@router.get("")
def get_games(
    limit: Annotated[int, Query(ge=1, le=100)] = 20,  # int siya and has a default val or 20 but can be 1 to 100
    offset: Annotated[int, Query(ge=0)] = 0,
):
    response = (
        supabase.table("games").select("*").range(offset, offset + limit - 1).execute()
        #from 0 to limit so if limit = 20 then 0 to 19 so 20
    )
    return {
        "count": len(response.data),
        "games": response.data
    }


@router.get("/search")
def search_games(
    q: Annotated[str, Query(..., min_length =1 )], #... -> required siya
    limit: Annotated[int, Query(ge=1, le=100)] = 20
):
    response = (
        supabase.table("games").select("*").ilike("title", f"%{q}%").limit(limit).execute()
    )

    return {
        "query": q,
        "count": len(response.data),
        "games": response.data
    }

@router.get("/slug/{slug}")
def get_game_by_slug(slug: str):
    return _get_single_game("slug", slug)


@router.get("/igdb/{igdb_id}")
def get_game_by_igdb(igdb_id: int):
    return _get_single_game("igdb_id", igdb_id)


@router.get("/{game_id}")
def get_game_by_id(game_id: UUID):
    return _get_single_game("game_id", str(game_id))
