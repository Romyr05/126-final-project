
from fastapi import HTTPException
from uuid import UUID
from app.utils.auth import AuthContext




def user_id_syntax(auth: AuthContext) -> str:
    user_id = str(auth.user.id)

    return user_id

def get_profile_user(auth: AuthContext):
    user_id = user_id_syntax(auth)  #authenticated na already 

    response = (
        auth.supabase.table("users").select("username,user_id")
        .eq("user_id", user_id).limit(1).execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    profile = response.data[0]

    return {
        "user_id": profile["user_id"],
        "username": profile["username"],
        "email": auth.user.email,
    }


def get_profile_favorites(auth: AuthContext, limit: int = 4):
    user_id = user_id_syntax(auth)

    response = (
        auth.supabase.table("favorites").
        select("""favorite_id,
               created_at,
               games(game_id,title,cover_image)
               
               """).eq("user_id", user_id)
               .limit(limit).execute()
    )

    
    return [
        {
            "favorite_id": row["favorite_id"],
            "created_at": row["created_at"],
            "game": row["games"],
        }
        for row in response.data or []
    ]
        
    
    
def get_profile_reviews(auth: AuthContext,limit:int =4):
    user_id = user_id_syntax(auth)

    response = (
        auth.supabase.table("reviews").select("""  
            review_id , rating, review_text, date_updated,
            games(game_id,title,cover_image)""")
    ).eq("user_id", user_id).order("date_updated", desc= True).limit(limit).execute()

    return [
        {
            "review_id": row["review_id"],
            "rating": row["rating"],
            "review_text": row["review_text"],
            "date_updated": row["date_updated"],
            "game": row["games"],  #reason why need 
        }
        for row in response.data or []
    ]


def get_profile_stats(auth: AuthContext):
    user_id = user_id_syntax(auth)
    
    logs = (
        auth.supabase.table("game_logs")
        .select("status")
        .eq("user_id", user_id)
        .execute()
    )


    reviews = (
        auth.supabase.table("reviews")
        .select("rating")
        .eq("user_id", user_id)
        .execute()
    )

    

    log_rows = logs.data or []
    review_rows = reviews.data or []

    avg_rating = 0

    if review_rows:
        avg_rating = sum(row["rating"] for row in review_rows) / len(review_rows)
        avg_rating = round(avg_rating,1)


    len_log = 0
    for log in log_rows:
        if log["status"] == "completed":
            len_log +=1


    return {
        "logged": len(log_rows),
        "completed": len_log,
        "avg_rating": avg_rating,
    }
