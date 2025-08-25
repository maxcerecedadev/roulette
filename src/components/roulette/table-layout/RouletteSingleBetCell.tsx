// src/components/roulette/table-layout/RouletteSingleBetCell.tsx

import type { RouletteBet, RoulettePlaceBet, BetKey } from "@/lib/types";
import { RouletteBetButton } from "@/components/roulette/RouletteBetButton";

interface RouletteSingleBetCellProps {
  label: string;
  betKey: BetKey;
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
  totalBet: number; // Agrega esta prop
}

export const RouletteSingleBetCell = ({
  label,
  betKey,
  handlePlaceBet,
  totalBet, // Destructura la prop
}: RouletteSingleBetCellProps) => {
  const baseClasses =
    "flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-14 border-2 border-gray-400 p-4";
  const colorClass =
    betKey === "ROJO"
      ? "bg-red-800"
      : betKey === "NEGRO"
      ? "bg-black"
      : "bg-black/50";

  // Aplica una clase de resaltado si hay una apuesta
  const betPlacedClass = totalBet > 0 ? "bg-white/5  shadow-lg" : "";

  return (
    <RouletteBetButton
      label={label}
      totalBet={totalBet} // Pasa totalBet
      onClick={() => handlePlaceBet(betKey)}
      className={`${baseClasses} ${colorClass} ${betPlacedClass} `}
    />
  );
};
