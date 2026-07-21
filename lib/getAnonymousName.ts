const adjectives = [
  "Silent",
  "Shadow",
  "Ghost",
  "Midnight",
  "Hidden",
  "Mystic",
  "Dark",
  "Velvet",
  "Lost",
  "Neon",
];

const nouns = [
  "Raven",
  "Fox",
  "Echo",
  "Wolf",
  "Pixel",
  "Falcon",
  "Phantom",
  "Whisper",
  "Cipher",
  "Specter",
];

export const getAnonymousName = (): string => {
  if (typeof window === "undefined") return "";

  let anonymousName = localStorage.getItem("anonymousName");

  if (!anonymousName) {
    const adjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];

    const noun =
      nouns[Math.floor(Math.random() * nouns.length)];

    anonymousName = `${adjective} ${noun}`;

    localStorage.setItem("anonymousName", anonymousName);
  }

  return anonymousName;
};