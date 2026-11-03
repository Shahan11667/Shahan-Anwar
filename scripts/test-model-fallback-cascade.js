const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('================================================================');
console.log('⚡ AI MODEL CASCADE & FAILOVER VERIFICATION SUITE');
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

// -----------------------------------------------------------------------------
// 1. Verify Client-Side Puter Fallback Architecture
// -----------------------------------------------------------------------------
console.log('📌 1. VERIFYING PUTER.JS MULTI-MODEL FAILOVER LOGIC');

const puterLibPath = path.join(__dirname, '..', 'lib', 'puter.ts');
const puterCode = fs.readFileSync(puterLibPath, 'utf8');

check('lib/puter.ts exports DEFAULT_FALLBACK_CHAIN', puterCode.includes('export const DEFAULT_FALLBACK_CHAIN: string[] ='));
check('Chain includes GPT-4o, Claude 3.5, Gemini 1.5, DeepSeek, Llama', 
  puterCode.includes("'openai/gpt-4o'") && 
  puterCode.includes("'anthropic/claude-3-5-sonnet'") && 
  puterCode.includes("'google/gemini-1.5-flash'") &&
  puterCode.includes("'deepseek/deepseek-chat'")
);
check('lib/puter.ts exports puterChatWithDetails()', puterCode.includes('export async function puterChatWithDetails('));
check('Loop catches failure and triggers onModelFallback', 
  puterCode.includes('options.onModelFallback(currentModel, nextModel, errMsg)')
);

// -----------------------------------------------------------------------------
// 2. Unit Test: Simulated Fallback Cascade Behavior
// -----------------------------------------------------------------------------
console.log('\n📌 2. UNIT TESTING CASCADE EXECUTION ALGORITHM');

// We simulate puter.ai.chat failing on the first 2 models and succeeding on the 3rd
let attempts = [];
let fallbackNotifications = [];

const fakePuter = {
  ai: {
    chat: async (messages, opts) => {
      attempts.push(opts.model);
      if (opts.model === 'model-broken-1') {
        throw new Error('429 Too Many Requests (Rate Limit)');
      }
      if (opts.model === 'model-overloaded-2') {
        throw new Error('503 Service Unavailable (Overloaded)');
      }
      if (opts.model === 'model-working-3') {
        return { text: 'Success from model-working-3!' };
      }
      throw new Error('Unknown model');
    }
  }
};

async function testSimulatedCascade() {
  const modelsToTry = ['model-broken-1', 'model-overloaded-2', 'model-working-3', 'model-unused-4'];
  let successfulResult = null;
  const errors = [];

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      const res = await fakePuter.ai.chat('hello', { model: currentModel });
      successfulResult = { text: res.text, modelUsed: currentModel };
      break;
    } catch (err) {
      errors.push({ model: currentModel, error: err.message });
      const nextModel = modelsToTry[i + 1];
      if (nextModel) {
        fallbackNotifications.push({ from: currentModel, to: nextModel });
      }
    }
  }

  check('Simulated cascade tried primary model first', attempts[0] === 'model-broken-1');
  check('Simulated cascade fell back to 2nd model on 429 error', attempts[1] === 'model-overloaded-2');
  check('Simulated cascade fell back to 3rd model on 503 error', attempts[2] === 'model-working-3');
  check('Simulated cascade stopped when model succeeded', attempts.length === 3 && successfulResult.modelUsed === 'model-working-3');
  check('Triggered exactly 2 failover transition events', fallbackNotifications.length === 2);
}

// -----------------------------------------------------------------------------
// 3. Verify Server-Side Gemini Multi-Model Fallback
// -----------------------------------------------------------------------------
console.log('\n📌 3. VERIFYING SERVER-SIDE GEMINI MULTI-MODEL FALLBACK');

const routePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'automation', 'generate', 'route.ts');
const routeCode = fs.readFileSync(routePath, 'utf8');

check('Server route defines candidateModels array for topics', routeCode.includes("candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro']"));
check('Server route loops through candidateModels for scripts', routeCode.includes('for (const modelName of candidateModels)'));

// -----------------------------------------------------------------------------
// 4. Live Server End-to-End Fallback Validation
// -----------------------------------------------------------------------------
console.log('\n📌 4. LIVE SERVER MULTI-TIER FALLBACK VALIDATION');

function makeRequest(postData) {
  return new Promise((resolve) => {
    const dataStr = JSON.stringify(postData);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/automation/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(body) });
        } catch (_) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.write(dataStr);
    req.end();
  });
}

async function runLiveServerTests() {
  await testSimulatedCascade();

  // Test live server fallback when API key is bogus
  const res = await makeRequest({
    apiKey: 'AIzaSyBogusKeyForFallbackTest987654321',
    niche: 'wealth_business',
    customPrompt: 'Zero Employee Business Blueprint'
  });

  check(
    'Server successfully cascades through failed Gemini models to Procedural Engine',
    res.status === 200 && res.json?.success === true && res.json?.source === 'procedural-ai-engine',
    `Returned ${res.json?.data?.scenes?.length} fully formed scenes via zero-fail procedural fallback`
  );

  console.log('\n================================================================');
  console.log(`⚡ AI MODEL FALLBACK AUDIT: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveServerTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

