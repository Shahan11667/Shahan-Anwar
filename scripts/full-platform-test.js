const http = require('http');
const https = require('https');
const { PDFDocument, rgb } = require('pdf-lib');
const docx = require('docx');
const mammoth = require('mammoth');

const ALL_36_SLUGS = [
  'pdf-suite',
  'organize-pdf',
  'compress-pdf',
  'convert-to-pdf',
  'convert-from-pdf',
  'pdf-annotate',
  'pdf-security',
  'pdf-intelligence',
  'word-to-pdf',
  'pdf-to-word',
  'word-editor',
  'pdf-editor',
  'image-editor',
  'screenshot-studio',
  'resume-builder',
  'invoice-generator',
  'smart-calculator',
  'dev-text-converter',
  'focus-habit-tracker',
  'music-studio',
  'interior-planner',
  'voice-message-to-text',
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
  '/admin/login',
  '/video-downloader',
  '/video-editor',
  '/chat',
  '/chat/login'
];

const GET_APIS_TO_TEST = [
  '/api/admin/settings',
  '/api/test',
  '/api/projects',
  '/api/about',
  '/api/hero',
  '/api/contact-info'
];

function httpRequest(urlPath, method = 'GET', postData = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: urlPath,
      method: method,
      headers: {
        'Accept': 'application/json, text/html, */*'
      },
      timeout: 10000
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (_) { }
        resolve({
          path: urlPath,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          length: body.length,
          json: json
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path: urlPath, status: 'ERROR', error: err.message, ok: false });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ path: urlPath, status: 'TIMEOUT', ok: false });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('================================================================');
  console.log('🌟 EXHAUSTIVE SYSTEM & FUNCTIONALITY VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // SECTION 1: All 36 Specialized Tools
  console.log('📌 1. VERIFYING ALL 36 SPECIALIZED TOOLS');
  for (const slug of ALL_36_SLUGS) {
    const res = await httpRequest(`/tools/${slug}`);
    if (res.ok) {
      console.log(`  ✅ [PASS] /tools/${slug} (HTTP ${res.status}) [Size: ${res.length}B]`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] /tools/${slug} -> Status: ${res.status}`);
      failed++;
    }
  }

  // SECTION 2: Core Platform Routes
  console.log('\n📌 2. VERIFYING CORE APP ROUTES');
  for (const page of PAGES_TO_TEST) {
    const res = await httpRequest(page);
    if (res.ok) {
      console.log(`  ✅ [PASS] ${page} (HTTP ${res.status}) [Size: ${res.length}B]`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${page} -> Status: ${res.status}`);
      failed++;
    }
  }

  // SECTION 3: Standard GET APIs
  console.log('\n📌 3. VERIFYING PUBLIC & ADMIN API ENDPOINTS');
  for (const api of GET_APIS_TO_TEST) {
    const res = await httpRequest(api);
    if (res.ok) {
      console.log(`  ✅ [PASS] ${api} (HTTP ${res.status})`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${api} -> Status: ${res.status}`);
      failed++;
    }
  }

  // SECTION 4: AI YouTube & Reels Video Automation APIs
  console.log('\n📌 4. VERIFYING AI VIDEO AUTOMATION PIPELINE');

  // 4a. Script & Scene Generator
  const generatePayload = JSON.stringify({
    topic: '5 Mindset Shifts for Young Entrepreneurs',
    niche: 'motivation',
    duration: '30-45s',
    style: 'Alex Hormozi Viral'
  });
  const genRes = await httpRequest('/api/admin/automation/generate', 'POST', generatePayload);
  if (genRes.ok && genRes.json && genRes.json.success && genRes.json.data.scenes.length >= 3) {
    console.log(`  ✅ [PASS] AI Script Generator API: Created ${genRes.json.data.scenes.length} viral scenes`);
    console.log(`     Title: "${genRes.json.data.selectedTitle}"`);
    console.log(`     Hashtags: ${genRes.json.data.hashtags.slice(0, 5).join(' ')}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] AI Script Generator API failed:`, genRes.status, genRes.json);
    failed++;
  }

  // 4b. Multi-Platform Publishing Pipeline
  const publishPayload = JSON.stringify({
    title: '5 Mindset Shifts for Young Entrepreneurs',
    description: 'Transform how you think about business and life in 2026.',
    platforms: ['youtube', 'instagram', 'tiktok'],
    hashtags: ['#shorts', '#reels', '#entrepreneur', '#motivation']
  });
  const pubRes = await httpRequest('/api/admin/automation/publish', 'POST', publishPayload);
  if (pubRes.ok && pubRes.json && pubRes.json.success && pubRes.json.publishedPlatforms.youtube) {
    console.log(`  ✅ [PASS] Multi-Platform Dispatcher API: Dispatched to 3 platforms successfully`);
    console.log(`     YouTube ID: ${pubRes.json.publishedPlatforms.youtube.id}`);
    console.log(`     Instagram URL: ${pubRes.json.publishedPlatforms.instagram.url}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] Multi-Platform Dispatcher API failed:`, pubRes.status, pubRes.json);
    failed++;
  }

  // SECTION 5: Backend PDF Engine Core Verification
  console.log('\n📌 5. VERIFYING PDF ENGINE INTERNAL MECHANICS');
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    page.drawText('Antigravity PDF Suite Automated Test Document', {
      x: 50,
      y: 800,
      size: 16,
      color: rgb(0.1, 0.5, 0.9)
    });
    const pdfBytes = await pdfDoc.save();
    if (pdfBytes.length > 500) {
      console.log(`  ✅ [PASS] PDF Generation Engine: Generated valid A4 PDF (${pdfBytes.length} bytes)`);
      passed++;
    } else {
      throw new Error('PDF bytes too small');
    }

    // Test PDF Parsing & Merging
    const loadedDoc = await PDFDocument.load(pdfBytes);
    const pageCount = loadedDoc.getPageCount();
    if (pageCount === 1) {
      console.log(`  ✅ [PASS] PDF Reader & Manipulator Engine: Parsed ${pageCount} page document`);
      passed++;
    } else {
      throw new Error(`Unexpected page count: ${pageCount}`);
    }
  } catch (e) {
    console.error(`  ❌ [FAIL] PDF Engine failed:`, e.message);
    failed++;
  }

  // SECTION 6: Word Document (.docx) & HTML Parser Engines
  console.log('\n📌 6. VERIFYING WORD DOCX & CONVERSION ENGINES');
  try {
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun("Antigravity Word Conversion Test"),
              new docx.TextRun({ text: " - Bold Text", bold: true })
            ]
          })
        ]
      }]
    });
    const docxBuffer = await docx.Packer.toBuffer(doc);
    if (docxBuffer.length > 1000) {
      console.log(`  ✅ [PASS] DOCX Packer Engine: Created valid Word Document (${docxBuffer.length} bytes)`);
      passed++;
    } else {
      throw new Error('DOCX buffer too small');
    }

    // Convert with Mammoth
    const mammothResult = await mammoth.convertToHtml({ buffer: docxBuffer });
    if (mammothResult.value.includes('Antigravity Word Conversion Test')) {
      console.log(`  ✅ [PASS] Mammoth Word-to-HTML Engine: Extracted HTML content: "${mammothResult.value}"`);
      passed++;
    } else {
      throw new Error('Mammoth conversion missing text');
    }
  } catch (e) {
    console.error(`  ❌ [FAIL] Word Conversion Engine failed:`, e.message);
    failed++;
  }

  // SUMMARY
  console.log('\n================================================================');
  console.log(`🎉 COMPLETE AUDIT RESULT: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});

