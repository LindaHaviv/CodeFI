export const zenQuotes = [
  "breathe. code. repeat.",
  "one line at a time.",
  "embrace the process.",
  "trust the rhythm.",
  "flow state loading...",
  "you're exactly where you need to be.",
  "bugs are just features in disguise.",
  "the journey is the destination.",
  "patience compiles all things.",
  "let the code flow through you.",
  "simplicity is the ultimate sophistication.",
  "be water, my friend.",
  "focus is a superpower.",
  "every keystroke matters.",
  "clarity comes with calm.",
  "the present moment is all we have.",
  "progress, not perfection.",
  "small steps, big results.",
  "your mind is your greatest tool.",
  "stillness breeds creativity.",
  "let go of what doesn't compile.",
  "in the zone.",
  "elegance in simplicity.",
  "debugging is meditation.",
  "commit to the present.",
];

export function getRandomQuote(): string {
  return zenQuotes[Math.floor(Math.random() * zenQuotes.length)];
}
