const urls = [
  'http://localhost:3000/tools',
  'http://localhost:3000/tools/jpg-to-pdf',
  'http://localhost:3000/tools/pdf-to-jpg',
  'http://localhost:3000/tools/merge-pdf',
  'http://localhost:3000/tools/split-pdf',
  'http://localhost:3000/tools/image-compressor',
  'http://localhost:3000/tools/image-resizer',
  'http://localhost:3000/tools/jpg-to-png',
  'http://localhost:3000/tools/word-counter',
  'http://localhost:3000/tools/case-converter',
  'http://localhost:3000/tools/json-formatter',
  'http://localhost:3000/tools/base64-tool',
  'http://localhost:3000/tools/image-to-text',
  'http://localhost:3000/tools/pdf-to-text',
  'http://localhost:3000/tools/voice-message-to-text',
  'http://localhost:3000/sitemap.xml'
];

async function run() {
  console.log('Testing all tool routes...\n');
  let allPass = true;

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const hasContent = text.length > 200;
      if (res.status === 200 && hasContent) {
        console.log(`✅ [200 OK] ${url} (${text.length} bytes)`);
      } else {
        console.log(`❌ [HTTP ${res.status}] ${url}`);
        allPass = false;
      }
    } catch (err) {
      console.log(`❌ [ERROR] ${url}: ${err.message}`);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\n🎉 ALL 16 ROUTES SERVING 200 OK WITH RICH CONTENT!');
  } else {
    console.log('\n⚠️ Some routes failed.');
    process.exit(1);
  }
}

run();
