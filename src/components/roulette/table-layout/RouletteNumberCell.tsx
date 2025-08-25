import { type BetKey, type RouletteNumberCellProps } from "@/lib/types";
import { RouletteBetButton } from "@/components/roulette/RouletteBetButton";
import { redNumbers } from "@/lib/constants/rouletteConstants";
import { streetNumbers } from "@/data/betTypesNumbers";

export const RouletteNumberCell = ({
  label,
  betKey,
  totalBet,
  bets,
  onClick,
}: RouletteNumberCellProps) => {
  const baseClasses =
    "relative flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-14 border-2 border-gray-400 p-4";
  const colorClass = redNumbers.includes(Number(label))
    ? "bg-red-800"
    : "bg-black";

  // Lógica de sombreado para todas las apuestas de grupo
  const isPartOfGroupBet =
    ((bets["1-18"] ?? 0) > 0 && Number(label) >= 1 && Number(label) <= 18) ||
    ((bets["19-36"] ?? 0) > 0 && Number(label) >= 19 && Number(label) <= 36) ||
    ((bets["ROJO"] ?? 0) > 0 && redNumbers.includes(Number(label))) ||
    ((bets["NEGRO"] ?? 0) > 0 &&
      !redNumbers.includes(Number(label)) &&
      Number(label) !== 0) ||
    ((bets["PAR"] ?? 0) > 0 &&
      Number(label) % 2 === 0 &&
      Number(label) !== 0) ||
    ((bets["IMPAR"] ?? 0) > 0 && Number(label) % 2 !== 0) ||
    ((bets["1os 12"] ?? 0) > 0 && Number(label) >= 1 && Number(label) <= 12) ||
    ((bets["2os 12"] ?? 0) > 0 && Number(label) >= 13 && Number(label) <= 24) ||
    ((bets["3os 12"] ?? 0) > 0 && Number(label) >= 25 && Number(label) <= 36) ||
    ((bets["2:1-1"] ?? 0) > 0 &&
      Number(label) % 3 === 0 &&
      Number(label) !== 0) ||
    ((bets["2:1-3"] ?? 0) > 0 && Number(label) % 3 === 1) ||
    ((bets["2:1-2"] ?? 0) > 0 && Number(label) % 3 === 2);

  // Lógica para sombreado de apuestas de calle
  const isPartOfStreetBet = streetNumbers.some((street) => {
    // ✅ Solución: Usa la aserción de tipo 'as BetKey'
    const betKey = `street_${street[0]}_${street[2]}` as BetKey;
    return (bets[betKey] ?? 0) > 0 && street.includes(Number(label));
  });

  const showOverlay = totalBet > 0 || isPartOfGroupBet || isPartOfStreetBet;

  return (
    <div className="relative">
      {showOverlay && (
        <div className="absolute inset-0 bg-white/30 rounded z-10"></div>
      )}
      <RouletteBetButton
        label={label}
        totalBet={totalBet}
        onClick={() => onClick(betKey)}
        className={`${baseClasses} ${colorClass}`}
      />
    </div>
  );
};
