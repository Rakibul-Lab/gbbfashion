// Persistent dev server with auto-restart
const { spawn } = require('child_process');
const path = require('path');

const projectDir = '/home/z/my-project';
let child = null;
let restartCount = 0;
const MAX_RESTARTS = 50;

function startServer() {
  if (restartCount >= MAX_RESTARTS) {
    console.log(`[${new Date().toISOString()}] Max restarts (${MAX_RESTARTS}) reached. Stopping.`);
    process.exit(1);
  }

  restartCount++;
  console.log(`[${new Date().toISOString()}] Starting dev server (attempt ${restartCount})...`);

  child = spawn('npx', ['next', 'dev', '-p', '3000'], {
    cwd: projectDir,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=256' },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  child.on('exit', (code, signal) => {
    console.log(`[${new Date().toISOString()}] Server exited with code=${code} signal=${signal}`);
    child = null;
    // Wait 3 seconds before restarting
    setTimeout(startServer, 3000);
  });

  child.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, err);
    child = null;
    setTimeout(startServer, 3000);
  });
}

// Handle SIGTERM/SIGINT
process.on('SIGTERM', () => {
  if (child) child.kill('SIGTERM');
  process.exit(0);
});
process.on('SIGINT', () => {
  if (child) child.kill('SIGINT');
  process.exit(0);
});

startServer();
