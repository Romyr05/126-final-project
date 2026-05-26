import JournalEntryCard from "./JournalEntryCard"
import type { GameLogWithDetails } from "@/types/journal"

type Props = {
  entries: GameLogWithDetails[]
}

export default function JournalEntryList({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-white/40">No journal entries yet. Start logging games!</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <JournalEntryCard key={entry.game_id} entry={entry} />
      ))}
    </div>
  )
}