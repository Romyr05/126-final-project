"use client"

import { useState } from "react"
import { request, searchGames } from "@/lib/api"

type Game = {
  game_id: string
  title: string
}

type Status = "played" | "playing" | "completed" | "dropped" | "wishlist"
const statuses: Status[] = ["played", "playing", "completed", "dropped", "wishlist"]

type Props = {
  onSuccess: () => void
}

export default function JournalEntryForm({ onSuccess }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSearch(value: string) {
  setQuery(value)
  setSelectedGame(null)
  if (value.length < 2) return setResults([])
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
        await request("/reviews", {
          method: "POST",
          body: JSON.stringify({
            game_id: selectedGame.game_id,
            rating,
            review_text: reviewText || null,
          }),
        })
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
    <div className="flex flex-col gap-4 p-6 rounded-xl bg-white/5 border border-white/10 mb-8">
      <h2 className="text-white font-semibold text-lg">Log a Game</h2>

      {/* Game search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a game..."
          value={selectedGame ? selectedGame.title : query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-white/10 text-white placeholder-white/40 px-4 py-2 rounded-lg outline-none border border-white/10 focus:border-white/30"
        />
        {results.length > 0 && !selectedGame && (
          <div className="absolute top-full left-0 right-0 bg-[#1a1a2e] border border-white/10 rounded-lg mt-1 z-10 max-h-48 overflow-y-auto">
            {results.map((game) => (
              <button
                key={game.game_id}
                onClick={() => {
                  setSelectedGame(game)
                  setResults([])
                }}
                className="w-full text-left px-4 py-2 text-white/80 hover:bg-white/10 text-sm"
              >
                {game.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <p className="text-white/50 text-sm mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                status === s
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-white/50 text-sm mb-2">Rating (optional)</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl transition ${
                rating && star <= rating ? "text-yellow-400" : "text-white/20"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Review text */}
      <div>
        <p className="text-white/50 text-sm mb-2">Review (optional)</p>
        <textarea
          placeholder="Write your thoughts..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={3}
          className="w-full bg-white/10 text-white placeholder-white/40 px-4 py-2 rounded-lg outline-none border border-white/10 focus:border-white/30 resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!selectedGame || !status || loading}
        className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full w-fit hover:bg-yellow-300 transition disabled:opacity-40"
      >
        {loading ? "Saving..." : "Log Game"}
      </button>
    </div>
  )
}