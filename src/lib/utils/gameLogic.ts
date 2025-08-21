// src/utils/gameLogic.ts

import { groupBets, redNumbers } from "../constants/rouletteConstants";

export const calculateWinnings = (
  winningNumber: number,
  bets: Record<string, number>
): number => {
  let winnings = 0;
  if (bets[winningNumber.toString()]) {
    winnings += (bets[winningNumber.toString()] || 0) * 35;
  }
  for (const key in groupBets) {
    if (groupBets[key].includes(winningNumber) && (bets[key] || 0) > 0) {
      if (
        key === "1ra 12" ||
        key === "2da 12" ||
        key === "3ra 12" ||
        key.startsWith("2:1")
      ) {
        winnings += bets[key] * 2;
      } else {
        winnings += bets[key] * 1;
      }
    }
  }
  return winnings;
};

export const getColor = (number: number): "red" | "black" | "green" => {
  if (number === 0) {
    return "green";
  }
  return redNumbers.includes(number) ? "red" : "black";
};
