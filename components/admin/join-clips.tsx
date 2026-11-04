'use client';

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDown, ArrowUp, Film, Loader2, Plus, Trash2 } from 'lucide-react';
import { pickMime, makeTicker } from '@/lib/video-render';

interface Clip {
  id: string;
  file: File;
  url: string;
  duration: number;
}

export interface JoinedVideo {
  url: string;
  ext: string;
  size: number;
  blob: Blob;
}

// Kept outside React so the clips survive going back and forth between the steps.
let clipCache: Clip[] = [];

const btn = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const primary = `${btn} bg-indigo-600 text-white hover:bg-indigo-500`;
const ghost = `${btn} border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700`;
const card = 'rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const uid = () => Math.random().toString(36).slice(2, 10);

function readDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => resolve(Number.isFinite(v.duration) ? v.duration : 0);
    v.onerror = () => resolve(0);
    v.src = url;
  });
}

/** Plays the clips one after another into a canvas + Web Audio and records the result (real time). */
async function joinClips(clips: Clip[], vertical: boolean, onProgress: (p: number) => void, signal: { cancelled: boolean }): Promise<{ blob: Blob; ext: string }> {
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser cannot record video. Use Chrome or Edge.');
  const W = vertical ? 720 : 1280;
  const H = vertical ? 1280 : 720;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  const ac = new AudioContext();
  await ac.resume();
  const dest = ac.createMediaStreamDestination();
  const videos = clips.map((c) => {
    const v = document.createElement('video');
    v.src = c.url;
    v.playsInline = true;
    v.preload = 'auto';
    v.crossOrigin = 'anonymous';
    ac.createMediaElementSource(v).connect(dest);
    return v;
  });

  const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const { mime, ext } = pickMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6_000_000 } : undefined);
  const parts: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
  const finished = new Promise<void>((r) => (rec.onstop = () => r()));

  let current: HTMLVideoElement | null = null;
  const draw = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const v = current;
    if (!v || !v.videoWidth) return;
    // fill the frame (crop the edges) so there are no black bars
    const s = Math.max(W / v.videoWidth, H / v.videoHeight);
    const dw = v.videoWidth * s;
    const dh = v.videoHeight * s;
    ctx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
  };
  const stopTicker = makeTicker(1000 / 30, draw);
  let wake: any = null;
  try {
    wake = await (navigator as any).wakeLock?.request('screen');
  } catch {
    /* optional */
  }

  const total = clips.reduce((a, c) => a + (c.duration || 0), 0) || 1;
  let doneTime = 0;
  try {
    rec.start(500);
    for (let i = 0; i < videos.length; i++) {
      if (signal.cancelled) break;
      const v = videos[i];
      current = v;
      v.currentTime = 0;
      try {
        await v.play();
      } catch {
        continue; // unreadable clip: skip it
      }
      await new Promise<void>((resolve) => {
        const tick = setInterval(() => {
          onProgress(Math.min(99, ((doneTime + v.currentTime) / total) * 100));
          if (signal.cancelled) {
            v.pause();
            clearInterval(tick);
            resolve();
          }
        }, 250);
        v.onended = () => {
          clearInterval(tick);
          resolve();
        };
        v.onerror = () => {
          clearInterval(tick);
          resolve();
        };
      });
      doneTime += clips[i].duration || v.duration || 0;
    }
  } finally {
    stopTicker();
    if (rec.state !== 'inactive') rec.stop();
    await finished;
    stream.getTracks().forEach((t) => t.stop());
    ac.close().catch(() => undefined);
    try {
      wake?.release();
    } catch {
      /* ignore */
    }
  }
  if (signal.cancelled) throw new Error('Cancelled');
  return { blob: new Blob(parts, { type: mime || 'video/webm' }), ext };
}

export default function JoinClips({ joined, onJoined, onNext }: { joined: JoinedVideo | null; onJoined: (v: JoinedVideo) => void; onNext: () => void }) {
  const [clips, setClipsState] = useState<Clip[]>(clipCache);
  const [vertical, setVertical] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancel = useRef({ cancelled: false });

  const setClips = (c: Clip[]) => {
    clipCache = c;
    setClipsState(c);
  };

  useEffect(() => {
    setClipsState(clipCache);
  }, []);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const added: Clip[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('video/')) {
        toast.error(`${f.name} is not a video`);
        continue;
      }
      const url = URL.createObjectURL(f);
      added.push({ id: uid(), file: f, url, duration: await readDuration(url) });
    }
    setClips(clipCache.concat(added));
  };

  const move = (i: number, d: number) => {
    const a = clips.slice();
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setClips(a);
  };
  const remove = (id: string) => {
    const c = clips.find((x) => x.id === id);
    if (c) URL.revokeObjectURL(c.url);
    setClips(clips.filter((x) => x.id !== id));
  };

  const total = clips.reduce((a, c) => a + c.duration, 0);

  const run = async () => {
    if (!clips.length) return toast.error('Add your video clips first');
    cancel.current = { cancelled: false };
    setBusy(true);
    setProgress(0);
    try {
      const r = await joinClips(clips, vertical, setProgress, cancel.current);
      onJoined({ url: URL.createObjectURL(r.blob), ext: r.ext, size: r.blob.size, blob: r.blob });
      toast.success('Videos joined');
    } catch (e: any) {
      if (e?.message !== 'Cancelled') toast.error(e?.message || 'Could not join the videos');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <h3 className="text-base font-bold text-white">1. Add your video clips</h3>
        <p className="mt-1 text-sm text-slate-400">Pick all the clips you made in Google Flow (you can select many at once). They are joined in the order shown below.</p>
        <label className={`${primary} mt-3 cursor-pointer`}>
          <Plus className="h-4 w-4" /> Upload videos
          <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        </label>

        {clips.length > 0 && (
          <ul className="mt-3 space-y-2">
            {clips.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 p-2">
                <video src={c.url} className="h-16 w-10 rounded bg-black object-cover" muted preload="metadata" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{i + 1}. {c.file.name}</p>
                  <p className="text-xs text-slate-500">{fmt(c.duration)}</p>
                </div>
                <button className={ghost} disabled={i === 0} onClick={() => move(i, -1)} title="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button className={ghost} disabled={i === clips.length - 1} onClick={() => move(i, 1)} title="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button className={ghost} onClick={() => remove(c.id)} title="Remove"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={card}>
        <h3 className="text-base font-bold text-white">2. Join them</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" value={vertical ? 'v' : 'h'} onChange={(e) => setVertical(e.target.value === 'v')}>
            <option value="v">Vertical 9:16 (Shorts / Reels / TikTok)</option>
            <option value="h">Horizontal 16:9 (YouTube)</option>
          </select>
          {busy ? (
            <>
              <div className="h-2 w-56 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} /></div>
              <span className="text-sm text-slate-300">{Math.round(progress)}%</span>
              <button className={ghost} onClick={() => (cancel.current.cancelled = true)}>Cancel</button>
            </>
          ) : (
            <button className={primary} disabled={!clips.length} onClick={run}>
              <Film className="h-4 w-4" /> Join {clips.length || ''} video{clips.length === 1 ? '' : 's'}
            </button>
          )}
          {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Joining plays the clips once, so it takes about as long as the videos ({fmt(total)}). Keep this window open until it finishes.
        </p>
      </div>

      {joined && (
        <div className={card}>
          <h3 className="text-base font-bold text-white">Your joined video</h3>
          <video src={joined.url} controls className="mt-2 max-h-[420px] rounded-xl bg-black" />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a href={joined.url} download={`joined-video.${joined.ext}`} className={ghost}>Download</a>
            <button className={primary} onClick={onNext}>Next: Title, description & tags</button>
            <span className="text-xs text-slate-500">{joined.ext.toUpperCase()} · {(joined.size / 1048576).toFixed(1)} MB</span>
          </div>
        </div>
      )}
    </div>
  );
}
