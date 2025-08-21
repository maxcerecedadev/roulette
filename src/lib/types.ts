// src/lib/types.ts

import type { Socket } from "socket.io-client";

// BetNumber
// --------------------
/**
 * Representa un número y su color en la ruleta.
 */
export interface BetNumber {
  number: number;
  color: "r" | "b" | "g";
}

// --------------------
// BetHistoryItem
// --------------------
/**
 * Representa un historial de apuestas con los números y la cantidad apostada.
 */

// --------------------
// ChipButton
// --------------------
/**
 * Propiedades de un componente de botón para fichas de apuesta.
 */

/**
 * Métodos disponibles para un componente de botón de ficha.
 */
export interface ChipButtonMethods {
  setActive: () => void;
  setInactive: () => void;
}

/**
 * Tipo completo para un botón de ficha, combinando propiedades y métodos.
 */
export type ChipButtonType = ChipButtonProps & ChipButtonMethods;

/**
 * Métodos disponibles para un botón de apuesta en la ruleta.
 */
export interface RouletteBetButtonMethods {
  addBet: (amount: number) => void;
  clearBet: () => void;
  getTotalBetAmount: () => number;
  // El tipo de retorno de `getHistoryData` debería ser `BetHistoryItem`.
  getHistoryData: () => BetHistoryItem;
}

/**
 * Tipo completo para un botón de apuesta en la ruleta.
 */
export type RouletteBetButtonType = RouletteBetButtonProps &
  RouletteBetButtonMethods;

// --------------------
// MusicPlayer
// --------------------
/**
 * Propiedades y métodos para un reproductor de música.
 */
export interface MusicPlayerProps {
  files: string[];
  initialVolume?: number;
  repeat?: boolean;
  playing?: boolean;
  // `play` y `pause` no deben estar aquí, son métodos de una clase o componente, no propiedades.
  // play: () => void;
  // pause: () => void;
}

/**
 * Métodos para un reproductor de música.
 */
export interface MusicPlayerMethods {
  play: () => void;
  pause: () => void;
}

/**
 * Tipo completo para el reproductor de música.
 */
export type MusicPlayerType = MusicPlayerProps & MusicPlayerMethods;

// --------------------
// Wheel
// --------------------
/**
 * Propiedades y métodos para el componente de la rueda de la ruleta.
 */

export interface WheelMethods {
  spin: (winningNumber: number, winningColor: string) => void;
}

/**
 * Tipo completo para la rueda de la ruleta.
 */
export type WheelType = WheelProps & WheelMethods;

// --------------------
// Roulette options
// --------------------
/**
 * Opciones de configuración para la clase `Roulette`.
 */
export interface RouletteOptions {
  // El tipo de `chipButtons` debe ser un array de `ChipButtonType`.
  chipButtons?: ChipButtonType[];
}

// --------------------
// Roulette main class
// --------------------
/**
 * Clase principal para gestionar el juego de la ruleta.
 */
export declare class Roulette {
  constructor(
    container: HTMLElement,
    musicPlayer: MusicPlayerType,
    options?: RouletteOptions
  );

  // Propiedades
  balance: number;
  defaultBalance: number;
  betAmount: number;

  baseTableButtons: RouletteBetButtonType[][];
  twoToOneButtons: RouletteBetButtonType[];
  columnButtons: RouletteBetButtonType[];
  bottomRowButtons: RouletteBetButtonType[];
  zeroButton: RouletteBetButtonType;
  chipButtons: ChipButtonType[];

  // El tipo de `wheel` y `musicPlayer` debe ser el tipo completo (`WheelType` y `MusicPlayerType`).
  wheel: WheelType;
  musicPlayer: MusicPlayerType;

  socket: typeof Socket | null;
  roomId: string | null;

  // Métodos principales
  setSocket(socket: typeof Socket, roomId: string): void;
  spin(): void;
  setDefaultBalance(balance: number): void;
  setBalance(balance: number): void;
  renderBalance(): void;
  renderBetTotal(): void;
  getTotalBet(): number;
  getAllBetButtons(): RouletteBetButtonType[];
  clearBets(): void;
  disconnectSocket(): void;
  makeAllChipButtonsInactive(): void;

  // Métodos adicionales
  restart(): void;
  clearLocalBets(): void;
  doubleAmounts(): void;
  // Parámetro `betButtons` debería ser de tipo `RouletteBetButtonType[]`.
  getTotalBetOfBetButtons(betButtons: RouletteBetButtonType[]): number;
  setBetAmount(amount: number): void;
  getBetNumber(num: number): BetNumber;
  getButtonsWithBets(): RouletteBetButtonType[];
  renderWinningNumbers(): void;
  getAllBetNumbers(): BetNumber[];
}

// --------------------
// RouletteGame props
// --------------------
/**
 * Propiedades para inicializar un juego de ruleta.
 */

// --------------------
// Single join response
// --------------------
/**
 * Respuesta de unión a una sala.
 */
export interface SingleJoinResponse {
  roomId?: string;
  error?: string;
}

export interface Player {
  id?: string;
  name: string;
  score: number;
}

export interface RouletteGameProps {
  mode: GameMode;
  player?: Player;
}

export type GameMode = "single" | "tournament";

export interface MenuProps {
  onSelectMode: (mode: GameMode) => void;
  onLogin: (player: Player) => void;
}

export interface RouletteProps {
  mode: GameMode;
  player?: Player;
  onLeave: () => void;
}

export interface BetButtonProps {
  number: BetNumber;
  betAmount: number;
  onPlaceBet: () => void;
  colorClass: string;
}

export interface ButtonProps {
  imageURL: string;
  size?: number;
  label?: string;
  onClick: () => void;
  isDisabled?: boolean;
}

export interface ChipButtonProps {
  amount: number;
  imageURL: string;
  onClick: (amount: number) => void;
  isSelected: boolean;
  isDisabled: boolean;
}

export interface LoadingScreenProps {
  logoUrl: string;
  loadedAmount: number;
  onLoaded: () => void;
}

export interface RouletteBetButtonProps {
  label: string;
  totalBet: number;
  onClick: () => void;
  isDisabled?: boolean;
  className?: string;
}

export interface WheelProps {
  winningNumber: number | null;
  isSpinning: boolean;
  onSpinEnd?: () => void;
  winningAmount?: number;
}

export interface LeaveGameDialogProps {
  onLeave: () => void;
}

export interface BetHistoryItem {
  key: string;
  amount: number;
}

export interface SpinResult {
  number: number;
  color: string;
}

export interface SpinResponse {
  result?: SpinResult;
  error?: string;
}

export interface HistoryItem {
  number: number;
  color: "green" | "red" | "black";
}

export interface WinningHistoryProps {
  winningNumberHistory: HistoryItem[];
}

export interface WinningNumberHistoryItem {
  number: number;
  color: "green" | "red" | "black";
}

export interface RouletteTableProps {
  bets: Bets;
  handlePlaceBet: (bet: string) => void;
  isDisabled: boolean;
}

export interface Bets {
  [key: string]: number;
}

export interface Bet {
  betKey: string;
  amount: number;
}

export interface JoinRoomResponse {
  message: string;
  roomId: string;
  user?: {
    id: string;
    name: string;
    balance: number;
  };
  error?: string;
}
