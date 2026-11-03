/**
 * Comprehensive Roman Urdu Voiceover & Video Pipeline Verification Suite
 * Tests Roman Urdu script synthesis, captions, voiceover phonetic markers,
 * multi-niche support, and fallback cascade for Beshaan & other channels.
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🇵🇰 ROMAN URDU VOICEOVER & AUTOMATION PIPELINE TEST SUITE');
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

// 1. Verify Route Implementation File
console.log('📌 1. STATIC CODE AUDIT FOR ROMAN URDU IN ROUTE HANDLER');
const routePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'automation', 'generate', 'route.ts');
const routeSource = fs.readFileSync(routePath, 'utf8');

check(
  'Route extracts language parameter defaulting to roman_urdu',
  routeSource.includes("language = 'roman_urdu'") && routeSource.includes("safeLanguage")
);

check(
  'Gemini Script prompt includes Roman Urdu voiceover instructions',
  routeSource.includes("Write ALL \"voiceoverText\" in high-energy, authentic, conversational ROMAN URDU")
);

check(
  'Beshaan procedural fallback includes authentic Roman Urdu dialogue',
  routeSource.includes("Arey yaar welcome back to Beshaan!") &&
  routeSource.includes("Rule number ek: do larkiyan, ek larka, aur zero filter!") &&
  routeSource.includes("Stay stylish, stay confident, keep gaming, aur keep smiling!")
);

check(
  'Beshaan procedural fallback includes Roman Urdu captions',
  routeSource.includes("ASLI TWIST DEKHO") &&
  routeSource.includes("VOTE IN COMMENTS") &&
  routeSource.includes("JOIN BESHAAN FAMILY")
);

check(
  'Wealth/Business niche has Roman Urdu voiceover fallback',
  routeSource.includes("Ziada tar log sochte hain ke mahine ke dus hazaar dollar kamanay") &&
  routeSource.includes("GHAR BETHE $10K")
);

check(
  'Dark Psychology niche has Roman Urdu voiceover fallback',
  routeSource.includes("High-status log kabhi jaldbaazi me jawab nahi dete") &&
  routeSource.includes("KHAMOSHI ME TAQAT")
);

check(
  'Stoicism niche has Roman Urdu voiceover fallback',
  routeSource.includes("Agar aap subah uthtay hi har do minute baad apna phone check karte ho") &&
  routeSource.includes("24-GHANTE RESET")
);

check(
  'AI & Tech niche has Roman Urdu voiceover fallback',
  routeSource.includes("Bhai scrolling band karo! 2026 me 90% developers scratch se coding nahi kar rahe") &&
  routeSource.includes("SCROLLING ROKO")
);

// 2. Verify YouTube Automation UI Component
console.log('\n📌 2. STATIC CODE AUDIT FOR YOUTUBE AUTOMATION VIEW');
const viewPath = path.join(__dirname, '..', 'components', 'admin', 'youtube-automation-view.tsx');
const viewSource = fs.readFileSync(viewPath, 'utf8');

check(
  'UI defines scriptLanguage state defaulting to roman_urdu',
  viewSource.includes("const [scriptLanguage, setScriptLanguage] = useState<'roman_urdu' | 'english' | 'urdu'>('roman_urdu');")
);

check(
  'UI includes Voiceover & Script Language Dropdown',
  viewSource.includes('Voiceover Language') &&
  viewSource.includes('value="roman_urdu"') &&
  viewSource.includes('Roman Urdu (رومن اردو - Voiceover)')
);

check(
  'UI includes Beshaan Trio in Niche dropdown selector',
  viewSource.includes('value="beshaan_trio"')
);

check(
  'Puter AI prompt enforces Roman Urdu when scriptLanguage is roman_urdu',
  viewSource.includes('Write ALL "voiceoverText" in high-energy, authentic, conversational ROMAN URDU')
);

check(
  'Speech synthesis playSceneVoiceover prioritizes South Asian / Desi TTS voices for Roman Urdu',
  viewSource.includes("scriptLanguage === 'roman_urdu'") &&
  viewSource.includes("v.lang.startsWith('ur')") &&
  viewSource.includes("v.lang.startsWith('hi')") &&
  viewSource.includes("v.lang === 'en-IN'")
);

check(
  'Scene cards display Roman Urdu voiceover badge and preview trigger',
  viewSource.includes("scriptLanguage === 'roman_urdu' ? 'Roman Urdu VO'") &&
  viewSource.includes("🇵🇰 Roman Urdu")
);

// 3. Verify Video Editor Studio Subtitle Burn-In
console.log('\n📌 3. STATIC CODE AUDIT FOR VIDEO EDITOR MASTER DELIVERY');
const studioPath = path.join(__dirname, '..', 'components', 'admin', 'video-editor-studio.tsx');
const studioSource = fs.readFileSync(studioPath, 'utf8');

check(
  'Video Editor includes Roman Urdu in Burn-In Subtitle selector',
  studioSource.includes('value="roman_urdu"') && studioSource.includes('Roman Urdu (رومن اردو)')
);

check(
  'Video Editor has Roman Urdu burned-in subtitles dictionary',
  studioSource.includes('ROMAN_URDU_TRANSCRIPT') &&
  studioSource.includes('Studio me aap sab ka welcome hai!')
);

check(
  'Canvas renderer applies Roman Urdu subtitles when selected',
  studioSource.includes("selectedLanguage === 'roman_urdu' && ROMAN_URDU_TRANSCRIPT[sentence.id]")
);

console.log('\n================================================================');
console.log(`✨ ROMAN URDU SUITE: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All 15 Roman Urdu Voiceover & Subtitle checks PASSED perfectly!\n');
}

