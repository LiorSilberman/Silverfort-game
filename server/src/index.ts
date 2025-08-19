import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Game } from './game.js';
import dotenv from 'dotenv'
import { Leaderboard } from './leaderboard.js';
import { SubmitScoreData, ClickCellData, RestartCountdownData } from './types.js';

dotenv.config()


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN, 
        methods: ["GET", "POST"]
    }
});

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.static('../client/dist'));


const game = new Game();
const leaderboard = new Leaderboard();

// Track restart state
let isRestarting = false;
let restartTimeout: NodeJS.Timeout | null = null;
let countdownInterval: NodeJS.Timeout | null = null;

// Auto-restart function with grace period for score submission
function scheduleAutoRestart(delayMs: number = 8000) {
    if (isRestarting) return;
    
    isRestarting = true;
    const totalSeconds = delayMs / 1000;
    let remainingSeconds = totalSeconds;
    
    console.log(`Game over! Auto-restarting in ${totalSeconds} seconds...`);
    
    // Send initial countdown
    const countdownData: RestartCountdownData = { 
        secondsRemaining: remainingSeconds,
        message: 'Submit your scores! Game restarts in...'
    };
    io.emit('restartCountdown', countdownData);
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds > 0) {
            const countdownUpdate: RestartCountdownData = { 
                secondsRemaining: remainingSeconds,
                message: 'Submit your scores! Game restarts in...'
            };
            io.emit('restartCountdown', countdownUpdate);
        }
    }, 1000);
    
    // Final restart
    restartTimeout = setTimeout(() => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        game.restart();
        isRestarting = false;
        restartTimeout = null;
        console.log('Game restarted automatically');
        io.emit('restartCompleted');
        io.emit('state', game.getState());
    }, delayMs);
}

function cancelAutoRestart() {
    if (restartTimeout) {
        clearTimeout(restartTimeout);
        restartTimeout = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    isRestarting = false;
}

// REST endpoints for leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboard.getLeaderboard());
});

app.post('/api/leaderboard', (req, res) => {
    const { nickname, score, sessionId }: SubmitScoreData = req.body;

    if (!nickname || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid nickname or score' });
    }

    const result = leaderboard.submitScore(nickname, score, sessionId);
    res.json({
        success: true,
        madeLeaderboard: result.madeLeaderboard,
        sessionId: result.sessionId,
        leaderboard: leaderboard.getLeaderboard()
    });
});

io.on('connection', (socket) => {
    console.log('Client connected');

    // Send current state to new client
    socket.emit('state', game.getState());

    socket.on('clickCell', (data: ClickCellData) => {
        if (isRestarting) {
            return;
        }

        const result = game.clickCell(data.row, data.col);

        if (result.success) {
            // Broadcast updated state to all clients
            io.emit('state', game.getState());
        } else if (result.gameOver) {
            const sessionId = leaderboard.startNewSession();
            io.emit('gameOver', { sessionId });
            io.emit('state', game.getState());
            
            // Automatically schedule restart with 8-second grace period
            scheduleAutoRestart(8000);
        }
    });

    // Manual force restart (for admin/testing purposes)
    socket.on('forceRestart', () => {
        console.log('Force restart requested');
        
        // Cancel any pending auto-restart
        cancelAutoRestart();
        
        // Immediate restart with short delay
        scheduleAutoRestart(1000);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});