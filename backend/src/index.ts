import dotenv from 'dotenv';
import buildApp from './app';
import { getPort, shouldRunScheduledJobs } from './config/runtime';
import { initScheduledJobs } from './services/proactiveService';

dotenv.config();

export function startServer() {
  const app = buildApp();
  const port = getPort();
  const server = app.listen(port, () => {
    console.log(`🌸 LingLove API running on http://localhost:${port}`);

    if (shouldRunScheduledJobs()) {
      initScheduledJobs();
    } else {
      console.log('[runtime] Scheduled jobs disabled for automated test profile.');
    }
  });

  return { app, server, port };
}

if (require.main === module) {
  startServer();
}

export default buildApp;
