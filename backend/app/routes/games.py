from fastapi import APIRouter, HTTPException, Query
import httpx
from typing import Annotated, Literal
from app.database.supabase_client_backend import supabase_public
from uuid import UUID

router = APIRouter(prefix="/games", tags=["Games"])  #tags = Documentation purposes lang

GAME_SELECT = """
game_id,
igdb_id,
title,
description,
release_year,
external_rating,
avg_user_rating,
cover_image,
created_at,
updated_at,
slug,
game_genres(genres(name))
"""


def _execute_games_query(query):
    try:    
        return query.execute()
    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=503,
            detail="Supabase is not reachable. Start local Supabase with `npx supabase start` or check SUPABASE_URL.",
        ) from exc


def _genre_names(game: dict) -> list[str]:
    names = []

    for row in game.get("game_genres", []) or []:
        genre = row.get("genres")

        if isinstance(genre, dict) and genre.get("name"):
            names.append(genre["name"])

    return sorted(set(names))


def _format_game(game: dict) -> dict:
    formatted = game.copy()
    formatted["genres"] = _genre_names(game)
    formatted.pop("game_genres", None)
    return formatted


def _quality_score(game: dict) -> tuple[float, float]:
    avg_rating = float(game.get("avg_user_rating") or 0)
    external_rating = float(game.get("external_rating") or 0)
    return avg_rating, external_rating


def _sort_games(games: list[dict], sort: str, selected_genres: set[str]) -> list[dict]:
    def genre_match_count(game: dict) -> int:
        if not selected_genres:
            return 0

        game_genres = {genre.lower() for genre in _genre_names(game)}
        return len(game_genres.intersection(selected_genres))

    if sort == "title":
        return sorted(games, key=lambda game: (-genre_match_count(game), game["title"].lower()))

    if sort == "newest":
        return sorted(
            games,
            key=lambda game: (
                -genre_match_count(game),
                -(game.get("release_year") or 0),
                -_quality_score(game)[0],
                game["title"].lower(),
            ),
        )

    if sort == "rating":
        return sorted(
            games,
            key=lambda game: (
                -genre_match_count(game),
                -_quality_score(game)[0],
                -_quality_score(game)[1],
                game["title"].lower(),
            ),
        )

    return sorted(
        games,
        key=lambda game: (
            -genre_match_count(game),
            -_quality_score(game)[0],
            -_quality_score(game)[1],
            game["title"].lower(),
        ),
    )


def _get_games_response(
    limit: int,
    offset: int,
    q: str | None = None,
    genres: str | None = None,
    sort: str = "popularity",
):
    selected_genres = {
        genre.strip().lower()
        for genre in (genres or "").split(",")
        if genre.strip()
    }
    search_query = (q or "").strip().lower()

    response = _execute_games_query(
        supabase_public
        .table("games")
        .select(GAME_SELECT)
    )

    filtered_games = []

    for game in response.data:
        game_genres = _genre_names(game)
        game_genres_lower = {genre.lower() for genre in game_genres}

        if selected_genres and not game_genres_lower.intersection(selected_genres):
            continue

        if search_query:
            title_matches = search_query in game["title"].lower()
            genre_matches = any(search_query in genre for genre in game_genres_lower)

            if not title_matches and not genre_matches:
                continue

        filtered_games.append(game)

    sorted_games = _sort_games(filtered_games, sort, selected_genres)
    paged_games = sorted_games[offset:offset + limit]

    return {
        "count": len(filtered_games),
        "games": [_format_game(game) for game in paged_games],
    }


def _get_single_game(column: str, value):
    response = _execute_games_query(
        supabase_public
        .table("games")
        .select(GAME_SELECT)
        .eq(column, value)
        .limit(1)
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Game not found")

    return _format_game(response.data[0])


@router.get("")
def get_games(
    limit: Annotated[int, Query(ge=1, le=100)] = 20,  # int siya and has a default val or 20 but can be 1 to 100
    offset: Annotated[int, Query(ge=0)] = 0,
    q: Annotated[str | None, Query(min_length=1)] = None,
    genres: str | None = None,
    sort: Literal["popularity", "rating", "newest", "title"] = "popularity",
):
    return _get_games_response(limit, offset, q, genres, sort)


@router.get("/search")
def search_games(
    q: Annotated[str, Query(..., min_length =1 )], #... -> required siya
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
):
    response = _get_games_response(limit, 0, q)

    return {
        "query": q,
        "count": response["count"],
        "games": response["games"]
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
