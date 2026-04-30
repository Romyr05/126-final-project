const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getGames<T>() {
  return request<T>("/games");
}

export function getGame<T>(gameId: string) {
  return request<T>(`/games/${gameId}`);
}

export function getRecommendations<T>() {
  return request<T>("/recommendations");
}
