// src/hooks/useSocket.ts

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_IO_URL = import.meta.env.VITE_SOCKET_IO_URL;

// Usamos el tipo genérico de Socket.IO para los eventos
type SocketListeners = {
  [key: string]: (...args: unknown[]) => void;
};

export const useSocket = (listeners: SocketListeners = {}): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      return;
    }

    if (import.meta.env.DEV && !SOCKET_IO_URL) {
      throw new Error("VITE_SOCKET_IO_URL is not defined in the .env file.");
    }

    const socket = io(SOCKET_IO_URL);
    socketRef.current = socket;

    for (const eventName in listeners) {
      socket.on(eventName, listeners[eventName]);
    }

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor.");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Error de conexión de Socket.IO:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket desconectado:", reason);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [listeners]);
  return socketRef.current;
};
