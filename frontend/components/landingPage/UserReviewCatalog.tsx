/*
This component groups multiple UserReview components into a horizontal scrollable row.
When there are many reviews, it allows horizontal scrolling (overflow-x).
*/

import UserReview from "./UserReview";

type User = {
  name: string;
  review: string;
  image: string;
};

type UserReviewListProps = {
  users: User[];
};

//takes in a UserReviewListProps object
function UserReviewCatalog({ users }: UserReviewListProps) {
  return (
    <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-zinc-600">
      {users.map((user, index) => (
        <div key={index} className="flex-shrink-0">
          <UserReview
            name={user.name}
            review={user.review}
            image={user.image}
          />
        </div>
      ))}
    </div>
  );
}

export default UserReviewCatalog;