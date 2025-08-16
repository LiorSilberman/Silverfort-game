import './GameHeader.css';

interface GameHeaderProps {
    score: number;
    gameOver: boolean;
    onShowLeaderboard: () => void;
}

export default function GameHeader({ score, gameOver, onShowLeaderboard }: GameHeaderProps) {
    return (
        <header className="game-header">
            <h1>Silverfort Game</h1>
            <div className="game-info">
                <div className="score">Score: {score}</div>
                <div className={`status ${gameOver ? 'game-over' : 'running'}`}>
                    {gameOver ? 'Game Over' : 'Running'}
                </div>
                <button className="leaderboard-button" onClick={onShowLeaderboard}>
                    Leaderboard
                </button>
            </div>
        </header>
    );
};
