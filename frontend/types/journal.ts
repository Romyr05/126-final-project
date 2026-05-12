import type { GameDTO } from "./game"

export type JournalEntryDTO = {
  id: string
  game: GameDTO
  review: string
  rating: number | null
  created_at: string | null
}