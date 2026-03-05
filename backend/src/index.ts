import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import memoryRoutes from './routes/memory';
import voiceRoutes from './routes/voice';
import feedRoutes from './routes/feed';
import relationshipRoutes from './routes/relationship';
import profileRoutes from './routes/profile';
import proactiveRoutes from './routes/proactive';
import { initScheduledJobs } from './services/proactiveService';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/relationship', relationshipRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/proactive', proactiveRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({ message: '🌸 LingLove API is running', endpoints: '/api/*' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', name: 'LingLove API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌸 LingLove API running on http://localhost:${PORT}`);
  initScheduledJobs();
});

export default app;
