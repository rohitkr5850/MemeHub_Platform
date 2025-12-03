import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import memeRoutes from './routes/memes.js';
import aiRoutes from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLWARES =====
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

//Required for Render + Vercel + Google Login
app.use(
  cors({
    origin: [
      "http://localhost:5173",              
      "https://meme-hub-platform-zorq.vercel.app", 
    ],
    credentials: true,
  })
);

// ===== ROUTES =====
app.get("/test", (req, res) => {
  res.send("Backend working!");
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/ai', aiRoutes);

// ===== MONGO CONNECT =====
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed", err.message);
  });

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(500).json({
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
