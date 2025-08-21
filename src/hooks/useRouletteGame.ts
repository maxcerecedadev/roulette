// src/hooks/useRouletteGame.ts

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { SoundPlayer } from "@/classes/SoundPlayer";
import type { JoinRoomResponse, WinningNumberHistoryItem } from "@/lib/types";
import { generateRandomUser } from "@/lib/utils";
import { calculateWinnings, getColor } from "@/lib/utils/gameLogic";

const SOCKET_IO_URL = import.meta.env.VITE_SOCKET_IO_URL;

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
  const [winningNumberHistory, setWinningNumberHistory] = useState<
    WinningNumberHistoryItem[]
  >([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pendingWinnings, setPendingWinnings] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [gameState, setGameState] = useState("idle");
  const [timer, setTimer] = useState<number | null>(null);

  const navigate = useNavigate();

  const internalSoundRef = useRef<SoundPlayer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBetRef = useRef<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false); // Mantener el estado local para el sonido

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
      console.error("VITE_SOCKET_IO_URL no está definido.");
      return;
    }

    const socket = io(SOCKET_IO_URL);
    socketRef.current = socket;

    const onConnect = () => {
      console.log("✅ Conectado al servidor.");
      const user = generateRandomUser();
      console.log(`🎉 Uniendo como: ${user.name} (${user.id})`);

      socket.emit(
        "single-join",
        { userId: user.id, userName: user.name },
        (response: JoinRoomResponse) => {
          if (response?.roomId) {
            setRoomId(response.roomId);
            console.log(`🎉 ¡Unido a la sala! ID de sala: ${response.roomId}`);
            setIsReady(true);
          } else {
            console.error("❌ Error al unirse a la sala:", response?.error);
          }
        }
      );
    };

    const onGameStateUpdate = (data: {
      state: string;
      time?: number;
      winningNumber?: number;
    }) => {
      console.log(`🎮 Estado del juego: ${data.state}, Tiempo: ${data.time}`);
      setGameState(data.state);
      setIsSpinning(data.state === "spinning");

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (data.state === "betting") {
        setWinningNumber(null);
        setPendingWinnings(0);
        setTimer(data.time ?? null);
        sound.playSound("betting-start");

        let remainingTime = data.time ?? 0;
        timerRef.current = setInterval(() => {
          remainingTime--;
          setTimer(remainingTime);
          if (remainingTime <= 0) {
            clearInterval(timerRef.current!);
          }
        }, 1000);
      }

      if (data.state === "spinning") {
        sound.playSound("spin");
      }

      if (data.state === "payout") {
        const finalWinningNumber = data.winningNumber ?? null;
        if (finalWinningNumber !== null) {
          setWinningNumber(finalWinningNumber);
          const wonAmount = calculateWinnings(finalWinningNumber, bets);
          setPendingWinnings(wonAmount);

          const newHistoryItem: WinningNumberHistoryItem = {
            number: finalWinningNumber,
            color: getColor(finalWinningNumber),
          };
          setWinningNumberHistory((prev) =>
            [newHistoryItem, ...prev].slice(0, 10)
          );
          setBalance((prev) => prev + wonAmount);
          // Actualiza lastBetRef con las apuestas actuales antes de limpiarlas
          lastBetRef.current = { ...bets };
          // Las apuestas se limpian después del cálculo de ganancias
          setBets({});
          setTotalBet(0);
          sound.playSound("win");
        }
        console.log("💰 Pagos realizados y apuestas limpiadas.");
      }
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", (err) => {
      console.error("❌ Error de conexión de Socket.IO:", err.message);
    });
    socket.on("game-state-update", onGameStateUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect", onConnect);
        socketRef.current.off("game-state-update", onGameStateUpdate);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const sound = {
    // Si se pasa un soundController, usarlo. De lo contrario, usar el interno.
    playSound: (name: string) => {
      if (soundController?.playSound) {
        soundController.playSound(name);
      } else {
        internalSoundRef.current?.playSound(name);
      }
    },
    toggleMute: () => {
      if (soundController?.toggleMute) {
        soundController.toggleMute();
      } else {
        internalSoundRef.current?.toggleMute();
        setIsMuted(internalSoundRef.current?.getIsMuted() ?? false);
      }
    },
    isMuted: () => {
      if (soundController?.isMuted) {
        return soundController.isMuted;
      }
      return isMuted;
    },
  };

  const handlePlaceBet = (betKey: string) => {
    if (!isReady || gameState !== "betting" || balance < selectedChip) return;

    const socket = socketRef.current;
    if (!socket || !roomId) {
      console.error(
        "No se puede apostar. Socket o RoomId no están disponibles."
      );
      return;
    }

    socket.emit("place-bet", { betKey, amount: selectedChip, roomId });

    setBets((prev) => {
      const newBets = { ...prev };
      newBets[betKey] = (newBets[betKey] || 0) + selectedChip;
      return newBets;
    });
    setBalance((prev) => prev - selectedChip);
    setTotalBet((prev) => prev + selectedChip);
    sound.playSound("chip");
  };

  const handleClearBets = () => {
    if (!isReady) return;
    setBalance((prev) => prev + totalBet);
    setBets({});
    setTotalBet(0);
    sound.playSound("button");
  };

  const handleUndoBet = () => {
    if (!isReady || gameState !== "betting" || totalBet === 0) return;

    // Convertir el objeto de apuestas a un array de tuplas [key, value] para mantener el orden
    const betsArray = Object.entries(bets);
    if (betsArray.length === 0) return;

    // Obtener la última apuesta
    const [lastBetKey, lastBetAmount] = betsArray[betsArray.length - 1] as [
      string,
      number
    ];

    // Restar la cantidad de la última apuesta
    const newBets = { ...bets };
    newBets[lastBetKey] -= lastBetAmount;
    if (newBets[lastBetKey] <= 0) {
      delete newBets[lastBetKey];
    }

    setBets(newBets);
    setBalance((prev) => prev + lastBetAmount);
    setTotalBet((prev) => prev - lastBetAmount);
    sound.playSound("button");
  };

  const handleRepeatBet = () => {
    if (
      !isReady ||
      gameState !== "betting" ||
      Object.keys(lastBetRef.current).length === 0
    )
      return;

    const lastBets = lastBetRef.current;
    let newTotalBet = 0;

    for (const betType in lastBets) {
      newTotalBet += lastBets[betType];
    }

    if (newTotalBet > balance) {
      console.log("❌ Saldo insuficiente para repetir la apuesta.");
      return;
    }

    setBalance((prev) => prev - newTotalBet);
    setTotalBet(newTotalBet);
    setBets(lastBets);
    sound.playSound("button");
  };

  const handleDoubleBet = () => {
    if (!isReady || gameState !== "betting" || totalBet === 0) return;

    const newTotalBet = totalBet * 2;
    if (newTotalBet > balance) {
      console.log("❌ Saldo insuficiente para doblar la apuesta.");
      return;
    }

    const doubledBets = Object.keys(bets).reduce((acc, key) => {
      acc[key] = (bets[key] || 0) * 2;
      return acc;
    }, {} as Record<string, number>);

    setBalance((prev) => prev - totalBet);
    setTotalBet(newTotalBet);
    setBets(doubledBets);
    sound.playSound("button");
  };

  const handleLeaveAndNavigate = () => {
    const socket = socketRef.current;
    if (!socket) {
      navigate("/");
      return;
    }
    if (roomId) {
      try {
        socket.emit("leave-room", { roomId: roomId });
      } catch (err) {
        console.error(err);
      }
    }
    navigate("/");
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
    isReady,
    gameState,
    timer,
    handlePlaceBet,
    handleClearBets,
    handleUndoBet,
    handleRepeatBet,
    handleDoubleBet,
    handleLeaveAndNavigate,
    sound,
  };
};
