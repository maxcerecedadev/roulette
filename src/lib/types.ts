// src/lib/types.ts

import type { Socket } from "socket.io-client";

// Core Game Types
// --------------------
/**
 * Represents a number and its color in the roulette wheel.
 */
export interface BetNumber {
  number: number;
  color: "r" | "b" | "g";
}

/**
 * A single bet item.
 */
export interface Bet {
  betKey: string;
  amount: number;
}

/**
 * Represents the result of a spin.
 */
export interface SpinResult {
  number: number;
  color: string;
}

/**
 * Represents a historical winning number.
 */
export interface HistoryItem {
  number: number;
  color: "green" | "red" | "black";
}

// Player and Game Types
// --------------------
export interface Player {
  id?: string;
  name: string;
  balance: number;
}

export type GameMode = "single" | "tournament";

// Component Props and Types
// --------------------
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
  resultStatus: "win" | "lose" | "no_bet" | null;
  winningAmount: number | null;
  playerTotalBet?: number;
  onSpinEnd?: () => void;
}

export interface LeaveGameDialogProps {
  onLeave: () => void;
}

export interface BetHistoryItem {
  key: string;
  amount: number;
}

export interface WinningHistoryProps {
  winningNumberHistory: HistoryItem[];
}

export interface WinningNumberHistoryItem {
  number: number;
  color: "green" | "red" | "black";
}

// API Response Types
// --------------------
export interface SpinResponse {
  result?: SpinResult;
  error?: string;
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

// Roulette Logic Types
// --------------------
export type BetKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31"
  | "32"
  | "33"
  | "34"
  | "35"
  | "36"
  | "2:1-1"
  | "2:1-2"
  | "2:1-3"
  | "1os 12"
  | "2os 12"
  | "3os 12"
  | "1-18"
  | "PAR"
  | "ROJO"
  | "NEGRO"
  | "IMPAR"
  | "19-36";

export interface RouletteBet {
  [key: string]: number;
}

export type RoulettePlaceBet = (betKey: BetKey) => void;

export interface RouletteTableProps {
  bets: RouletteBet;
  handlePlaceBet: RoulettePlaceBet;
}

// Miscellaneous Types
// --------------------
export interface ChipButtonMethods {
  setActive: () => void;
  setInactive: () => void;
}

export type ChipButtonType = ChipButtonProps & ChipButtonMethods;

export interface RouletteBetButtonMethods {
  addBet: (amount: number) => void;
  clearBet: () => void;
  getTotalBetAmount: () => number;
  getHistoryData: () => BetHistoryItem;
}

export type RouletteBetButtonType = RouletteBetButtonProps &
  RouletteBetButtonMethods;

export interface MusicPlayerProps {
  files: string[];
  initialVolume?: number;
  repeat?: boolean;
  playing?: boolean;
}

export interface MusicPlayerMethods {
  play: () => void;
  pause: () => void;
}

export type MusicPlayerType = MusicPlayerProps & MusicPlayerMethods;

export interface WheelMethods {
  spin: (winningNumber: number, winningColor: string) => void;
}

export type WheelType = WheelProps & WheelMethods;

export interface RouletteOptions {
  chipButtons?: ChipButtonType[];
}

export declare class Roulette {
  constructor(
    container: HTMLElement,
    musicPlayer: MusicPlayerType,
    options?: RouletteOptions
  );
  balance: number;
  defaultBalance: number;
  betAmount: number;
  baseTableButtons: RouletteBetButtonType[][];
  twoToOneButtons: RouletteBetButtonType[];
  columnButtons: RouletteBetButtonType[];
  bottomRowButtons: RouletteBetButtonType[];
  zeroButton: RouletteBetButtonType;
  chipButtons: ChipButtonType[];
  wheel: WheelType;
  musicPlayer: MusicPlayerType;
  socket: typeof Socket | null;
  roomId: string | null;
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
  restart(): void;
  clearLocalBets(): void;
  doubleAmounts(): void;
  getTotalBetOfBetButtons(betButtons: RouletteBetButtonType[]): number;
  setBetAmount(amount: number): void;
  getBetNumber(num: number): BetNumber;
  getButtonsWithBets(): RouletteBetButtonType[];
  renderWinningNumbers(): void;
  getAllBetNumbers(): BetNumber[];
}

export interface RouletteGameProps {
  mode: GameMode;
  player?: Player;
}

export interface SingleJoinResponse {
  roomId?: string;
  error?: string;
}
