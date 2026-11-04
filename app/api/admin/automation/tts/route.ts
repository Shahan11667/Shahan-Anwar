import { getGeminiKey, getGroqKey } from '@/lib/llm';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { guardSameOrigin } from '@/lib/studio-guard';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function wav(pcm: Buffer, sampleRate: number): Buffer {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// Text-to-speech through Gemini (detects the language from the text, including Urdu/Hindi/English).
export async function POST(req: NextRequest) {
  const denied = guardSameOrigin(req);
  if (denied) return denied;
  const apiKey = getGeminiKey();
  const { text, voice } = await req.json().catch(() => ({} as any));
  const errors: string[] = [];
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: String(voice || 'Kore') } } },
      } as any,
    });
    const res = await model.generateContent(String(text || '').slice(0, 3000));
    const part: any = res.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (!part) throw new Error('No audio returned');
    const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType || '')?.[1]) || 24000;
    const file = wav(Buffer.from(part.inlineData.data, 'base64'), rate);
    return new NextResponse(new Uint8Array(file), { headers: { 'Content-Type': 'audio/wav' } });
  } catch (e: any) {
    errors.push(`Gemini: ${e?.message || 'failed'}`);
  }

  // Backup: Groq Orpheus (English voice). Needs the one-time terms acceptance in the Groq console.
  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getGroqKey()}` },
      body: JSON.stringify({ model: 'canopylabs/orpheus-v1-english', input: String(text || '').slice(0, 190), voice: 'hannah', response_format: 'wav' }),
    });
    if (res.ok) return new NextResponse(new Uint8Array(await res.arrayBuffer()), { headers: { 'Content-Type': 'audio/wav' } });
    const j: any = await res.json().catch(() => ({}));
    errors.push(`Groq: ${j?.error?.message || res.status}`);
  } catch (e: any) {
    errors.push(`Groq: ${e?.message}`);
  }
  return NextResponse.json({ success: false, error: errors.join(' | ') }, { status: 502 });
}
