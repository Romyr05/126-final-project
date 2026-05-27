import { Heart } from "lucide-react";
import type { ProfileFavorite } from "@/lib/types/profile";

type ProfileFavoritesProps = {
    favorites: ProfileFavorite[];
};

const FAVORITE_LIMIT = 4;

export default function ProfileFavorites({ favorites }: ProfileFavoritesProps) {
    const visibleFavorites = favorites.slice(0, FAVORITE_LIMIT);

    return (
        <section className="space-y-5">
            <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[var(--vault-purple)]" />
                <h2 className="text-lg font-semibold text-[var(--vault-text)]">
                    Favorites
                </h2>
            </div>

            {visibleFavorites.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleFavorites.map((favorite) => {
                        const game = favorite.game;

                        return (
                            <article
                                key={favorite.favorite_id}
                                className="group relative flex h-[400px] overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)]"
                            >
                                {game?.cover_image ? (
                                    <div
                                        aria-label={game.title}
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                                        role="img"
                                        style={{ backgroundImage: `url(${game.cover_image})` }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(216,180,254,0.08),transparent_28%),var(--vault-bg-soft)]" />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

                                <div className="relative mt-auto w-full p-4">
                                    <p className="line-clamp-2 text-sm font-medium text-[var(--vault-text)]">
                                        {game?.title ?? "No title for game"}
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
}
