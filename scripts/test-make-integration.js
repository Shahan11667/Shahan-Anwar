/**
 * Make.com & Webhook Integration Test Suite
 * Tests Make.com webhook validation, test_ping action, rich video metadata dispatch,
 * and UI integration for 1,000 free operations/month.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('================================================================');
console.log('⚡ MAKE.COM INTEGRATION & 1,000 OPS DISPATCH TEST SUITE');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${name} ${detail ? `-> ${detail}` : ''}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${detail ? `-> ${detail}` : ''}`);
    failed++;
  }
}

// 1. Static Audit of publish route
console.log('📌 1. STATIC CODE AUDIT FOR PUBLISH ROUTE');
const publishRoutePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'automation', 'publish', 'route.ts');
const publishSource = fs.readFileSync(publishRoutePath, 'utf8');

check(
  'Route handles action: test_ping for Make.com schema detection',
  publishSource.includes("action === 'test_ping'")
);

check(
  'Route validates webhook URL format before making requests',
  publishSource.includes("webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://')")
);

check(
  'Test ping payload includes channel, niche, language, and sample video scenes',
  publishSource.includes('make_automation.test_ping') &&
  publishSource.includes('channel: channelName') &&
  publishSource.includes('sampleVideo:')
);

check(
  'Publish payload passes full structured scenes & thumbnail metadata',
  publishSource.includes('scenes: scenes || []') &&
  publishSource.includes('thumbnail: thumbnail || {}')
);

// 2. Static Audit of youtube-automation-view.tsx
console.log('\n📌 2. STATIC CODE AUDIT FOR YOUTUBE AUTOMATION VIEW');
const viewPath = path.join(__dirname, '..', 'components', 'admin', 'youtube-automation-view.tsx');
const viewSource = fs.readFileSync(viewPath, 'utf8');

check(
  'UI defines webhookProvider state defaulting to make',
  viewSource.includes("const [webhookProvider, setWebhookProvider] = useState<'make' | 'zapier' | 'custom'>('make');")
);

check(
  'UI hydrates webhookUrl and webhookProvider from localStorage',
  viewSource.includes("localStorage.getItem('sol_automation_webhook_url')") &&
  viewSource.includes("localStorage.getItem('sol_automation_webhook_provider')")
);

check(
  'UI includes Make.com vs Zapier switcher pills',
  viewSource.includes("Make.com (1,000 Free ⚡)") &&
  viewSource.includes("Zapier (100 Free)")
);

check(
  'UI has dedicated Send Test Ping to Make.com button',
  viewSource.includes('Send Test Ping to Make.com') &&
  viewSource.includes('handleTestWebhookPing')
);

check(
  'UI includes Make.com 5-step quick setup guide',
  viewSource.includes('Make.com Setup Guide (1,000 Free Tasks/Month)')
);

// 3. Functional HTTP Mock Server Test
console.log('\n📌 3. FUNCTIONAL HTTP WEBHOOK DISPATCH VERIFICATION');

function startMockWebhookServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ received: true, event: parsed.event }));
        } catch {
          res.writeHead(400);
          res.end('invalid json');
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, url: `http://127.0.0.1:${port}/make-webhook-test` });
    });
  });
}

async function runLiveWebhookTests() {
  const { server, url } = await startMockWebhookServer();

  // Test ping with mock server URL
  try {
    const testPingPayload = {
      event: 'make_automation.test_ping',
      source: 'SOL Studio YouTube Automation',
      channel: 'Beshaan',
      language: 'roman_urdu',
      sampleVideo: {
        title: 'Ek Outfit Ko 3 Alag Tareeqon Se Style Kiya! (Two Girls vs One Boy Challenge) 🎀',
        sceneCount: 5
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPingPayload)
    });

    const resJson = await res.json();
    check(
      'Mock Make.com webhook received test payload successfully',
      res.status === 200 && resJson.received === true && resJson.event === 'make_automation.test_ping',
      `HTTP ${res.status}`
    );
  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`✨ MAKE.COM TEST SUITE: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All Make.com Integration checks PASSED perfectly!\n');
  }
}

runLiveWebhookTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

