/*
You may be looking at this and wondering, why does this exist, Jeyrd?
Don't we already have page.tsx, Jeyrd?

Well, basically pageclient.tsx is an intermediary for page.tsx -- we
want interactivity so we need to have it on client-side ("use client"),
however, we also want to do async calls on the API for our initial
values (which can't be done on client side)

So, page.tsx becomes a light wrapper that exists server-side so it
can asynchronously fetch all the needed API data on page load

And then, it passes the important info onto pageclient.tsx which takes
over the job of managing states and dictating the layout/structure
*/

"use client"

import Searchbar from "@/components/catalog/Searchbar";
import type { Game } from "./page";
import GameCardCatalog from "@/components/catalog/GameCardCatalog";
import { useEffect, useState } from "react";
import { getGames, searchGames } from "@/lib/api";
import FilterButton from "@/components/catalog/FilterButton";

type Data = {
    games : Game[],
    init_limit : number,
    init_offset : number,
}

type SearchGamesRes = {
    query : string,
    count : number,
    games : Game[]
}

type GetGamesRes = {
    count: number,
    games: Game[],
};

const genres : string[] = [
    "Action",
    "Action-Adventure",
    "Adventure",
    "RPG",
    "Simulation",
    "Strategy",
    "Shooter",
    "Sports & Racing",
    "Puzzle",
    "Fighting",
    "Platformer",
    "Survival Horror",
    "MMO",
    "Battle Royale",
    "Sandbox",
    "Stealth",
    "Music & Rhythm",
    "Party",
    "Casual"
]

export default function CatalogClient(data : Data) {
    const limit = data.init_limit;

    const [searchQuery, setSearchQuery] = useState("");
    const [searchGenres, setSearchGenres] = useState<string[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [page, setPage] = useState(1);

    // useEffect triggers whenever something is changed in the
    // dependency array (which in this case is either searchQuery/page)
    useEffect(() => {
        async function loadGames() {
            if (searchQuery != "") {
                const data = await searchGames<SearchGamesRes>(searchQuery);
                console.log(data);
                setGames(data.games);
            } else {
                const data = await getGames<GetGamesRes>(limit, page * limit);
                setGames(data.games);
            }
        }
        loadGames();

        console.log(games);
    }, [searchQuery, page]);

    return (
        <main className="min-h-screen px-6 py-8">
            
            {/* Header Section */}
            <section className="mb-6">
                <h1 className="text-4xl font-bold mb-2">
                    Browse Catalog
                </h1>

                <p className="text-gray-600 max-w-3xl">
                    Explore our collection using filters and search to
                    quickly find what you need.
                </p>
            </section>

            {/* Search Bar */}
            <section className="mb-8">
                <Searchbar
                    setSearchQuery={setSearchQuery}
                />
            </section>

            {/* Main Content */}
            <section className="flex gap-6">

                {/* Sidebar / Filters */}
                <div className="w-1/3 flex flex-col gap-5">
                    <div className="rounded-lg border p-4">
                        <button className="inline">&lt;=</button>
                        &nbsp;Page 1 of 10&nbsp;
                        <button className="inline">=&gt;</button>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h1 className="text-xl font-semibold mb-2">
                            Filter by Genre
                        </h1>

                        <div className="flex flex-wrap gap-1.5">
                            {genres.map((genre : string, i : number) => 
                                <FilterButton 
                                    key={i} 
                                    name={genre}
                                    searchGenres={searchGenres}
                                    setSearchGenres={setSearchGenres}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Catalog */}
                <div className="w-2/3">
                    <div className="rounded-lg border p-4">
                        <GameCardCatalog
                            games={games}
                            searchQuery={searchQuery}
                            includedGenres={searchGenres}
                        />
                    </div>
                </div>

            </section>
        </main>
    );
}