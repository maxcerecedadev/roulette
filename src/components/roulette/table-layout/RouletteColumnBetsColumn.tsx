// src/components/roulette/table-layout/RouletteColumnBetsColumn.tsx

import type { RouletteBet, RoulettePlaceBet, BetKey } from "@/lib/types";
import { RouletteColumnBetCell } from "./RouletteColumnBetCell";

interface RouletteColumnBetsColumnProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

export const RouletteColumnBetsColumn = ({
  bets,
  handlePlaceBet,
}: RouletteColumnBetsColumnProps) => {
  return (
    <>
      <div className="row-start-1 col-start-14">
        <RouletteColumnBetCell
          label="2:1"
          betKey={"2:1-1" as BetKey}
          bets={bets}
          handlePlaceBet={handlePlaceBet}
          isTop={true}
        />
      </div>
      <div className="row-start-2 col-start-14">
        <RouletteColumnBetCell
          label="2:1"
          betKey={"2:1-2" as BetKey}
          bets={bets}
          handlePlaceBet={handlePlaceBet}
        />
      </div>
      <div className="row-start-3 col-start-14">
        <RouletteColumnBetCell
          label="2:1"
          betKey={"2:1-3" as BetKey}
          bets={bets}
          handlePlaceBet={handlePlaceBet}
          isBottom={true}
        />
      </div>
    </>
  );
};
