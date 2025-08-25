// src/hooks/useRouletteGame.ts
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getColor } from "@/lib/utils/gameLogic";
import { generateRandomUser } from "@/lib/utils/randomUsers";
import { useSocket, type GameStateUpdate } from "./useSocket";
import { useBets } from "./useBets";
import { useSoundController } from "./useSoundController";
import type { GameMode, Player } from "@/lib/types";
import { isBetAllowed } from "@/lib/utils/rouletteRules";
import { getBackendKeyFromDisplayKey } from "@/lib/utils/rouletteRules"; // Importa la nueva función

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
  const [resultStatus, setResultStatus] = useState<
    "win" | "lose" | "no_bet" | null
  >(null);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spinningRef = useRef<boolean>(false);
  const sound = useSoundController();
  const prevGameState = useRef<string>("idle");

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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState(data.state);

    if (data.state === "betting") {
      if (prevGameState.current !== "betting") {
        setIsSpinning(false);
        spinningRef.current = false;
        setWinningNumber(null);
        setPendingWinnings(0);
        setTotalBet(0);
        betsRef.current = {};
        setBetsDisplayAndRef({});
        betsDisplayRef.current = {};
        setResultStatus(null);
      }

      const remaining = data.time ?? 0;
      setTimer(remaining);
      let countdown = remaining;
      timerRef.current = setInterval(() => {
        countdown--;
        setTimer(countdown);
        if (countdown <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 1000);

      sound.playSound("clock");
    }

    if (data.state === "spinning") {
      if (data.winningNumber != null) {
        setWinningNumber(data.winningNumber);
      }
      if (!spinningRef.current) {
        setIsSpinning(true);
        spinningRef.current = true;
        sound.playSound("spin");
      }
    }

    if (data.state === "payout") {
      setIsSpinning(true);

      if (data.winningNumber != null) {
        const totalWin =
          typeof data.totalWinnings === "number" ? data.totalWinnings : 0;
        const newBalance =
          typeof data.newBalance === "number" ? data.newBalance : balance;

        setPendingWinnings(totalWin);
        setBalance(newBalance);

        if (data.resultStatus) {
          setResultStatus(data.resultStatus);
        }

        setWinningNumberHistory((prev) =>
          [
            {
              number: data.winningNumber,
              color: data.winningColor ?? getColor(data.winningNumber),
            },
            ...prev,
          ].slice(0, 5)
        );

        const didPlayerBet = Object.keys(betsRef.current).length > 0;
        if (didPlayerBet) {
          lastBetRef.current = { ...betsDisplayRef.current };
        }

        if (data.resultStatus === "win") {
          sound.playSound("win");
        } else if (data.resultStatus === "lose") {
          sound.playSound("lose");
        }
      }
    }

    prevGameState.current = data.state;
  };

  const { socketRef } = useSocket({ onGameStateUpdate });

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const user = player ?? generateRandomUser();

    const onConnect = () => {
      socket.emit(
        "single-join",
        { userId: user.id, userName: user.name, balance: user.balance },
        (response: { roomId?: string; error?: string }) => {
          if (response?.roomId) {
            setRoomId(response.roomId);
            setIsReady(true);
          } else if (response?.error) {
            console.error(
              `❌ [socket] Error al unirse a la sala: ${response.error}`
            );
          }
        }
      );
    };
    socket.on("connect", onConnect);

    socket.on(
      "player-initialized",
      (data: { balance: number; playerId: string }) => {
        setBalance(data.balance);
      }
    );

    return () => {
      socket.off("connect", onConnect);
      socket.off("player-initialized");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [socketRef, player]);

  const handlePlaceBet = (displayKey: string) => {
    const backendKey = getBackendKeyFromDisplayKey(displayKey);

    if (!isBetAllowed(backendKey, betsRef.current)) {
      console.warn(
        `🚫 [Apuesta] Validación de reglas falló para la apuesta ${displayKey}`
      );
      return;
    }

    if (!socketRef.current || !roomId || !isReady || gameState !== "betting") {
      console.warn(
        "🚫 [Apuesta] No se puede apostar en este momento. Estado actual:",
        gameState
      );
      return;
    }
    if (balance < selectedChip) {
      console.warn("💸 [Apuesta] Saldo insuficiente para realizar la apuesta.");
      return;
    }

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
    resultStatus,
    sound,
  } as const;
}
