import type { Socket } from "socket.io-client";

// Core Game Types
// --------------------
export interface BetNumber {
  number: number;
  color: "r" | "b" | "g";
}

export interface Bet {
  betKey: string;
  amount: number;
}

export interface SpinResult {
  number: number;
  color: string;
}

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
type StraightBetKey = `${
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36}`;
type ColumnBetKey = `column_${1 | 2 | 3}`;
type DozenBetKey = `dozen_${1 | 2 | 3}`;
type EvenMoneyBetKey = `even_money_${
  | "red"
  | "black"
  | "even"
  | "odd"
  | "low"
  | "high"}`;
type SplitBetKey = `split_${number}_${number}`;
type StreetBetKey =
  | "street_3_1"
  | "street_6_4"
  | "street_9_7"
  | "street_12_10"
  | "street_15_13"
  | "street_18_16"
  | "street_21_19"
  | "street_24_22"
  | "street_27_25"
  | "street_30_28"
  | "street_33_31"
  | "street_36_34";

// ✅ NUEVO TIPO: Claves de apuesta usadas en el frontend para el sombreado.
type FrontendBetKey =
  | "1-18"
  | "19-36"
  | "ROJO"
  | "NEGRO"
  | "PAR"
  | "IMPAR"
  | "1os 12"
  | "2os 12"
  | "3os 12"
  | "2:1-1"
  | "2:1-2"
  | "2:1-3";

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

// ✅ Unimos las claves de backend y frontend en un solo tipo
export type BetKey =
  | StraightBetKey
  | ColumnBetKey
  | DozenBetKey
  | EvenMoneyBetKey
  | SplitBetKey
  | StreetBetKey
  | FrontendBetKey;

// ✅ El objeto RouletteBet ahora incluye todas las claves posibles.
export type RouletteBet = Partial<Record<BetKey, number>>;

export type RoulettePlaceBet = (betKey: BetKey) => void;

export interface RouletteNumberCellProps {
  label: string;
  betKey: BetKey;
  totalBet: number;
  bets: RouletteBet;
  onClick: RoulettePlaceBet;
}
