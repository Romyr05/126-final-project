import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from postgrest.types import ReturnMethod


BASE_DIR = Path(__file__).resolve().parents[1]
RAW_FILE = BASE_DIR / "data" / "raw" / "games_raw.json"
DEFAULT_BATCH_SIZE = 250
DEFAULT_LINK_BATCH_SIZE = 1000
LOOKUP_BATCH_SIZE = 200

for path in ("", str(BASE_DIR)):
    if path in sys.path:
        sys.path.remove(path)

from supabase import create_client


load_dotenv(Path(__file__).parent / ".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# Splits a list into smaller batches so Supabase requests do not send too many
# rows at once. Each yielded value is a slice of the original list.
def chunked(items, size):
    for index in range(0, len(items), size):
        yield items[index:index + size]


# Cleans text fields from the raw IGDB data by converting the value to a
# string, trimming outer spaces, and collapsing repeated whitespace.
def clean_text(value):
    if value is None:
        return None

    cleaned = " ".join(str(value).strip().split())

    if not cleaned:
        return None

    return cleaned


# Normalizes names used for genres, tags, themes, and platforms. It reuses
# clean_text first, then lowercases the result so duplicate names match.
def clean_name(value):
    cleaned = clean_text(value)

    if cleaned is None:
        return None

    return cleaned.lower()


# Converts an IGDB Unix timestamp into a release year. Invalid or missing
# timestamps are ignored by returning None.
def unix_to_year(timestamp):
    if timestamp is None:
        return None

    try:
        return datetime.fromtimestamp(timestamp, timezone.utc).year
    except Exception:
        return None


# Returns the first value that is not None. This is used when the script has
# multiple possible source fields for the same final value.
def first_present(*values):
    for value in values:
        if value is not None:
            return value

    return None


# Converts a raw rating value into a float rounded to two decimal places.
# Bad values are ignored so one invalid rating does not stop normalization.
def clean_rating(value):
    if value is None:
        return None


def make_game_slug(title, igdb_id):
    slug_source = f"{title}-{igdb_id}"
    slug = re.sub(r"[^a-z0-9]+", "-", slug_source.lower()).strip("-")

    return slug or f"game-{igdb_id}"

    try:
        return round(float(value), 2)
    except (TypeError, ValueError):
        return None


# Extracts the cover image URL from IGDB cover data. IGDB may return protocol-
# relative URLs, so this also adds https and asks for a larger cover size.
def get_cover_url(cover):
    if not cover:
        return None

    url = cover.get("url")

    if not url:
        return None

    if url.startswith("//"):
        url = "https:" + url

    return url.replace("t_thumb", "t_cover_big")


# Builds the row that will be upserted into the games table. Games without an
# IGDB id or title are skipped because those fields are required.
def normalize_game_payload(game):
    igdb_id = game.get("id")
    title = clean_text(game.get("name"))

    if igdb_id is None or title is None:
        return None

    return {
        "igdb_id": igdb_id,
        "title": title,
        "description": clean_text(game.get("summary") or game.get("storyline")),
        "release_year": unix_to_year(game.get("first_release_date")),
        "external_rating": clean_rating(
            first_present(
                game.get("total_rating"),
                game.get("rating"),
                game.get("aggregated_rating"),
            ) #none if empty
        ),
        "cover_image": get_cover_url(game.get("cover")),
        "slug": make_game_slug(title, igdb_id),
    }


# Collects a unique set of cleaned names from IGDB objects that have a "name"
# field, such as genres, themes, keywords, or platforms.
def collect_names(items):
    names = set()

    for item in items:
        name = clean_name(item.get("name"))

        if name is not None:
            names.add(name)

    return names


# Combines IGDB keywords, themes, and platforms into app tags. Each source is
# normalized into lowercase names so they can be stored in one tags table.
def collect_tag_names(game):
    tag_sources = []
    tag_sources.extend(game.get("keywords", []))
    tag_sources.extend(game.get("themes", []))
    tag_sources.extend(game.get("platforms", []))

    return collect_names(tag_sources)


# Upserts rows into a Supabase table in batches. The on_conflict argument tells
# Supabase which unique column or columns should be used to avoid duplicates.
def upsert_rows(table, rows, on_conflict, batch_size):
    if not rows:
        return

    for rows_chunk in chunked(rows, batch_size):
        (
            supabase
            .table(table)
            .upsert(
                rows_chunk,
                on_conflict=on_conflict,
                returning=ReturnMethod.minimal,
            )
            .execute()
        )


# Looks up database ids for a list of known values, such as genre names or
# IGDB ids. It returns a dictionary where each lookup value maps to its id.
def select_ids(table, id_column, lookup_column, values):
    id_by_value = {}
    values = list(values)

    for values_chunk in chunked(values, LOOKUP_BATCH_SIZE):
        result = (
            supabase
            .table(table)
            .select(f"{id_column},{lookup_column}")
            .in_(lookup_column, values_chunk)
            .execute()
        )

        for row in result.data:
            id_by_value[row[lookup_column]] = row[id_column]

    return id_by_value


# Inserts or updates normalized game rows, then fetches their internal game_id
# values so the script can create genre and tag link rows.
def upsert_games(game_payloads, batch_size):
    upsert_rows("games", game_payloads, "igdb_id", batch_size)
    igdb_ids = [game["igdb_id"] for game in game_payloads]

    return select_ids("games", "game_id", "igdb_id", igdb_ids)


# Inserts any genre or tag names that are not already in the local cache, then
# refreshes the cache with their database ids for later relationship inserts.
def upsert_names(table, id_column, names, cache, batch_size):
    missing_names = sorted(name for name in names if name not in cache)

    if not missing_names:
        return

    rows = [{"name": name} for name in missing_names]
    upsert_rows(table, rows, "name", batch_size)
    cache.update(select_ids(table, id_column, "name", missing_names))


# Removes duplicate relationship rows before upserting them into join tables
# like game_genres and game_tags.
def upsert_links(table, rows, on_conflict, batch_size):
    unique_rows = [dict(row) for row in {tuple(sorted(row.items())) for row in rows}]
    upsert_rows(table, unique_rows, on_conflict, batch_size)


# Normalizes one batch of raw IGDB games. It prepares game rows, collects genre
# and tag names, upserts lookup tables, then writes game-genre and game-tag links.
def normalize_batch(games, genre_cache, tag_cache, batch_size, link_batch_size):
    game_payloads = []
    genre_names_by_igdb_id = {}
    tag_names_by_igdb_id = {}
    all_genre_names = set()
    all_tag_names = set()

    for game in games:
        payload = normalize_game_payload(game)

        if payload is None:
            continue

        igdb_id = payload["igdb_id"]
        genre_names = collect_names(game.get("genres", []))
        tag_names = collect_tag_names(game)

        game_payloads.append(payload)
        genre_names_by_igdb_id[igdb_id] = genre_names
        tag_names_by_igdb_id[igdb_id] = tag_names
        all_genre_names.update(genre_names)
        all_tag_names.update(tag_names)

    if not game_payloads:
        return 0, 0, 0

    game_ids_by_igdb_id = upsert_games(game_payloads, batch_size)
    upsert_names("genres", "genre_id", all_genre_names, genre_cache, batch_size)
    upsert_names("tags", "tag_id", all_tag_names, tag_cache, batch_size)

    game_genre_rows = []
    game_tag_rows = []

    for igdb_id, genre_names in genre_names_by_igdb_id.items():
        game_id = game_ids_by_igdb_id.get(igdb_id)

        if game_id is None:
            continue

        for genre_name in genre_names:
            genre_id = genre_cache.get(genre_name)

            if genre_id is not None:
                game_genre_rows.append({
                    "game_id": game_id,
                    "genre_id": genre_id,
                })

    for igdb_id, tag_names in tag_names_by_igdb_id.items():
        game_id = game_ids_by_igdb_id.get(igdb_id)

        if game_id is None:
            continue

        for tag_name in tag_names:
            tag_id = tag_cache.get(tag_name)

            if tag_id is not None:
                game_tag_rows.append({
                    "game_id": game_id,
                    "tag_id": tag_id,
                })

    upsert_links(
        "game_genres",
        game_genre_rows,
        "game_id,genre_id",
        link_batch_size,
    )
    upsert_links(
        "game_tags",
        game_tag_rows,
        "game_id,tag_id",
        link_batch_size,
    )

    return len(game_payloads), len(game_genre_rows), len(game_tag_rows)


# Converts a number of seconds into a readable duration string for progress

def format_duration(seconds):
    seconds = int(seconds)
    hours, seconds = divmod(seconds, 3600)
    minutes, seconds = divmod(seconds, 60)

    if hours:
        return f"{hours}h {minutes}m {seconds}s"

    if minutes:
        return f"{minutes}m {seconds}s"

    return f"{seconds}s"


# Defines and reads command-line options for the normalization script, including
# limits, offsets, and batch sizes.
def parse_args():
    parser = argparse.ArgumentParser(
        description="Normalize IGDB game data into Supabase in batches."
    )
    parser.add_argument("--limit", type=int, help="Only process this many games.")
    parser.add_argument(
        "--offset",
        type=int,
        default=0,
        help="Skip this many games from the raw file before processing.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help="Rows per Supabase upsert/select batch.",
    )
    parser.add_argument(
        "--link-batch-size",
        type=int,
        default=DEFAULT_LINK_BATCH_SIZE,
        help="Rows per game_genres/game_tags upsert batch.",
    )

    return parser.parse_args()


# Runs the full normalization process. It loads raw games from disk, applies the
# requested offset/limit, processes games in batches, and prints progress stats.
def main():
    args = parse_args()

    with open(RAW_FILE, "r", encoding="utf-8") as file:
        games = json.load(file)

    selected_games = games[args.offset:]

    if args.limit is not None:
        selected_games = selected_games[:args.limit]

    total = len(selected_games)

    if total == 0:
        print("No games to normalize.")
        return

    genre_cache = {}
    tag_cache = {}
    normalized_games = 0
    linked_genres = 0
    linked_tags = 0
    start_time = time.monotonic()

    print(
        f"Normalizing {total} games "
        f"in batches of {args.batch_size}..."
    )

    for batch_number, games_batch in enumerate(
        chunked(selected_games, args.batch_size),
        start=1,
    ):
        games_count, genres_count, tags_count = normalize_batch(
            games_batch,
            genre_cache,
            tag_cache,
            args.batch_size,
            args.link_batch_size,
        )

        normalized_games += games_count
        linked_genres += genres_count
        linked_tags += tags_count

        elapsed = time.monotonic() - start_time
        rate = normalized_games / elapsed if elapsed else 0
        remaining = total - min(batch_number * args.batch_size, total)
        eta = remaining / rate if rate else 0

        print(
            f"Batch {batch_number}: "
            f"{min(batch_number * args.batch_size, total)}/{total} scanned, "
            f"{normalized_games} games upserted, "
            f"{linked_genres} genre links, "
            f"{linked_tags} tag links, "
            f"{rate:.1f} games/s, "
            f"ETA {format_duration(eta)}"
        )

    elapsed = time.monotonic() - start_time
    print(
        f"Done in {format_duration(elapsed)}. "
        f"Upserted {normalized_games} games, "
        f"{linked_genres} genre links, and {linked_tags} tag links."
    )


if __name__ == "__main__":
    main()
