// src/RouletteTable.tsx

import type { RouletteTableProps } from "@/lib/types";
import { RouletteBetButton } from "./RouletteBetButton";
import { redNumbers } from "@/hooks/useRouletteGame";

export const RouletteTable = ({ bets, handlePlaceBet }: RouletteTableProps) => {
  const baseClasses =
    "flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-14 border-2 border-gray-400 p-4";

  return (
    <div className="roulette-table grid grid-cols-[80px_repeat(12,_80px)_80px] grid-rows-[56px_56px_56px_56px_56px] gap-0 overflow-hidden">
      {/* Celda del 0 */}
      <div className="col-span-1 row-span-3 relative flex items-center rounded-l-xl overflow-hidden">
        <div className="relative w-full h-full rounded-l-xl bg-green-700 shadow-md flex items-center justify-center border-2 border-gray-400">
          <div className="w-[calc(100%-36px)] h-[calc(100%-12px)] m-[6px] rounded-l-lg flex items-center justify-center">
            <RouletteBetButton
              label="0"
              totalBet={bets["0"] ?? 0}
              onClick={() => handlePlaceBet("0")}
              className="flex items-center justify-center text-sm font-bold tracking-wide text-white uppercase shadow-text h-full w-full bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Fila superior (3, 6, ..., 36) */}
      {Array.from({ length: 12 }, (_, i) => i * 3 + 3).map((num) => (
        <RouletteBetButton
          key={num}
          label={num.toString()}
          totalBet={bets[`${num}`] ?? 0}
          onClick={() => handlePlaceBet(`${num}`)}
          className={`${baseClasses} ${
            redNumbers.includes(num) ? "bg-red-800" : "bg-black"
          }`}
        />
      ))}
      {/* Apuesta 2:1 (fila superior) */}
      <RouletteBetButton
        key="2:1-1"
        label="2:1"
        totalBet={bets["2:1-1"] ?? 0}
        onClick={() => handlePlaceBet("2:1-1")}
        className={`${baseClasses} bg-black/70 rounded-tr-xl`}
      />

      {/* Fila media (2, 5, ..., 35) */}
      {Array.from({ length: 12 }, (_, i) => i * 3 + 2).map((num) => (
        <RouletteBetButton
          key={num}
          label={num.toString()}
          totalBet={bets[`${num}`] ?? 0}
          onClick={() => handlePlaceBet(`${num}`)}
          className={`${baseClasses} ${
            redNumbers.includes(num) ? "bg-red-800" : "bg-black"
          }`}
        />
      ))}
      {/* Apuesta 2:1 (fila media) */}
      <RouletteBetButton
        key="2:1-2"
        label="2:1"
        totalBet={bets["2:1-2"] ?? 0}
        onClick={() => handlePlaceBet("2:1-2")}
        className={`${baseClasses} bg-black/70`}
      />

      {/* Fila inferior (1, 4, ..., 34) */}
      {Array.from({ length: 12 }, (_, i) => i * 3 + 1).map((num) => (
        <RouletteBetButton
          key={num}
          label={num.toString()}
          totalBet={bets[`${num}`] ?? 0}
          onClick={() => handlePlaceBet(`${num}`)}
          className={`${baseClasses} ${
            redNumbers.includes(num) ? "bg-red-800" : "bg-black"
          }`}
        />
      ))}
      {/* Apuesta 2:1 (fila inferior) */}
      <RouletteBetButton
        key="2:1-3"
        label="2:1"
        totalBet={bets["2:1-3"] ?? 0}
        onClick={() => handlePlaceBet("2:1-3")}
        className={`${baseClasses} bg-black/70 rounded-br-xl`}
      />

      {/* Docenas (Fila 4) */}
      <RouletteBetButton
        key="1os 12"
        label="1os 12"
        totalBet={bets["1os 12"] ?? 0}
        onClick={() => handlePlaceBet("1os 12")}
        className={`${baseClasses} bg-black/70 col-start-2 col-span-4`}
      />
      <RouletteBetButton
        key="2os 12"
        label="2os 12"
        totalBet={bets["2os 12"] ?? 0}
        onClick={() => handlePlaceBet("2os 12")}
        className={`${baseClasses} bg-black/70 col-start-6 col-span-4`}
      />
      <RouletteBetButton
        key="3os 12"
        label="3os 12"
        totalBet={bets["3os 12"] ?? 0}
        onClick={() => handlePlaceBet("3os 12")}
        className={`${baseClasses} bg-black/70 col-start-10 col-span-4`}
      />

      {/* Apuestas simples (Fila 5) */}
      <RouletteBetButton
        key="1-18"
        label="1-18"
        totalBet={bets["1-18"] ?? 0}
        onClick={() => handlePlaceBet("1-18")}
        className={`${baseClasses} bg-black/50 col-start-2 col-span-2 rounded-bl-xl`}
      />
      <RouletteBetButton
        key="PAR"
        label="PAR"
        totalBet={bets["PAR"] ?? 0}
        onClick={() => handlePlaceBet("PAR")}
        className={`${baseClasses} bg-black/50 col-start-4 col-span-2`}
      />
      <RouletteBetButton
        key="ROJO"
        label=""
        totalBet={bets["ROJO"] ?? 0}
        onClick={() => handlePlaceBet("ROJO")}
        className={`${baseClasses} bg-red-800 col-start-6 col-span-2`}
      />
      <RouletteBetButton
        key="NEGRO"
        label=""
        totalBet={bets["NEGRO"] ?? 0}
        onClick={() => handlePlaceBet("NEGRO")}
        className={`${baseClasses} bg-black col-start-8 col-span-2`}
      />
      <RouletteBetButton
        key="IMPAR"
        label="IMPAR"
        totalBet={bets["IMPAR"] ?? 0}
        onClick={() => handlePlaceBet("IMPAR")}
        className={`${baseClasses} bg-black/50 col-start-10 col-span-2`}
      />
      <RouletteBetButton
        key="19-36"
        label="19-36"
        totalBet={bets["19-36"] ?? 0}
        onClick={() => handlePlaceBet("19-36")}
        className={`${baseClasses} bg-black/50 col-start-12 col-span-2 rounded-br-xl`}
      />
    </div>
  );
};
