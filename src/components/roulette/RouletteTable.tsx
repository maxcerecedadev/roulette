// src/components/RouletteTable.tsx

import type { RouletteTableProps } from "@/lib/types";
import { RouletteZeroBet } from "./table-layout/RouletteZeroBet";
import { RouletteNumberGrid } from "./table-layout/RouletteNumberGrid";
import { RouletteDozenBetsRow } from "./table-layout/RouletteDozenBetsRow";
import { RouletteEvenMoneyBetsRow } from "./table-layout/RouletteEvenMoneyBetsRow";
import { RouletteColumnBetsColumn } from "./table-layout/RouletteColumnBetsColumn";

export const RouletteTable = ({ bets, handlePlaceBet }: RouletteTableProps) => {
  return (
    <div className="roulette-table w-full max-w-6xl mx-auto">
      {/* Contenedor principal del tablero con CSS Grid */}
      <div className="grid gap-0 overflow-hidden rounded-xl grid-cols-[80px_repeat(12,_80px)_80px] grid-rows-[repeat(5,_56px)]">
        {/* Celda del 0 */}
        <RouletteZeroBet bets={bets} handlePlaceBet={handlePlaceBet} />

        {/* Números y apuestas de columna */}
        <RouletteNumberGrid bets={bets} handlePlaceBet={handlePlaceBet} />

        {/* Fila de apuestas de docena */}
        <RouletteDozenBetsRow bets={bets} handlePlaceBet={handlePlaceBet} />

        {/* Fila de apuestas de dinero parejo */}
        <RouletteEvenMoneyBetsRow bets={bets} handlePlaceBet={handlePlaceBet} />

        {/* Columna de apuestas 2:1 */}
        <RouletteColumnBetsColumn bets={bets} handlePlaceBet={handlePlaceBet} />
      </div>
    </div>
  );
};
