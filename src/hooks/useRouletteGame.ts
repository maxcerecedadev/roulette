// src/hooks/useRouletteGame.ts
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getColor } from "@/lib/utils/gameLogic";
import { generateRandomUser } from "@/lib/utils/randomUsers";
import { useSocket, type GameStateUpdate } from "./useSocket";
import { useBets } from "./useBets";
import { useSoundController } from "./useSoundController";
import type { GameMode, Player } from "@/lib/types";

export function useRouletteGame({
  player,
}: {
  mode: GameMode;
  player?: Player;
}) {
  const [balance, setBalance] = useState<number>(10000);
  const [selectedChip, setSelectedChip] = useState<number>(50);
  const [totalBet, setTotalBet] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [winningNumberHistory, setWinningNumberHistory] = useState<
    { number: number; color: string }[]
  >([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pendingWinnings, setPendingWinnings] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [gameState, setGameState] = useState<string>("idle");
  const [timer, setTimer] = useState<number | null>(null);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sound = useSoundController();

  const {
    bets,
    betsRef,
    betsDisplay,
    setBetsDisplayAndRef,
    betsDisplayRef,
    lastBetRef,
    placeBet,
    clearBets,
    undoBet,
    repeatBet,
    doubleBet,
  } = useBets({});

  const onGameStateUpdate = (data: GameStateUpdate) => {
    setGameState(data.state);
    setIsSpinning(data.state === "spinning");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (data.state === "betting") {
      setWinningNumber(null);
      setPendingWinnings(0);
      setTimer(data.time ?? null);
      sound.playSound("clock");

      let remaining = data.time ?? 0;
      timerRef.current = setInterval(() => {
        remaining--;
        setTimer(remaining);
        if (remaining <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 1000);
    }

    if (data.state === "spinning") {
      sound.playSound("spin");
    }

    if (data.state === "payout") {
      const finalWinning = data.winningNumber ?? null;
      if (finalWinning !== null) {
        setWinningNumber(finalWinning);

        const serverTotalWinnings =
          typeof data.totalWinnings === "number" ? data.totalWinnings : 0;
        const serverNewBalance =
          typeof data.newBalance === "number" ? data.newBalance : balance;

        setPendingWinnings(serverTotalWinnings);
        setBalance(serverNewBalance);

        setWinningNumberHistory((prev) =>
          [
            { number: finalWinning, color: getColor(finalWinning) },
            ...prev,
          ].slice(0, 10)
        );

        const didPlayerBet = Object.keys(betsDisplayRef.current).length > 0;
        if (didPlayerBet) lastBetRef.current = { ...betsDisplayRef.current };

        betsRef.current = {};
        setBetsDisplayAndRef({});
        betsDisplayRef.current = {};

        if (serverTotalWinnings > 0) {
          sound.playSound("win");
        } else if (didPlayerBet) {
          sound.playSound("lose");
        }
      }
    }
  };

  const { socketRef } = useSocket({ onGameStateUpdate });

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onConnect = () => {
      const user = player ?? generateRandomUser();
      socket.emit(
        "single-join",
        { userId: user.id, userName: user.name },
        (response: { roomId?: string; error?: string }) => {
          if (response?.roomId) {
            setRoomId(response.roomId);
            setIsReady(true);
          } else {
            console.error("join error:", response?.error);
          }
        }
      );
    };

    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [socketRef, player]);

  const handlePlaceBet = (displayKey: string) => {
    if (!socketRef.current || !roomId || !isReady || gameState !== "betting")
      return;
    if (balance < selectedChip) return;

    placeBet(socketRef, displayKey, selectedChip, roomId);
    setBalance((b) => b - selectedChip);
    setTotalBet((t) => t + selectedChip);
    sound.playSound("chip");
  };

  const handleClearBets = () => {
    if (!socketRef.current || !roomId) return;
    clearBets(socketRef, roomId);
    setTotalBet(0);
  };

  const handleUndoBet = () => {
    if (!socketRef.current || !roomId) return;
    undoBet(socketRef, roomId);
  };

  const handleRepeatBet = () => {
    if (!socketRef.current || !roomId) return;
    repeatBet(socketRef, roomId);
  };

  const handleDoubleBet = () => {
    if (!socketRef.current || !roomId) return;
    doubleBet(socketRef, roomId);
  };

  const handleLeaveAndNavigate = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit("leave-room", { roomId });
      socketRef.current.disconnect();
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
    betsDisplay,
    winningNumberHistory,
    pendingWinnings,
    roomId,
    isReady,
    gameState,
    timer,
    setBetsDisplayAndRef,
    handlePlaceBet,
    handleClearBets,
    handleUndoBet,
    handleRepeatBet,
    handleDoubleBet,
    handleLeaveAndNavigate,
    sound,
  } as const;
}
