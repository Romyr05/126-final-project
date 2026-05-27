export const dynamic = "force-dynamic";   
import FilterPanel from "@/components/catalog/FilterPanel";
import GameCardCatalog from "@/components/catalog/GameCardCatalog";
import Searchbar from "@/components/catalog/Searchbar";
import { getGames } from "@/lib/api";
import { useState } from "react";
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

// Made this since Game[] is alraedy an array and wala . property ang array
type gameOutput = {
    count: number,
    games: Game[],
};

export default async function CatalogPage() {
    return (
        <div>
            <CatalogClient/>
        </div>
    );
}