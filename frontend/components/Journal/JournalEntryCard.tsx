import Image from "next/image"
import type { GameLogWithDetails } from "@/types/journal"

type Props = {
  entry: GameLogWithDetails
}

const statusColors: Record<GameLogWithDetails["status"], string> = {
  playing: "bg-blue-500/20 text-blue-300",
  played: "bg-gray-500/20 text-gray-300",
  completed: "bg-green-500/20 text-green-300",
  dropped: "bg-red-500/20 text-red-300",
  wishlist: "bg-yellow-500/20 text-yellow-300",
}

export default function JournalEntryCard({ entry }: Props) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <Image
        src={entry.cover_image ?? "/images/dummyGameImg.png"}
        alt={entry.title}
        width={60}
        height={80}
        className="rounded-lg object-cover shrink-0"
      />
      <div className="flex flex-col gap-1 justify-center">
        <h2 className="text-white font-semibold">{entry.title}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusColors[entry.status]}`}>
          {entry.status}
        </span>
        {entry.rating && (
          <p className="text-yellow-400 text-sm">
            {"★".repeat(entry.rating)}{"☆".repeat(5 - entry.rating)}
          </p>
        )}
        {entry.review_text && (
          <p className="text-white/50 text-sm">{entry.review_text}</p>
        )}
      </div>
    </div>
  )
}