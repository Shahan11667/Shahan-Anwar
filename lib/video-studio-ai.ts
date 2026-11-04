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

/**
 * Generates an image. When reference images are given, they are sent to an image-editing capable model
 * so characters keep the same face / clothes / style. Falls back to text-only generation if unsupported.
 */
export async function generateImage(prompt: string, references: string[] = []): Promise<GeneratedImage> {
  const puter = await loadPuter();
  if (!puter?.ai?.txt2img) throw new Error('Puter image generation is not available. Sign in to Puter first.');
  let result: any = null;
  let usedReference = false;
  if (references.length) {
    try {
      const b64 = await referenceSheet(references);
      result = await puter.ai.txt2img(prompt, {
        model: 'gemini-2.5-flash-image-preview',
        input_image: b64,
        input_image_mime_type: 'image/jpeg',
      });
      usedReference = true;
    } catch (e) {
      console.warn('Reference-based generation failed, falling back to text-only:', e);
      result = null;
    }
  }
  if (!result) result = await puter.ai.txt2img(prompt);
  const src: string = typeof result === 'string' ? result : result?.src;
  if (!src) throw new Error('Image generation returned nothing');
  return { dataUrl: await toJpegDataUrl(src), usedReference };
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
