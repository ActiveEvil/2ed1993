export const deckColors: Record<string, string> = {
  Librarian: "bg-faction-space-marines",
  Adeptus: "bg-faction-space-marines",
  Inquisition: "bg-faction-imperial-agents",
  "Eldar Seers": "bg-faction-eldar",
  "Ork Weirdboyz": "bg-faction-orks",
  Squat: "bg-faction-squats",
  Tyranid: "bg-faction-tyranids",
  Slaanesh: "bg-faction-slaanesh",
  Tzeentch: "bg-faction-tzeentch",
  Nurgle: "bg-faction-nurgle",
};

// The Sisters of Battle codex is mono throughout and their one datafax, the
// Immolator, is greyscale, so there is no colour to derive. They take the
// Imperial Agents red rather than a token of their own.
export const factionColors: Record<string, string> = {
  "space-marines": "bg-faction-space-marines",
  "imperial-agents": "bg-faction-imperial-agents",
  "imperial-guard": "bg-faction-imperial-guard",
  "sisters-of-battle": "bg-faction-imperial-agents",
  eldar: "bg-faction-eldar",
  orks: "bg-faction-orks",
  squats: "bg-faction-squats",
  tyranids: "bg-faction-tyranids",
  chaos: "bg-faction-chaos",
  necrons: "bg-faction-necrons",
};

export const factionInk: Record<string, string> = {
  "space-marines": "text-2ed-white",
  "imperial-agents": "text-2ed-white",
  "imperial-guard": "text-2ed-white",
  "sisters-of-battle": "text-2ed-white",
  eldar: "text-2ed-black",
  orks: "text-2ed-white",
  squats: "text-2ed-black",
  tyranids: "text-2ed-white",
  chaos: "text-2ed-white",
  necrons: "text-2ed-white",
};
