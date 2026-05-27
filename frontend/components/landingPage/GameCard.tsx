/*
this is a component that shows a game and its image
this is the "GameCard.tsx"
*/

import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { formatGenreLabel } from "@/lib/formatGenre";

type GameCardProps = {
    title: string,  
    genres: string[],
    image: string | null
}

function GameCard({ title, genres, image }: GameCardProps) {
    const initials = title
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

    return (
        <div className="relative w-64 h-64 flex-shrink-0 overflow-hidden">
            <Card>
                {/* Background Image */}
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="16rem"
                        className="absolute inset-0 w-full h-full object-cover rounded-full"
                    />
                ) : (
                    <div className="absolute inset-0 grid place-items-center rounded-full bg-zinc-800 text-4xl font-black text-zinc-500">
                        {initials}
                    </div>
                )}

                {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

                {/* Genres */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                    {genres.map((genre, index) => (
                        <span
                            key={index}
                            className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm"
                        >
                            {formatGenreLabel(genre)}
                        </span>
                    ))}
                </div>
                
                <CardFooter>
                    {/* Title */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                        <h2 className="text-white text-lg font-bold text-center drop-shadow-md">
                            {title}
                        </h2>
                    </div>
                </CardFooter>
                
            </Card>

        </div>
    );
}

export default GameCard;
