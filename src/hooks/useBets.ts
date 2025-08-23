// src/hooks/useBets.ts
import { useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { buildBetPayload, type BetPayload } from "@/lib/utils/betUtils";

export type SocketRefCurrent = React.MutableRefObject<Socket | null>;

export function useBets({
  sound,
}: { sound?: { playSound?: (name: string) => void } } = {}) {
  const [bets, setBets] = useState<Record<string, number>>({}); // normalized keys for server
  const [betsDisplay, setBetsDisplay] = useState<Record<string, number>>({}); // UI keys
  const betsRef = useRef<Record<string, number>>(bets);
  const betsDisplayRef = useRef<Record<string, number>>(betsDisplay);
  const lastBetRef = useRef<Record<string, number>>({});

  // helpers that sync refs
  const setBetsAndRef = (next: Record<string, number>) => {
    betsRef.current = next;
    setBets(next);
    console.log("[setBetsAndRef] updated betsRef:", next);
  };
  const setBetsDisplayAndRef = (next: Record<string, number>) => {
    betsDisplayRef.current = next;
    setBetsDisplay(next);
    console.log("[setBetsDisplayAndRef] updated betsDisplayRef:", next);
  };

  // placeBet: emits to server and updates local normalized/display maps
  async function placeBet(
    socketRef: SocketRefCurrent,
    displayKey: string,
    amount: number,
    roomId?: string
  ) {
    const socket = socketRef.current;
    if (!socket) {
      console.warn("placeBet: socket not initialized");
      return;
    }

    let payload: BetPayload;
    try {
      payload = buildBetPayload(displayKey, amount, roomId);
      console.log(
        "[placeBet] displayKey:",
        displayKey,
        "amount:",
        amount,
        "payload:",
        payload
      );
    } catch (err) {
      console.error("placeBet: buildBetPayload failed:", err);
      return;
    }

    socket.emit(
      "place-bet",
      payload,
      (ack: { success: boolean; message?: string }) => {
        console.log("⬅️ place-bet ack:", ack);
      }
    );

    // update normalized bets
    const nextNormalized = { ...betsRef.current };
    nextNormalized[payload.betKey] =
      (nextNormalized[payload.betKey] || 0) + amount;
    setBetsAndRef(nextNormalized);

    // update display bets
    const nextDisplay = { ...betsDisplayRef.current };
    nextDisplay[displayKey] = (nextDisplay[displayKey] || 0) + amount;
    setBetsDisplayAndRef(nextDisplay);

    // save for repeat
    lastBetRef.current = { ...nextDisplay };
    console.log("[placeBet] lastBetRef updated:", lastBetRef.current);

    // feedback
    try {
      sound?.playSound?.("chip");
    } catch {
      /* noop */
    }
  }

  function clearBets(socketRef: SocketRefCurrent, roomId?: string) {
    const socket = socketRef.current;
    console.log("[clearBets] clearing bets for room:", roomId);
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
    console.log("[undoBet] undoing last bet:", lastDisplayKey, lastAmount);

    let normalizedKey: string | null = null;
    try {
      normalizedKey = buildBetPayload(lastDisplayKey, 1).betKey;
    } catch {
      normalizedKey = null;
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

    const nextDisplay: Record<string, number> = { ...betsDisplayRef.current };
    nextDisplay[lastDisplayKey] =
      (nextDisplay[lastDisplayKey] || 0) - lastAmount;
    if (nextDisplay[lastDisplayKey] <= 0) delete nextDisplay[lastDisplayKey];
    setBetsDisplayAndRef(nextDisplay);

    if (normalizedKey) {
      const nextNormalized: Record<string, number> = { ...betsRef.current };
      nextNormalized[normalizedKey] =
        (nextNormalized[normalizedKey] || 0) - lastAmount;
      if (nextNormalized[normalizedKey] <= 0)
        delete nextNormalized[normalizedKey];
      setBetsAndRef(nextNormalized);
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
    console.log("[repeatBet] repeating bets:", lastDisplay);

    const normalizedMap: Record<string, number> = {};
    for (const displayKey in lastDisplay) {
      const amount = lastDisplay[displayKey];
      try {
        const payload = buildBetPayload(displayKey, amount, roomId);
        normalizedMap[payload.betKey] =
          (normalizedMap[payload.betKey] || 0) + amount;
      } catch (err) {
        console.warn("repeatBet: normalize failed for", displayKey, err);
      }
    }

    const socket = socketRef.current;
    if (socket) {
      socket.emit(
        "repeat-bet",
        { roomId, bets: normalizedMap },
        (ack: { success: boolean; message?: string }) => {
          console.log("⬅️ repeat-bet ack:", ack);
        }
      );
    }

    setBetsAndRef({ ...normalizedMap });
    setBetsDisplayAndRef({ ...lastDisplay });
    try {
      sound?.playSound?.("button");
    } catch {
      /* empty */
    }
  }

  function doubleBet(socketRef: SocketRefCurrent, roomId?: string) {
    const doubledDisplay: Record<string, number> = {};
    Object.keys(betsDisplayRef.current).forEach((k) => {
      doubledDisplay[k] = (betsDisplayRef.current[k] || 0) * 2;
    });
    const doubledNormalized: Record<string, number> = {};
    Object.keys(betsRef.current).forEach((k) => {
      doubledNormalized[k] = (betsRef.current[k] || 0) * 2;
    });

    console.log(
      "[doubleBet] doubledDisplay:",
      doubledDisplay,
      "doubledNormalized:",
      doubledNormalized
    );

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

    setBetsAndRef(doubledNormalized);
    setBetsDisplayAndRef(doubledDisplay);
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
