// src/components/roulette/table-layout/RouletteNumberGrid.tsx

import type { RouletteBet, RoulettePlaceBet, BetKey } from "@/lib/types";
import { RouletteNumberCell } from "./RouletteNumberCell";
import { RouletteColumnBetCell } from "./RouletteColumnBetCell";

interface RouletteNumberGridProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

export const RouletteNumberGrid = ({
  bets,
  handlePlaceBet,
}: RouletteNumberGridProps) => {
  const numbersTopRow = Array.from({ length: 12 }, (_, i) => i * 3 + 3);
  const numbersMiddleRow = Array.from({ length: 12 }, (_, i) => i * 3 + 2);
  const numbersBottomRow = Array.from({ length: 12 }, (_, i) => i * 3 + 1);

  return (
    <>
      {/* Fila superior */}
      {numbersTopRow.map((num, index) => {
        const betKey = `${num}` as BetKey;
        return (
          <div key={num} className={`row-start-1 col-start-${index + 2}`}>
            <RouletteNumberCell
              label={num.toString()}
              betKey={betKey}
              totalBet={bets[betKey] ?? 0}
              bets={bets} // <-- Pasa el objeto bets aquí
              onClick={handlePlaceBet}
            />
          </div>
        );
      })}
      <div className="row-start-1 col-start-14">
        <RouletteColumnBetCell
          label="2:1"
          betKey="2:1-1"
          bets={bets}
          handlePlaceBet={handlePlaceBet}
          isTop={true}
        />
      </div>

      {/* Fila del medio */}
      {numbersMiddleRow.map((num, index) => {
        const betKey = `${num}` as BetKey;
        return (
          <div key={num} className={`row-start-2 col-start-${index + 2}`}>
            <RouletteNumberCell
              label={num.toString()}
              betKey={betKey}
              totalBet={bets[betKey] ?? 0}
              bets={bets} // <-- Pasa el objeto bets aquí
              onClick={handlePlaceBet}
            />
          </div>
        );
      })}
      <div className="row-start-2 col-start-14">
        <RouletteColumnBetCell
          label="2:1"
          betKey="2:1-2"
          bets={bets}
          handlePlaceBet={handlePlaceBet}
        />
      </div>

      {/* Fila inferior */}
      {numbersBottomRow.map((num, index) => {
        const betKey = `${num}` as BetKey;
        return (
          <div key={num} className={`row-start-3 col-start-${index + 2}`}>
            <RouletteNumberCell
              label={num.toString()}
              betKey={betKey}
              totalBet={bets[betKey] ?? 0}
              bets={bets} // <-- Pasa el objeto bets aquí
              onClick={handlePlaceBet}
            />
          </div>
        );
      })}
      <div className="row-start-3 col-start-14">
        <RouletteColumnBetCell
          label="2:1"
          betKey="2:1-3"
          bets={bets}
          handlePlaceBet={handlePlaceBet}
          isBottom={true}
        />
      </div>
    </>
  );
};
