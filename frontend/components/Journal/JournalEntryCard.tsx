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
  const loggedDate = entry.updated_at ?? entry.date_logged

  return (
    <article className="group overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--vault-purple)]">
      <div className="relative aspect-[3/4] bg-[var(--vault-bg-soft)]">
        <Image
          src={entry.cover_image ?? "/images/dummyGameImg.png"}
          alt={`${entry.title} cover`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--vault-surface)] to-transparent" />
        <span className={`absolute right-2 top-2 rounded-sm px-2 py-1 text-[10px] font-black uppercase tracking-wide ${statusColors[entry.status]}`}>
          {entry.status}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h2 className="line-clamp-2 min-h-10 text-sm font-bold leading-tight text-[var(--vault-text)]">
          {entry.title}
        </h2>

        <div className="flex min-h-5 items-center justify-between gap-2 text-xs">
          {entry.rating ? (
            <span className="text-[var(--vault-purple)]">
              {"★".repeat(entry.rating)}{"☆".repeat(5 - entry.rating)}
            </span>
          ) : (
            <span className="text-[var(--vault-muted-strong)]">No rating yet</span>
          )}

          {loggedDate ? (
            <time className="shrink-0 text-[10px] text-[var(--vault-muted-strong)]">
              {formatShortDate(loggedDate)}
            </time>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}
