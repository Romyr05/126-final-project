// This is a helper so that you will not run fetch over and over again

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  // You make the next public api url

export async function request<T>(path: string, init?: RequestInit): Promise<T>{
  const response = await fetch(`${API_URL}${path}`,{
    ...init,  //for the additional request i.e method and body
    credentials: "include",
    headers:{
      "Content-type" : "application/json",
      ...init?.headers,   //override
    },
  });

  // if error ignore and make null
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail?.msg ?? `API request failed: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

//Requests all games
export function getGames<T>(
  limit : number = 20,
  offset : number = 0,
  options?: {
    query?: string;
    genres?: string[];
    sort?: string;
    signal?: AbortSignal;
  }
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (options?.query?.trim()) {
    params.set("q", options.query.trim());
  }

  if (options?.genres?.length) {
    params.set("genres", options.genres.join(","));
  }

  if (options?.sort) {
    params.set("sort", options.sort);
  }

  return request<T>(`/games?${params.toString()}`, {
    signal: options?.signal,
  });
}

//Requests by game id
export function getGame<T>(gameId: string) {
  return request<T>(`/games/${gameId}`);
}

// Requests by game slug
export function getGameBySlug<T>(slug: string) {
  return request<T>(`/games/slug/${encodeURIComponent(slug)}`);
}

// Favorites
export function addFavorite<T>(gameId: string) {
  return request<T>("/favorites", {
    method: "POST",
    body: JSON.stringify({ game_id: gameId }),
  });
}


// Requests Recommendation
export function getRecommendations<T>(limit: number = 6) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  return request<T>(`/recommendations?${params.toString()}`);
}

//-------------------------------- Journal API Requests ---------------------------------
export function createLog<T>(payload: {
  game_id: string
  status: string
  review?: string
  rating?: number
}, accessToken: string) {
  return request<T>("/logs", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}

export function getLogs<T>() {
  return request<T>("/logs")
}

export function getMyReview<T>(gameId: string) {
  return request<T>(`/reviews/${gameId}`)
}

export function getMyReviews<T>() {
  return request<T>("/reviews/me")
}

export function getRecentReviews<T>(limit: number = 4) {
  const params = new URLSearchParams({
    limit: String(limit),
  })

  return request<T>(`/reviews/recent?${params.toString()}`)
}

export function searchGames<T>(query: string) {
  return request<T>(`/games/search?q=${encodeURIComponent(query)}`)
}

export function getGenres<T>() {
  return request<T>("/genres")
}
