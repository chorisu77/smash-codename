export enum Team {
  RED = 'RED',
  BLUE = 'BLUE',
}

export enum CardType {
  RED_AGENT = 'RED_AGENT',
  BLUE_AGENT = 'BLUE_AGENT',
  NEUTRAL = 'NEUTRAL',
  ASSASSIN = 'ASSASSIN',
}

export interface CardData {
  id: string; // fighter name
  word: string; // fighter name
  type: CardType;
  revealed: boolean;
  revealedBy?: Team | null; // Team that revealed this card
}

export interface Clue {
  word: string;
  count: number;
}

export enum GamePhase {
  PLAYER_SETUP = 'PLAYER_SETUP',
  BOARD_INITIALIZATION = 'BOARD_INITIALIZATION',
  RED_SPYMASTER_CLUE = 'RED_SPYMASTER_CLUE',
  RED_OPERATIVE_GUESS = 'RED_OPERATIVE_GUESS',
  BLUE_SPYMASTER_CLUE = 'BLUE_SPYMASTER_CLUE',
  BLUE_OPERATIVE_GUESS = 'BLUE_OPERATIVE_GUESS',
  GAME_OVER = 'GAME_OVER',
}

export interface Player {
  id: string;
  name: string;
  team: Team | null;
  isSpymaster: boolean;
}

export enum LogEntryType {
  GAME_START = 'GAME_START',
  CLUE_GIVEN = 'CLUE_GIVEN',
  CORRECT_GUESS = 'CORRECT_GUESS',
  OPPONENT_GUESS = 'OPPONENT_GUESS', // Guessed opponent's card
  NEUTRAL_GUESS = 'NEUTRAL_GUESS',
  ASSASSIN_GUESS = 'ASSASSIN_GUESS',
  TURN_ENDED_MANUALLY = 'TURN_ENDED_MANUALLY',
  TURN_ENDED_AUTOMATICALLY = 'TURN_ENDED_AUTOMATICALLY', // After wrong guess, or max guesses
  GAME_OVER_AGENTS = 'GAME_OVER_AGENTS',
  GAME_OVER_ASSASSIN = 'GAME_OVER_ASSASSIN',
}

export interface LogEntry {
  id: string;
  type: LogEntryType;
  team?: Team; // Team that performed the action or is relevant
  playerName?: string; // Specific player if relevant (e.g., spymaster giving clue)
  clueWord?: string;
  clueCount?: number;
  guessedCardWord?: string;
  guessedCardType?: CardType; // Actual type of the guessed card
  message?: string; // Optional custom message, or for GAME_START, GAME_OVER
  timestamp: number; // Use Date.now()
}
