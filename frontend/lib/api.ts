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
    // with fall back if no
    throw new Error(data?.detail ?? `API request failed: ${response.status}`)
  }

  return data as T;
}

//Requests all games
export function getGames<T>(
  limit : number = 20,
  offset : number = 0
) {
  return request<T>(`/games?limit=${limit}&offset=${offset}`);
}

//Requests by game id
export function getGame<T>(gameId: string) {
  return request<T>(`/games/${gameId}`);
}


// Requests Recommendation
export function getRecommendations<T>() {
  return request<T>("/recommendations");
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

export function searchGames<T>(query: string) {
  return request<T>(`/games/search?q=${encodeURIComponent(query)}`)
}