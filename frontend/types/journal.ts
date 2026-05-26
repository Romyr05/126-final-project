export type GameLog = {
  user_id: string
  game_id: string
  status: "playing" | "played" | "completed" | "dropped" | "wishlist"
}

export type GameLogWithDetails = {
  game_id: string
  status: "playing" | "played" | "completed" | "dropped" | "wishlist"
  title: string
  cover_image: string | null
  rating: number | null
  review_text: string | null
}