import type { LeaderboardEntry } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${API_BASE}/api/leaderboard`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard. Please try again later.');
    }
  },

  async submitScore(nickname: string, score: number, sessionId?: string): Promise<{
    success: boolean;
    madeLeaderboard: boolean;
    sessionId: string;
    leaderboard: LeaderboardEntry[];
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, score, sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error submitting score:', error);
      throw new Error('Failed to submit score. Please try again later.');
    }
  },
};