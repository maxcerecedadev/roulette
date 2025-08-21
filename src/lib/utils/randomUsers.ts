// utils/generateRandomUsers.ts

const adjectives = [
  "Feliz",
  "Valiente",
  "Rápido",
  "Curioso",
  "Fresco",
  "Mágico",
  "Silencioso",
];
const nouns = ["Pato", "Gato", "Zorro", "Robot", "Ninja", "Árbol", "Estrella"];

const getRandomElement = (arr: string[]): string =>
  arr[Math.floor(Math.random() * arr.length)];

export const generateRandomUser = () => {
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  const id = `test-${Date.now()}`;
  return {
    id: id,
    name: `${adjective} ${noun}`,
    balance: 10000,
  };
};
