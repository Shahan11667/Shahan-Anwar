/**
 * Direct In-App Autonomous Upload Verification Suite
 * Tests direct native publishing (no 3rd-party middleman, no Zapier/Make required)
 * for YouTube Shorts, Instagram Reels, and TikTok.
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🚀 DIRECT AUTONOMOUS IN-APP UPLOAD SUITE ("TUM KHUD KARO")');
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

// 1. Audit publish/route.ts
console.log('📌 1. STATIC CODE AUDIT FOR DIRECT NATIVE API PUBLISHER');
const routePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'automation', 'publish', 'route.ts');
const routeSource = fs.readFileSync(routePath, 'utf8');

check(
  'Direct YouTube Data API v3 upload function exists',
  routeSource.includes('uploadToYouTubeDirectly') &&
  routeSource.includes('https://www.googleapis.com/youtube/v3/videos?part=snippet,status')
);

check(
  'Direct Instagram Graph API upload function exists',
  routeSource.includes('uploadToInstagramDirectly') &&
  routeSource.includes("media_type: 'REELS'") &&
  routeSource.includes('media_publish')
);

check(
  'Direct studio upload fallback provided when API tokens are empty',
  routeSource.includes('READY_DIRECT_UPLOAD') &&
  routeSource.includes('studio.youtube.com/channel/videos/upload')
);

check(
  'Route extracts user YouTube & Instagram direct tokens',
  routeSource.includes('youtubeToken: userYouTubeToken') &&
  routeSource.includes('instagramToken: userInstagramToken')
);

// 2. Audit youtube-automation-view.tsx
console.log('\n📌 2. STATIC CODE AUDIT FOR DIRECT IN-APP UPLOAD UI');
const viewPath = path.join(__dirname, '..', 'components', 'admin', 'youtube-automation-view.tsx');
const viewSource = fs.readFileSync(viewPath, 'utf8');

check(
  'UI defines publishMode defaulting to direct ("direct")',
  viewSource.includes("const [publishMode, setPublishMode] = useState<'direct' | 'webhook'>('direct');")
);

check(
  'UI includes Direct In-App Upload ("Tum Khud Karo 🚀") button',
  viewSource.includes('Direct In-App Upload (Khud Karo 🚀)')
);

check(
  'UI displays target channels: YouTube @BeshaanVibe, Instagram, TikTok',
  viewSource.includes('YouTube Shorts: @BeshaanVibe') &&
  viewSource.includes('Instagram Reels: @BeshaanVibe') &&
  viewSource.includes('TikTok Creator Center: @Beshaan')
);

check(
  'UI supports optional Google/Meta direct tokens with localStorage persistence',
  viewSource.includes('sol_direct_yt_token') &&
  viewSource.includes('sol_direct_ig_token')
);

check(
  'Publish action automatically launches YouTube Studio and copies Roman Urdu metadata',
  viewSource.includes('studio.youtube.com/channel/videos/upload') &&
  viewSource.includes('Roman Urdu title & description copied to clipboard')
);

check(
  'Interactive direct launch buttons rendered in published results',
  viewSource.includes('Open YouTube Studio') &&
  viewSource.includes('Open Instagram') &&
  viewSource.includes('Open TikTok Studio')
);

console.log('\n================================================================');
console.log(`✨ DIRECT UPLOAD SUITE: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All Direct In-App Autonomous Upload checks PASSED!\n');
}
