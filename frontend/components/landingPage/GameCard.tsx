/*
this is a component that shows a game and its image
this is the "GameCard.tsx"
*/

import Link from "next/link"
import Image from "next/image"

type GameCardProps = {
  gameId: string
  title: string
  imageStr: string
  rating?: number | null
}

function GameCard({ gameId, title, imageStr, rating }: GameCardProps) {
  return (
    <Link href={`/games/${gameId}`}>
      <div>
        <Image
          src={imageStr || "/images/dummyGameImg.png"}
          alt={title}
          width={150}
          height={120}
        />

//function that takes in an object as a parameter
function GameCard({ title, imageStr }: GameCardProps) {
    const img = imageStr;
    
    return (
        <div className = "">
            <h1>{title}</h1>
            <img src='/images/dummyGameImg.png' alt='minecraft'></img>
        </div>
            
        
    );
    
}

        {rating !== undefined && rating !== null && (
          <p>⭐ {rating}</p>
        )}
      </div>
    </Link>
  )
}

export default GameCard