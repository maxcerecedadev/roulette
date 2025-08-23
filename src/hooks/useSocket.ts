// src/hooks/useSocket.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Tipos de payloads que puede enviar el servidor en game-state-update.
 */
export interface BetResultItem {
  betKey: string;
  amount: number;
  payoutMultiplier?: number;
  wonAmount?: number;
}

export interface GameStateUpdate {
  winningColor: string;
  state: string;
  time?: number;
  winningNumber: number;
  totalWinnings: number;
  newBalance?: number;
  betResults?: BetResultItem[];
}

export type GenericServerAck = {
  success: boolean;
  message?: string;
  [k: string]: unknown;
};

const SOCKET_IO_URL = import.meta.env.VITE_SOCKET_IO_URL;

/**
 * Handlers concretos con tipos.
 */
type GameStateHandler = (data: GameStateUpdate) => void;
type GenericHandler = (data: GenericServerAck) => void;

export function useSocket(params: {
  onGameStateUpdate: GameStateHandler;
  onBetPlaced?: GenericHandler;
  onBetsCleared?: GenericHandler;
  onUndoBet?: GenericHandler;
}) {
  const { onGameStateUpdate, onBetPlaced, onBetsCleared, onUndoBet } = params;

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (import.meta.env.DEV && !SOCKET_IO_URL) {
      console.error("VITE_SOCKET_IO_URL no está definido.");
      return;
    }

    const socket = io(SOCKET_IO_URL);
    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      console.log("✅ Socket connected:", socket.id);
    };
    const handleDisconnect = () => {
      setConnected(false);
      console.log("⚠️ Socket disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("game-state-update", (payload: GameStateUpdate) => {
      onGameStateUpdate(payload);
    });

    if (onBetPlaced) {
      socket.on("bet-placed", (payload: GenericServerAck) =>
        onBetPlaced(payload)
      );
    }
    if (onBetsCleared) {
      socket.on("bets-cleared", (payload: GenericServerAck) =>
        onBetsCleared(payload)
      );
    }
    if (onUndoBet) {
      socket.on("undo-bet", (payload: GenericServerAck) => onUndoBet(payload));
    }

    socket.on("connect_error", (err: Error) =>
      console.error("❌ connect_error:", err?.message ?? err)
    );

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("game-state-update");
      if (onBetPlaced) socket.off("bet-placed");
      if (onBetsCleared) socket.off("bets-cleared");
      if (onUndoBet) socket.off("undo-bet");
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socketRef, connected };
}
