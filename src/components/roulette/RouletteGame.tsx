// src/RouletteGame.tsx

import { useState } from "react";
import { ChipButton } from "./ChipButton";
import { Button } from "./Button";
import { Wheel } from "./Wheel";
import { LeaveGameDialog } from "../LeaveGameDialog";
import { useRouletteGame } from "@/hooks/useRouletteGame";
import type { RouletteGameProps } from "@/lib/types";
import { WinningHistory } from "./WinningHistory";
import { RouletteTable } from "./RouletteTable";
import { PaymentChart } from "./PaymentChart";

export const RouletteGame = ({
  musicController,
  soundController,
}: RouletteGameProps) => {
  const [showPaymentChart, setShowPaymentChart] = useState(false);

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

  return (
    <div
      className="roulette-game-container w-full h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
      style={{
        backgroundImage: `url('/res/background.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay negro sutil */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Header */}
      <div className="header flex justify-between items-center w-full px-4 py-2 absolute top-0 z-10">
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
      <div className="flex gap-4 p-4 mt-20 z-10">
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
      {!isSpinning && winningNumberHistory.length > 0 && (
        <WinningHistory winningNumberHistory={winningNumberHistory} />
      )}
      {/* Mesa de ruleta */}
      <RouletteTable bets={bets} handlePlaceBet={handlePlaceBet} />

      {/* Controles de sonido/música */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
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
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowPaymentChart(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PaymentChart onClose={() => setShowPaymentChart(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
