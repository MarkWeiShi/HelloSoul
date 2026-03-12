import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import memoryRoutes from './routes/memory';
import voiceRoutes from './routes/voice';
import feedRoutes from './routes/feed';
import relationshipRoutes from './routes/relationship';
import profileRoutes from './routes/profile';
import proactiveRoutes from './routes/proactive';
import testRoutes from './routes/test';
import { shouldExposeTestRoutes } from './config/runtime';

export function buildApp() {
  const app = express();

  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/memory', memoryRoutes);
  app.use('/api/voice', voiceRoutes);
  app.use('/api/feed', feedRoutes);
  app.use('/api/relationship', relationshipRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/proactive', proactiveRoutes);

  if (shouldExposeTestRoutes()) {
    app.use('/api/test', testRoutes);
  }

  app.get('/', (_req, res) => {
    res.json({ message: '🌸 LingLove API is running', endpoints: '/api/*' });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', version: '0.1.0', name: 'LingLove API' });
  });

  return app;
}

export default buildApp;
