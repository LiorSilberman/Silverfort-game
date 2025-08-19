import fs from 'fs/promises';
import path from 'path';
import { LeaderboardEntry, GameSession } from './types.js';

const LEADERBOARD_FILE = path.join(process.cwd(), 'leaderboard.json');
const SESSIONS_FILE = path.join(process.cwd(), 'sessions.json');
const MAX_ENTRIES = 10;

export class Leaderboard {
  private entries: LeaderboardEntry[] = [];
  private sessions: GameSession[] = [];
  private currentSessionId: string | null = null;

  constructor() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [leaderboardData, sessionsData] = await Promise.all([
        fs.readFile(LEADERBOARD_FILE, 'utf-8').catch(() => '[]'),
        fs.readFile(SESSIONS_FILE, 'utf-8').catch(() => '[]')
      ]);
      
      this.entries = JSON.parse(leaderboardData);
      this.sessions = JSON.parse(sessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      this.entries = [];
      this.sessions = [];
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        fs.writeFile(LEADERBOARD_FILE, JSON.stringify(this.entries, null, 2)),
        fs.writeFile(SESSIONS_FILE, JSON.stringify(this.sessions, null, 2))
      ]);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  startNewSession(): string {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.currentSessionId;
  }

  submitScore(nickname: string, score: number, sessionId?: string): {
    madeLeaderboard: boolean;
    sessionId: string;
  } {
    const entry: LeaderboardEntry = {
      nickname,
      score,
      timestamp: Date.now()
    };

    // Handle session logic
    let actualSessionId = sessionId || this.currentSessionId;

    if (!actualSessionId) {
      actualSessionId = this.startNewSession();
    }

    // Find or create session
    let session = this.sessions.find(s => s.sessionId === actualSessionId);
    if (!session) {
      session = {
        sessionId: actualSessionId,
        players: [],
        gameOverAt: Date.now(),
        totalScore: 0
      };
      this.sessions.push(session);
    }

    // Add player to session
    session.players.push(entry);
    session.totalScore = score;

    // Update global leaderboard with session data
    this.updateLeaderboardWithSessions();

    this.saveData();

    const madeLeaderboard = this.entries.some(e => 
      e.nickname.includes(`${session!.players.length} Players`) && 
      e.score === session!.totalScore
    );
    
    return {
      madeLeaderboard,
      sessionId: actualSessionId
    };
  }

  private updateLeaderboardWithSessions(): void {
    // Clear old entries
    this.entries = [];

    // Add session entries to leaderboard
    this.sessions.forEach(session => {
      if (session.players.length > 0) {
        const playerNames = session.players.map(p => p.nickname).join(', ');
        const entry: LeaderboardEntry = {
          nickname: `${session.players.length} Players: ${playerNames}`,
          score: session.totalScore,
          timestamp: session.gameOverAt
        };
        this.entries.push(entry);
      }
    });

    // Sort by total score (descending) and then by timestamp (ascending for ties)
    this.entries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timestamp - b.timestamp;
    });

    // Keep only top entries
    this.entries = this.entries.slice(0, MAX_ENTRIES);
  }

  getLeaderboard(): LeaderboardEntry[] {
    return [...this.entries];
  }

  getSessions(): GameSession[] {
    return [...this.sessions];
  }
}