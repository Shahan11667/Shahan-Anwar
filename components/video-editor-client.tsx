'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload,
  Download,
  Loader2,
  Video,
  Scissors,
  Maximize2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  CheckCircle2,
  Info,
  Layers,
  Film,
  Zap,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import toast from 'react-hot-toast';

export default function VideoEditorClient() {
  const router = useRouter();

  // Settings State
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Local Video Upload State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trim Controls
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processAction, setProcessAction] = useState<'convert_9_16' | 'trim'>('convert_9_16');
  const [progress, setProgress] = useState<number>(0);

  // Single-Page AI Prompt Generator Controls (7 Scenes, 10 Parts, Bisma Engine)
  const [storyTopic, setStoryTopic] = useState<string>(
    'A cute little girl wearing lavender clothes sits on the university floor, looking shyly into the eyes of a little boy dressed in black...'
  );
  const [seriesMode, setSeriesMode] = useState<number>(1); // 1 = Single Episode, 5 = 5-Part, 10 = 10-Part
  const [sceneCount, setSceneCount] = useState<number>(7); // 5, 6, 7, 10 scenes
  const [visualStyle, setVisualStyle] = useState<string>('cinematic anime-style');
  const [dialogueLang, setDialogueLang] = useState<'roman_urdu' | 'english' | 'urdu'>('roman_urdu');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiScenes, setAiScenes] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activePartFilter, setActivePartFilter] = useState<number>(1);

  // Check Settings
  useEffect(() => {
    const checkSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.success) {
          setIsEnabled(data.data.videoEditorEnabled);
          if (!data.data.videoEditorEnabled) {
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSettings();
  }, [router]);

  // Initial Auto-Load of Baseline 7-Scene AI Prompts
  useEffect(() => {
    handleGenerateAiPrompts(
      'A cute little girl wearing lavender clothes sits on the university floor, looking shyly into the eyes of a little boy dressed in black...',
      1,
      7
    );
  }, []);

  // Handle Video Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        toast.error('Kripya video file select karein (MP4, MOV, WEBM)');
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setProcessedUrl(null);
      toast.success(`Video load ho gaya: ${file.name}`);
    }
  };

  // Convert to 9:16
  const handleConvertTo916 = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessAction('convert_9_16');
    setProgress(15);

    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 90));
      }, 1500);

      const formData = new FormData();
      formData.append('file', videoFile);

      const res = await fetch('/api/convert-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      if (!res.ok) throw new Error('Conversion failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProgress(100);
      toast.success('Video 9:16 Shorts/Reels me convert ho gaya!');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trim Video
  const handleTrimVideo = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessAction('trim');
    setProgress(20);

    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 20, 90));
      }, 1500);

      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('startTime', startTime.toString());
      formData.append('endTime', endTime.toString());

      const res = await fetch('/api/video/trim', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      if (!res.ok) throw new Error('Trim failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProgress(100);
      toast.success(`Video trim ho gaya (${(endTime - startTime).toFixed(1)}s)!`);
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate 7-Scene / 10-Part AI Video Prompts
  const handleGenerateAiPrompts = async (customTopic?: string, parts?: number, count?: number) => {
    setIsGeneratingAi(true);
    const pParts = parts !== undefined ? parts : seriesMode;
    const pCount = count !== undefined ? count : sceneCount;
    const pTopic = customTopic !== undefined ? customTopic : storyTopic;

    try {
      const res = await fetch('/api/admin/automation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_script',
          niche: 'romantic_anime',
          customPrompt: pTopic,
          seriesParts: pParts,
          sceneCount: pCount,
          visualStyle,
          language: dialogueLang,
          targetFormat: 'shorts_9_16'
        })
      });

      const data = await res.json();
      if (data.success && data.data && data.data.scenes) {
        setAiScenes(data.data.scenes);
        setActivePartFilter(1);
        toast.success(`Generated ${data.data.scenes.length} Scenes with 10s AI Video Prompts!`);
      }
    } catch (e: any) {
      toast.error('Prompt generation error: ' + e.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isEnabled) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-pink-500 selection:text-white">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* HERO TITLE & EXPLANATION BANNER (Har Cheez Ka Simple Impact)             */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-pink-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>All-In-One Simple Studio (No Confusing Tabs)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              AI Video Creator &amp; Simple Video Editor
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ye page <strong className="text-pink-400">aik hi screen</strong> par do ahem kaam karta hai:
              <br />
              <strong>1. AI Video Engine:</strong> Kahani ko <strong>7 Scenes ya 10 Parts</strong> me baant kar Kling AI / Runway ke 10s prompts banata hai.
              <br />
              <strong>2. Simple Video Editor:</strong> Apni video upload kar ke foran <strong>9:16 Shorts</strong> me convert ya <strong>Trim / Cut</strong> karein.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: AI VIDEO PROMPTS GENERATOR (7 SCENES / 10 PARTS)               */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🌸 Step 1: AI Video Story Prompts (10 Seconds Engine)</span>
                <Badge className="bg-pink-600 text-white font-mono text-[10px]">KLING &amp; RUNWAY</Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kahin bhi tabs me jane ki zaroorat nahi. Yahan se <strong>7 Scenes</strong> ya <strong>10 Parts</strong> select karein aur aik click par copy karein.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const fullBundle = aiScenes.map(s => `[Scene ${s.sceneNumber} - ${s.durationSeconds}s]\n${s.aiVideoPrompt || s.visualPrompt}`).join('\n\n---\n\n');
                  navigator.clipboard.writeText(fullBundle);
                  toast.success(`Copied all ${aiScenes.length} AI Prompts to clipboard!`);
                }}
                className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All {aiScenes.length} Prompts</span>
              </button>
            </div>
          </div>

          {/* Generator Controls Grid with Helpful Tooltips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            {/* Control 1: Story Series Arc */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Story Structure</span>
                <span className="text-[10px] text-pink-400 font-mono">Kitne Parts?</span>
              </label>
              <select
                value={seriesMode}
                onChange={e => {
                  const p = parseInt(e.target.value);
                  setSeriesMode(p);
                  handleGenerateAiPrompts(storyTopic, p, p > 1 ? p * 5 : sceneCount);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-pink-300 font-bold focus:border-pink-500 focus:outline-none"
              >
                <option value={1}>🎬 Single Video (Specific Scenes)</option>
                <option value={5}>💖 5-Part Story Series (25 Scenes - Bisma)</option>
                <option value={10}>🔥 10-Part Epic Series (50 Scenes 🌟)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                👉 <strong>Asar:</strong> 1 Part = Aik video. 5 ya 10 Parts = Mukammal episodic series YouTube Shorts aur TikTok ke liye.
              </p>
            </div>

            {/* Control 2: Scene Count (e.g. 7 Scenes) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Number of Scenes / Prompts</span>
                <span className="text-[10px] text-cyan-400 font-mono">7 Scene / Prompt</span>
              </label>
              <select
                value={seriesMode > 1 ? seriesMode * 5 : sceneCount}
                disabled={seriesMode > 1}
                onChange={e => {
                  const c = parseInt(e.target.value);
                  setSceneCount(c);
                  handleGenerateAiPrompts(storyTopic, 1, c);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none disabled:opacity-70"
              >
                {seriesMode > 1 ? (
                  <option value={seriesMode * 5}>{seriesMode * 5} Scenes ({seriesMode} Parts x 5)</option>
                ) : (
                  <>
                    <option value={5}>5 Scenes (5 Prompts)</option>
                    <option value={6}>6 Scenes (6 Prompts)</option>
                    <option value={7}>7 Scenes (7 Prompts 🌟 Recommended)</option>
                    <option value={8}>8 Scenes (8 Prompts)</option>
                    <option value={10}>10 Scenes (10 Prompts)</option>
                  </>
                )}
              </select>
              <p className="text-[11px] text-slate-400">
                👉 <strong>Asar:</strong> Jitne scenes utne 10-second clips Kling AI me generate karne honge.
              </p>
            </div>

            {/* Control 3: Visual Art Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Visual Style</span>
                <span className="text-[10px] text-amber-400 font-mono">Look &amp; Feel</span>
              </label>
              <select
                value={visualStyle}
                onChange={e => {
                  setVisualStyle(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value="cinematic anime-style">🌸 Cinematic Anime (Bisma Style ❤️)</option>
                <option value="photorealistic 8k">📸 Photorealistic 8K Cinema</option>
                <option value="korean drama cinematic">🎎 Korean Drama Romance</option>
                <option value="3d pixar disney style">✨ 3D Pixar Animation</option>
              </select>
              <p className="text-[11px] text-slate-400">
                👉 <strong>Asar:</strong> Kling AI video ko anime banaye ga ya real insano jaisi 8K look dega.
              </p>
            </div>

            {/* Control 4: Dialogue Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Lip-Sync Dialogue</span>
                <span className="text-[10px] text-emerald-400 font-mono">Zabaan</span>
              </label>
              <select
                value={dialogueLang}
                onChange={e => setDialogueLang(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:border-emerald-500 focus:outline-none"
              >
                <option value="roman_urdu">🇵🇰 Roman Urdu ("Kya tum bhool jaoge?")</option>
                <option value="english">🌐 English Dialogues</option>
                <option value="urdu">🇵🇰 Urdu Script (اردو)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                👉 <strong>Asar:</strong> AI Characters video ke andar Roman Urdu me bolenge with lip-sync.
              </p>
            </div>
          </div>

          {/* Story Prompt Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Story Premise / Reference Description (Apni Kahani Likhein)</span>
              <span className="text-[11px] text-slate-500">Bisma Dengue reference default loaded</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={storyTopic}
                onChange={e => setStoryTopic(e.target.value)}
                placeholder="Story likhein (e.g. A girl in lavender clothes on university floor talking to a boy in black...)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
              <button
                onClick={() => handleGenerateAiPrompts()}
                disabled={isGeneratingAi}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Prompts</span>
              </button>
            </div>
          </div>

          {/* Parts Filter Pills (If 5 or 10 Parts Active) */}
          {seriesMode > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3">
              <span className="text-xs font-bold text-pink-400 shrink-0">View Episode:</span>
              {Array.from({ length: seriesMode }, (_, i) => i + 1).map(pNum => (
                <button
                  key={pNum}
                  onClick={() => setActivePartFilter(pNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePartFilter === pNum
                      ? 'bg-pink-600 text-white shadow'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Part {pNum}
                </button>
              ))}
            </div>
          )}

          {/* Generated Scenes & 10s Prompts Display */}
          <div className="space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Generated Prompts ({aiScenes.length} Total Scenes Ready for Kling AI / Runway Gen-3)
            </span>

            <div className="grid grid-cols-1 gap-3.5">
              {aiScenes
                .filter(sc => seriesMode <= 1 || (sc.partNumber || 1) === activePartFilter)
                .map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono text-xs font-bold">
                          Scene #{sc.sceneNumber}
                        </span>
                        {sc.partNumber && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                            Part {sc.partNumber}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          Duration: 10s
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-amber-300 font-mono font-bold">
                          Hormozi Hook: {sc.onScreenCaption}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const pText = sc.aiVideoPrompt || sc.visualPrompt;
                            navigator.clipboard.writeText(pText);
                            setCopiedIndex(sc.sceneNumber);
                            setTimeout(() => setCopiedIndex(null), 2000);
                            toast.success(`Copied Scene #${sc.sceneNumber} 10s Prompt!`);
                          }}
                          className="px-3 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          {copiedIndex === sc.sceneNumber ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy 10s Prompt</span>
                            </>
                          )}
                        </button>

                        <a
                          href="https://klingai.com"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium"
                        >
                          Kling AI ↗
                        </a>
                      </div>
                    </div>

                    {/* Full 10s AI Video Prompt Box */}
                    <div className="relative">
                      <textarea
                        rows={5}
                        readOnly
                        value={sc.aiVideoPrompt || sc.visualPrompt}
                        className="w-full bg-black/60 border border-slate-800 rounded-xl p-3 text-pink-100 font-mono text-xs leading-relaxed focus:outline-none selection:bg-pink-600"
                      />
                    </div>

                    {/* Dialogue Chips Preview */}
                    {sc.dialogues && sc.dialogues.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {sc.dialogues.map((dlg: any, dIdx: number) => (
                          <div
                            key={dIdx}
                            className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                          >
                            <span className="font-bold text-pink-400">{dlg.emoji || '💬'} {dlg.speaker || dlg.character}:</span>
                            <span className="text-white italic">"{dlg.dialogue || dlg.text}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: SIMPLE LOCAL VIDEO EDITOR (UPLOAD, 9:16 CONVERT & TRIM)       */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>✂️ Step 2: Simple Local Video Editor (Convert 9:16 &amp; Trim)</span>
              <Badge className="bg-cyan-600 text-white font-mono text-[10px]">FAST &amp; LOCAL</Badge>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Kisi tab me switch kiye baghair apni video yahan drag karein, <strong>9:16 Shorts me convert</strong> karein ya <strong>Cut / Trim</strong> karein.
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!videoUrl ? (
            /* Upload Drop Area */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-pink-500/70 rounded-2xl p-10 text-center cursor-pointer transition-colors bg-slate-950/60"
            >
              <Upload className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <p className="text-sm font-bold text-slate-200">
                Click here to upload your video (MP4, MOV, WEBM)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Kling AI ya local camera se download ki hui video yahan drop karein (Max 500MB)
              </p>
            </div>
          ) : (
            /* Video Loaded: Controls & Preview */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Video Player */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Source Video Player</span>
                  <div className="bg-black rounded-2xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center relative">
                    <video
                      ref={(ref) => {
                        videoRef.current = ref;
                        if (ref) {
                          ref.onloadedmetadata = () => {
                            setVideoDuration(ref.duration);
                            setEndTime(Math.min(15, ref.duration));
                          };
                          ref.ontimeupdate = () => setCurrentTime(ref.currentTime);
                        }
                      }}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      playsInline
                    />
                  </div>

                  {/* Transport Bar */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) videoRef.current.pause();
                            else videoRef.current.play();
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            setCurrentTime(0);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                        title="Restart"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted;
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="font-mono text-slate-300 text-xs">
                      {currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
                    </div>

                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoUrl(null);
                        setProcessedUrl(null);
                      }}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Change Video
                    </button>
                  </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="space-y-4">
                  {/* Action 1: 9:16 Converter */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Maximize2 className="w-4 h-4 text-cyan-400" />
                        <span>Action A: Convert to 9:16 Shorts / Reels</span>
                      </span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                        VERTICAL CROP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Landscape video ko vertical format (720x1280) me auto-crop karega bina quality kharab kiye.
                    </p>
                    <button
                      onClick={handleConvertTo916}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition shadow"
                    >
                      {isProcessing && processAction === 'convert_9_16' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Converting to 9:16 ({progress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4" />
                          <span>Convert Video to 9:16 Format</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action 2: Trimmer Slider */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Scissors className="w-4 h-4 text-amber-400" />
                        <span>Action B: Trim / Cut Clip</span>
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        {(endTime - startTime).toFixed(1)}s Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Start Time: {startTime.toFixed(1)}s</label>
                        <input
                          type="range"
                          min="0"
                          max={videoDuration}
                          step="0.1"
                          value={startTime}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setStartTime(val);
                            if (videoRef.current) videoRef.current.currentTime = val;
                          }}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">End Time: {endTime.toFixed(1)}s</label>
                        <input
                          type="range"
                          min={startTime}
                          max={videoDuration}
                          step="0.1"
                          value={endTime}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setEndTime(val);
                            if (videoRef.current) videoRef.current.currentTime = val;
                          }}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleTrimVideo}
                      disabled={isProcessing || endTime <= startTime}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition shadow"
                    >
                      {isProcessing && processAction === 'trim' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Trimming Clip ({progress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Scissors className="w-4 h-4" />
                          <span>Trim Video ({(endTime - startTime).toFixed(1)}s)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Converted / Trimmed Output Download Card */}
              {processedUrl && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-300">Video Process Ho Gaya!</p>
                      <p className="text-[11px] text-slate-400">Aapka clip taiyar hai, neeche button se download karein.</p>
                    </div>
                  </div>

                  <a
                    href={processedUrl}
                    download="edited-video.mp4"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Edited Video</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
