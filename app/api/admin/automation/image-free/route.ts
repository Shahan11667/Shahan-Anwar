import { NextRequest, NextResponse } from 'next/server';
import { guardSameOrigin } from '@/lib/studio-guard';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Free image generation through Pollinations, fetched from the SERVER. Pollinations asks browsers (requests that carry
// an Origin/Referer) for a Turnstile captcha, but plain server requests are accepted.
export async function POST(req: NextRequest) {
  const denied = guardSameOrigin(req);
  if (denied) return denied;
  try {
    const { prompt, width, height, seed } = await req.json();
    const w = Math.min(1536, Math.max(256, Number(width) || 720));
    const h = Math.min(1536, Math.max(256, Number(height) || 1280));
    const text = encodeURIComponent(String(prompt || '').slice(0, 1200));
    const s = Number.isFinite(Number(seed)) ? Number(seed) : Math.floor(Math.random() * 1e6);
    const attempts = ['flux', 'flux', 'turbo', ''];
    const started = Date.now();
    let lastErr = '';
    for (let i = 0; i < attempts.length && Date.now() - started < 48000; i++) {
      const model = attempts[i];
      const url = `https://image.pollinations.ai/prompt/${text}?width=${w}&height=${h}${model ? `&model=${model}` : ''}&nologo=true&private=true&seed=${s + i}`;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
        const type = res.headers.get('content-type') || '';
        if (res.ok && type.startsWith('image/')) {
          const buf = Buffer.from(await res.arrayBuffer());
          return NextResponse.json({ success: true, dataUrl: `data:${type};base64,${buf.toString('base64')}` });
        }
        lastErr = `${res.status} ${(await res.text().catch(() => '')).slice(0, 120)}`;
      } catch (e: any) {
        lastErr = e?.message || 'failed';
      }
      await new Promise((r) => setTimeout(r, 2500));
    }
    return NextResponse.json({ success: false, error: `Pollinations: ${lastErr}` }, { status: 502 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
