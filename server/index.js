import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import './config/db.js';  // Mongo connects automatically
import binRoutes from './routes/binRoutes.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });  // For real-time

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));  // Handle large bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/bin', binRoutes);

// WebSocket for real-time
io.on('connection', (socket) => {
  socket.on('joinBin', (binId) => {
    socket.join(binId);  // Join room for bin-specific updates
  });
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));