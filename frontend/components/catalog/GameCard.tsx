/*
component that displays a game preview including rough information
such as title, description, rating, genres, etc.

differs in format from the landing page gamecards
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GenreTag from "./GenreTag";
import RatingsPanel from "./RatingsPanel";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { ReactNode } from "react";

type CardData = {
    title : string,
    genres : string[],
    userRating : number | null,
    websiteRating : number | null,
    releaseYear : number | null,
    description : string | null,
    image : string | null
};

export default function GameCard(data : CardData) {
    return (
        <div className="
            flex
            flex-col
            w-full h-full
            p-3
            rounded-lg
            bg-(--color1-1)
            gap-1
        ">
            {/* IMAGE DIV */}
            <div className="
                flex
                items-center
                justify-center
                w-full h-5/12
                overflow-hidden
                shrink-0
            ">
                <img 
                    alt="minecraft"
                    src={
                        (data.image !== null) ?
                        (data.image) :
                        ("")
                    }
                    className="w-full h-full object-cover"
                ></img>
            </div>

            {/* CONTENT DIV */}
            <div className="
                flex
                flex-col
                gap-1
                w-full h-7/12
                shrink-0
            ">
                {/* content -> title */}
                <div className="block">
                    <span className="emp-text-m">
                        {data.title}
                    </span>
                </div>

                {/* content -> genres */}
                <div className="flex flex-row h-1/7 gap-1">
                    {
                    data.genres.map((genre) => (
                        <GenreTag 
                            key={genre} 
                            genreName={genre} 
                        />
                    ))
                    }
                </div>

                {/* content -> metadata */}
                <div className="flex flex-row justify-between h-1/7">

                    {/* ratings panel (user/external ratings) */}
                    <div className="block mt-0.5">
                        <RatingsPanel
                            userRating = {
                                (data.userRating !== null) ? 
                                (data.userRating.toFixed(1)) :
                                ("N/A")
                            } 
                            websiteRating ={
                                (data.websiteRating !== null) ?
                                (data.websiteRating.toFixed(0)) :
                                ("N/A")    
                            }
                        />
                    </div>

                    {/* release date */}
                    <div className="text-right mt-0.5 min-h-0">
                        <FontAwesomeIcon 
                                icon={faCalendar}
                                className="inline-block size-4 text-(--var1-5) mt-px"
                        />
                        <span className="inline-block reg-text text-right ml-1.25">
                            {data.releaseYear}
                        </span>
                    </div>
                </div>
                
                {/* content -> description */}
                <div className="
                    block
                    min-h-0
                    h-full
                    overflow-y-hidden
                ">
                    {descriptionOutput(data.description)}
                </div>
            </div>
        </div>
    );
}


function descriptionOutput(desc : string | null) : ReactNode {
    if ((desc == null) || (desc?.length == 0)) {
        return (
            <span className="fade-text italic wrap-anywhere">
                No description available.
            </span>
        )
    } else {
        return (
            <span className="reg-text wrap-anywhere">
                {desc}
            </span>
        )
    }
}