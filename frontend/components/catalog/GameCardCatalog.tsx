/* 
component that displays a list of game cards, arranged in an automatic
grid; takes two parameters:

limit => number of games to be displayed
offset => offset from ID 1

uses the API to fetch the games then displays
*/

"use client"

import GameCard from "@/components/catalog/GameCard";
import type { Game } from "@/app/catalog/page";

type Data = {
    games : Game[],
    loading : boolean,
}


export default function GameCardCatalog(data : Data) {
    if (data.loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-64 animate-pulse rounded-md border border-[var(--vault-border)] bg-[var(--vault-surface)]"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-5
            auto-rows-[20rem]
            gap-4
            w-full
        ">
            {data.games.map((game : Game) => (
                <GameCard 
                    key={game.game_id}
                    title={game.title}
                    genres={game.genres}
                    userRating={game.avg_user_rating}
                    websiteRating={game.external_rating}
                />
            ))}
        </div>
    );
}
