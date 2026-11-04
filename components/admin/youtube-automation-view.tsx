'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Download,
  Copy,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  ImageIcon,
  Check,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PuterAuthBadge from '@/components/puter-auth-badge';
import { puterChat } from '@/lib/puter';
import {
  extractJson,
  fileToDataUrl,
  toJpegDataUrl,
  generateImage,
  generateSpeech,
  decodeAudio,
  downloadBlob,
} from '@/lib/video-studio-ai';
import {
  RenderScene,
  RenderSettings,
  Transition,
  VideoFilter,
  Corner,
  drawFrame,
  scheduleAudio,
  exportVideo,
  totalDuration,
  loadImage,
} from '@/lib/video-render';

/* ------------------------------------------------------------------ types */

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook';

interface Scene {
  id: string;
  prompt: string;
  narration: string;
  caption: string;
  duration: number;
  image?: string; // data URL
  extraRef?: string; // optional scene-specific reference image
  voice?: Blob;
}

interface Character {
  name: string;
  description: string;
  image?: string;
}

interface EditSettings {
  transition: Transition;
  motion: boolean;
  filter: VideoFilter;
  capShow: boolean;
  capPos: 'top' | 'middle' | 'bottom';
  capSize: number;
  capColor: string;
  logoPos: Corner;
  logoSize: number;
  logoOpacity: number;
  voiceVol: number;
  musicVol: number;
}

interface Thumb {
  bg: string;
  headline: string;
  badge: string;
  textColor: string;
  accent: string;
  position: 'top' | 'center' | 'bottom';
}

type Seo = Record<Platform, { title: string; description: string; hashtags: string }>;

interface Project {
  step: number;
  model: string;
  prompt: string;
  genre: string;
  mood: string;
  setting: string;
  cast: string;
  idea: string;
  sceneCount: number;
  style: string;
  format: 'vertical' | 'horizontal';
  language: 'roman_urdu' | 'english' | 'urdu';
  voiceLang: string;
  title: string;
  story: string;
  characters: Character[];
  scenes: Scene[];
  edit: EditSettings;
  music?: { name: string; blob: Blob };
  logo?: string;
  thumb: Thumb;
  seo: Seo | null;
}

const STEPS = ['Write Prompt', 'Characters', 'Generate Scenes', 'Edit Video', 'Thumbnail & SEO', 'Export'];

const STYLES = [
  'cinematic anime style',
  'Pixar-style 3D animation',
  'cinematic photorealistic 8k',
  'comic book illustration',
  'watercolor storybook',
  'dark moody cinematic',
];

const BESHAAN = 'Beshaan (Fashion • Lifestyle • Gaming)';
const BESHAAN_CONTEXT =
  'CHANNEL: BESHAAN. Tagline: Three Creators | Three Personalities | One Amazing Journey. Two girls and one boy blending fashion, lifestyle vibes and gaming entertainment. Tone: energetic trio banter, friendly, trendy, fun, positive, family-safe. The three recurring characters have distinct personalities (e.g. the stylish fashion girl, the bubbly lifestyle girl, the funny gamer boy) and stay the same in every video. Content ideas: outfit challenges, styling battles, room/lifestyle vlogs, gaming nights, challenges and playful rivalry between the trio.';
const GENRES = [BESHAAN, 'Romantic', 'Comedy', 'Horror', 'Action', 'Fantasy', 'Sci-Fi', 'Mystery', 'Motivational', 'Friendship', 'Family drama', 'Fashion & Lifestyle', 'Gaming'];
const MOODS = ['Fun & energetic', 'Emotional', 'Funny', 'Suspenseful', 'Epic', 'Heartwarming', 'Dark', 'Cute & light'];
const SETTINGS = ['Fashion studio / bedroom', 'Shopping mall', 'Home lifestyle vlog', 'Rooftop at sunset', 'College campus', 'Rainy city street', 'Village & fields', 'Futuristic city', 'Haunted house', 'Beach', 'Mountains', 'Cafe', 'Gaming room', 'Wedding'];
const CASTS = ['1 boy + 1 girl', '2 girls + 1 boy', '3 friends', '1 hero alone', 'Family (3 members)', 'Hero vs villain'];

const PLATFORMS: { id: Platform; label: string; titleMax: number; uploadUrl: string }[] = [
  { id: 'youtube', label: 'YouTube Shorts', titleMax: 100, uploadUrl: 'https://studio.youtube.com' },
  { id: 'tiktok', label: 'TikTok', titleMax: 150, uploadUrl: 'https://www.tiktok.com/creator-center/upload' },
  { id: 'instagram', label: 'Instagram Reels', titleMax: 125, uploadUrl: 'https://www.instagram.com/' },
  { id: 'facebook', label: 'Facebook Reels', titleMax: 125, uploadUrl: 'https://www.facebook.com/reels/create' },
];

const LANG_LABEL: Record<Project['language'], string> = {
  roman_urdu: 'Roman Urdu (Urdu written in English letters)',
  english: 'English',
  urdu: 'Urdu (Arabic script)',
};

function newProject(): Project {
  return {
    step: 0,
    model: 'openai/gpt-4o',
    prompt: '',
    genre: BESHAAN,
    mood: 'Fun & energetic',
    setting: 'Fashion studio / bedroom',
    cast: '2 girls + 1 boy',
    idea: '',
    sceneCount: 7,
    style: STYLES[0],
    format: 'vertical',
    language: 'roman_urdu',
    voiceLang: 'en-US',
    title: '',
    story: '',
    characters: [
      { name: '', description: '' },
      { name: '', description: '' },
      { name: '', description: '' },
    ],
    scenes: [],
    edit: {
      transition: 'fade',
      motion: true,
      filter: 'none',
      capShow: true,
      capPos: 'bottom',
      capSize: 44,
      capColor: '#ffffff',
      logoPos: 'tr',
      logoSize: 16,
      logoOpacity: 0.9,
      voiceVol: 1,
      musicVol: 0.25,
    },
    thumb: {
      bg: '',
      headline: '',
      badge: '',
      textColor: '#ffffff',
      accent: '#ef4444',
      position: 'bottom',
    },
    seo: null,
  };
}

// Keeps the project alive when the admin switches dashboard tabs (component unmounts) during one session.
let projectCache: Project | null = null;

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

/* ---------------------------------------------------------------- component */

export default function YoutubeAutomationView({ mode = 'wizard' }: { mode?: 'wizard' | 'editor' }) {
  const [p, setP] = useState<Project>(() => projectCache || newProject());
  const [busy, setBusy] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string>('');
  const [seoTab, setSeoTab] = useState<Platform>('youtube');
  const [ideaList, setIdeaList] = useState<string[]>([]);
  const [autoMsg, setAutoMsg] = useState<string>('');
  const autoCancel = useRef(false);
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

  // decoded media
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [voices, setVoices] = useState<Record<string, { blob: Blob; buf: AudioBuffer }>>({});
  const [musicBuf, setMusicBuf] = useState<AudioBuffer | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);

  // player
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const thumbRef = useRef<HTMLCanvasElement | null>(null);
  const acRef = useRef<AudioContext | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const cancelRef = useRef({ cancelled: false });
  const pRef = useRef(p);
  pRef.current = p;

  useEffect(() => {
    projectCache = p;
  }, [p]);

  useEffect(() => {
    if (mode === 'editor') setP((o) => ({ ...o, step: Math.max(o.step, 3) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = useCallback((x: Partial<Project>) => setP((o) => ({ ...o, ...x })), []);
  const patchEdit = (x: Partial<EditSettings>) => setP((o) => ({ ...o, edit: { ...o.edit, ...x } }));
  const patchThumb = (x: Partial<Thumb>) => setP((o) => ({ ...o, thumb: { ...o.thumb, ...x } }));
  const patchScene = useCallback(
    (id: string, x: Partial<Scene>) =>
      setP((o) => ({ ...o, scenes: o.scenes.map((s) => (s.id === id ? { ...s, ...x } : s)) })),
    []
  );
  const patchChar = (i: number, x: Partial<Character>) =>
    setP((o) => ({ ...o, characters: o.characters.map((c, k) => (k === i ? { ...c, ...x } : c)) }));

  const getAc = () => {
    if (!acRef.current) {
      const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      acRef.current = new AC();
    }
    return acRef.current;
  };

  const dims = p.format === 'vertical' ? { w: 720, h: 1280 } : { w: 1280, h: 720 };
  const formatLabel = p.format === 'vertical' ? '9:16 vertical' : '16:9 horizontal';

  /* ------------------------------------------------ decode media (images, voices, music, logo) */

  const imageKey = p.scenes.map((s) => `${s.id}:${s.image ? s.image.length : 0}`).join('|');
  useEffect(() => {
    let dead = false;
    (async () => {
      const next: Record<string, HTMLImageElement> = {};
      for (const s of pRef.current.scenes) {
        if (!s.image) continue;
        try {
          next[s.id] = await loadImage(s.image);
        } catch {
          /* skip broken image */
        }
      }
      if (!dead) setImages(next);
    })();
    return () => {
      dead = true;
    };
  }, [imageKey]);

  const voiceKey = p.scenes.map((s) => `${s.id}:${s.voice ? s.voice.size : 0}`).join('|');
  useEffect(() => {
    let dead = false;
    (async () => {
      const next: Record<string, { blob: Blob; buf: AudioBuffer }> = {};
      for (const s of pRef.current.scenes) {
        if (!s.voice) continue;
        try {
          next[s.id] = { blob: s.voice, buf: await decodeAudio(getAc(), s.voice) };
        } catch {
          /* skip undecodable audio */
        }
      }
      if (!dead) setVoices(next);
    })();
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceKey]);

  useEffect(() => {
    let dead = false;
    if (!p.music) {
      setMusicBuf(null);
      return;
    }
    decodeAudio(getAc(), p.music.blob)
      .then((b) => !dead && setMusicBuf(b))
      .catch(() => toast.error('Could not decode the music file'));
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.music]);

  useEffect(() => {
    if (!p.logo) {
      setLogoImg(null);
      return;
    }
    loadImage(p.logo)
      .then(setLogoImg)
      .catch(() => setLogoImg(null));
  }, [p.logo]);

  const renderScenes: RenderScene[] = useMemo(
    () =>
      p.scenes.map((s) => ({
        img: images[s.id] || null,
        caption: s.caption,
        duration: s.duration,
        voice: voices[s.id]?.buf || null,
      })),
    [p.scenes, images, voices]
  );

  const renderSettings: RenderSettings = useMemo(
    () => ({
      width: dims.w,
      height: dims.h,
      transition: p.edit.transition,
      motion: p.edit.motion,
      filter: p.edit.filter,
      captions: { show: p.edit.capShow, position: p.edit.capPos, size: p.edit.capSize, color: p.edit.capColor },
      logo: { img: logoImg, position: p.edit.logoPos, size: p.edit.logoSize, opacity: p.edit.logoOpacity },
      voiceVolume: p.edit.voiceVol,
      musicVolume: p.edit.musicVol,
    }),
    [dims.w, dims.h, p.edit, logoImg]
  );

  const rsRef = useRef(renderScenes);
  rsRef.current = renderScenes;
  const setRef = useRef(renderSettings);
  setRef.current = renderSettings;
  const musicRef = useRef(musicBuf);
  musicRef.current = musicBuf;

  const total = totalDuration(renderScenes);

  /* ---------------------------------------------------------------- AI helpers */

  const ask = async (system: string, user: string) =>
    puterChat(user, { model: p.model, systemPrompt: system, max_tokens: 8000 });

  const charactersText = (chars: Character[]) =>
    chars
      .filter((c) => c.description.trim() || c.name.trim())
      .map((c) => `${c.name || 'Character'}: ${c.description}`)
      .join('\n');

  const scenePromptSchema =
    '"prompt": a COMPLETE detailed AI video prompt for this scene (setting, characters by name with their fixed look, actions, dialogue lines, facial expressions, camera movement, lighting, background music mood, lip-sync note, duration, visual style), "narration": the exact spoken dialogue/voiceover for this scene, "caption": a short subtitle line (max 12 words), "duration": seconds (4-8)';

  const buildPrompt = async (): Promise<string> => {
    const system =
      'You are a creative director for AI videos. Write ONE complete, vivid video prompt in plain English (150-250 words): story, characters with fixed looks, dialogues, expressions, camera movements, lighting, background music, lip-sync, duration and visual style. Output ONLY the prompt text.';
    const user = `${p.genre === BESHAAN ? BESHAAN_CONTEXT + ' ' : ''}Genre: ${p.genre}
Mood: ${p.mood}
Setting: ${p.setting}
Cast: ${p.cast}
Visual style: ${p.style}
Format: ${formatLabel}
Dialogue language: ${LANG_LABEL[p.language]}
${p.idea.trim() ? `User's extra idea: ${p.idea}
` : ''}Invent an original, engaging story with a strong hook and satisfying ending.`;
    return (await ask(system, user)).trim();
  };

  const suggestIdeas = async () => {
    setBusy('ideas');
    try {
      const system = 'You are a viral short-video idea generator. Reply with ONLY valid JSON, no markdown.';
      const user = `${p.genre === BESHAAN ? BESHAAN_CONTEXT + ' ' : ''}Genre: ${p.genre}. Mood: ${p.mood}. Setting: ${p.setting}. Cast: ${p.cast}. Format: ${formatLabel}.
Give 15 DIFFERENT, specific, fresh video ideas (one sentence each, with a hook, max 25 words). Return {"ideas":["...","..."]}`;
      const data = extractJson<any>(await ask(system, user));
      const list: string[] = (data.ideas || []).map((x: any) => String(x)).filter(Boolean).slice(0, 20);
      if (!list.length) throw new Error('No ideas returned. Try again.');
      setIdeaList(list);
    } catch (e: any) {
      toast.error(e?.message || 'Could not get ideas');
    } finally {
      setBusy('');
    }
  };

  const createPrompt = async () => {
    setBusy('idea');
    try {
      patch({ prompt: await buildPrompt() });
      toast.success('Prompt ready. Edit it if you like, then generate scenes.');
    } catch (e: any) {
      toast.error(e?.message || 'Could not create prompt');
    } finally {
      setBusy('');
    }
  };

  const generatePlan = async () => {
    setBusy('plan');
    try {
      let mainPrompt = p.prompt.trim();
      if (!mainPrompt) {
        mainPrompt = await buildPrompt();
        patch({ prompt: mainPrompt });
      }
      const system =
        'You are a senior AI video director. You turn ONE video idea into connected scenes for an AI video generator. Characters must keep the same fixed appearance in every scene. Reply with ONLY valid JSON, no markdown.';
      const user = `${p.genre === BESHAAN ? BESHAAN_CONTEXT + ' ' : ''}VIDEO IDEA:\n${mainPrompt}\n\nNumber of scenes: ${p.sceneCount}\nVisual style: ${p.style}\nAspect ratio: ${formatLabel}\nLanguage for dialogue/narration/captions: ${LANG_LABEL[p.language]}\n\nReturn JSON exactly like:\n{"title":"video title","story":"2-3 sentence story summary","characters":[{"name":"","description":"fixed appearance: face, hair, clothes, age, art style"}],"scenes":[{${scenePromptSchema}}]}\nUse at most 3 characters and exactly ${p.sceneCount} scenes that flow as one story (clear beginning, build-up, ending).`;
      const text = await ask(system, user);
      const data = extractJson<any>(text);
      const scenes: Scene[] = (data.scenes || []).slice(0, 30).map((s: any) => ({
        id: uid(),
        prompt: String(s.prompt || ''),
        narration: String(s.narration || ''),
        caption: String(s.caption || ''),
        duration: Math.min(15, Math.max(2, Number(s.duration) || 5)),
      }));
      if (!scenes.length) throw new Error('No scenes returned. Try again.');
      const chars = [0, 1, 2].map((i) => {
        const old = p.characters[i];
        const ai = (data.characters || [])[i];
        return {
          ...old,
          name: old.name || String(ai?.name || ''),
          description: old.description || String(ai?.description || ''),
        };
      });
      setP((o) => ({
        ...o,
        title: String(data.title || o.title),
        story: String(data.story || ''),
        characters: chars,
        scenes,
        seo: null,
        step: 1,
      }));
      setSelectedId(scenes[0].id);
      toast.success(`${scenes.length} scene prompts ready. Creating character images…`);
      // Auto-create reference images for characters that have a description but no image yet
      let made = 0;
      for (let i = 0; i < chars.length; i++) {
        if (!chars[i].description.trim() || chars[i].image) continue;
        try {
          const { dataUrl } = await generateImage(
            `Character reference image, full body, front view, neutral plain background, clean lighting. Style: ${p.style}. ${chars[i].name ? `Name: ${chars[i].name}. ` : ''}${chars[i].description}`
          );
          patchChar(i, { image: dataUrl });
          made++;
        } catch {
          toast.error(`Character ${i + 1} image failed. You can retry in step 2.`);
        }
      }
      if (made) toast.success(`${made} character image(s) ready`);
      return true;
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate prompts');
      return false;
    } finally {
      setBusy('');
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
      const user = `STORY: ${p.story || p.prompt}\nMAIN IDEA: ${p.prompt}\nCHARACTERS:\n${charactersText(p.characters)}\nStyle: ${p.style}\nLanguage: ${LANG_LABEL[p.language]}\nPrevious scene: ${p.scenes[idx - 1]?.prompt.slice(0, 400) || '(none, this is the opening)'}\nNext scene: ${p.scenes[idx + 1]?.prompt.slice(0, 400) || '(none, this is the ending)'}\nCurrent scene ${idx + 1} of ${p.scenes.length}: ${sc.prompt}\n\nWrite a fresh, better version. Return {${scenePromptSchema}}`;
      const data = extractJson<any>(await ask(system, user));
      patchScene(id, {
        prompt: String(data.prompt || sc.prompt),
        narration: String(data.narration || sc.narration),
        caption: String(data.caption || sc.caption),
        duration: Math.min(15, Math.max(2, Number(data.duration) || sc.duration)),
      });
      toast.success(`Scene ${idx + 1} prompt regenerated`);
    } catch (e: any) {
      toast.error(e?.message || 'Could not regenerate');
    } finally {
      setBusy('');
    }
  };

  const generateCharacterImage = async (i: number) => {
    const c = p.characters[i];
    if (!c.description.trim()) return toast.error('Describe the character first');
    setBusy(`char:${i}`);
    try {
      const { dataUrl } = await generateImage(
        `Character reference image, full body, front view, neutral plain background, clean lighting. Style: ${p.style}. ${c.name ? `Name: ${c.name}. ` : ''}${c.description}`
      );
      patchChar(i, { image: dataUrl });
    } catch (e: any) {
      toast.error(e?.message || 'Image generation failed. Make sure you are signed in to Puter.');
    } finally {
      setBusy('');
    }
  };

  const sceneImagePrompt = (sc: Scene) =>
    `${p.style}. ${formatLabel} composition. Keep every character EXACTLY as in the reference image (same face, hairstyle, clothes, colors and art style). Characters:\n${charactersText(p.characters)}\nScene: ${sc.prompt.slice(0, 1100)}`;

  const generateSceneImage = async (id: string, silent = false) => {
    const sc = pRef.current.scenes.find((s) => s.id === id);
    if (!sc) return;
    setBusy(`img:${id}`);
    try {
      const refs = [...pRef.current.characters.map((c) => c.image).filter(Boolean), sc.extraRef].filter(Boolean) as string[];
      const { dataUrl, usedReference } = await generateImage(sceneImagePrompt(sc), refs);
      patchScene(id, { image: dataUrl });
      if (!silent && refs.length && !usedReference)
        toast('Reference images were not accepted by the image model. Scene made from text descriptions only.', { icon: '⚠️' });
    } catch (e: any) {
      toast.error(e?.message || 'Image generation failed');
      throw e;
    } finally {
      setBusy('');
    }
  };

  const generateAllImages = async () => {
    cancelRef.current = { cancelled: false };
    const todo = pRef.current.scenes.filter((s) => !s.image).map((s) => s.id);
    if (!todo.length) return toast('All scenes already have images');
    setBusy('all');
    let refsIgnored = false;
    try {
      for (let i = 0; i < todo.length; i++) {
        if (cancelRef.current.cancelled) break;
        setProgress((i / todo.length) * 100);
        const sc = pRef.current.scenes.find((s) => s.id === todo[i]);
        if (!sc) continue;
        const refs = [...pRef.current.characters.map((c) => c.image).filter(Boolean), sc.extraRef].filter(Boolean) as string[];
        const r = await generateImage(sceneImagePrompt(sc), refs);
        if (refs.length && !r.usedReference) refsIgnored = true;
        patchScene(todo[i], { image: r.dataUrl });
      }
      if (refsIgnored) toast('Some scenes were made without image references (model unsupported).', { icon: '⚠️' });
      else toast.success('Scene images done');
    } catch (e: any) {
      toast.error(e?.message || 'Stopped: image generation failed');
    } finally {
      setBusy('');
      setProgress(0);
    }
  };

  const makeVoice = async (id: string) => {
    const sc = pRef.current.scenes.find((s) => s.id === id);
    if (!sc?.narration.trim()) return toast.error('This scene has no narration text');
    setBusy(`voice:${id}`);
    try {
      const blob = await generateSpeech(sc.narration, pRef.current.voiceLang);
      const buf = await decodeAudio(getAc(), blob);
      patchScene(id, { voice: blob, duration: Math.max(sc.duration, Math.ceil((buf.duration + 0.3) * 2) / 2) });
    } catch (e: any) {
      toast.error(e?.message || 'Voiceover failed. Make sure you are signed in to Puter.');
    } finally {
      setBusy('');
    }
  };

  const uploadVoice = async (id: string, file: File) => {
    try {
      const buf = await decodeAudio(getAc(), file);
      const sc = pRef.current.scenes.find((s) => s.id === id);
      patchScene(id, { voice: file, duration: Math.max(sc?.duration || 0, Math.ceil((buf.duration + 0.2) * 2) / 2) });
    } catch {
      toast.error('Unsupported audio file');
    }
  };

  const makeAllVoices = async () => {
    setBusy('voices');
    try {
      const ids = pRef.current.scenes.filter((s) => s.narration.trim()).map((s) => s.id);
      for (let i = 0; i < ids.length; i++) {
        setProgress((i / ids.length) * 100);
        const sc = pRef.current.scenes.find((s) => s.id === ids[i]);
        if (!sc) continue;
        const blob = await generateSpeech(sc.narration, pRef.current.voiceLang);
        const buf = await decodeAudio(getAc(), blob);
        patchScene(ids[i], { voice: blob, duration: Math.max(sc.duration, Math.ceil((buf.duration + 0.3) * 2) / 2) });
      }
      toast.success('Voiceovers ready');
    } catch (e: any) {
      toast.error(e?.message || 'Voiceover failed');
    } finally {
      setBusy('');
      setProgress(0);
    }
  };

  const generateSeo = async () => {
    const p = pRef.current;
    setBusy('seo');
    try {
      const system =
        'You are a social media SEO expert for short-form video. Reply with ONLY valid JSON, no markdown. Each platform must get DIFFERENT, platform-native copy.';
      const user = `${p.genre === BESHAAN ? BESHAAN_CONTEXT + " Use channel name Beshaan in hashtags (#Beshaan #BeshaanVibe). " : ""}VIDEO TITLE: ${p.title}\nSTORY: ${p.story}\nIDEA: ${p.prompt}\nLANGUAGE: ${LANG_LABEL[p.language]} (hashtags may mix English)\nSCENES: ${p.scenes.map((s) => s.caption).join(' | ')}\n\nReturn JSON:\n{"thumbnail":{"headline":"max 4 punchy words, ALL CAPS","badge":"max 3 words"},"youtube":{"title":"<=100 chars, keyword first, include #Shorts","description":"hook line + 2-3 lines + CTA","hashtags":"#a #b #c (5-8)"},"tiktok":{"title":"<=150 chars hooky caption","description":"short caption text","hashtags":"4-6 hashtags incl. trending-style"},"instagram":{"title":"first-line hook <=125 chars","description":"caption with line breaks, emojis, CTA","hashtags":"8-12 hashtags"},"facebook":{"title":"<=125 chars","description":"conversational caption, ask a question","hashtags":"3-5 hashtags"}}`;
      const data = extractJson<any>(await ask(system, user));
      const pick = (k: Platform) => ({
        title: String(data[k]?.title || p.title),
        description: String(data[k]?.description || ''),
        hashtags: Array.isArray(data[k]?.hashtags) ? data[k].hashtags.join(' ') : String(data[k]?.hashtags || ''),
      });
      setP((o) => ({
        ...o,
        seo: { youtube: pick('youtube'), tiktok: pick('tiktok'), instagram: pick('instagram'), facebook: pick('facebook') },
        thumb: {
          ...o.thumb,
          headline: o.thumb.headline || String(data.thumbnail?.headline || o.title).toUpperCase(),
          badge: o.thumb.badge || String(data.thumbnail?.badge || '').toUpperCase(),
        },
      }));
      toast.success('SEO for all 4 platforms ready');
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate SEO');
    } finally {
      setBusy('');
    }
  };

  const generateThumbBg = async () => {
    setBusy('thumb');
    try {
      const refs = p.characters.map((c) => c.image).filter(Boolean) as string[];
      const { dataUrl } = await generateImage(
        `Eye-catching ${p.format === 'vertical' ? 'vertical' : 'YouTube'} thumbnail background art, dramatic lighting, vivid colors, big expressive characters, empty space for text, NO text or letters. Style: ${p.style}. Topic: ${p.title || p.prompt.slice(0, 200)}. Characters:\n${charactersText(p.characters)}`,
        refs
      );
      patchThumb({ bg: dataUrl });
    } catch (e: any) {
      toast.error(e?.message || 'Thumbnail generation failed');
    } finally {
      setBusy('');
    }
  };



  /* ------------------------------------------------ one-click posting via Buffer */

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

  const uploadToCloudinary = async (blob: Blob, ext: string): Promise<string> => {
    const isMp4 = ext === 'mp4';
    const t = await studioFetch('/api/admin/automation/cloudinary-sign', { convertToMp4: !isMp4 });
    const fd = new FormData();
    fd.append('file', blob, `video.${ext}`);
    fd.append('api_key', t.apiKey);
    fd.append('signature', t.signature);
    Object.keys(t.params).forEach((k) => fd.append(k, String(t.params[k])));
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${t.cloudName}/video/upload`);
      xhr.upload.onprogress = (e) => e.lengthComputable && setProgress((e.loaded / e.total) * 100);
      xhr.onerror = () => reject(new Error('Upload failed (network)'));
      xhr.onload = () => {
        try {
          const r = JSON.parse(xhr.responseText);
          if (xhr.status >= 300) return reject(new Error(r?.error?.message || 'Cloudinary rejected the upload'));
          const mp4 = r.eager?.[0]?.secure_url;
          resolve(isMp4 ? r.secure_url : mp4 || String(r.secure_url).replace(/[.][a-z0-9]+$/i, '.mp4'));
        } catch {
          reject(new Error('Bad response from Cloudinary'));
        }
      };
      xhr.send(fd);
    });
  };

  const postEverywhere = async () => {
    if (!exported) return toast.error('Render the video first (step 1 above)');
    if (!p.seo) return toast.error('Generate the SEO text first (step 5)');
    const targets = channels.filter((c) => picked.includes(c.id));
    if (!targets.length) return toast.error('Pick at least one channel');
    if (postWhen === 'schedule' && !dueAt) return toast.error('Choose a date and time');
    setBusy('post');
    setPostLog([]);
    setProgress(0);
    try {
      const videoUrl = await uploadToCloudinary(exported.blob, exported.ext);
      setProgress(0);
      const log: { label: string; ok: boolean; msg: string }[] = [];
      const nl = String.fromCharCode(10, 10);
      for (let i = 0; i < targets.length; i++) {
        const c = targets[i];
        const meta = p.seo[c.service as Platform];
        const label = `${c.service} · ${c.displayName || c.name}`;
        try {
          const r = await studioFetch('/api/admin/automation/buffer', {
            action: 'post',
            channelId: c.id,
            service: c.service,
            title: meta.title,
            text: (c.service === 'youtube' ? '' : meta.title + nl) + meta.description + nl + meta.hashtags,
            videoUrl,
            mode: postWhen === 'queue' ? 'queue' : 'now',
            dueAt: postWhen === 'schedule' ? new Date(dueAt).toISOString() : undefined,
          });
          log.push({ label, ok: true, msg: `Sent to Buffer (post ${r.postId || 'created'})` });
        } catch (e: any) {
          log.push({ label, ok: false, msg: e?.message || 'Failed' });
        }
        setPostLog(log.slice());
      }
      if (log.every((l) => l.ok)) toast.success('All posts sent');
      else toast.error('Some posts failed. See details.');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setBusy('');
      setProgress(0);
    }
  };

  /* ------------------------------------------------- one-click full automation */

  const waitFor = async (cond: () => boolean, ms = 15000) => {
    const t0 = Date.now();
    while (!cond() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 150));
  };
  const tick = () => new Promise((r) => setTimeout(r, 80));

  const autoAll = async () => {
    autoCancel.current = false;
    const stop = () => autoCancel.current;
    const fail = (m: string) => {
      toast.error(m);
      setAutoMsg('');
    };
    try {
      setAutoMsg('1/6 Writing story, scenes and characters…');
      if (!(await generatePlan())) return setAutoMsg('');
      await tick();
      if (stop()) return setAutoMsg('');

      setAutoMsg('2/6 Creating scene images…');
      await generateAllImages();
      await tick();
      if (pRef.current.scenes.some((s) => !s.image)) return fail('Some scene images failed. Open step 3 and press Generate all images to retry.');
      if (stop()) return setAutoMsg('');

      setAutoMsg('3/6 Creating voiceovers…');
      await makeAllVoices();
      await tick();
      if (stop()) return setAutoMsg('');

      setAutoMsg('4/6 Writing titles, descriptions, hashtags and thumbnail text…');
      await generateSeo();
      if (stop()) return setAutoMsg('');

      setAutoMsg('5/6 Preparing media…');
      await waitFor(() => {
        const sc = pRef.current.scenes;
        return sc.every((s, i) => (!s.image || !!rsRef.current[i]?.img) && (!s.voice || !!rsRef.current[i]?.voice));
      });
      patch({ step: 5 });
      await tick();

      setAutoMsg('6/6 Rendering the final video (keep this window open)…');
      await runExport(true);
      setAutoMsg('');
      if (!stop()) toast.success('Your video is ready. Download it below.');
    } catch (e: any) {
      fail(e?.message || 'Automation stopped');
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

  const removeScene = (id: string) =>
    setP((o) => ({ ...o, scenes: o.scenes.filter((s) => s.id !== id) }));

  const promptPack = () =>
    [
      `${p.title || 'AI VIDEO'}  |  ${p.style}  |  ${formatLabel}`,
      p.story ? `STORY: ${p.story}` : '',
      `CHARACTERS (attach the reference images and keep them IDENTICAL in every scene):\n${charactersText(p.characters) || '(none)'}`,
      ...p.scenes.map(
        (s, i) =>
          `\n===== SCENE ${i + 1} of ${p.scenes.length} (${s.duration}s) =====\n${s.prompt}\nDialogue / voice: ${s.narration}\nSubtitle: ${s.caption}`
      ),
    ]
      .filter(Boolean)
      .join('\n\n');

  const addImagesAsScenes = async (files: FileList | null) => {
    if (!files) return;
    const added: Scene[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        added.push({ id: uid(), prompt: '', narration: '', caption: '', duration: 4, image: await toJpegDataUrl(await fileToDataUrl(files[i])) });
      } catch {
        toast.error(`Could not read ${files[i].name}`);
      }
    }
    if (added.length) {
      setP((o) => ({ ...o, scenes: [...o.scenes, ...added] }));
      setSelectedId(added[0].id);
    }
  };

  const addScene = () => {
    const s: Scene = { id: uid(), prompt: '', narration: '', caption: '', duration: 5 };
    setP((o) => ({ ...o, scenes: [...o.scenes, s] }));
    setSelectedId(s.id);
  };

  const uploadImageTo = async (file: File, apply: (url: string) => void) => {
    try {
      apply(await toJpegDataUrl(await fileToDataUrl(file)));
    } catch {
      toast.error('Could not read that image');
    }
  };

  /* ------------------------------------------------------------------ player */

  const draw = useCallback((t: number) => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    drawFrame(ctx, rsRef.current, setRef.current, t);
  }, []);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopAudioRef.current?.();
    stopAudioRef.current = null;
    setPlaying(false);
  }, []);

  const playFrom = useCallback(
    async (from: number) => {
      const scenes = rsRef.current;
      const tot = totalDuration(scenes);
      if (!scenes.length) return;
      const ac = getAc();
      await ac.resume();
      cancelAnimationFrame(rafRef.current);
      stopAudioRef.current?.();
      const start = from >= tot - 0.05 ? 0 : from;
      stopAudioRef.current = scheduleAudio(ac, ac.destination, scenes, setRef.current, musicRef.current, start);
      const wall = performance.now();
      setPlaying(true);
      const loop = () => {
        const t = start + (performance.now() - wall) / 1000;
        if (t >= tot) {
          timeRef.current = tot;
          setTime(tot);
          draw(tot);
          pause();
          return;
        }
        timeRef.current = t;
        setTime(t);
        draw(t);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draw, pause]
  );

  const seek = (t: number) => {
    const wasPlaying = playing;
    pause();
    timeRef.current = t;
    setTime(t);
    draw(t);
    if (wasPlaying) playFrom(t);
  };

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    stopAudioRef.current?.();
  }, []);

  // keep a paused preview in sync with edits
  useEffect(() => {
    if (p.step === 3 && !playing) draw(timeRef.current);
  }, [p.step, playing, renderScenes, renderSettings, draw]);

  useEffect(() => {
    if (p.step !== 3 && playing) pause();
  }, [p.step, playing, pause]);

  /* ----------------------------------------------------------------- export */

  const runExport = async (auto = false) => {
    if (!p.scenes.length) return toast.error('No scenes to export');
    const missing = p.scenes.filter((s) => !s.image).length;
    if (!auto && missing && !window.confirm(`${missing} scene(s) have no image and will render as a placeholder. Continue?`)) return;
    pause();
    cancelRef.current = { cancelled: false };
    setBusy('export');
    setExported(null);
    setProgress(0);
    try {
      const r = await exportVideo(rsRef.current, setRef.current, musicRef.current, (x) => setProgress(x * 100), cancelRef.current);
      if (exported) URL.revokeObjectURL(exported.url);
      setExported({ url: URL.createObjectURL(r.blob), ext: r.ext, size: r.blob.size, blob: r.blob });
      toast.success('Video rendered');
    } catch (e: any) {
      if (!/cancelled/i.test(e?.message || '')) toast.error(e?.message || 'Export failed');
    } finally {
      setBusy('');
      setProgress(0);
    }
  };

  /* --------------------------------------------------------------- thumbnail */

  useEffect(() => {
    if (p.step !== 4) return;
    const c = thumbRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const W = p.format === 'vertical' ? 720 : 1280;
    const H = p.format === 'vertical' ? 1280 : 720;
    c.width = W;
    c.height = H;
    const t = p.thumb;
    const fallback = p.scenes.find((s) => s.image)?.image;
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
    const src = t.bg || fallback;
    if (src) loadImage(src).then(render).catch(() => render(null));
    else render(null);
  }, [p.step, p.thumb, p.format, p.scenes]);

  // Auto-generate SEO the first time the Thumbnail & SEO step is opened
  useEffect(() => {
    if (p.step === 4 && !p.seo && p.scenes.length && !busy) generateSeo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.step]);

  const downloadThumb = () => {
    thumbRef.current?.toBlob((b) => b && downloadBlob(b, 'thumbnail.png'), 'image/png');
  };

  /* -------------------------------------------------------------- navigation */

  const goto = (i: number) => {
    if (mode === 'wizard' && i > 0 && !p.scenes.length) return toast.error('Generate scene prompts in step 1 first');
    patch({ step: i });
  };

  const resetAll = () => {
    if (!window.confirm('Start a new project? Everything in this one will be cleared.')) return;
    pause();
    if (exported) URL.revokeObjectURL(exported.url);
    setExported(null);
    setSelectedId('');
    timeRef.current = 0;
    setTime(0);
    setP(newProject());
  };

  const selected = p.scenes.find((s) => s.id === selectedId) || p.scenes[0];
  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${what} copied`),
      () => toast.error('Copy failed')
    );
  };

  /* ------------------------------------------------------------------ steps */

  const step1 = (
    <div className="space-y-4">
      <div className={card}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white">Describe your video</h3>
          <PuterAuthBadge selectedModel={p.model} onModelSelect={(m) => patch({ model: m })} compact />
        </div>
        <div className="mb-4">
          <span className={label}>Genre</span>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <button key={g} onClick={() => patch(g === BESHAAN ? { genre: g, cast: '2 girls + 1 boy', mood: 'Fun & energetic' } : { genre: g })} className={`rounded-full px-3 py-1 text-xs font-semibold ${p.genre === g ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <span className={label}>Mood</span>
            <select className={input} value={p.mood} onChange={(e) => patch({ mood: e.target.value })}>
              {MOODS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Setting</span>
            <select className={input} value={p.setting} onChange={(e) => patch({ setting: e.target.value })}>
              {SETTINGS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Characters</span>
            <select className={input} value={p.cast} onChange={(e) => patch({ cast: e.target.value })}>
              {CASTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <span className={label}>Your idea (type your own, or pick one below)</span>
          <input className={input} placeholder="e.g. a shy boy finally confesses on the last day of college" value={p.idea} onChange={(e) => patch({ idea: e.target.value })} />
        </div>
        <div className="mb-4">
          <button className={btnGhost} disabled={!!busy} onClick={suggestIdeas}>
            <Spin on={busy === 'ideas'}><Sparkles className="h-4 w-4" /></Spin>
            {ideaList.length ? 'Suggest 15 new ideas' : 'Suggest 15 ideas for me'}
          </button>
          {ideaList.length > 0 && (
            <div className="mt-2 grid gap-1.5 md:grid-cols-2">
              {ideaList.map((idea, i) => (
                <button
                  key={i}
                  onClick={() => patch({ idea })}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${p.idea === idea ? 'border-indigo-500 bg-indigo-600/20 text-white' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
                >
                  <span className="mr-1 font-bold text-indigo-300">{i + 1}.</span>
                  {idea}
                </button>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-slate-500">Click an idea to use it, or type your own above.</p>
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
          placeholder="Leave empty: the prompt, scenes and character images are all created for you from the options above."
          value={p.prompt}
          onChange={(e) => patch({ prompt: e.target.value })}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
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
              <option value="roman_urdu">Roman Urdu</option>
              <option value="english">English</option>
              <option value="urdu">Urdu (script)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className={`${btnPrimary} !bg-emerald-600 hover:!bg-emerald-500`} disabled={!!busy || !!autoMsg} onClick={autoAll}>
            <Sparkles className="h-4 w-4" /> Auto-create full video (everything)
          </button>
          <button className={btnGhost} disabled={!!busy || !!autoMsg} onClick={generatePlan}>
            <Spin on={busy === 'plan'}>
              <Sparkles className="h-4 w-4" />
            </Spin>
            {p.scenes.length ? 'Only redo scenes & characters' : 'Only scenes & characters'}
          </button>
          {p.scenes.length > 0 && (
            <button className={btnGhost} onClick={() => patch({ step: 1 })}>
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <span className="text-xs text-slate-500">Uses your Puter AI sign-in. No API key needed.</span>
        </div>
      </div>
      {p.story && (
        <div className={card}>
          <input className={`${input} mb-2 font-bold`} value={p.title} onChange={(e) => patch({ title: e.target.value })} />
          <textarea className={`${input} min-h-[70px]`} value={p.story} onChange={(e) => patch({ story: e.target.value })} />
        </div>
      )}
    </div>
  );

  const step2 = (
    <div className="space-y-4">
      <div className={card}>
        <h3 className="text-base font-bold text-white">Character references (up to 3)</h3>
        <p className="mt-1 text-sm text-slate-400">
          These images are sent with <b>every scene</b> so characters keep the same face, clothes and style. Upload your own or generate
          from a description. Leave empty for scenes without fixed characters.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {p.characters.map((c, i) => (
          <div key={i} className={card}>
            <div className="mb-3 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-700 bg-slate-950">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt={c.name || `Character ${i + 1}`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-slate-500">Character {i + 1}: no image</span>
              )}
            </div>
            <input className={`${input} mb-2`} placeholder="Name" value={c.name} onChange={(e) => patchChar(i, { name: e.target.value })} />
            <textarea
              className={`${input} mb-2 min-h-[90px]`}
              placeholder="Fixed look: age, face, hair, clothes, colors..."
              value={c.description}
              onChange={(e) => patchChar(i, { description: e.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              <button className={btnPrimary} disabled={!!busy} onClick={() => generateCharacterImage(i)}>
                <Spin on={busy === `char:${i}`}>
                  <Sparkles className="h-4 w-4" />
                </Spin>
                Generate
              </button>
              <label className={`${btnGhost} cursor-pointer`}>
                <Upload className="h-4 w-4" /> Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageTo(f, (url) => patchChar(i, { image: url }));
                    e.target.value = '';
                  }}
                />
              </label>
              {c.image && (
                <button className={btnGhost} onClick={() => patchChar(i, { image: undefined })}>
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button className={btnGhost} onClick={() => patch({ step: 0 })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className={btnPrimary} onClick={() => patch({ step: 2 })}>
          Next: Scenes <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const step3 = (
    <div className="space-y-4">
      <div className={`${card} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h3 className="text-base font-bold text-white">Scenes ({p.scenes.length})</h3>
          <p className="text-xs text-slate-400">
            Edit prompts, reorder, regenerate. Images are made with your character references. For real motion video, use “Copy all
            prompts” in Veo / Kling / Runway / Sora (attach your character images there).
          </p>
        </div>
        <div className="flex gap-2">
          {busy === 'all' ? (
            <button className={btnGhost} onClick={() => (cancelRef.current.cancelled = true)}>
              Stop ({Math.round(progress)}%)
            </button>
          ) : (
            <button className={btnPrimary} disabled={!!busy} onClick={generateAllImages}>
              <ImageIcon className="h-4 w-4" /> Generate all images
            </button>
          )}
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

      {p.scenes.map((s, i) => (
        <div key={s.id} className={`${card} grid gap-4 md:grid-cols-[200px_1fr]`}>
          <div>
            <div
              className={`flex items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950 ${
                p.format === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
              }`}
            >
              {s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt={`Scene ${i + 1}`} className="h-full w-full object-cover" />
              ) : busy === `img:${s.id}` ? (
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              ) : (
                <span className="text-xs text-slate-500">No image</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button className={`${btnPrimary} !px-2 !py-1 text-xs`} disabled={!!busy} onClick={() => generateSceneImage(s.id).catch(() => undefined)}>
                <RefreshCw className="h-3.5 w-3.5" /> {s.image ? 'Redo' : 'Generate'}
              </button>
              <label className={`${btnGhost} cursor-pointer !px-2 !py-1 text-xs`}>
                <Upload className="h-3.5 w-3.5" /> Own image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageTo(f, (url) => patchScene(s.id, { image: url }));
                    e.target.value = '';
                  }}
                />
              </label>
              <label className={`${btnGhost} cursor-pointer !px-2 !py-1 text-xs`} title="Extra reference used only for this scene">
                <ImageIcon className="h-3.5 w-3.5" /> {s.extraRef ? 'Ref ✓' : '+ Ref'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageTo(f, (url) => patchScene(s.id, { extraRef: url }));
                    e.target.value = '';
                  }}
                />
              </label>
              {s.extraRef && (
                <button className={`${btnGhost} !px-2 !py-1 text-xs`} onClick={() => patchScene(s.id, { extraRef: undefined })}>
                  Clear ref
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-300">Scene {i + 1}</span>
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
            <textarea className={`${input} min-h-[120px]`} placeholder="Full AI video prompt for this scene" value={s.prompt} onChange={(e) => patchScene(s.id, { prompt: e.target.value })} />
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_90px]">
              <input className={input} placeholder="Narration / dialogue (spoken)" value={s.narration} onChange={(e) => patchScene(s.id, { narration: e.target.value })} />
              <input className={input} placeholder="Subtitle (on screen)" value={s.caption} onChange={(e) => patchScene(s.id, { caption: e.target.value })} />
              <input className={input} type="number" min={2} max={20} step={0.5} value={s.duration} onChange={(e) => patchScene(s.id, { duration: Math.min(20, Math.max(1, Number(e.target.value) || 5)) })} title="Seconds" />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <button className={btnGhost} onClick={() => patch({ step: 1 })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className={btnPrimary} onClick={() => patch({ step: 3 })}>
          Next: Edit video <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const step4 = (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* preview */}
        <div className={card}>
          <div className="flex justify-center rounded-xl bg-black p-2">
            <canvas
              ref={canvasRef}
              width={dims.w}
              height={dims.h}
              className="max-h-[480px] w-auto max-w-full rounded-lg"
              style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button className={btnPrimary} onClick={() => (playing ? pause() : playFrom(timeRef.current))} disabled={!p.scenes.length}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <input
              type="range"
              className="flex-1"
              min={0}
              max={Math.max(0.1, total)}
              step={0.05}
              value={Math.min(time, total)}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <span className="w-20 text-right font-mono text-xs text-slate-400">
              {time.toFixed(1)}/{total.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* controls */}
        <div className="space-y-4">
          <div className={card}>
            <h4 className="mb-2 text-sm font-bold text-white">Look & transitions</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div>
                <span className={label}>Transition</span>
                <select className={input} value={p.edit.transition} onChange={(e) => patchEdit({ transition: e.target.value as Transition })}>
                  <option value="none">None (cut)</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom in</option>
                </select>
              </div>
              <div>
                <span className={label}>Color effect</span>
                <select className={input} value={p.edit.filter} onChange={(e) => patchEdit({ filter: e.target.value as VideoFilter })}>
                  <option value="none">None</option>
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                  <option value="bw">Black & white</option>
                  <option value="vignette">Vignette</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-slate-200">
                <input type="checkbox" checked={p.edit.motion} onChange={(e) => patchEdit({ motion: e.target.checked })} />
                Camera motion (slow zoom/pan)
              </label>
            </div>
          </div>

          <div className={card}>
            <h4 className="mb-2 text-sm font-bold text-white">Subtitles</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <label className="flex items-end gap-2 pb-2 text-sm text-slate-200">
                <input type="checkbox" checked={p.edit.capShow} onChange={(e) => patchEdit({ capShow: e.target.checked })} /> Show
              </label>
              <div>
                <span className={label}>Position</span>
                <select className={input} value={p.edit.capPos} onChange={(e) => patchEdit({ capPos: e.target.value as EditSettings['capPos'] })}>
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
              <div>
                <span className={label}>Size {p.edit.capSize}</span>
                <input type="range" min={24} max={80} value={p.edit.capSize} onChange={(e) => patchEdit({ capSize: Number(e.target.value) })} className="w-full" />
              </div>
              <div>
                <span className={label}>Color</span>
                <input type="color" value={p.edit.capColor} onChange={(e) => patchEdit({ capColor: e.target.value })} className="h-9 w-full rounded bg-transparent" />
              </div>
            </div>
          </div>

          <div className={card}>
            <h4 className="mb-2 text-sm font-bold text-white">Audio</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <span className={label}>Voiceover language</span>
                <select className={input} value={p.voiceLang} onChange={(e) => patch({ voiceLang: e.target.value })}>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="hi-IN">Hindi (best for Urdu)</option>
                </select>
                <button className={`${btnGhost} mt-2`} disabled={!!busy} onClick={makeAllVoices}>
                  <Spin on={busy === 'voices'}>
                    <Volume2 className="h-4 w-4" />
                  </Spin>
                  Generate all voiceovers {busy === 'voices' ? `${Math.round(progress)}%` : ''}
                </button>
              </div>
              <div>
                <span className={label}>Background music</span>
                <label className={`${btnGhost} cursor-pointer`}>
                  <Upload className="h-4 w-4" /> {p.music ? p.music.name.slice(0, 24) : 'Upload audio'}
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) patch({ music: { name: f.name, blob: f } });
                      e.target.value = '';
                    }}
                  />
                </label>
                {p.music && (
                  <button className={`${btnGhost} ml-2`} onClick={() => patch({ music: undefined })}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div>
                <span className={label}>Voice volume {Math.round(p.edit.voiceVol * 100)}%</span>
                <input type="range" min={0} max={1.5} step={0.05} value={p.edit.voiceVol} onChange={(e) => patchEdit({ voiceVol: Number(e.target.value) })} className="w-full" />
              </div>
              <div>
                <span className={label}>Music volume {Math.round(p.edit.musicVol * 100)}%</span>
                <input type="range" min={0} max={1} step={0.05} value={p.edit.musicVol} onChange={(e) => patchEdit({ musicVol: Number(e.target.value) })} className="w-full" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">Lip-sync is not generated here: voices are timed to each scene. For true lip-synced characters, use the copied scene prompt in a tool such as Veo or Kling.</p>
          </div>

          <div className={card}>
            <h4 className="mb-2 text-sm font-bold text-white">Logo / watermark (optional)</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <label className={`${btnGhost} cursor-pointer`}>
                  <Upload className="h-4 w-4" /> {p.logo ? 'Replace' : 'Upload logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) patch({ logo: await fileToDataUrl(f) });
                      e.target.value = '';
                    }}
                  />
                </label>
                {p.logo && (
                  <button className={`${btnGhost} ml-2`} onClick={() => patch({ logo: undefined })}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div>
                <span className={label}>Corner</span>
                <select className={input} value={p.edit.logoPos} onChange={(e) => patchEdit({ logoPos: e.target.value as Corner })}>
                  <option value="tl">Top left</option>
                  <option value="tr">Top right</option>
                  <option value="bl">Bottom left</option>
                  <option value="br">Bottom right</option>
                </select>
              </div>
              <div>
                <span className={label}>Size {p.edit.logoSize}%</span>
                <input type="range" min={5} max={40} value={p.edit.logoSize} onChange={(e) => patchEdit({ logoSize: Number(e.target.value) })} className="w-full" />
              </div>
              <div>
                <span className={label}>Opacity {Math.round(p.edit.logoOpacity * 100)}%</span>
                <input type="range" min={0.1} max={1} step={0.05} value={p.edit.logoOpacity} onChange={(e) => patchEdit({ logoOpacity: Number(e.target.value) })} className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* timeline */}
      <div className={card}>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white">Timeline</h4>
          <label className={`${btnGhost} cursor-pointer !py-1 text-xs`}>
            <Plus className="h-3.5 w-3.5" /> Add my images
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImagesAsScenes(e.target.files); e.target.value = ''; }} />
          </label>
        </div>
        {!p.scenes.length && <p className="text-sm text-slate-400">No scenes yet. Add your own images here, or create a video in the AI Video Studio tab.</p>}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {p.scenes.map((s, i) => {
            let start = 0;
            for (let k = 0; k < i; k++) start += p.scenes[k].duration;
            const active = time >= start && time < start + s.duration;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id);
                  seek(start);
                }}
                style={{ width: Math.max(64, s.duration * 24) }}
                className={`relative h-16 shrink-0 overflow-hidden rounded-lg border text-left ${
                  selected?.id === s.id ? 'border-indigo-400' : active ? 'border-emerald-500' : 'border-slate-700'
                }`}
              >
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                )}
                <span className="relative z-10 m-1 inline-block rounded bg-black/60 px-1 text-[10px] font-bold text-white">
                  {i + 1} · {s.duration}s {s.voice ? '🔊' : ''}
                </span>
              </button>
            );
          })}
        </div>
        {selected && (
          <div className="mt-3 grid gap-3 border-t border-slate-700/60 pt-3 md:grid-cols-2">
            <div className="space-y-2">
              <span className={label}>Scene {p.scenes.indexOf(selected) + 1}: subtitle text</span>
              <input className={input} value={selected.caption} onChange={(e) => patchScene(selected.id, { caption: e.target.value })} />
              <span className={label}>Trim / length: {selected.duration}s</span>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={selected.duration}
                onChange={(e) => patchScene(selected.id, { duration: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <span className={label}>Narration</span>
              <input className={input} value={selected.narration} onChange={(e) => patchScene(selected.id, { narration: e.target.value })} />
              <div className="flex flex-wrap gap-2">
                <button className={btnGhost} disabled={!!busy} onClick={() => makeVoice(selected.id)}>
                  <Spin on={busy === `voice:${selected.id}`}>
                    <Volume2 className="h-4 w-4" />
                  </Spin>
                  {selected.voice ? 'Redo voice' : 'Generate voice'}
                </button>
                <label className={`${btnGhost} cursor-pointer`}>
                  <Upload className="h-4 w-4" /> My voice
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadVoice(selected.id, f);
                      e.target.value = '';
                    }}
                  />
                </label>
                {selected.voice && (
                  <button className={btnGhost} onClick={() => patchScene(selected.id, { voice: undefined })}>
                    Remove voice
                  </button>
                )}
                <button className={btnGhost} onClick={() => moveScene(selected.id, -1)}>
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button className={btnGhost} onClick={() => moveScene(selected.id, 1)}>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className={`${btnGhost} text-red-400`} onClick={() => removeScene(selected.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button className={btnGhost} onClick={() => patch({ step: 2 })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className={btnPrimary} onClick={() => patch({ step: 4 })}>
          Next: Thumbnail & SEO <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const seoNow = p.seo?.[seoTab];
  const setSeo = (x: Partial<Seo[Platform]>) =>
    setP((o) => (o.seo ? { ...o, seo: { ...o.seo, [seoTab]: { ...o.seo[seoTab], ...x } } } : o));
  const platformMeta = PLATFORMS.find((x) => x.id === seoTab)!;

  const step5 = (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h3 className="mb-3 text-base font-bold text-white">Thumbnail</h3>
          <div className="mb-3 flex justify-center rounded-xl bg-black p-2">
            <canvas ref={thumbRef} className="max-h-[360px] w-auto max-w-full rounded-lg" />
          </div>
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
            <div>
              <span className={label}>Text position</span>
              <select className={input} value={p.thumb.position} onChange={(e) => patchThumb({ position: e.target.value as Thumb['position'] })}>
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
            <div>
              <span className={label}>Background from scene</span>
              <select
                className={input}
                value=""
                onChange={(e) => {
                  const sc = p.scenes.find((s) => s.id === e.target.value);
                  if (sc?.image) patchThumb({ bg: sc.image });
                }}
              >
                <option value="">Choose…</option>
                {p.scenes.map((s, i) => (
                  <option key={s.id} value={s.id} disabled={!s.image}>
                    Scene {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={btnPrimary} disabled={!!busy} onClick={generateThumbBg}>
              <Spin on={busy === 'thumb'}>
                <Sparkles className="h-4 w-4" />
              </Spin>
              AI thumbnail background
            </button>
            <label className={`${btnGhost} cursor-pointer`}>
              <Upload className="h-4 w-4" /> Upload
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
            <button className={btnGhost} onClick={downloadThumb}>
              <Download className="h-4 w-4" /> PNG
            </button>
          </div>
        </div>

        <div className={card}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Title, description & hashtags</h3>
            <button className={btnGhost} disabled={!!busy} onClick={generateSeo}>
              <Spin on={busy === 'seo'}>
                <RefreshCw className="h-4 w-4" />
              </Spin>
              Regenerate
            </button>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PLATFORMS.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setSeoTab(pl.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  seoTab === pl.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {pl.label}
              </button>
            ))}
          </div>
          {busy === 'seo' && !seoNow ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Writing SEO for all 4 platforms…
            </div>
          ) : seoNow ? (
            <div className="space-y-3">
              <div>
                <span className={label}>
                  Title ({seoNow.title.length}/{platformMeta.titleMax})
                </span>
                <input className={input} value={seoNow.title} onChange={(e) => setSeo({ title: e.target.value })} />
              </div>
              <div>
                <span className={label}>Description / caption</span>
                <textarea className={`${input} min-h-[140px]`} value={seoNow.description} onChange={(e) => setSeo({ description: e.target.value })} />
              </div>
              <div>
                <span className={label}>Hashtags</span>
                <input className={input} value={seoNow.hashtags} onChange={(e) => setSeo({ hashtags: e.target.value })} />
              </div>
            </div>
          ) : (
            <button className={btnPrimary} onClick={generateSeo}>
              <Sparkles className="h-4 w-4" /> Generate SEO
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <button className={btnGhost} onClick={() => patch({ step: 3 })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className={btnPrimary} onClick={() => patch({ step: 5 })}>
          Next: Export <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const step6 = (
    <div className="space-y-4">
      <div className={card}>
        <h3 className="text-base font-bold text-white">1. Render your video</h3>
        <p className="mt-1 text-sm text-slate-400">
          The video is rendered in your browser in real time ({total.toFixed(0)}s). Keep this browser window open (you can switch tabs, but do not close or minimize it) until it finishes.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {busy === 'export' ? (
            <>
              <div className="h-2 w-64 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm text-slate-300">{Math.round(progress)}%</span>
              <button className={btnGhost} onClick={() => (cancelRef.current.cancelled = true)}>
                Cancel
              </button>
            </>
          ) : (
            <button className={btnPrimary} onClick={() => runExport()}>
              <Play className="h-4 w-4" /> {exported ? 'Render again' : 'Render video'}
            </button>
          )}
        </div>
        {exported && (
          <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
            <video src={exported.url} controls className="max-h-[360px] w-full rounded-xl bg-black" />
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                Ready: {exported.ext.toUpperCase()} · {(exported.size / 1048576).toFixed(1)} MB
              </p>
              <div className="flex flex-wrap gap-2">
                <a href={exported.url} download={`${(p.title || 'video').replace(/[^\w]+/g, '-').slice(0, 50)}.${exported.ext}`} className={btnPrimary}>
                  <Download className="h-4 w-4" /> Download video
                </a>
                <button className={btnGhost} onClick={() => patch({ step: 4 })}>
                  <ImageIcon className="h-4 w-4" /> Get thumbnail (step 5)
                </button>
              </div>
              {exported.ext === 'webm' && <p className="text-xs text-slate-500">This browser records WebM. YouTube and Facebook accept it; Instagram/TikTok may need MP4 (Chrome/Edge latest records MP4 directly).</p>}
            </div>
          </div>
        )}
      </div>

      <div className={card}>
        <h3 className="text-base font-bold text-white">2. Post to all platforms from here (Buffer)</h3>
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
              <button className={`${btnPrimary} !bg-emerald-600 hover:!bg-emerald-500`} disabled={!!busy || !exported} onClick={postEverywhere}>
                <Spin on={busy === 'post'}>
                  <Upload className="h-4 w-4" />
                </Spin>
                {busy === 'post' ? (progress > 0 ? `Uploading ${Math.round(progress)}%` : 'Posting…') : 'Upload video & post'}
              </button>
              {!exported && <span className="text-xs text-amber-400">Render the video first.</span>}
            </div>
          </div>
        )}
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

      <div className={card}>
        <h3 className="text-base font-bold text-white">3. Or post manually</h3>
        <p className="mt-1 text-sm text-slate-400">
          Copy each platform’s text, then open its upload page and add the downloaded video. Posting happens on the platform itself, so no
          passwords or tokens are stored here.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {PLATFORMS.map((pl) => {
            const s = p.seo?.[pl.id];
            return (
              <div key={pl.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{pl.label}</span>
                  <a href={pl.uploadUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:underline">
                    Open upload page <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {s ? (
                  <div className="flex flex-wrap gap-1.5">
                    <button className={`${btnGhost} !py-1 text-xs`} onClick={() => copy(s.title, 'Title')}>
                      <Copy className="h-3 w-3" /> Title
                    </button>
                    <button className={`${btnGhost} !py-1 text-xs`} onClick={() => copy(s.description, 'Description')}>
                      <Copy className="h-3 w-3" /> Description
                    </button>
                    <button className={`${btnGhost} !py-1 text-xs`} onClick={() => copy(s.hashtags, 'Hashtags')}>
                      <Copy className="h-3 w-3" /> Hashtags
                    </button>
                    <button className={`${btnPrimary} !py-1 text-xs`} onClick={() => copy(`${s.title}\n\n${s.description}\n\n${s.hashtags}`, 'Full post')}>
                      <Check className="h-3 w-3" /> Copy all
                    </button>
                  </div>
                ) : (
                  <button className={`${btnGhost} text-xs`} onClick={() => patch({ step: 4 })}>
                    Generate SEO in step 5
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between">
        <button className={btnGhost} onClick={() => patch({ step: 4 })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className={btnGhost} onClick={resetAll}>
          <RotateCcw className="h-4 w-4" /> New project
        </button>
      </div>
    </div>
  );

  const stepViews = [step1, step2, step3, step4, step5, step6];

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{mode === 'editor' ? 'Video Editor' : 'AI Video Studio'}</h2>
          <p className="text-sm text-slate-400">Prompt → characters → scenes → edit → thumbnail & SEO → export</p>
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
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${p.step === i ? 'bg-white/20' : 'bg-slate-700'}`}>
              {i + 1}
            </span>
            {name}
          </button>
        ))}
      </div>

      {stepViews[p.step]}

      {autoMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-sm font-semibold text-white">{autoMsg}</p>
            {progress > 0 && (
              <div className="mx-auto mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400">Automatic mode: you get the finished video at the end. You can edit anything afterwards.</p>
            <button
              className={`${btnGhost} mt-4`}
              onClick={() => {
                autoCancel.current = true;
                cancelRef.current.cancelled = true;
                setAutoMsg('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
