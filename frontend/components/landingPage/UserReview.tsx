/*
This component displays a user review card.
It shows a small circular profile picture next to the user's name,
and underneath it displays the user's written review.
*/
import Image from "next/image";

type UserReviewProps = {
  name: string;
  review: string;
  image: string | null;
};

function UserReview({ name, review, image }: UserReviewProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex gap-3 p-4 bg-zinc-900 rounded-xl text-white w-full max-w-md">
      
      {/* User Image */}
      {image ? (
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src={image}
            alt={name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </span>
      ) : (
        <div
          aria-label={name}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-700 text-sm font-semibold text-zinc-100"
        >
          {initials}
        </div>
      )}

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
