// src/components/roulette/RouletteGame.tsx

import { useState } from "react";
import { ChipButton } from "./ChipButton";
import { Button } from "./Button";
import { Wheel } from "./Wheel";
import { LeaveGameDialog } from "../LeaveGameDialog";
import { useRouletteGame } from "@/hooks/useRouletteGame";
import { WinningHistory } from "./WinningHistory";
import { RouletteTable } from "./RouletteTable";
import { PaymentChart } from "./PaymentChart";
import { useMusicController } from "@/hooks/useMusicController";
import { useSoundController } from "@/hooks/useSoundController";
import type { RouletteGameProps } from "@/lib/types";

export const RouletteGame = ({ mode, player }: RouletteGameProps) => {
  const [showPaymentChart, setShowPaymentChart] = useState(false);

  const {
    balance,
    selectedChip,
    totalBet,
    isSpinning,
    winningNumber,
    betsDisplay,
    winningNumberHistory,
    pendingWinnings,
    handlePlaceBet,
    handleClearBets,
    handleUndoBet,
    handleRepeatBet,
    handleDoubleBet,
    handleLeaveAndNavigate,
    setSelectedChip,
    gameState,
    timer,
  } = useRouletteGame({ mode, player });

  const soundController = useSoundController();
  const musicController = useMusicController();

  const getGameStateMessage = () => {
    switch (gameState) {
      case "betting":
        return `Tiempo de Apuestas: ${timer}s`;
      case "spinning":
        return "¡NO MÁS APUESTAS!";
      case "payout":
        return `Pagando...`;
      default:
        return "Conectando...";
    }
  };

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

      {/* Header y controles */}
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
            isDisabled={gameState !== "betting"}
          />
          <Button
            label="DESHACER"
            onClick={handleUndoBet}
            imageURL={"/res/ButtonUndo.svg"}
            isDisabled={gameState !== "betting"}
          />
          <Button
            label="REPETIR"
            onClick={handleRepeatBet}
            imageURL={"/res/ButtonRepeat.svg"}
            isDisabled={gameState !== "betting"}
          />
          <Button
            label="DOBLAR"
            onClick={handleDoubleBet}
            imageURL={"/res/ButtonDouble.svg"}
            isDisabled={gameState !== "betting"}
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
            isDisabled={gameState !== "betting"}
          />
        ))}
      </div>

      {/* Mensaje de estado */}
      <div className="absolute top-24 z-10 text-4xl font-extrabold text-white text-shadow-lg">
        {getGameStateMessage()}
      </div>

      {/* Ruleta o mesa */}
      {isSpinning || winningNumber !== null ? (
        <div
          className="absolute inset-0 flex items-center justify-center z-50
               bg-black/60 backdrop-blur-sm
               motion-safe:animate-[overlay-fade-in_.35s_ease-out_forwards]"
        >
          <div
            className="origin-center
                 [will-change:transform]
                 motion-safe:animate-[wheel-enter_.85s_cubic-bezier(0.22,1,0.36,1)_both]"
          >
            <Wheel
              isSpinning={isSpinning}
              winningNumber={winningNumber}
              winningAmount={pendingWinnings}
              playerTotalBet={totalBet}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <WinningHistory
            winningNumberHistory={winningNumberHistory.map((item) => ({
              ...item,
              color:
                item.color === "red"
                  ? "red"
                  : item.color === "black"
                  ? "black"
                  : "green",
            }))}
          />
          <RouletteTable
            bets={betsDisplay}
            handlePlaceBet={handlePlaceBet}
            isDisabled={gameState !== "betting"}
          />
        </div>
      )}

      {/* Controles de sonido/música */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        <Button
          label={soundController.isMuted ? "Sonido OFF" : "Sonido ON"}
          onClick={soundController.toggleMute}
          imageURL={
            soundController.isMuted
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

      {/* Info + salir */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <Button
          label="Info"
          onClick={() => setShowPaymentChart(true)}
          imageURL={"/res/ButtonList.svg"}
        />
        <LeaveGameDialog onLeave={handleLeaveAndNavigate} />
      </div>

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
