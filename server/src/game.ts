import { Cell, Shape, Color, GameState } from './types';

const SHAPES: Shape[] = ['triangle', 'square', 'diamond', 'circle'];
const COLORS: Color[] = ['red', 'green', 'blue', 'yellow'];
const ROWS = 3;
const COLS = 6;
const COOLDOWN_TURNS = 3;

export class Game {
    private state: GameState;

    constructor() {
        this.state = {
            board: this.generateValidBoard(),
            score: 0,
            turn: 0,
            gameOver: false
        };
    }

    getState(): GameState {
        return this.state;
    }

    restart(): void {
        this.state = {
          board: this.generateValidBoard(),
          score: 0,
          turn: 0,
          gameOver: false
        };
      }

    private generateValidBoard(): Cell[][] {
        const board: Cell[][] = [];

        for (let row = 0; row < ROWS; row++) {
            board[row] = [];
            for (let col = 0; col < COLS; col++) {
                board[row][col] = this.generateValidCell(row, col, board);
            }
        }

        return board;
    }

    private generateValidCell(row: number, col: number, board: Cell[][]): Cell {
        const neighbors = this.getNeighbors(row, col, board);
        const validCombos = this.getValidCombos(neighbors);

        if (validCombos.length === 0) {
            // This shouldn't happen during initial generation, but just in case
            return {
                row,
                col,
                shape: SHAPES[0],
                color: COLORS[0]
            };
        }

        const randomCombo = validCombos[Math.floor(Math.random() * validCombos.length)];
        return {
            row,
            col,
            shape: randomCombo.shape,
            color: randomCombo.color
        };
    }

    private getNeighbors(row: number, col: number, board: Cell[][]): Cell[] {
        const neighbors: Cell[] = [];
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                // Check if the neighbor cell exists before accessing it
                if (board[newRow] && board[newRow][newCol]) {
                    neighbors.push(board[newRow][newCol]);
                }
            }
        }

        return neighbors;
    }

    private getValidCombos(neighbors: Cell[]): { shape: Shape; color: Color }[] {
        const validCombos: { shape: Shape; color: Color }[] = [];

        for (const shape of SHAPES) {
            for (const color of COLORS) {
                let isValid = true;

                for (const neighbor of neighbors) {
                    if (neighbor.shape === shape || neighbor.color === color) {
                        isValid = false;
                        break;
                    }
                }

                if (isValid) {
                    validCombos.push({ shape, color });
                }
            }
        }

        return validCombos;
    }

    clickCell(row: number, col: number): { success: boolean; gameOver?: boolean } {
        if (this.state.gameOver) {
            return { success: false };
        }

        const cell = this.state.board[row][col];

        // Check cooldown
        if (cell.lastClickedTurn !== undefined) {
            const turnsSinceClick = this.state.turn - cell.lastClickedTurn;
            if (turnsSinceClick < COOLDOWN_TURNS) {
                return { success: false };
            }
        }

        // Get current neighbors
        const neighbors = this.getNeighbors(row, col, this.state.board);

        // Get valid combos, excluding current shape/color
        const validCombos = this.getValidCombos(neighbors).filter(combo =>
            combo.shape !== cell.shape || combo.color !== cell.color
        );

        if (validCombos.length === 0) {
            this.state.gameOver = true;
            return { success: false, gameOver: true };
        }

        // Apply random valid combo
        const randomCombo = validCombos[Math.floor(Math.random() * validCombos.length)];
        this.state.board[row][col] = {
            ...cell,
            shape: randomCombo.shape,
            color: randomCombo.color,
            lastClickedTurn: this.state.turn
        };

        this.state.score++;
        this.state.turn++;

        return { success: true };
    }

    isCellDisabled(row: number, col: number): boolean {
        const cell = this.state.board[row][col];
        if (cell.lastClickedTurn === undefined) {
            return false;
        }

        const turnsSinceClick = this.state.turn - cell.lastClickedTurn;
        return turnsSinceClick < COOLDOWN_TURNS;
    }

    getRemainingCooldown(row: number, col: number): number {
        const cell = this.state.board[row][col];
        if (cell.lastClickedTurn === undefined) {
            return 0;
        }

        const turnsSinceClick = this.state.turn - cell.lastClickedTurn;
        const remaining = COOLDOWN_TURNS - turnsSinceClick;
        return Math.max(0, remaining);
    }
}