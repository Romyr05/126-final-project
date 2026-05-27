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






export default function LandingPage() {
  return (
    <div>
      <ImageOverlayCard image = "/images/LandingPageImageOverlay.jpg" text = "Dummy text"></ImageOverlayCard>
      
      <GameCardCatalog games={mockGames}></GameCardCatalog>

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