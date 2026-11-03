const { spawn } = require('child_process');
const http = require('http');

console.log('Starting next start...');
const server = spawn('npm.cmd', ['run', 'start'], {
  cwd: 'e:/SOL',
  shell: true,
  stdio: 'inherit'
});

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function check(path) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000${path}`, (res) => {
      let len = 0;
      res.on('data', d => len += d.length);
      res.on('end', () => resolve({ path, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400, len }));
    }).on('error', err => {
      console.log('Error for', path, err.message, err.code);
      resolve({ path, status: 0, ok: false, error: err.message });
    });
  });
}

async function run() {
  await wait(4000);
  const routes = [
    '/',
    '/tools/word-to-pdf',
    '/tools/pdf-to-word',
    '/tools/word-editor',
    '/tools/pdf-editor',
    '/tools/image-editor',
    '/tools/screenshot-studio',
    '/portfolio',
    '/api/admin/settings'
  ];

  let passed = true;
  for (const r of routes) {
    const res = await check(r);
    console.log(`[${res.ok ? 'SUCCESS' : 'FAILED'}] ${r} -> HTTP ${res.status} (${res.len || 0} bytes)`);
    if (!res.ok) passed = false;
  }

  server.kill('SIGINT');
  setTimeout(() => process.exit(passed ? 0 : 1), 500);
}

run();
