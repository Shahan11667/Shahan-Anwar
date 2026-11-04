import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { guardStudio } from '@/lib/studio-guard';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Image generation with reference images (keeps characters consistent) through Gemini.
// Needs GEMINI_API_KEY. If Gemini is unavailable the browser falls back to a free generator.
export async function POST(req: NextRequest) {
  const denied = guardStudio(req);
  if (denied) return denied;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ success: false, error: 'GEMINI_API_KEY not set' }, { status: 501 });
  try {
    const { prompt, references } = await req.json();
    const parts: any[] = [{ text: String(prompt || '').slice(0, 4000) }];
    (Array.isArray(references) ? references : []).slice(0, 4).forEach((d: string) => {
      const m = /^data:(.+?);base64,(.+)$/.exec(d || '');
      if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    });
    const genAI = new GoogleGenerativeAI(apiKey);
    const names = (process.env.GEMINI_IMAGE_MODEL ? [process.env.GEMINI_IMAGE_MODEL] : []).concat(['gemini-2.5-flash-image', 'gemini-2.0-flash-preview-image-generation']);
    let lastErr = '';
    for (const name of names) {
      try {
        const model = genAI.getGenerativeModel({ model: name, generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } as any });
        const res = await model.generateContent(parts);
        const out = res.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
        if (out?.inlineData) {
          return NextResponse.json({ success: true, dataUrl: `data:${out.inlineData.mimeType || 'image/png'};base64,${out.inlineData.data}` });
        }
        lastErr = 'Model returned no image';
      } catch (e: any) {
        lastErr = e?.message || String(e);
      }
    }
    return NextResponse.json({ success: false, error: lastErr || 'Image generation failed' }, { status: 502 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
