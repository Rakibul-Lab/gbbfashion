// Debug wrapper to catch why processes die
const { spawn } = require('child_process');

const projectDir = '/home/z/my-project';

// Trap signals on this process
['SIGTERM', 'SIGINT', 'SIGKILL', 'SIGHUP', 'SIGUSR1', 'SIGUSR2', 'SIGPIPE', 'SIGALRM', 'SIGPROF', 'SIGBUS', 'SIGFPE', 'SIGSEGV', 'SIGABRT'].forEach(sig => {
  try {
    process.on(sig, () => {
      console.log(`[${new Date().toISOString()}] PARENT received ${sig}`);
    });
  } catch (e) {}
});

process.on('exit', (code) => {
  console.log(`[${new Date().toISOString()}] PARENT exiting with code=${code}`);
});

console.log(`[${new Date().toISOString()}] Starting debug wrapper, PID=${process.pid}`);

const child = spawn('npx', ['next', 'dev', '-p', '3000'], {
  cwd: projectDir,
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=256' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

console.log(`[${new Date().toISOString()}] Child PID=${child.pid}`);

child.stdout.on('data', (data) => {
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('exit', (code, signal) => {
  console.log(`[${new Date().toISOString()}] Child exited code=${code} signal=${signal}`);
});

child.on('close', (code, signal) => {
  console.log(`[${new Date().toISOString()}] Child closed code=${code} signal=${signal}`);
});

child.on('error', (err) => {
  console.log(`[${new Date().toISOString()}] Child error: ${err.message}`);
});

// Keep process alive
setInterval(() => {
  const mem = process.memoryUsage();
  console.log(`[${new Date().toISOString()}] Heartbeat - RSS=${Math.round(mem.rss/1024/1024)}MB`);
}, 5000);
