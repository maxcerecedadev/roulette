// src/utils/rouletteConstants.ts

export const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
export const blackNumbers = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

export const groupBets: Record<string, number[]> = {
  "1-18": Array.from({ length: 18 }, (_, i) => i + 1),
  "19-36": Array.from({ length: 18 }, (_, i) => i + 19),
  PAR: Array.from({ length: 18 }, (_, i) => (i + 1) * 2),
  IMPAR: Array.from({ length: 18 }, (_, i) => i * 2 + 1),
  ROJO: redNumbers,
  NEGRO: blackNumbers,
  "1ra 12": Array.from({ length: 12 }, (_, i) => i + 1),
  "2da 12": Array.from({ length: 12 }, (_, i) => i + 13),
  "3ra 12": Array.from({ length: 12 }, (_, i) => i + 25),
  "2:1-1": Array.from({ length: 12 }, (_, i) => i * 3 + 1),
  "2:1-2": Array.from({ length: 12 }, (_, i) => i * 3 + 2),
  "2:1-3": Array.from({ length: 12 }, (_, i) => i * 3 + 3),
};
