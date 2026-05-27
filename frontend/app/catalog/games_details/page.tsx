import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/lib/api";
import type { Game } from "../page";
import GameDetailsActions from "./GameDetailsActions";
import { formatGenreLabel } from "@/lib/formatGenre";

type PageProps = {
    params: Promise<{ slug: string }>;
};

function getDisplayRating(userRating : number | null, websiteRating : number | null) {
    const rating = userRating && userRating > 0
        ? userRating
        : websiteRating
            ? websiteRating / 10
            : null;

    return rating === null ? "N/A" : rating.toFixed(1);
}

export default async function GameDetailsPage({ params }: PageProps) {
    const { slug } = await params;
    let game: Game;

    try {
        game = await getGameBySlug<Game>(slug);
    } catch {
        notFound();
    }

    const rating = getDisplayRating(game.avg_user_rating, game.external_rating);
    const coverImage = game.cover_image ?? "/images/dummyGameImg.png";

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-[var(--vault-bg)] text-[var(--vault-text)]">
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.12] blur-sm"
                style={{ backgroundImage: `url(${coverImage})` }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--vault-bg)_0%,rgb(15_15_16_/_0.84)_48%,var(--vault-bg)_100%)]" aria-hidden="true" />

            <section className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)_18rem] lg:py-14">
                <div className="relative aspect-[3/4] self-start overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] shadow-[var(--vault-shadow)] lg:mt-10">
                    <Image
                        src={coverImage}
                        alt={`${game.title} cover`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 20rem"
                        className="object-cover object-top"
                    />
                </div>

                <article className="min-w-0 lg:pt-12">
                    <Link
                        href="/catalog"
                        className="mb-5 inline-flex text-sm font-semibold text-[var(--vault-muted)] transition hover:text-[var(--vault-purple)]"
                    >
                        Back to catalog
                    </Link>

                    <h1 className="break-words text-4xl font-bold leading-tight text-[var(--vault-text)] [overflow-wrap:anywhere] sm:text-5xl">
                        {game.title}
                    </h1>

                    <p className="mt-3 text-sm font-bold text-[var(--vault-purple)]">
                        Developer / Publisher details coming soon
                    </p>

                    <div className="mt-6 rounded-md border border-[var(--vault-border)] bg-[rgb(31_31_34_/_0.64)] p-5 backdrop-blur">
                        <p className="text-sm leading-7 text-[var(--vault-muted)]">
                            {game.description || "No description is available for this game yet."}
                        </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {game.release_year ? (
                            <span className="rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] px-3 py-2 text-xs font-semibold text-[var(--vault-muted)]">
                                {game.release_year}
                            </span>
                        ) : null}

                        {game.genres.map((genre) => (
                            <span
                                key={genre}
                                className="rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] px-3 py-2 text-xs font-semibold text-[var(--vault-muted)]"
                            >
                                {formatGenreLabel(genre)}
                            </span>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center gap-3 text-sm">
                        <span className="text-lg font-bold text-[var(--vault-green)]">
                            ★ {rating}
                        </span>
                        <span className="text-[var(--vault-muted)]">
                            Avg Score
                        </span>
                    </div>
                </article>

                <div className="lg:pt-10">
                    <GameDetailsActions gameId={game.game_id} />
                </div>
            </section>

            <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
                <div className="border-b border-[var(--vault-border)] pb-3">
                    <h2 className="text-2xl font-bold text-[var(--vault-text)]">
                        Community Journals
                    </h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {["First impressions", "Completion notes", "Worth revisiting"].map((title) => (
                        <article
                            key={title}
                            className="rounded-md border border-[var(--vault-border)] bg-[rgb(31_31_34_/_0.72)] p-4 text-sm text-[var(--vault-muted)]"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-bold text-[var(--vault-text)]">{title}</h3>
                                <span className="text-xs text-[var(--vault-green)]">N/A</span>
                            </div>
                            <p>
                                Reviews for this game can be connected here once the community review feed is wired.
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
