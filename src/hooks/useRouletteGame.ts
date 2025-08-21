// src/hooks/useRouletteGame.ts

import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { SoundPlayer } from "@/classes/SoundPlayer";
import type {
  BetHistoryItem,
  JoinRoomResponse,
  SpinResponse,
  WinningNumberHistoryItem,
} from "@/lib/types";

const SOCKET_IO_URL = import.meta.env.VITE_SOCKET_IO_URL;

export const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
export const blackNumbers = [
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
  if (bets[winningNumber.toString()]) {
    winnings += (bets[winningNumber.toString()] || 0) * 35;
  }
  for (const key in groupBets) {
    if (groupBets[key].includes(winningNumber) && (bets[key] || 0) > 0) {
      if (
        key === "1ra 12" ||
        key === "2da 12" ||
        key === "3ra 12" ||
        key.startsWith("2:1")
      ) {
        winnings += bets[key] * 2;
      } else {
        winnings += bets[key] * 1;
      }
    }
  }
  return winnings;
};

interface UseRouletteGameProps {
  soundController?: {
    toggleMute: () => void;
    isMuted: boolean;
    playSound: (name: string) => void;
  };
}

export const useRouletteGame = ({ soundController }: UseRouletteGameProps) => {
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
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pendingWinnings, setPendingWinnings] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  const internalSoundRef = useRef<SoundPlayer | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    internalSoundRef.current = new SoundPlayer();
    internalSoundRef.current
      .loadSounds()
      .then(() => {
        setIsMuted(internalSoundRef.current?.getIsMuted() ?? false);
      })
      .catch((err) => {
        console.warn("No se cargaron todos los sonidos:", err);
      });

    if (import.meta.env.DEV && !SOCKET_IO_URL) {
      throw new Error("VITE_SOCKET_IO_URL is not defined in the .env file.");
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_IO_URL);
      socketRef.current.on("connect", () => {
        console.log("✅ Conectado al servidor.");
        socketRef.current?.emit("single-join", (response: JoinRoomResponse) => {
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
      }
    };
  }, []);

  const sound = {
    playSound: (name: string) => {
      if (soundController?.playSound) {
        try {
          soundController.playSound(name);
        } catch (e) {
          console.warn(
            "Error calling soundController.playSound, using internal player:",
            e
          );
          internalSoundRef.current?.playSound(name);
        }
      } else {
        internalSoundRef.current?.playSound(name);
      }
    },
    toggleMute: () => {
      if (soundController?.toggleMute) {
        try {
          soundController.toggleMute();
        } catch (e) {
          console.warn(
            "Error calling soundController.toggleMute, using internal player:",
            e
          );
          internalSoundRef.current?.toggleMute();
          setIsMuted(internalSoundRef.current?.getIsMuted() ?? false);
        }
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
    socketRef.current?.emit(
      "single-spin",
      { roomId },
      (response: SpinResponse) => {
        if (response.error) {
          setIsSpinning(false);
          return;
        }
        const finalWinningNumber = response.result?.number as number;
        const wonAmount = calculateWinnings(finalWinningNumber, bets);
        setWinningNumber(finalWinningNumber);
        setPendingWinnings(wonAmount);
      }
    );
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

  const handleLeaveAndNavigate = () => {
    if (!socketRef.current) {
      navigate("/");
      return;
    }
    if (roomId) {
      try {
        socketRef.current?.emit("leave-room", { roomId: roomId });
      } catch (err) {
        console.error(err);
      }
    }
    try {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    } catch (err) {
      console.error(err);
    }
    socketRef.current = null;
    navigate("/");
  };

  const handleSpinEnd = () => {
    setTimeout(() => {
      if (winningNumber !== null) {
        const newHistoryItem: WinningNumberHistoryItem = {
          number: winningNumber,
          color: redNumbers.includes(winningNumber)
            ? "red"
            : winningNumber === 0
            ? "green"
            : "black",
        };
        setWinningNumberHistory((prev) =>
          [newHistoryItem, ...prev].slice(0, 10)
        );
      }
      setBalance((prev) => prev + pendingWinnings);
      setPendingWinnings(0);
      setTotalBet(0);
      setBets({});
      setIsSpinning(false);
    }, 2000);
  };

  return {
    balance,
    setBalance,
    selectedChip,
    setSelectedChip,
    totalBet,
    isSpinning,
    winningNumber,
    bets,
    winningNumberHistory,
    pendingWinnings,
    roomId,
    handlePlaceBet,
    handleSpin,
    handleClearBets,
    handleUndoBet,
    handleRepeatBet,
    handleDoubleBet,
    handleLeaveAndNavigate,
    handleSpinEnd,
    sound,
  };
};
