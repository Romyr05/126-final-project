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