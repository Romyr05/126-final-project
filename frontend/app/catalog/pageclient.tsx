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
import FilterPanel from "@/components/catalog/FilterPanel";
import GameCardCatalog from "@/components/catalog/GameCardCatalog";
import { useEffect, useState } from "react";
import { getGames, searchGames } from "@/lib/api";

let searchQuery : string = "";
let searchedGenres : string[] = [];
let games : Game[] = [];
let limit : number;
let page : number = 0;

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

export default function CatalogClient(data : Data) {
    limit = data.init_limit;

    const [searchQuery, setSearchQuery] = useState("");
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
                <div className="w-1/3">
                    <div className="rounded-lg border p-4">
                        <FilterPanel/>
                    </div>
                </div>

                {/* Catalog */}
                <div className="w-2/3">
                    <div className="rounded-lg border p-4">
                        <GameCardCatalog
                            games={games}
                            searchQuery={searchQuery}
                            includedGenres={searchedGenres}
                        />
                    </div>
                </div>

            </section>
        </main>
    );
}

function setSearchQuery(newQuery : string) {
    console.log("CHANGED!!");
    searchQuery = newQuery;
}

function setSearchedGenres(newSet : string[]) {
    searchedGenres = newSet;
}

function setPage(newPage : number) {
    page = newPage;
}

function setGames(newGames : Game[]) {
    games = newGames;
}