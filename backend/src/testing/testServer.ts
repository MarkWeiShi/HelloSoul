import { once } from 'node:events';
import type { Server } from 'node:http';
import buildApp from '../app';
import prisma from '../lib/prisma';
import { resetAndSeedE2EState } from './e2eSeed';

export async function startTestServer(): Promise<{
  server: Server;
  baseUrl: string;
}> {
  const app = buildApp();
  const server = app.listen(0);
  await once(server, 'listening');
  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Failed to resolve test server address.');
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

export async function stopTestServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export async function resetTestState(): Promise<void> {
  await resetAndSeedE2EState();
}

export async function disconnectTestPrisma(): Promise<void> {
  await prisma.$disconnect();
}
