const http = require('http');

console.log('================================================================');
console.log('✨ BESHAAN CHANNEL (@BeshaanVibe) AUTOMATION VERIFICATION SUITE');
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

function makeRequest(urlPath, method, postData) {
  return new Promise((resolve) => {
    const dataStr = JSON.stringify(postData);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: urlPath,
      method: method,
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

async function runBeshaanTests() {
  // 1. Topic Discovery for Beshaan Trio
  console.log('📌 1. VERIFYING BESHAAN TOPIC DISCOVERY');
  const res1 = await makeRequest('/api/admin/automation/generate', 'POST', {
    action: 'generate_topics',
    niche: 'beshaan_trio',
    channelName: 'Beshaan',
    channelTone: 'Energetic Trio Banter, Trendy Fashion Styling & Gaming Hype',
    count: 8
  });

  check(
    'Topic Generator responds with HTTP 200',
    res1.status === 200 && res1.json?.success === true
  );
  check(
    'Generates 8 Beshaan topics',
    res1.json?.topics?.length === 8,
    `Received ${res1.json?.topics?.length} topics`
  );

  const sampleTitles = res1.json?.topics?.map(t => t.title).join(' | ');
  check(
    'Topics include Fashion, Lifestyle, and Gaming pillars',
    sampleTitles.includes('Outfit') || sampleTitles.includes('Gaming') || sampleTitles.includes('Shopping'),
    `Sample: ${res1.json?.topics?.[0]?.title}`
  );

  // 2. 5-Scene Storyboard for Beshaan
  console.log('\n📌 2. VERIFYING 5-SCENE BESHAAN VIRAL STORYBOARD');
  const res2 = await makeRequest('/api/admin/automation/generate', 'POST', {
    action: 'generate_script',
    niche: 'beshaan_trio',
    customPrompt: 'We Styled 1 Outfit 3 Different Ways! (Boys vs Girls Challenge)',
    channelName: 'Beshaan',
    channelTone: 'Energetic Trio Banter, Trendy Fashion Styling & Gaming Hype',
    targetFormat: 'shorts_9_16',
    duration: 35
  });

  check(
    'Script Generator responds with HTTP 200',
    res2.status === 200 && res2.json?.success === true
  );

  const data = res2.json?.data;
  check(
    'Generated exactly 5 scenes',
    data?.scenes?.length === 5,
    `Received ${data?.scenes?.length} scenes`
  );

  const scene1 = data?.scenes?.[0];
  check(
    'Scene 1 has Beshaan Trio Hook',
    scene1?.voiceoverText?.includes('Beshaan') && scene1?.onScreenCaption?.includes('BESHAAN'),
    `Caption: "${scene1?.onScreenCaption}"`
  );

  const scene5 = data?.scenes?.[4];
  check(
    'Scene 5 includes signature Beshaan signoff',
    scene5?.voiceoverText?.includes('Stay stylish') || scene5?.voiceoverText?.includes('Beshaan Family'),
    `Voiceover: "${scene5?.voiceoverText?.slice(0, 70)}..."`
  );

  check(
    'Hashtags include #Beshaan and #BeshaanVibe',
    data?.hashtags?.includes('#Beshaan') && data?.hashtags?.includes('#BeshaanVibe')
  );

  check(
    'Thumbnail concept has vibrant pink/rose styling',
    data?.thumbnailConcept?.bgColor === '#ec4899' && data?.thumbnailConcept?.mainHeadline === 'BOYS VS GIRLS'
  );

  // 3. Multi-Platform Publishing for Beshaan
  console.log('\n📌 3. VERIFYING MULTI-PLATFORM DISPATCH');
  const res3 = await makeRequest('/api/admin/automation/publish', 'POST', {
    platforms: ['youtube', 'instagram', 'tiktok'],
    title: data?.selectedTitle || 'We Styled 1 Outfit 3 Different Ways! (Boys vs Girls Edition) 🎀',
    description: data?.description || 'Beshaan Trio Video',
    hashtags: data?.hashtags || ['#Beshaan', '#BeshaanVibe']
  });

  check(
    'Publisher dispatches Beshaan payload successfully',
    res3.status === 200 && res3.json?.publishedPlatforms?.youtube && res3.json?.publishedPlatforms?.instagram
  );

  console.log('\n================================================================');
  console.log(`✨ BESHAAN INTEGRATION AUDIT: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runBeshaanTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

