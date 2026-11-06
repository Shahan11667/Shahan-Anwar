'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Copy, Plus, Trash2, Check, Upload, Search, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ExternalLink, RotateCcw, Download, ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import JoinClips from '@/components/admin/join-clips';
import { extractJson, fileToDataUrl, toJpegDataUrl, aiText, downloadBlob } from '@/lib/video-studio-ai';
import { loadImage } from '@/lib/video-render';
import { BESHAAN, HEART, HEART_FOCUS, ANGLES, FOCUS_THEMES, LANG_LABEL, DIALOGUE_RULES, isBeshaan, isHeart, focusFor, storyContext } from '@/lib/beshaan';

/* ------------------------------------------------------------------ types */

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook';

interface Scene {
  id: string;
  prompt: string; // the full Google Flow prompt (copy-paste)
  dialogue: string; // spoken lines, used for the SEO text
  duration: number;
}

interface Character {
  name: string;
  description: string;
}

interface Thumb {
  bg: string;
  headline: string;
  badge: string;
  textColor: string;
  accent: string;
  position: 'top' | 'center' | 'bottom';
}

/** One title, description and hashtags for every platform. */
interface Seo {
  title: string;
  description: string;
  hashtags: string;
}

/** One beat of the story = one scene. `endsWith` is the last moment of that clip; the next scene starts from it. */
interface Beat {
  what: string;
  who: string;
  emotion: string;
  endsWith: string;
}

/** The story plan every scene is written from, so the scenes connect (same place, same outfits, cause -> effect). */
interface Blueprint {
  setting: string;
  props: string;
  beats: Beat[];
}

interface Project {
  step: number;
  prompt: string;
  promptEdited: boolean;
  genre: string;
  focus: string;
  lesson: string;
  mood: string;
  setting: string;
  cast: string;
  idea: string;
  sceneCount: number;
  seriesParts: 1 | 5 | 10;
  series: { key: string; title: string; summary: string; parts: { title: string; summary: string }[] } | null;
  partIdx: number;
  ideaHistory: string[];
  usedThemes: string[];
  style: string;
  format: 'vertical' | 'horizontal';
  language: 'roman_urdu' | 'english' | 'urdu';
  title: string;
  story: string;
  characters: Character[];
  scenes: Scene[];
  thumb: Thumb;
  seo: Seo | null;
  blueprint: Blueprint | null;
}

/* step numbers (the Characters step was removed: the AI writes the characters, each scene repeats their look) */
const STEP_WRITE = 0;
const STEP_SCENES = 1;
const STEP_JOIN = 2;
const STEP_POST = 3;
const STEPS = ['Write Prompt', 'Scene Prompts', 'Join Videos', 'Post'];

/** Turns the AI's scene fields into one complete, copy-paste prompt for Google Flow / Veo (one clip per scene). */
function flowPrompt(s: any, i: number, total: number, style: string, vertical: boolean): { prompt: string; dialogue: string; duration: number } {
  const nl = String.fromCharCode(10);
  const duration = Math.min(10, Math.max(4, Number(s?.duration) || 8));
  const lines: any[] = (Array.isArray(s?.dialogue) ? s.dialogue : []).filter((d: any) => d && String(d.line || '').trim()).slice(0, 4);
  const clean = (t: any) => String(t || '').trim().replace(/^["“”]+|["“”]+$/g, '');
  const dlg = lines
    .map((d) => `${d.emoji || '🗣️'} ${clean(d.speaker) || 'Narrator'}${d.delivery ? ` (${clean(d.delivery)})` : ''}: “${clean(d.line)}”`)
    .join(nl + nl);
  const visual = String(s?.visual || s?.prompt || '').trim();
  const end = [
    clean(s?.ending),
    `${(clean(s?.music) || 'Soft fitting background music').replace(/^./, (c) => c.toUpperCase())}, natural facial expressions, smooth animation, ${clean(s?.lighting) || 'cinematic lighting'}, ${vertical ? 'vertical 9:16 format' : 'horizontal 16:9 format'}, high-quality visuals, ${duration} seconds long.`,
    'Keep the characters consistent with the reference images.',
    lines.length > 1 ? 'Ensure all dialogues are spoken clearly with accurate lip-sync.' : lines.length ? 'Ensure the dialogue is spoken clearly with accurate lip-sync.' : 'No spoken dialogue in this shot.',
  ]
    .filter(Boolean)
    .join(' ');
  const prompt = [
    `AI Video Prompt (${duration} Seconds) | Scene ${i + 1} of ${total}`,
    `Create a ${style} AI video based on the reference images. ${visual}`,
    lines.length ? `Dialogue:${nl}${nl}${dlg}` : '',
    end,
  ]
    .filter(Boolean)
    .join(nl + nl);
  const dialogue = lines.map((d) => `${clean(d.speaker) || 'Narrator'}: ${clean(d.line)}`).join(' ');
  return { prompt, dialogue, duration };
}

const STYLES = [
  'cinematic anime style',
  'Pixar-style 3D animation',
  'cinematic photorealistic 8k',
  'comic book illustration',
  'watercolor storybook',
  'dark moody cinematic',
];

type NicheOption = { id: string; group: string; icon: string; label: string; genre: string; focus?: string; desc: string; cast?: string; mood?: string; setting?: string };
const G_HEART = 'Heartfelt Stories (new)';
const G_BESHAAN = 'Beshaan';
const G_OTHER = 'Other niches';
const NICHE_OPTIONS: NicheOption[] = [
  { id: 'heart-emotional', group: G_HEART, icon: '🌸', label: 'Emotional Stories', genre: HEART, focus: 'Emotional Stories', cast: 'Family (3 members)', mood: 'Emotional', setting: 'Family home (living room)', desc: 'Touching everyday stories that make the viewer feel: regret, reunion, kindness, missing someone. One clear lesson at the end.' },
  { id: 'heart-family', group: G_HEART, icon: '❤️', label: 'Family Relationship Stories', genre: HEART, focus: 'Family Relationship Stories', cast: 'Family (4-5 members)', mood: 'Emotional', setting: 'Family home (living room)', desc: 'Siblings, in-laws, grandparents and cousins: misunderstandings, sacrifice and making peace.' },
  { id: 'heart-parents', group: G_HEART, icon: '👨‍👩‍👧', label: 'Maa-Baap Ki Mohabbat', genre: HEART, focus: 'Maa-Baap Ki Mohabbat', cast: 'Mother + child', mood: 'Emotional', setting: 'Kitchen at home', desc: 'The silent love and sacrifices of mothers and fathers, and children who finally understand.' },
  { id: 'heart-couple', group: G_HEART, icon: '💕', label: 'Husband-Wife Ka Pyara Rishta', genre: HEART, focus: 'Husband-Wife Ka Pyara Rishta', cast: 'Husband + wife', mood: 'Heartwarming', setting: 'Family home (living room)', desc: 'A respectful, modest married couple: small everyday care, patience, saying sorry and saying thank you.' },
  { id: 'heart-islamic', group: G_HEART, icon: '🕌', label: 'Islamic Moral Stories', genre: HEART, focus: 'Islamic Moral Stories', cast: 'Family (3 members)', mood: 'Heartwarming', setting: 'Family home (living room)', desc: 'Everyday stories that show Islamic values (honesty, sabr, shukr, forgiveness, sadaqah). No prophets or holy figures are shown and no Quran verse or hadith is quoted.' },
  { id: 'heart-life', group: G_HEART, icon: '✨', label: 'Zindagi Badalne Wale Sabak', genre: HEART, focus: 'Zindagi Badalne Wale Sabak', cast: '2-3 people (any relation)', mood: 'Heartwarming', setting: 'Family home (living room)', desc: 'Life lessons that change a person: failing and trying again, time, good friends, habits, humility.' },
  { id: 'beshaan-life', group: G_BESHAAN, icon: '💡', label: 'Beshaan Life Stories', genre: BESHAAN, focus: 'Life lessons', cast: '2 girls + 1 boy', mood: 'Fun & energetic', desc: 'Life-based stories with a lesson: everyday drama, pranks and challenges that people relate to. 2 girls + 1 boy.' },
  { id: 'beshaan-fashion', group: G_BESHAAN, icon: '👗', label: 'Beshaan Fashion', genre: BESHAAN, focus: 'Fashion', cast: '2 girls + 1 boy', mood: 'Fun & energetic', desc: 'Fashion-only stories with a lesson: outfits, shopping, style confidence, outfit challenges and pranks.' },
  { id: 'beshaan-lifestyle', group: G_BESHAAN, icon: '🏠', label: 'Beshaan Lifestyle', genre: BESHAAN, focus: 'Lifestyle', cast: '2 girls + 1 boy', mood: 'Fun & energetic', desc: 'Lifestyle-only stories with a lesson: home, routines, habits, money, food and family life.' },
  { id: 'beshaan-gaming', group: G_BESHAAN, icon: '🎮', label: 'Beshaan Gaming', genre: BESHAAN, focus: 'Gaming', cast: '2 girls + 1 boy', mood: 'Fun & energetic', desc: 'Gaming-only stories with a lesson: playing with friends, online games, studies vs games, family.' },
  { id: 'romantic', group: G_OTHER, icon: '💖', label: 'Romantic Anime Story (Bisma)', genre: 'Romantic Anime Story (Bisma)', desc: 'Cute, emotional anime love stories with heartfelt dialogue.' },
  { id: 'ai-dev', group: G_OTHER, icon: '🤖', label: 'AI & Developer Engineering', genre: 'AI & Developer Engineering', desc: 'AI tools, coding and developer tips explained simply.' },
  { id: 'wealth', group: G_OTHER, icon: '💰', label: 'High-Income Wealth & Micro-SaaS', genre: 'High-Income Wealth & Micro-SaaS', desc: 'Money, online income and small software business ideas.' },
  { id: 'psychology', group: G_OTHER, icon: '🧠', label: 'Dark Psychology & Influence', genre: 'Dark Psychology & Influence', desc: 'How people think and influence each other, with real-life examples.' },
  { id: 'stoicism', group: G_OTHER, icon: '⚡', label: 'High-Performance Stoicism', genre: 'High-Performance Stoicism', desc: 'Discipline, calm and mindset lessons for daily life.' },
  { id: 'space', group: G_OTHER, icon: '🌌', label: 'Space & Cosmic Physics', genre: 'Space & Cosmic Physics', desc: 'Amazing space and physics facts, explained visually.' },
  { id: 'facts', group: G_OTHER, icon: '🎙️', label: 'Curious Facts & Hidden History', genre: 'Curious Facts & Hidden History', desc: 'Surprising facts and untold history stories.' },
];
const nicheOf = (q: { genre: string; focus?: string }) =>
  NICHE_OPTIONS.find((n) => n.genre === q.genre && (!n.focus || n.focus === focusFor(q.genre, q.focus || '')));
const genreLabel = (g: string) => (g === BESHAAN ? 'Beshaan' : g === HEART ? 'Heartfelt Stories' : g);
const blankCharacters = () => [0, 1, 2].map(() => ({ name: '', description: '' }));
const GENRES = [BESHAAN, HEART, 'Romantic', 'Comedy', 'Horror', 'Action', 'Fantasy', 'Sci-Fi', 'Mystery', 'Motivational', 'Friendship', 'Family drama', 'Fashion & Lifestyle', 'Gaming', 'Romantic Anime Story (Bisma)', 'AI & Developer Engineering', 'High-Income Wealth & Micro-SaaS', 'Dark Psychology & Influence', 'High-Performance Stoicism', 'Space & Cosmic Physics', 'Curious Facts & Hidden History'];
const MOODS = ['Fun & energetic', 'Emotional', 'Funny', 'Suspenseful', 'Epic', 'Heartwarming', 'Dark', 'Cute & light'];
const SETTINGS = ['Fashion studio / bedroom', 'Shopping mall', 'Home lifestyle vlog', 'Rooftop at sunset', 'College campus', 'Rainy city street', 'Village & fields', 'Futuristic city', 'Haunted house', 'Beach', 'Mountains', 'Cafe', 'Gaming room', 'Wedding'];
const NOT_FOR_BESHAAN = ['Suspenseful', 'Epic', 'Dark', 'Futuristic city', 'Haunted house', 'Hero vs villain', '1 hero alone'];
const CASTS = ['1 boy + 1 girl', '2 girls + 1 boy', '3 friends', '1 hero alone', 'Family (3 members)', 'Hero vs villain'];
const HEART_MOODS = ['Emotional', 'Heartwarming', 'Cute & light'];
const HEART_SETTINGS = ['Family home (living room)', 'Kitchen at home', 'Village home & courtyard', 'Rooftop at sunset', 'Rainy city street', 'Family function (wedding)'];
const HEART_CASTS = ['Family (3 members)', 'Family (4-5 members)', 'Mother + child', 'Father + child', 'Husband + wife', 'Grandparent + grandchild', '2-3 people (any relation)'];
/** The options of a select: each channel only gets what fits it (no horror for Beshaan, no action for Heartfelt). */
const optionsFor = (genre: string, all: string[], heartList: string[]) =>
  isHeart(genre) ? heartList : isBeshaan(genre) ? all.filter((x) => !NOT_FOR_BESHAAN.includes(x)) : all;

/** titleMax = the title length each platform accepts. The one shared text is cut to these limits when posting. */
const PLATFORMS: { id: Platform; label: string; titleMax: number; uploadUrl: string }[] = [
  { id: 'youtube', label: 'YouTube Shorts', titleMax: 100, uploadUrl: 'https://studio.youtube.com' },
  { id: 'tiktok', label: 'TikTok', titleMax: 150, uploadUrl: 'https://www.tiktok.com/creator-center/upload' },
  { id: 'instagram', label: 'Instagram Reels', titleMax: 125, uploadUrl: 'https://www.instagram.com/' },
  { id: 'facebook', label: 'Facebook Reels', titleMax: 125, uploadUrl: 'https://www.facebook.com/reels/create' },
];
const CAPTION_MAX = 2200;

/** What one platform receives from the shared title / description / hashtags. */
function platformCopy(seo: Seo, id: Platform) {
  const cfg = PLATFORMS.find((x) => x.id === id) || PLATFORMS[0];
  const cleanTitle = seo.title.replace(/[<>]/g, '');
  const title = cleanTitle.slice(0, cfg.titleMax);
  const body = `${seo.description}\n\n${seo.hashtags}`.trim();
  const caption = id === 'youtube' ? body : `${title}\n\n${body}`;
  return {
    title,
    body,
    caption: caption.slice(0, CAPTION_MAX),
    titleCut: cleanTitle.length > cfg.titleMax,
    captionCut: caption.length > CAPTION_MAX,
  };
}

const LANG_OPTIONS = ['roman_urdu', 'english', 'urdu'] as const;

function newProject(): Project {
  const memory = loadMemory();
  return {
    step: STEP_WRITE,
    prompt: '',
    promptEdited: false,
    genre: BESHAAN,
    focus: 'Life lessons',
    lesson: '',
    mood: 'Fun & energetic',
    setting: 'Fashion studio / bedroom',
    cast: '2 girls + 1 boy',
    idea: '',
    sceneCount: 7,
    seriesParts: 1,
    series: null,
    partIdx: 0,
    ideaHistory: memory.ideas,
    usedThemes: memory.themes,
    style: STYLES[0],
    format: 'vertical',
    language: 'roman_urdu',
    title: '',
    story: '',
    characters: [
      { name: '', description: '' },
      { name: '', description: '' },
      { name: '', description: '' },
    ],
    scenes: [],
    thumb: {
      bg: '',
      headline: '',
      badge: '',
      textColor: '#ffffff',
      accent: '#ef4444',
      position: 'bottom',
    },
    seo: null,
    blueprint: null,
  };
}

// Keeps the project alive when the admin switches dashboard tabs (component unmounts) during one session.
let projectCache: Project | null = null;

/* Ideas already shown are remembered in this browser, so "New ideas" keeps giving new ones after a reload too. */
const MEMORY_KEY = 'studioIdeaMemory';
function loadMemory(): { ideas: string[]; themes: string[] } {
  try {
    const j = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    return {
      ideas: Array.isArray(j.ideas) ? j.ideas.slice(-150) : [],
      themes: Array.isArray(j.themes) ? j.themes.slice(-60) : [],
    };
  } catch {
    return { ideas: [], themes: [] };
  }
}
function saveMemory(m: { ideas: string[]; themes: string[] }) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
  } catch {
    /* storage full or blocked: the memory then lasts only for this session */
  }
}

/** Reads the SEO of a Daily Pack. Packs made before the single SEO kept one set per platform: use YouTube's. */
export function packSeo(raw: any): Seo {
  const s = raw && raw.title !== undefined ? raw : raw?.youtube || {};
  return { title: String(s.title || ''), description: String(s.description || ''), hashtags: String(s.hashtags || '') };
}

/** Loads a Daily Content Pack into the AI Video Studio (it opens at the Scene Prompts step). */
export function importPackToStudio(pack: {
  title: string;
  idea: string;
  story: string;
  characters: { name: string; description: string }[];
  scenes: { prompt: string; narration: string; caption: string; duration: number }[];
  thumbnail: { headline: string; badge: string };
  seo: unknown;
}) {
  const base = newProject();
  const chars = [0, 1, 2].map((i) => ({ name: pack.characters[i]?.name || '', description: pack.characters[i]?.description || '' }));
  const lesson = /Lesson:\s*(.+)$/i.exec(pack.story)?.[1]?.trim() || '';
  projectCache = {
    ...base,
    step: STEP_SCENES,
    prompt: pack.idea,
    title: pack.title,
    story: pack.story,
    lesson,
    characters: chars,
    scenes: pack.scenes.map((sc) => ({ id: uid(), prompt: sc.prompt, dialogue: sc.narration, duration: sc.duration })),
    thumb: { ...base.thumb, headline: pack.thumbnail.headline, badge: pack.thumbnail.badge },
    seo: packSeo(pack.seo),
  };
}

const uid = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ------------------------------------------------------------- small UI bits */

const card = 'rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4';
const input =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none';
const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const btnPrimary = `${btn} bg-indigo-600 text-white hover:bg-indigo-500`;
const btnGhost = `${btn} border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700`;
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400';

function Spin({ on, children }: { on: boolean; children: React.ReactNode }) {
  return <>{on ? <Loader2 className="h-4 w-4 animate-spin" /> : children}</>;
}

/* ------------------------------------------------------------- rules & helpers */

const ctx = (q: Project) => storyContext(q.genre, q.focus || 'Life lessons');
const themePool = (q: Project) => (isBeshaan(q.genre) || isHeart(q.genre) ? FOCUS_THEMES[focusFor(q.genre, q.focus || 'Life lessons')] || ANGLES : ANGLES);
const pickFrom = (pool: string[], n: number) => pool.slice().sort(() => Math.random() - 0.5).slice(0, n);
const pickAngles = (n: number, pool: string[] = ANGLES) => pickFrom(pool, n).join(', ');
const seriesKey = (q: { genre: string; idea: string; seriesParts: number; cast: string; setting: string }) => `${q.genre}|${q.idea.trim()}|${q.seriesParts}|${q.cast}|${q.setting}`;

/** Video length check per platform, done BEFORE uploading so the reason is clear. */
const RULES: Record<string, { min: number; max: number; name: string }> = {
  facebook: { min: 3, max: 90, name: 'Facebook Reels' },
  instagram: { min: 3, max: 900, name: 'Instagram Reels' },
  youtube: { min: 1, max: 43200, name: 'YouTube' },
  tiktok: { min: 3, max: 600, name: 'TikTok' },
};

/** Width, height and length of a video file. */
const videoInfo = (url: string) =>
  new Promise<{ w: number; h: number; dur: number }>((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.onerror = () => resolve({ w: 0, h: 0, dur: 0 });
    v.onloadedmetadata = () => {
      if (Number.isFinite(v.duration) && v.duration > 0) return resolve({ w: v.videoWidth, h: v.videoHeight, dur: v.duration });
      // Browser-recorded WebM files have no length in their header: seek to the end so the browser works it out
      const done = () => {
        if (Number.isFinite(v.duration) && v.duration > 0) {
          clearTimeout(timer);
          v.ondurationchange = null;
          resolve({ w: v.videoWidth, h: v.videoHeight, dur: v.duration });
        }
      };
      const timer = setTimeout(() => resolve({ w: v.videoWidth, h: v.videoHeight, dur: 0 }), 15000);
      v.ondurationchange = done;
      v.onseeked = done;
      v.currentTime = 1e7;
    };
    v.src = url;
  });

const tick = () => new Promise((r) => setTimeout(r, 80));

/* ---------------------------------------------------------------- component */

export default function YoutubeAutomationView() {
  const [p, setP] = useState<Project>(() => projectCache || newProject());
  const [busy, setBusy] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [ideaList, setIdeaList] = useState<string[]>([]);
  const [planMsg, setPlanMsg] = useState('');
  const [postError, setPostError] = useState('');
  const [postStage, setPostStage] = useState('');
  const [exported, setExported] = useState<{ url: string; ext: string; size: number; blob: Blob } | null>(null);
  const [pubKey, setPubKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem('studioKey') || '';
    } catch {
      return '';
    }
  });
  const [channels, setChannels] = useState<{ id: string; name: string; displayName?: string; service: string }[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [postWhen, setPostWhen] = useState<'now' | 'queue' | 'schedule'>('now');
  const [dueAt, setDueAt] = useState<string>('');
  const [postLog, setPostLog] = useState<{ label: string; ok: boolean; msg: string }[]>([]);
  const thumbRef = useRef<HTMLCanvasElement | null>(null);
  const pRef = useRef(p);
  pRef.current = p;

  useEffect(() => {
    projectCache = p;
    saveMemory({ ideas: p.ideaHistory, themes: p.usedThemes });
  }, [p]);

  const patch = useCallback((x: Partial<Project>) => setP((o) => ({ ...o, ...x })), []);
  const patchThumb = (x: Partial<Thumb>) => setP((o) => ({ ...o, thumb: { ...o.thumb, ...x } }));
  const patchScene = useCallback(
    (id: string, x: Partial<Scene>) => setP((o) => ({ ...o, scenes: o.scenes.map((s) => (s.id === id ? { ...s, ...x } : s)) })),
    []
  );
  const setSeo = (x: Partial<Seo>) => setP((o) => (o.seo ? { ...o, seo: { ...o.seo, ...x } } : o));

  const formatLabel = p.format === 'vertical' ? '9:16 vertical' : '16:9 horizontal';
  const charactersText = (chars: Character[]) =>
    chars
      .filter((c) => c.description.trim() || c.name.trim())
      .map((c) => `${c.name || 'Character'}: ${c.description}`)
      .join('\n');

  const scenePromptSchema =
    '"visual": a rich, SELF-CONTAINED description of this one shot (90-150 words) for Google Flow / Veo: setting and time of day, EVERY character on screen by name WITH their full fixed look repeated (age, face, hair, outfit, colors), what they do, facial expressions and emotions, camera movement and framing. Each scene is generated alone, so never say "same as before"; no on-screen text. "dialogue": [{"speaker":"character name or Narrator","emoji":"one emoji for the speaker, e.g. 👧 👦 🎙️","delivery":"how it is said, e.g. shyly, with a sweet smile","line":"the exact spoken line in the dialogue language"}] (1-3 lines that fit the duration, at least one), "ending": "one sentence on how the shot ends", "music": "background music / sound", "lighting": "lighting", "duration": seconds (8 recommended, 6-10)';

  /* ------------------------------------------------ AI writing */

  const buildPrompt = async (): Promise<string> => {
    const p = pRef.current;
    const system =
      'You are a creative director for AI videos. Write ONE complete, vivid video prompt in plain English (150-250 words): story, characters with fixed looks, dialogues, expressions, camera movements, lighting, background music, lip-sync, duration and visual style. Output ONLY the prompt text.';
    const user = `${ctx(p)}Genre: ${p.genre}
Mood: ${p.mood}
Setting: ${p.setting}
Cast: ${p.cast}
Visual style: ${p.style}
Format: ${formatLabel}
Dialogue language: ${LANG_LABEL[p.language]}
${p.idea.trim() ? `User's extra idea: ${p.idea}
` : ''}Take creative inspiration from: ${pickAngles(3, themePool(p))}.
Do NOT reuse these earlier ideas: ${p.ideaHistory.slice(-25).join(' | ') || '(none)'}.
Invent an original, relatable story with a strong hook, a turning point and a clear lesson at the end.`;
    return (await aiText(system, user)).trim();
  };

  const suggestIdeas = async (ignoreTopic = false) => {
    const p = pRef.current;
    const topic = ignoreTopic ? '' : p.idea.trim();
    setBusy('ideas');
    try {
      // themes not used recently come first, so the 15 ideas are different from the last ones
      const pool = themePool(p);
      const fresh = pickFrom(
        pool.filter((t) => !p.usedThemes.includes(t)),
        15
      );
      const themes = fresh.length >= 15 ? fresh : [...fresh, ...pickFrom(pool.filter((t) => !fresh.includes(t)), 15 - fresh.length)];
      const system = 'You are a viral short-video idea generator. Reply with ONLY valid JSON, no markdown.';
      const user = `${ctx(p)}Genre: ${p.genre}. Mood: ${p.mood}. Setting: ${p.setting}. Cast: ${p.cast}. Format: ${formatLabel}.
${topic ? `The creator is searching for ideas about: "${topic}". Every idea must be about this topic, but each one must use a DIFFERENT angle.\n` : ''}Idea #k must be built around the matching theme (so the ideas are completely different): ${themes.map((t, k) => `${k + 1}=${t}`).join('; ')}.\nRandom seed: ${Math.random().toString(36).slice(2, 8)}.\nAlready suggested (do NOT repeat the situation, the twist or the lesson): ${p.ideaHistory.slice(-60).map((x) => x.slice(0, 140)).join(' | ') || '(none)'}.\nGive 15 DIFFERENT, specific, fresh, RELATABLE video ideas. Each idea: one sentence with the everyday situation and the twist, then " | Lesson: " and the lesson (max 35 words in total). Return {"ideas":["...","..."]}`;
      const data = extractJson<any>(await aiText(system, user, { story: true }));
      const list: string[] = (data.ideas || []).map((x: any) => String(x).replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean).slice(0, 20);
      if (!list.length) throw new Error('No ideas returned. Try again.');
      setIdeaList(list);
      setP((o) => ({
        ...o,
        ideaHistory: o.ideaHistory.concat(list).slice(-150),
        usedThemes: o.usedThemes.concat(themes).slice(-60),
      }));
    } catch (e: any) {
      toast.error(e?.message || 'Could not get ideas');
    } finally {
      setBusy('');
    }
  };

  const planSeries = async (): Promise<boolean> => {
    const p = pRef.current;
    const n = p.seriesParts;
    setBusy('series');
    try {
      const system = 'You are a head writer for a short-video series. Reply with ONLY valid JSON, no markdown.';
      const user = `${ctx(p)}Genre: ${p.genre}. Mood: ${p.mood}. Setting: ${p.setting}. Cast: ${p.cast}. Style: ${p.style}. Dialogue language: ${LANG_LABEL[p.language]}.
${p.idea.trim() ? `Series idea from the creator: ${p.idea}` : `Inspiration: ${pickAngles(3, themePool(p))}.`}
Already used ideas (do not repeat): ${p.ideaHistory.slice(-25).join(' | ') || '(none)'}.
Plan ONE story told across exactly ${n} short episodes (parts). Each part must be a complete mini-episode with its own hook, and end with a cliffhanger leading to the next; the last part resolves everything. Return {"title":"series title","summary":"2-3 sentence overall story","characters":[{"name":"","description":"fixed appearance"}],"parts":[{"title":"episode title","summary":"3-4 sentences of what happens in this part"}]} (max 3 characters).`;
      const data = extractJson<any>(await aiText(system, user));
      const parts: { title: string; summary: string }[] = (data.parts || []).slice(0, n).map((x: any) => ({ title: String(x.title || ''), summary: String(x.summary || '') }));
      if (parts.length < 2) throw new Error('The series plan came back incomplete. Try again.');
      setP((o) => ({
        ...o,
        series: { key: seriesKey(o), title: String(data.title || 'Series'), summary: String(data.summary || ''), parts },
        partIdx: 0,
        characters: [0, 1, 2].map((i) => ({
          name: o.characters[i].name || String((data.characters || [])[i]?.name || ''),
          description: o.characters[i].description || String((data.characters || [])[i]?.description || ''),
        })),
        ideaHistory: o.ideaHistory.concat(String(data.title || '')).slice(-150),
      }));
      toast.success(`${parts.length}-part series planned`);
      return true;
    } catch (e: any) {
      toast.error(e?.message || 'Could not plan the series');
      return false;
    } finally {
      setBusy('');
    }
  };

  const createPrompt = async () => {
    setBusy('idea');
    try {
      patch({ prompt: await buildPrompt(), promptEdited: false });
      toast.success('Prompt ready. Edit it if you like, then generate scenes.');
    } catch (e: any) {
      toast.error(e?.message || 'Could not create prompt');
    } finally {
      setBusy('');
    }
  };

  const generatePlan = async (partOverride?: number): Promise<boolean> => {
    const p = pRef.current;
    // "5-part / 10-part series" selected but not planned yet: plan the series first, then write part 1
    if (partOverride === undefined && p.seriesParts > 1 && (!p.series || p.series.key !== seriesKey(p))) {
      if (!(await planSeries())) return false;
      await tick();
      return generatePlan(0);
    }
    setBusy('plan');
    try {
      let mainPrompt = p.prompt.trim();
      let seriesCtx = '';
      const inSeries = p.seriesParts > 1 && !!p.series;
      const part = inSeries ? Math.min(partOverride ?? p.partIdx, p.series!.parts.length - 1) : -1;
      if (inSeries && part >= 0) {
        const sr = p.series!;
        const sp = sr.parts[part];
        mainPrompt = `${sr.title}: ${sr.summary} THIS VIDEO IS PART ${part + 1} OF ${sr.parts.length}: "${sp.title}". ${sp.summary}`;
        seriesCtx = `SERIES OUTLINE: ${sr.parts.map((x, i) => `Part ${i + 1} - ${x.title}: ${x.summary}`).join(' || ')}. Continue naturally from the previous part and ${part + 1 === sr.parts.length ? 'give a satisfying final ending' : 'end with a hook for the next part'}. Keep the same characters and looks.\n`;
      } else if (!mainPrompt || !p.promptEdited) {
        // a new prompt every time, unless the user typed their own
        mainPrompt = await buildPrompt();
        patch({ prompt: mainPrompt, promptEdited: false });
      }
      const N = p.sceneCount;
      const vertical = p.format === 'vertical';

      // STAGE 1: the story blueprint (arc, one place, fixed outfits, what each clip ends with)
      setPlanMsg('Writing the story…');
      const bpSystem =
        'You are the head writer of short story videos. You write tight, believable stories where every scene is caused by the one before it. Reply with ONLY valid JSON, no markdown.';
      const bpUser = `${ctx(p)}VIDEO IDEA:\n${mainPrompt}\n${seriesCtx}\nLength: exactly ${N} scenes of about 8 seconds each. Every scene is a separate clip made by an AI video tool.\nLanguage for dialogue: ${LANG_LABEL[p.language]}\n${p.characters.some((c) => c.name.trim()) ? `Use EXACTLY these characters with these names and looks: ${charactersText(p.characters)}\n` : ''}\nWrite the STORY BLUEPRINT first. Rules:\n- ONE story with a clear arc over exactly ${N} beats: beat 1 is the hook (something interesting happens in the first seconds), then the everyday situation, the mistake or conflict, it gets worse, the turning point, the resolution, and the LAST beat shows the lesson, said by a character in short, natural everyday words (never a speech, never the lesson sentence word for word).\n- Every beat is caused by the one before it ("because of that...", "so..."). No random jumps, no new unrelated characters or events.
- KEEP IT SIMPLE: ONE problem, and only the main characters on screen (no side characters, nobody off-screen: other people can only be a phone call or a message). A viewer must be able to retell the story in one sentence.\n- "what" in every beat is a plain description of the action in English with NO spoken lines and no quotation marks (the dialogue is written later, in the scenes). No on-screen text, titles or captions anywhere.\n- ONE single room or place for the WHOLE video, no second location. Describe its layout and furniture once in "setting" and never add, move or rename furniture later. EVERY beat happens inside that same place (characters may talk about other places, but we never go there). Same time of day. The SAME outfit for every character in every scene.\n- "endsWith" is the exact last moment of that clip (positions, expressions, the last spoken line). The next beat starts from exactly that moment.\n\nReturn JSON: {"title":"video title","story":"3-4 sentence story","lesson":"one line: what viewers learn","characters":[{"name":"","description":"fixed look: age, face, hair, the outfit worn in this whole video, art style"}],"setting":"the ONE location in detail: layout, furniture, colors, objects, lighting, time of day","props":"the important objects and where they are","beats":[{"what":"what happens (2 sentences)","who":"characters on screen","emotion":"main emotion","endsWith":"the last moment of the clip"}]}\nUse at most 3 characters and exactly ${N} beats.`;
      let data: any = null;
      let bpErr = '';
      for (let attempt = 0; attempt < 2 && !(Array.isArray(data?.beats) && data.beats.length === N); attempt++) {
        try {
          data = extractJson<any>(await aiText(bpSystem, attempt ? `${bpUser}\nIMPORTANT: the beats array must have EXACTLY ${N} items.` : bpUser, { story: true }));
        } catch (e: any) {
          bpErr = e?.message || '';
        }
      }
      if (!Array.isArray(data?.beats) || data.beats.length !== N) throw new Error(`The story came back incomplete. Try again. ${bpErr}`);
      const chars = [0, 1, 2].map((i) => {
        const old = p.characters[i];
        const ai = (data.characters || [])[i];
        return {
          name: old.name || String(ai?.name || ''),
          description: old.description || String(ai?.description || ''),
        };
      });
      const beats: Beat[] = data.beats.map((b: any) => ({ what: String(b.what || ''), who: String(b.who || ''), emotion: String(b.emotion || ''), endsWith: String(b.endsWith || '') }));
      const outline = beats.map((b, i) => `${i + 1}. ${b.what}`).join('\n');

      // STAGE 2: one scene at a time, each one starting exactly where the previous one ended
      const sceneSystem =
        'You are a senior AI video director. You write ONE scene prompt for one clip. It continues the previous clip with no jump: same place, same outfits, same time of day. Reply with ONLY valid JSON, no markdown.';
      const scenes: Scene[] = [];
      let prevEnd = '';
      let prevLine = '';
      const said: string[] = []; // every spoken line so far: a line is never used twice
      for (let i = 0; i < N; i++) {
        setPlanMsg(`Writing scene ${i + 1} of ${N}…`);
        const b = beats[i];
        const next = beats[i + 1];
        const sceneUser = `${ctx(p)}STORY: ${data.title}: ${data.story}\nLESSON: ${data.lesson}\nCHARACTERS (same face and the same outfit in EVERY scene):\n${charactersText(chars)}\nSETTING (describe it again inside this scene): ${data.setting}\nPROPS: ${data.props}\nFULL OUTLINE:\n${outline}\nVisual style: ${p.style}\nAspect ratio: ${formatLabel}\nLanguage for dialogue: ${LANG_LABEL[p.language]}\n${DIALOGUE_RULES}\n${said.length ? `LINES ALREADY SPOKEN (never repeat or rephrase them): ${said.slice(-8).join(' | ')}\n` : ''}\nNOW WRITE SCENE ${i + 1} of ${N}.\nWhat happens: ${b.what}\nOn screen: ${b.who}. Emotion: ${b.emotion}.\n${i === 0 ? 'This is the opening: something catches the viewer in the first 3 seconds.' : `The previous scene ended with: ${prevEnd}${prevLine ? ` (last line spoken: "${prevLine}")` : ''}. Start from exactly that moment: same place, same outfits, same time of day, same positions. Your first sentence describes the same frame the previous scene ended on, then the action continues. The first spoken line must react to that last line.`}\n${next ? `End this scene with: ${b.endsWith}, so that scene ${i + 2} (${next.what}) can start right away.` : `This is the FINAL scene: resolve the story and let a character say the lesson in short, natural everyday words (idea: ${data.lesson}), not word for word and not as a speech.`}\n\nReturn {${scenePromptSchema}}`;
        let raw: any = null;
        let lastErr = '';
        for (let attempt = 0; attempt < 2 && !raw; attempt++) {
          try {
            raw = extractJson<any>(await aiText(sceneSystem, sceneUser, { story: true }));
          } catch (e: any) {
            lastErr = e?.message || '';
          }
        }
        if (!raw) throw new Error(`Scene ${i + 1} could not be written. ${lastErr}`);
        const f = flowPrompt(raw, i, N, p.style, vertical);
        scenes.push({ id: uid(), prompt: f.prompt, dialogue: f.dialogue, duration: f.duration });
        prevEnd = String(raw.ending || b.endsWith || '');
        const spoken = (Array.isArray(raw.dialogue) ? raw.dialogue : []).filter((d: any) => d && String(d.line || '').trim());
        prevLine = spoken.length ? String(spoken[spoken.length - 1].line).trim() : '';
        spoken.forEach((d: any) => said.push(String(d.line).trim()));
      }
      setP((o) => ({
        ...o,
        title: String(data.title || o.title),
        story: String(data.story || ''),
        lesson: String(data.lesson || ''),
        characters: chars,
        scenes,
        blueprint: { setting: String(data.setting || ''), props: String(data.props || ''), beats },
        seo: null,
        thumb: { ...o.thumb, bg: '', headline: '', badge: '' },
        partIdx: part >= 0 ? part : 0,
        ideaHistory: o.ideaHistory.concat(String(data.title || '')).slice(-150),
        step: STEP_SCENES,
      }));
      toast.success(`${scenes.length} scene prompts ready. Copy them into Google Flow.`);
      return true;
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate prompts');
      return false;
    } finally {
      setBusy('');
      setPlanMsg('');
    }
  };

  const regenerateScenePrompt = async (id: string) => {
    const idx = p.scenes.findIndex((s) => s.id === id);
    if (idx < 0) return;
    setBusy(`prompt:${id}`);
    try {
      const sc = p.scenes[idx];
      const system =
        'You are a senior AI video director. Rewrite ONE scene so it stays connected to the story. Reply with ONLY valid JSON, no markdown.';
      const bp = p.blueprint && p.blueprint.beats.length === p.scenes.length ? p.blueprint : null;
      const beat = bp?.beats[idx];
      const prevTail = p.scenes[idx - 1]?.prompt.slice(-700);
      const nextHead = p.scenes[idx + 1]?.prompt.slice(0, 600);
      const user = `${ctx(p)}STORY: ${p.story || p.prompt}\nLESSON: ${p.lesson || '(none)'}\nCHARACTERS (same face and the same outfit in every scene):\n${charactersText(p.characters)}\n${bp ? `SETTING (describe it again inside this scene): ${bp.setting}\nPROPS: ${bp.props}\nOUTLINE:\n${bp.beats.map((b, i) => `${i + 1}. ${b.what}`).join('\n')}\n` : ''}Style: ${p.style}\nLanguage: ${LANG_LABEL[p.language]}\n${DIALOGUE_RULES}\n${prevTail ? `The PREVIOUS scene ended like this (start from exactly this moment: same place, same outfits, the first line reacts to its last line): ...${prevTail}\n` : 'This is the opening scene: hook the viewer in the first 3 seconds.\n'}${nextHead ? `The NEXT scene starts like this (this scene must lead straight into it): ${nextHead}\n` : 'This is the final scene: resolve the story and say the lesson naturally.\n'}${beat ? `What must happen in this scene: ${beat.what}\n` : ''}Current scene ${idx + 1} of ${p.scenes.length}: ${sc.prompt}\n\nWrite a fresh, better version that fits exactly between the previous and the next scene. Return {${scenePromptSchema}}`;
      const data = extractJson<any>(await aiText(system, user, { story: true }));
      const f = flowPrompt(data, idx, p.scenes.length, p.style, p.format === 'vertical');
      patchScene(id, {
        prompt: f.prompt || sc.prompt,
        dialogue: f.dialogue || sc.dialogue,
        duration: f.duration,
      });
      toast.success(`Scene ${idx + 1} prompt regenerated`);
    } catch (e: any) {
      toast.error(e?.message || 'Could not regenerate');
    } finally {
      setBusy('');
    }
  };

  /** ONE title, description, hashtags and thumbnail text for all platforms. */
  const generateSeo = async () => {
    const p = pRef.current;
    setBusy('seo');
    try {
      const system = 'You are a social media SEO expert for short-form video. Reply with ONLY valid JSON, no markdown.';
      const user = `${isBeshaan(p.genre) ? 'CHANNEL: Beshaan. Use #Beshaan #BeshaanVibe in the hashtags. ' : ''}${isHeart(p.genre) ? 'CHANNEL: heartfelt Urdu story videos about love, respect, patience and gratitude. Respectful tone, no clickbait, no exaggeration. ' : ''}VIDEO TITLE: ${p.title}${p.lesson ? `\nLESSON OF THE VIDEO: ${p.lesson} (mention it in the description as a takeaway or a question to the viewer)` : ''}
STORY: ${p.story}
IDEA: ${p.prompt.slice(0, 600)}
LANGUAGE: ${LANG_LABEL[p.language]} (hashtags may mix English)
SCENE DIALOGUE: ${p.scenes.map((s) => s.dialogue).filter(Boolean).join(' | ').slice(0, 800)}

This ONE text is posted on YouTube, TikTok, Instagram and Facebook (each platform cuts it to its own length), so put the most important words first.
Return JSON: {"thumbnail":{"headline":"max 4 punchy words, ALL CAPS","badge":"max 3 words"},"title":"<=100 chars, keyword first, include #Shorts","description":"hook line + 2-3 lines + a question + CTA, max 600 characters","hashtags":"8-12 hashtags separated by spaces, #Shorts included"}`;
      const data = extractJson<any>(await aiText(system, user));
      const seo: Seo = {
        title: String(data.title || p.title || '').trim(),
        description: String(data.description || '').trim(),
        hashtags: Array.isArray(data.hashtags) ? data.hashtags.join(' ') : String(data.hashtags || '').trim(),
      };
      setP((o) => ({
        ...o,
        seo,
        thumb: {
          ...o.thumb,
          headline: o.thumb.headline || String(data.thumbnail?.headline || o.title).toUpperCase(),
          badge: o.thumb.badge || String(data.thumbnail?.badge || '').toUpperCase(),
        },
      }));
      toast.success('Title, description and tags ready for all platforms');
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate SEO');
    } finally {
      setBusy('');
    }
  };

  /* ------------------------------------------------ thumbnail */

  // Picks a good-looking frame (about 30% into the video) from the finished video as the thumbnail background
  const thumbFromVideo = async () => {
    if (!exported) return;
    try {
      const v = document.createElement('video');
      v.muted = true;
      v.preload = 'auto';
      v.src = exported.url;
      await new Promise<void>((res, rej) => {
        v.onloadedmetadata = () => res();
        v.onerror = () => rej(new Error('Cannot read the video'));
      });
      v.currentTime = Math.min(Math.max(0.5, (v.duration || 3) * 0.3), Math.max(0, (v.duration || 1) - 0.1));
      await new Promise<void>((res) => (v.onseeked = () => res()));
      const c = document.createElement('canvas');
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d')!.drawImage(v, 0, 0);
      patchThumb({ bg: c.toDataURL('image/jpeg', 0.9) });
      toast.success('Thumbnail background taken from your video');
    } catch (e: any) {
      toast.error(e?.message || 'Could not take a frame');
    }
  };

  const uploadImageTo = async (file: File, apply: (url: string) => void) => {
    try {
      apply(await toJpegDataUrl(await fileToDataUrl(file)));
    } catch {
      toast.error('Could not read that image');
    }
  };

  /* ------------------------------------------------ Buffer */

  const studioFetch = async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-studio-key': pubKey },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) throw new Error(j.error || `Request failed (${res.status})`);
    return j;
  };

  const savePubKey = (v: string) => {
    setPubKey(v);
    try {
      sessionStorage.setItem('studioKey', v);
    } catch {
      /* ignore */
    }
  };

  const loadChannels = async () => {
    setBusy('channels');
    try {
      const j = await studioFetch('/api/admin/automation/buffer', { action: 'channels' });
      const list = (j.channels || []).filter((c: any) => ['youtube', 'tiktok', 'instagram', 'facebook'].includes(c.service));
      setChannels(list);
      setPicked(list.map((c: any) => c.id));
      if (!list.length) toast.error('No YouTube / TikTok / Instagram / Facebook channels found in Buffer.');
    } catch (e: any) {
      toast.error(e?.message || 'Could not load Buffer channels');
    } finally {
      setBusy('');
    }
  };

  /**
   * Uploads the video to Cloudinary. During the upload Cloudinary also makes the final file(s): H.264/AAC MP4
   * padded to 1080x1920 (and 1920x1080 for a landscape source). The links are complete before Buffer reads them.
   */
  const uploadToCloudinary = async (blob: Blob, ext: string, landscape: boolean): Promise<{ vertical: string; horizontal: string }> => {
    const t = await studioFetch('/api/admin/automation/cloudinary-sign', { pad: landscape ? 'both' : 'vertical' });
    const fd = new FormData();
    fd.append('file', blob, `video.${ext}`);
    fd.append('api_key', t.apiKey);
    fd.append('signature', t.signature);
    Object.keys(t.params).forEach((k) => fd.append(k, String(t.params[k])));
    const r: any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${t.cloudName}/video/upload`);
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        setProgress((e.loaded / e.total) * 100);
        if (e.loaded >= e.total) setPostStage('Converting to 1080x1920 MP4 (can take up to a minute)…');
      };
      xhr.onerror = () => reject(new Error('Upload failed (network). Check your internet and try again.'));
      xhr.onload = () => {
        try {
          const j = JSON.parse(xhr.responseText);
          if (xhr.status >= 300) return reject(new Error(j?.error?.message || 'Cloudinary rejected the upload'));
          resolve(j);
        } catch {
          reject(new Error('Bad response from Cloudinary'));
        }
      };
      xhr.send(fd);
    });
    const eager: string[] = (r.eager || []).map((x: any) => x.secure_url).filter(Boolean);
    if (!eager.length) throw new Error('Cloudinary did not return the converted MP4. Try again.');
    return { vertical: eager[0], horizontal: landscape ? eager[1] || eager[0] : eager[0] };
  };

  const postEverywhere = async () => {
    const stop = (m: string) => {
      setPostError(m);
      toast.error(m);
    };
    setPostError('');
    setPostStage('');
    const seo = p.seo;
    if (!exported) return stop('No video yet: join your clips in "Join Videos" or pick your finished video file above.');
    if (!seo) return stop('Title, description and tags are missing: press "Write title, description & tags" above.');
    const targets = channels.filter((c) => picked.includes(c.id));
    if (!targets.length) return stop('Pick at least one channel.');
    if (postWhen === 'schedule' && !dueAt) return stop('Choose a date and time.');
    if (postWhen === 'schedule' && new Date(dueAt).getTime() < Date.now() + 60_000) return stop('The scheduled time must be in the future.');
    if (exported.size > 100 * 1048576) return stop(`The video is ${(exported.size / 1048576).toFixed(0)} MB. Cloudinary's free plan accepts up to 100 MB per video. Export it smaller.`);
    const info = await videoInfo(exported.url);
    if (!info.w || !info.dur) return stop('This video file cannot be read by the browser. Export it again as MP4.');
    const tooShortOrLong = targets
      .map((c) => {
        const rule = RULES[c.service];
        if (!rule) return '';
        if (info.dur < rule.min) return `${rule.name} needs at least ${rule.min} seconds (your video is ${info.dur.toFixed(1)} s).`;
        if (info.dur > rule.max) return `${rule.name} allows at most ${rule.max} seconds (your video is ${Math.round(info.dur)} s). Untick it or shorten the video.`;
        return '';
      })
      .filter(Boolean);
    if (tooShortOrLong.length) return stop(tooShortOrLong.join(' '));
    const landscape = info.w > info.h;

    setBusy('post');
    setPostLog([]);
    setProgress(0);
    try {
      setPostStage('Uploading video…');
      const urls = await uploadToCloudinary(exported.blob, exported.ext, landscape);
      setProgress(0);
      setPostStage('Sending to Buffer…');
      const log: { label: string; ok: boolean; msg: string }[] = [];
      const okIds: string[] = [];
      for (let i = 0; i < targets.length; i++) {
        const c = targets[i];
        const cp = platformCopy(seo, c.service as Platform);
        const label = `${c.service} · ${c.displayName || c.name}`;
        try {
          const r = await studioFetch('/api/admin/automation/buffer', {
            action: 'post',
            channelId: c.id,
            service: c.service,
            title: cp.title || p.title.slice(0, 100) || 'New video',
            text: cp.caption,
            // Reels must be vertical; a landscape video stays landscape on YouTube
            videoUrl: c.service === 'youtube' ? urls.horizontal : urls.vertical,
            mode: postWhen === 'queue' ? 'queue' : 'now',
            dueAt: postWhen === 'schedule' ? new Date(dueAt).toISOString() : undefined,
          });
          okIds.push(c.id);
          log.push({ label, ok: true, msg: `Sent to Buffer (post ${r.postId || 'created'})` });
        } catch (e: any) {
          log.push({ label, ok: false, msg: e?.message || 'Failed' });
        }
        setPostLog(log.slice());
      }
      // untick the channels that worked, so pressing the button again does not post twice
      setPicked((o) => o.filter((id) => !okIds.includes(id)));
      if (log.every((l) => l.ok)) toast.success('All posts sent');
      else toast.error('Some posts failed. See the red lines.');
    } catch (e: any) {
      stop(`Upload failed: ${e?.message || 'unknown error'}`);
    } finally {
      setBusy('');
      setProgress(0);
      setPostStage('');
    }
  };

  /* --------------------------------------------------------------- scene ops */

  const moveScene = (id: string, dir: -1 | 1) =>
    setP((o) => {
      const i = o.scenes.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= o.scenes.length) return o;
      const arr = o.scenes.slice();
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      return { ...o, scenes: arr };
    });

  const removeScene = (id: string) => setP((o) => ({ ...o, scenes: o.scenes.filter((s) => s.id !== id) }));

  const addScene = () => {
    const s: Scene = { id: uid(), prompt: '', dialogue: '', duration: 8 };
    setP((o) => ({ ...o, scenes: [...o.scenes, s] }));
  };

  const promptPack = () =>
    [
      `${p.title || 'AI VIDEO'}  |  ${p.style}  |  ${formatLabel}`,
      p.story ? `STORY: ${p.story}` : '',
      p.lesson ? `LESSON: ${p.lesson}` : '',
      `CHARACTERS (attach the reference images and keep them IDENTICAL in every scene):\n${charactersText(p.characters) || '(none)'}`,
      ...p.scenes.map((s, i) => `\n==================== SCENE ${i + 1} of ${p.scenes.length} ====================\n\n${s.prompt}`),
    ]
      .filter(Boolean)
      .join('\n\n');

  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${what} copied`),
      () => toast.error('Copy failed')
    );
  };

  const resetAll = () => {
    if (!window.confirm('Start a new project? Everything in this one will be cleared.')) return;
    if (exported) URL.revokeObjectURL(exported.url);
    setExported(null);
    setP(newProject());
  };

  const goto = (i: number) => {
    if (i === STEP_SCENES && !p.scenes.length) return toast.error('Create scene prompts in step 1 first');
    patch({ step: i });
  };

  /* ------------------------------------------------------------------ steps */

  const stepWrite = (
    <div className="space-y-4">
      <div className={`${card} border-indigo-500/40`}>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className={`${input} !pl-9 !py-3 text-base`}
              placeholder="Search any idea or topic (e.g. Eid outfit challenge, gaming prank, college love story)…"
              value={p.idea}
              onChange={(e) => patch({ idea: e.target.value, prompt: p.promptEdited ? p.prompt : '', series: null })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !busy) suggestIdeas();
              }}
            />
          </div>
          <button className={`${btnPrimary} !py-3`} disabled={!!busy} onClick={() => suggestIdeas()}>
            <Spin on={busy === 'ideas'}><Search className="h-4 w-4" /></Spin>
            {p.idea.trim() ? 'Search ideas' : 'Show ideas'}
          </button>
          <button className={`${btnGhost} !py-3`} disabled={!!busy} onClick={() => suggestIdeas(true)} title="15 brand-new ideas for the selected niche">
            <RefreshCw className="h-4 w-4" /> New ideas
          </button>
        </div>
        {ideaList.length > 0 && (
          <div className="mt-2 grid gap-1.5 md:grid-cols-2">
            <h4 className="text-sm font-bold text-white md:col-span-2">
              Self-Generated Video Topics for {genreLabel(p.genre)}
            </h4>
            {ideaList.map((idea, i) => (
              <div
                key={i}
                className={`flex items-stretch gap-1 rounded-lg border transition ${p.idea === idea ? 'border-indigo-500 bg-indigo-600/20' : 'border-slate-700 bg-slate-950 hover:border-slate-500'}`}
              >
                <button onClick={() => patch({ idea, prompt: p.promptEdited ? p.prompt : '', series: null })} className="flex-1 px-3 py-2 text-left text-sm text-slate-200">
                  <span className="mr-1 font-bold text-indigo-300">{i + 1}.</span>
                  {idea}
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => {
                    patch({ idea, prompt: p.promptEdited ? p.prompt : '', series: null });
                    setTimeout(() => generatePlan(), 60);
                  }}
                  title="Write the scene prompts for this idea"
                  className="m-1 shrink-0 rounded-md bg-emerald-600 px-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  ⚡ Create scene prompts
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Search a topic, or press New ideas for 15 fresh ones every time. Click an idea to pick it, or ⚡ Create scene prompts to build the full video from it. Choose "Video type" below for a 5 or 10 part series.
        </p>
      </div>

      <div className={card}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white">Describe your video</h3>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <span className={label}>Niche Curriculum</span>
            <select
              className={input}
              value={nicheOf(p)?.id || ''}
              onChange={(e) => {
                const n = NICHE_OPTIONS.find((x) => x.id === e.target.value);
                if (!n) return;
                // a new niche starts clean: the characters of the old niche do not belong to it
                patch({
                  genre: n.genre,
                  ...(n.focus ? { focus: n.focus } : {}),
                  ...(n.cast ? { cast: n.cast } : {}),
                  ...(n.mood ? { mood: n.mood } : {}),
                  ...(n.setting ? { setting: n.setting } : {}),
                  series: null,
                  characters: blankCharacters(),
                  prompt: p.promptEdited ? p.prompt : '',
                });
              }}
            >
              {!nicheOf(p) && <option value="">Custom genre (below)</option>}
              {[G_HEART, G_BESHAAN, G_OTHER].map((g) => (
                <optgroup key={g} label={g}>
                  {NICHE_OPTIONS.filter((n) => n.group === g).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.icon} {n.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {nicheOf(p) && <p className="mt-1 text-xs text-slate-400">{nicheOf(p)!.desc}</p>}
          </div>
          <div>
            <span className={label}>Dialogue / Voiceover</span>
            <select className={input} value={p.language} onChange={(e) => patch({ language: e.target.value as Project['language'] })}>
              <option value="roman_urdu">🇵🇰 Roman Urdu (رومن اردو dialogues)</option>
              <option value="english">🌐 English (Global dialogues)</option>
              <option value="urdu">🇵🇰 Urdu Script (اردو)</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <span className={label}>Genre</span>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <button key={g} onClick={() => patch(g === BESHAAN ? { genre: g, cast: '2 girls + 1 boy', mood: 'Fun & energetic' } : g === HEART ? { genre: g, focus: HEART_FOCUS[0], cast: 'Family (3 members)', mood: 'Emotional', setting: 'Family home (living room)', characters: blankCharacters(), series: null } : { genre: g })} className={`rounded-full px-3 py-1 text-xs font-semibold ${p.genre === g ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {genreLabel(g)}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <span className={label}>Mood</span>
            <select className={input} value={p.mood} onChange={(e) => patch({ mood: e.target.value })}>
              {optionsFor(p.genre, MOODS, HEART_MOODS).map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Setting</span>
            <select className={input} value={p.setting} onChange={(e) => patch({ setting: e.target.value })}>
              {optionsFor(p.genre, SETTINGS, HEART_SETTINGS).map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Characters</span>
            <select className={input} value={p.cast} onChange={(e) => patch({ cast: e.target.value })}>
              {optionsFor(p.genre, CASTS, HEART_CASTS).map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <button className={btnGhost} disabled={!!busy} onClick={createPrompt}>
            <Spin on={busy === 'idea'}><Sparkles className="h-4 w-4" /></Spin>
            Create prompt for me
          </button>
        </div>
        <span className={label}>Full video prompt (auto-written, you can edit)</span>
        <textarea
          className={`${input} min-h-[160px]`}
          placeholder="Leave empty: the prompt and the scene prompts are created for you from the options above."
          value={p.prompt}
          onChange={(e) => patch({ prompt: e.target.value, promptEdited: true })}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div>
            <span className={label}>Scenes / parts</span>
            <select className={input} value={p.sceneCount} onChange={(e) => patch({ sceneCount: Number(e.target.value) })}>
              {[3, 4, 5, 6, 7, 8, 10, 12, 15].map((n) => (
                <option key={n} value={n}>
                  {n} scenes
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Video type</span>
            <select
              className={input}
              value={p.seriesParts}
              onChange={(e) => {
                const n = Number(e.target.value) as 1 | 5 | 10;
                patch({ seriesParts: n, series: null, partIdx: 0 });
                if (n > 1) setTimeout(() => { if (pRef.current.seriesParts > 1 && !pRef.current.series) planSeries(); }, 80);
              }}
            >
              <option value={1}>Single video</option>
              <option value={5}>5-part series</option>
              <option value={10}>10-part series</option>
            </select>
          </div>
          <div>
            <span className={label}>Format</span>
            <select className={input} value={p.format} onChange={(e) => patch({ format: e.target.value as Project['format'] })}>
              <option value="vertical">9:16 Shorts / Reels</option>
              <option value="horizontal">16:9 YouTube</option>
            </select>
          </div>
          <div>
            <span className={label}>Visual style</span>
            <select className={input} value={p.style} onChange={(e) => patch({ style: e.target.value })}>
              {STYLES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Dialogue language</span>
            <select className={input} value={p.language} onChange={(e) => patch({ language: e.target.value as Project['language'] })}>
              {LANG_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l === 'roman_urdu' ? 'Roman Urdu' : l === 'english' ? 'English' : 'Urdu (script)'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className={btnPrimary} disabled={!!busy} onClick={() => generatePlan()}>
            <Spin on={busy === 'plan' || busy === 'series'}>
              <Sparkles className="h-4 w-4" />
            </Spin>
            {p.scenes.length ? 'Write new scene prompts' : 'Create scene prompts'}
          </button>
          {p.scenes.length > 0 && (
            <button className={btnGhost} onClick={() => patch({ step: STEP_SCENES })}>
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <span className="text-xs text-slate-500">Free AI via Groq.</span>
        </div>
      </div>
      {p.series && p.seriesParts > 1 && (
        <div className={card}>
          <h3 className="text-base font-bold text-white">
            {p.series.title} <span className="text-xs font-normal text-slate-400">({p.series.parts.length}-part series)</span>
          </h3>
          <p className="mb-3 text-sm text-slate-400">{p.series.summary}</p>
          <div className="space-y-1.5">
            {p.series.parts.map((part, i) => (
              <div key={i} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${i === p.partIdx && p.scenes.length ? 'border-indigo-500 bg-indigo-600/10' : 'border-slate-700 bg-slate-950'}`}>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">
                    Part {i + 1}: {part.title}
                  </div>
                  <div className="truncate text-xs text-slate-400">{part.summary}</div>
                </div>
                <button className={`${btnPrimary} shrink-0 !py-1 text-xs`} disabled={!!busy} onClick={() => generatePlan(i)}>
                  ▶ Prompts for part {i + 1}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {p.story && (
        <div className={card}>
          <input className={`${input} mb-2 font-bold`} value={p.title} onChange={(e) => patch({ title: e.target.value })} />
          <textarea className={`${input} min-h-[70px]`} value={p.story} onChange={(e) => patch({ story: e.target.value })} />
        </div>
      )}
    </div>
  );

  const stepScenes = (
    <div className="space-y-4">
      <div className={`${card} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h3 className="text-base font-bold text-white">Scenes ({p.scenes.length})</h3>
          <p className="text-xs text-slate-400">
            Copy each scene into Google Flow (attach your character pictures there) and make one clip per scene. Then go to Join Videos.
          </p>
          {p.lesson && <p className="mt-1 text-sm font-semibold text-emerald-300">Lesson: {p.lesson}</p>}
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={addScene}>
            <Plus className="h-4 w-4" /> Scene
          </button>
          <button className={btnGhost} onClick={() => copy(promptPack(), 'All prompts')} title="For Veo / Kling / Runway / Sora: character block + every scene prompt">
            <Copy className="h-4 w-4" /> Copy all prompts
          </button>
          <button className={btnGhost} onClick={() => downloadBlob(new Blob([promptPack()], { type: 'text/plain' }), 'ai-video-prompts.txt')}>
            <Download className="h-4 w-4" /> .txt
          </button>
        </div>
      </div>

      {p.blueprint && p.blueprint.beats.length > 0 && (
        <details className={card}>
          <summary className="cursor-pointer text-sm font-bold text-white">Story outline ({p.blueprint.beats.length} beats): check that it makes sense</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
            {p.blueprint.beats.map((b, i) => (
              <li key={i}>{b.what}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-slate-500">Place: {p.blueprint.setting}</p>
        </details>
      )}

      {p.scenes.map((s, i) => (
        <div key={s.id} className={card}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-300">
                Scene {i + 1} <span className="text-xs font-normal text-slate-500">· {s.duration}s</span>
              </span>
              <div className="flex gap-1">
                <button className={`${btnGhost} !px-2 !py-1`} disabled={i === 0} onClick={() => moveScene(s.id, -1)} title="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button className={`${btnGhost} !px-2 !py-1`} disabled={i === p.scenes.length - 1} onClick={() => moveScene(s.id, 1)} title="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button className={`${btnGhost} !px-2 !py-1`} disabled={!!busy} onClick={() => regenerateScenePrompt(s.id)} title="Regenerate this prompt with AI">
                  <Spin on={busy === `prompt:${s.id}`}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </Spin>
                </button>
                <button className={`${btnGhost} !px-2 !py-1`} onClick={() => copy(s.prompt, 'Prompt')} title="Copy prompt">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button className={`${btnGhost} !px-2 !py-1 text-red-400`} onClick={() => removeScene(s.id)} title="Delete scene">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <textarea className={`${input} min-h-[160px]`} placeholder="Full AI video prompt for this scene" value={s.prompt} onChange={(e) => patchScene(s.id, { prompt: e.target.value })} />
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <button className={btnGhost} onClick={() => patch({ step: STEP_WRITE })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className={btnPrimary} onClick={() => patch({ step: STEP_JOIN })}>
          Next: Join videos <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const stepJoinView = (
    <JoinClips
      joined={exported}
      onJoined={(v) => {
        if (exported) URL.revokeObjectURL(exported.url);
        setExported(v);
      }}
      onNext={() => patch({ step: STEP_POST })}
    />
  );

  /* ---- Post: video, one set of text, thumbnail, then the platforms */

  const seoNow = p.seo;
  const seoAbout = (
    <div className="space-y-2">
      <input className={input} placeholder="Video topic / working title (optional)" value={p.title} onChange={(e) => patch({ title: e.target.value })} />
      <textarea
        className={`${input} min-h-[70px]`}
        placeholder="What is this video about? e.g. Aisha, Mira and Zaid do a 5-minute Eid outfit challenge, Zaid loses and has to cook for everyone"
        value={p.story}
        onChange={(e) => patch({ story: e.target.value })}
      />
      <button className={btnPrimary} disabled={!!busy || (!p.story.trim() && !p.title.trim() && !p.prompt.trim())} onClick={generateSeo}>
        <Spin on={busy === 'seo'}>
          <Sparkles className="h-4 w-4" />
        </Spin>
        {seoNow ? 'Write again' : 'Write title, description & tags'}
      </button>
    </div>
  );

  const stepPost = (
    <div className="space-y-4">
      {p.series && p.seriesParts > 1 && (
        <div className={`${card} flex flex-wrap items-center justify-between gap-2`}>
          <span className="text-sm text-slate-300">
            Part {p.partIdx + 1} of {p.series.parts.length} done? Download it above, then continue the story.
          </span>
          {p.partIdx + 1 < p.series.parts.length ? (
            <button className={btnPrimary} disabled={!!busy} onClick={() => generatePlan(p.partIdx + 1)}>
              ▶ Prompts for part {p.partIdx + 2}
            </button>
          ) : (
            <span className="text-sm font-semibold text-emerald-400">That was the final part 🎉</span>
          )}
        </div>
      )}

      <div className={card}>
        <h3 className="text-base font-bold text-white">1. Your video</h3>
        {exported ? (
          <div className="mt-2 space-y-2">
            <video src={exported.url} controls className="max-h-[360px] w-full rounded-xl bg-black" />
            <div className="flex flex-wrap gap-2">
              <a href={exported.url} download={`${(p.title || 'video').replace(/[^\w]+/g, '-').slice(0, 50)}.${exported.ext}`} className={btnGhost}>
                <Download className="h-4 w-4" /> Download
              </a>
              <label className={`${btnGhost} cursor-pointer`}>
                <Upload className="h-4 w-4" /> Change video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    URL.revokeObjectURL(exported.url);
                    const ext = (f.name.split('.').pop() || 'mp4').toLowerCase();
                    setExported({ url: URL.createObjectURL(f), ext, size: f.size, blob: f });
                    setPostError('');
                    setPostLog([]);
                  }}
                />
              </label>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-400">
            No video yet. Go back to <b>Join Videos</b>, upload your clips and join them, or{' '}
            <label className="cursor-pointer font-semibold text-indigo-400 underline">
              pick a finished video file
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  const ext = (f.name.split('.').pop() || 'mp4').toLowerCase();
                  setExported({ url: URL.createObjectURL(f), ext, size: f.size, blob: f });
                }}
              />
            </label>
            .
          </p>
        )}
      </div>

      <div className={card}>
        <h3 className="text-base font-bold text-white">2. Title, description & tags</h3>
        <p className="mt-1 text-xs text-slate-400">
          One text for every platform. Each platform gets it cut to its own length automatically (shown below).
        </p>
        <div className="mt-3">{seoAbout}</div>

        {busy === 'seo' && !seoNow ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Writing title, description and tags…
          </div>
        ) : seoNow ? (
          <div className="mt-4 space-y-3">
            <div>
              <span className={label}>Title ({seoNow.title.length}/100 for YouTube)</span>
              <input className={input} value={seoNow.title} onChange={(e) => setSeo({ title: e.target.value })} />
            </div>
            <div>
              <span className={label}>Description</span>
              <textarea className={`${input} min-h-[120px]`} value={seoNow.description} onChange={(e) => setSeo({ description: e.target.value })} />
            </div>
            <div>
              <span className={label}>Hashtags / tags</span>
              <input className={input} value={seoNow.hashtags} onChange={(e) => setSeo({ hashtags: e.target.value })} />
            </div>

            <div>
              <span className={label}>What each platform gets</span>
              <div className="grid gap-2 md:grid-cols-2">
                {PLATFORMS.map((pl) => {
                  const c = platformCopy(seoNow, pl.id);
                  return (
                    <div key={pl.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">{pl.label}</span>
                        <a href={pl.uploadUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:underline">
                          Open upload page <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="truncate text-xs text-slate-300">Title: {c.title || '(empty)'}</p>
                      {(c.titleCut || c.captionCut) && (
                        <p className="text-[11px] text-amber-300">
                          {c.titleCut ? `Title cut to ${pl.titleMax} characters. ` : ''}
                          {c.captionCut ? `Text cut to ${CAPTION_MAX} characters.` : ''}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <button className={`${btnGhost} !py-1 text-xs`} onClick={() => copy(c.title, 'Title')}>
                          <Copy className="h-3 w-3" /> Title
                        </button>
                        <button className={`${btnGhost} !py-1 text-xs`} onClick={() => copy(c.body, 'Description & tags')}>
                          <Copy className="h-3 w-3" /> Description & tags
                        </button>
                        <button className={`${btnPrimary} !py-1 text-xs`} onClick={() => copy(`${c.title}\n\n${c.body}`, 'Full post')}>
                          <Check className="h-3 w-3" /> Copy all
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Write the title, description and tags with the button above.</p>
        )}
      </div>

      <div className={card}>
        <h3 className="mb-3 text-base font-bold text-white">3. Thumbnail</h3>
        <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr]">
          <div className="flex justify-center rounded-xl bg-black p-2">
            <canvas ref={thumbRef} className="max-h-[360px] w-auto max-w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <span className={label}>Headline</span>
                <input className={input} value={p.thumb.headline} onChange={(e) => patchThumb({ headline: e.target.value.toUpperCase() })} />
              </div>
              <div className="col-span-2">
                <span className={label}>Badge</span>
                <input className={input} value={p.thumb.badge} onChange={(e) => patchThumb({ badge: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <span className={label}>Text color</span>
                <input type="color" className="h-9 w-full rounded bg-transparent" value={p.thumb.textColor} onChange={(e) => patchThumb({ textColor: e.target.value })} />
              </div>
              <div>
                <span className={label}>Badge color</span>
                <input type="color" className="h-9 w-full rounded bg-transparent" value={p.thumb.accent} onChange={(e) => patchThumb({ accent: e.target.value })} />
              </div>
              <div className="col-span-2">
                <span className={label}>Text position</span>
                <select className={input} value={p.thumb.position} onChange={(e) => patchThumb({ position: e.target.value as Thumb['position'] })}>
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className={`${btnGhost} cursor-pointer`}>
                <Upload className="h-4 w-4" /> Background image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageTo(f, (url) => patchThumb({ bg: url }));
                    e.target.value = '';
                  }}
                />
              </label>
              {exported && (
                <button className={btnGhost} disabled={!!busy} onClick={thumbFromVideo}>
                  <ImageIcon className="h-4 w-4" /> Frame from my video
                </button>
              )}
              <button className={btnGhost} onClick={() => thumbRef.current?.toBlob((b) => b && downloadBlob(b, 'thumbnail.png'), 'image/png')}>
                <Download className="h-4 w-4" /> PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="text-base font-bold text-white">4. Post to all platforms (Buffer)</h3>
        <p className="mt-1 text-sm text-slate-400">
          Connect your accounts once inside Buffer, then post to all of them with one click. Buffer free plan allows 3 channels.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="password"
            className={input}
            placeholder="Studio publish password (STUDIO_PUBLISH_PASSWORD)"
            value={pubKey}
            onChange={(e) => savePubKey(e.target.value)}
          />
          <button className={btnGhost} disabled={!pubKey || !!busy} onClick={loadChannels}>
            <Spin on={busy === 'channels'}>
              <RefreshCw className="h-4 w-4" />
            </Spin>
            Load my Buffer channels
          </button>
        </div>
        {channels.length > 0 && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={picked.includes(c.id)}
                    onChange={(e) => setPicked((o) => (e.target.checked ? [...o, c.id] : o.filter((x) => x !== c.id)))}
                  />
                  <span className="font-semibold capitalize text-white">{c.service}</span>
                  <span className="text-slate-400">{c.displayName || c.name}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select className={`${input} !w-auto`} value={postWhen} onChange={(e) => setPostWhen(e.target.value as typeof postWhen)}>
                <option value="now">Post now</option>
                <option value="queue">Add to Buffer queue</option>
                <option value="schedule">Schedule…</option>
              </select>
              {postWhen === 'schedule' && (
                <input type="datetime-local" className={`${input} !w-auto`} value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
              )}
              <button className={`${btnPrimary} !bg-emerald-600 hover:!bg-emerald-500`} disabled={!!busy} onClick={postEverywhere}>
                <Spin on={busy === 'post'}>
                  <Upload className="h-4 w-4" />
                </Spin>
                {busy === 'post' ? (progress > 0 && progress < 100 ? `Uploading ${Math.round(progress)}%` : 'Working…') : 'Upload video & post'}
              </button>
              <span className="text-xs text-slate-400">
                Video {exported ? '✅' : '❌'} · Title & tags {seoNow ? '✅' : '❌'}
              </span>
            </div>
          </div>
        )}
        {postStage && <p className="mt-3 text-sm text-indigo-300">{postStage}</p>}
        {postError && <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{postError}</p>}
        {postLog.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {postLog.map((l, i) => (
              <li key={i} className={l.ok ? 'text-emerald-400' : 'text-red-400'}>
                {l.ok ? '✓' : '✗'} {l.label}: {l.msg}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-between">
        <button className={btnGhost} onClick={() => patch({ step: STEP_JOIN })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className={btnGhost} onClick={resetAll}>
          <RotateCcw className="h-4 w-4" /> New project
        </button>
      </div>
    </div>
  );

  const stepViews = [stepWrite, stepScenes, stepJoinView, stepPost];

  // The thumbnail preview: the chosen background (video frame or upload) with the headline and badge drawn on it
  useEffect(() => {
    if (p.step !== STEP_POST) return;
    const c = thumbRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const W = p.format === 'vertical' ? 720 : 1280;
    const H = p.format === 'vertical' ? 1280 : 720;
    c.width = W;
    c.height = H;
    const t = p.thumb;
    const render = (img: HTMLImageElement | null) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      if (img) {
        const k = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        ctx.drawImage(img, (W - img.naturalWidth * k) / 2, (H - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
      }
      const g = ctx.createLinearGradient(0, t.position === 'top' ? 0 : H, 0, t.position === 'top' ? H * 0.7 : H * 0.3);
      if (t.position !== 'center') {
        g.addColorStop(0, 'rgba(0,0,0,0.85)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, W, H);
      }
      const size = Math.round(W / (p.format === 'vertical' ? 6 : 9));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${size}px Impact, "Arial Black", sans-serif`;
      const words = t.headline.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let line = '';
      words.forEach((w) => {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > W * 0.9 && line) {
          lines.push(line);
          line = w;
        } else line = test;
      });
      if (line) lines.push(line);
      const lh = size * 1.1;
      const blockH = lines.length * lh;
      const cy = t.position === 'top' ? H * 0.2 + blockH / 2 - lh : t.position === 'center' ? H / 2 : H - blockH / 2 - H * 0.07;
      ctx.lineJoin = 'round';
      ctx.lineWidth = size / 7;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = t.textColor;
      lines.forEach((l, i) => {
        const y = cy - blockH / 2 + lh / 2 + i * lh;
        ctx.strokeText(l, W / 2, y);
        ctx.fillText(l, W / 2, y);
      });
      if (t.badge.trim()) {
        const bs = Math.round(size * 0.42);
        ctx.font = `800 ${bs}px "Segoe UI", Arial, sans-serif`;
        const bw = ctx.measureText(t.badge).width + bs * 1.2;
        const bh = bs * 1.6;
        ctx.fillStyle = t.accent;
        const bx = W * 0.05;
        const by = H * 0.05;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, bh / 2) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(t.badge, bx + bs * 0.6, by + bh / 2 + 1);
      }
    };
    if (t.bg) loadImage(t.bg).then(render).catch(() => render(null));
    else render(null);
  }, [p.step, p.thumb, p.format]);

  // Writes the title, description and tags the first time the Post step opens (if the video has scenes)
  useEffect(() => {
    if (p.step === STEP_POST && !p.seo && p.scenes.length && !busy) generateSeo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.step]);

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">AI Video Studio</h2>
          <p className="text-sm text-slate-400">Prompt → scene prompts → join your Flow clips → title, thumbnail & post</p>
        </div>
        {p.scenes.length > 0 && (
          <button className={btnGhost} onClick={resetAll}>
            <RotateCcw className="h-4 w-4" /> New project
          </button>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STEPS.map((name, i) => (
          <button
            key={name}
            onClick={() => goto(i)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              p.step === i ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${p.step === i ? 'bg-white/20' : 'bg-slate-700'}`}>{i + 1}</span>
            {name}
          </button>
        ))}
      </div>

      {planMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">
          <Loader2 className="h-4 w-4 animate-spin" /> {planMsg}
        </div>
      )}
      {stepViews[p.step]}
    </div>
  );
}
