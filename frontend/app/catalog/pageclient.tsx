"use client";

import type { Game, Genre } from "./page";
import GameCardCatalog from "@/components/catalog/GameCardCatalog";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getGames, getRecommendations, request } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { formatGenreLabel } from "@/lib/formatGenre";
import Link from "next/link";

type Data = {
    games : Game[],
    genres : Genre[],
    initial_count : number,
    init_limit : number,
    init_offset : number,
}

type GetGamesRes = {
    count: number,
    games: Game[],
};

type RecommendationGame = Game & {
    score?: number,
    matched_genres?: string[],
    matched_tags?: string[],
    game_genres?: { genres?: { name?: string } | null }[],
};

type RecommendationsRes = {
    count: number,
    recommendations: RecommendationGame[],
};

type SortOption = "popularity" | "rating" | "newest" | "title";

type CatalogQuery = {
    search : string,
    genres : string[],
    sort : SortOption,
    offset : number,
}

const sortOptions : { label : string, value : SortOption }[] = [
    { label: "Popularity", value: "popularity" },
    { label: "Rating", value: "rating" },
    { label: "Newest", value: "newest" },
    { label: "Title", value: "title" },
];

function getVisiblePages(currentPage : number, totalPages : number) {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from(
        { length: end - adjustedStart + 1 },
        (_, index) => adjustedStart + index
    );
}

function getDisplayRating(userRating : number | null, websiteRating : number | null) {
    const rating = userRating && userRating > 0
        ? userRating
        : websiteRating
            ? websiteRating / 10
            : null;

    return rating === null ? "N/A" : rating.toFixed(1);
}

function getFallbackRecommendations(games : Game[]) {
    return games
        .slice()
        .sort((firstGame, secondGame) => {
            const firstRating = firstGame.avg_user_rating ?? (firstGame.external_rating ?? 0) / 10;
            const secondRating = secondGame.avg_user_rating ?? (secondGame.external_rating ?? 0) / 10;

            return secondRating - firstRating;
        })
        .slice(0, 6);
}

function getRecommendationGenres(game : RecommendationGame) {
    if (game.genres?.length) {
        return game.genres;
    }

    return game.game_genres
        ?.map((genreRow) => genreRow.genres?.name)
        .filter((genreName): genreName is string => Boolean(genreName)) ?? [];
}

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function CatalogClient(props : Data) {
    const limit = props.init_limit;

    const hydrated = useSyncExternalStore(
        subscribeToHydration,
        getClientSnapshot,
        getServerSnapshot
    );
    const [query, setQuery] = useState<CatalogQuery>({
        search: "",
        genres: [],
        sort: "popularity",
        offset: props.init_offset,
    });
    const [games, setGames] = useState<Game[]>(props.games);
    const [totalCount, setTotalCount] = useState(props.initial_count);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationGame[]>(
        getFallbackRecommendations(props.games)
    );
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommendationMode, setRecommendationMode] = useState<"personalized" | "popular">("popular");
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        let active = true;

        request<AuthUser>("/auth/me")
            .then(() => {
                if (active) {
                    setUserLoggedIn(true);
                }
            })
            .catch(() => {
                if (active) {
                    setUserLoggedIn(false);
                    setRecommendationsLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!userLoggedIn) {
            return;
        }

        let active = true;

        async function loadRecommendations() {
            setRecommendationsLoading(true);

            try {
                const data = await getRecommendations<RecommendationsRes>(6);

                if (!active) {
                    return;
                }

                if (data.recommendations.length > 0) {
                    setRecommendations(data.recommendations);
                    setRecommendationMode("personalized");
                } else {
                    setRecommendations(getFallbackRecommendations(props.games));
                    setRecommendationMode("popular");
                }
            } catch {
                if (active) {
                    setRecommendations(getFallbackRecommendations(props.games));
                    setRecommendationMode("popular");
                }
            } finally {
                if (active) {
                    setRecommendationsLoading(false);
                }
            }
        }

        loadRecommendations();

        return () => {
            active = false;
        };
    }, [props.games, userLoggedIn]);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getGames<GetGamesRes>(
                    limit,
                    query.offset,
                    {
                        query: query.search,
                        genres: query.genres,
                        sort: query.sort,
                        signal: controller.signal,
                    }
                );

                setTotalCount(data.count);
                setGames(data.games);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : "Unable to load catalog.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 280);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [limit, query]);

    const currentPage = Math.floor(query.offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const visiblePages = getVisiblePages(currentPage, totalPages);

    function updateQuery(nextQuery : Partial<Omit<CatalogQuery, "offset">>) {
        setQuery((currentQuery) => ({
            ...currentQuery,
            ...nextQuery,
            offset: props.init_offset,
        }));
    }

    function toggleGenre(genre : string) {
        const nextGenres = query.genres.includes(genre)
            ? query.genres.filter((selectedGenre) => selectedGenre !== genre)
            : query.genres.concat(genre);

        updateQuery({ genres: nextGenres });
    }

    function clearGenres() {
        updateQuery({ genres: [] });
    }

    function goToPage(page : number) {
        if (loading) return;

        const nextPage = Math.min(Math.max(page, 1), totalPages);

        setQuery((currentQuery) => ({
            ...currentQuery,
            offset: (nextPage - 1) * limit,
        }));
    }

    return (
        <main className="min-h-screen bg-[var(--vault-bg)] px-4 py-6 text-[var(--vault-text)] sm:px-6">
            <section className="mx-auto max-w-7xl">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Game Catalog
                    </h1>
                </div>

                {userLoggedIn ? (
                    <section className="mb-8 border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-[var(--vault-text)]">
                                    Recommended for You
                                </h2>
                                <p className="text-sm text-[var(--vault-muted)]">
                                    {recommendationMode === "personalized"
                                        ? "Based on your ratings, favorites, logs, and genre matches."
                                        : "Top picks while your profile is still getting enough activity."}
                                </p>
                            </div>

                        </div>

                        {recommendationsLoading ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-32 animate-pulse rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {recommendations.map((game) => {
                                    const genres = getRecommendationGenres(game).slice(0, 2);

                                    return (
                                        <Link
                                            key={game.game_id}
                                            href={{ pathname: "/Journal", query: { gameId: game.game_id } }}
                                            aria-label={`Log ${game.title} in your journal`}
                                            className="grid min-h-32 grid-cols-[5rem_1fr] overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] transition hover:-translate-y-0.5 hover:border-[var(--vault-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--vault-purple)] focus:ring-offset-2 focus:ring-offset-[var(--vault-bg)]"
                                        >
                                            <div
                                                className="bg-cover bg-top bg-no-repeat"
                                                style={{
                                                    backgroundImage: game.cover_image
                                                        ? `url(${game.cover_image})`
                                                        : "linear-gradient(160deg, var(--vault-surface-raised), var(--vault-bg-soft))",
                                                }}
                                                aria-hidden="true"
                                            />

                                            <div className="flex min-w-0 flex-col justify-between gap-3 p-3">
                                                <div className="min-w-0">
                                                    <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[var(--vault-green)]">
                                                        <span>{getDisplayRating(game.avg_user_rating, game.external_rating)}</span>
                                                    </div>

                                                    <h3 className="line-clamp-2 break-words text-sm font-bold leading-tight text-[var(--vault-text)] [overflow-wrap:anywhere]">
                                                        {game.title}
                                                    </h3>
                                                </div>

                                                <div className="flex min-h-5 flex-wrap gap-2">
                                                    {genres.length > 0 ? genres.map((genre) => (
                                                        <span
                                                            key={genre}
                                                            className="rounded-sm bg-[var(--vault-bg-soft)] px-2 py-1 text-xs font-medium text-[var(--vault-muted)]"
                                                        >
                                                            {formatGenreLabel(genre)}
                                                        </span>
                                                    )) : (
                                                        <span className="text-xs text-[var(--vault-muted-strong)]">
                                                            Recommended pick
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                ) : null}

                <div className="mb-7 flex flex-col gap-3 border-b border-[var(--vault-border)] pb-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="relative block w-full lg:max-w-xl">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--vault-muted-strong)]">
                            &#8981;
                        </span>
                        <input
                            type="search"
                            value={query.search}
                            placeholder="Search the vault for titles or genres..."
                            className="h-10 w-full rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] pl-10 pr-4 text-sm text-[var(--vault-text)] outline-none transition focus:border-[var(--vault-purple)] focus:ring-1 focus:ring-[var(--vault-purple)]"
                            onChange={(event) => updateQuery({ search: event.target.value })}
                        />
                    </label>

                    <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] px-3 text-sm font-semibold text-[var(--vault-muted)]">
                        <span className="whitespace-nowrap">Sort by</span>
                        <select
                            value={query.sort}
                            onChange={(event) => updateQuery({ sort: event.target.value as SortOption })}
                            className="min-w-28 bg-transparent text-sm font-semibold text-[var(--vault-text)] outline-none"
                        >
                            {sortOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    className="bg-[var(--vault-surface)] text-[var(--vault-text)]"
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--vault-text)]">
                            <span aria-hidden="true">&#9671;</span>
                            Genres
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                            <button
                                type="button"
                                onClick={clearGenres}
                                className={`min-w-max rounded-md px-3 py-2 text-left text-sm transition lg:min-w-0 ${
                                    query.genres.length === 0
                                        ? "bg-[var(--vault-surface-raised)] text-[var(--vault-purple)] ring-1 ring-[var(--vault-purple)]"
                                        : "text-[var(--vault-muted)] hover:bg-[var(--vault-surface)] hover:text-[var(--vault-text)]"
                                }`}
                            >
                                All Games
                            </button>

                            {props.genres.map((genre) => {
                                const selected = query.genres.includes(genre.name);

                                return (
                                    <button
                                        key={genre.genre_id}
                                        type="button"
                                        onClick={() => toggleGenre(genre.name)}
                                        className={`min-w-max rounded-md px-3 py-2 text-left text-sm transition lg:min-w-0 ${
                                            selected
                                                ? "bg-[var(--vault-surface-raised)] text-[var(--vault-purple)] ring-1 ring-[var(--vault-purple)]"
                                                : "text-[var(--vault-muted)] hover:bg-[var(--vault-surface)] hover:text-[var(--vault-text)]"
                                        }`}
                                    >
                                        {formatGenreLabel(genre.name)}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <div>
                        {error ? (
                            <div className="rounded-md border border-[var(--vault-danger)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-danger)]">
                                {error}
                            </div>
                        ) : null}

                        <GameCardCatalog
                            games={games}
                            loading={loading}
                        />

                        {!loading && games.length === 0 ? (
                            <div className="mt-6 rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-8 text-center text-sm text-[var(--vault-muted)]">
                                No games match the current search.
                            </div>
                        ) : null}

                        <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
                            {games.length > 0 ? (
                                <span className="text-sm text-[var(--vault-muted-strong)]">
                                    Page {currentPage} of {totalPages}
                                </span>
                            ) : (
                                <span />
                            )}

                            {games.length > 0 ? (
                                <nav className="flex items-center gap-2" aria-label="Catalog pagination">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={!hydrated || currentPage === 1}
                                        className="rounded-md border border-[var(--vault-border-strong)] bg-[var(--vault-surface)] px-3 py-2 text-sm font-semibold text-[var(--vault-text)] transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-purple)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    {visiblePages.map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => goToPage(page)}
                                            disabled={!hydrated || loading || page === currentPage}
                                            aria-current={page === currentPage ? "page" : undefined}
                                            className={`h-10 min-w-10 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed ${
                                                page === currentPage
                                                    ? "border-[var(--vault-purple)] bg-[var(--vault-surface-raised)] text-[var(--vault-purple)]"
                                                    : "border-[var(--vault-border-strong)] bg-[var(--vault-surface)] text-[var(--vault-text)] hover:border-[var(--vault-purple)] hover:text-[var(--vault-purple)]"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                
                                    <button
                                        type="button"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={!hydrated || currentPage === totalPages}
                                        className="rounded-md border border-[var(--vault-border-strong)] bg-[var(--vault-surface)] px-3 py-2 text-sm font-semibold text-[var(--vault-text)] transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-purple)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </nav>
                            ) : null}
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}
