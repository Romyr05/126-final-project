"use client";

import type { Game, Genre } from "./page";
import GameCardCatalog from "@/components/catalog/GameCardCatalog";
import { useEffect, useState } from "react";
import { getGames } from "@/lib/api";

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

function formatGenre(name : string) {
    return name
        .split(" ")
        .map((word) => word ? word[0].toUpperCase() + word.slice(1) : word)
        .join(" ");
}

function getVisiblePages(currentPage : number, totalPages : number) {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from(
        { length: end - adjustedStart + 1 },
        (_, index) => adjustedStart + index
    );
}

export default function CatalogClient(props : Data) {
    const limit = props.init_limit;

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

                    <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] px-3 text-sm text-[var(--vault-muted)]">
                        Sort:
                        <select
                            value={query.sort}
                            onChange={(event) => updateQuery({ sort: event.target.value as SortOption })}
                            className="bg-transparent text-[var(--vault-text)] outline-none"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
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
                                        {formatGenre(genre.name)}
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
                                    Page {currentPage} of {totalPages} · {totalCount} games
                                </span>
                            ) : (
                                <span />
                            )}

                            {games.length > 0 ? (
                                <nav className="flex items-center gap-2" aria-label="Catalog pagination">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={loading || currentPage === 1}
                                        className="rounded-md border border-[var(--vault-border-strong)] bg-[var(--vault-surface)] px-3 py-2 text-sm font-semibold text-[var(--vault-text)] transition hover:border-[var(--vault-purple)] hover:text-[var(--vault-purple)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    {visiblePages.map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => goToPage(page)}
                                            disabled={loading || page === currentPage}
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
                                        disabled={loading || currentPage === totalPages}
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
