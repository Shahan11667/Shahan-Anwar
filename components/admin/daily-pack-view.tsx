'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Loader2, RefreshCw, Trash2, Check, Wand2, Calendar, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { importPackToStudio } from '@/components/admin/youtube-automation-view';

interface Pack {
  _id: string;
  dateKey: string;
  genre: string;
  title: string;
  idea: string;
  story: string;
  characters: { name: string; description: string }[];
  scenes: { prompt: string; narration: string; caption: string; duration: number }[];
  thumbnail: { headline: string; badge: string; imagePrompt: string };
  seo: Record<'youtube' | 'tiktok' | 'instagram' | 'facebook', { title: string; description: string; hashtags: string; tags: string }>;
  status: 'new' | 'used';
  source: 'cron' | 'manual';
  createdAt: string;
}

const PLATFORMS: { id: 'youtube' | 'tiktok' | 'instagram' | 'facebook'; label: string }[] = [
  { id: 'youtube', label: 'YouTube Shorts' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram Reels' },
  { id: 'facebook', label: 'Facebook Reels' },
];

const card = 'rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4';
const btn = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50';
const btnGhost = `${btn} border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700`;
const btnPrimary = `${btn} bg-indigo-600 text-white hover:bg-indigo-500`;
const input = 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none';

const NL = String.fromCharCode(10);

export default function DailyPackView({ onOpenStudio }: { onOpenStudio: () => void }) {
  const [key, setKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem('studioKey') || '';
    } catch {
      return '';
    }
  });
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(false);
  const [making, setMaking] = useState(false);
  const [hint, setHint] = useState('');
  const [open, setOpen] = useState<string>('');
  const [plat, setPlat] = useState<'youtube' | 'tiktok' | 'instagram' | 'facebook'>('youtube');

  const api = useCallback(
    async (method: string, body?: unknown, query = '') => {
      const res = await fetch(`/api/admin/automation/daily-packs${query}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-studio-key': key },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || `Request failed (${res.status})`);
      return j;
    },
    [key]
  );

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    try {
      const j = await api('GET');
      setPacks(j.packs);
      if (j.packs.length && !open) setOpen(j.packs[0]._id);
      try {
        sessionStorage.setItem('studioKey', key);
      } catch {
        /* ignore */
      }
    } catch (e: any) {
      toast.error(e?.message || 'Could not load');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, api]);

  useEffect(() => {
    if (key) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const make = async () => {
    setMaking(true);
    try {
      const j = await api('POST', { hint });
      setPacks((o) => [j.pack, ...o]);
      setOpen(j.pack._id);
      toast.success('New pack is ready');
    } catch (e: any) {
      toast.error(e?.message || 'Could not create pack');
    } finally {
      setMaking(false);
    }
  };

  const copy = (text: string, what: string) =>
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${what} copied`),
      () => toast.error('Copy failed')
    );

  const chars = (p: Pack) => p.characters.map((c) => `${c.name}: ${c.description}`).join(NL);
  const sceneText = (p: Pack, i: number) => {
    const s = p.scenes[i];
    return `${s.prompt}${s.narration ? NL + NL + 'Dialogue: ' + s.narration : ''}`;
  };
  const allScenes = (p: Pack) =>
    p.scenes.map((_, i) => `=== SCENE ${i + 1} of ${p.scenes.length} ===${NL}${sceneText(p, i)}`).join(NL + NL);

  const mark = async (p: Pack, status: 'new' | 'used') => {
    try {
      await api('PATCH', { id: p._id, status });
      setPacks((o) => o.map((x) => (x._id === p._id ? { ...x, status } : x)));
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    }
  };

  const remove = async (p: Pack) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try {
      await api('DELETE', undefined, `?id=${p._id}`);
      setPacks((o) => o.filter((x) => x._id !== p._id));
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    }
  };

  const toStudio = (p: Pack) => {
    importPackToStudio(p);
    toast.success('Pack sent to AI Video Studio');
    onOpenStudio();
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Calendar className="h-5 w-5 text-indigo-400" /> Daily Content Pack
          </h2>
          <p className="text-sm text-slate-400">
            A new video package is prepared for you automatically every day: story, scene prompts to paste into Google Flow, thumbnail and SEO for every platform.
          </p>
        </div>
      </div>

      <div className={`${card} flex flex-wrap items-center gap-2`}>
        <input type="password" className={`${input} w-64`} placeholder="Studio publish password" value={key} onChange={(e) => setKey(e.target.value)} />
        <button className={btnGhost} disabled={!key || loading} onClick={load}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Load packs
        </button>
        <input className={`${input} min-w-[220px] flex-1`} placeholder="Optional hint for a new pack (e.g. Eid outfit challenge)" value={hint} onChange={(e) => setHint(e.target.value)} />
        <button className={btnPrimary} disabled={!key || making} onClick={make}>
          {making ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Create one now
        </button>
      </div>

      {!packs.length && !loading && <p className="text-sm text-slate-500">No packs yet. Enter your password and press Load packs, or create one now. The daily one appears by itself after the first scheduled run.</p>}

      {packs.map((p) => {
        const isOpen = open === p._id;
        const seo = p.seo?.[plat];
        return (
          <div key={p._id} className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button className="min-w-0 text-left" onClick={() => setOpen(isOpen ? '' : p._id)}>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">{p.dateKey}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${p.status === 'used' ? 'bg-slate-700 text-slate-400' : 'bg-emerald-600/30 text-emerald-300'}`}>{p.status === 'used' ? 'USED' : 'NEW'}</span>
                  <span className="text-[10px] text-slate-500">{p.source === 'cron' ? 'auto' : 'manual'}</span>
                </div>
                <h3 className="mt-1 truncate text-base font-bold text-white">{p.title}</h3>
                <p className="truncate text-xs text-slate-400">{p.idea}</p>
              </button>
              <div className="flex gap-1.5">
                <button className={btnPrimary} onClick={() => toStudio(p)} title="Open in AI Video Studio to generate images, voice and edit">
                  <ExternalLink className="h-3.5 w-3.5" /> Send to Studio
                </button>
                <button className={btnGhost} onClick={() => mark(p, p.status === 'used' ? 'new' : 'used')}>
                  <Check className="h-3.5 w-3.5" /> {p.status === 'used' ? 'Mark new' : 'Mark used'}
                </button>
                <button className={`${btnGhost} text-red-400`} onClick={() => remove(p)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="mt-4 space-y-5">
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">1. Scenes for Google Flow ({p.scenes.length})</h4>
                    <button className={btnPrimary} onClick={() => copy(allScenes(p), 'All scenes')}>
                      <Copy className="h-3.5 w-3.5" /> Copy all scenes
                    </button>
                  </div>
                  <div className="mb-2 rounded-lg bg-slate-950 p-2 text-xs text-slate-400">
                    <b className="text-slate-200">Characters</b> (each scene prompt already repeats these, so they stay the same):
                    <pre className="mt-1 whitespace-pre-wrap font-sans">{chars(p)}</pre>
                  </div>
                  <div className="space-y-2">
                    {p.scenes.map((s, i) => (
                      <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300">
                            Scene {i + 1} · {s.duration}s
                          </span>
                          <button className={btnGhost} onClick={() => copy(sceneText(p, i), `Scene ${i + 1}`)}>
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-slate-200">{s.prompt}</p>
                        {s.narration && <p className="mt-1 text-xs text-amber-300">Dialogue: {s.narration}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-bold text-white">2. Thumbnail</h4>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{p.thumbnail.badge}</span>
                      <span className="text-lg font-extrabold text-white">{p.thumbnail.headline}</span>
                      <button className={btnGhost} onClick={() => copy(p.thumbnail.headline, 'Thumbnail text')}>
                        <Copy className="h-3 w-3" /> Text
                      </button>
                    </div>
                    <p className="text-xs text-slate-300">{p.thumbnail.imagePrompt}</p>
                    <button className={`${btnGhost} mt-2`} onClick={() => copy(p.thumbnail.imagePrompt, 'Thumbnail prompt')}>
                      <Copy className="h-3 w-3" /> Copy image prompt
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-bold text-white">3. Title, description & tags</h4>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {PLATFORMS.map((pl) => (
                      <button key={pl.id} onClick={() => setPlat(pl.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${plat === pl.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                        {pl.label}
                      </button>
                    ))}
                  </div>
                  {seo && (
                    <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
                      {(
                        [
                          ['Title', seo.title],
                          ['Description', seo.description],
                          ['Hashtags', seo.hashtags],
                          ...(seo.tags ? [['Tags', seo.tags]] : []),
                        ] as [string, string][]
                      ).map(([name, val]) => (
                        <div key={name}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-slate-500">{name}</span>
                            <button className={btnGhost} onClick={() => copy(val, name)}>
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                          </div>
                          <p className="whitespace-pre-wrap text-slate-200">{val}</p>
                        </div>
                      ))}
                      <button className={btnPrimary} onClick={() => copy(`${seo.title}${NL}${NL}${seo.description}${NL}${NL}${seo.hashtags}`, 'Full post')}>
                        <Copy className="h-3 w-3" /> Copy everything for this platform
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
