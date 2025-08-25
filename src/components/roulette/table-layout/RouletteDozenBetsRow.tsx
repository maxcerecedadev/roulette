// src/components/roulette/table-layout/RouletteDozenBetsRow.tsx

import type { RouletteBet, RoulettePlaceBet } from "@/lib/types";
import { RouletteDozenBetCell } from "./RouletteDozenBetCell";

interface RouletteDozenBetsRowProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

export const RouletteDozenBetsRow = ({
  bets,
  handlePlaceBet,
}: RouletteDozenBetsRowProps) => {
  return (
    <>
      <div className="row-start-4 col-start-2 col-span-4">
        <RouletteDozenBetCell
          label="1os 12"
          betKey="1os 12"
          bets={bets}
          handlePlaceBet={handlePlaceBet}
        />
      </div>
      <div className="row-start-4 col-start-6 col-span-4">
        <RouletteDozenBetCell
          label="2os 12"
          betKey="2os 12"
          bets={bets}
          handlePlaceBet={handlePlaceBet}
        />
      </div>
      <div className="row-start-4 col-start-10 col-span-4">
        <RouletteDozenBetCell
          label="3os 12"
          betKey="3os 12"
          bets={bets}
          handlePlaceBet={handlePlaceBet}
        />
      </div>
    </>
  );
};
