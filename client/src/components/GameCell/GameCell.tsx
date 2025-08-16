import type { Cell } from '../../types';
import './GameCell.css';

interface GameCellProps {
  cell: Cell;
  disabled: boolean;
  cooldown: number;
  onClick: () => void;
}

const GameCell: React.FC<GameCellProps> = ({ 
  cell, 
  disabled, 
  cooldown, 
  onClick 
}) => {
  const renderShape = () => {
    const color = cell.color;
    const size = 30;
    const center = 40;

    switch (cell.shape) {
      case 'triangle':
        return (
          <polygon
            points={`${center},${center - size/2} ${center - size/2},${center + size/2} ${center + size/2},${center + size/2}`}
            fill={color}
          />
        );
      case 'square':
        return (
          <rect
            x={center - size/2}
            y={center - size/2}
            width={size}
            height={size}
            fill={color}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${center},${center - size/2} ${center + size/2},${center} ${center},${center + size/2} ${center - size/2},${center}`}
            fill={color}
          />
        );
      case 'circle':
        return (
          <circle
            cx={center}
            cy={center}
            r={size/2}
            fill={color}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`game-cell ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <svg width="80" height="80" viewBox="0 0 80 80">
        {renderShape()}
      </svg>
      {cooldown > 0 && (
        <div className="cooldown-overlay">
          {cooldown}
        </div>
      )}
    </div>
  );
};

export default GameCell;