"use client"

import { useEffect, useState } from "react"
import { getLogs, getGame, getMyReview, getMyReviews } from "@/lib/api"
import type {
  GameLog,
  GameLogWithDetails,
  JournalReview,
  JournalReviewWithGame,
} from "@/types/journal"

type GameDetail = {
  game_id: string
  title: string
  cover_image: string | null
}

type Review = {
  rating: number
  review_text: string | null
}

async function fetchJournalEntries(): Promise<GameLogWithDetails[]> {
  const logs = await getLogs<GameLog[]>()

  return Promise.all(
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
          date_logged: log.date_logged,
          updated_at: log.updated_at,
        }
      } catch {
        return {
          game_id: log.game_id,
          status: log.status,
          title: "Unknown Game",
          cover_image: null,
          rating: null,
          review_text: null,
          date_logged: log.date_logged,
          updated_at: log.updated_at,
        }
      }
    })
  )
}

async function fetchJournalReviews(): Promise<JournalReviewWithGame[]> {
  const reviews = await getMyReviews<JournalReview[]>()

  return Promise.all(
    reviews.map(async (review) => {
      try {
        const game = await getGame<GameDetail>(review.game_id)

        return {
          ...review,
          title: game.title,
          cover_image: game.cover_image,
        }
      } catch {
        return {
          ...review,
          title: "Unknown Game",
          cover_image: null,
        }
      }
    })
  )
}

export function useJournal(enabled: boolean = true) {
  const [entries, setEntries] = useState<GameLogWithDetails[]>([])
  const [reviews, setReviews] = useState<JournalReviewWithGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false

    Promise.all([fetchJournalEntries(), fetchJournalReviews()])
      .then(([entryData, reviewData]) => {
        if (!cancelled) {
          setEntries(entryData)
          setReviews(reviewData)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load journal. Are you logged in?")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, refreshKey])

  function refresh() {
    setRefreshKey((k) => k + 1)
  }

  return { entries, reviews, loading, error, refresh }
}
