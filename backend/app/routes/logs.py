# in logs we can read, post ,delete

from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
from app.utils.auth import AuthContext, get_auth_context
from app.schemas.logSchema import LogCreate


router = APIRouter(prefix ="/logs", tags = ["Logs"])


#getting shit
@router.get("")
def get_user_log(auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)
    response = auth.supabase.table("game_logs").select("*").eq("user_id", user_id).execute()
    return response.data

@router.get("/status/{status}")
def get_game_by_status(status: str, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("game_logs").select("*").
        eq("user_id", user_id).
        eq("status", status).execute()
    )
    return response.data


@router.get("/{game_id}")
def get_game_log(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("game_logs").select("*").
        eq("user_id", user_id).
        eq("game_id", str(game_id)).
        limit(1).execute()
    )
    return response.data


# post
@router.post("")
def post_log_game(log: LogCreate, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("game_logs")
        .upsert({        #upsert since update if there insert if not
            "user_id": user_id,
            "game_id": str(log.game_id),
            "status": log.status,
        }, on_conflict="user_id,game_id")
        .execute()
    )
    return response.data[0]




# update
@router.patch("/{game_id}")
def patch_log_game(
    game_id: UUID,
    log: LogCreate,
    auth: AuthContext = Depends(get_auth_context),
):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("game_logs")
        .update({"status": log.status})
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Game log not found")

    return response.data[0]  # this is one {} from the list




# delete
@router.delete("/{game_id}")
def delete_log_game(game_id: UUID, auth: AuthContext = Depends(get_auth_context)):
    user_id = str(auth.user.id)

    response = (
        auth.supabase.table("game_logs")
        .delete()
        .eq("user_id", user_id)
        .eq("game_id", str(game_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Game log not found")

    return {"message": "Game log deleted", "log": response.data[0]}
