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
import { useState } from "react";

let searchQuery : string = "";
let searchedGenres : string[] = [];
let allGames : Game[] = [];
let limit : number = 40;
let offset : number = 0;

type Data = {
    games : Game[]
}

export default function CatalogClient(data : Data) {
    allGames = data.games;

    const [searchQuery, setSearchQuery] = useState("");

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
                            games={allGames}
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