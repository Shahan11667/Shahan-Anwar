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
    const { system, prompt, story } = await req.json();
    const r = await generateText({
      system: typeof system === 'string' ? system.slice(0, 4000) : undefined,
      prompt: String(prompt || '').slice(0, 30000),
      // story mode: more careful (lower temperature, more thinking) so the story is logical and the lines do not repeat
      ...(story === true ? { temperature: 0.8, reasoning: 'medium' as const, timeoutMs: 30_000, prefer: 'gemini' as const } : {}),
    });
    return NextResponse.json({ success: true, text: r.text, provider: r.provider });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'AI failed' }, { status: 502 });
  }
}
