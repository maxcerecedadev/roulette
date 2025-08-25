// src/lib/rouletteRules.ts

export type BetKey = string;

// Las reglas deben ser exactamente las mismas que en el back-end
const CONFLICTING_BETS: BetKey[][] = [
  ["even_money_red", "even_money_black"],
  ["even_money_even", "even_money_odd"],
  ["even_money_low", "even_money_high"],
];

const COLUMN_BET_KEYS: BetKey[] = ["2:1-1", "2:1-2", "2:1-3"];
const DOZEN_BET_KEYS: BetKey[] = ["dozen_1", "dozen_2", "dozen_3"];

/**
 * Valida si una nueva apuesta es permitida con las apuestas existentes.
 * @param {BetKey} newBetKey La clave de la nueva apuesta.
 * @param {Record<BetKey, number>} existingBets Las apuestas actuales del jugador.
 * @returns {boolean} `true` si la apuesta es válida, `false` si hay un conflicto.
 */
export const isBetAllowed = (
  newBetKey: BetKey,
  existingBets: Record<BetKey, number>
): boolean => {
  // 1. Validar conflictos de apuestas excluyentes (rojo/negro, par/impar, alto/bajo).
  for (const pair of CONFLICTING_BETS) {
    if (pair.includes(newBetKey)) {
      const conflictingBet = pair.find((key) => key !== newBetKey);
      if (
        conflictingBet &&
        Object.prototype.hasOwnProperty.call(existingBets, conflictingBet)
      ) {
        return false;
      }
    }
  }

  // 2. Validar conflictos entre apuestas de docena y de columna.
  const isNewBetColumn = COLUMN_BET_KEYS.includes(newBetKey);
  const isNewBetDozen = DOZEN_BET_KEYS.includes(newBetKey);
  const hasExistingColumnBet = COLUMN_BET_KEYS.some(
    (key) => key in existingBets
  );
  const hasExistingDozenBet = DOZEN_BET_KEYS.some((key) => key in existingBets);

  if (
    (isNewBetColumn && hasExistingDozenBet) ||
    (isNewBetDozen && hasExistingColumnBet)
  ) {
    return false;
  }

  // Si no hay conflictos, la apuesta es permitida.
  return true;
};

export const getBackendKeyFromDisplayKey = (displayKey: string): string => {
  const mapping: { [key: string]: string } = {
    // Apuestas numéricas directas (ya son iguales)
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    "11": "11",
    "12": "12",
    "13": "13",
    "14": "14",
    "15": "15",
    "16": "16",
    "17": "17",
    "18": "18",
    "19": "19",
    "20": "20",
    "21": "21",
    "22": "22",
    "23": "23",
    "24": "24",
    "25": "25",
    "26": "26",
    "27": "27",
    "28": "28",
    "29": "29",
    "30": "30",
    "31": "31",
    "32": "32",
    "33": "33",
    "34": "34",
    "35": "35",
    "36": "36",
    // Apuestas de docena
    "1_12": "dozen_1",
    "13_24": "dozen_2",
    "25_36": "dozen_3",
    // Apuestas de columna
    col1: "2:1-1",
    col2: "2:1-2",
    col3: "2:1-3",
    // Apuestas de dinero par
    rojo: "even_money_red",
    negro: "even_money_black",
    par: "even_money_even",
    impar: "even_money_odd",
    "1_18": "even_money_low",
    "19_36": "even_money_high",
  };
  return mapping[displayKey] || displayKey;
};
