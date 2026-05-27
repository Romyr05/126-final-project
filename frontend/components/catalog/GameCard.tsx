/*
component that displays a game preview including rough information
such as title, description, rating, genres, etc.

differs in format from the landing page gamecards
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { formatGenreLabel } from "@/lib/formatGenre";

type CardData = {
    title : string,
    coverImage : string | null,
    genres : string[],
    userRating : number | null,
    websiteRating : number | null,
    slug : string | null,
};

function getCoverImageSrc(coverImage : string | null) {
    if (!coverImage) {
        return "/images/dummyGameImg.png";
    }

    if (coverImage.startsWith("//")) {
        return `https:${coverImage}`;
    }

    return coverImage;
}

export default function GameCard(data : CardData) {
    const rating = getDisplayRating(data.userRating, data.websiteRating);
    const titleSizeClass = getTitleSizeClass(data.title);
    const visibleGenres = data.genres.slice(0, 2);
    const coverImage = getCoverImageSrc(data.coverImage);

    const card = (
        <article className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--vault-purple)]">
            <div className="relative min-h-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,var(--vault-surface),var(--vault-bg-soft))]">
                <Image
                    src={coverImage}
                    alt={`${data.title} cover`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    className="object-cover object-top transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--vault-surface)] to-transparent" />
            </div>

            <div className="flex min-h-28 flex-col justify-end gap-1.5 p-3">
                <div className="flex items-center gap-1 text-xs font-bold text-[var(--vault-green)]">
                    <FontAwesomeIcon icon={faStar} className="size-3" />
                    <span>{rating}</span>
                </div>

                <h2 className={`line-clamp-2 break-words font-bold leading-tight text-[var(--vault-text)] [overflow-wrap:anywhere] ${titleSizeClass}`}>
                    {data.title}
                </h2>

                <div className="flex min-h-5 flex-wrap gap-x-2 gap-y-1 overflow-hidden">
                    {visibleGenres.map((genre) => (
                        <span
                            key={genre}
                            className="truncate text-xs font-medium text-[var(--vault-muted)]"
                        >
                            {formatGenreLabel(genre)}
                        </span>
                    ))}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-md border border-transparent transition group-hover:border-[var(--vault-purple)]" />
        </article>
    );

    if (!data.slug) {
        return card;
    }

    return (
        <Link href={`/catalog/${data.slug}`} className="block h-full focus:outline-none focus:ring-2 focus:ring-[var(--vault-purple)] focus:ring-offset-2 focus:ring-offset-[var(--vault-bg)]">
            {card}
        </Link>
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

function getTitleSizeClass(title : string) {
    if (title.length > 46) {
        return "text-[0.72rem]";
    }

    if (title.length > 34) {
        return "text-xs";
    }

    if (title.length > 22) {
        return "text-sm";
    }

    return "text-base";
}
