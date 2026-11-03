const http = require('http');

const routes = [
  '/',
  '/tools/word-to-pdf',
  '/tools/pdf-to-word',
  '/tools/word-editor',
  '/tools/pdf-editor',
  '/tools/image-editor',
  '/tools/screenshot-studio',
  '/portfolio',
  '/api/admin/settings',
];

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          length: body.length
        });
      });
    }).on('error', (err) => {
      resolve({ path, status: 0, ok: false, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing all routes on http://localhost:3000 ...');
  let allOk = true;
  for (const path of routes) {
    const res = await checkRoute(path);
    console.log(`[${res.ok ? 'SUCCESS' : 'FAIL'}] ${path} -> HTTP ${res.status} (${res.length || 0} bytes)`);
    if (!res.ok) allOk = false;
  }
  if (allOk) {
    console.log('\n>>> ALL 9 VERIFICATION CHECKS PASSED PERFECTLY! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SOME CHECKS FAILED! <<<');
    process.exit(1);
  }
}

run();

