const genreLabelOverrides: Record<string, string> = {
  "real time strategy (rts)": "RTS",
  "real-time strategy (rts)": "RTS",
  "real time strategy": "RTS",
  "real-time strategy": "RTS",
  "role-playing (rpg)": "RPG",
  "role-playing": "RPG",
  "role playing": "RPG",
  "turn-based strategy": "TBS",
  "turn based strategy": "TBS",
  "turn-based startegy": "TBS",
  "turn based startegy": "TBS",
  "hack and slash/beat 'em up": "HACK AND SLASH",
  "hack and slash/beat ’em up": "HACK AND SLASH",
  "hack and slash": "HACK AND SLASH",
};

export function formatGenreLabel(name: string) {
  const normalizedName = name.trim().toLowerCase();
  const override = genreLabelOverrides[normalizedName];

  if (override) {
    return override;
  }

  return name.trim().toUpperCase();
}
