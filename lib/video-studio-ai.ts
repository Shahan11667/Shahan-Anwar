/**
 * AI + file helpers for the AI Video Studio. Reuses the existing Puter.js integration (lib/puter.ts).
 */
import { loadPuter } from '@/lib/puter';

export function extractJson<T = any>(text: string): T {
  const cleaned = text.replace(/```json|```/gi, '');
  const a = cleaned.indexOf('{');
  const b = cleaned.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('AI did not return JSON. Please try again.');
  return JSON.parse(cleaned.slice(a, b + 1));
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read file'));
    r.readAsDataURL(file);
  });
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

/** Downscales any image source to a JPEG data URL (max side `max`). */
export async function toJpegDataUrl(src: string, max = 1280): Promise<string> {
  const img = await loadImg(src);
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.92);
}

/** Puts several reference images side by side into one "character sheet" and returns raw base64 JPEG. */
async function referenceSheet(dataUrls: string[]): Promise<string> {
  const imgs = await Promise.all(dataUrls.map(loadImg));
  const h = 640;
  const widths = imgs.map((i) => Math.round((i.naturalWidth * h) / i.naturalHeight));
  const c = document.createElement('canvas');
  c.width = widths.reduce((a, b) => a + b, 0);
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  let x = 0;
  imgs.forEach((im, i) => {
    ctx.drawImage(im, x, 0, widths[i], h);
    x += widths[i];
  });
  return c.toDataURL('image/jpeg', 0.9).split(',')[1];
}

export interface GeneratedImage {
  dataUrl: string;
  usedReference: boolean;
}

export type ImageAspect = 'vertical' | 'horizontal' | 'square';

/** Set by the studio so every image uses the project's format and a stable seed (same look between scenes). */
export const imageDefaults: { aspect: ImageAspect; seed: number } = { aspect: 'vertical', seed: 7 };

const SIZES: Record<ImageAspect, [number, number]> = { vertical: [720, 1280], horizontal: [1280, 720], square: [1024, 1024] };

function studioKey(): string {
  try {
    return sessionStorage.getItem('studioKey') || '';
  } catch {
    return '';
  }
}

/**
 * Generates an image. Tries, in order:
 *  1. Gemini on the server (accepts reference images, best character consistency). Needs GEMINI_API_KEY + studio password.
 *  2. Pollinations (free, no key, text only).
 *  3. Puter (may require a paid plan).
 */
export async function generateImage(prompt: string, references: string[] = [], opts: { aspect?: ImageAspect; seed?: number } = {}): Promise<GeneratedImage> {
  const aspect = opts.aspect || imageDefaults.aspect;
  const seed = opts.seed ?? imageDefaults.seed;
  const errors: string[] = [];

  // 1. Gemini via our server route (reference images supported)
  if (studioKey()) {
    try {
      const res = await fetch('/api/admin/automation/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-studio-key': studioKey() },
        body: JSON.stringify({ prompt: `${prompt}
Aspect ratio: ${aspect === 'vertical' ? '9:16 vertical' : aspect === 'horizontal' ? '16:9 horizontal' : '1:1'}.`, references }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success && j.dataUrl) return { dataUrl: await toJpegDataUrl(j.dataUrl), usedReference: references.length > 0 };
      errors.push(`Gemini: ${j.error || res.status}`);
    } catch (e: any) {
      errors.push(`Gemini: ${e?.message}`);
    }
  }

  // 2. Pollinations (free)
  try {
    const [w, h] = SIZES[aspect];
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 1400))}?width=${w}&height=${h}&model=flux&nologo=true&private=true&seed=${seed}`;
    return { dataUrl: await toJpegDataUrl(url), usedReference: false };
  } catch (e: any) {
    errors.push(`Pollinations: ${e?.message}`);
  }

  // 3. Puter
  try {
    const puter = await loadPuter();
    if (!puter?.ai?.txt2img) throw new Error('not available');
    let result: any = null;
    let usedReference = false;
    if (references.length) {
      try {
        result = await puter.ai.txt2img(prompt, { model: 'gemini-2.5-flash-image-preview', input_image: await referenceSheet(references), input_image_mime_type: 'image/jpeg' });
        usedReference = true;
      } catch {
        result = null;
      }
    }
    if (!result) result = await puter.ai.txt2img(prompt);
    const src: string = typeof result === 'string' ? result : result?.src;
    if (!src) throw new Error('nothing returned');
    return { dataUrl: await toJpegDataUrl(src), usedReference };
  } catch (e: any) {
    errors.push(`Puter: ${e?.message || 'failed'}`);
  }
  throw new Error(`Image generation failed. ${errors.join(' | ')}`);
}

/** Text-to-speech through Puter. Returns an audio Blob. */
export async function generateSpeech(text: string, language: string): Promise<Blob> {
  const puter = await loadPuter();
  if (!puter?.ai?.txt2speech) throw new Error('Puter text-to-speech is not available. Sign in to Puter first.');
  const audio: HTMLAudioElement = await puter.ai.txt2speech(text, { language });
  const res = await fetch(audio.src);
  return res.blob();
}

export async function decodeAudio(ac: AudioContext, blob: Blob): Promise<AudioBuffer> {
  const buf = await blob.arrayBuffer();
  return ac.decodeAudioData(buf);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
