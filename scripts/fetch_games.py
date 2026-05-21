import os
import json
import requests
import time

from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env.local") #loads lang for .env.local

TWITCH_CLIENT_ID = os.getenv("TWITCH_CLIENT_ID")
TWITCH_CLIENT_SECRET = os.getenv("TWITCH_CLIENT_SECRET")
TWITCH_CLIENT_GRANT_TYPE = os.getenv("grant_type")

TWITCH_URL_TOKEN = "https://id.twitch.tv/oauth2/token"
IGDB_TOKEN = "https://api.igdb.com/v4/games"

LIMIT = 500 
SLEEP_SECONDS = 0.30

ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT_DIR / "data" / "raw"
OUTPUT_FILE = OUTPUT_DIR / "games_raw.json"

params = {
    "client_id": TWITCH_CLIENT_ID,
    "client_secret": TWITCH_CLIENT_SECRET,
    "grant_type": TWITCH_CLIENT_GRANT_TYPE,
}


def getAccessToken() -> str:
    if not TWITCH_CLIENT_ID or not TWITCH_CLIENT_SECRET:
        raise RuntimeError("Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in .env")
    
    response = requests.post(TWITCH_URL_TOKEN,params=params,timeout=30)
    response.raise_for_status()  #http status
    data = response.json()

    return data["access_token"]


def fetch_games_page(access_token: str, offset: int):
    headers = {
        "Client-ID": TWITCH_CLIENT_ID,
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    query = f"""
        fields
            id,
            name,
            summary,
            storyline,
            first_release_date,
            rating,
            aggregated_rating,
            total_rating,
            genres.name,
            themes.name,
            keywords.name,
            platforms.name,
            cover.url,
            screenshots.url;
        where name != null;
        sort id asc;
        limit {LIMIT};
        offset {offset};
    """

    response = requests.post(
        IGDB_TOKEN,
        headers = headers,
        data = query,
        timeout= 30,
    )

    response.raise_for_status()
    return response.json()



def fetch_all_games(max_pages: int = 14):
    access_token = getAccessToken()

    all_games = []
    offset = 0
    page = 1

    while True:
        print(f"Fetching page {page}, offset {offset}...")

        games = fetch_games_page(access_token, offset)

        if not games:
            print("No more games found.")
            break

        all_games.extend(games)

        if len(games) < LIMIT:
            print("Last page reached.")
            break

        if max_pages is not None and page >= max_pages:
            print(f"Stopped after {max_pages} page(s).")
            break

        offset += LIMIT
        page += 1

        time.sleep(SLEEP_SECONDS)

    return all_games


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # goes until there is none
    games = fetch_all_games(max_pages= 14)


    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(games, file, indent=2, ensure_ascii=False)

    print(f"Saved {len(games)} games to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()