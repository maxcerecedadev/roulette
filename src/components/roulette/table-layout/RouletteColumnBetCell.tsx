// src/components/roulette/table-layout/RouletteColumnBetCell.tsx

import type { RouletteBet, RoulettePlaceBet, BetKey } from "@/lib/types";
import { RouletteBetButton } from "@/components/roulette/RouletteBetButton";

interface RouletteColumnBetCellProps {
  label: string;
  betKey: BetKey;
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
  isTop?: boolean;
  isBottom?: boolean;
}

export const RouletteColumnBetCell = ({
  label,
  betKey,
  bets,
  handlePlaceBet,
  isTop = false,
  isBottom = false,
}: RouletteColumnBetCellProps) => {
  const baseClasses =
    "flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-14 border-2 border-gray-400 p-4 bg-black/70";

  const topClasses = isTop ? "rounded-tr-xl" : "";
  const bottomClasses = isBottom ? "rounded-br-xl" : "";

  return (
    <RouletteBetButton
      label={label}
      totalBet={bets[betKey] ?? 0}
      onClick={() => handlePlaceBet(betKey)}
      className={`${baseClasses} ${topClasses} ${bottomClasses}`}
    />
  );
};
