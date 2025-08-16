import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState } from './types';
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
  const gameStateRef = useRef<GameState | null>(null);
  const URL =
  import.meta.env.VITE_SOCKET_URL ??
  `${window.location.protocol}//${window.location.hostname}:3001`;

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
    } catch (error) {
      console.error('Failed to submit score:', error);
      setShowNicknameModal(false);
    }
  };

  const handleSkipScore = () => {
    setShowNicknameModal(false);
  };

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
        />
      )}
      {showLeaderboardModal && (
        <LeaderboardModal onClose={() => setShowLeaderboardModal(false)} />
      )}
    </div>
  );
}

export default App;