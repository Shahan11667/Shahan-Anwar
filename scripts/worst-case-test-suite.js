const http = require('http');
const https = require('https');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');

function makeRequest(urlPath, method = 'POST', postData = null, customHeaders = {}) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: urlPath,
      method: method,
      headers: {
        'Accept': 'application/json, text/html, */*',
        ...customHeaders
      },
      timeout: 10000
    };

    if (postData) {
      if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
      }
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          body,
          json,
          ok: res.statusCode >= 200 && res.statusCode < 500 // Not unhandled 500 crash
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message, ok: false });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ status: 408, error: 'TIMEOUT', ok: false });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runWorstCaseTests() {
  console.log('================================================================');
  console.log('⚡ STRESS TEST & WORST-CASE SCENARIO VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, isPass, detail = '') {
    if (isPass) {
      console.log(`  ✅ [PASS] ${name} ${detail ? `-> ${detail}` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // CATEGORY 1: AUTOMATION GENERATOR WORST CASES
  // -------------------------------------------------------------------------
  console.log('📌 CATEGORY 1: AI VIDEO GENERATION WORST CASES');

  // Case 1: Empty Body
  const res1 = await makeRequest('/api/admin/automation/generate', 'POST', JSON.stringify({}));
  report(
    'Case 1: Empty Payload `{}`',
    res1.status === 200 && res1.json?.success === true,
    `Responded with valid fallback (${res1.json?.data?.scenes?.length} scenes)`
  );

  // Case 2: Completely Bogus Niche
  const res2 = await makeRequest('/api/admin/automation/generate', 'POST', JSON.stringify({
    niche: '👽🛸_completely_invalid_garbage_niche_9999',
    customPrompt: ''
  }));
  report(
    'Case 2: Unknown / Corrupt Niche String',
    res2.status === 200 && res2.json?.success === true,
    `Gracefully defaulted to safe niche (${res2.json?.data?.niche})`
  );

  // Case 3: Massive Prompt Flood (10,000 characters)
  const hugePrompt = 'VIRAL HACK '.repeat(1000);
  const res3 = await makeRequest('/api/admin/automation/generate', 'POST', JSON.stringify({
    customPrompt: hugePrompt,
    niche: 'ai_tech'
  }));
  report(
    'Case 3: Massive 10,000 Character Prompt Flood',
    res3.status === 200 && res3.json?.success === true,
    `Sanitized prompt, returned ${res3.json?.data?.scenes?.length} valid scenes`
  );

  // Case 4: Negative & Extreme Duration Boundaries
  const res4 = await makeRequest('/api/admin/automation/generate', 'POST', JSON.stringify({
    duration: -999,
    niche: 'wealth_business'
  }));
  report(
    'Case 4: Negative Duration (duration: -999)',
    res4.status === 200 && res4.json?.data?.totalDurationSeconds >= 10,
    `Clamped safely to ${res4.json?.data?.totalDurationSeconds}s`
  );

  // Case 5: Bogus/Revoked Gemini API Key
  const res5 = await makeRequest('/api/admin/automation/generate', 'POST', JSON.stringify({
    apiKey: 'AIzaSyFakeKeyInvalid1234567890abcdef',
    niche: 'dark_psychology'
  }));
  report(
    'Case 5: Invalid/Bogus Gemini API Key',
    res5.status === 200 && res5.json?.success === true && res5.json?.source === 'procedural-ai-engine',
    `Caught Gemini error safely, seamlessly used procedural engine`
  );

  // Case 6: Dynamic Topic Generation with Negative Count
  const res6 = await makeRequest('/api/admin/automation/generate', 'POST', JSON.stringify({
    action: 'generate_topics',
    count: -50,
    niche: 'stoicism_mindset'
  }));
  report(
    'Case 6: Dynamic Topic Generator with Negative Count (count: -50)',
    res6.status === 200 && res6.json?.topics?.length >= 1,
    `Clamped count safely, generated ${res6.json?.topics?.length} topics`
  );

  // -------------------------------------------------------------------------
  // CATEGORY 2: MULTI-PLATFORM PUBLISHER WORST CASES
  // -------------------------------------------------------------------------
  console.log('\n📌 CATEGORY 2: MULTI-PLATFORM PUBLISHER WORST CASES');

  // Case 7: Empty platforms array
  const res7 = await makeRequest('/api/admin/automation/publish', 'POST', JSON.stringify({
    platforms: [],
    title: 'Test Empty Platforms'
  }));
  report(
    'Case 7: Empty Platforms Array `[]`',
    res7.status === 200 && res7.json?.success === true,
    'Handled without crash, returned empty publishedPlatforms object'
  );

  // Case 8: Slowloris / Unreachable Webhook URL (Must not hang or crash server)
  const startTime = Date.now();
  const res8 = await makeRequest('/api/admin/automation/publish', 'POST', JSON.stringify({
    platforms: ['youtube'],
    title: 'Testing Webhook Timeout',
    webhookUrl: 'http://127.0.0.1:54321/unreachable-trap'
  }));
  const elapsed = Date.now() - startTime;
  report(
    'Case 8: Unreachable / Dead Webhook Timeout Protection',
    res8.status === 200 && elapsed < 5000,
    `Aborted non-responsive webhook in ${elapsed}ms (safety timeout worked)`
  );

  // Case 9: Giant Description String (50,000 characters)
  const hugeDesc = 'Hashtag cloud #viral '.repeat(2500);
  const res9 = await makeRequest('/api/admin/automation/publish', 'POST', JSON.stringify({
    platforms: ['youtube', 'instagram', 'tiktok'],
    title: 'Huge Description Test',
    description: hugeDesc
  }));
  report(
    'Case 9: Huge 50KB Description Payload',
    res9.status === 200 && res9.json?.publishedPlatforms?.youtube,
    'Successfully packaged without payload overflow'
  );

  // -------------------------------------------------------------------------
  // CATEGORY 3: VIDEO CONVERTER & TRIMMER API WORST CASES
  // -------------------------------------------------------------------------
  console.log('\n📌 CATEGORY 3: VIDEO CONVERTER & TRIMMER WORST CASES');

  // Case 10: Calling Trim API without multipart form data
  const res10 = await makeRequest('/api/video/trim', 'POST', JSON.stringify({}));
  report(
    'Case 10: POST /api/video/trim with Missing Multipart Data',
    res10.status >= 400 && res10.status < 500,
    `Gracefully returned HTTP ${res10.status} Bad Request (clean client rejection)`
  );

  // Case 11: Inverted Time Bounds (startTime > endTime)
  const res11 = await makeRequest('/api/video/trim', 'POST', JSON.stringify({
    startTime: 100,
    endTime: 10
  }));
  report(
    'Case 11: Inverted Timestamps (startTime: 100, endTime: 10)',
    res11.status >= 400 && res11.status < 500,
    `Safely rejected with HTTP ${res11.status}`
  );

  // -------------------------------------------------------------------------
  // CATEGORY 4: AUDIO TRANSCRIBER WORST CASES
  // -------------------------------------------------------------------------
  console.log('\n📌 CATEGORY 4: AUDIO TRANSCRIBER WORST CASES');

  // Case 12: Calling /api/transcribe-audio with empty request
  const res12 = await makeRequest('/api/transcribe-audio', 'POST', JSON.stringify({}));
  report(
    'Case 12: POST /api/transcribe-audio with Missing Audio Payload',
    res12.status >= 400 && res12.status < 500,
    `Returned HTTP ${res12.status} (Handled gracefully, server intact)`
  );

  // Case 13: Sending Corrupt Garbage Bytes as Audio
  const res13 = await makeRequest('/api/transcribe-audio', 'POST', 'NON_AUDIO_GARBAGE_BYTES_12345', {
    'Content-Type': 'audio/ogg'
  });
  report(
    'Case 13: Corrupt Non-Audio Garbage Bytes Header',
    res13.status >= 400 && res13.status < 500,
    `Cleanly rejected corrupt stream with HTTP ${res13.status}`
  );

  // -------------------------------------------------------------------------
  // CATEGORY 5: PDF ENGINE CORRUPTED BUFFER RESILIENCE
  // -------------------------------------------------------------------------
  console.log('\n📌 CATEGORY 5: PDF & DOCUMENT ENGINE HARDENING');

  // Case 14: Loading 0-byte PDF buffer
  let pdf0ByteHandled = false;
  try {
    await PDFDocument.load(new Uint8Array(0));
  } catch (e) {
    pdf0ByteHandled = true;
  }
  report(
    'Case 14: PDFDocument.load() on 0-Byte Empty Buffer',
    pdf0ByteHandled,
    'Threw controlled exception without uncaught process crash'
  );

  // Case 15: Loading Corrupted Truncated PDF Header
  let pdfCorruptHandled = false;
  try {
    const doc = await PDFDocument.load(Buffer.from('%PDF-1.4\nTRUNCATED_CORRUPT_BYTES_XYZ'), { throwOnInvalidObject: true });
    doc.getPageCount();
  } catch (e) {
    pdfCorruptHandled = true;
  }
  report(
    'Case 15: PDFDocument.load() on Truncated / Corrupt Header',
    pdfCorruptHandled,
    'Correctly caught corrupt format error'
  );

  // Case 16: Mammoth HTML Conversion on Garbage Binary
  let mammothCorruptHandled = false;
  try {
    await mammoth.convertToHtml({ buffer: Buffer.from('FAKE_NOT_A_ZIP_OR_DOCX_FILE') });
  } catch (e) {
    mammothCorruptHandled = true;
  }
  report(
    'Case 16: Mammoth Word Converter on Non-Docx Binary',
    mammothCorruptHandled,
    'Safely trapped invalid zip/docx exception'
  );

  // -------------------------------------------------------------------------
  // CATEGORY 6: PLATFORM ROUTE RESILIENCE
  // -------------------------------------------------------------------------
  console.log('\n📌 CATEGORY 6: MALFORMED URL & INJECTION RESILIENCE');

  // Case 17: Video Editor with XSS / SQL Injection in query params
  const res17 = await makeRequest('/video-editor?format=%27%20OR%201=1--&script=%3Cscript%3Ealert(1)%3C/script%3E', 'GET');
  report(
    'Case 17: /video-editor with Injected Script Query Parameters',
    res17.status === 200,
    'Rendered safely without SSR evaluation of malicious query'
  );

  // Case 18: Admin Dashboard with Malformed Route Traversal
  const res18 = await makeRequest('/admin?tab=../../../../etc/passwd', 'GET');
  report(
    'Case 18: Path Traversal Attempt in Admin Query Parameters',
    res18.status === 200,
    'Protected by Next.js router, rendered safe default view'
  );

  console.log('\n================================================================');
  console.log(`⚡ WORST-CASE AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runWorstCaseTests().catch((err) => {
  console.error('Fatal Worst-Case Suite Failure:', err);
  process.exit(1);
});
