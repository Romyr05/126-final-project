/*
subcomponent of catalog/GameCard.tsx that displays a genre name
*/

import { formatGenreLabel } from "@/lib/formatGenre";

type Data = {
    genreName : string
}

export default function GenreTag(data : Data) {
    return (
        <div className="
            inline-block 
            w-1/3
            text-center
            bg-(--var1-2)
            border
            border-(--var1-5)
            rounded-xl 
            pl-1.5 pr-1.5
            uppercase
        ">
            <span className="reg-text-s">
                {formatGenreLabel(data.genreName)}
            </span>
        </div>
    )
}
