'use client';

/**
 * Video Editor: a CapCut-style multi-track editor that runs fully in the browser.
 * Preview = canvas + <video>/<audio> elements. Export = the same playback recorded with MediaRecorder.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Scissors,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Upload,
  Download,
  Plus,
  Music,
  Type,
  Smile,
  Sparkles,
  Film,
  Mic,
  Square,
  Loader2,
  Volume2,
  Layers,
  RotateCcw,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { makeTicker, pickMime } from '@/lib/video-render';
import { generateSpeech } from '@/lib/video-studio-ai';
import { loadPuter } from '@/lib/puter';
import { getStudioProject } from '@/components/admin/youtube-automation-view';

/* ------------------------------------------------------------------ types */

type Kind = 'video' | 'image' | 'audio' | 'text';
type TrackId = 'text' | 'overlay' | 'main' | 'audio' | 'music';
type TransType = 'none' | 'fade' | 'slide' | 'zoom' | 'wipe';
type TextAnim = 'none' | 'fade' | 'pop' | 'slideup' | 'typewriter';

interface Media {
  id: string;
  kind: Exclude<Kind, 'text'>;
  name: string;
  src: string;
  dur: number; // seconds (0 for images)
  thumb?: string;
}

interface Keyframe {
  t: number; // seconds from the clip start
  x: number;
  y: number;
  scale: number;
  rot: number;
  opacity: number;
}

interface Clip {
  id: string;
  kind: Kind;
  track: TrackId;
  name: string;
  src: string;
  thumb?: string;
  start: number;
  dur: number;
  inPt: number;
  srcDur: number;
  speed: number;
  vol: number;
  muted: boolean;
  fadeIn: number;
  fadeOut: number;
  x: number;
  y: number;
  scale: number;
  rot: number;
  opacity: number;
  flip: boolean;
  fit: 'cover' | 'contain';
  preset: string;
  brightness: number;
  contrast: number;
  saturate: number;
  blur: number;
  trans: { type: TransType; dur: number };
  kf: Keyframe[];
  chroma: { on: boolean; color: string; tol: number };
  text: string;
  font: string;
  size: number;
  color: string;
  stroke: string;
  bg: string;
  bold: boolean;
  anim: TextAnim;
}

interface Settings {
  aspect: '9:16' | '16:9' | '1:1' | '4:5';
  res: 720 | 1080;
  bgColor: string;
}

interface Project {
  media: Media[];
  clips: Clip[];
  settings: Settings;
}

const TRACKS: { id: TrackId; label: string; kinds: Kind[] }[] = [
  { id: 'text', label: 'Text', kinds: ['text'] },
  { id: 'overlay', label: 'Overlay', kinds: ['video', 'image'] },
  { id: 'main', label: 'Main', kinds: ['video', 'image'] },
  { id: 'audio', label: 'Audio', kinds: ['audio'] },
  { id: 'music', label: 'Music', kinds: ['audio'] },
];

const PRESETS: Record<string, string> = {
  none: 'none',
  warm: 'sepia(0.35) saturate(1.3) contrast(1.05)',
  cool: 'hue-rotate(12deg) saturate(1.15) brightness(1.04)',
  bw: 'grayscale(1) contrast(1.1)',
  vintage: 'sepia(0.6) contrast(1.1) brightness(0.95)',
  vivid: 'saturate(1.6) contrast(1.1)',
  fade: 'contrast(0.85) brightness(1.1) saturate(0.8)',
  dramatic: 'contrast(1.35) saturate(1.2) brightness(0.9)',
};

const STICKERS = ['😀', '😍', '🔥', '❤️', '✨', '👍', '😂', '😎', '🎉', '💯', '👑', '🌸', '⭐', '💥', '🎮', '👗', '👠', '💄', '🛍️', '🎀', '📸', '🎵', '➡️', '⚡'];

const FONTS = ['Arial', 'Impact', 'Georgia', 'Trebuchet MS', 'Courier New', 'Comic Sans MS', 'Verdana'];

const uid = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function dimsFor(s: Settings) {
  const k = s.res / 720;
  const d: Record<Settings['aspect'], [number, number]> = {
    '9:16': [720, 1280],
    '16:9': [1280, 720],
    '1:1': [720, 720],
    '4:5': [720, 900],
  };
  return { W: Math.round(d[s.aspect][0] * k), H: Math.round(d[s.aspect][1] * k) };
}

function makeClip(p: Partial<Clip> & { kind: Kind; track: TrackId }): Clip {
  return {
    id: uid(),
    name: '',
    src: '',
    start: 0,
    dur: 4,
    inPt: 0,
    srcDur: 1e9,
    speed: 1,
    vol: 1,
    muted: false,
    fadeIn: 0,
    fadeOut: 0,
    x: 0.5,
    y: 0.5,
    scale: 1,
    rot: 0,
    opacity: 1,
    flip: false,
    fit: p.track === 'overlay' ? 'contain' : 'cover',
    preset: 'none',
    brightness: 1,
    contrast: 1,
    saturate: 1,
    blur: 0,
    trans: { type: 'none', dur: 0.6 },
    kf: [],
    chroma: { on: false, color: '#00ff00', tol: 0.35 },
    text: 'Your text',
    font: 'Arial',
    size: 64,
    color: '#ffffff',
    stroke: '#000000',
    bg: '',
    bold: true,
    anim: 'none',
    ...p,
  };
}

type Pose = { x: number; y: number; scale: number; rot: number; opacity: number };

/** Position/size/rotation/opacity of a clip at `local` seconds, interpolating keyframes when present. */
function eff(c: Clip, local: number): Pose {
  if (!c.kf || !c.kf.length) return { x: c.x, y: c.y, scale: c.scale, rot: c.rot, opacity: c.opacity };
  const k = c.kf.slice().sort((a, b) => a.t - b.t);
  const pick = (a: Keyframe): Pose => ({ x: a.x, y: a.y, scale: a.scale, rot: a.rot, opacity: a.opacity });
  if (local <= k[0].t) return pick(k[0]);
  if (local >= k[k.length - 1].t) return pick(k[k.length - 1]);
  for (let i = 0; i < k.length - 1; i++) {
    if (local < k[i + 1].t) {
      const f = (local - k[i].t) / Math.max(0.001, k[i + 1].t - k[i].t);
      const l = (a: number, b: number) => a + (b - a) * f;
      return { x: l(k[i].x, k[i + 1].x), y: l(k[i].y, k[i + 1].y), scale: l(k[i].scale, k[i + 1].scale), rot: l(k[i].rot, k[i + 1].rot), opacity: l(k[i].opacity, k[i + 1].opacity) };
    }
  }
  return pick(k[k.length - 1]);
}

let filterOk: boolean | null = null;
function canvasFilterSupported(): boolean {
  if (filterOk === null) {
    try {
      filterOk = 'filter' in (document.createElement('canvas').getContext('2d') as object);
    } catch {
      filterOk = false;
    }
  }
  return filterOk;
}

const PRESET_FX: Record<string, { gray?: number; sepia?: number; sat?: number; con?: number; bri?: number; cool?: boolean }> = {
  none: {},
  warm: { sepia: 0.35, sat: 1.3, con: 1.05 },
  cool: { sat: 1.15, bri: 1.04, cool: true },
  bw: { gray: 1, con: 1.1 },
  vintage: { sepia: 0.6, con: 1.1, bri: 0.95 },
  vivid: { sat: 1.6, con: 1.1 },
  fade: { con: 0.85, bri: 1.1, sat: 0.8 },
  dramatic: { con: 1.35, sat: 1.2, bri: 0.9 },
};

const tmpCanvases: Record<string, HTMLCanvasElement> = {};

/**
 * Pixel-level processing used for green screen and as a color-filter fallback for browsers
 * without CanvasRenderingContext2D.filter (Safari).
 */
function processPixels(id: string, src: CanvasImageSource, nw: number, nh: number, c: Clip, fallbackFilter: boolean): HTMLCanvasElement {
  const sw = Math.min(nw, 640);
  const sh = Math.max(1, Math.round((nh * sw) / nw));
  let cv = tmpCanvases[id];
  if (!cv) {
    cv = document.createElement('canvas');
    tmpCanvases[id] = cv;
  }
  if (cv.width !== sw || cv.height !== sh) {
    cv.width = sw;
    cv.height = sh;
  }
  const cx = cv.getContext('2d', { willReadFrequently: true })!;
  cx.clearRect(0, 0, sw, sh);
  cx.drawImage(src, 0, 0, sw, sh);
  let img: ImageData;
  try {
    img = cx.getImageData(0, 0, sw, sh);
  } catch {
    return cv;
  }
  const d = img.data;
  const fx = PRESET_FX[c.preset] || {};
  const bri = (fallbackFilter ? (fx.bri ?? 1) * c.brightness : 1);
  const con = (fallbackFilter ? (fx.con ?? 1) * c.contrast : 1);
  const sat = (fallbackFilter ? (fx.sat ?? 1) * c.saturate : 1);
  const gray = fallbackFilter ? fx.gray ?? 0 : 0;
  const sepia = fallbackFilter ? fx.sepia ?? 0 : 0;
  const cool = fallbackFilter && !!fx.cool;
  let kr = 0;
  let kg = 255;
  let kb = 0;
  if (c.chroma.on) {
    const h = c.chroma.color.replace('#', '');
    kr = parseInt(h.slice(0, 2), 16);
    kg = parseInt(h.slice(2, 4), 16);
    kb = parseInt(h.slice(4, 6), 16);
  }
  const tol = c.chroma.tol;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    if (fallbackFilter) {
      r *= bri;
      g *= bri;
      b *= bri;
      r = (r - 128) * con + 128;
      g = (g - 128) * con + 128;
      b = (b - 128) * con + 128;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * sat;
      g = lum + (g - lum) * sat;
      b = lum + (b - lum) * sat;
      if (gray) {
        r += (lum - r) * gray;
        g += (lum - g) * gray;
        b += (lum - b) * gray;
      }
      if (sepia) {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r += (sr - r) * sepia;
        g += (sg - g) * sepia;
        b += (sb - b) * sepia;
      }
      if (cool) {
        r -= 6;
        b += 12;
      }
      d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
      r = d[i];
      g = d[i + 1];
      b = d[i + 2];
    }
    if (c.chroma.on) {
      const dist = Math.sqrt((r - kr) * (r - kr) + (g - kg) * (g - kg) + (b - kb) * (b - kb)) / 441;
      const a = Math.min(1, Math.max(0, (dist - tol) / 0.12));
      d[i + 3] = d[i + 3] * a;
      if (a > 0 && a < 1) {
        // despill: pull the key color out of semi-transparent edges
        if (kg > kr && kg > kb) d[i + 1] = Math.min(d[i + 1], (r + b) / 2 + 20);
      }
    }
  }
  cx.putImageData(img, 0, 0);
  return cv;
}

/** 16-bit mono WAV so the audio can be sent to Puter speech-to-text. */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o: number, t: string) => {
    for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i));
  };
  str(0, 'RIFF');
  v.setUint32(4, 36 + samples.length * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const x = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

// ------------------------------------------------------------- IndexedDB (save / open projects)
interface SavedProject {
  id: string;
  name: string;
  updatedAt: number;
  settings: Settings;
  media: Media[];
  clips: Clip[];
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('video-editor-pro', 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('projects', { keyPath: 'id' });
      r.result.createObjectStore('assets');
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function dbReq<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const rq = fn(t.objectStore(store));
        t.oncomplete = () => resolve(rq.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

const initial = (): Project => ({ media: [], clips: [], settings: { aspect: '9:16', res: 720, bgColor: '#000000' } });
let cache: Project | null = null; // survives dashboard tab switches in one session

const fmt = (t: number) => {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
};

/* ------------------------------------------------------------- small UI */

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';
const btnGhost = `${btn} bg-slate-800 text-slate-200 hover:bg-slate-700`;
const btnPrimary = `${btn} bg-indigo-600 text-white hover:bg-indigo-500`;
const inp =
  'w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none';
const lab = 'mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400';

function Slider(props: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div>
      <span className={lab}>
        {props.label}: {Number(props.value.toFixed(2))}
        {props.unit || ''}
      </span>
      <input
        type="range"
        className="w-full"
        min={props.min}
        max={props.max}
        step={props.step ?? 0.01}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  );
}

/* --------------------------------------------------------------- component */

export default function VideoEditorPro() {
  const [proj, setProj] = useState<Project>(() => cache || initial());
  const [selectedId, setSelectedId] = useState<string>('');
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pps, setPps] = useState(60); // timeline pixels per second
  const [tab, setTab] = useState<'media' | 'audio' | 'text' | 'stickers' | 'effects' | 'transitions'>('media');
  const [busy, setBusy] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportPct, setExportPct] = useState(0);
  const [result, setResult] = useState<{ url: string; ext: string; size: number } | null>(null);
  const [recording, setRecording] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [ttsLang, setTtsLang] = useState('en-US');
  const [capLang, setCapLang] = useState('auto');
  const [capModel, setCapModel] = useState('Xenova/whisper-tiny');
  const [capMsg, setCapMsg] = useState('');
  const [projList, setProjList] = useState<SavedProject[] | null>(null);
  const [saveName, setSaveName] = useState('');
  const [savedAt, setSavedAt] = useState<number>(0);
  const fresh = useRef(!cache);
  const blobs = useRef<Record<string, Blob>>({});
  const assetIds = useRef<Record<string, string>>({});
  const whisper = useRef<{ model: string; fn: any } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tlRef = useRef<HTMLDivElement | null>(null);
  const projRef = useRef(proj);
  projRef.current = proj;
  const selRef = useRef(selectedId);
  selRef.current = selectedId;
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const playFrom = useRef(0);
  const playWall = useRef(0);
  const onEnd = useRef<(() => void) | null>(null);
  const exportingRef = useRef(false);

  const els = useRef<Record<string, HTMLVideoElement | HTMLAudioElement>>({});
  const imgs = useRef<Record<string, HTMLImageElement>>({});
  const nodes = useRef<Record<string, GainNode>>({});
  const srcNodes = useRef<Record<string, MediaElementAudioSourceNode>>({});
  const acRef = useRef<AudioContext | null>(null);
  const recDest = useRef<MediaStreamAudioDestinationNode | null>(null);
  const rects = useRef<Record<string, { cx: number; cy: number; w: number; h: number }>>({});
  const lastSync = useRef<Record<string, number>>({});
  const past = useRef<Clip[][]>([]);
  const future = useRef<Clip[][]>([]);
  const lastKey = useRef<{ key: string; at: number }>({ key: '', at: 0 });
  const recorderRef = useRef<{ rec: MediaRecorder; stream: MediaStream; startAt: number } | null>(null);

  useEffect(() => {
    cache = proj;
  }, [proj]);

  const { W, H } = dimsFor(proj.settings);
  const total = useMemo(() => Math.max(1, ...proj.clips.map((c) => c.start + c.dur)), [proj.clips]);
  const selected = proj.clips.find((c) => c.id === selectedId) || null;

  /* ------------------------------------------------------- state mutation */

  const edit = useCallback((fn: (c: Clip[]) => Clip[], key?: string) => {
    const now = Date.now();
    const same = key && lastKey.current.key === key && now - lastKey.current.at < 700;
    if (!same) {
      past.current.push(projRef.current.clips);
      if (past.current.length > 80) past.current.shift();
      future.current = [];
    }
    lastKey.current = { key: key || '', at: now };
    setProj((o) => ({ ...o, clips: fn(o.clips) }));
  }, []);

  const patchClip = useCallback(
    (id: string, patch: Partial<Clip>, key?: string) => edit((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)), key ? `${key}:${id}` : undefined),
    [edit]
  );

  const undo = () => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(projRef.current.clips);
    setProj((o) => ({ ...o, clips: prev }));
  };
  const redo = () => {
    const nxt = future.current.pop();
    if (!nxt) return;
    past.current.push(projRef.current.clips);
    setProj((o) => ({ ...o, clips: nxt }));
  };

  /* ----------------------------------------------- media element registry */

  useEffect(() => {
    const ids: Record<string, boolean> = {};
    proj.clips.forEach((c) => {
      ids[c.id] = true;
      if ((c.kind === 'video' || c.kind === 'audio') && !els.current[c.id]) {
        const el = document.createElement(c.kind === 'video' ? 'video' : 'audio') as HTMLVideoElement | HTMLAudioElement;
        el.src = c.src;
        el.preload = 'auto';
        (el as HTMLVideoElement).playsInline = true;
        els.current[c.id] = el;
      }
      if (c.kind === 'image' && !imgs.current[c.id]) {
        const im = new Image();
        im.src = c.src;
        imgs.current[c.id] = im;
      }
    });
    Object.keys(els.current).forEach((id) => {
      if (!ids[id]) {
        els.current[id].pause();
        delete els.current[id];
        delete lastSync.current[id];
      }
    });
    Object.keys(imgs.current).forEach((id) => {
      if (!ids[id]) delete imgs.current[id];
    });
  }, [proj.clips]);

  const ensureAudio = useCallback(() => {
    if (!acRef.current) {
      const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      acRef.current = new AC();
      recDest.current = acRef.current.createMediaStreamDestination();
    }
    const ac = acRef.current!;
    Object.keys(els.current).forEach((id) => {
      if (srcNodes.current[id]) return;
      try {
        const src = ac.createMediaElementSource(els.current[id]);
        const g = ac.createGain();
        src.connect(g);
        g.connect(ac.destination);
        g.connect(recDest.current!);
        srcNodes.current[id] = src;
        nodes.current[id] = g;
      } catch {
        /* element already attached */
      }
    });
    return ac;
  }, []);

  /* ------------------------------------------------------------- rendering */

  const filterOf = (c: Clip) =>
    `${PRESETS[c.preset] === 'none' ? '' : PRESETS[c.preset] || ''} brightness(${c.brightness}) contrast(${c.contrast}) saturate(${c.saturate}) blur(${c.blur}px)`.trim();

  const srcTime = (c: Clip, t: number) => c.inPt + (t - c.start) * c.speed;

  const wrap = (ctx: CanvasRenderingContext2D, text: string, maxW: number) => {
    const out: string[] = [];
    text.split(String.fromCharCode(10)).forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      words.forEach((w) => {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW && line) {
          out.push(line);
          line = w;
        } else line = test;
      });
      out.push(line);
    });
    return out;
  };

  const drawClip = (ctx: CanvasRenderingContext2D, c: Clip, t: number, hold: boolean, guides: boolean) => {
    const local = hold ? c.dur : t - c.start;
    const e = eff(c, local);
    let alpha = e.opacity;
    if (c.fadeIn > 0 && local < c.fadeIn) alpha *= local / c.fadeIn;
    if (c.fadeOut > 0 && c.dur - local < c.fadeOut) alpha *= Math.max(0, (c.dur - local) / c.fadeOut);
    let dx = 0;
    let k = 1;
    let wipe = 1;
    if (!hold && c.trans.type !== 'none' && local < c.trans.dur) {
      const p = clamp(local / c.trans.dur, 0, 1);
      if (c.trans.type === 'fade') alpha *= p;
      if (c.trans.type === 'slide') dx = (1 - p) * W;
      if (c.trans.type === 'zoom') {
        alpha *= p;
        k = 1.3 - 0.3 * p;
      }
      if (c.trans.type === 'wipe') wipe = p;
    }
    ctx.save();
    if (wipe < 1) {
      ctx.beginPath();
      ctx.rect(0, 0, W * wipe, H);
      ctx.clip();
    }
    ctx.globalAlpha = clamp(alpha, 0, 1);
    let w = 0;
    let h = 0;
    let drawer: ((cw: number, ch: number) => void) | null = null;

    if (c.kind === 'text') {
      const full = c.text;
      let shown = full;
      if (c.anim === 'typewriter') {
        const dur = Math.min(c.dur * 0.7, Math.max(0.5, full.length * 0.07));
        shown = full.slice(0, Math.ceil(full.length * clamp(local / dur, 0, 1)));
      }
      if (c.anim === 'fade') ctx.globalAlpha *= clamp(local / 0.5, 0, 1);
      if (c.anim === 'pop') k *= local < 0.3 ? 0.4 + 0.6 * Math.min(1, local / 0.3) + Math.sin((local / 0.3) * Math.PI) * 0.15 : 1;
      const fs = c.size * (W / 720);
      ctx.font = `${c.bold ? '800' : '500'} ${fs}px ${c.font}, sans-serif`;
      const lines = wrap(ctx, full, W * 0.86);
      const lh = fs * 1.2;
      w = Math.max(...lines.map((l) => ctx.measureText(l).width), 10) + fs * 0.4;
      h = lines.length * lh + fs * 0.2;
      const shownLines = wrap(ctx, shown, W * 0.86);
      drawer = (cw, ch) => {
        if (c.bg) {
          ctx.fillStyle = c.bg;
          ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
        }
        ctx.font = `${c.bold ? '800' : '500'} ${fs}px ${c.font}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(2, fs / 8);
        shownLines.forEach((l, i) => {
          const y = -((lines.length - 1) * lh) / 2 + i * lh;
          if (c.stroke) {
            ctx.strokeStyle = c.stroke;
            ctx.strokeText(l, 0, y);
          }
          ctx.fillStyle = c.color;
          ctx.fillText(l, 0, y);
        });
      };
      if (c.anim === 'slideup') dx = 0;
    } else {
      const src: CanvasImageSource | null = c.kind === 'video' ? (els.current[c.id] as HTMLVideoElement) || null : imgs.current[c.id] || null;
      const nw = c.kind === 'video' ? (src as HTMLVideoElement)?.videoWidth : (src as HTMLImageElement)?.naturalWidth;
      const nh = c.kind === 'video' ? (src as HTMLVideoElement)?.videoHeight : (src as HTMLImageElement)?.naturalHeight;
      if (src && nw && nh) {
        const f = c.fit === 'cover' ? Math.max(W / nw, H / nh) : Math.min(W / nw, H / nh);
        w = nw * f;
        h = nh * f;
        const filt = filterOf(c);
        const native = canvasFilterSupported();
        drawer = (cw, ch) => {
          let source: CanvasImageSource = src;
          if (c.chroma.on || !native) source = processPixels(c.id, src, nw, nh, c, !native);
          if (native) {
            try {
              ctx.filter = filt;
            } catch {
              /* unsupported */
            }
          }
          ctx.drawImage(source, -cw / 2, -ch / 2, cw, ch);
          if (native) ctx.filter = 'none';
        };
      }
    }

    if (drawer) {
      w *= e.scale * k;
      h *= e.scale * k;
      let cy = e.y * H;
      if (c.kind === 'text' && c.anim === 'slideup' && !hold) cy += (1 - clamp(local / 0.5, 0, 1)) * H * 0.08;
      const cx = e.x * W + dx;
      ctx.translate(cx, cy);
      ctx.rotate((e.rot * Math.PI) / 180);
      if (c.flip) ctx.scale(-1, 1);
      if (c.kind === 'text') {
        // text is drawn at natural size scaled by c.scale * k
        ctx.scale(e.scale * k, e.scale * k);
        drawer(w / (e.scale * k), h / (e.scale * k));
      } else drawer(w, h);
      if (!hold) rects.current[c.id] = { cx: e.x * W, cy: e.y * H, w, h };
      if (guides && selRef.current === c.id && !hold) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.strokeRect(e.x * W - w / 2, e.y * H - h / 2, w, h);
      }
    }
    ctx.restore();
  };

  const visualAt = (t: number) => {
    const cs = projRef.current.clips;
    const out: { c: Clip; hold: boolean }[] = [];
    (['main', 'overlay', 'text'] as TrackId[]).forEach((tr) => {
      const list = cs.filter((c) => c.track === tr).sort((a, b) => a.start - b.start);
      list.forEach((c) => {
        if (t >= c.start && t < c.start + c.dur) {
          if (c.trans.type !== 'none' && t - c.start < c.trans.dur) {
            const prev = list.find((p) => p !== c && Math.abs(p.start + p.dur - c.start) < 0.06);
            if (prev) out.push({ c: prev, hold: true });
          }
          out.push({ c, hold: false });
        }
      });
    });
    return out;
  };

  const render = useCallback(
    (t: number) => {
      const cv = canvasRef.current;
      const ctx = cv?.getContext('2d');
      if (!cv || !ctx) return;
      const s = projRef.current.settings;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = s.bgColor;
      ctx.fillRect(0, 0, cv.width, cv.height);
      visualAt(t).forEach(({ c, hold }) => drawClip(ctx, c, t, hold, !exportingRef.current));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, H]
  );

  /* -------------------------------------------------------- playback engine */

  const syncMedia = (t: number, isPlaying: boolean) => {
    const cs = projRef.current.clips;
    const wanted: Record<string, 'play' | 'hold'> = {};
    cs.forEach((c) => {
      if (c.kind !== 'video' && c.kind !== 'audio') return;
      if (t >= c.start && t < c.start + c.dur) wanted[c.id] = 'play';
    });
    visualAt(t).forEach(({ c, hold }) => {
      if (hold && c.kind === 'video') wanted[c.id] = 'hold';
    });
    Object.keys(els.current).forEach((id) => {
      const el = els.current[id];
      const c = cs.find((x) => x.id === id);
      if (!c) return;
      const mode = wanted[id];
      const g = nodes.current[id];
      if (g) {
        let v = 0;
        if (mode === 'play' && isPlaying && !c.muted) {
          const local = t - c.start;
          v = c.vol;
          if (c.fadeIn > 0 && local < c.fadeIn) v *= local / c.fadeIn;
          if (c.fadeOut > 0 && c.dur - local < c.fadeOut) v *= Math.max(0, (c.dur - local) / c.fadeOut);
        }
        g.gain.value = v;
      }
      if (!mode) {
        if (!el.paused) el.pause();
        return;
      }
      const want = mode === 'hold' ? Math.max(0, c.inPt + c.dur * c.speed - 0.04) : clamp(srcTime(c, t), 0, (isFinite(el.duration) ? el.duration : 1e9) - 0.01);
      if (mode === 'hold' || !isPlaying) {
        if (!el.paused) el.pause();
        if (Math.abs(el.currentTime - want) > 0.03 && Math.abs((lastSync.current[id] ?? -9) - want) > 0.02) {
          lastSync.current[id] = want;
          try {
            el.currentTime = want;
          } catch {
            /* not ready */
          }
        }
      } else {
        el.playbackRate = clamp(c.speed, 0.25, 4);
        if (Math.abs(el.currentTime - want) > 0.35) {
          try {
            el.currentTime = want;
          } catch {
            /* not ready */
          }
        }
        if (el.paused) el.play().catch(() => undefined);
      }
    });
  };

  const stopPlay = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    Object.keys(els.current).forEach((id) => els.current[id].pause());
    Object.keys(nodes.current).forEach((id) => (nodes.current[id].gain.value = 0));
    const cb = onEnd.current;
    onEnd.current = null;
    if (cb) cb();
  }, []);

  const startPlay = useCallback(
    async (from: number) => {
      const ac = ensureAudio();
      await ac.resume();
      playFrom.current = from;
      playWall.current = performance.now();
      playingRef.current = true;
      setPlaying(true);
    },
    [ensureAudio]
  );

  const seek = useCallback((t: number) => {
    const v = clamp(t, 0, 1e6);
    timeRef.current = v;
    setTime(v);
    if (playingRef.current) {
      playFrom.current = v;
      playWall.current = performance.now();
    }
    lastSync.current = {};
  }, []);

  // main loop: a worker timer keeps running even if the tab is in the background
  const tickState = useRef({ lastUi: 0 });
  useEffect(() => {
    const stop = makeTicker(20, () => {
      const projTotal = Math.max(1, ...projRef.current.clips.map((c) => c.start + c.dur));
      if (playingRef.current) {
        let t = playFrom.current + (performance.now() - playWall.current) / 1000;
        if (t >= projTotal) {
          t = projTotal;
          timeRef.current = t;
          setTime(t);
          stopPlay();
        } else {
          timeRef.current = t;
        }
        ensureAudio();
      }
      syncMedia(timeRef.current, playingRef.current);
      render(timeRef.current);
      const now = performance.now();
      if (now - tickState.current.lastUi > 60) {
        tickState.current.lastUi = now;
        setTime(timeRef.current);
        if (exportingRef.current) setExportPct((timeRef.current / projTotal) * 100);
      }
    });
    return () => {
      stop();
      Object.keys(els.current).forEach((id) => els.current[id].pause());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  /* ----------------------------------------------------------- importing */

  const makeThumb = (src: string, kind: 'video' | 'image'): Promise<{ thumb?: string; dur: number }> =>
    new Promise((resolve) => {
      if (kind === 'image') {
        const im = new Image();
        im.onload = () => {
          const c = document.createElement('canvas');
          c.width = 160;
          c.height = Math.round((160 * im.naturalHeight) / im.naturalWidth) || 90;
          c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
          resolve({ thumb: c.toDataURL('image/jpeg', 0.7), dur: 0 });
        };
        im.onerror = () => resolve({ dur: 0 });
        im.src = src;
        return;
      }
      const v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.src = src;
      v.onloadedmetadata = () => {
        const d = v.duration;
        v.currentTime = Math.min(0.2, d / 2);
      };
      v.onseeked = () => {
        const c = document.createElement('canvas');
        c.width = 160;
        c.height = Math.round((160 * v.videoHeight) / v.videoWidth) || 90;
        try {
          c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
          resolve({ thumb: c.toDataURL('image/jpeg', 0.7), dur: v.duration });
        } catch {
          resolve({ dur: v.duration });
        }
      };
      v.onerror = () => resolve({ dur: 0 });
    });

  const audioDuration = (src: string): Promise<number> =>
    new Promise((resolve) => {
      const a = document.createElement('audio');
      a.preload = 'metadata';
      a.src = src;
      a.onloadedmetadata = () => resolve(isFinite(a.duration) ? a.duration : 0);
      a.onerror = () => resolve(0);
    });

  const importFiles = async (files: FileList | null, onlyKind?: 'audio') => {
    if (!files || !files.length) return;
    setBusy('import');
    const added: Media[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const src = URL.createObjectURL(f);
      blobs.current[src] = f;
      let kind: Media['kind'] | null = null;
      if (f.type.startsWith('video/')) kind = 'video';
      else if (f.type.startsWith('image/')) kind = 'image';
      else if (f.type.startsWith('audio/')) kind = 'audio';
      if (!kind || (onlyKind && kind !== onlyKind)) {
        toast.error(`${f.name}: unsupported file`);
        continue;
      }
      if (kind === 'audio') added.push({ id: uid(), kind, name: f.name, src, dur: await audioDuration(src) });
      else {
        const m = await makeThumb(src, kind);
        added.push({ id: uid(), kind, name: f.name, src, dur: m.dur, thumb: m.thumb });
      }
    }
    setBusy('');
    if (added.length) {
      setProj((o) => ({ ...o, media: [...o.media, ...added] }));
      toast.success(`${added.length} file(s) imported. Click + to add them to the timeline.`);
    }
  };

  const mainEnd = () => Math.max(0, ...projRef.current.clips.filter((c) => c.track === 'main').map((c) => c.start + c.dur));

  const addMedia = (m: Media, track?: TrackId, at?: number) => {
    if (m.kind === 'audio') {
      const tr: TrackId = track || 'audio';
      const c = makeClip({ kind: 'audio', track: tr, name: m.name, src: m.src, start: at ?? timeRef.current, dur: m.dur || 5, srcDur: m.dur || 1e9 });
      edit((cs) => [...cs, c]);
      setSelectedId(c.id);
      return;
    }
    const tr: TrackId = track || 'main';
    const start = at ?? (tr === 'main' ? mainEnd() : timeRef.current);
    const c = makeClip({
      kind: m.kind,
      track: tr,
      name: m.name,
      src: m.src,
      thumb: m.thumb,
      start,
      dur: m.kind === 'image' ? 4 : m.dur || 5,
      srcDur: m.kind === 'image' ? 1e9 : m.dur || 1e9,
      scale: tr === 'overlay' ? 0.4 : 1,
      x: tr === 'overlay' ? 0.75 : 0.5,
      y: tr === 'overlay' ? 0.25 : 0.5,
    });
    edit((cs) => [...cs, c]);
    setSelectedId(c.id);
  };

  const addText = (text: string, over: Partial<Clip> = {}) => {
    const c = makeClip({ kind: 'text', track: 'text', start: timeRef.current, dur: 3, text, y: 0.8, anim: 'pop', ...over });
    edit((cs) => [...cs, c]);
    setSelectedId(c.id);
  };

  const importFromStudio = () => {
    const sp = getStudioProject();
    if (!sp) return toast.error('No AI Video Studio project yet. Create one in the AI Video Automation tab first.');
    if (projRef.current.clips.length && !window.confirm('Add the AI Studio scenes after your current clips?')) return;
    const newClips: Clip[] = [];
    let t = mainEnd();
    sp.scenes.forEach((sc, i) => {
      if (sc.image) {
        newClips.push(makeClip({ kind: 'image', track: 'main', name: `Scene ${i + 1}`, src: sc.image, thumb: sc.image, start: t, dur: sc.duration, trans: { type: i ? 'fade' : 'none', dur: 0.5 } }));
      }
      if (sc.caption) newClips.push(makeClip({ kind: 'text', track: 'text', start: t, dur: sc.duration, text: sc.caption, y: 0.82, anim: 'fade', size: 54 }));
      if (sc.voice) {
        const src = URL.createObjectURL(sc.voice);
        blobs.current[src] = sc.voice;
        newClips.push(makeClip({ kind: 'audio', track: 'audio', name: `Voice ${i + 1}`, src, start: t, dur: sc.duration, srcDur: 1e9 }));
      }
      t += sc.duration;
    });
    setProj((o) => ({ ...o, settings: { ...o.settings, aspect: sp.format === 'vertical' ? '9:16' : '16:9' } }));
    edit((cs) => [...cs, ...newClips]);
    toast.success(`Imported ${sp.scenes.length} scenes`);
  };

  /* --------------------------------------------------------- clip actions */

  const splitAt = () => {
    const t = timeRef.current;
    const sel = projRef.current.clips.find((c) => c.id === selRef.current && t > c.start + 0.1 && t < c.start + c.dur - 0.1);
    const target =
      sel ||
      projRef.current.clips.find((c) => c.track === 'main' && t > c.start + 0.1 && t < c.start + c.dur - 0.1) ||
      projRef.current.clips.find((c) => t > c.start + 0.1 && t < c.start + c.dur - 0.1);
    if (!target) return toast.error('Move the playhead over a clip to split it');
    const cut = t - target.start;
    const second: Clip = { ...target, id: uid(), start: t, dur: target.dur - cut, inPt: target.inPt + cut * target.speed, trans: { type: 'none', dur: 0.6 }, fadeIn: 0 };
    edit((cs) => cs.flatMap((c) => (c.id === target.id ? [{ ...c, dur: cut, fadeOut: 0 }, second] : [c])));
    setSelectedId(second.id);
  };

  const removeClip = (id: string) => {
    edit((cs) => cs.filter((c) => c.id !== id));
    setSelectedId('');
  };

  const duplicate = (id: string) => {
    const c = projRef.current.clips.find((x) => x.id === id);
    if (!c) return;
    const d = { ...c, id: uid(), start: c.start + c.dur };
    edit((cs) => [...cs, d]);
    setSelectedId(d.id);
  };

  const rippleDelete = (id: string) => {
    const c = projRef.current.clips.find((x) => x.id === id);
    if (!c) return;
    edit((cs) => cs.filter((x) => x.id !== id).map((x) => (x.track === c.track && x.start >= c.start + c.dur - 0.01 ? { ...x, start: Math.max(0, x.start - c.dur) } : x)));
    setSelectedId('');
  };

  /* ------------------------------------------------------- audio capture */

  const toggleRecord = async () => {
    if (recording) {
      recorderRef.current?.rec.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const startAt = timeRef.current;
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        const src = URL.createObjectURL(blob);
        blobs.current[src] = blob;
        const dur = (await audioDuration(src)) || 3;
        const m: Media = { id: uid(), kind: 'audio', name: 'Voice recording', src, dur };
        setProj((o) => ({ ...o, media: [...o.media, m] }));
        addMedia(m, 'audio', startAt);
        stopPlay();
      };
      recorderRef.current = { rec, stream, startAt };
      rec.start();
      setRecording(true);
      if (!playingRef.current) await startPlay(timeRef.current);
    } catch {
      toast.error('Microphone permission was denied');
    }
  };

  const makeTts = async () => {
    if (!ttsText.trim()) return toast.error('Type the text to speak');
    setBusy('tts');
    try {
      const blob = await generateSpeech(ttsText, ttsLang);
      const src = URL.createObjectURL(blob);
      blobs.current[src] = blob;
      const dur = (await audioDuration(src)) || 3;
      const m: Media = { id: uid(), kind: 'audio', name: `Voice: ${ttsText.slice(0, 18)}`, src, dur };
      setProj((o) => ({ ...o, media: [...o.media, m] }));
      addMedia(m, 'audio', timeRef.current);
    } catch (e: any) {
      toast.error(e?.message || 'Text-to-speech failed. Sign in to Puter in the AI Video Automation tab.');
    } finally {
      setBusy('');
    }
  };


  /* ------------------------------------------------------ keyframes (animation) */

  const localOf = (c: Clip) => clamp(timeRef.current - c.start, 0, c.dur);

  /** Changes position/scale/rotation/opacity. If the clip has keyframes, the change becomes a keyframe at the playhead. */
  const setPose = (c: Clip, patch: Partial<Pose>, key: string) => {
    if (!c.kf.length) return patchClip(c.id, patch, key);
    const local = localOf(c);
    const base = eff(c, local);
    const nk: Keyframe = { t: local, ...base, ...patch };
    patchClip(c.id, { kf: c.kf.filter((k) => Math.abs(k.t - local) > 0.04).concat(nk).sort((a, b) => a.t - b.t) }, `kf-${key}`);
  };

  const addKeyframe = (c: Clip) => {
    const local = localOf(c);
    const nk: Keyframe = { t: local, ...eff(c, local) };
    patchClip(c.id, { kf: c.kf.filter((k) => Math.abs(k.t - local) > 0.04).concat(nk).sort((a, b) => a.t - b.t) });
  };

  /* ------------------------------------------------------------ auto captions */

  const autoCaptions = async () => {
    const c = projRef.current.clips.find((x) => x.id === selRef.current && (x.kind === 'video' || x.kind === 'audio'));
    if (!c) return toast.error('Select a video or audio clip that has speech');
    setBusy('captions');
    try {
      setCapMsg('Reading audio…');
      const data = await (await fetch(c.src)).arrayBuffer();
      const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx16 = new AC({ sampleRate: 16000 });
      const decoded = await ctx16.decodeAudioData(data);
      ctx16.close().catch(() => undefined);
      const sr = decoded.sampleRate;
      const from = Math.floor(c.inPt * sr);
      const to = Math.min(decoded.length, Math.floor((c.inPt + c.dur * c.speed) * sr));
      const mono = new Float32Array(Math.max(0, to - from));
      const ch0 = decoded.getChannelData(0);
      const ch1 = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : null;
      for (let i = 0; i < mono.length; i++) mono[i] = ch1 ? (ch0[from + i] + ch1[from + i]) / 2 : ch0[from + i];
      if (!mono.length) throw new Error('This clip has no audio');

      let chunks: { text: string; timestamp: [number, number | null] }[] = [];
      let usedPuter = false;
      try {
        setCapMsg('Transcribing with Puter AI…');
        const puter = await loadPuter();
        if (!puter?.ai?.speech2txt) throw new Error('Puter speech-to-text unavailable');
        const iso: Record<string, string> = { english: 'en', urdu: 'ur', hindi: 'hi', arabic: 'ar' };
        const opts: any = { provider: 'gemini', model: 'gemini-3.5-transcribe', timestamp_granularities: ['word'] };
        if (iso[capLang]) opts.language = iso[capLang];
        const res: any = await puter.ai.speech2txt(encodeWav(mono, 16000), opts);
        const words: { word?: string; text?: string; start: number; end: number }[] = res?.words || [];
        if (words.length) {
          let cur: string[] = [];
          let t0 = 0;
          let last = 0;
          const flush = () => {
            if (cur.length) chunks.push({ text: cur.join(' '), timestamp: [t0, last] });
            cur = [];
          };
          words.forEach((w) => {
            const txt = String(w.word ?? w.text ?? '').trim();
            if (!txt) return;
            if (cur.length && (cur.length >= 7 || w.start - last > 0.7)) flush();
            if (!cur.length) t0 = w.start;
            cur.push(txt);
            last = w.end;
            if (/[.!?؟۔]$/.test(txt)) flush();
          });
          flush();
          usedPuter = chunks.length > 0;
        }
      } catch (err) {
        console.warn('Puter speech-to-text failed, using offline Whisper:', err);
      }

      if (!usedPuter) {
        setCapMsg('Loading offline speech model (first time downloads ~40-250 MB)…');
        if (!whisper.current || whisper.current.model !== capModel) {
          const { pipeline, env } = await import('@xenova/transformers');
          env.allowLocalModels = false;
          env.useBrowserCache = true;
          const fn = await pipeline('automatic-speech-recognition', capModel, { quantized: true });
          whisper.current = { model: capModel, fn };
        }
        setCapMsg('Listening and writing captions…');
        const wopts: any = { chunk_length_s: 30, stride_length_s: 5, return_timestamps: true, task: 'transcribe' };
        if (capLang !== 'auto') wopts.language = capLang;
        const out: any = await whisper.current!.fn(mono, wopts);
        chunks = out?.chunks || [];
      }
      const made: Clip[] = [];
      chunks.forEach((ch) => {
        const text = String(ch.text || '').trim();
        if (!text) return;
        const t0 = ch.timestamp?.[0] ?? 0;
        const t1 = ch.timestamp?.[1] ?? t0 + 2;
        const start = c.start + t0 / c.speed;
        const dur = Math.max(0.6, (t1 - t0) / c.speed);
        made.push(makeClip({ kind: 'text', track: 'text', start, dur: Math.min(dur, c.start + c.dur - start + 0.01), text, y: 0.82, size: 52, anim: 'none', bg: 'rgba(0,0,0,0.55)', stroke: '' }));
      });
      if (!made.length) throw new Error('No speech detected. Pick the right language and try again.');
      edit((cs) => [...cs, ...made]);
      toast.success(`${made.length} caption(s) added to the Text track. Click one to edit its text or style.`);
    } catch (e: any) {
      toast.error(e?.message || 'Auto captions failed');
    } finally {
      setBusy('');
      setCapMsg('');
    }
  };

  /* --------------------------------------------------------- save / open projects */

  const assetFor = async (src: string): Promise<string> => {
    if (assetIds.current[src]) return assetIds.current[src];
    const blob = blobs.current[src] || (await (await fetch(src)).blob());
    const id = uid();
    await dbReq('assets', 'readwrite', (st) => st.put(blob, id));
    assetIds.current[src] = id;
    blobs.current[src] = blob;
    return id;
  };

  const saveProject = async (id: string, name: string) => {
    const cur = projRef.current;
    const map: Record<string, string> = {};
    const all = cur.media.map((m) => m.src).concat(cur.clips.filter((c) => c.src).map((c) => c.src));
    for (let i = 0; i < all.length; i++) if (!map[all[i]]) map[all[i]] = await assetFor(all[i]);
    const rec: SavedProject = {
      id,
      name,
      updatedAt: Date.now(),
      settings: cur.settings,
      media: cur.media.map((m) => ({ ...m, src: map[m.src] })),
      clips: cur.clips.map((c) => ({ ...c, src: c.src ? map[c.src] : '' })),
    };
    await dbReq('projects', 'readwrite', (st) => st.put(rec));
    setSavedAt(Date.now());
  };

  const loadProject = async (rec: SavedProject) => {
    const urls: Record<string, string> = {};
    const ids = rec.media.map((m) => m.src).concat(rec.clips.filter((c) => c.src).map((c) => c.src));
    for (let i = 0; i < ids.length; i++) {
      if (urls[ids[i]]) continue;
      const blob = await dbReq<Blob>('assets', 'readonly', (st) => st.get(ids[i]));
      if (!blob) continue;
      const u = URL.createObjectURL(blob);
      urls[ids[i]] = u;
      blobs.current[u] = blob;
      assetIds.current[u] = ids[i];
    }
    stopPlay();
    past.current = [];
    future.current = [];
    const media = rec.media.map((m) => ({ ...m, src: urls[m.src] || '' }));
    const clips = rec.clips.map((c) => ({ ...makeClip({ kind: c.kind, track: c.track }), ...c, src: c.src ? urls[c.src] || '' : '' }));
    setProj({ media, clips, settings: rec.settings });
    seek(0);
    setSelectedId('');
  };

  const openProjects = async () => {
    try {
      const list = await dbReq<SavedProject[]>('projects', 'readonly', (st) => st.getAll());
      setProjList(list.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch {
      toast.error('Saving is not available in this browser mode (private window?)');
    }
  };

  const deleteProject = async (id: string) => {
    await dbReq('projects', 'readwrite', (st) => st.delete(id));
    // remove assets no saved project still uses
    const left = await dbReq<SavedProject[]>('projects', 'readonly', (st) => st.getAll());
    const used: Record<string, boolean> = {};
    left.forEach((r) => r.media.concat([]).forEach((m) => (used[m.src] = true)));
    left.forEach((r) => r.clips.forEach((c) => c.src && (used[c.src] = true)));
    const keys = await dbReq<IDBValidKey[]>('assets', 'readonly', (st) => st.getAllKeys());
    for (let i = 0; i < keys.length; i++) if (!used[String(keys[i])]) await dbReq('assets', 'readwrite', (st) => st.delete(keys[i]));
    openProjects();
  };

  // restore the last session after a page refresh, then autosave while editing
  useEffect(() => {
    if (!fresh.current) return;
    (async () => {
      try {
        const rec = await dbReq<SavedProject | undefined>('projects', 'readonly', (st) => st.get('autosave'));
        if (rec && rec.clips.length) {
          await loadProject(rec);
          toast.success('Restored your last editing session');
        }
      } catch {
        /* storage unavailable */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!proj.clips.length) return;
    const id = setTimeout(() => {
      saveProject('autosave', 'Autosave').catch(() => undefined);
    }, 3000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proj]);

  /* ---------------------------------------------------------------- export */

  const runExport = async () => {
    if (!proj.clips.length) return toast.error('Add something to the timeline first');
    if (typeof MediaRecorder === 'undefined') return toast.error('This browser cannot record video. Use Chrome or Edge.');
    if (playingRef.current) stopPlay();
    const cv = canvasRef.current;
    if (!cv) return;
    setResult(null);
    setExporting(true);
    exportingRef.current = true;
    setExportPct(0);
    const ac = ensureAudio();
    await ac.resume();
    let wake: any = null;
    try {
      wake = await (navigator as any).wakeLock?.request('screen');
    } catch {
      /* optional */
    }
    try {
      const stream = cv.captureStream(30);
      recDest.current!.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
      const { mime, ext } = pickMime();
      const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const done = new Promise<void>((res) => (rec.onstop = () => res()));
      seek(0);
      await new Promise((r) => setTimeout(r, 400)); // let first frames seek
      rec.start(500);
      await new Promise<void>((resolve) => {
        onEnd.current = () => resolve();
        startPlay(0);
      });
      await new Promise((r) => setTimeout(r, 300));
      rec.stop();
      await done;
      const blob = new Blob(chunks, { type: (mime || 'video/webm').split(';')[0] });
      setResult({ url: URL.createObjectURL(blob), ext, size: blob.size });
      toast.success('Video exported');
    } catch (e: any) {
      toast.error(e?.message || 'Export failed');
    } finally {
      try {
        wake?.release();
      } catch {
        /* ignore */
      }
      exportingRef.current = false;
      setExporting(false);
    }
  };

  /* ---------------------------------------------------- timeline dragging */

  const drag = useRef<null | {
    mode: 'move' | 'trimL' | 'trimR' | 'head';
    id: string;
    x0: number;
    orig: Clip;
    moved: boolean;
  }>(null);

  const snap = (v: number, ignoreId: string) => {
    const pts = [0, timeRef.current];
    projRef.current.clips.forEach((c) => {
      if (c.id !== ignoreId) pts.push(c.start, c.start + c.dur);
    });
    const th = 8 / pps;
    let best = v;
    let bd = th;
    pts.forEach((p) => {
      if (Math.abs(p - v) < bd) {
        bd = Math.abs(p - v);
        best = p;
      }
    });
    return best;
  };

  const trackAtY = (clientY: number): TrackId | null => {
    const rows = tlRef.current?.querySelectorAll('[data-track]');
    let found: TrackId | null = null;
    rows?.forEach((r) => {
      const b = (r as HTMLElement).getBoundingClientRect();
      if (clientY >= b.top && clientY <= b.bottom) found = (r as HTMLElement).dataset.track as TrackId;
    });
    return found;
  };

  const freeStart = (c: Clip, track: TrackId, start: number) => {
    const others = projRef.current.clips.filter((o) => o.track === track && o.id !== c.id);
    let s = Math.max(0, start);
    for (let i = 0; i < others.length + 1; i++) {
      const hit = others.find((o) => s < o.start + o.dur - 0.001 && s + c.dur > o.start + 0.001);
      if (!hit) break;
      s = s + c.dur / 2 > hit.start + hit.dur / 2 || hit.start - c.dur < 0 ? hit.start + hit.dur : hit.start - c.dur;
    }
    return s;
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (d.mode === 'head') {
        const box = tlRef.current?.querySelector('[data-lane]') as HTMLElement | null;
        if (!box) return;
        seek((e.clientX - box.getBoundingClientRect().left) / pps);
        return;
      }
      const dt = (e.clientX - d.x0) / pps;
      if (Math.abs(e.clientX - d.x0) > 3) d.moved = true;
      const o = d.orig;
      if (d.mode === 'move') {
        const tr = trackAtY(e.clientY);
        const kinds = TRACKS.find((t) => t.id === (tr || o.track))?.kinds || [];
        const track = tr && kinds.includes(o.kind) ? tr : o.track;
        let s = snap(o.start + dt, o.id);
        const endSnap = snap(o.start + dt + o.dur, o.id);
        if (Math.abs(endSnap - (o.start + dt + o.dur)) < Math.abs(s - (o.start + dt))) s = endSnap - o.dur;
        s = freeStart(o, track, s);
        patchClip(o.id, { start: s, track }, 'move');
      } else if (d.mode === 'trimL') {
        const isMedia = o.kind === 'video' || o.kind === 'audio';
        let delta = snap(o.start + dt, o.id) - o.start;
        delta = clamp(delta, isMedia ? -o.inPt / o.speed : -o.start, o.dur - 0.2);
        patchClip(o.id, { start: o.start + delta, dur: o.dur - delta, inPt: isMedia ? o.inPt + delta * o.speed : 0 }, 'trim');
      } else if (d.mode === 'trimR') {
        const isMedia = o.kind === 'video' || o.kind === 'audio';
        const maxDur = isMedia ? (o.srcDur - o.inPt) / o.speed : 600;
        let end = snap(o.start + o.dur + dt, o.id);
        patchClip(o.id, { dur: clamp(end - o.start, 0.2, maxDur) }, 'trim');
      }
    };
    const onUp = () => {
      drag.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pps]);

  /* --------------------------------------------------- preview drag & keys */

  const canvasDrag = useRef<null | { id: string; ox: number; oy: number }>(null);
  const toCanvas = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };
  const onCanvasDown = (e: React.PointerEvent) => {
    const p = toCanvas(e);
    const vis = visualAt(timeRef.current).filter((v) => !v.hold);
    for (let i = vis.length - 1; i >= 0; i--) {
      const c = vis[i].c;
      const r = rects.current[c.id];
      if (r && Math.abs(p.x - r.cx) <= r.w / 2 && Math.abs(p.y - r.cy) <= r.h / 2) {
        setSelectedId(c.id);
        const pose = eff(c, clamp(timeRef.current - c.start, 0, c.dur));
        canvasDrag.current = { id: c.id, ox: p.x - pose.x * W, oy: p.y - pose.y * H };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }
    }
    setSelectedId('');
  };
  const onCanvasMove = (e: React.PointerEvent) => {
    const d = canvasDrag.current;
    if (!d) return;
    const p = toCanvas(e);
    const cl = projRef.current.clips.find((x) => x.id === d.id);
    if (cl) setPose(cl, { x: clamp((p.x - d.ox) / W, -0.2, 1.2), y: clamp((p.y - d.oy) / H, -0.2, 1.2) }, 'cdrag');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (playingRef.current) stopPlay();
        else startPlay(timeRef.current >= total - 0.05 ? 0 : timeRef.current);
      } else if (e.key === 's' || e.key === 'S') splitAt();
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selRef.current) removeClip(selRef.current);
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selRef.current) {
        e.preventDefault();
        duplicate(selRef.current);
      } else if (e.key === 'ArrowLeft') seek(timeRef.current - (e.shiftKey ? 1 : 1 / 30));
      else if (e.key === 'ArrowRight') seek(timeRef.current + (e.shiftKey ? 1 : 1 / 30));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const clearAll = () => {
    if (!window.confirm('Remove everything and start a new project?')) return;
    stopPlay();
    past.current = [];
    future.current = [];
    seek(0);
    setSelectedId('');
    setResult(null);
    setProj(initial());
  };

  /* ---------------------------------------------------------------- views */

  const startDrag = (e: React.PointerEvent, mode: 'move' | 'trimL' | 'trimR', c: Clip) => {
    e.stopPropagation();
    setSelectedId(c.id);
    drag.current = { mode, id: c.id, x0: e.clientX, orig: c, moved: false };
  };

  const rulerTicks = useMemo(() => {
    const step = pps >= 90 ? 1 : pps >= 45 ? 2 : pps >= 22 ? 5 : 10;
    const out: number[] = [];
    for (let s = 0; s <= total + 10; s += step) out.push(s);
    return out;
  }, [pps, total]);

  const lib = (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-800 p-1.5">
        {(
          [
            ['media', Film, 'Media'],
            ['audio', Music, 'Audio'],
            ['text', Type, 'Text'],
            ['stickers', Smile, 'Stickers'],
            ['effects', Sparkles, 'Effects'],
            ['transitions', Layers, 'Transitions'],
          ] as const
        ).map(([id, Icon, name]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[10px] font-semibold ${tab === id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Icon className="h-4 w-4" />
            {name}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {tab === 'media' && (
          <div className="space-y-2">
            <label className={`${btnPrimary} w-full cursor-pointer`}>
              {busy === 'import' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Import videos / photos / audio
              <input type="file" multiple accept="video/*,image/*,audio/*" className="hidden" onChange={(e) => { importFiles(e.target.files); e.target.value = ''; }} />
            </label>
            <button className={`${btnGhost} w-full`} onClick={importFromStudio}>
              <Wand2 className="h-3.5 w-3.5" /> Import scenes from AI Video Studio
            </button>
            <div className="grid grid-cols-2 gap-2">
              {proj.media.map((m) => (
                <div key={m.id} className="group relative overflow-hidden rounded-md border border-slate-700 bg-slate-950">
                  <div className="flex aspect-video items-center justify-center bg-slate-900">
                    {m.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                  <div className="truncate px-1 py-0.5 text-[10px] text-slate-300">{m.name}</div>
                  {m.dur > 0 && <span className="absolute right-1 top-1 rounded bg-black/70 px-1 text-[9px] text-white">{m.dur.toFixed(1)}s</span>}
                  <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-black/60 group-hover:flex">
                    <button className={btnPrimary} title="Add to timeline" onClick={() => addMedia(m)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    {m.kind !== 'audio' && (
                      <button className={btnGhost} title="Add as overlay (picture-in-picture)" onClick={() => addMedia(m, 'overlay')}>
                        <Layers className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!proj.media.length && <p className="text-xs text-slate-500">Import several clips and photos. Hover a thumbnail, press + to put it on the timeline (the Layers button adds it as a picture-in-picture overlay).</p>}
          </div>
        )}
        {tab === 'audio' && (
          <div className="space-y-3">
            <label className={`${btnPrimary} w-full cursor-pointer`}>
              <Upload className="h-3.5 w-3.5" /> Add music / audio file
              <input
                type="file"
                multiple
                accept="audio/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files;
                  if (!f) return;
                  await importFiles(f, 'audio');
                  setTab('media');
                  e.target.value = '';
                }}
              />
            </label>
            <button className={`${recording ? 'bg-red-600 text-white' : btnGhost} ${btn} w-full`} onClick={toggleRecord}>
              {recording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {recording ? 'Stop recording' : 'Record voiceover at playhead'}
            </button>
            <div className="rounded-md border border-slate-700 p-2">
              <span className={lab}>Text to speech (Puter AI)</span>
              <textarea className={`${inp} mb-1 min-h-[60px]`} value={ttsText} onChange={(e) => setTtsText(e.target.value)} placeholder="Type what the voice should say" />
              <div className="flex gap-1">
                <select className={inp} value={ttsLang} onChange={(e) => setTtsLang(e.target.value)}>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="hi-IN">Hindi</option>
                </select>
                <button className={btnPrimary} disabled={busy === 'tts'} onClick={makeTts}>
                  {busy === 'tts' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />} Add
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">Audio files you import appear in Media; press + to place them on the Audio track.</p>
          </div>
        )}
        {tab === 'text' && (
          <div className="space-y-2">
            <button className={`${btnPrimary} w-full`} onClick={() => addText('Your text')}>
              <Plus className="h-3.5 w-3.5" /> Add text
            </button>
            <div className="rounded-md border border-slate-700 p-2">
              <span className={lab}>Auto captions (from speech)</span>
              <p className="mb-1 text-[10px] text-slate-500">Select a video/audio clip with speech, then press the button. Uses your Puter AI (sign in on the AI Video Automation tab); if that fails it falls back to an offline model.</p>
              <select className={`${inp} mb-1`} value={capLang} onChange={(e) => setCapLang(e.target.value)}>
                <option value="auto">Language: auto-detect</option>
                <option value="english">English</option>
                <option value="urdu">Urdu</option>
                <option value="hindi">Hindi</option>
                <option value="arabic">Arabic</option>
              </select>
              <select className={`${inp} mb-1`} value={capModel} onChange={(e) => setCapModel(e.target.value)}>
                <option value="Xenova/whisper-tiny">Offline fallback: fast (small download)</option>
                <option value="Xenova/whisper-small">Offline fallback: more accurate (bigger)</option>
              </select>
              <button className={`${btnPrimary} w-full`} disabled={!!busy || !selected || (selected.kind !== 'video' && selected.kind !== 'audio')} onClick={autoCaptions}>
                {busy === 'captions' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Generate captions
              </button>
              {capMsg && <p className="mt-1 text-[10px] text-amber-300">{capMsg}</p>}
            </div>
            {[
              { n: 'Big title', t: 'BIG TITLE', o: { size: 110, y: 0.3, anim: 'pop' as TextAnim, color: '#ffffff' } },
              { n: 'Subtitle', t: 'Subtitle goes here', o: { size: 54, y: 0.85, anim: 'fade' as TextAnim, bg: 'rgba(0,0,0,0.55)' } },
              { n: 'Lower third', t: 'Name · Role', o: { size: 48, y: 0.75, anim: 'slideup' as TextAnim, bg: '#ef4444', stroke: '' } },
              { n: 'Typewriter', t: 'Typing text...', o: { size: 64, y: 0.5, anim: 'typewriter' as TextAnim } },
              { n: 'Yellow caption', t: 'LOOK AT THIS', o: { size: 80, y: 0.8, anim: 'pop' as TextAnim, color: '#facc15' } },
            ].map((p) => (
              <button key={p.n} className={`${btnGhost} w-full justify-start`} onClick={() => addText(p.t, p.o)}>
                <Type className="h-3.5 w-3.5" /> {p.n}
              </button>
            ))}
          </div>
        )}
        {tab === 'stickers' && (
          <div className="grid grid-cols-5 gap-1.5">
            {STICKERS.map((s) => (
              <button key={s} className="rounded-md bg-slate-800 p-1.5 text-2xl hover:bg-slate-700" onClick={() => addText(s, { size: 220, y: 0.5, anim: 'pop', stroke: '', dur: 3 })}>
                {s}
              </button>
            ))}
          </div>
        )}
        {tab === 'effects' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Select a video/photo clip, then click a filter.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(PRESETS).map((k) => (
                <button key={k} disabled={!selected || (selected.kind !== 'video' && selected.kind !== 'image')} className={`${btnGhost} capitalize`} onClick={() => selected && patchClip(selected.id, { preset: k })}>
                  {k}
                </button>
              ))}
            </div>
            <button className={`${btnGhost} w-full`} onClick={() => edit((cs) => cs.map((c) => (c.kind === 'video' || c.kind === 'image' ? { ...c, preset: selected?.preset || 'none' } : c)))} disabled={!selected}>
              Apply this filter to all clips
            </button>
          </div>
        )}
        {tab === 'transitions' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Select a clip, click a transition. It plays at the start of that clip.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(['none', 'fade', 'slide', 'zoom', 'wipe'] as TransType[]).map((k) => (
                <button key={k} disabled={!selected || selected.kind === 'audio'} className={`${btnGhost} capitalize`} onClick={() => selected && patchClip(selected.id, { trans: { ...selected.trans, type: k } })}>
                  {k}
                </button>
              ))}
            </div>
            <button
              className={`${btnGhost} w-full`}
              onClick={() => edit((cs) => cs.map((c, _i, all) => (c.track === 'main' && c.start > 0.05 && all.some((p) => p.track === 'main' && Math.abs(p.start + p.dur - c.start) < 0.06) ? { ...c, trans: { type: selected?.trans.type === 'none' || !selected ? 'fade' : selected.trans.type, dur: 0.6 } } : c)))}
            >
              Apply to all cuts on Main track
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const pose: Pose = selected ? eff(selected, clamp(time - selected.start, 0, selected.dur)) : { x: 0.5, y: 0.5, scale: 1, rot: 0, opacity: 1 };

  const inspector = (
    <div className="h-full overflow-y-auto p-3 text-slate-100">
      {!selected ? (
        <div className="space-y-3">
          <h4 className="text-sm font-bold">Project</h4>
          <div>
            <span className={lab}>Aspect ratio</span>
            <select className={inp} value={proj.settings.aspect} onChange={(e) => setProj((o) => ({ ...o, settings: { ...o.settings, aspect: e.target.value as Settings['aspect'] } }))}>
              <option value="9:16">9:16 (Shorts / Reels / TikTok)</option>
              <option value="16:9">16:9 (YouTube)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="4:5">4:5 (Instagram post)</option>
            </select>
          </div>
          <div>
            <span className={lab}>Export quality</span>
            <select className={inp} value={proj.settings.res} onChange={(e) => setProj((o) => ({ ...o, settings: { ...o.settings, res: Number(e.target.value) as 720 | 1080 } }))}>
              <option value={720}>720p (faster)</option>
              <option value={1080}>1080p (sharper, slower)</option>
            </select>
          </div>
          <div>
            <span className={lab}>Background color</span>
            <input type="color" className="h-8 w-full rounded bg-transparent" value={proj.settings.bgColor} onChange={(e) => setProj((o) => ({ ...o, settings: { ...o.settings, bgColor: e.target.value } }))} />
          </div>
          <p className="text-xs text-slate-500">Click a clip on the timeline (or in the preview) to edit it. Drag objects in the preview to move them.</p>
          <div className="rounded-md bg-slate-900 p-2 text-[11px] leading-5 text-slate-400">
            <b className="text-slate-200">Shortcuts</b>
            <br />
            Space play/pause · S split · Del delete · Ctrl+Z undo · Ctrl+Shift+Z redo · Ctrl+D duplicate · ←/→ frame (Shift = 1s)
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="truncate text-sm font-bold capitalize">{selected.kind === 'text' ? 'Text' : selected.name || selected.kind}</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            <button className={btnGhost} onClick={splitAt} title="Split at playhead (S)">
              <Scissors className="h-3.5 w-3.5" /> Split
            </button>
            <button className={btnGhost} onClick={() => duplicate(selected.id)}>
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
            <button className={btnGhost} onClick={() => rippleDelete(selected.id)} title="Delete and close the gap">
              Ripple
            </button>
            <button className={`${btnGhost} text-red-400`} onClick={() => removeClip(selected.id)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>

          {selected.kind === 'text' && (
            <>
              <div>
                <span className={lab}>Text</span>
                <textarea className={`${inp} min-h-[60px]`} value={selected.text} onChange={(e) => patchClip(selected.id, { text: e.target.value }, 'text')} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className={lab}>Font</span>
                  <select className={inp} value={selected.font} onChange={(e) => patchClip(selected.id, { font: e.target.value })}>
                    {FONTS.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className={lab}>Animation</span>
                  <select className={inp} value={selected.anim} onChange={(e) => patchClip(selected.id, { anim: e.target.value as TextAnim })}>
                    <option value="none">None</option>
                    <option value="fade">Fade in</option>
                    <option value="pop">Pop</option>
                    <option value="slideup">Slide up</option>
                    <option value="typewriter">Typewriter</option>
                  </select>
                </div>
                <div>
                  <span className={lab}>Color</span>
                  <input type="color" className="h-8 w-full rounded bg-transparent" value={selected.color} onChange={(e) => patchClip(selected.id, { color: e.target.value }, 'color')} />
                </div>
                <div>
                  <span className={lab}>Outline</span>
                  <input type="color" className="h-8 w-full rounded bg-transparent" value={selected.stroke || '#000000'} onChange={(e) => patchClip(selected.id, { stroke: e.target.value }, 'stroke')} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={selected.bold} onChange={(e) => patchClip(selected.id, { bold: e.target.checked })} /> Bold
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!selected.bg} onChange={(e) => patchClip(selected.id, { bg: e.target.checked ? 'rgba(0,0,0,0.6)' : '' })} /> Background box
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!selected.stroke} onChange={(e) => patchClip(selected.id, { stroke: e.target.checked ? '#000000' : '' })} /> Outline
                </label>
              </div>
              <Slider label="Size" value={selected.size} min={20} max={300} step={1} onChange={(v) => patchClip(selected.id, { size: v }, 'size')} />
            </>
          )}

          {(selected.kind === 'video' || selected.kind === 'image') && (
            <>
              <Slider label="Scale" value={pose.scale} min={0.1} max={3} onChange={(v) => setPose(selected, { scale: v }, 'scale')} />
              <Slider label="Rotate" value={pose.rot} min={-180} max={180} step={1} unit="°" onChange={(v) => setPose(selected, { rot: v }, 'rot')} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className={lab}>Fit</span>
                  <select className={inp} value={selected.fit} onChange={(e) => patchClip(selected.id, { fit: e.target.value as Clip['fit'] })}>
                    <option value="cover">Fill (crop)</option>
                    <option value="contain">Fit (no crop)</option>
                  </select>
                </div>
                <label className="flex items-end gap-1 pb-1 text-xs">
                  <input type="checkbox" checked={selected.flip} onChange={(e) => patchClip(selected.id, { flip: e.target.checked })} /> Mirror
                </label>
              </div>
              <button className={btnGhost} onClick={() => patchClip(selected.id, { x: 0.5, y: 0.5, scale: 1, rot: 0, kf: [] })}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset position
              </button>
              <div className="border-t border-slate-800 pt-2">
                <span className={lab}>Filter</span>
                <select className={inp} value={selected.preset} onChange={(e) => patchClip(selected.id, { preset: e.target.value })}>
                  {Object.keys(PRESETS).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <Slider label="Brightness" value={selected.brightness} min={0.2} max={2} onChange={(v) => patchClip(selected.id, { brightness: v }, 'br')} />
              <Slider label="Contrast" value={selected.contrast} min={0.2} max={2} onChange={(v) => patchClip(selected.id, { contrast: v }, 'co')} />
              <Slider label="Saturation" value={selected.saturate} min={0} max={3} onChange={(v) => patchClip(selected.id, { saturate: v }, 'sa')} />
              <Slider label="Blur" value={selected.blur} min={0} max={20} step={0.5} unit="px" onChange={(v) => patchClip(selected.id, { blur: v }, 'bl')} />
              <div className="space-y-1.5 border-t border-slate-800 pt-2">
                <span className={lab}>Keyframes (animate position / size / rotation / opacity)</span>
                <div className="flex flex-wrap gap-1">
                  <button className={btnPrimary} onClick={() => addKeyframe(selected)}>
                    ◆ Add keyframe at playhead
                  </button>
                  {selected.kf.length > 0 && (
                    <button className={btnGhost} onClick={() => patchClip(selected.id, { kf: [] })}>
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Move the playhead, add a keyframe, then change position/scale/rotation/opacity at another time. Values glide between keyframes.</p>
                {selected.kf.map((k, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-slate-950 px-2 py-1 text-[11px]">
                    <button className="text-indigo-300 hover:underline" onClick={() => seek(selected.start + k.t)}>
                      ◆ {k.t.toFixed(2)}s
                    </button>
                    <span className="text-slate-500">
                      s{k.scale.toFixed(2)} r{Math.round(k.rot)}° o{k.opacity.toFixed(1)}
                    </span>
                    <button className="text-red-400" onClick={() => patchClip(selected.id, { kf: selected.kf.filter((_, j) => j !== i) })}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 border-t border-slate-800 pt-2">
                <label className="flex items-center gap-1 text-xs font-semibold">
                  <input type="checkbox" checked={selected.chroma.on} onChange={(e) => patchClip(selected.id, { chroma: { ...selected.chroma, on: e.target.checked } })} /> Green screen (remove color)
                </label>
                {selected.chroma.on && (
                  <>
                    <div className="flex items-center gap-2">
                      <input type="color" className="h-7 w-12 rounded bg-transparent" value={selected.chroma.color} onChange={(e) => patchClip(selected.id, { chroma: { ...selected.chroma, color: e.target.value } }, 'chk')} />
                      <span className="text-[10px] text-slate-500">Key color (default green). Put this clip on Overlay above a background.</span>
                    </div>
                    <Slider label="Strength" value={selected.chroma.tol} min={0.05} max={0.8} onChange={(v) => patchClip(selected.id, { chroma: { ...selected.chroma, tol: v } }, 'cht')} />
                  </>
                )}
              </div>
              <div className="border-t border-slate-800 pt-2">
                <span className={lab}>Transition in</span>
                <div className="grid grid-cols-2 gap-2">
                  <select className={inp} value={selected.trans.type} onChange={(e) => patchClip(selected.id, { trans: { ...selected.trans, type: e.target.value as TransType } })}>
                    {['none', 'fade', 'slide', 'zoom', 'wipe'].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                  <input type="number" className={inp} min={0.2} max={2} step={0.1} value={selected.trans.dur} onChange={(e) => patchClip(selected.id, { trans: { ...selected.trans, dur: clamp(Number(e.target.value) || 0.6, 0.2, 2) } })} />
                </div>
              </div>
            </>
          )}

          {selected.kind !== 'text' && selected.kind !== 'image' && (
            <div className="space-y-2 border-t border-slate-800 pt-2">
              {selected.kind === 'video' && (
                <Slider
                  label="Speed"
                  value={selected.speed}
                  min={0.25}
                  max={4}
                  step={0.05}
                  unit="x"
                  onChange={(v) => {
                    const srcLen = selected.dur * selected.speed;
                    patchClip(selected.id, { speed: v, dur: Math.max(0.2, Math.min(srcLen / v, (selected.srcDur - selected.inPt) / v)) }, 'speed');
                  }}
                />
              )}
              <Slider label="Volume" value={selected.vol} min={0} max={2} onChange={(v) => patchClip(selected.id, { vol: v }, 'vol')} />
              <button className={`${btnGhost} w-full`} disabled={!!busy} onClick={autoCaptions}>
                {busy === 'captions' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Type className="h-3.5 w-3.5" />} Auto captions from this clip
              </button>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={selected.muted} onChange={(e) => patchClip(selected.id, { muted: e.target.checked })} /> Mute
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2">
            <Slider label="Fade in" value={selected.fadeIn} min={0} max={Math.min(3, selected.dur)} step={0.1} unit="s" onChange={(v) => patchClip(selected.id, { fadeIn: v }, 'fi')} />
            <Slider label="Fade out" value={selected.fadeOut} min={0} max={Math.min(3, selected.dur)} step={0.1} unit="s" onChange={(v) => patchClip(selected.id, { fadeOut: v }, 'fo')} />
          </div>
          {selected.kind !== 'audio' && <Slider label="Opacity" value={pose.opacity} min={0} max={1} onChange={(v) => setPose(selected, { opacity: v }, 'op')} />}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={lab}>Start (s)</span>
              <input type="number" className={inp} step={0.1} value={Number(selected.start.toFixed(2))} onChange={(e) => patchClip(selected.id, { start: Math.max(0, Number(e.target.value) || 0) }, 'st')} />
            </div>
            <div>
              <span className={lab}>Length (s)</span>
              <input
                type="number"
                className={inp}
                step={0.1}
                value={Number(selected.dur.toFixed(2))}
                onChange={(e) => {
                  const isMedia = selected.kind === 'video' || selected.kind === 'audio';
                  const max = isMedia ? (selected.srcDur - selected.inPt) / selected.speed : 600;
                  patchClip(selected.id, { dur: clamp(Number(e.target.value) || 1, 0.2, max) }, 'du');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[820px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100">
      {/* top bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900 px-3 py-2">
        <Film className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-bold">Video Editor</span>
        <div className="ml-2 flex gap-1">
          <button className={btnGhost} onClick={undo} disabled={!past.current.length && !proj.clips.length} title="Undo (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button className={btnGhost} onClick={redo} title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            className={btnGhost}
            disabled={!proj.clips.length}
            onClick={async () => {
              const name = window.prompt('Project name', saveName || 'My video');
              if (!name) return;
              setSaveName(name);
              try {
                await saveProject(`p-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name);
                toast.success(`Saved "${name}"`);
              } catch {
                toast.error('Could not save (storage full or blocked)');
              }
            }}
            title="Save project in this browser"
          >
            Save
          </button>
          <button className={btnGhost} onClick={openProjects} title="Open a saved project">
            Open
          </button>
          <button className={btnGhost} onClick={clearAll} title="New project">
            <RotateCcw className="h-3.5 w-3.5" /> New
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {savedAt > 0 && <span className="text-[10px] text-emerald-400">Autosaved {new Date(savedAt).toLocaleTimeString()}</span>}
          <span className="text-[11px] text-slate-400">
            {proj.settings.aspect} · {proj.settings.res}p · {fmt(total)}
          </span>
          <button className={`${btnPrimary} !bg-emerald-600 hover:!bg-emerald-500`} disabled={exporting || !proj.clips.length} onClick={runExport}>
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Export
          </button>
        </div>
      </div>

      {/* upper area */}
      <div className="grid min-h-0 flex-1 grid-cols-[230px_minmax(0,1fr)_270px] border-b border-slate-800">
        <div className="min-h-0 border-r border-slate-800 bg-slate-900/60">{lib}</div>

        <div className="flex min-h-0 flex-col items-center justify-center gap-2 bg-black/60 p-2">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              onPointerDown={onCanvasDown}
              onPointerMove={onCanvasMove}
              onPointerUp={() => (canvasDrag.current = null)}
              className="max-h-full max-w-full cursor-move touch-none rounded-md bg-black shadow-xl"
              style={{ aspectRatio: `${W} / ${H}`, maxHeight: 420 }}
            />
          </div>
          <div className="flex w-full items-center gap-2">
            <button className={btnPrimary} onClick={() => (playing ? stopPlay() : startPlay(time >= total - 0.05 ? 0 : time))} disabled={!proj.clips.length}>
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button className={btnGhost} onClick={splitAt} title="Split at playhead (S)">
              <Scissors className="h-3.5 w-3.5" /> Split
            </button>
            <span className="font-mono text-xs text-slate-300">
              {fmt(time)} / {fmt(total)}
            </span>
            <input type="range" className="flex-1" min={0} max={total} step={0.01} value={Math.min(time, total)} onChange={(e) => seek(Number(e.target.value))} />
          </div>
        </div>

        <div className="min-h-0 border-l border-slate-800 bg-slate-900/60">{inspector}</div>
      </div>

      {/* timeline */}
      <div className="h-[250px] shrink-0 bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-1">
          <span className="text-[11px] font-semibold text-slate-400">TIMELINE</span>
          <span className="ml-auto text-[11px] text-slate-500">Zoom</span>
          <input type="range" min={15} max={200} value={pps} onChange={(e) => setPps(Number(e.target.value))} className="w-32" />
        </div>
        <div ref={tlRef} className="relative h-[calc(100%-30px)] overflow-auto">
          <div className="relative" style={{ width: (total + 12) * pps + 70, minHeight: '100%' }}>
            <div className="flex">
              <div className="sticky left-0 z-20 w-[70px] shrink-0 bg-slate-900">
                <div className="h-6 border-b border-slate-800" />
                {TRACKS.map((t) => (
                  <div key={t.id} className="flex h-11 items-center border-b border-slate-800 px-2 text-[10px] font-semibold uppercase text-slate-400">
                    {t.label}
                  </div>
                ))}
              </div>
              <div className="relative" data-lane style={{ width: (total + 12) * pps }}>
                {/* ruler */}
                <div
                  className="relative h-6 cursor-pointer border-b border-slate-800 bg-slate-950"
                  onPointerDown={(e) => {
                    drag.current = { mode: 'head', id: '', x0: 0, orig: null as any, moved: false };
                    seek((e.clientX - e.currentTarget.getBoundingClientRect().left) / pps);
                  }}
                >
                  {rulerTicks.map((s) => (
                    <span key={s} className="absolute top-0 border-l border-slate-700 pl-1 text-[9px] text-slate-500" style={{ left: s * pps }}>
                      {s}s
                    </span>
                  ))}
                </div>
                {TRACKS.map((t) => (
                  <div key={t.id} data-track={t.id} className="relative h-11 border-b border-slate-800 bg-slate-950/40" onPointerDown={() => setSelectedId('')}>
                    {proj.clips
                      .filter((c) => c.track === t.id)
                      .map((c) => (
                        <div
                          key={c.id}
                          onPointerDown={(e) => startDrag(e, 'move', c)}
                          className={`absolute top-1 h-9 cursor-grab select-none overflow-hidden rounded-md border text-[10px] ${
                            selectedId === c.id ? 'border-indigo-300 ring-1 ring-indigo-300' : 'border-slate-600'
                          } ${c.kind === 'audio' ? 'bg-emerald-800/70' : c.kind === 'text' ? 'bg-amber-700/70' : 'bg-slate-700'}`}
                          style={{
                            left: c.start * pps,
                            width: Math.max(8, c.dur * pps),
                            backgroundImage: c.thumb ? `url(${c.thumb})` : undefined,
                            backgroundSize: 'auto 100%',
                            backgroundRepeat: 'repeat-x',
                          }}
                        >
                          <div className="pointer-events-none absolute inset-0 bg-black/35" />
                          <span className="pointer-events-none relative z-10 block truncate px-2 pt-0.5 font-semibold text-white">
                            {c.kind === 'text' ? c.text : c.name || c.kind}
                            {c.speed !== 1 ? ` · ${c.speed}x` : ''}
                          </span>
                          {c.kf.map((k, i) => (
                            <span key={i} className="pointer-events-none absolute bottom-0.5 z-10 text-[9px] leading-none text-yellow-300" style={{ left: k.t * pps - 3 }}>
                              ◆
                            </span>
                          ))}
                          {c.trans.type !== 'none' && c.kind !== 'audio' && c.kind !== 'text' && <span className="pointer-events-none absolute bottom-0 left-0 z-10 h-1 bg-pink-400" style={{ width: c.trans.dur * pps }} />}
                          <div className="absolute inset-y-0 left-0 z-20 w-2 cursor-ew-resize bg-white/40 hover:bg-white/80" onPointerDown={(e) => startDrag(e, 'trimL', c)} />
                          <div className="absolute inset-y-0 right-0 z-20 w-2 cursor-ew-resize bg-white/40 hover:bg-white/80" onPointerDown={(e) => startDrag(e, 'trimR', c)} />
                        </div>
                      ))}
                  </div>
                ))}
                {/* playhead */}
                <div className="pointer-events-none absolute bottom-0 top-0 z-30 w-px bg-red-500" style={{ left: time * pps }}>
                  <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-sm bg-red-500" />
                </div>
              </div>
            </div>
            {!proj.clips.length && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                <ImageIcon className="mr-2 h-4 w-4" /> Import media on the left, then press + to add it here
              </div>
            )}
          </div>
        </div>
      </div>

      {projList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold">Saved projects</h4>
              <button className={btnGhost} onClick={() => setProjList(null)}>
                Close
              </button>
            </div>
            {!projList.length && <p className="text-sm text-slate-400">Nothing saved yet. Press Save in the top bar.</p>}
            <div className="max-h-[360px] space-y-1.5 overflow-y-auto">
              {projList.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {r.clips.length} clips · {new Date(r.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className={btnPrimary}
                      onClick={async () => {
                        setProjList(null);
                        setBusy('open');
                        try {
                          await loadProject(r);
                          toast.success(`Opened "${r.name}"`);
                        } finally {
                          setBusy('');
                        }
                      }}
                    >
                      Open
                    </button>
                    <button className={`${btnGhost} text-red-400`} onClick={() => deleteProject(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* export overlay */}
      {(exporting || result) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-center">
            {exporting ? (
              <>
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-400" />
                <p className="text-sm font-semibold">Exporting… {Math.round(exportPct)}%</p>
                <div className="mx-auto mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full bg-emerald-500" style={{ width: `${exportPct}%` }} />
                </div>
                <p className="mt-3 text-xs text-slate-400">Keep this browser window open. The video is recorded in real time.</p>
              </>
            ) : (
              result && (
                <>
                  <video src={result.url} controls className="mx-auto max-h-[360px] w-full rounded-lg bg-black" />
                  <p className="mt-2 text-xs text-slate-400">
                    {result.ext.toUpperCase()} · {(result.size / 1048576).toFixed(1)} MB
                  </p>
                  <div className="mt-3 flex justify-center gap-2">
                    <a className={`${btnPrimary} !bg-emerald-600 hover:!bg-emerald-500`} href={result.url} download={`edited-video.${result.ext}`}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                    <button className={btnGhost} onClick={() => setResult(null)}>
                      Close
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
