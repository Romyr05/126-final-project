export type GameLog = {
  user_id: string
  game_id: string
  status: "playing" | "played" | "completed" | "dropped" | "wishlist"
  date_logged?: string
  updated_at?: string
}

export type GameLogWithDetails = {
  game_id: string
  status: "playing" | "played" | "completed" | "dropped" | "wishlist"
  title: string
  cover_image: string | null
  rating: number | null
  review_text: string | null
  date_logged?: string
  updated_at?: string
}

export type JournalReview = {
  review_id: string
  game_id: string
  rating: number
  review_text: string | null
  date_updated: string
}

export type JournalReviewWithGame = JournalReview & {
  title: string
  cover_image: string | null
}
