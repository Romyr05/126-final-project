//the function in which the whole landing page is rendered from top to bottom
//with api calls (not yet done) to get the data

//get components
import UserReviewCatalog from "@/components/landingPage/UserReviewCatalog";
import GameCardCatalog from "@/components/landingPage/GameCardCatalog";
import GameReviewHeader from "@/components/landingPage/landingPageGameReviewHeader"
import ImageOverlayCard from "@/components/landingPage/ImageOverlayCard"

//get the hardcoded (used for testing purposes)
//will be replaced later with data from api calls
import { mockUserReviews } from "@/components/landingPage/mockUserReviews";
import { mockGames } from "@/components/landingPage/mockGames"

import { getGames } from "@/lib/api";


type ApiGame = {
  game_id: string
  igdb_id: number
  title: string
  description: string | null
  release_year: number | null
  external_rating: number | null
  avg_user_rating: number | null
  cover_image: string | null
  created_at: string
  updated_at: string
  slug?: string | null
}

type GetGamesRes = {
  count: number
  games: ApiGame[]
}




export default async function LandingPage() {
  const data =
    await getGames<GetGamesRes>(20, 0);

  // transform api games
  const games = data.games.map(game => ({
    title: game.title,

    // hardcoded for now
    genres: ["Action"],

    image: game.cover_image
  }));

  return (
    <div>
      <ImageOverlayCard image = "/images/LandingPageImageOverlay.jpg" text = "Dummy text"></ImageOverlayCard>
      
      <GameCardCatalog games={games}></GameCardCatalog>

      <div className="bg-zinc-900 px-6 py-10 mt-10">
        <GameReviewHeader />
        {/* gap between header and reviews */}
        <div className="mt-50 ">
          <UserReviewCatalog users={mockUserReviews} />
        </div>

      </div>

    </div>

  );
}