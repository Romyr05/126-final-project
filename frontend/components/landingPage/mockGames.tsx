export type Game = {
  title: string;
  genres: string[];
  image: string | null;
};

export const mockGames: Game[] = [
  {
    title: "Elden Ring",
    genres: ["RPG", "Adventure", "Fantasy"],
    image: "/images/elden-ring.jpg",
  },
  {
    title: "The Witcher 3",
    genres: ["RPG", "Open World", "Story Rich"],
    image: "/images/witcher3.jpg",
  },
  {
    title: "Cyberpunk 2077",
    genres: ["RPG", "Sci-Fi", "Open World"],
    image: "/images/cyberpunk.jpg",
  },
  {
    title: "Hades",
    genres: ["Roguelike", "Action", "Indie"],
    image: "/images/hades.jpg",
  },
  {
    title: "Minecraft",
    genres: ["Sandbox", "Survival", "Creative"],
    image: "/images/minecraft.jpg",
  },
  {
    title: "Red Dead Redemption 2",
    genres: ["Open World", "Story Rich", "Action"],
    image: "/images/rdr2.jpg",
  },
  {
    title: "God of War",
    genres: ["Action", "Adventure", "Mythology"],
    image: "/images/godofwar.jpg",
  },
  {
    title: "Sekiro: Shadows Die Twice",
    genres: ["Action", "Souls-like", "Stealth"],
    image: "/images/sekiro.jpg",
  },
  {
    title: "Baldur’s Gate 3",
    genres: ["RPG", "Turn-Based", "Story Rich"],
    image: "/images/bg3.jpg",
  },
  {
    title: "Stardew Valley",
    genres: ["Simulation", "Farming", "Indie"],
    image: "/images/stardew.jpg",
  },
];