const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('⚡ PUTER.JS INTEGRATION VERIFICATION SUITE');
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

// 1. Verify lib/puter.ts
const puterLibPath = path.join(__dirname, '..', 'lib', 'puter.ts');
check('lib/puter.ts exists', fs.existsSync(puterLibPath));

const puterLibContent = fs.readFileSync(puterLibPath, 'utf8');
check('lib/puter.ts exports loadPuter()', puterLibContent.includes('export function loadPuter()'));
check('lib/puter.ts exports puterChat()', puterLibContent.includes('export async function puterChat('));
check('lib/puter.ts exports puterSignIn()', puterLibContent.includes('export async function puterSignIn('));
check('lib/puter.ts exports POPULAR_PUTER_MODELS', puterLibContent.includes('export const POPULAR_PUTER_MODELS'));
check('Includes OpenAI GPT-4o', puterLibContent.includes("'openai/gpt-4o'"));
check('Includes Claude 3.5 Sonnet', puterLibContent.includes("'anthropic/claude-3-5-sonnet'"));
check('Includes DeepSeek V3', puterLibContent.includes("'deepseek/deepseek-chat'"));
check('Includes Gemini 1.5 Flash', puterLibContent.includes("'google/gemini-1.5-flash'"));

// 2. Verify components/puter-auth-badge.tsx
const badgePath = path.join(__dirname, '..', 'components', 'puter-auth-badge.tsx');
check('components/puter-auth-badge.tsx exists', fs.existsSync(badgePath));
const badgeContent = fs.readFileSync(badgePath, 'utf8');
check('Badge includes model dropdown', badgeContent.includes('POPULAR_PUTER_MODELS.map'));
check('Badge handles signIn/signOut', badgeContent.includes('puterSignIn') && badgeContent.includes('puterSignOut'));

// 3. Verify app/layout.tsx
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');
check('app/layout.tsx injects Puter CDN script', layoutContent.includes('https://js.puter.com/v2/'));

// 4. Verify YouTube Automation integration
const ytPath = path.join(__dirname, '..', 'components', 'admin', 'youtube-automation-view.tsx');
const ytContent = fs.readFileSync(ytPath, 'utf8');
check('YouTube Automation imports Puter', ytContent.includes('@/lib/puter') && ytContent.includes('PuterAuthBadge'));
check('YouTube Automation uses Puter for topic discovery', ytContent.includes('puterChatWithDetails') || ytContent.includes('puterChat'));
check('YouTube Automation renders PuterAuthBadge', ytContent.includes('<PuterAuthBadge'));

// 5. Verify PDF Intelligence Tool integration
const pdfPath = path.join(__dirname, '..', 'components', 'tools', 'pdf-intelligence-tool.tsx');
const pdfContent = fs.readFileSync(pdfPath, 'utf8');
check('PDF Intelligence imports Puter', pdfContent.includes('@/lib/puter') && pdfContent.includes('PuterAuthBadge'));
check('PDF Intelligence summarizes with Puter', pdfContent.includes('puterChatWithDetails') || pdfContent.includes('puterChat'));
check('PDF Intelligence renders PuterAuthBadge', pdfContent.includes('<PuterAuthBadge'));

// 6. Verify Video Editor Studio integration
const studioPath = path.join(__dirname, '..', 'components', 'admin', 'video-editor-studio.tsx');
const studioContent = fs.readFileSync(studioPath, 'utf8');
check('Video Editor Studio renders PuterAuthBadge', studioContent.includes('<PuterAuthBadge compact />'));

console.log('\n================================================================');
console.log(`⚡ PUTER.JS INTEGRATION AUDIT: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}

