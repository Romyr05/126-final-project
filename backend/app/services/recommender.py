STATUS_WEIGHTS = {
    "completed": 3,
    "playing": 2,
    "wishlist": 1,
    "played": 1,
    "dropped": -4,
}

GENRE_WEIGHT = 2.0
TAG_WEIGHT = 1.0
LIMIT_GAMES = 500


def get_recommendations_for_user(supabase, user_id: str, limit: int = 20):
    activity = fetch_user_activity(supabase, user_id)

    # no games reviewed yet
    if not activity["game_ids"]:
        return get_cold_start_recommendations(supabase, limit)

    profile = build_preference_profile(supabase, activity)

    #games allowed to be rated (format below)
    candidates = fetch_candidate_games(
        supabase,
        excluded_game_ids=activity["game_ids"],
        number_games_limit=LIMIT_GAMES,
    )

    #score the games accordingly 
    scored_games = score_candidates(candidates, profile)

    if not scored_games:
        return get_cold_start_recommendations(supabase, limit)

    return scored_games[:limit]


def fetch_user_activity(supabase, user_id: str):
    reviews = (
        supabase.table("reviews")
        .select("game_id,rating")
        .eq("user_id", user_id)
        .execute()
        .data
    )

    favorites = (
        supabase.table("favorites")
        .select("game_id")
        .eq("user_id", user_id)
        .execute()
        .data
    )

    logs = (
        supabase.table("game_logs")
        .select("game_id,status")
        .eq("user_id", user_id)
        .execute()
        .data
    )

    game_weights = {}

    # added 5 if not there
    for row in favorites:
        add_game_weight(game_weights, row["game_id"], 5)

    for row in reviews:
        add_game_weight(game_weights, row["game_id"], get_rating_weight(row["rating"]))


    for row in logs:
        add_game_weight(
            game_weights,
            row["game_id"],
            STATUS_WEIGHTS.get(row["status"], 0),  # check if what user put here
        )

    return {
        "game_weights": game_weights,  #value 
        "game_ids": list(game_weights.keys()),  #id 
    }


# add weights even if there is already , default -> 0
def add_game_weight(game_weights, game_id, weight):
    game_weights[game_id] = game_weights.get(game_id, 0) + weight


def get_rating_weight(rating):
    if rating == 5:
        return 5

    if rating == 4:
        return 3

    if rating == 3:
        return 1

    return -3


def build_preference_profile(supabase, activity):
    game_ids = activity["game_ids"]
    game_weights = activity["game_weights"]

    #get genre and tags for games already reviewed
    # with id and the genre / tags
    genre_rows = (
        supabase.table("game_genres")
        .select("game_id,genres(name)")
        .in_("game_id", game_ids)  # user check games
        .execute()
        .data
    )

    tag_rows = (
        supabase.table("game_tags")
        .select("game_id,tags(name)")
        .in_("game_id", game_ids)
        .execute()
        .data
    )

    genre_weights = {}
    tag_weights = {}

    for row in genre_rows:
        genre_name = get_name(row, "genres")  # get the name in rows

        if genre_name:
            add_game_weight(
                genre_weights,
                genre_name,
                game_weights.get(row["game_id"], 0),
            )

    for row in tag_rows:
        tag_name = get_name(row, "tags") # get then name i ntags

        if tag_name: 
            add_game_weight(
                tag_weights,
                tag_name,
                game_weights.get(row["game_id"], 0),   # get game weight
            )

    return {
        "genres": genre_weights,
        "tags": tag_weights,
    }


# get name in relation to the relation name (tags and genre)
def get_name(row, relation_name):
    relation = row.get(relation_name)   

    if not relation:
        return None

    return relation.get("name")


def fetch_candidate_games(supabase, excluded_game_ids, number_games_limit=LIMIT_GAMES):
    excluded = set(excluded_game_ids)  # user games 

    response = (
        supabase.table("games")
        .select(
            """
            game_id,
            title,
            description,
            release_year,
            external_rating,
            avg_user_rating,
            cover_image,
            game_genres(genres(name)),
            game_tags(tags(name))
            """
        )
        .order("avg_user_rating", desc=True)
        .order("external_rating", desc=True)
        .limit(number_games_limit)
        .execute()
    )

    return [game for game in response.data if game["game_id"] not in excluded]  
    #games not in users


def score_candidates(candidates, profile):
    scored_games = []

    for game in candidates:
        matched_genres, genre_score = score_relation_matches(
            game.get("game_genres", []), 
            "genres",
            profile["genres"],  #get the score in genres
            GENRE_WEIGHT, 
        )
        matched_tags, tag_score = score_relation_matches(
            game.get("game_tags", []),
            "tags",
            profile["tags"], # score
            TAG_WEIGHT,
        )

        rating_score = get_quality_score(game)
        final_score = genre_score + tag_score + rating_score

        if final_score <= 0:
            continue

        recommended_game = game.copy()

        recommended_game["score"] = round(final_score, 2)
        recommended_game["matched_genres"] = matched_genres
        recommended_game["matched_tags"] = matched_tags

        scored_games.append(recommended_game)

    return sorted(scored_games, key=lambda game: game["score"], reverse=True)


def score_relation_matches(rows, relation_name, preference_weights, multiplier):
    matched_names = []
    score = 0

    for row in rows:
        name = get_name(row, relation_name) # return either genre or tags  
        weight = preference_weights.get(name, 0)   # score 

        if weight == 0:
            continue

        if weight > 0:
            matched_names.append(name)

        score += weight * multiplier

    return matched_names, score


def get_quality_score(game):
    external_rating = game.get("external_rating") or 0
    avg_user_rating = game.get("avg_user_rating") or 0

    return (float(external_rating) / 20) + float(avg_user_rating)


#cold start games based on user rating and external
def get_cold_start_recommendations(supabase, limit: int = 20):
    response = (
        supabase.table("games")
        .select(
            """
            game_id,
            title,
            description,
            release_year,
            external_rating,
            avg_user_rating,
            cover_image
            """
        )
        .order("avg_user_rating", desc=True)
        .order("external_rating", desc=True)
        .limit(limit)
        .execute()
    )

    recommended_games = []

    for game in response.data:
        recommended_game = game.copy()

        recommended_game["score"] = round(get_quality_score(game), 2)
        recommended_game["matched_genres"] = []
        recommended_game["matched_tags"] = []

        recommended_games.append(recommended_game)

    return recommended_games
