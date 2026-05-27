export const dynamic = "force-dynamic";   
import { getGames } from "@/lib/api";
import CatalogClient from "./pageclient";

export type Game = {
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

const limit = 40;
const offset = 99;


// Made this since Game[] is alraedy an array and wala . property ang array
type gameOutput = {
    count: number,
    games: Game[],
};

export default async function CatalogPage() {
    const fetched = await getGames<gameOutput>(limit, offset);
    const allGames = fetched.games;

    return (
        <div>
            <CatalogClient
                games={allGames}
            />
        </div>
    );
}