// src/components/Wheel.tsx (Versión corregida)
import type { WheelProps } from "@/lib/types";
import { useEffect, useState, useRef } from "react";

const wheelNumMap = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const BALL_RADIUS_START = 130;
const BALL_RADIUS_END = 102;
const STEP_ANGLE = 360 / wheelNumMap.length;
const TOP_POSITION_INDEX = 0;

const getWheelRotation = (num: number) => {
  const numIndex = wheelNumMap.indexOf(num);
  const angleToTarget = (numIndex - TOP_POSITION_INDEX) * STEP_ANGLE;
  return 2160 - angleToTarget;
};

const getBallRotation = () => -2880;

export const Wheel = ({
  winningNumber,
  isSpinning,
  resultStatus,
  winningAmount,
  onSpinEnd,
}: WheelProps) => {
  const [finalRotation, setFinalRotation] = useState({
    wheel: 0,
    ball: Math.random() * 360,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ballRadius, setBallRadius] = useState(BALL_RADIUS_START);
  const prevIsSpinning = useRef(false);

  // Reinicia el estado visual cuando se detiene el giro
  useEffect(() => {
    if (!isSpinning && prevIsSpinning.current) {
      // Reiniciar solo cuando el giro termina (de true a false)
      setShowResult(false);
      setIsTransitioning(false);
      setBallRadius(BALL_RADIUS_START);

      const randomRotWheel = 10000 + Math.random() * 500;
      const randomRotBall = -10000 + Math.random() * 500;
      setFinalRotation({ wheel: randomRotWheel, ball: randomRotBall });
    }
    // Inicia el giro
    if (isSpinning && !prevIsSpinning.current) {
      // Simplemente iniciamos el giro, la limpieza ya se hizo antes
      const randomRotWheel = 10000 + Math.random() * 500;
      const randomRotBall = -10000 + Math.random() * 500;
      setFinalRotation({ wheel: randomRotWheel, ball: randomRotBall });
    }
    prevIsSpinning.current = isSpinning;
  }, [isSpinning]);

  // Transición al número ganador
  useEffect(() => {
    if (winningNumber !== null) {
      const finalWheel = getWheelRotation(winningNumber);
      const finalBall = getBallRotation();

      setIsTransitioning(true);
      setFinalRotation({ wheel: finalWheel, ball: finalBall });
      setBallRadius(BALL_RADIUS_END);
    }
  }, [winningNumber]);

  const handleTransitionEnd = () => {
    if (isTransitioning) {
      setShowResult(true);
      setIsTransitioning(false);

      if (typeof onSpinEnd === "function") {
        setTimeout(() => onSpinEnd(), 50);
      }
    }
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return "green";
    const redNumbers = [
      32, 19, 21, 25, 27, 30, 36, 34, 23, 5, 16, 1, 14, 9, 18, 7, 28, 12, 3,
    ];
    return redNumbers.includes(num) ? "red" : "black";
  };

  const WinningsEffect = () => (
    <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-8 bg-green-500 rounded opacity-0 animate-bill-fall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random()}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-white animate-fade-in-out">
        ¡HAS GANADO!
      </div>
    </div>
  );

  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Fondo */}
      <img
        src="/res/WheelBack.webp"
        alt="Wheel Back"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Rueda */}
      <img
        src="/res/WheelFront.webp"
        alt="Roulette Wheel"
        className={`absolute w-4/5 h-4/5 z-10 ${
          isTransitioning
            ? "transition-transform duration-[4000ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
            : isSpinning
            ? "transition-none"
            : ""
        }`}
        style={{ transform: `rotate(${finalRotation.wheel}deg)` }}
      />

      {/* Bola */}
      <div
        className={`absolute w-full h-full flex items-center justify-center z-20 ${
          isTransitioning
            ? "transition-transform duration-[4000ms] cubic-bezier(0.1, 0.1, 0.25, 1)"
            : isSpinning
            ? "transition-none"
            : ""
        }`}
        style={{ transform: `rotate(${finalRotation.ball}deg)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div
          className={`absolute w-4 h-4 rounded-full bg-gray-200 border border-black ${
            isTransitioning
              ? "transition-all duration-[3500ms] ease-in-out animate-ball-rebound"
              : ""
          }`}
          style={{ transform: `translateY(-${ballRadius}px)` }}
        />
      </div>

      {/* Resultado */}
      {showResult && winningNumber !== null && (
        <>
          <div className="absolute -top-14 flex items-center justify-center z-30">
            <div
              className="p-2 rounded-md text-2xl font-bold text-white border-2 border-white shadow-lg"
              style={{ backgroundColor: getNumberColor(winningNumber) }}
            >
              {winningNumber}
            </div>
          </div>

          <div className="absolute bottom-20 flex items-center justify-center z-30 w-full">
            {resultStatus === "win" ? (
              <div className="bg-gradient-to-r from-black/60 via-green-500 to-black/60 text-white px-6 py-3 animate-pulse">
                <div className="text-center">
                  <div className="text-xl font-bold">¡HAS GANADO!</div>
                  <div className="text-lg">
                    $ {winningAmount?.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : resultStatus === "lose" ? (
              <div className="bg-gradient-to-r from-black/60 via-red-500 to-black/60 text-white px-6 py-3">
                <div className="text-center">
                  <div className="text-xl font-bold">Has Perdido</div>
                  <div className="text-lg">Mejor suerte la próxima vez</div>
                </div>
              </div>
            ) : resultStatus === "no_bet" ? (
              <div className="bg-black/60 text-white px-6 py-3 rounded-md">
                <div className="text-center">
                  <div className="text-xl font-bold">Sin Apuesta</div>
                  <div className="text-lg">No participaste en esta ronda</div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}

      {showResult && resultStatus === "win" && <WinningsEffect />}

      {/* Animación de rebote */}
      <style>{`
        @keyframes ball-rebound {
          0%   { transform: translateY(-${BALL_RADIUS_END + 6}px); }
          40%  { transform: translateY(-${BALL_RADIUS_END - 4}px); }
          70%  { transform: translateY(-${BALL_RADIUS_END + 2}px); }
          100% { transform: translateY(-${BALL_RADIUS_END}px); }
        }
        .animate-ball-rebound {
          animation: ball-rebound 0.5s ease-out forwards;
          animation-delay: 3.6s;
        }
      `}</style>
    </div>
  );
};
