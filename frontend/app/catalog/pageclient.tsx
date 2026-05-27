import type { Game } from "./page";

let searchQuery : string = "";
let searchedGenres : string[] = [];
let allGames : Game[] = [];
let limit : number = 40;
let offset : number = 0;

export default function CatalogClient() {
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