// src/components/roulette/table-layout/RouletteEvenMoneyBetsRow.tsx

import type { BetKey, RouletteBet, RoulettePlaceBet } from "@/lib/types";
import { RouletteSingleBetCell } from "./RouletteSingleBetCell";

interface EvenMoneyBet {
  label: string;
  key: BetKey;
  className: string;
}

interface RouletteEvenMoneyBetsRowProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

const evenMoneyBets: EvenMoneyBet[] = [
  {
    label: "1-18",
    key: "1-18",
    className: "col-start-2 col-span-2 rounded-bl-xl",
  },
  { label: "PAR", key: "PAR", className: "col-start-4 col-span-2" },
  {
    label: "ROJO",
    key: "ROJO",
    className: "col-start-6 col-span-2",
  },
  {
    label: "NEGRO",
    key: "NEGRO",
    className: "col-start-8 col-span-2",
  },
  { label: "IMPAR", key: "IMPAR", className: "col-start-10 col-span-2" },
  {
    label: "19-36",
    key: "19-36",
    className: "col-start-12 col-span-2 rounded-br-xl",
  },
];

export const RouletteEvenMoneyBetsRow = ({
  bets,
  handlePlaceBet,
}: RouletteEvenMoneyBetsRowProps) => {
  return (
    <>
      {evenMoneyBets.map(({ label, key, className }) => (
        <div key={key} className={`row-start-5 ${className}`}>
          <RouletteSingleBetCell
            label={label}
            betKey={key}
            // Pasa la cantidad de la apuesta
            bets={bets}
            totalBet={bets[key] ?? 0}
            handlePlaceBet={handlePlaceBet}
          />
        </div>
      ))}
    </>
  );
};
