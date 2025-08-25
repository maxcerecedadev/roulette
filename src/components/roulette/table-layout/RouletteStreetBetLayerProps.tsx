import { streetNumbers } from "@/data/betTypesNumbers";
import {
  type RouletteBet,
  type RoulettePlaceBet,
  type BetKey,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { getChipImageSrc } from "@/lib/utils/chipRoulette";

interface RouletteStreetBetLayerProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

const colForNumber = (n: number) => Math.floor((n - 1) / 3) + 2;
const rowForNumber = (n: number) => 3 - ((n - 1) % 3);

export const RouletteStreetBetLayer = ({
  bets,
  handlePlaceBet,
}: RouletteStreetBetLayerProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none grid",
        "grid-cols-[80px_repeat(12,80px)]",
        "grid-rows-[repeat(3,56px)]"
      )}
    >
      {streetNumbers.map((numbers) => {
        const betKey = `street_${numbers[0]}_${numbers[2]}` as BetKey;
        const totalBet = bets[betKey] ?? 0;
        const showChip = totalBet > 0;
        const chipImageSrc = showChip ? getChipImageSrc(totalBet) : "";
        const colStart = colForNumber(numbers[0]);

        return (
          <div
            key={betKey}
            className={cn("relative flex items-center justify-center group")}
            style={{
              gridColumn: `${colStart} / span 1`,
              gridRow: `${rowForNumber(numbers[0])} / span 3`,
            }}
          >
            {/* Este es el div que se va a sombrear. Cubre toda la calle pero no es cliqueable. */}
            <div
              className={cn(
                "absolute rounded-md transition-all duration-100 ease-in-out",
                "bg-white/20 hidden group-hover:block"
              )}
              style={{
                width: 80,
                height: 180,
                top: 0,
                zIndex: 10,
              }}
            />

            {/* Este es el div para hacer clic. Es pequeño y se ubica en la parte inferior. */}
            <div
              onClick={() => handlePlaceBet(betKey)}
              className={cn(
                "absolute rounded-md pointer-events-auto cursor-pointer",
                "flex items-center justify-center"
              )}
              style={{
                width: 80,
                height: 30,
                bottom: -15,
                zIndex: 11,
              }}
            >
              {showChip && (
                <div
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${chipImageSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "absolute",
                    bottom: 0,
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    {totalBet}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
