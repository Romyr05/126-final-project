/*
This component is a container for multiple GameCard components.

It receives an array of game objects as props and renders them.
Each game is passed down to the GameCard component for display.

This is a "presentational container" — it does not fetch data itself,
it only renders what is given to it.
*/

import GameCard from "./GameCard";

type Game = {
  title: string;
  genres: string[];
  image: string | null;
};

type GameCardContainerProps = {
  games: Game[];
};

function GameCardCatalog({ games }: GameCardContainerProps) {
  return (
    <div
      className="
        flex gap-5
        overflow-x-auto
        bg-gradient-to-b from-zinc-900 via-black to-zinc-950
        p-6 rounded-2xl
        shadow-2xl
      "
    >
      {games.map((game, index) => (
        <GameCard
          key={index}
          title={game.title}
          genres={game.genres}
          image={game.image}
        />
      ))}
    </div>
  );
}

export default GameCardCatalog;