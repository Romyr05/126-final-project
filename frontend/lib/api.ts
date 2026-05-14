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

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

//Requests all games
export function getGames<T>() {
  return request<T>("/games");
}

//Requests by game id
export function getGame<T>(gameId: string) {
  return request<T>(`/games/${gameId}`);
}


// Requests Recommendation
export function getRecommendations<T>() {
  return request<T>("/recommendations");
}
