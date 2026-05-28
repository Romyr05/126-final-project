"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { getGames, searchGames } from "@/lib/api";

type RecommendationGame = {
    game_id: string;
    title: string;
    cover_image: string | null;
    genres: string[];
    avg_user_rating: number | null;
    external_rating: number | null;
    slug: string | null;
};

type GamesResponse = {
    count: number;
    games: RecommendationGame[];
};

const RECOMMENDATION_LIMIT = 4;

function getCoverImageSrc(coverImage: string | null) {
    if (!coverImage) {
        return "/images/dummyGameImg.png";
    }

    if (coverImage.startsWith("//")) {
        return `https:${coverImage}`;
    }

    return coverImage;
}

function shuffleGames(games: RecommendationGame[]) {
    return games
        .slice()
        .sort(() => Math.random() - 0.5);
}

export default function RecommendedGames() {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<RecommendationGame[]>([]);
    const [selectedGame, setSelectedGame] = useState<RecommendationGame | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        getGames<GamesResponse>(24, 0, { sort: "popularity" })
            .then((data) => {
                if (active) {
                    setRecommendations(shuffleGames(data.games).slice(0, RECOMMENDATION_LIMIT));
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unable to load recommendations.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    async function handleSearch(value: string) {
        setQuery(value);
        setSelectedGame(null);

        if (value.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const data = await searchGames<GamesResponse>(value.trim());
            setSearchResults(data.games.slice(0, 6));
        } catch {
            setSearchResults([]);
        }
    }

    async function selectGame(game: RecommendationGame) {
        setSelectedGame(game);
        setQuery(game.title);
        setSearchResults([]);
        setLoading(true);
        setError("");

        try {
            const data = await getGames<GamesResponse>(16, 0, {
                genres: game.genres,
                sort: "rating",
            });
            const nextGames = data.games
                .filter((candidate) => candidate.game_id !== game.game_id)
                .slice(0, RECOMMENDATION_LIMIT);

            setRecommendations(nextGames);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load recommendations.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-5">
            <div className="mb-5 flex items-center gap-4">
                <h2 className="shrink-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--vault-muted)]">
                    Recommended Games
                </h2>
                <div className="h-px flex-1 bg-[var(--vault-border)]" />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                {selectedGame ? (
                    <p className="text-sm text-[var(--vault-muted)] sm:mr-auto">
                        Based on {selectedGame.title}
                    </p>
                ) : null}

                <label className="relative block w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--vault-muted-strong)]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => handleSearch(event.target.value)}
                        placeholder="Base recommendations on a game..."
                        className="h-10 w-full rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] pl-10 pr-4 text-sm text-[var(--vault-text)] outline-none transition placeholder:text-[var(--vault-muted-strong)] focus:border-[var(--vault-purple)] focus:ring-1 focus:ring-[var(--vault-purple)]"
                    />

                    {searchResults.length > 0 ? (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] shadow-[var(--vault-shadow)]">
                            {searchResults.map((game) => (
                                <button
                                    key={game.game_id}
                                    type="button"
                                    onClick={() => selectGame(game)}
                                    className="grid w-full grid-cols-[2.5rem_1fr] items-center gap-3 px-3 py-2 text-left text-sm text-[var(--vault-muted)] transition hover:bg-[var(--vault-bg-soft)] hover:text-[var(--vault-text)]"
                                >
                                    <span className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[var(--vault-bg-soft)]">
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
                    ) : null}
                </label>
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: RECOMMENDATION_LIMIT }).map((_, index) => (
                        <div
                            key={index}
                            className="h-64 animate-pulse rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]"
                        />
                    ))}
                </div>
            ) : error ? (
                <p className="rounded-md border border-[var(--vault-danger)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-danger)]">
                    {error}
                </p>
            ) : recommendations.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {recommendations.map((game) => (
                        <RecommendationCard key={game.game_id} game={game} />
                    ))}
                </div>
            ) : (
                <p className="rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-muted)]">
                    No recommendations found for that game yet.
                </p>
            )}
        </section>
    );
}

function RecommendationCard({ game }: { game: RecommendationGame }) {
    const href = game.slug ? `/catalog/${game.slug}` : "/catalog";

    return (
        <Link
            href={href}
            className="group block focus:outline-none focus:ring-2 focus:ring-[var(--vault-purple)] focus:ring-offset-2 focus:ring-offset-[var(--vault-bg)]"
        >
            <article className="overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] transition hover:-translate-y-0.5 hover:border-[var(--vault-purple)]">
                <div className="relative aspect-[3/4] bg-[var(--vault-bg-soft)]">
                    <Image
                        src={getCoverImageSrc(game.cover_image)}
                        alt={`${game.title} cover`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--vault-surface)] to-transparent" />
                </div>
                <div className="p-3">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-tight text-[var(--vault-text)]">
                        {game.title}
                    </h3>
                </div>
            </article>
        </Link>
    );
}
