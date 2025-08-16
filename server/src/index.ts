import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Game } from './game.js';
import dotenv from 'dotenv'
import { Leaderboard } from './leaderboard.js';
import { SubmitScoreData, ClickCellData } from './types.js';

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
        const result = game.clickCell(data.row, data.col);

        if (result.success) {
            // Broadcast updated state to all clients
            io.emit('state', game.getState());
        } else if (result.gameOver) {
            const sessionId = leaderboard.startNewSession();
            io.emit('gameOver', { sessionId });
            io.emit('state', game.getState());
        }
    });

    socket.on('restart', () => {
        game.restart();
        io.emit('state', game.getState());
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});