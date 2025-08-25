import type { RouletteBet, RoulettePlaceBet, BetKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getChipImageSrc } from "@/lib/utils/chipRoulette";

interface RouletteSplitBetLayerProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

// --- utilidades ---
const colForNumber = (n: number) => Math.floor((n - 1) / 3) + 2; // col 2..13 (col 1 es el "0")
const rowForNumber = (n: number) => 3 - ((n - 1) % 3); // fila 1..3 (1=top, 3=bottom)

// --- splits ---
const horizontalSplits = [
  [3, 6],
  [6, 9],
  [9, 12],
  [12, 15],
  [15, 18],
  [18, 21],
  [21, 24],
  [24, 27],
  [27, 30],
  [30, 33],
  [33, 36],
  [2, 5],
  [5, 8],
  [8, 11],
  [11, 14],
  [14, 17],
  [17, 20],
  [20, 23],
  [23, 26],
  [26, 29],
  [29, 32],
  [32, 35],
  [1, 4],
  [4, 7],
  [7, 10],
  [10, 13],
  [13, 16],
  [16, 19],
  [19, 22],
  [22, 25],
  [25, 28],
  [28, 31],
  [31, 34],
];

const verticalSplits = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [16, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [20, 21],
  [21, 22],
  [22, 23],
  [23, 24],
  [24, 25],
  [25, 26],
  [26, 27],
  [27, 28],
  [28, 29],
  [29, 30],
  [30, 31],
  [31, 32],
  [32, 33],
  [33, 34],
  [34, 35],
  [35, 36],
];

export const RouletteSplitBetLayer = ({
  bets,
  handlePlaceBet,
}: RouletteSplitBetLayerProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none grid",
        // col 1 = ancho 80px para el 0, después 12 columnas de 80px
        "grid-cols-[80px_repeat(12,80px)]",
        // 3 filas de 56px (números)
        "grid-rows-[repeat(3,56px)]"
      )}
    >
      {/* Splits horizontales */}
      {horizontalSplits.map(([a, b]) => {
        const betKey = `split_${Math.min(a, b)}_${Math.max(a, b)}` as BetKey;
        const totalBet = bets[betKey] ?? 0;
        const showChip = totalBet > 0;
        const chipImageSrc = showChip ? getChipImageSrc(totalBet) : "";

        const row = rowForNumber(a);
        const col = Math.min(colForNumber(a), colForNumber(b));

        return (
          <div
            key={betKey}
            className={cn(
              "relative flex items-center justify-center pointer-events-none",
              "transition-all duration-100 ease-in-out"
            )}
            style={{
              gridColumn: `${col} / span 2`,
              gridRow: `${row} / span 1`,
            }}
            aria-hidden
          >
            <div
              onClick={() => handlePlaceBet(betKey)}
              className={cn(
                "absolute rounded-md pointer-events-auto cursor-pointer flex items-center justify-center",
                "transition-all duration-100 ease-in-out hover:bg-white/30"
              )}
              aria-label={`split-${betKey}`}
              style={{
                width: 50,
                height: 50,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              {showChip && (
                <div
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${chipImageSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
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

      {/* Splits verticales */}
      {verticalSplits.map(([a, b]) => {
        const betKey = `split_${Math.min(a, b)}_${Math.max(a, b)}` as BetKey;
        const totalBet = bets[betKey] ?? 0;
        const showChip = totalBet > 0;
        const chipImageSrc = showChip ? getChipImageSrc(totalBet) : "";

        const col = colForNumber(a);
        const row = Math.max(rowForNumber(a), rowForNumber(b)) - 1;

        return (
          <div
            key={betKey}
            className={cn(
              "relative flex items-center justify-center pointer-events-none",
              "transition-all duration-100 ease-in-out"
            )}
            style={{
              gridColumn: `${col} / span 1`,
              gridRow: `${row} / span 2`,
            }}
            aria-hidden
          >
            <div
              onClick={() => handlePlaceBet(betKey)}
              className={cn(
                "absolute rounded-md pointer-events-auto cursor-pointer flex items-center justify-center",
                "transition-all duration-100 ease-in-out hover:bg-white/30"
              )}
              aria-label={`split-${betKey}`}
              style={{
                width: 50,
                height: 50,
                left: "50%",
                top: "50%",
                transform: "translate(-40%, -50%)",
                zIndex: 20,
              }}
            >
              {showChip && (
                <div
                  className="h-10 w-10 rounded-full border-2 border-white flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${chipImageSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
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
