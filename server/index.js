import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import './config/db.js';  // Mongo connects automatically
import binRoutes from './routes/binRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));  // Handle large bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/bin', binRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));