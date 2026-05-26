// Made this since pabalik balik sila


export type ProfileGame = {
  game_id: string;
  title: string;
  cover_image: string | null;
};

export type ProfileFavorite = {
  favorite_id: string;
  created_at: string;
  game: ProfileGame | null;
};

export type ProfileReview = {
  review_id: string;
  rating: number;
  review_text: string | null;
  date_updated: string;
  game: ProfileGame | null;
};

export type ProfileResponse = {
  user: {
    user_id: string;
    username: string;
    email: string;
  };
  stats: {
    logged: number;
    avg_rating: number;
    completed: number;
  };
  favorites: ProfileFavorite[];
  recent_reviews: ProfileReview[];
};


export type ProfileSummary = {
  user: {
    username: string;
    email: string;
  };
  stats: {
    logged: number;
    avg_rating: number;
    completed: number;
  };
};