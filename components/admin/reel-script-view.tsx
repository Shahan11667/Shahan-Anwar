'use client';

import React, { useState } from 'react';
import { Copy, Loader2, Wand2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiText, extractJson } from '@/lib/video-studio-ai';

/**
 * Reel Script writer, built on the "Easy Reel Script Guide" master prompt:
 * HOOK + PROBLEM + SOLUTION + RESULT + CTA, simple natural spoken language, visuals kept separate from the dialogue.
 */

const GOALS = ['teach', 'entertain', 'connect', 'inspire', 'promote'] as const;
const LANGS = [
  { id: 'Hinglish', label: 'Hinglish' },
  { id: 'Hindi', label: 'Hindi' },
  { id: 'English', label: 'English' },
  { id: 'Roman Urdu', label: 'Roman Urdu' },
];
const DURATIONS = [15, 30, 45, 60] as const;
const STYLES = ['friendly', 'funny', 'emotional', 'bold', 'calm'] as const;

const PARTS = ['HOOK', 'PROBLEM', 'SOLUTION', 'RESULT', 'CTA'] as const;
type Part = (typeof PARTS)[number];
const PART_TONE: Record<Part, string> = {
  HOOK: 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300',
  PROBLEM: 'bg-amber-950/40 border-amber-700/50 text-amber-300',
  SOLUTION: 'bg-pink-950/40 border-pink-700/50 text-pink-300',
  RESULT: 'bg-teal-950/40 border-teal-700/50 text-teal-300',
  CTA: 'bg-sky-950/40 border-sky-700/50 text-sky-300',
};

interface Script {
  parts: { part: Part; line: string; visual: string }[];
  speakingTime: string;
}

const card = 'rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4';
const btn = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50';
const btnGhost = `${btn} border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700`;
const btnPrimary = `${btn} bg-indigo-600 text-white hover:bg-indigo-500`;
const input = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none';
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400';

/** The rules of the master prompt (kept word for word in spirit, so the output follows the guide). */
export const REEL_RULES = [
  'Follow this exact structure: HOOK + PROBLEM + SOLUTION + RESULT + CTA.',
  'Start with an interesting, relevant hook. No fake shock, clickbait, or unrelated drama.',
  'Show one clear, relatable problem and give one practical, useful solution.',
  'State a realistic benefit. Never promise guaranteed views, followers, money, or results.',
  'End with ONE suitable CTA only.',
  'Use simple, natural spoken language. Keep sentences short and easy to say aloud.',
  'Label each part separately: HOOK, PROBLEM, SOLUTION, RESULT, CTA.',
  'Keep the spoken dialogue within the requested video duration. Remove filler, repeated ideas, and unnecessary words.',
  'Add simple visual/action suggestions separately. Do not mix them into the spoken dialogue.',
  'Read-check the script mentally: it should sound smooth and natural when spoken aloud.',
];

export function buildReelPrompt(d: { topic: string; audience: string; goal: string; language: string; duration: number; style: string }) {
  const system = `You are my expert Instagram Reel scriptwriter. Create a short, engaging, natural script that sounds like a real creator, not a robot.\nRULES\n${REEL_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n')}\nMake the script specific to the topic and audience. Give value quickly. Do not add a long introduction or explain the formula.`;
  const user = `MY DETAILS
- Topic: ${d.topic}
- Target audience: ${d.audience || 'general viewers interested in this topic'}
- Goal: ${d.goal}
- Language: ${d.language} (write the spoken lines in this language, simple and natural)
- Video duration: ${d.duration} seconds (about ${Math.round(d.duration * 2.3)} spoken words in total, NEVER more than ${wordLimit(d.duration)}; count them)
- Creator style: ${d.style}

Return ONLY JSON:
{"parts":[{"part":"HOOK","line":"spoken words only, no visuals","visual":"simple shot/action suggestion"},{"part":"PROBLEM","line":"","visual":""},{"part":"SOLUTION","line":"","visual":""},{"part":"RESULT","line":"","visual":""},{"part":"CTA","line":"","visual":""}],"speakingTime":"approximate speaking time, e.g. about 28 seconds"}
Exactly these five parts, in this order.`;
  return { system, user };
}

/** Turns the AI answer into a safe, complete script (always five parts in order). Throws when it is unusable. */
export function normalizeScript(raw: any): Script {
  const list: any[] = Array.isArray(raw?.parts) ? raw.parts : [];
  const parts = PARTS.map((p) => {
    const found = list.find((x) => String(x?.part || '').trim().toUpperCase() === p);
    return { part: p, line: String(found?.line || '').trim(), visual: String(found?.visual || '').trim() };
  });
  if (parts.some((x) => !x.line)) throw new Error('The script was incomplete. Please try again.');
  return { parts, speakingTime: String(raw?.speakingTime || '').trim() };
}

/** About 2.3 spoken words per second; a little room is allowed. */
export const wordLimit = (duration: number) => Math.round(duration * 2.3 * 1.1);
export const countWords = (s: Script) => s.parts.map((p) => p.line).join(' ').split(/\s+/).filter(Boolean).length;

export function scriptToText(s: Script): string {
  const nl = '\n';
  return (
    'SPOKEN SCRIPT' + nl + s.parts.map((p) => `${p.part}: ${p.line}`).join(nl) + nl + nl +
    'VISUAL SUGGESTIONS' + nl + s.parts.map((p) => `${p.part}: ${p.visual}`).join(nl) + nl + nl +
    `APPROX. SPEAKING TIME: ${s.speakingTime || '-'}`
  );
}

export default function ReelScriptView() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState<string>('teach');
  const [language, setLanguage] = useState('Hinglish');
  const [duration, setDuration] = useState<number>(30);
  const [style, setStyle] = useState<string>('friendly');
  const [busy, setBusy] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [copied, setCopied] = useState('');

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const generate = async () => {
    if (!topic.trim()) return toast.error('Write a topic first');
    setBusy(true);
    try {
      const { system, user } = buildReelPrompt({ topic: topic.trim(), audience: audience.trim(), goal, language, duration, style });
      const limit = wordLimit(duration);
      let result: Script | null = null;
      let lastErr = '';
      // up to 3 tries; a script that is too long for the duration is sent back to be shortened, the shortest one wins
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const extra = result ? `\nYour last script had ${countWords(result)} words, which is too long. Rewrite it with at most ${limit} spoken words in total (each part one short sentence).` : '';
          const next = normalizeScript(extractJson<any>(await aiText(system, user + extra)));
          if (!result || countWords(next) < countWords(result)) result = next;
          if (countWords(result) <= limit) break;
        } catch (e: any) {
          lastErr = e?.message || 'Failed';
        }
      }
      if (!result) throw new Error(lastErr);
      setScript(result);
      if (countWords(result) > limit) toast(`The script is a little long for ${duration}s. Shorten a line or two.`);
    } catch (e: any) {
      toast.error(e?.message || 'Could not write the script');
    } finally {
      setBusy(false);
    }
  };

  const setLine = (i: number, v: string) => setScript((s) => (s ? { ...s, parts: s.parts.map((p, k) => (k === i ? { ...p, line: v } : p)) } : s));
  const words = script ? countWords(script) : 0;

  return (
    <div className="space-y-4">
      <div className={card}>
        <h2 className="mb-1 text-lg font-bold text-slate-100">Reel Script Writer</h2>
        <p className="mb-4 text-xs text-slate-400">
          5-step formula: Hook, Problem, Solution, Result, CTA. One Reel = one main message. Spoken lines and visuals are kept separate.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Topic</label>
            <input className={input} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. People struggle to write Instagram Reel scripts" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Target audience (optional)</label>
            <input className={input} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Who is this for?" />
          </div>
          <div>
            <label className={label}>Goal</label>
            <select className={input} value={goal} onChange={(e) => setGoal(e.target.value)}>
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Language</label>
            <select className={input} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Video duration</label>
            <select className={input} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d} seconds</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Creator style</label>
            <select className={input} value={style} onChange={(e) => setStyle(e.target.value)}>
              {STYLES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={btnPrimary} onClick={generate} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {script ? 'Write again' : 'Write script'}
          </button>
        </div>
      </div>

      {script && (
        <div className={card} data-testid="reel-script">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-100">A) Final spoken script</h3>
            <span className="text-xs text-slate-400">
              {words} words{script.speakingTime ? ` · ${script.speakingTime}` : ''} · target {duration}s
            </span>
          </div>
          <div className="space-y-2">
            {script.parts.map((p, i) => (
              <div key={p.part} className={`rounded-lg border p-3 ${PART_TONE[p.part]}`}>
                <div className="mb-1 text-[11px] font-bold tracking-wider">{p.part}</div>
                <textarea
                  className="w-full resize-y rounded bg-slate-950/60 px-2 py-1.5 text-sm text-slate-100 focus:outline-none"
                  rows={2}
                  value={p.line}
                  onChange={(e) => setLine(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <h3 className="mb-2 mt-4 text-sm font-bold text-slate-100">B) Visual suggestions (not spoken)</h3>
          <div className="space-y-1.5">
            {script.parts.map((p) => (
              <div key={p.part} className="flex gap-2 text-sm text-slate-300">
                <span className="w-20 shrink-0 text-[11px] font-bold tracking-wider text-slate-500">{p.part}</span>
                <span>{p.visual || '-'}</span>
              </div>
            ))}
          </div>

          <h3 className="mb-1 mt-4 text-sm font-bold text-slate-100">C) Approx. speaking time</h3>
          <p className="text-sm text-slate-300">{script.speakingTime || '-'}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className={btnGhost} onClick={() => copy(script.parts.map((p) => p.line).join('\n'), 'spoken')}>
              {copied === 'spoken' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy spoken script
            </button>
            <button className={btnGhost} onClick={() => copy(scriptToText(script), 'all')}>
              {copied === 'all' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy everything
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Tip: give one Reel one clear job. A useful, specific script beats a long script full of ideas.</p>
        </div>
      )}
    </div>
  );
}
