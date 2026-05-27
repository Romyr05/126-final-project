/*
This component displays a user review card.
It shows a small circular profile picture next to the user's name,
and underneath it displays the user's written review.
*/

type UserReviewProps = {
  name: string;
  review: string;
  image: string;
};

function UserReview({ name, review, image }: UserReviewProps) {
  return (
    <div className="flex gap-3 p-4 bg-zinc-900 rounded-xl text-white w-full max-w-md">
      
      {/* User Image */}
      <img
        src={image}
        alt={name}
        className="w-12 h-12 rounded-full object-cover"
      />

      {/* User Info */}
      <div className="flex flex-col">
        
        {/* Name */}
        <h3 className="font-semibold text-sm">
          {name}
        </h3>

        {/* Review */}
        <p className="text-sm text-zinc-300 mt-1">
          {review}
        </p>

      </div>
    </div>
  );
}

export default UserReview;