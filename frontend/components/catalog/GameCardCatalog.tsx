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
    //limit : number,
    //offset : number,
    searchQuery : string,
    includedGenres : string[]
}


export default function GameCardCatalog(data : Data) {
    return (
        <div className="
            grid
            grid-cols-3
            auto-rows-[60vh]
            gap-4
            w-auto h-auto
        
        ">
            {data.games.map((game : Game) => (
                <GameCard 
                    key={game.game_id}
                    title={game.title}
                    genres={["Roleplay", "Simulator", "Action"]}
                    userRating={game.avg_user_rating}
                    websiteRating={game.external_rating}
                    releaseYear={game.release_year}
                    description={game.description}
                    image={game.cover_image}
                />
            ))}
        </div>
    );
}