// src/components/table-layout/RouletteLineBetLayer.tsx

import { lineNumbers } from "@/data/betTypesNumbers";
import {
  type RouletteBet,
  type RoulettePlaceBet,
  type BetKey,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { getChipImageSrc } from "@/lib/utils/chipRoulette";

interface RouletteLineBetLayerProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

// Las apuestas de línea se colocan en la línea que divide dos filas.
// La primera fila (1-3) está en la fila 3 de la cuadrícula,
// la segunda fila (4-6) en la fila 2, y la tercera (7-9) en la fila 1.
// Las apuestas de línea están entre ellas.
const rowForLineBet = (firstNumber: number) => {
  const row = Math.floor((firstNumber - 1) / 3);
  return 3 - row;
};

// La columna de inicio es la misma que la del primer número de la fila.
const colForLineBet = (firstNumber: number) =>
  Math.floor((firstNumber - 1) / 3) + 2;

export const RouletteLineBetLayer = ({
  bets,
  handlePlaceBet,
}: RouletteLineBetLayerProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none grid",
        "grid-cols-[80px_repeat(12,80px)]",
        "grid-rows-[repeat(3,56px)]"
      )}
    >
      {lineNumbers.map((numbers) => {
        const betKey = `line_${numbers[0]}_${numbers[5]}` as BetKey;
        const totalBet = bets[betKey] ?? 0;
        const showChip = totalBet > 0;
        const chipImageSrc = showChip ? getChipImageSrc(totalBet) : "";

        // Posiciona la capa de apuesta de línea en la cuadrícula
        const colStart = colForLineBet(numbers[0]);
        const rowStart = rowForLineBet(numbers[0]);

        return (
          <div
            key={betKey}
            className={cn(
              "relative flex items-center justify-center group bg-red-500"
            )}
            style={{
              gridColumn: `${colStart} / span 2`,
              gridRow: `${rowStart} / span 2`, // Cubre dos filas
            }}
          >
            {/* Div para sombreado al pasar el cursor */}
            <div
              className={cn(
                "absolute rounded-md transition-all duration-100 ease-in-out",
                "bg-white/20 hidden group-hover:block"
              )}
              style={{
                width: 80,
                height: 112, // Altura para cubrir dos filas
                top: 0,
                zIndex: 10,
              }}
            />

            {/* Div cliqueable para colocar la apuesta */}
            <div
              onClick={() => handlePlaceBet(betKey)}
              className={cn(
                "absolute rounded-md pointer-events-auto cursor-pointer",
                "flex items-center justify-center"
              )}
              style={{
                width: 80,
                height: 15,
                top: -7.5, // Posiciona la apuesta en la línea de división
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
