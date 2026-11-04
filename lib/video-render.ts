/**
 * Canvas-based video renderer used by both the live preview and the final export.
 * Runs entirely in the browser (canvas + MediaRecorder + Web Audio) so it works on Vercel
 * without any server-side ffmpeg.
 */

export type Transition = 'none' | 'fade' | 'slide' | 'zoom';
export type VideoFilter = 'none' | 'warm' | 'cool' | 'bw' | 'vignette';
export type Corner = 'tl' | 'tr' | 'bl' | 'br';

export interface RenderScene {
  img: HTMLImageElement | null;
  caption: string;
  duration: number;
  voice: AudioBuffer | null;
}

export interface RenderSettings {
  width: number;
  height: number;
  transition: Transition;
  motion: boolean;
  filter: VideoFilter;
  captions: { show: boolean; position: 'top' | 'middle' | 'bottom'; size: number; color: string };
  logo: { img: HTMLImageElement | null; position: Corner; size: number; opacity: number };
  voiceVolume: number;
  musicVolume: number;
}

const TRANSITION_TIME = 0.6;

export function totalDuration(scenes: RenderScene[]): number {
  return scenes.reduce((a, s) => a + s.duration, 0);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

const FILTERS: Record<VideoFilter, string> = {
  none: 'none',
  warm: 'sepia(0.35) saturate(1.3) contrast(1.05)',
  cool: 'hue-rotate(12deg) saturate(1.15) brightness(1.04)',
  bw: 'grayscale(1) contrast(1.1)',
  vignette: 'none',
};

function drawScene(ctx: CanvasRenderingContext2D, scene: RenderScene, local: number, idx: number, s: RenderSettings) {
  const W = s.width;
  const H = s.height;
  ctx.save();
  if (scene.img && scene.img.naturalWidth) {
    const progress = Math.min(1, Math.max(0, local / Math.max(0.1, scene.duration)));
    const zoom = s.motion ? (idx % 2 === 0 ? 1 + 0.12 * progress : 1.12 - 0.12 * progress) : 1;
    const iw = scene.img.naturalWidth;
    const ih = scene.img.naturalHeight;
    const cover = Math.max(W / iw, H / ih) * zoom;
    const dw = iw * cover;
    const dh = ih * cover;
    const panX = s.motion ? (idx % 3 === 1 ? (progress - 0.5) * 0.04 * W : 0) : 0;
    try {
      ctx.filter = FILTERS[s.filter];
    } catch {
      /* filter unsupported (older Safari) */
    }
    ctx.drawImage(scene.img, (W - dw) / 2 + panX, (H - dh) / 2, dw, dh);
    ctx.filter = 'none';
  } else {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1e293b');
    g.addColorStop(1, '#0f172a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#64748b';
    ctx.font = `${Math.round(W / 22)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`Scene ${idx + 1}: no image yet`, W / 2, H / 2);
  }
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawCaption(ctx: CanvasRenderingContext2D, text: string, s: RenderSettings) {
  if (!s.captions.show || !text.trim()) return;
  const W = s.width;
  const H = s.height;
  const px = Math.round((s.captions.size * W) / 720);
  ctx.save();
  ctx.font = `800 ${px}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapText(ctx, text, W * 0.86);
  const lh = px * 1.25;
  const blockH = lines.length * lh;
  const cy = s.captions.position === 'top' ? H * 0.14 : s.captions.position === 'middle' ? H * 0.5 : H * 0.82;
  const startY = cy - blockH / 2 + lh / 2;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, px / 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.9)';
  ctx.fillStyle = s.captions.color;
  lines.forEach((l, i) => {
    ctx.strokeText(l, W / 2, startY + i * lh);
    ctx.fillText(l, W / 2, startY + i * lh);
  });
  ctx.restore();
}

function drawLogo(ctx: CanvasRenderingContext2D, s: RenderSettings) {
  const logo = s.logo;
  if (!logo.img || !logo.img.naturalWidth) return;
  const w = (s.width * logo.size) / 100;
  const h = (w * logo.img.naturalHeight) / logo.img.naturalWidth;
  const m = s.width * 0.04;
  const x = logo.position === 'tl' || logo.position === 'bl' ? m : s.width - w - m;
  const y = logo.position === 'tl' || logo.position === 'tr' ? m : s.height - h - m;
  ctx.save();
  ctx.globalAlpha = logo.opacity;
  ctx.drawImage(logo.img, x, y, w, h);
  ctx.restore();
}

export function drawFrame(ctx: CanvasRenderingContext2D, scenes: RenderScene[], s: RenderSettings, tIn: number) {
  const W = s.width;
  const H = s.height;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (!scenes.length) return;
  const total = totalDuration(scenes);
  const t = Math.min(Math.max(0, tIn), Math.max(0, total - 0.001));

  let idx = 0;
  let start = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (t < start + scenes[i].duration || i === scenes.length - 1) {
      idx = i;
      break;
    }
    start += scenes[i].duration;
  }
  const local = t - start;
  const scene = scenes[idx];
  const tt = Math.min(TRANSITION_TIME, scene.duration / 2);

  if (idx > 0 && s.transition !== 'none' && local < tt) {
    const prev = scenes[idx - 1];
    drawScene(ctx, prev, prev.duration, idx - 1, s);
    const p = local / tt;
    ctx.save();
    if (s.transition === 'fade') {
      ctx.globalAlpha = p;
    } else if (s.transition === 'slide') {
      ctx.translate((1 - p) * W, 0);
    } else if (s.transition === 'zoom') {
      ctx.globalAlpha = p;
      const k = 1.3 - 0.3 * p;
      ctx.translate(W / 2, H / 2);
      ctx.scale(k, k);
      ctx.translate(-W / 2, -H / 2);
    }
    drawScene(ctx, scene, local, idx, s);
    ctx.restore();
  } else {
    drawScene(ctx, scene, local, idx, s);
  }

  if (s.filter === 'vignette') {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  drawCaption(ctx, scene.caption, s);
  drawLogo(ctx, s);
}

/**
 * Schedules voiceover + background music on `dest`, starting from timeline position `from` (seconds).
 * Returns a function that stops everything.
 */
export function scheduleAudio(
  ac: AudioContext,
  dest: AudioNode,
  scenes: RenderScene[],
  s: RenderSettings,
  music: AudioBuffer | null,
  from: number
): () => void {
  const nodes: AudioBufferSourceNode[] = [];
  const now = ac.currentTime + 0.05;
  let acc = 0;
  scenes.forEach((sc) => {
    const st = acc;
    const end = acc + sc.duration;
    acc = end;
    if (!sc.voice || end <= from) return;
    const offset = Math.max(0, from - st);
    if (offset >= sc.voice.duration) return;
    const src = ac.createBufferSource();
    src.buffer = sc.voice;
    const g = ac.createGain();
    g.gain.value = s.voiceVolume;
    src.connect(g);
    g.connect(dest);
    const when = now + Math.max(0, st - from);
    src.start(when, offset);
    src.stop(when + (end - Math.max(st, from)));
    nodes.push(src);
  });
  if (music) {
    const src = ac.createBufferSource();
    src.buffer = music;
    src.loop = true;
    const g = ac.createGain();
    g.gain.value = s.musicVolume;
    src.connect(g);
    g.connect(dest);
    src.start(now, from % music.duration);
    nodes.push(src);
  }
  return () => {
    nodes.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    });
  };
}

export function pickMime(): { mime: string; ext: string } {
  const options: Array<[string, string]> = [
    ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'mp4'],
    ['video/webm;codecs=vp9,opus', 'webm'],
    ['video/webm;codecs=vp8,opus', 'webm'],
    ['video/webm', 'webm'],
  ];
  for (let i = 0; i < options.length; i++) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(options[i][0])) {
      return { mime: options[i][0], ext: options[i][1] };
    }
  }
  return { mime: '', ext: 'webm' };
}

export function makeTicker(ms: number, cb: () => void): () => void {
  try {
    const url = URL.createObjectURL(new Blob([`setInterval(function(){postMessage(0)},${ms})`], { type: 'application/javascript' }));
    const w = new Worker(url);
    w.onmessage = () => cb();
    return () => {
      w.terminate();
      URL.revokeObjectURL(url);
    };
  } catch {
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  }
}

/** Renders the whole timeline in real time and returns the recorded file. */
export async function exportVideo(
  scenes: RenderScene[],
  s: RenderSettings,
  music: AudioBuffer | null,
  onProgress: (p: number) => void,
  signal: { cancelled: boolean }
): Promise<{ blob: Blob; ext: string }> {
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser cannot record video. Use Chrome, Edge or Firefox.');
  const canvas = document.createElement('canvas');
  canvas.width = s.width;
  canvas.height = s.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  const total = totalDuration(scenes);

  const stream = canvas.captureStream(30);
  const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ac = new AC();
  await ac.resume();
  const dest = ac.createMediaStreamDestination();
  dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));

  const { mime, ext } = pickMime();
  const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const finished = new Promise<void>((res) => {
    rec.onstop = () => res();
  });

  drawFrame(ctx, scenes, s, 0);
  rec.start(500);
  const stopAudio = scheduleAudio(ac, dest, scenes, s, music, 0);
  const t0 = performance.now();

  // A Web Worker timer is not throttled when the tab is in the background (setTimeout is, to 1 tick/sec).
  let wake: any = null;
  try {
    wake = await (navigator as any).wakeLock?.request('screen');
  } catch {
    /* wake lock is optional */
  }
  await new Promise<void>((resolve) => {
    const stopTicker = makeTicker(33, () => {
      const t = (performance.now() - t0) / 1000;
      if (signal.cancelled || t >= total + 0.25) {
        stopTicker();
        resolve();
        return;
      }
      drawFrame(ctx, scenes, s, Math.min(t, total));
      onProgress(Math.min(1, t / total));
    });
  });
  try {
    wake?.release();
  } catch {
    /* ignore */
  }

  stopAudio();
  rec.stop();
  await finished;
  ac.close().catch(() => undefined);
  if (signal.cancelled) throw new Error('Export cancelled');
  return { blob: new Blob(chunks, { type: (mime || 'video/webm').split(';')[0] }), ext };
}
