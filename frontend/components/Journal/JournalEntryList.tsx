/*
this is a component that renders a list of journal entries
makes use of the JournalEntryCard component
*/

import JournalEntryCard from "./JournalEntryCard"
import type { JournalEntryDTO } from "@/types/journal"

type Props = {
  entries: JournalEntryDTO[]
}

export default function JournalEntryList({ entries }: Props) {
  return (
    <div>
      {entries.map((entry) => (
        <JournalEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}