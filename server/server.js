import 'dotenv/config';
import express from 'express';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize automated daily reminder cron job (8:00 AM)
initReminderCron();

const app = express();

// Allowed origins list for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://food-waste-reducer-1w7j.vercel.app',
  'https://food-waste-reducer-eight.vercel.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((s) => s.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      try {
        const hostname = new URL(origin).hostname;
        if (
          allowedOrigins.includes(origin) ||
          hostname === 'localhost' ||
          hostname.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
      } catch (err) {
        // fallback
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
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
