from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID

from app.database.supabase_client_backend import supabase_public
from app.schemas.listSchema import ListCreate, ListItemCreate, ListUpdate
from app.utils.auth import AuthContext, get_auth_context


router = APIRouter(prefix="/lists", tags=["Lists"])


def _get_list(client, list_id: UUID):
    response = (
        client.table("lists")
        .select("*")
        .eq("list_id", str(list_id))
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="List not found")

    return response.data[0]


def _get_owned_list(client, list_id: UUID, user_id: str):
    list_data = _get_list(client, list_id)

    if list_data["user_id"] != str(user_id):
        raise HTTPException(status_code=403, detail="You do not own this list")

    return list_data


def _get_readable_list(client, list_id: UUID, user_id: str):
    list_data = _get_list(client, list_id)

    if not list_data["is_public"] and list_data["user_id"] != str(user_id):
        raise HTTPException(status_code=403, detail="This list is private")

    return list_data


@router.get("")
def get_my_lists(auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("lists")
        .select("*")
        .order("updated_at", desc=True)
        .execute()
    )
    return response.data


@router.get("/public")
def get_public_lists():
    response = (
        supabase_public.table("lists")
        .select("*")
        .eq("is_public", True)
        .order("updated_at", desc=True)
        .execute()
    )
    return response.data


@router.get("/{list_id}")
def get_list(list_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    return _get_readable_list(auth.supabase, list_id, str(auth.user.id))


@router.get("/{list_id}/games")
def get_list_games(list_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    _get_readable_list(auth.supabase, list_id, str(auth.user.id))

    response = (
        auth.supabase.table("list_items")
        .select("*, games(*)")
        .eq("list_id", str(list_id))
        .order("added_at", desc=True)
        .execute()
    )
    return response.data


@router.post("")
def post_list(list_data: ListCreate, auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("lists")
        .insert({
            "user_id": str(auth.user.id),
            "list_name": list_data.list_name,
            "description": list_data.description,
            "is_public": list_data.is_public,
        })
        .execute()
    )
    return response.data[0]


@router.post("/{list_id}/games")
def post_list_game(
    list_id: UUID,
    list_item: ListItemCreate,
    auth: AuthContext = Depends(get_auth_context),
):
    _get_owned_list(auth.supabase, list_id, str(auth.user.id))

    existing = (
        auth.supabase.table("list_items")
        .select("*")
        .eq("list_id", str(list_id))
        .eq("game_id", str(list_item.game_id))
        .limit(1)
        .execute()
    )

    if existing.data:
        return existing.data[0]

    response = (
        auth.supabase.table("list_items")
        .insert({
            "list_id": str(list_id),
            "game_id": str(list_item.game_id),
        })
        .execute()
    )
    return response.data[0]


@router.patch("/{list_id}")
def patch_list(
    list_id: UUID,
    list_data: ListUpdate,
    auth: AuthContext = Depends(get_auth_context),
):
    _get_owned_list(auth.supabase, list_id, str(auth.user.id))

    update_data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if list_data.list_name is not None:
        update_data["list_name"] = list_data.list_name

    if list_data.description is not None:
        update_data["description"] = list_data.description

    if list_data.is_public is not None:
        update_data["is_public"] = list_data.is_public

    response = (
        auth.supabase.table("lists")
        .update(update_data)
        .eq("list_id", str(list_id))
        .execute()
    )
    return response.data[0]


@router.delete("/{list_id}/games/{game_id}")
def delete_list_game(
    list_id: UUID,
    game_id: UUID,
    auth: AuthContext = Depends(get_auth_context),
):
    _get_owned_list(auth.supabase, list_id, str(auth.user.id))

    response = (
        auth.supabase.table("list_items")
        .delete()
        .eq("list_id", str(list_id))
        .eq("game_id", str(game_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="List item not found")

    return {"message": "Game removed from list", "list_item": response.data[0]}


@router.delete("/{list_id}")
def delete_list(list_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    response = (
        auth.supabase.table("lists")
        .delete()
        .eq("list_id", str(list_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="List not found")

    return {"message": "List deleted", "list": response.data[0]}
