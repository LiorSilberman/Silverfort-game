import type { Cell } from '../../types';
import GameCell from '../GameCell/GameCell';
import './GameBoard.css';

interface GameBoardProps {
  board: Cell[][];
  turn: number;
  gameOver: boolean;
  onCellClick: (row: number, col: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  turn, 
  gameOver, 
  onCellClick 
}) => {
  const isCellDisabled = (cell: Cell): boolean => {
    if (gameOver) return true;
    if (cell.lastClickedTurn === undefined) return false;
    const turnsSinceClick = turn - cell.lastClickedTurn;
    return turnsSinceClick < 4;
  };

  const getRemainingCooldown = (cell: Cell): number => {
    if (cell.lastClickedTurn === undefined) return 0;
    const turnsSinceClick = turn - cell.lastClickedTurn;
    const remaining = 4 - turnsSinceClick;
    return Math.max(0, remaining);
  };

  return (
    <div className="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell) => (
            <GameCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              disabled={isCellDisabled(cell)}
              cooldown={getRemainingCooldown(cell)}
              onClick={() => onCellClick(cell.row, cell.col)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;