# Silverfort Game

A real-time multiplayer web game built with React, TypeScript, Node.js, and Socket.IO. Players compete on a shared game board where they must strategically click cells to change shapes and colors while avoiding adjacent conflicts.

## 🎮 Game Rules

### Objective
Score points by clicking cells on a 3×6 grid. Each click changes both the shape and color of the cell to a valid combination.

### Game Mechanics
- **Grid**: 3 rows × 6 columns (18 cells total)
- **Shapes**: Triangle, Square, Diamond, Circle
- **Colors**: Red, Green, Blue, Yellow
- **Valid Move**: No orthogonally adjacent cell (up/down/left/right) can share the same shape or color
- **Scoring**: +1 point per valid move
- **Cooldown**: 3-turn cooldown after clicking a cell
- **Game Over**: When no valid shape+color combination exists for any cell

### Multiplayer Features
- **Real-time synchronization** across all connected clients
- **Shared game state** - all players see the same board and score
- **Leaderboard system** with persistent top 10 scores
- **Session tracking** - players from the same game session are grouped together

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Silverfort-game
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```
### Docker Support

The project includes Docker configuration for easy deployment:

```bash
docker-compose up --build
```

## Project Structure
```bash
Silverfort-game/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # React components
│ │ │ ├── GameBoard/ # Game grid component
│ │ │ ├── GameCell/ # Individual cell component
│ │ │ ├── GameHeader/ # Header with score and controls
│ │ │ ├── LeaderboardModal/ # Leaderboard display
│ │ │ └── NicknameModal/ # Score submission modal
│ │ ├── service/ # API services
│ │ ├── types.ts # TypeScript type definitions
│ │ └── App.tsx # Main application component
│ ├── package.json
│ └── vite.config.ts
├── server/ # Node.js backend
│ ├── src/
│ │ ├── game.ts # Game logic and state management
│ │ ├── leaderboard.ts # Leaderboard and session management
│ │ ├── types.ts # TypeScript type definitions
│ │ └── index.ts # Express server and Socket.IO setup
│ ├── package.json
│ └── tsconfig.json
├── package.json # Root package.json with scripts
└── README.md
```

## How to Play

1. **Join the Game**
   - Open the application in your browser
   - You'll automatically connect to the shared game

2. **Make Moves**
   - Click on any cell to change its shape and color
   - Valid moves earn +1 point
   - Invalid moves (adjacent conflicts) are prevented

3. **Manage Cooldowns**
   - After clicking a cell, it enters a 3-turn cooldown
   - Cooldown cells show remaining turns
   - Wait for cooldown to expire before clicking again

4. **Submit Your Score**
   - When the game ends, enter your nickname
   - Your score will be saved to the leaderboard
   - Game automatically restarts after 3 seconds

5. **View Leaderboard**
   - Click the "Leaderboard" button anytime
   - View top scores and player rankings
   - See grouped scores from multiplayer sessions



**Enjoy playing Silverfort Game!** 🎮✨
