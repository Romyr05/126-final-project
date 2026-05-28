"use client"

import JournalEntryCard from "@/components/Journal/JournalEntryCard"
import JournalEntryForm from "@/components/Journal/JournalEntryForm"
import { deleteLog, deleteReview, request } from "@/lib/api"
import type { AuthUser } from "@/lib/auth"
import { useJournal } from "@/hooks/useJournal"
import type { GameLogWithDetails, JournalReviewWithGame } from "@/types/journal"
import { Plus, Star, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

type StatusFilter = GameLogWithDetails["status"] | "all"
type FormMode = "create" | "edit"

const visibleLogLimit = 7
const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Playing", value: "playing" },
  { label: "Completed", value: "completed" },
  { label: "Wishlist", value: "wishlist" },
  { label: "Dropped", value: "dropped" },
]

export default function JournalPage() {
  return (
    <Suspense fallback={<JournalFallback />}>
      <JournalContent />
    </Suspense>
  )
}

function JournalContent() {
  const searchParams = useSearchParams()
  const initialGameId = searchParams.get("gameId")

  return <JournalShell initialGameId={initialGameId} />
}

function JournalShell({ initialGameId }: { initialGameId: string | null }) {
  const [authChecked, setAuthChecked] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const { entries, reviews, loading, error, refresh } = useJournal(loggedIn)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [formOpen, setFormOpen] = useState(() => Boolean(initialGameId))
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [editingEntry, setEditingEntry] = useState<GameLogWithDetails | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GameLogWithDetails | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    let active = true

    request<AuthUser>("/auth/me")
      .then(() => {
        if (active) {
          setLoggedIn(true)
          setAuthChecked(true)
        }
      })
      .catch(() => {
        if (active) {
          setLoggedIn(false)
          setAuthChecked(true)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const filteredEntries = useMemo(() => {
    if (activeFilter === "all") {
      return entries
    }

    return entries.filter((entry) => entry.status === activeFilter)
  }, [activeFilter, entries])

  const visibleEntries = filteredEntries.slice(0, visibleLogLimit)

  function handleSuccess() {
    refresh()
    closeForm()
  }

  function openCreateForm() {
    setFormMode("create")
    setEditingEntry(null)
    setFormOpen(true)
  }

  function openEditForm(entry: GameLogWithDetails) {
    setFormMode("edit")
    setEditingEntry(entry)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingEntry(null)
    setFormMode("create")
  }

  function openDeleteConfirm(entry: GameLogWithDetails) {
    setDeleteTarget(entry)
    setDeleteError("")
  }

  function closeDeleteConfirm() {
    if (deleteLoading) {
      return
    }

    setDeleteTarget(null)
    setDeleteError("")
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return
    }

    setDeleteLoading(true)
    setDeleteError("")

    try {
      await deleteLog(deleteTarget.game_id)

      try {
        await deleteReview(deleteTarget.game_id)
      } catch (reviewError) {
        if (!isNotFoundError(reviewError)) {
          throw reviewError
        }
      }

      refresh()
      setDeleteTarget(null)
    } catch {
      setDeleteError("Failed to delete this journal entry. Please try again.")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!authChecked) {
    return <JournalFallback />
  }

  if (!loggedIn) {
    return <JournalLoginRequired />
  }

  return (
    <main className="min-h-screen bg-[var(--vault-bg)] px-4 py-7 text-[var(--vault-text)] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight">Your Journal</h1>
          <p className="mt-2 text-sm text-[var(--vault-muted)]">
            Track, rate, and review your gaming journey.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeFilter === filter.value
                  ? "border-[var(--vault-purple)] bg-[var(--vault-purple)] text-white"
                  : "border-[var(--vault-border-strong)] bg-[var(--vault-surface)] text-[var(--vault-muted)] hover:border-[var(--vault-purple)] hover:text-[var(--vault-text)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <JournalGridLoading />
        ) : error ? (
          <div className="rounded-md border border-[var(--vault-danger)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-danger)]">
            {error}
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleEntries.map((entry) => (
                <JournalEntryCard
                  key={entry.game_id}
                  entry={entry}
                  onEdit={openEditForm}
                  onDelete={openDeleteConfirm}
                />
              ))}

              <AddGameTile onClick={openCreateForm} />
            </section>

            {filteredEntries.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--vault-muted)]">
                No games match this filter yet.
              </p>
            ) : null}

            {filteredEntries.length > visibleLogLimit ? (
              <p className="mt-4 text-sm text-[var(--vault-muted)]">
                Showing the latest {visibleLogLimit} games for this filter.
              </p>
            ) : null}
          </>
        )}

        <JournalReviewsSection reviews={reviews} loading={loading} />
      </section>

      {formOpen ? (
        <JournalEntryModal onClose={closeForm}>
          <JournalEntryForm
            key={`${formMode}-${editingEntry?.game_id ?? initialGameId ?? "new"}`}
            initialGameId={formMode === "create" ? initialGameId : null}
            existingEntry={editingEntry}
            onSuccess={handleSuccess}
            onCancel={closeForm}
          />
        </JournalEntryModal>
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          entry={deleteTarget}
          error={deleteError}
          loading={deleteLoading}
          onCancel={closeDeleteConfirm}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </main>
  )
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes("not found")
}

function JournalLoginRequired() {
  return (
    <main className="min-h-screen bg-[var(--vault-bg)] px-4 py-7 text-[var(--vault-text)] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight">Your Journal</h1>
          <p className="mt-2 text-sm text-[var(--vault-muted)]">
            Track, rate, and review your gaming journey.
          </p>
        </div>

        <div className="rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-8 text-center">
          <h2 className="text-xl font-bold text-[var(--vault-text)]">
            Log in to view your journal
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--vault-muted)]">
            Your logged games and reviews are private. Sign in to start tracking your games.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-md bg-[var(--vault-purple)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Go to Login
          </Link>
        </div>
      </section>
    </main>
  )
}

function AddGameTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-md border border-dashed border-[var(--vault-border-strong)] bg-[var(--vault-bg-soft)] text-[var(--vault-muted)] transition hover:border-[var(--vault-purple)] hover:bg-[var(--vault-surface)] hover:text-[var(--vault-text)] focus:outline-none focus:ring-2 focus:ring-[var(--vault-purple)] focus:ring-offset-2 focus:ring-offset-[var(--vault-bg)]"
      aria-label="Log a game"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vault-surface-raised)]">
        <Plus className="h-6 w-6" />
      </span>
      <span className="text-sm font-semibold">Log a Game</span>
    </button>
  )
}

function JournalEntryModal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-log-title"
        className="no-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-5 shadow-[var(--vault-shadow)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--vault-border-strong)] text-[var(--vault-muted)] transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-text)]"
            aria-label="Close log form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div id="journal-log-title" className="sr-only">
          Log a Game
        </div>
        {children}
      </section>
    </div>
  )
}

function DeleteConfirmModal({
  entry,
  error,
  loading,
  onCancel,
  onConfirm,
}: {
  entry: GameLogWithDetails
  error: string
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onMouseDown={onCancel}
      role="presentation"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="journal-delete-title"
        aria-describedby="journal-delete-description"
        className="w-full max-w-md rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-5 shadow-[var(--vault-shadow)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="journal-delete-title" className="text-lg font-bold text-[var(--vault-text)]">
              Delete journal entry?
            </h2>
            <p
              id="journal-delete-description"
              className="mt-2 text-sm leading-6 text-[var(--vault-muted)]"
            >
              This will delete your log for {entry.title}, including its rating and
              review. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--vault-border-strong)] text-[var(--vault-muted)] transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-text)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close delete confirmation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error ? <p className="mb-4 text-sm text-[var(--vault-danger)]">{error}</p> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-[var(--vault-border-strong)] px-4 py-2 text-sm font-semibold text-[var(--vault-muted)] transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-[var(--vault-danger)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </section>
    </div>
  )
}

function JournalReviewsSection({
  reviews,
  loading,
}: {
  reviews: JournalReviewWithGame[]
  loading: boolean
}) {
  return (
    <section className="mt-12 border-t border-[var(--vault-border)] pt-7">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[var(--vault-text)]">Your Reviews</h2>
        <p className="mt-1 text-sm text-[var(--vault-muted)]">
          Your latest written thoughts and ratings.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]"
            />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.review_id} review={review} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-muted)]">
          No reviews yet.
        </p>
      )}
    </section>
  )
}

function ReviewCard({ review }: { review: JournalReviewWithGame }) {
  return (
    <article className="grid gap-4 rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] p-4 sm:grid-cols-[4rem_1fr_auto]">
      <div className="relative h-20 overflow-hidden rounded-md bg-[var(--vault-surface)] sm:h-16">
        <ImageCover title={review.title} coverImage={review.cover_image} />
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold text-[var(--vault-text)]">
          {review.title}
        </h3>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-3 w-3 ${
                index < review.rating
                  ? "text-[var(--vault-purple)]"
                  : "text-[var(--vault-muted-strong)]"
              }`}
              fill={index < review.rating ? "currentColor" : "none"}
            />
          ))}
          <span className="ml-2 text-xs text-[var(--vault-muted)]">
            {review.rating.toFixed(1)} / 5.0
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--vault-muted)]">
          {review.review_text || "No review text yet."}
        </p>
      </div>

      <time className="text-[10px] font-medium text-[var(--vault-muted-strong)] sm:text-right">
        {formatReviewDate(review.date_updated)}
      </time>
    </article>
  )
}

function ImageCover({
  title,
  coverImage,
}: {
  title: string
  coverImage: string | null
}) {
  return coverImage ? (
    <div
      aria-label={`${title} cover`}
      className="h-full w-full bg-cover bg-center"
      role="img"
      style={{ backgroundImage: `url(${coverImage})` }}
    />
  ) : (
    <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(216,180,254,0.12),transparent_32%),var(--vault-surface)]" />
  )
}

function JournalGridLoading() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]"
        />
      ))}
    </section>
  )
}

function JournalFallback() {
  return (
    <main className="min-h-screen bg-[var(--vault-bg)] px-4 py-7 text-[var(--vault-text)] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight">Your Journal</h1>
        <p className="mt-2 text-sm text-[var(--vault-muted)]">Loading...</p>
      </section>
    </main>
  )
}

function formatReviewDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}
