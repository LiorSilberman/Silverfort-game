export type Shape = 'triangle' | 'square' | 'diamond' | 'circle';
export type Color = 'red' | 'green' | 'blue' | 'yellow';

export interface Cell {
  row: number;
  col: number;
  shape: Shape;
  color: Color;
  lastClickedTurn?: number;
}

export interface GameState {
  board: Cell[][];
  score: number;
  turn: number;
  gameOver: boolean;
}

export interface ClickCellData {
  row: number;
  col: number;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  timestamp: number;
}

export interface SubmitScoreData {
  nickname: string;
  score: number;
  sessionId?: string;
}

export interface GameSession {
  sessionId: string;
  players: LeaderboardEntry[];
  gameOverAt: number;
  totalScore: number;
}