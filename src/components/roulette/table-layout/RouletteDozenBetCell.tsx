// src/components/roulette/table-layout/RouletteDozenBetCell.tsx

// Asegúrate de importar BetKey
import type { RouletteBet, RoulettePlaceBet, BetKey } from "@/lib/types";
import { RouletteBetButton } from "@/components/roulette/RouletteBetButton";

interface RouletteDozenBetCellProps {
  label: string;
  betKey: BetKey; // El tipo es ahora BetKey
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

export const RouletteDozenBetCell = ({
  label,
  betKey,
  bets,
  handlePlaceBet,
}: RouletteDozenBetCellProps) => {
  return (
    <RouletteBetButton
      label={label}
      totalBet={bets[betKey] ?? 0}
      onClick={() => handlePlaceBet(betKey)}
      className="flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-14 border-2 border-gray-400 p-4 bg-black/70"
    />
  );
};
