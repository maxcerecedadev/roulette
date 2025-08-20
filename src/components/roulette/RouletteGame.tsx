// src/RouletteGame.tsx

import { useState } from "react";
import { ChipButton } from "./ChipButton";
import { Button } from "./Button";
import { RouletteBetButton } from "./RouletteBetButton";
import { Wheel } from "./Wheel";
import { LeaveGameDialog } from "../LeaveGameDialog";
import { useRouletteGame } from "@/hooks/useRouletteGame";
import type { RouletteGameProps } from "@/lib/types";

const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

export const RouletteGame = ({
  musicController,
  soundController,
}: RouletteGameProps) => {
  const [showPaymentChart, setShowPaymentChart] = useState(false);

  // Usamos el hook personalizado para obtener la lógica
  const {
    balance,
    selectedChip,
    totalBet,
    isSpinning,
    winningNumber,
    bets,
    winningNumberHistory,
    pendingWinnings,
    handlePlaceBet,
    handleSpin,
    handleClearBets,
    handleUndoBet,
    handleRepeatBet,
    handleDoubleBet,
    handleLeaveAndNavigate,
    handleSpinEnd,
    sound,
    setSelectedChip,
  } = useRouletteGame({ soundController });

  const cellWidthRem = "5rem";
  const gapRem = "0.25rem";
  const tableWidthCalc = `calc(12 * ${cellWidthRem} + 11 * ${gapRem})`;

  return (
    <div
      className="roulette-game-container w-full h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
      style={{
        backgroundImage: `url('/res/background.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <div className="header flex justify-between items-center w-full px-4 py-2 absolute top-0">
        <div className="flex flex-col justify-center items-center text-2xl text-center">
          <span>SALDO</span>
          <span className="font-bold ml-2">${balance}</span>
        </div>
        <div className="flex gap-2">
          <Button
            label="BORRAR"
            onClick={handleClearBets}
            imageURL={"/res/ButtonClear.svg"}
          />
          <Button
            label="DESHACER"
            onClick={handleUndoBet}
            imageURL={"/res/ButtonUndo.svg"}
          />
          <Button
            label="REPETIR"
            onClick={handleRepeatBet}
            imageURL={"/res/ButtonRepeat.svg"}
          />
          <Button
            label="DOBLAR"
            onClick={handleDoubleBet}
            imageURL={"/res/ButtonDouble.svg"}
          />
          <Button
            label="TIRAR"
            onClick={handleSpin}
            imageURL={"/res/ButtonSpin.svg"}
            isDisabled={isSpinning || totalBet === 0}
          />
        </div>
        <div>
          <span>APUESTA TOTAL</span>
          <span className="font-bold text-yellow-400 ml-2">${totalBet}</span>
        </div>
      </div>

      {/* Chips */}
      <div className="flex gap-4 p-4 mt-20">
        {[50, 100, 200, 500, 1000].map((amount) => (
          <ChipButton
            key={amount}
            amount={amount}
            imageURL={`/res/Chip${
              amount === 50
                ? "BlueLight"
                : amount === 100
                ? "Green"
                : amount === 200
                ? "Red"
                : amount === 500
                ? "BlueDark"
                : "Orange"
            }.svg`}
            onClick={() => setSelectedChip(amount)}
            isSelected={selectedChip === amount}
          />
        ))}
      </div>

      {/* Historial de números */}
      <div className="winning-numbers-history absolute top-40 right-4">
        <ul className="flex flex-col gap-1">
          {winningNumberHistory.map((item, i) => (
            <li
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                item.color === "green"
                  ? "bg-green-600"
                  : item.color === "red"
                  ? "bg-red-600"
                  : "bg-black"
              }`}
            >
              {item.number}
            </li>
          ))}
        </ul>
      </div>

      {/* Mesa de ruleta */}
      <div className="roulette-table p-4">
        <div className="flex items-start">
          <RouletteBetButton
            label="0"
            totalBet={bets["0"] || 0}
            onClick={() => handlePlaceBet("0")}
            className="bg-green-700 w-16 h-[168px] flex items-center justify-center font-bold"
          />
          <div className="ml-1" style={{ width: tableWidthCalc }}>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {Array.from({ length: 12 }, (_, i) => i * 3 + 3).map((num) => (
                  <RouletteBetButton
                    key={num}
                    label={num.toString()}
                    totalBet={bets[`${num}`] || 0}
                    onClick={() => handlePlaceBet(`${num}`)}
                    className={`w-20 h-14 flex items-center justify-center text-sm font-bold tracking-wide ${
                      redNumbers.includes(num) ? "bg-red-600" : "bg-black"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 12 }, (_, i) => i * 3 + 2).map((num) => (
                  <RouletteBetButton
                    key={num}
                    label={num.toString()}
                    totalBet={bets[`${num}`] || 0}
                    onClick={() => handlePlaceBet(`${num}`)}
                    className={`w-20 h-14 flex items-center justify-center text-sm font-bold tracking-wide ${
                      redNumbers.includes(num) ? "bg-red-600" : "bg-black"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 12 }, (_, i) => i * 3 + 1).map((num) => (
                  <RouletteBetButton
                    key={num}
                    label={num.toString()}
                    totalBet={bets[`${num}`] || 0}
                    onClick={() => handlePlaceBet(`${num}`)}
                    className={`w-20 h-14 flex items-center justify-center text-sm font-bold tracking-wide ${
                      redNumbers.includes(num) ? "bg-red-600" : "bg-black"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col mt-1 gap-1">
              <div className="grid grid-cols-3 gap-1">
                {["1ra 12", "2da 12", "3ra 12"].map((key) => (
                  <RouletteBetButton
                    key={key}
                    label={key}
                    totalBet={bets[key] || 0}
                    onClick={() => handlePlaceBet(key)}
                    className="bg-black/70 h-14 flex items-center justify-center text-sm font-bold tracking-wide"
                  />
                ))}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {["1-18", "PAR", "ROJO", "NEGRO", "IMPAR", "19-36"].map(
                  (key) => (
                    <RouletteBetButton
                      key={key}
                      label={key}
                      totalBet={bets[key] || 0}
                      onClick={() => handlePlaceBet(key)}
                      className={`h-14 flex items-center justify-center text-sm font-bold tracking-wide ${
                        key === "ROJO"
                          ? "bg-red-600"
                          : key === "NEGRO"
                          ? "bg-black"
                          : "bg-black/50"
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col ml-1 gap-1">
            {["2:1-1", "2:1-2", "2:1-3"].map((key) => (
              <RouletteBetButton
                key={key}
                label="2:1"
                totalBet={bets[key] || 0}
                onClick={() => handlePlaceBet(key)}
                className="bg-black/50 w-16 h-14 flex items-center justify-center text-sm font-bold tracking-wide"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controles de sonido/música */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button
          label={sound.isMuted() ? "Sonido OFF" : "Sonido ON"}
          onClick={() => {
            sound.toggleMute();
          }}
          imageURL={
            sound.isMuted()
              ? "/res/ButtonSoundOFF.svg"
              : "/res/ButtonSoundON.svg"
          }
        />
        <Button
          label={musicController.isMusicPlaying ? "Música ON" : "Música OFF"}
          onClick={musicController.toggleMusic}
          imageURL={
            musicController.isMusicPlaying
              ? "/res/ButtonMusicON.svg"
              : "/res/ButtonMusicOFF.svg"
          }
        />
      </div>

      {/* Info + Salir */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          label="Info"
          onClick={() => setShowPaymentChart(true)}
          imageURL={"/res/ButtonList.svg"}
        />
        <LeaveGameDialog onLeave={handleLeaveAndNavigate} />
      </div>

      {/* Modal de la ruleta (animación) */}
      {isSpinning && (
        <div className="absolute inset-0 flex bg-black/60 items-center justify-center z-50 backdrop-blur-sm">
          <Wheel
            isSpinning={isSpinning}
            winningNumber={winningNumber}
            winningAmount={pendingWinnings}
            onSpinEnd={handleSpinEnd}
          />
        </div>
      )}

      {/* Cartilla de pagos */}
      {showPaymentChart && (
        <div
          className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPaymentChart(false)}
        >
          <img
            src="/res/PaymentChart.webp"
            alt="Payment Chart"
            className="w-1/2"
          />
        </div>
      )}
    </div>
  );
};
