"use client"

import { useEffect, useState, useCallback } from "react"
import { getLogs, getGame, getMyReview } from "@/lib/api"
import type { GameLog, GameLogWithDetails } from "@/types/journal"

type GameDetail = {
  game_id: string
  title: string
  cover_image: string | null
}

type Review = {
  rating: number
  review_text: string | null
}

export function useJournal() {
  const [entries, setEntries] = useState<GameLogWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchJournal = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const logs = await getLogs<GameLog[]>()

      const detailed = await Promise.all(
        logs.map(async (log) => {
          try {
            const game = await getGame<GameDetail>(log.game_id)

            let rating = null
            let review_text = null
            try {
              const review = await getMyReview<Review>(log.game_id)
              rating = review.rating
              review_text = review.review_text
            } catch {
              // no review yet
            }

            return {
              game_id: log.game_id,
              status: log.status,
              title: game.title,
              cover_image: game.cover_image,
              rating,
              review_text,
            }
          } catch {
            return {
              game_id: log.game_id,
              status: log.status,
              title: "Unknown Game",
              cover_image: null,
              rating: null,
              review_text: null,
            }
          }
        })
      )

      setEntries(detailed)
    } catch {
      setError("Failed to load journal. Are you logged in?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJournal()
  }, [fetchJournal])

  return { entries, loading, error, refresh: fetchJournal }
}