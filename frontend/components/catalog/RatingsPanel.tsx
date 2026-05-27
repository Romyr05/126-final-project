/*
subcomponent of catalog/GameCard.tsx that displays a the rating and
like/dislike count of the game
*/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faStar } from '@fortawesome/free-solid-svg-icons'

type Data = {
    userRating : string,
    websiteRating : string,
}

export default function RatingsPanel(data : Data) {
    return (
        <div className="
            flex
            flex-row
            gap-4
        ">
            <div className="
                flex
                flex-row
            ">
                <FontAwesomeIcon
                    icon={faHeart}
                    className="inline size-4 text-(--var1-5) mt-px"
                />
                <span className="inline reg-text ml-1.25">
                    {data.userRating}
                </span>
            </div>
            
            <div className="
                flex
                flex-row
            ">
                <FontAwesomeIcon
                    icon={faStar}
                    className="inline size-4 text-(--var1-5) mt-px"
                />
                <span className="inline reg-text ml-1.25">
                    {data.websiteRating} / 100
                </span>
            </div>
        </div>
    )
}