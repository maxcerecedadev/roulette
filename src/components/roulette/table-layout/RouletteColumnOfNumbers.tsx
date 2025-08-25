// src/components/roulette/table-layout/RouletteColumnOfNumbers.tsx

import type { RouletteBet, RoulettePlaceBet, BetKey } from "@/lib/types"; // Import BetKey
import { redNumbers } from "@/lib/constants/rouletteConstants";
import { RouletteNumberCell } from "./RouletteNumberCell";

interface RouletteColumnOfNumbersProps {
  column: number[];
  rowStart: number;
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

export const RouletteColumnOfNumbers = ({
  column,
  rowStart,
  bets,
  handlePlaceBet,
}: RouletteColumnOfNumbersProps) => {
  return (
    <>
      {column.map((num, index) => {
        const colStart = index + 2;
        const isRed = redNumbers.includes(num);

        // Here's the fix: cast the string to BetKey.
        const betKey = `${num}` as BetKey;

        return (
          <div
            key={num}
            className={`row-start-${rowStart + index} col-start-${colStart}`}
          >
            <RouletteNumberCell
              label={num.toString()}
              betKey={betKey}
              totalBet={bets[betKey] ?? 0}
              onClick={() => handlePlaceBet(betKey)}
              isRed={isRed}
            />
          </div>
        );
      })}
    </>
  );
};
