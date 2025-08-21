// src/lib/utils/betUtils.ts
/**
 * Utility para normalizar claves de apuesta (UI -> servidor)
 *
 * Regresa claves en formatos que tu backend debe reconocer:
 *  - straight_<num>
 *  - split_<a>_<b>
 *  - trio_<a>_<b>_<c>
 *  - street_<start>
 *  - corner_<a>_<b>_<c>_<d>
 *  - line_<start>_<end>
 *  - column_<1|2|3>
 *  - dozen_<1|2|3>
 *  - even_money_<red|black|even|odd|low|high>
 *
 * Nota: idealmente la UI debería enviar un objeto semántico en vez de strings,
 * pero esto ayuda a normalizar inputs de texto / etiquetas.
 */

export type BetPayload = {
  betKey: string; // clave normalizada para enviar al servidor
  amount: number;
  roomId?: string;
};

const whitespace = (s: string) => s.trim().replace(/\s+/g, " ");

export function normalizeBetKey(displayKey: string): string {
  if (!displayKey || displayKey.trim() === "")
    throw new Error("displayKey vacío");

  const raw = String(displayKey).trim();
  const k = raw.toLowerCase().replace(/\s+/g, " ");

  // Straight (solo un número)
  const onlyNum = k.match(/^(\d{1,2})$/);
  if (onlyNum) {
    return `straight_${onlyNum[1]}`;
  }

  // Dash splits like "17-18" or "17/18"
  const dash = k.match(/^(\d{1,2})\s*[-/]\s*(\d{1,2})$/);
  if (dash) {
    const a = Number(dash[1]);
    const b = Number(dash[2]);
    // mejor mantener orden ascendente
    return `split_${Math.min(a, b)}_${Math.max(a, b)}`;
  }

  // Explicit patterns already normalized (pass-through)
  if (
    /^(straight|split|trio|street|corner|line|column|dozen|even_money)_/.test(k)
  ) {
    return k.replace(/\s+/g, "_");
  }

  // Even money bets / colors / parity / ranges
  if (k.includes("negro") || k === "black") return "even_money_black";
  if (k.includes("rojo") || k === "red") return "even_money_red";
  if (k.includes("par") || k === "even") return "even_money_even";
  if (k.includes("impar") || k === "odd") return "even_money_odd";
  if (k.includes("alto") || k.includes("high")) return "even_money_high";
  if (k.includes("bajo") || k.includes("low")) return "even_money_low";

  // Docena: ejemplos: "2os 12", "2da docena", "segunda docena", "docena 3"
  if (k.includes("docen") || /\b12\b/.test(k) || /\bdozen\b/.test(k)) {
    // try to detect 1/2/3
    if (/\b(1|prim|1ra|primera|first)\b/.test(k)) return "dozen_1";
    if (/\b(2|seg|2da|segunda|second|2os)\b/.test(k)) return "dozen_2";
    return "dozen_3";
  }

  // Columnas: "col1", "columna 2", "col 3"
  if (k.includes("col") || k.includes("columna")) {
    const m = k.match(/(1|2|3)/);
    if (m) return `column_${m[1]}`;
    return "column_1";
  }

  // Streets, corners, lines — heurístico si se pasan listas "17,18,19" o "17 18 19"
  const numsList = k.match(
    /^(\d{1,2})(?:[,\s]+(\d{1,2}))(?:[,\s]+(\d{1,2}))(?:[,\s]+(\d{1,2}))?$/
  );
  if (numsList) {
    const nums = numsList.slice(1).filter(Boolean).map(Number);
    if (nums.length === 3) {
      // street
      return `street_${Math.min(...nums)}`;
    } else if (nums.length === 4) {
      // corner
      return `corner_${nums.join("_")}`;
    }
  }

  // Fallback: devuelve la cadena "tal cual" (útil para debugging)
  return whitespace(raw).replace(/\s+/g, "_");
}

/**
 * Construye el payload listo para emitir al socket.
 */
export function buildBetPayload(
  displayKey: string,
  amount: number,
  roomId?: string
): BetPayload {
  return {
    betKey: normalizeBetKey(displayKey),
    amount,
    roomId,
  };
}

/**
 * Convierte una clave normalizada a una etiqueta amigable para mostrar.
 * (útil si quieres mantener display labels en UI mientras el estado usa claves)
 */
export function labelFromKey(normalizedKey: string): string {
  if (!normalizedKey) return String(normalizedKey);
  if (normalizedKey.startsWith("straight_")) {
    return normalizedKey.replace("straight_", "");
  }
  if (normalizedKey.startsWith("even_money_")) {
    const v = normalizedKey.replace("even_money_", "");
    if (v === "red") return "Rojo";
    if (v === "black") return "Negro";
    if (v === "even") return "Par";
    if (v === "odd") return "Impar";
    if (v === "low") return "Bajo";
    if (v === "high") return "Alto";
    return v;
  }
  if (normalizedKey.startsWith("dozen_")) {
    const part = normalizedKey.split("_")[1];
    return `Docena ${part}`;
  }
  if (normalizedKey.startsWith("column_")) {
    const part = normalizedKey.split("_")[1];
    return `Columna ${part}`;
  }
  // Splits/trios/corner: devolver algo legible
  if (normalizedKey.startsWith("split_")) {
    return normalizedKey.replace("split_", "Split ");
  }
  if (normalizedKey.startsWith("corner_")) {
    return normalizedKey.replace(/_/g, " ").replace("corner", "Corner");
  }
  return normalizedKey;
}
