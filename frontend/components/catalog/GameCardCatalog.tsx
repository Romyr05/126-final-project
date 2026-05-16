/* 
component that displays a list of game cards, arranged in an automatic
grid; takes two parameters:

limit => number of games to be displayed
offset => offset from ID 1

uses the API to fetch the games then displays
*/

import GameCard from "@/components/catalog/GameCard";
import { getGames } from "@/lib/api";

type Game = {
    game_id : number,
    igdb_id : number,
    title : string,
    description : string | null,
    release_year : number | null,
    external_rating : number | null,
    avg_user_rating : number | null,
    cover_image : string | null,
    created_at : string,
    updated_at : string,
    slug : string | null
};


type Data = {
    limit : number,
    offset : number
}


export default async function GameCardCatalog(data : Data) {
    const allGames = await getGames<Game[]>(data.limit, data.offset);

    return (
        <div className="
            grid
            grid-cols-3
            auto-rows-[60vh]
            gap-4
            w-8/12 h-auto
        
        ">
            {allGames.games.map((game : Game) => (
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