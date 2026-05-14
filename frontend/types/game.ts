// Raw data from IGDB
export type RawGame = {
  id: number
  aggregated_rating: number
  cover: {
    id: number
    url: string
  }
  first_release_date: number
  genres: { id: number; name: string }[]
  keywords: { id: number; name: string }[]
}

// Data from the backend API
export type GameDTO = {
  game_id: string
  title: string
  description: string | null
  release_year: number | null
  external_rating: number | null
  avg_user_rating: number | null
  cover_image: string | null
  slug: string | null
}

export type GamesResponse = {
  count: number
  games: GameDTO[]
}