// src/RouletteTable.tsx

import type { RouletteTableProps } from "@/lib/types";
import { RouletteBetButton } from "./RouletteBetButton";
import { redNumbers } from "@/lib/constants/rouletteConstants";

export const RouletteTable = ({ bets, handlePlaceBet }: RouletteTableProps) => {
  const baseClasses =
    "flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-14 border-2 border-gray-400 p-4";

  return (
    <div className="roulette-table w-full max-w-6xl mx-auto">
      {/* Contenedor con CSS Grid */}
      <div className="grid gap-0 overflow-hidden rounded-xl grid-cols-[80px_repeat(12,_80px)_80px] grid-rows-[repeat(5,_56px)]">
        {/* Celda del 0 - Fila 1-3, Columna 1 */}
        <div className="row-start-1 row-end-4 col-start-1 col-end-2 relative flex items-center overflow-hidden bg-green-700 shadow-md border-r-2 border-gray-400 rounded-l-xl">
          <div className="relative w-full h-full flex items-center justify-center p-1.5">
            <RouletteBetButton
              label="0"
              totalBet={bets["0"] ?? 0}
              onClick={() => handlePlaceBet("0")}
              className="flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-full w-full bg-transparent rounded-l-lg"
            />
          </div>
        </div>

        {/* Números fila superior (3, 6, 9, ..., 36) */}
        {Array.from({ length: 12 }, (_, i) => i * 3 + 3).map((num, index) => {
          const colStart = index + 2; // Columnas 2-13
          return (
            <div key={num} className={`row-start-1 col-start-${colStart}`}>
              <RouletteBetButton
                label={num.toString()}
                totalBet={bets[`${num}`] ?? 0}
                onClick={() => handlePlaceBet(`${num}`)}
                className={`${baseClasses} ${
                  redNumbers.includes(num) ? "bg-red-800" : "bg-black"
                }`}
              />
            </div>
          );
        })}

        {/* 2:1 fila superior */}
        <div className="row-start-1 col-start-14">
          <RouletteBetButton
            label="2:1"
            totalBet={bets["2:1-1"] ?? 0}
            onClick={() => handlePlaceBet("2:1-1")}
            className={`${baseClasses} bg-black/70 rounded-tr-xl`}
          />
        </div>

        {/* Números fila media (2, 5, 8, ..., 35) */}
        {Array.from({ length: 12 }, (_, i) => i * 3 + 2).map((num, index) => {
          const colStart = index + 2;
          return (
            <div key={num} className={`row-start-2 col-start-${colStart}`}>
              <RouletteBetButton
                label={num.toString()}
                totalBet={bets[`${num}`] ?? 0}
                onClick={() => handlePlaceBet(`${num}`)}
                className={`${baseClasses} ${
                  redNumbers.includes(num) ? "bg-red-800" : "bg-black"
                }`}
              />
            </div>
          );
        })}

        {/* 2:1 fila media */}
        <div className="row-start-2 col-start-14">
          <RouletteBetButton
            label="2:1"
            totalBet={bets["2:1-2"] ?? 0}
            onClick={() => handlePlaceBet("2:1-2")}
            className={`${baseClasses} bg-black/70`}
          />
        </div>

        {/* Números fila inferior (1, 4, 7, ..., 34) */}
        {Array.from({ length: 12 }, (_, i) => i * 3 + 1).map((num, index) => {
          const colStart = index + 2;
          return (
            <div key={num} className={`row-start-3 col-start-${colStart}`}>
              <RouletteBetButton
                label={num.toString()}
                totalBet={bets[`${num}`] ?? 0}
                onClick={() => handlePlaceBet(`${num}`)}
                className={`${baseClasses} ${
                  redNumbers.includes(num) ? "bg-red-800" : "bg-black"
                }`}
              />
            </div>
          );
        })}

        {/* 2:1 fila inferior */}
        <div className="row-start-3 col-start-14">
          <RouletteBetButton
            label="2:1"
            totalBet={bets["2:1-3"] ?? 0}
            onClick={() => handlePlaceBet("2:1-3")}
            className={`${baseClasses} bg-black/70 rounded-br-xl`}
          />
        </div>

        {/* Docenas - Fila 4 */}
        <div className="row-start-4 col-start-2 col-span-4">
          <RouletteBetButton
            label="1os 12"
            totalBet={bets["1os 12"] ?? 0}
            onClick={() => handlePlaceBet("1os 12")}
            className={`${baseClasses} bg-black/70`}
          />
        </div>

        <div className="row-start-4 col-start-6 col-span-4">
          <RouletteBetButton
            label="2os 12"
            totalBet={bets["2os 12"] ?? 0}
            onClick={() => handlePlaceBet("2os 12")}
            className={`${baseClasses} bg-black/70`}
          />
        </div>

        <div className="row-start-4 col-start-10 col-span-4">
          <RouletteBetButton
            label="3os 12"
            totalBet={bets["3os 12"] ?? 0}
            onClick={() => handlePlaceBet("3os 12")}
            className={`${baseClasses} bg-black/70`}
          />
        </div>

        {/* Apuestas simples - Fila 5 */}
        <div className="row-start-5 col-start-2 col-span-2">
          <RouletteBetButton
            label="1-18"
            totalBet={bets["1-18"] ?? 0}
            onClick={() => handlePlaceBet("1-18")}
            className={`${baseClasses} bg-black/50 rounded-bl-xl`}
          />
        </div>

        <div className="row-start-5 col-start-4 col-span-2">
          <RouletteBetButton
            label="PAR"
            totalBet={bets["PAR"] ?? 0}
            onClick={() => handlePlaceBet("PAR")}
            className={`${baseClasses} bg-black/50`}
          />
        </div>

        <div className="row-start-5 col-start-6 col-span-2">
          <RouletteBetButton
            label=""
            totalBet={bets["ROJO"] ?? 0}
            onClick={() => handlePlaceBet("ROJO")}
            className={`${baseClasses} bg-red-800`}
          />
        </div>

        <div className="row-start-5 col-start-8 col-span-2">
          <RouletteBetButton
            label=""
            totalBet={bets["NEGRO"] ?? 0}
            onClick={() => handlePlaceBet("NEGRO")}
            className={`${baseClasses} bg-black`}
          />
        </div>

        <div className="row-start-5 col-start-10 col-span-2">
          <RouletteBetButton
            label="IMPAR"
            totalBet={bets["IMPAR"] ?? 0}
            onClick={() => handlePlaceBet("IMPAR")}
            className={`${baseClasses} bg-black/50`}
          />
        </div>

        <div className="row-start-5 col-start-12 col-span-2">
          <RouletteBetButton
            label="19-36"
            totalBet={bets["19-36"] ?? 0}
            onClick={() => handlePlaceBet("19-36")}
            className={`${baseClasses} bg-black/50 rounded-br-xl`}
          />
        </div>
      </div>
    </div>
  );
};
