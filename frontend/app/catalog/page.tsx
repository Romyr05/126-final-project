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

const limit = 30;
const offset = 0;


// Made this since Game[] is alraedy an array and wala . property ang array
type gameOutput = {
    count: number,
    games: Game[],
};

export default async function CatalogPage() {
    /*
    before we render the CatalogClient, we essentially do a server-side
    preload of important variables (note how page.tsx is server-side
    while pageclient.tsx is client-side)
    */

    const res = await getGames<gameOutput>(limit, offset);
    const allGames = res.games;

    return (
        <div>
            <CatalogClient
                games={allGames}
                init_limit={limit}
                init_offset={offset}
            />
        </div>
    );
}