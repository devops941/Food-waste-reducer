import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { initReminderCron } from './jobs/reminderJob.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import pantryRoutes from './routes/pantryRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import shoppingRoutes from './routes/shoppingRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize automated daily reminder cron job (8:00 AM)
initReminderCron();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/shopping', shoppingRoutes);

// Base health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', app: 'Pantry Fresh API' });
});

// Serve frontend static build if running in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Pantry Fresh Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
