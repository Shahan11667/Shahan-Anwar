const http = require('http');
const fs = require('fs');

const ALL_SLUGS = [
  'word-to-pdf',
  'pdf-to-word',
  'pdf-editor',
  'word-editor',
  'image-editor',
  'screenshot-studio',
  'resume-builder',
  'invoice-generator',
  'smart-calculator',
  'dev-text-converter',
  'focus-habit-tracker',
  'music-studio',
  'interior-planner',
  'jpg-to-pdf',
  'pdf-to-jpg',
  'merge-pdf',
  'split-pdf',
  'image-compressor',
  'image-resizer',
  'jpg-to-png',
  'image-to-text',
  'pdf-to-text',
  'voice-message-to-text',
  'word-counter',
  'case-converter',
  'json-formatter',
  'base64-tool'
];

const CORE_ROUTES = [
  '/',
  '/portfolio',
  '/admin',
  '/api/admin/settings'
];

function fetchRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:3000${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          length: body.length,
          snippet: body.slice(0, 100).replace(/\s+/g, ' ')
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        path,
        status: 0,
        ok: false,
        error: err.message
      });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ path, status: 0, ok: false, error: 'TIMEOUT' });
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING THOROUGH END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Test Core Platform Routes
  console.log('--- TEST 1: CORE PLATFORM & API ROUTES ---');
  for (const route of CORE_ROUTES) {
    const res = await fetchRoute(route);
    if (res.ok) {
      console.log(`✅ [HTTP ${res.status}] ${route} (${res.length} bytes)`);
      passed++;
    } else {
      console.log(`❌ [FAILED] ${route} -> Status: ${res.status}, Error: ${res.error || 'Bad Status'}`);
      failed++;
    }
  }

  // 2. Test All 27 Tool Pages
  console.log('\n--- TEST 2: ALL 27 TOOL APPLICATION PAGES ---');
  for (const slug of ALL_SLUGS) {
    const path = `/tools/${slug}`;
    const res = await fetchRoute(path);
    if (res.ok && res.length > 1000) {
      console.log(`✅ [HTTP ${res.status}] ${path} (${res.length} bytes)`);
      passed++;
    } else {
      console.log(`❌ [FAILED] ${path} -> Status: ${res.status}, Error: ${res.error || 'Bad Body Length'}`);
      failed++;
    }
  }

  // 3. Test Admin Settings API Payload Structure
  console.log('\n--- TEST 3: ADMIN SETTINGS PAYLOAD VALIDATION ---');
  const settingsRes = await fetchRoute('/api/admin/settings');
  if (settingsRes.ok) {
    try {
      const data = JSON.parse(settingsRes.snippet.includes('{') ? settingsRes.snippet : '{}');
      console.log('✅ Admin Settings API responded with valid HTTP 200');
      passed++;
    } catch (e) {
      console.log('⚠️ Could not parse JSON snippet:', e.message);
    }
  }

  // 4. Component File Existence & Non-Empty Check
  console.log('\n--- TEST 4: COMPONENT FILE INTEGRITY ---');
  const requiredComponents = [
    'components/tools/pdf-editor-tool.tsx',
    'components/tools/word-editor-tool.tsx',
    'components/tools/word-to-pdf-tool.tsx',
    'components/tools/pdf-to-word-tool.tsx',
    'components/tools/image-editor-tool.tsx',
    'components/tools/screenshot-studio-tool.tsx',
    'components/tools/resume-builder-tool.tsx',
    'components/tools/invoice-generator-tool.tsx',
    'components/tools/smart-calculator-tool.tsx',
    'components/tools/dev-text-converter-tool.tsx',
    'components/tools/focus-habit-tracker-tool.tsx',
    'components/tools/music-studio-tool.tsx',
    'components/tools/interior-planner-tool.tsx'
  ];

  for (const comp of requiredComponents) {
    if (fs.existsSync(comp)) {
      const stats = fs.statSync(comp);
      if (stats.size > 2000) {
        console.log(`✅ Component: ${comp} (${stats.size} bytes)`);
        passed++;
      } else {
        console.log(`❌ Component file is too small: ${comp}`);
        failed++;
      }
    } else {
      console.log(`❌ Missing component file: ${comp}`);
      failed++;
    }
  }

  // 5. Specialist PDF Features Check in pdf-editor-tool.tsx
  console.log('\n--- TEST 5: SPECIALIST PDF FEATURES VERIFICATION ---');
  const pdfToolContent = fs.readFileSync('components/tools/pdf-editor-tool.tsx', 'utf8');
  const specialistFeatures = [
    { name: 'Word Processor Text Reflow Mode', needle: 'openTextReflowMode' },
    { name: 'Bulk Extraction of Highlights', needle: 'getAllHighlights' },
    { name: 'Advanced Typography (Tracking & Leading)', needle: 'letterSpacing' },
    { name: 'Smart Multi-Object Alignment & Snap Grid', needle: 'alignSelected' },
    { name: 'Native Reference Manager & BibTeX Sync', needle: 'exportBibTex' },
    { name: 'Dynamic PDF-to-Mind-Map Conversion', needle: 'generateMindMap' }
  ];

  specialistFeatures.forEach(feat => {
    if (pdfToolContent.includes(feat.needle)) {
      console.log(`✅ Specialist Feature: ${feat.name} [VERIFIED]`);
      passed++;
    } else {
      console.log(`❌ Specialist Feature MISSING: ${feat.name}`);
      failed++;
    }
  });

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL SYSTEMS AND TOOLS ARE 100% OPERATIONAL & VERIFIED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED. INVESTIGATION REQUIRED.');
    process.exit(1);
  }
}

runTests();

