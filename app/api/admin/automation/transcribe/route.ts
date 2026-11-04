import { NextRequest, NextResponse } from 'next/server';
import { guardSameOrigin } from '@/lib/studio-guard';
import { getGroqKey } from '@/lib/llm';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Speech to text with timestamps through Groq Whisper (free). Used by "Auto captions" in the Video Editor.
export async function POST(req: NextRequest) {
  const denied = guardSameOrigin(req);
  if (denied) return denied;
  const key = getGroqKey();
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) return NextResponse.json({ success: false, error: 'No audio file' }, { status: 400 });
    const out = new FormData();
    out.append('file', file, 'audio.wav');
    out.append('model', process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo');
    out.append('response_format', 'verbose_json');
    out.append('timestamp_granularities[]', 'segment');
    const lang = form.get('language');
    if (typeof lang === 'string' && lang) out.append('language', lang);
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: out,
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ success: false, error: j?.error?.message || `Groq ${res.status}` }, { status: 502 });
    const segments = (j.segments || []).map((s: any) => ({ start: s.start, end: s.end, text: String(s.text || '').trim() }));
    return NextResponse.json({ success: true, segments, text: j.text });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
