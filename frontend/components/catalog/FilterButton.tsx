/*
Button representing a genre that can be toggled on and off to filter
that genre in the catalog view
*/

"use client"

type Data = {
    name : string,
    searchGenres : string[],
    setSearchGenres : (newFilterArr : string[]) => void,
}

export default function FilterButton(data : Data) {
    let toggleState = false;
    let selected = data.searchGenres.includes(data.name);

    return (
        <button
            // define behavior when clickrd
            onClick={() => {
                if (selected == true) {
                    // "remove" it from the searchGenres
                    data.setSearchGenres(
                        data.searchGenres.filter(
                            (item : string) => item !== data.name
                        )
                    );

                } else {
                    // add it to the searchGenres
                    data.setSearchGenres(
                        data.searchGenres.concat([data.name])
                    );
                }
            }}

            className={`
                rounded-full
                border
                px-3
                py-1
                text-sm
                transition-opacity

                ${selected ? "bg-white text-black hover:bg-gray-100" : "bg-transparent text-white"}
            `}

            type="button"
        >
            {data.name}
        </button>
    )
}

