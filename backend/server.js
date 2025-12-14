import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import repoRoutes from './routes/repoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import savedRoutes from './routes/savedRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gitgrade')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/repos', repoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/saved', savedRoutes);

// Health check
app.get('/', (req, res) => res.send('GitGrade Backend Running'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});