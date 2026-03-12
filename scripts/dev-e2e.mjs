import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const logDir = path.join(root, '.cache', 'qa');

await fs.mkdir(logDir, { recursive: true });

await runCommand('npm', ['run', 'db:push:e2e']);

const backendLog = createWriteStream(path.join(logDir, 'backend.log'), { flags: 'a' });
const frontendLog = createWriteStream(path.join(logDir, 'frontend.log'), { flags: 'a' });

const children = [
  spawnLoggedProcess({
    command: 'npm',
    args: ['run', 'dev:backend:e2e'],
    label: 'backend',
    logStream: backendLog,
  }),
  spawnLoggedProcess({
    command: 'npm',
    args: ['run', 'dev:frontend:e2e'],
    label: 'frontend',
    logStream: frontendLog,
  }),
];

let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    child.kill(signal);
  }

  await Promise.allSettled(children.map(waitForExit));
  backendLog.end();
  frontendLog.end();
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

try {
  await Promise.race(children.map(waitForExit));
  await shutdown('SIGTERM');
} catch (error) {
  await shutdown('SIGTERM');
  throw error;
}

function spawnLoggedProcess(params) {
  const child = spawn(params.command, params.args, {
    cwd: root,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (chunk) => {
    params.logStream.write(chunk);
    process.stdout.write(prefixChunk(params.label, chunk));
  });
  child.stderr?.on('data', (chunk) => {
    params.logStream.write(chunk);
    process.stderr.write(prefixChunk(params.label, chunk));
  });

  return child;
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once('exit', (code, signal) => {
      if (code === 0 || signal === 'SIGINT' || signal === 'SIGTERM') {
        resolve(undefined);
        return;
      }
      reject(new Error(`Child process exited with code ${code}`));
    });
  });
}

function prefixChunk(label, chunk) {
  return String(chunk)
    .split('\n')
    .map((line) => (line ? `[${label}] ${line}` : line))
    .join('\n');
}
