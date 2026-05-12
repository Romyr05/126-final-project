import GameCard from "../landingPage/GameCard"
import type { JournalEntryDTO } from "@/types/journal"

type Props = {
  entry: JournalEntryDTO
}

export default function JournalEntryCard({ entry }: Props) {
  return (
    <div>
      {/* Game layer */}
      <GameCard
        gameId={entry.game.game_id}
        title={entry.game.title}
        imageStr={entry.game.cover_image ?? "/images/dummyGameImg.png"}
        rating={entry.game.avg_user_rating}
      />

      {/* Journal layer */}
      {entry.created_at && <p>{entry.created_at}</p>}

      <p>{entry.review}</p>

      {entry.rating !== null && (
        <p>My rating: ⭐ {entry.rating}</p>
      )}
    </div>
  )
}