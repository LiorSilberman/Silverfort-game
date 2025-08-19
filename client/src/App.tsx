import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, RestartCountdownData } from './types';
import GameBoard from './components/GameBoard/GameBoard';
import GameHeader from './components/GameHeader/GameHeader';
import NicknameModal from './components/NickmnameModal/NicknameModal';
import LeaderboardModal from './components/LeaderboardModal/LeaderboardModal';
import { leaderboardService } from './service/Leaderboard';
import './App.css';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [restartCountdown, setRestartCountdown] = useState<RestartCountdownData | null>(null);

  // Use useCallback to prevent unnecessary re-renders
  const handleRestartCountdown = useCallback((data: RestartCountdownData) => {
      console.log(`Restart countdown: ${data.secondsRemaining} seconds remaining`);
      setRestartCountdown(data);
  }, []);

  const URL =
  import.meta.env.VITE_SOCKET_URL ??
  `${window.location.protocol}//${window.location.hostname}:3001`;

  const gameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const newSocket = io(URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('state', (state: GameState) => {
      setGameState(state);
      gameStateRef.current = state;
    });

    newSocket.on('gameOver', (data: { sessionId: string }) => {
      console.log('Game Over!');
      setCurrentSessionId(data.sessionId);
      const currentState = gameStateRef.current;
      if (currentState) {
        setFinalScore(currentState.score);
        setShowNicknameModal(true);
      }
    });

    newSocket.on('restartCountdown', handleRestartCountdown);

    newSocket.on('restartCompleted', () => {
      console.log('Game restarted by server');
      setRestartCountdown(null);
      setShowNicknameModal(false);
      setCurrentSessionId(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (socket && gameState && !gameState.gameOver) {
      socket.emit('clickCell', { row, col });
    }
  };

  const handleSubmitScore = async (nickname: string) => {
    try {
      const sessionId = currentSessionId || undefined;
      const result = await leaderboardService.submitScore(nickname, finalScore, sessionId);
      console.log('Score submitted:', result);
      setShowNicknameModal(false);
      // Server will handle restart automatically - no client action needed
    } catch (error) {
      console.error('Failed to submit score:', error);
      setShowNicknameModal(false);
    }
  };

  const handleSkipScore = () => {
    setShowNicknameModal(false);
    // Server will handle restart automatically - no client action needed
  };

  useEffect(() => {
    document.title = 'Silverfort Shared Game';
  }, []);

  if (!connected) {
    return <div className="loading">Connecting to server...</div>;
  }

  if (!gameState) {
    return <div className="loading">Loading game...</div>;
  }


  return (
    <div className="app">
      <GameHeader 
        score={gameState.score} 
        gameOver={gameState.gameOver}
        onShowLeaderboard={() => setShowLeaderboardModal(true)}
      />

      {restartCountdown && (
        <div className="restart-overlay">
          <div className="restart-message">
            <h2>Game Over!</h2>
            <p>{restartCountdown.message}</p>
            <div className="restart-countdown">
              <div className="countdown-circle">
                <span>{restartCountdown.secondsRemaining}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <GameBoard 
        board={gameState.board}
        turn={gameState.turn}
        gameOver={gameState.gameOver}
        onCellClick={handleCellClick}
      />
      {showNicknameModal && (
        <NicknameModal 
          score={finalScore} 
          onSubmit={handleSubmitScore} 
          onCancel={handleSkipScore}
          countdownSeconds={restartCountdown?.secondsRemaining}
        />
      )}
      {showLeaderboardModal && (
        <LeaderboardModal onClose={() => setShowLeaderboardModal(false)} />
      )}
    </div>
  );
}

export default App;