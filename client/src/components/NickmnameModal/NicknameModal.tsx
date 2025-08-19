import { useState } from 'react';
import './NicknameModal.css';

interface NicknameModalProps {
  score: number;
  onSubmit: (nickname: string) => void;
  onCancel: () => void;
  countdownSeconds?: number;
}

export default function NicknameModal({ score, onSubmit, onCancel, countdownSeconds }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Game Over!</h2>
        <p>Your score: {score}</p>
        {countdownSeconds && countdownSeconds > 0 && (
          <p className="countdown-warning">
            ⏰ Game restarts in {countdownSeconds} seconds
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="nickname">Enter your nickname:</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname"
            maxLength={20}
            required
            autoFocus
          />
          <div className="modal-buttons">
            <button type="submit" disabled={!nickname.trim()}>
              Submit Score
            </button>
            <button type="button" onClick={onCancel}>
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}