# Catalog Redesign Changes

## Summary

The catalog page was redesigned to match the VAULT mockup and now supports backend-driven genres, live search, sorting, and pagination.

## Backend Changes

- Added `GET /genres`.
  - Returns real genre rows from Supabase.
  - Response shape: `{ "genres": [{ "genre_id": string, "name": string }] }`.
- Updated `GET /games`.
  - Supports `q`, `genres`, `sort`, `limit`, and `offset`.
  - Search matches game titles and genre names.
  - Genre filtering ranks games with more selected genre matches first.
  - Sort options: `popularity`, `rating`, `newest`, `title`.
  - Game responses now include `genres: string[]`.
- Kept `/games/search` working by routing it through the updated games query logic.
- Preserved the existing clear `503` response when Supabase is unreachable.

## Frontend Changes

- Rebuilt `/catalog` around one query state:
  - search text
  - selected genres
  - sort mode
  - offset
  - loading/error state
  - total result count
- Added live search with a short debounce and request cancellation.
- Replaced `Load More` browsing with numbered pagination.
- Fetches genres from the backend instead of using a hardcoded genre list.
- Uses real `game.genres` in catalog cards.
- Catalog cards no longer render cover images, descriptions, or release-year text.
- Ratings are normalized for card display, so external ratings like `95` appear as `9.5`.
- Long game titles use smaller text sizes and safe wrapping to avoid overflow.

## UI Changes

- Catalog now follows the VAULT mockup structure:
  - compact `Game Catalog` title
  - search input on the left
  - sort control on the right
  - genre sidebar with `All Games`
  - dense responsive game grid
  - previous/next and numbered pagination controls
- Card grid targets:
  - 5 columns on wide desktop
  - 3 columns on tablet
  - 1-2 columns on smaller screens
- Game cards show:
  - rating
  - title
  - first two genres
- Cards keep a dark empty poster area to match the VAULT mockup, with details pinned near the bottom.

## Latest Card Display Update

- Simplified each catalog card to only display the game name, genre tags, and rating.
- Removed all image and description content from the visible card details.
- Title font size now scales down by title length to reduce overflow.
