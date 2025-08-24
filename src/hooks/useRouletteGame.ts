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
    console.log("📦 [Payload crudo recibido]:", JSON.stringify(data, null, 2));
    console.log(
      `🕹️ [onGameStateUpdate] Estado recibido: ${data.state} | Estado anterior: ${prevGameState.current} | Número ganador: ${data.winningNumber} | Ganancias totales: ${data.totalWinnings}`
    );

    if (timerRef.current) {
      console.log("⏳ [onGameStateUpdate] Limpiando temporizador anterior.");
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState(data.state);

    if (data.state === "betting") {
      if (prevGameState.current !== "betting") {
        console.log("💰 [Fase Apuestas] Reiniciando la partida.");
        setIsSpinning(false);
        spinningRef.current = false;
        setWinningNumber(null);
        setPendingWinnings(0);
        setTotalBet(0);
        betsRef.current = {};
        setBetsDisplayAndRef({});
        betsDisplayRef.current = {};
        // 🔄 LIMPIEZA ADICIONAL: Limpiamos el resultado de la ronda anterior
        setResultStatus(null);
      }

      const remaining = data.time ?? 0;
      setTimer(remaining);
      console.log(
        `⏳ [Fase Apuestas] Temporizador de apuestas iniciado: ${remaining}s`
      );

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
      console.log("🌀 [Fase Giro] El servidor ha iniciado el giro.");
      if (data.winningNumber != null) {
        setWinningNumber(data.winningNumber);
        console.log(
          `🎉 [Fase Giro] Número ganador recibido: ${data.winningNumber}`
        );
      }
      if (!spinningRef.current) {
        setIsSpinning(true);
        spinningRef.current = true;
        sound.playSound("spin");
        console.log("🎶 [Fase Giro] Reproduciendo sonido de giro.");
      }
    }

    if (data.state === "payout") {
      console.log(
        "💸 [Fase Pago] Estado de pago recibido. Datos completos:",
        data
      );

      setIsSpinning(true);

      if (data.winningNumber != null) {
        const totalWin =
          typeof data.totalWinnings === "number" ? data.totalWinnings : 0;
        const newBalance =
          typeof data.newBalance === "number" ? data.newBalance : balance;

        console.log(
          `💰 [Fase Pago] Ganancias: ${totalWin} | Nuevo Balance: ${newBalance}`
        );
        setPendingWinnings(totalWin);
        setBalance(newBalance);

        if (data.resultStatus) {
          console.log(
            `📊 [Resultado] Servidor dice: ${data.resultStatus} | Payload crudo:`,
            JSON.stringify(data, null, 2)
          );
          setResultStatus(data.resultStatus);
        } else {
          console.warn(
            "⚠️ [Resultado] El servidor NO envió resultStatus en este payload.",
            data
          );
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

        const didPlayerBet = Object.keys(betsDisplayRef.current).length > 0;
        console.log(
          `📝 [Apuestas] ¿El jugador apostó en esta ronda?: ${didPlayerBet}`
        );
        if (didPlayerBet) {
          lastBetRef.current = { ...betsDisplayRef.current };
          console.log(
            "✨ [Apuestas] Última apuesta guardada:",
            lastBetRef.current
          );
        }

        console.log("🧹 [Apuestas] Limpiando apuestas de la ronda actual.");

        if (data.resultStatus === "win") {
          console.log(
            "🎶 [Sonido] ¡Ganaste! Reproduciendo sonido de victoria."
          );
          sound.playSound("win");
        } else if (data.resultStatus === "lose") {
          console.log("🎶 [Sonido] Perdiste. Reproduciendo sonido de derrota.");
          sound.playSound("lose");
        } else if (data.resultStatus === "no_bet") {
          console.log("😐 [Sonido] No apostaste, no se reproduce sonido.");
        } else {
          console.warn(
            "⚠️ [Resultado] resultStatus desconocido o ausente:",
            data.resultStatus
          );
        }
      } else {
        console.warn(
          "⚠️ [Fase Pago] No vino número ganador en el payload:",
          data
        );
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
      console.log(
        "🌐 [socket] Conectado. Uniendo a la sala con el usuario:",
        user.name
      );
      socket.emit(
        "single-join",
        { userId: user.id, userName: user.name, balance: user.balance },
        (response: { roomId?: string; error?: string }) => {
          if (response?.roomId) {
            setRoomId(response.roomId);
            setIsReady(true);
            console.log(`🚪 [socket] Unido a la sala: ${response.roomId}`);
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
        console.log(
          `✅ [player-initialized] Jugador inicializado. Balance: ${data.balance}`
        );
        setBalance(data.balance);
      }
    );

    return () => {
      console.log("🔌 [socket] Desconectando listeners de socket.");
      socket.off("connect", onConnect);
      socket.off("player-initialized");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [socketRef, player]);

  const handlePlaceBet = (displayKey: string) => {
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

    console.log(
      `🟢 [handlePlaceBet] Apostando ${selectedChip} en: ${displayKey} | Nuevo saldo: ${
        balance - selectedChip
      }`
    );
  };

  const handleClearBets = () => {
    if (!socketRef.current || !roomId) return;
    console.log("🧹 [Controles] Borrando todas las apuestas.");
    clearBets(socketRef, roomId);
    setTotalBet(0);
  };

  const handleUndoBet = () => {
    if (!socketRef.current || !roomId) return;
    console.log("↩️ [Controles] Deshaciendo la última apuesta.");
    undoBet(socketRef, roomId);
  };

  const handleRepeatBet = () => {
    if (!socketRef.current || !roomId) return;
    console.log("🔁 [Controles] Repitiendo la última apuesta.");
    repeatBet(socketRef, roomId);
  };

  const handleDoubleBet = () => {
    if (!socketRef.current || !roomId) return;
    console.log("2️⃣ [Controles] Doblando la última apuesta.");
    doubleBet(socketRef, roomId);
  };

  const handleLeaveAndNavigate = () => {
    if (socketRef.current && roomId) {
      console.log(`🚪 [Salir] Abandonando la sala ${roomId}.`);
      socketRef.current.emit("leave-room", { roomId });
      socketRef.current.disconnect();
    }
    console.log(
      "[handleLeaveAndNavigate] Navegando de vuelta a la pantalla de inicio."
    );
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
