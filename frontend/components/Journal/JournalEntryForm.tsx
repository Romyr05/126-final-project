"use client"

import { useEffect, useState } from "react"
import { getGame, request, searchGames } from "@/lib/api"
import Image from "next/image"

type Game = {
  game_id: string
  title: string
  cover_image: string | null
}

type Status = "played" | "playing" | "completed" | "dropped" | "wishlist"
const statuses: Status[] = ["played", "playing", "completed", "dropped", "wishlist"]

function getCoverImageSrc(coverImage: string | null) {
  if (!coverImage) {
    return "/images/dummyGameImg.png"
  }

  if (coverImage.startsWith("//")) {
    return `https:${coverImage}`
  }

  return coverImage
}

type Props = {
  initialGameId?: string | null
  onSuccess: () => void
  onCancel?: () => void
}

export default function JournalEntryForm({ initialGameId, onSuccess, onCancel }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [prefillLoading, setPrefillLoading] = useState(false)

  useEffect(() => {
    if (!initialGameId) {
      return
    }

    const gameId = initialGameId
    let active = true

    async function prefillGame() {
      setPrefillLoading(true)
      setError("")

      try {
        const game = await getGame<Game>(gameId)

        if (active) {
          setSelectedGame(game)
          setQuery(game.title)
          setResults([])
        }
      } catch {
        if (active) {
          setError("Could not prefill that game. Search for it instead.")
        }
      } finally {
        if (active) {
          setPrefillLoading(false)
        }
      }
    }

    prefillGame()

    return () => {
      active = false
    }
  }, [initialGameId])

  async function handleSearch(value: string) {
    setQuery(value)
    setSelectedGame(null)

    if (value.length < 2) {
      return setResults([])
    }

    try {
      const res = await searchGames<{ count: number; games: Game[] }>(value)
      setResults(res.games)
    } catch {
      setResults([])
    }
  }

  async function handleSubmit() {
    if (!selectedGame || !status) return
    setLoading(true)
    setError("")
    try {
      // log the status
      await request("/logs", {
        method: "POST",
        body: JSON.stringify({ game_id: selectedGame.game_id, status }),
      })

      // post review if rating provided
      if (rating) {
        const reviewPayload = {
          game_id: selectedGame.game_id,
          rating,
          review_text: reviewText || null,
        }

        try {
          await request("/reviews", {
            method: "POST",
            body: JSON.stringify(reviewPayload),
          })
        } catch (reviewError) {
          if (
            reviewError instanceof Error &&
            reviewError.message === "Review already exists"
          ) {
            await request(`/reviews/${selectedGame.game_id}`, {
              method: "PATCH",
              body: JSON.stringify({
                rating,
                review_text: reviewText || null,
              }),
            })
          } else {
            throw reviewError
          }
        }
      }

      onSuccess()
      setQuery("")
      setResults([])
      setSelectedGame(null)
      setStatus(null)
      setRating(null)
      setReviewText("")
    } catch {
      setError("Failed to save. Are you logged in?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--vault-text)]">Log a Game</h2>
        <p className="mt-1 text-sm text-[var(--vault-muted)]">
          Add a game to your journal and leave a rating or review.
        </p>
      </div>

      {prefillLoading && (
        <p className="text-sm text-[var(--vault-muted)]">Loading selected game...</p>
      )}

      <div className="relative">
        <label className="mb-2 block text-sm font-semibold text-[var(--vault-muted)]">
          Game
        </label>
        <input
          type="text"
          placeholder="Search for a game..."
          value={selectedGame ? selectedGame.title : query}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-11 w-full rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] px-4 text-[var(--vault-text)] outline-none transition placeholder:text-[var(--vault-muted-strong)] focus:border-[var(--vault-purple)] focus:ring-1 focus:ring-[var(--vault-purple)]"
        />
        {results.length > 0 && !selectedGame && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] shadow-[var(--vault-shadow)]">
            {results.map((game) => (
              <button
                type="button"
                key={game.game_id}
                onClick={() => {
                  setSelectedGame(game)
                  setResults([])
                }}
                className="grid w-full grid-cols-[2.5rem_1fr] items-center gap-3 px-4 py-2 text-left text-sm text-[var(--vault-muted)] transition hover:bg-[var(--vault-bg-soft)] hover:text-[var(--vault-text)]"
              >
                <span className="relative aspect-[3/4] overflow-hidden rounded-sm border border-[var(--vault-border)] bg-[var(--vault-bg-soft)]">
                  <Image
                    src={getCoverImageSrc(game.cover_image)}
                    alt={`${game.title} cover`}
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                  />
                </span>
                <span className="truncate">{game.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedGame ? (
        <div className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] p-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]">
            <Image
              src={getCoverImageSrc(selectedGame.cover_image)}
              alt={`${selectedGame.title} cover`}
              fill
              sizes="72px"
              className="object-cover object-top"
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--vault-muted-strong)]">
              Selected game
            </p>
            <p className="line-clamp-2 break-words text-sm font-bold text-[var(--vault-text)]">
              {selectedGame.title}
            </p>
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--vault-muted)]">Status</p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3 py-1 text-sm font-semibold capitalize transition ${
                status === s
                  ? "border-[var(--vault-purple)] bg-[var(--vault-surface-raised)] text-[var(--vault-purple)]"
                  : "border-[var(--vault-border-strong)] text-[var(--vault-muted)] hover:border-[var(--vault-purple)] hover:text-[var(--vault-text)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--vault-muted)]">Rating (optional)</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl transition ${
                rating && star <= rating
                  ? "text-[var(--vault-purple)]"
                  : "text-[var(--vault-muted-strong)] hover:text-[var(--vault-muted)]"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--vault-muted)]">Review (optional)</p>
        <textarea
          placeholder="Write your thoughts..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] px-4 py-3 text-[var(--vault-text)] outline-none transition placeholder:text-[var(--vault-muted-strong)] focus:border-[var(--vault-purple)] focus:ring-1 focus:ring-[var(--vault-purple)]"
        />
      </div>

      {error && <p className="text-sm text-[var(--vault-danger)]">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[var(--vault-border-strong)] px-4 py-2 text-sm font-semibold text-[var(--vault-muted)] transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-text)]"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedGame || !status || loading}
          className="rounded-md bg-[var(--vault-purple)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Saving..." : "Log Game"}
        </button>
      </div>
    </div>
  )
}
