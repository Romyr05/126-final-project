"use client";

import Link from "next/link";
import { useState } from "react";
import { addFavorite } from "@/lib/api";

type Status = "played" | "playing" | "completed" | "dropped" | "wishlist";

const statuses: { label: string; value: Status }[] = [
    { label: "Played", value: "played" },
    { label: "Playing", value: "playing" },
    { label: "Completed", value: "completed" },
    { label: "Dropped", value: "dropped" },
    { label: "Wishlist", value: "wishlist" },
];

type Props = {
    gameId: string;
};

export default function GameDetailsActions({ gameId }: Props) {
    const [status, setStatus] = useState<Status>("playing");
    const [rating, setRating] = useState(0);
    const [favoriteState, setFavoriteState] = useState<"idle" | "saving" | "saved" | "error">("idle");

    async function handleFavorite() {
        setFavoriteState("saving");

        try {
            await addFavorite(gameId);
            setFavoriteState("saved");
        } catch {
            setFavoriteState("error");
        }
    }

    return (
        <aside className="rounded-md border border-[var(--vault-border)] bg-[rgb(31_31_34_/_0.92)] p-5 shadow-[var(--vault-shadow)] backdrop-blur">
            <div className="mb-5">
                <label className="mb-2 block text-xs font-bold uppercase text-[var(--vault-muted)]">
                    Play Status
                </label>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as Status)}
                    className="h-10 w-full rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] px-3 text-sm font-semibold text-[var(--vault-text)] outline-none focus:border-[var(--vault-purple)]"
                >
                    {statuses.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase text-[var(--vault-muted)]">
                    Your Rating
                </p>
                <div className="flex gap-1" aria-label="Rating selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl transition ${
                                star <= rating
                                    ? "text-[var(--vault-green)]"
                                    : "text-[var(--vault-border-strong)] hover:text-[var(--vault-muted)]"
                            }`}
                            aria-label={`Set rating to ${star}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <Link
                    href={{ pathname: "/Journal", query: { gameId } }}
                    className="rounded-md bg-[var(--vault-purple)] px-4 py-3 text-center text-sm font-bold text-[#1a1023] transition hover:bg-[var(--vault-purple-strong)]"
                >
                    Log Journal Entry
                </Link>

                <button
                    type="button"
                    onClick={handleFavorite}
                    disabled={favoriteState === "saving" || favoriteState === "saved"}
                    className="rounded-md border border-[var(--vault-cyan)] px-4 py-3 text-sm font-bold text-[var(--vault-cyan)] transition hover:bg-[rgb(0_229_212_/_0.1)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {favoriteState === "saving"
                        ? "Adding..."
                        : favoriteState === "saved"
                            ? "Added to Favorites"
                            : "Add to Favorites"}
                </button>
            </div>

            {favoriteState === "error" ? (
                <p className="mt-3 text-xs text-[var(--vault-danger)]">
                    Could not save favorite. Sign in and try again.
                </p>
            ) : null}
        </aside>
    );
}
