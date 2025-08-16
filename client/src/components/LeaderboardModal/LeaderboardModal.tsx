import { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '../../types';
import { leaderboardService } from '../../service/Leaderboard';
import './LeaderboardModal.css';

interface LeaderboardModalProps {
  onClose: () => void;
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await leaderboardService.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Leaderboard</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {loading && <div className="loading">Loading...</div>}
        
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && (
          <div className="leaderboard-content">
            {leaderboard.length === 0 ? (
              <p className="no-scores">No scores yet. Be the first!</p>
            ) : (
              <div className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                  <div key={`${entry.nickname}-${entry.timestamp}`} className="leaderboard-entry">
                    <div className="rank">#{index + 1}</div>
                    <div className="nickname">{entry.nickname}</div>
                    <div className="score">{entry.score}</div>
                    <div className="date">{formatDate(entry.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}