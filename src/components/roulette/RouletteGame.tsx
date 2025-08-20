import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { ChipButton } from "./ChipButton";
import { Button } from "./Button";
import { RouletteBetButton } from "./RouletteBetButton";
import { Wheel } from "./Wheel";
import { useNavigate } from "react-router-dom";
import { SoundPlayer } from "@/classes/SoundPlayer";
import { LeaveGameDialog } from "../LeaveGameDialog";

interface BetHistoryItem {
  key: string;
  amount: number;
}

interface WinningNumberHistoryItem {
  number: number;
  color: string;
}

interface RouletteGameProps {
  mode?: "single" | "tournament";
  player?: any;
  musicController: {
    toggleMusic: () => void;
    isMusicPlaying: boolean;
  };
  soundController?: {
    toggleMute: () => void;
    isMuted: boolean;
    playSound: (name: string) => void;
  };
}

const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const blackNumbers = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

const groupBets: Record<string, number[]> = {
  "1-18": Array.from({ length: 18 }, (_, i) => i + 1),
  "19-36": Array.from({ length: 18 }, (_, i) => i + 19),
  PAR: Array.from({ length: 18 }, (_, i) => (i + 1) * 2),
  IMPAR: Array.from({ length: 18 }, (_, i) => i * 2 + 1),
  ROJO: redNumbers,
  NEGRO: blackNumbers,
  "1ra 12": Array.from({ length: 12 }, (_, i) => i + 1),
  "2da 12": Array.from({ length: 12 }, (_, i) => i + 13),
  "3ra 12": Array.from({ length: 12 }, (_, i) => i + 25),
  "2:1-1": Array.from({ length: 12 }, (_, i) => i * 3 + 1),
  "2:1-2": Array.from({ length: 12 }, (_, i) => i * 3 + 2),
  "2:1-3": Array.from({ length: 12 }, (_, i) => i * 3 + 3),
};

const calculateWinnings = (
  winningNumber: number,
  bets: Record<string, number>
): number => {
  let winnings = 0;

  // Pleno
  if (bets[winningNumber.toString()]) {
    winnings += (bets[winningNumber.toString()] || 0) * 35;
  }

  // Apuestas de grupo
  for (const key in groupBets) {
    if (groupBets[key].includes(winningNumber) && (bets[key] || 0) > 0) {
      if (
        key === "1ra 12" ||
        key === "2da 12" ||
        key === "3ra 12" ||
        key.startsWith("2:1")
      ) {
        winnings += bets[key] * 2; // docenas y columnas 2:1
      } else {
        winnings += bets[key] * 1; // apuestas parejas 1:1
      }
    }
  }

  return winnings;
};

export const RouletteGame = ({
  musicController,
  soundController,
}: RouletteGameProps) => {
  const [balance, setBalance] = useState(10000);
  const [selectedChip, setSelectedChip] = useState(50);
  const [totalBet, setTotalBet] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [betHistory, setBetHistory] = useState<BetHistoryItem[][]>([]);
  const [winningNumberHistory, setWinningNumberHistory] = useState<
    WinningNumberHistoryItem[]
  >([]);
  const [showPaymentChart, setShowPaymentChart] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pendingWinnings, setPendingWinnings] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  const internalSoundRef = useRef<SoundPlayer | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Inicializa el socket una sola vez
  useEffect(() => {
    internalSoundRef.current = new SoundPlayer("/res/sounds");
    internalSoundRef.current
      .loadSounds()
      .then(() => {
        setIsMuted(internalSoundRef.current?.getIsMuted() ?? false);
      })
      .catch((err) => {
        console.warn("No se cargaron todos los sonidos:", err);
      });

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:2000");
      socketRef.current.on("connect", () => {
        console.log("✅ Conectado al servidor.");
        socketRef.current?.emit("single-join", (response: any) => {
          if (response?.roomId) {
            setRoomId(response.roomId);
            console.log(`🎉 ¡Unido a la sala! ID de sala: ${response.roomId}`);
          } else {
            console.error("❌ Error al unirse a la sala:", response?.error);
          }
        });
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Error de conexión de Socket.IO:", err.message);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("🔴 Socket desconectado:", reason);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("🔴 Socket desconectado en cleanup.");
      }
    };
  }, []);

  const sound = {
    playSound: (name: string) => {
      if (soundController?.playSound) {
        try {
          soundController.playSound(name);
        } catch {}
      } else {
        internalSoundRef.current?.playSound(name);
      }
    },
    toggleMute: () => {
      if (soundController?.toggleMute) {
        try {
          soundController.toggleMute();
        } catch {}
      } else {
        internalSoundRef.current?.toggleMute();
        setIsMuted(internalSoundRef.current?.getIsMuted() ?? false);
      }
    },
    isMuted: () => {
      if (typeof soundController?.isMuted === "boolean") {
        return soundController.isMuted;
      }
      return internalSoundRef.current?.getIsMuted() ?? isMuted;
    },
  };

  const handlePlaceBet = (betKey: string) => {
    if (isSpinning || balance < selectedChip) return;

    const newBets = { ...bets, [betKey]: (bets[betKey] || 0) + selectedChip };
    setBets(newBets);
    setBalance((prev) => prev - selectedChip);
    setTotalBet((prev) => prev + selectedChip);
    setBetHistory((prev) => [
      ...prev,
      Object.keys(newBets).map((key) => ({ key, amount: newBets[key] })),
    ]);
    sound.playSound("chip");
  };

  const handleSpin = () => {
    if (totalBet <= 0 || isSpinning || !roomId) {
      console.error(
        "No se puede girar. No hay apuesta, la ruleta ya está girando o no se ha unido a una sala."
      );
      return;
    }

    setIsSpinning(true);
    setWinningNumber(null);
    setPendingWinnings(0);
    sound.playSound("spin");

    socketRef.current?.emit("single-spin", { roomId }, (response: any) => {
      console.log("Respuesta del servidor recibida:", response);

      if (response.error) {
        console.error("Error del servidor:", response.error);
        setIsSpinning(false);
        return;
      }

      const finalWinningNumber = response.result.number as number;

      // 🟢 CORREGIDO: El estado se actualiza aquí después de recibir el número ganador
      const wonAmount = calculateWinnings(finalWinningNumber, bets);
      setWinningNumber(finalWinningNumber);
      setPendingWinnings(wonAmount);

      setWinningNumberHistory((prev) =>
        [
          {
            number: finalWinningNumber,
            color: redNumbers.includes(finalWinningNumber)
              ? "red"
              : finalWinningNumber === 0
              ? "green"
              : "black",
          },
          ...prev,
        ].slice(0, 10)
      );
    });
  };

  const handleClearBets = () => {
    setBalance((prev) => prev + totalBet);
    setBets({});
    setTotalBet(0);
    setBetHistory([]);
    sound.playSound("button");
  };

  const handleUndoBet = () => {
    if (betHistory.length > 1) {
      const previousBets = betHistory[betHistory.length - 2].reduce(
        (acc, item) => {
          acc[item.key] = item.amount;
          return acc;
        },
        {} as Record<string, number>
      );

      const prevTotal = Object.values(previousBets).reduce((a, b) => a + b, 0);
      const lastBetAmount = totalBet - prevTotal;

      setBalance((prev) => prev + lastBetAmount);
      setBets(previousBets);
      setTotalBet(prevTotal);
      setBetHistory((prev) => prev.slice(0, -1));
      sound.playSound("button");
    }
  };

  const handleRepeatBet = () => {
    if (betHistory.length > 0) {
      const lastBets = betHistory[betHistory.length - 1];
      const newTotalBet = lastBets.reduce((acc, item) => acc + item.amount, 0);

      if (balance < newTotalBet) return;

      const restored = lastBets.reduce((acc, item) => {
        acc[item.key] = item.amount;
        return acc;
      }, {} as Record<string, number>);

      setBets(restored);
      setTotalBet(newTotalBet);
      setBalance((prev) => prev - newTotalBet);
      setBetHistory((prev) => [...prev, lastBets]);
      sound.playSound("button");
    }
  };

  const handleDoubleBet = () => {
    const doubledBets = Object.keys(bets).reduce((acc, key) => {
      acc[key] = (bets[key] || 0) * 2;
      return acc;
    }, {} as Record<string, number>);

    const doubledTotal = Object.values(doubledBets).reduce((a, b) => a + b, 0);
    const extraNeeded = doubledTotal - totalBet;

    if (balance < extraNeeded) return;

    setBets(doubledBets);
    setBalance((prev) => prev - extraNeeded);
    setTotalBet(doubledTotal);
    setBetHistory((prev) => [
      ...prev,
      Object.keys(doubledBets).map((key) => ({
        key,
        amount: doubledBets[key],
      })),
    ]);
    sound.playSound("button");
  };

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
        <LeaveGameDialog socket={socketRef} roomId={roomId} />
      </div>

      {/* Modal de la ruleta (animación) */}

      {isSpinning && (
       <div className="absolute inset-0 flex bg-black/60 items-center justify-center z-50 backdrop-blur-sm">
          <Wheel
            isSpinning={isSpinning}
            winningNumber={winningNumber}
            winningAmount={pendingWinnings}
            onSpinEnd={() => {
              setTimeout(() => {
                setBalance((prev) => prev + pendingWinnings);
                setPendingWinnings(0);
                setTotalBet(0);
                setBets({});
                setIsSpinning(false);
              }, 2000);
            }}
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
