const http = require('http');
const fs = require('fs');
const path = require('path');

const ALL_36_SLUGS = [
  // 1. New PDF Suite & Specialized Document Tools
  'pdf-suite',
  'organize-pdf',
  'compress-pdf',
  'convert-to-pdf',
  'convert-from-pdf',
  'pdf-annotate',
  'pdf-security',
  'pdf-intelligence',
  // 2. Core PDF & Word Converters + Specialist PDF Editor
  'word-to-pdf',
  'pdf-to-word',
  'word-editor',
  'pdf-editor',
  // 3. Creative & Screenshot Studios
  'image-editor',
  'screenshot-studio',
  // 4. High-Demand Micro-SaaS
  'resume-builder',
  'invoice-generator',
  'smart-calculator',
  'dev-text-converter',
  'focus-habit-tracker',
  // 5. Music Collaboration & 3D Interior Architecture
  'music-studio',
  'interior-planner',
  // 6. Audio / Speech
  'voice-message-to-text',
  // 7. Base Utilities
  'jpg-to-pdf',
  'pdf-to-jpg',
  'merge-pdf',
  'split-pdf',
  'image-compressor',
  'image-resizer',
  'jpg-to-png',
  'word-counter',
  'case-converter',
  'json-formatter',
  'base64-tool',
  'image-to-text',
  'pdf-to-text'
];

const PAGES_TO_TEST = [
  '/',
  '/tools',
  '/portfolio',
  '/admin',
  '/video-downloader',
  '/video-editor'
];

const APIS_TO_TEST = [
  '/api/admin/settings',
  '/api/test',
  '/api/projects'
];

function fetchStatus(urlPath) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:3000${urlPath}`, (res) => {
      resolve({ path: urlPath, status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ path: urlPath, status: 'ERROR', error: err.message });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ path: urlPath, status: 'TIMEOUT' });
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE PLATFORM VERIFICATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Test All 36 Tool Pages
  console.log('--- Checking All 36 Productivity Tool Pages ---');
  for (const slug of ALL_36_SLUGS) {
    const res = await fetchStatus(`/tools/${slug}`);
    if (res.status === 200) {
      console.log(`[PASS] /tools/${slug} -> HTTP 200`);
      passed++;
    } else {
      console.error(`[FAIL] /tools/${slug} -> Status: ${res.status}`);
      failed++;
    }
  }

  // 2. Test Core Routes
  console.log('\n--- Checking Core Website Routes ---');
  for (const route of PAGES_TO_TEST) {
    const res = await fetchStatus(route);
    if (res.status === 200) {
      console.log(`[PASS] ${route} -> HTTP 200`);
      passed++;
    } else {
      console.error(`[FAIL] ${route} -> Status: ${res.status}`);
      failed++;
    }
  }

  // 3. Test API Routes
  console.log('\n--- Checking API Endpoints ---');
  for (const api of APIS_TO_TEST) {
    const res = await fetchStatus(api);
    if (res.status === 200) {
      console.log(`[PASS] ${api} -> HTTP 200`);
      passed++;
    } else {
      console.error(`[FAIL] ${api} -> Status: ${res.status}`);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

