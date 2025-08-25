// src/components/roulette/table-layout/RouletteZeroBet.tsx

import type { RouletteBet, RoulettePlaceBet } from "@/lib/types";
import { RouletteBetButton } from "@/components/roulette/RouletteBetButton";

interface RouletteZeroBetProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

export const RouletteZeroBet = ({
  bets,
  handlePlaceBet,
}: RouletteZeroBetProps) => {
  return (
    <div className="row-start-1 row-end-4 col-start-1 col-end-2 relative flex items-center overflow-hidden bg-green-700 shadow-md border-r-2 border-gray-400 rounded-l-xl">
      <div className="relative w-full h-full flex items-center justify-center p-1.5">
        <RouletteBetButton
          label="0"
          totalBet={bets["0"] ?? 0}
          onClick={() => handlePlaceBet("0")}
          className="flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-full w-full bg-transparent rounded-l-lg"
        />
      </div>
    </div>
  );
};
