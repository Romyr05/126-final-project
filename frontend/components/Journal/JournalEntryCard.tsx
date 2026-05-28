import Image from "next/image"
import { Pencil, Trash2 } from "lucide-react"
import type { GameLogWithDetails } from "@/types/journal"

type Props = {
  entry: GameLogWithDetails
  onEdit: (entry: GameLogWithDetails) => void
  onDelete: (entry: GameLogWithDetails) => void
}

const statusColors: Record<GameLogWithDetails["status"], string> = {
  playing: "border-blue-300/70 bg-blue-950/90 text-blue-100",
  played: "border-gray-300/70 bg-gray-950/90 text-gray-100",
  completed: "border-green-300/70 bg-green-950/90 text-green-100",
  dropped: "border-red-300/70 bg-red-950/90 text-red-100",
  wishlist: "border-yellow-300/70 bg-yellow-950/90 text-yellow-100",
}

export default function JournalEntryCard({ entry, onEdit, onDelete }: Props) {
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
        <div className="absolute left-2 top-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-black/60 text-white backdrop-blur transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--vault-purple)]"
            aria-label={`Edit ${entry.title} journal entry`}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-black/60 text-white backdrop-blur transition hover:border-[var(--vault-danger)] hover:text-[var(--vault-danger)] focus:outline-none focus:ring-2 focus:ring-[var(--vault-danger)]"
            aria-label={`Delete ${entry.title} journal entry`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <span className={`absolute right-2 top-2 rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide shadow-[0_2px_10px_rgba(0,0,0,0.65)] backdrop-blur-sm ${statusColors[entry.status]}`}>
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
