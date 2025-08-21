import type { WheelProps } from "@/lib/types";
import { useEffect, useState } from "react";

const wheelNumMap = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const BALL_RADIUS = 140;

const getWheelRotation = (num: number) => {
  const position = wheelNumMap.indexOf(num);
  const stepAngle = 360 / wheelNumMap.length;
  return 2160 - stepAngle * position;
};

const getBallRotation = (num: number) => {
  const baseRotation = -2160;
  const finalPosition = 0;
  const ballPosition = baseRotation + finalPosition;

  console.log(
    `Rotación bola para num=${num}: ${ballPosition} (posición final: ${finalPosition}°)`
  );
  return ballPosition;
};

export const Wheel = ({
  winningNumber,
  isSpinning,
  onSpinEnd,
  winningAmount,
}: WheelProps) => {
  const [finalRotation, setFinalRotation] = useState({ wheel: 0, ball: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(false);

  useEffect(() => {
    if (isSpinning) {
      setIsAnimationActive(true);
      setShowResult(false);

      if (winningNumber !== null) {
        const finalWheel = getWheelRotation(winningNumber);
        const finalBall = getBallRotation(winningNumber);
        console.log("Rotación final rueda:", finalWheel);
        console.log("Rotación final bola:", finalBall);
        setFinalRotation({ wheel: finalWheel, ball: finalBall });
      } else {
        setFinalRotation({ wheel: 100000, ball: -100000 });
      }
    }
  }, [isSpinning, winningNumber]);

  const handleAnimationEnd = () => {
    if (isSpinning && winningNumber !== null) {
      setIsAnimationActive(false);
      setTimeout(() => {
        setShowResult(true);
        if (onSpinEnd) {
          onSpinEnd();
        }
      }, 1000);
    }
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return "green";
    const redNumbers = [
      32, 19, 21, 25, 27, 30, 36, 34, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3,
    ];
    return redNumbers.includes(num) ? "red" : "black";
  };

  console.log("Render finalRotation:", finalRotation);

  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      <img
        src="/res/WheelBack.webp"
        alt="Wheel Back"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <img
        src="/res/WheelFront.webp"
        alt="Roulette Wheel"
        className={`absolute w-4/5 h-4/5 z-10 ${
          isAnimationActive
            ? "transition-transform duration-[4s] cubic-bezier(0.1, 0.7, 0.1, 1)"
            : ""
        }`}
        style={{ transform: `rotate(${finalRotation.wheel}deg)` }}
      />

      <div
        className={`absolute w-full h-full flex items-center justify-center z-20 ${
          isAnimationActive
            ? "transition-transform duration-[4s] cubic-bezier(0.1, 0.7, 0.1, 1)"
            : ""
        }`}
        style={{ transform: `rotate(${finalRotation.ball}deg)` }}
        onTransitionEnd={handleAnimationEnd}
      >
        <div
          className="absolute w-6 h-6 rounded-full bg-gray-200 border border-black flex items-center justify-center text-xs font-bold"
          style={{
            transform: `translateY(-${BALL_RADIUS}px)`,
          }}
        ></div>
      </div>

      {showResult && winningNumber !== null && (
        <>
          {/* Número ganador */}
          <div className="absolute -top-14 flex items-center justify-center z-30">
            <div
              className="px-4 py-2 rounded-md text-2xl font-bold text-white border-2 border-white shadow-lg"
              style={{
                backgroundColor: getNumberColor(winningNumber),
              }}
            >
              {winningNumber}
            </div>
          </div>

          {/* Mensaje de resultado */}
          <div className="absolute bottom-20 flex items-center justify-center z-30 w-full">
            {winningAmount && winningAmount > 0 ? (
              <div className="bg-gradient-to-r from-black/60 via-green-500 to-black/60 opacity-100 text-white px-6 py-3  animate-pulse">
                <div className="text-center">
                  <div className="text-xl font-bold">¡HAS GANADO!</div>
                  <div className="text-lg">
                    $ {winningAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-black/60 via-red-500 to-black/60 opacity-100 text-white px-6 py-3">
                <div className="text-center">
                  <div className="text-xl font-bold">Has Perdido</div>
                  <div className="text-lg">Mejor suerte la próxima vez</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
