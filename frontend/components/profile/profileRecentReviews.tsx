import { History, Star } from "lucide-react";
import type { ProfileReview } from "@/lib/types/profile";


type ProfileRecentReviewsProps = {
    reviews: ProfileReview[];
};

const REVIEW_LIMIT = 4;

export default function ProfileRecentReviews({ reviews }: ProfileRecentReviewsProps) {
    const visibleReviews = reviews.slice(0, REVIEW_LIMIT);

    return (
        <section className="space-y-5">
            <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[var(--vault-purple)]" />
                <h2 className="text-lg font-semibold text-[var(--vault-text)]">
                    Recent Journal Entries
                </h2>
            </div>

            <div className="space-y-4">
                {visibleReviews.length > 0 ? (
                    visibleReviews.map((review) => {
                        const game = review.game;

                        return (
                            <article
                                key={review.review_id}
                                className="grid gap-4 rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] p-4 sm:min-h-24 sm:grid-cols-[64px_1fr_auto] sm:items-start"
                            >
                                <div className="h-20 w-full overflow-hidden rounded-md bg-[radial-gradient(circle_at_30%_20%,rgba(216,180,254,0.08),transparent_30%),var(--vault-surface)] sm:h-16 sm:w-16">
                                    {game?.cover_image ? (
                                        <div
                                            aria-label={game.title}
                                            className="h-full w-full bg-cover bg-center"
                                            role="img"
                                            style={{ backgroundImage: `url(${game.cover_image})` }}
                                        />
                                    ) : null}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-medium text-[var(--vault-text)]">
                                        {game?.title ?? "Untitled game"}
                                    </h3>

                                    <div className="mt-1 flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                className={`h-3 w-3 ${
                                                    index < review.rating
                                                        ? "text-[var(--vault-purple)]"
                                                        : "text-[var(--vault-muted-strong)]"
                                                }`}
                                                fill={index < review.rating ? "currentColor" : "none"}
                                            />
                                        ))}
                                        <span className="ml-2 text-xs text-[var(--vault-muted)]">
                                            {formatRating(review.rating)} / 5.0
                                        </span>
                                    </div>

                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--vault-muted)]">
                                        {review.review_text || "No review text yet."}
                                    </p>
                                </div>

                                <time className="text-[10px] font-medium text-[var(--vault-muted-strong)] sm:text-right">
                                    {formatReviewDate(review.date_updated)}
                                </time>
                            </article>
                        );
                    })
                ) : null}
            </div>
        </section>
    );
}

function formatReviewDate(date: string) {
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function formatRating(rating: number) {
    return rating.toFixed(1);
}
