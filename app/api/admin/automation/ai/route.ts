import { NextRequest, NextResponse } from 'next/server';
import { guardSameOrigin } from '@/lib/studio-guard';
import { generateText } from '@/lib/llm';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Text generation for the AI Video Studio: Groq first, Gemini as backup (see lib/llm.ts).
export async function POST(req: NextRequest) {
  const denied = guardSameOrigin(req);
  if (denied) return denied;
  try {
    const { system, prompt } = await req.json();
    const r = await generateText({
      system: typeof system === 'string' ? system.slice(0, 4000) : undefined,
      prompt: String(prompt || '').slice(0, 30000),
    });
    return NextResponse.json({ success: true, text: r.text, provider: r.provider });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'AI failed' }, { status: 502 });
  }
}
