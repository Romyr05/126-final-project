import JournalEntryCard from "./JournalEntryCard"
import type { GameLogWithDetails } from "@/types/journal"

type Props = {
  entries: GameLogWithDetails[]
  onEdit: (entry: GameLogWithDetails) => void
  onDelete: (entry: GameLogWithDetails) => void
}

export default function JournalEntryList({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return <p className="text-white/40">No journal entries yet. Start logging games!</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <JournalEntryCard
          key={entry.game_id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}