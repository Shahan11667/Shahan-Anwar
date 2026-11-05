/**
 * AI + file helpers for the AI Video Studio and the Video Editor.
 */

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

/** Text-to-speech. Gemini on the server first (any language), Groq Orpheus as the backup (server side). */
export async function generateSpeech(text: string, language: string): Promise<Blob> {
  const errors: string[] = [];
  {
    try {
      const res = await fetch('/api/admin/automation/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      if (res.ok) return await res.blob();
      const j = await res.json().catch(() => ({}));
      errors.push(`Gemini: ${j.error || res.status}`);
    } catch (e: any) {
      errors.push(`Gemini: ${e?.message}`);
    }
  }
  throw new Error(`Voice generation failed. ${errors.join(' | ')}`);
}

/** Text generation through the server (Groq first, Gemini as backup: see lib/llm.ts). */
export async function aiText(system: string, user: string): Promise<string> {
  const errors: string[] = [];
  {
    try {
      const res = await fetch('/api/admin/automation/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, prompt: user }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success && j.text) return j.text as string;
      errors.push(`AI: ${j.error || res.status}`);
    } catch (e: any) {
      errors.push(`AI: ${e?.message}`);
    }
  }
  throw new Error(`AI text failed. ${errors.join(' | ')}`);
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
