import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const backendDir = path.join(root, 'backend');
const dbPath = path.join(root, 'prisma', 'e2e.db');

await fs.mkdir(path.dirname(dbPath), { recursive: true });

const handle = await fs.open(dbPath, 'a');
await handle.close();

await runCommand('npx', ['prisma', 'db', 'push', '--schema', '../prisma/schema.prisma', '--skip-generate'], {
  cwd: backendDir,
  env: {
    ...process.env,
    DATABASE_URL: 'file:../prisma/e2e.db',
  },
});

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}
