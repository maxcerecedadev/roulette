// src/utils/gameLogic.ts

import { redNumbers } from "../constants/rouletteConstants";

export const getColor = (number: number): "red" | "black" | "green" => {
  if (number === 0) {
    return "green";
  }
  return redNumbers.includes(number) ? "red" : "black";
};
