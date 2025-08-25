// src/hooks/useBets.ts
import { useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  buildBetPayload,
  type BetPayload,
  normalizeBetKey,
} from "@/lib/utils/betUtils";
import { isBetAllowed } from "@/lib/utils/rouletteRules";

export type SocketRefCurrent = React.MutableRefObject<Socket | null>;

export function useBets({
  sound,
}: { sound?: { playSound?: (name: string) => void } } = {}) {
  const [bets, setBets] = useState<Record<string, number>>({});
  const [betsDisplay, setBetsDisplay] = useState<Record<string, number>>({});
  const betsRef = useRef<Record<string, number>>(bets);
  const betsDisplayRef = useRef<Record<string, number>>(betsDisplay);
  const lastBetRef = useRef<Record<string, number>>({});

  const setBetsAndRef = (next: Record<string, number>) => {
    betsRef.current = next;
    setBets(next);
    console.log("🟢 [setBetsAndRef] updated betsRef:", next);
  };
  const setBetsDisplayAndRef = (next: Record<string, number>) => {
    betsDisplayRef.current = next;
    setBetsDisplay(next);
    console.log("🟢 [setBetsDisplayAndRef] updated betsDisplayRef:", next);
  };

  function placeBet(
    socketRef: SocketRefCurrent,
    displayKey: string,
    amount: number,
    roomId?: string
  ) {
    const socket = socketRef.current;
    if (!socket) {
      console.warn("🚫 placeBet: socket not initialized");
      return;
    }

    let payload: BetPayload;
    try {
      // Normalizamos la clave aquí
      payload = buildBetPayload(displayKey, amount, roomId);
    } catch (err) {
      console.error("❌ placeBet: buildBetPayload failed:", err);
      return;
    }

    // ⭐ PASO DE VALIDACIÓN: Usamos la clave normalizada
    const proposedBets = { ...betsRef.current };
    proposedBets[payload.betKey] = (proposedBets[payload.betKey] || 0) + amount;

    console.log(
      `🔍 [Validación] Evaluando nueva apuesta: "${displayKey}" | Clave normalizada: "${payload.betKey}"`
    );
    console.log("📋 [Estado Actual] Apuestas existentes:", betsRef.current);
    console.log("🔮 [Estado Propuesto] Apuestas para validar:", proposedBets);

    if (!isBetAllowed(payload.betKey, proposedBets)) {
      console.warn(
        `🚫 [Validación] Apuesta no permitida: "${displayKey}". Conflicto detectado.`
      );
      try {
        sound?.playSound?.("error");
      } catch {
        /* noop */
      }
      return;
    }

    setBetsAndRef(proposedBets);

    const nextDisplay = { ...betsDisplayRef.current };
    nextDisplay[displayKey] = (nextDisplay[displayKey] || 0) + amount;
    setBetsDisplayAndRef(nextDisplay);

    lastBetRef.current = { ...nextDisplay };
    console.log("💾 [placeBet] lastBetRef updated:", lastBetRef.current);

    socket.emit(
      "place-bet",
      payload,
      (ack: { success: boolean; message?: string }) => {
        console.log("⬅️ place-bet ack:", ack);
      }
    );

    try {
      sound?.playSound?.("chip");
    } catch {
      /* noop */
    }
  }

  function clearBets(socketRef: SocketRefCurrent, roomId?: string) {
    const socket = socketRef.current;
    console.log("🧹 [clearBets] clearing bets for room:", roomId);
    if (socket) {
      socket.emit(
        "clear-bets",
        { roomId },
        (ack: { success: boolean; message?: string }) => {
          console.log("⬅️ clear-bets ack:", ack);
        }
      );
    }
    setBetsAndRef({});
    setBetsDisplayAndRef({});
    try {
      sound?.playSound?.("button");
    } catch {
      /* empty */
    }
  }

  function undoBet(socketRef: SocketRefCurrent, roomId?: string) {
    const socket = socketRef.current;
    const displayEntries = Object.entries(betsDisplayRef.current);
    if (displayEntries.length === 0) return;

    const [lastDisplayKey, lastAmount] =
      displayEntries[displayEntries.length - 1];
    console.log("↩️ [undoBet] undoing last bet:", lastDisplayKey, lastAmount);

    // ⭐ Usamos normalizeBetKey para encontrar la clave correcta en betsRef
    const normalizedKey = normalizeBetKey(lastDisplayKey);

    const nextDisplay: Record<string, number> = { ...betsDisplayRef.current };
    nextDisplay[lastDisplayKey] =
      (nextDisplay[lastDisplayKey] || 0) - lastAmount;
    if (nextDisplay[lastDisplayKey] <= 0) delete nextDisplay[lastDisplayKey];
    setBetsDisplayAndRef(nextDisplay);

    if (normalizedKey && betsRef.current[normalizedKey]) {
      const nextNormalized: Record<string, number> = { ...betsRef.current };
      nextNormalized[normalizedKey] =
        (nextNormalized[normalizedKey] || 0) - lastAmount;
      if (nextNormalized[normalizedKey] <= 0)
        delete nextNormalized[normalizedKey];
      setBetsAndRef(nextNormalized);
    }

    if (socket) {
      socket.emit(
        "undo-bet",
        { roomId, betKey: normalizedKey ?? lastDisplayKey },
        (ack: { success: boolean; message?: string }) => {
          console.log("⬅️ undo-bet ack:", ack);
        }
      );
    }
    try {
      sound?.playSound?.("button");
    } catch {
      /* empty */
    }
  }

  function repeatBet(socketRef: SocketRefCurrent, roomId?: string) {
    if (!lastBetRef.current || Object.keys(lastBetRef.current).length === 0)
      return;

    const lastDisplay = lastBetRef.current;
    console.log("🔁 [repeatBet] repeating bets:", lastDisplay);

    const normalizedBets: Record<string, number> = {};
    for (const displayKey in lastDisplay) {
      const amount = lastDisplay[displayKey];
      try {
        const payload = buildBetPayload(displayKey, amount, roomId);
        normalizedBets[payload.betKey] =
          (normalizedBets[payload.betKey] || 0) + amount;
      } catch (err) {
        console.warn("⚠️ repeatBet: normalize failed for", displayKey, err);
      }
    }

    setBetsAndRef(normalizedBets);
    setBetsDisplayAndRef({ ...lastDisplay });
    const socket = socketRef.current;
    if (socket) {
      socket.emit(
        "repeat-bet",
        { roomId, bets: normalizedBets },
        (ack: { success: boolean; message?: string }) => {
          console.log("⬅️ repeat-bet ack:", ack);
        }
      );
    }
    try {
      sound?.playSound?.("button");
    } catch {
      /* empty */
    }
  }

  function doubleBet(socketRef: SocketRefCurrent, roomId?: string) {
    if (Object.keys(betsDisplayRef.current).length === 0) return;

    const doubledDisplay: Record<string, number> = {};
    const doubledNormalized: Record<string, number> = {};

    // First, calculate the new doubled bet objects
    Object.keys(betsDisplayRef.current).forEach((k) => {
      doubledDisplay[k] = (betsDisplayRef.current[k] || 0) * 2;
    });

    Object.keys(betsRef.current).forEach((k) => {
      doubledNormalized[k] = (betsRef.current[k] || 0) * 2;
    });

    // ⭐ Validation Check for Doubled Bets ⭐
    // Loop through the doubled bets and check for conflicts
    for (const betKey of Object.keys(doubledNormalized)) {
      if (!isBetAllowed(betKey, doubledNormalized)) {
        console.warn(
          `🚫 [Validación] No se puede duplicar la apuesta. La nueva combinación no es válida.`
        );
        try {
          sound?.playSound?.("error");
        } catch {
          /* noop */
        }
        return; // Exit the function if any conflict is found
      }
    }

    console.log(
      "2️⃣ [doubleBet] doubledDisplay:",
      doubledDisplay,
      "doubledNormalized:",
      doubledNormalized
    );

    setBetsAndRef(doubledNormalized);
    setBetsDisplayAndRef(doubledDisplay);
    const socket = socketRef.current;
    if (socket) {
      socket.emit(
        "double-bet",
        { roomId, bets: doubledNormalized },
        (ack: { success: boolean; message?: string }) => {
          console.log("⬅️ double-bet ack:", ack);
        }
      );
    }
    try {
      sound?.playSound?.("button");
    } catch {
      /* empty */
    }
  }

  return {
    bets,
    betsRef,
    betsDisplay,
    betsDisplayRef,
    setBetsDisplayAndRef,
    lastBetRef,
    placeBet,
    clearBets,
    undoBet,
    repeatBet,
    doubleBet,
  } as const;
}
