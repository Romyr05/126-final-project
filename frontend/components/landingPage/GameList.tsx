
/*
this is a component that shows a Lists of gamecards 
makes use of the GameCard component
Flexes the gamecards in the landing page
*/import GameCard from "./GameCard"

export type Game = {
  gameId: string
  title: string
  imageStr: string
  rating?: number | null
}

type GameListProps = {
  games: Game[]
}

export default function GameList({ games }: GameListProps) {
  return (
    <div>
      {games.map((game) => (
        <GameCard
          key={game.gameId}
          gameId={game.gameId}
          title={game.title}
          imageStr={game.imageStr}
          rating={game.rating}
        />
      ))}
    </div>
  )
}