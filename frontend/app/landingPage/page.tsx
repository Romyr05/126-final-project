"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getGames, getRecentReviews } from "@/lib/api";
import type { Game } from "@/app/catalog/page";

type GamesResponse = {
  count: number;
  games: Game[];
};

type RecentReview = {
  review_id: string;
  rating: number;
  review_text: string | null;
  date_updated: string;
  user: {
    username: string;
  } | null;
  game: {
    game_id: string;
    title: string;
    cover_image: string | null;
  } | null;
};

function getCoverImageSrc(coverImage: string | null | undefined) {
  if (!coverImage) {
    return "/images/dummyGameImg.png";
  }

  if (coverImage.startsWith("//")) {
    return `https:${coverImage}`;
  }

  return coverImage;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LandingPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [gamesError, setGamesError] = useState("");
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    let active = true;

    getGames<GamesResponse>(6, 0, { sort: "popularity" })
      .then((data) => {
        if (active) {
          setGames(data.games);
        }
      })
      .catch((error) => {
        if (active) {
          setGamesError(error instanceof Error ? error.message : "Unable to load games.");
        }
      })
      .finally(() => {
        if (active) {
          setGamesLoading(false);
        }
      });

    getRecentReviews<RecentReview[]>(4)
      .then((data) => {
        if (active) {
          setReviews(data.slice(0, 4));
        }
      })
      .catch((error) => {
        if (active) {
          setReviewsError(error instanceof Error ? error.message : "Unable to load reviews.");
        }
      })
      .finally(() => {
        if (active) {
          setReviewsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="bg-[var(--vault-bg)] text-[var(--vault-text)]">
      <section className="relative min-h-[28rem] overflow-hidden border-b border-[var(--vault-border)]">
        <Image
          src="/images/LandingPageImageOverlay.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,15,16,0.18),var(--vault-bg)_78%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,16,0.08),var(--vault-bg)_96%)]" />

        <div className="relative z-10 mx-auto flex min-h-[28rem] max-w-4xl items-center justify-center px-6 text-center">
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-[var(--vault-text)] sm:text-5xl">
            A fun way to track games you&apos;ve played. Save those you want to play.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <SectionHeader title="Popular games this week" />

        {gamesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]"
              />
            ))}
          </div>
        ) : gamesError ? (
          <p className="rounded-md border border-[var(--vault-danger)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-danger)]">
            {gamesError}
          </p>
        ) : games.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {games.map((game) => (
              <LandingGameCard key={game.game_id} game={game} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-muted)]">
            No popular games are available yet.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14 pt-4">
        <SectionHeader title="Recent reviews" />

        {reviewsLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]"
              />
            ))}
          </div>
        ) : reviewsError ? (
          <p className="rounded-md border border-[var(--vault-danger)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-danger)]">
            {reviewsError}
          </p>
        ) : reviews.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {reviews.slice(0, 4).map((review) => (
              <LandingReviewCard key={review.review_id} review={review} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] p-4 text-sm text-[var(--vault-muted)]">
            No recent reviews yet.
          </p>
        )}
      </section>
    </main>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <h2 className="shrink-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--vault-muted)]">
        {title}
      </h2>
      <div className="h-px flex-1 bg-[var(--vault-border)]" />
    </div>
  );
}

function LandingGameCard({ game }: { game: Game }) {
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
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
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

function LandingReviewCard({ review }: { review: RecentReview }) {
  const username = review.user?.username ?? "vault_user";
  const gameTitle = review.game?.title ?? "Untitled game";

  return (
    <article className="grid grid-cols-[4.5rem_1fr] gap-4 rounded-md border border-[var(--vault-border)] bg-[rgb(31_31_34_/_0.56)] p-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]">
        <Image
          src={getCoverImageSrc(review.game?.cover_image)}
          alt={`${gameTitle} cover`}
          fill
          sizes="72px"
          className="object-cover object-top"
        />
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--vault-surface-raised)] text-xs font-black text-[var(--vault-purple)]">
            {getInitials(username)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[var(--vault-text)]">
              {username}
            </p>
            <p className="truncate text-[10px] text-[var(--vault-muted-strong)]">
              {gameTitle}
            </p>
          </div>
        </div>

        <p className="line-clamp-4 text-sm leading-6 text-[var(--vault-muted)]">
          &ldquo;{review.review_text || `Rated ${gameTitle} ${review.rating}/5.`}&rdquo;
        </p>
      </div>
    </article>
  );
}
