'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Share2, 
  Layers, 
  Volume2, 
  VolumeX, 
  Film, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send, 
  Copy, 
  Sliders, 
  Zap, 
  Settings2, 
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Key,
  Flame,
  Radio,
  Shuffle,
  TrendingUp,
  Bookmark,
  Hash,
  Tv
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import PuterAuthBadge from '@/components/puter-auth-badge';
import { puterChat, puterChatWithDetails, isPuterSignedIn, POPULAR_PUTER_MODELS } from '@/lib/puter';

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface SceneItem {
  sceneNumber: number;
  durationSeconds: number;
  visualPrompt: string;
  voiceoverText: string;
  onScreenCaption: string;
  soundEffect: string;
  brollKeyword: string;
}

interface ContentPlanItem {
  id: string;
  title: string;
  niche: string;
  format: '9:16 Shorts' | '16:9 Video';
  scheduledTime: string;
  status: 'published' | 'ready' | 'pending';
}

export interface ChannelProfile {
  id: string;
  name: string;
  handle: string;
  niche: string;
  tone: string;
  avatarIcon: string;
  badge: string;
  color: string;
  description: string;
}

export interface SelfGeneratedTopic {
  id: string;
  title: string;
  hook: string;
  niche: string;
  badge: string;
  viralScore: number;
}

// Channels for Dynamic Self-Generation (Beshaan Flagship First)
export const CHANNEL_PROFILES: ChannelProfile[] = [
  {
    id: 'beshaan',
    name: 'Beshaan',
    handle: '@BeshaanVibe',
    niche: 'beshaan_trio',
    tone: 'Energetic Trio Banter, Trendy Fashion Styling & Gaming Hype',
    avatarIcon: '🎀🎮',
    badge: 'FASHION • LIFESTYLE • GAMING',
    color: 'from-pink-500 via-rose-500 to-indigo-600',
    description: 'Three Creators | Three Personalities | One Amazing Journey! Two girls & one boy blending fashion, lifestyle vibes, and gaming entertainment.'
  },
  {
    id: 'ai_tech',
    name: 'Tech Matrix AI',
    handle: '@TechMatrixAI',
    niche: 'ai_tech',
    tone: 'High-Velocity & Technical Insights',
    avatarIcon: '🤖',
    badge: 'AI & CODING',
    color: 'from-blue-600 to-cyan-500',
    description: 'Autonomous agents, local LLMs, and high-velocity developer tools.'
  },
  {
    id: 'wealth_business',
    name: 'Cash Flow Solopreneur',
    handle: '@CashFlowDev',
    niche: 'wealth_business',
    tone: 'Alex Hormozi Viral & Bold Numbers',
    avatarIcon: '💰',
    badge: 'MICRO-SAAS & WEALTH',
    color: 'from-emerald-600 to-teal-500',
    description: 'Zero-employee micro-SaaS, digital cashflow, and high-margin assets.'
  },
  {
    id: 'dark_psychology',
    name: 'Mindset Alpha Dynamics',
    handle: '@MindsetAlpha',
    niche: 'dark_psychology',
    tone: 'Intense, Mysterious & Authoritative',
    avatarIcon: '🧠',
    badge: 'DARK PSYCHOLOGY',
    color: 'from-purple-600 to-indigo-600',
    description: 'Body language cues, conversational influence, and human psychology.'
  },
  {
    id: 'stoicism_mindset',
    name: 'The Daily Stoic Edge',
    handle: '@StoicFocus',
    niche: 'stoicism_mindset',
    tone: 'Deep, Calm & High-Discipline',
    avatarIcon: '⚡',
    badge: 'STOIC MINDSET',
    color: 'from-amber-600 to-orange-500',
    description: 'Marcus Aurelius principles, dopamine resets, and laser productivity.'
  },
  {
    id: 'science_space',
    name: 'Cosmic Horizons',
    handle: '@DeepUniverse',
    niche: 'science_space',
    tone: 'Mind-Blowing Curiosity & 8K Visuals',
    avatarIcon: '🌌',
    badge: 'COSMOS & SCIENCE',
    color: 'from-indigo-600 to-blue-500',
    description: 'Black holes, astrophysics discoveries, and quantum mysteries.'
  },
  {
    id: 'mystery_facts',
    name: 'Untold Vault',
    handle: '@UntoldVault',
    niche: 'mystery_facts',
    tone: 'Narrative Storytelling & Retention Hooks',
    avatarIcon: '🎙️',
    badge: 'MYSTERIES & FACTS',
    color: 'from-rose-600 to-pink-500',
    description: 'Unexplained events, billion-dollar blunders, and hidden history.'
  }
];

export default function YoutubeAutomationView() {
  const [activeTab, setActiveTab] = useState<'topics' | 'flow' | 'player' | 'planner' | 'publisher' | 'settings'>('topics');

  // Channel Profile State (Defaults to Beshaan)
  const [activeChannelId, setActiveChannelId] = useState<string>('beshaan');
  const [channelName, setChannelName] = useState<string>('Beshaan');
  const [channelTone, setChannelTone] = useState<string>('Energetic Trio Banter, Trendy Fashion Styling & Gaming Hype');
  const [isEditingChannel, setIsEditingChannel] = useState<boolean>(false);

  // Self-Generated Topics State
  const [selfGeneratedTopics, setSelfGeneratedTopics] = useState<SelfGeneratedTopic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(false);

  // Video Generation Controls
  const [selectedNiche, setSelectedNiche] = useState<string>('beshaan_trio');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<'shorts_9_16' | 'video_16_9'>('shorts_9_16');
  const [targetDuration, setTargetDuration] = useState<number>(35);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [usePuterAi, setUsePuterAi] = useState<boolean>(true);
  const [selectedPuterModel, setSelectedPuterModel] = useState<string>('openai/gpt-4o');

  // Video Content State
  const [titleOptions, setTitleOptions] = useState<string[]>([
    'How 1% Developers Build 10x Faster with AI in 2026 🤯',
    'The AI Coding Secret Nobody Is Telling You (Must Watch)',
    'Stop Coding Like It\'s 2020: Autonomous Agents Are Here'
  ]);
  const [selectedTitle, setSelectedTitle] = useState<string>('How 1% Developers Build 10x Faster with AI in 2026 🤯');
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [description, setDescription] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [thumbnailHeadline, setThumbnailHeadline] = useState<string>('DON\'T CODE ALONE');
  const [thumbnailBadge, setThumbnailBadge] = useState<string>('10X AI VELOCITY');

  // Script & Voiceover Language Selection (Roman Urdu Default for Pakistani Creators)
  const [scriptLanguage, setScriptLanguage] = useState<'roman_urdu' | 'english' | 'urdu'>('roman_urdu');

  // Video Player / Canvas Simulation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Content Plan State
  const [contentPlan, setContentPlan] = useState<ContentPlanItem[]>([]);

  // Publisher State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube', 'instagram', 'tiktok']);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedStatus, setPublishedStatus] = useState<any>(null);

  // Total Duration
  const totalDuration = scenes.length > 0 ? scenes.reduce((acc, s) => acc + s.durationSeconds, 0) : 35;

  // Active Channel Profile
  const activeProfile = CHANNEL_PROFILES.find(p => p.id === activeChannelId) || CHANNEL_PROFILES[0];

  // Self-Generate Fresh Topics for the Active Channel
  const fetchChannelTopics = useCallback(async (nicheToFetch?: string) => {
    setIsLoadingTopics(true);
    const targetNiche = nicheToFetch || selectedNiche;

    // Check if Puter AI is active and signed in
    if (usePuterAi) {
      try {
        const signed = await isPuterSignedIn();
        if (signed) {
          const langPrompt = scriptLanguage === 'roman_urdu'
            ? 'LANGUAGE REQUIREMENT: Generate all topic titles and hooks in conversational ROMAN URDU (Urdu written in Latin/English alphabets, popular with Pakistani vloggers and YouTube creators, e.g. "Ek Outfit Ko 3 Alag Tareeqon Se Style Kiya", "Larke Ne Hamara Makeup Kiya", etc.).'
            : scriptLanguage === 'urdu'
            ? 'LANGUAGE REQUIREMENT: Generate all topic titles and hooks in authentic Urdu script (اردو).'
            : 'LANGUAGE: English.';

          const systemPrompt = `You are an elite viral YouTube Shorts & Reels strategist.
${langPrompt}
Return ONLY valid JSON array with 8 unique objects (no markdown, no backticks, no code fence):
[
  {
    "id": "puter_1",
    "title": "High CTR Click-Worthy Title",
    "hook": "Intense first 3-second hook",
    "badge": "VIRAL HOOK",
    "viralScore": 96
  }
]`;
          const prompt = `Channel Name: "${channelName}"
Niche: "${targetNiche}"
Tone: "${channelTone}"
Language: ${scriptLanguage}
Generate 8 completely unique, viral video ideas.`;

          const result = await puterChatWithDetails(prompt, { 
            model: selectedPuterModel, 
            systemPrompt,
            autoFallback: true,
            onModelFallback: (fromM, toM) => {
              toast(`Model ${fromM.split('/')[1] || fromM} busy. Auto-cascading to ${toM.split('/')[1] || toM}...`, { icon: '🔄' });
            }
          });
          const raw = result.text;
          const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted = parsed.map((item: any, idx: number) => ({
              id: item.id || `puter_${Date.now()}_${idx}`,
              title: item.title,
              hook: item.hook,
              badge: item.badge || 'PUTER AI',
              niche: targetNiche,
              viralScore: item.viralScore || (90 + (idx % 9))
            }));
            setSelfGeneratedTopics(formatted);
            const modelUsedName = result.modelUsed.split('/')[1] || result.modelUsed;
            toast.success(`Generated 8 fresh topics via Puter (${modelUsedName})!`, { icon: '✨' });
            setIsLoadingTopics(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn('Puter topic generation fallback to server API:', err.message);
      }
    }

    try {
      const res = await fetch('/api/admin/automation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_topics',
          niche: targetNiche,
          channelName,
          channelTone,
          language: scriptLanguage,
          count: 8,
          apiKey: apiKey || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.topics) {
        setSelfGeneratedTopics(data.topics);
        toast.success(`Generated ${data.topics.length} fresh video topics for ${channelName}!`, { icon: '✨' });
      }
    } catch (e: any) {
      toast.error('Failed to generate topics: ' + e.message);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [selectedNiche, channelName, channelTone, apiKey, usePuterAi, selectedPuterModel, scriptLanguage]);

  // Initial Load: Fetch Topics & Generate Baseline Video
  useEffect(() => {
    fetchChannelTopics('beshaan_trio');
    handleGenerateAutomation('We Styled 1 Outfit 3 Different Ways! (Two Girls vs One Boy Challenge)', 'beshaan_trio');
  }, []);

  // Handle Channel Selection
  const handleSelectChannel = (channel: ChannelProfile) => {
    setActiveChannelId(channel.id);
    setSelectedNiche(channel.niche);
    setChannelName(channel.name);
    setChannelTone(channel.tone);
    fetchChannelTopics(channel.niche);
  };

  // Run AI Video Generation for a specific topic or custom prompt
  const handleGenerateAutomation = async (overridePrompt?: string, overrideNiche?: string) => {
    setIsGenerating(true);
    const promptToUse = overridePrompt !== undefined ? overridePrompt : customPrompt;
    const nicheToUse = overrideNiche || selectedNiche;

    // Check if Puter AI is active and signed in
    if (usePuterAi) {
      try {
        const signed = await isPuterSignedIn();
        if (signed) {
          const langInstruction = scriptLanguage === 'roman_urdu'
            ? `CRITICAL LANGUAGE REQUIREMENT:
- Write ALL "voiceoverText" in high-energy, authentic, conversational ROMAN URDU (Urdu written in Latin/English alphabets, exactly how Pakistani YouTube creators and youth speak, e.g., "Arey yaar welcome back to Beshaan!", "Dekho bhai twist kya aya...", "Jaldi se comment me ja ke vote karo!").
- Write "onScreenCaption" in bold Roman Urdu or mixed Roman Urdu/English pop words (e.g., "ASLI TWIST DEKHO 😱", "WAIT FOR THE END 🔥", "YE KYA HO GAYA ⚡").
- Write "titleOptions" and "selectedTitle" in catchy Roman Urdu with emojis.
- Write "description" in Roman Urdu with relevant channel hashtags.
- Keep "visualPrompt" and "brollKeyword" in clear descriptive English for image/video generation.`
            : scriptLanguage === 'urdu'
            ? `CRITICAL LANGUAGE REQUIREMENT:
- Write ALL "voiceoverText", "onScreenCaption", "titleOptions", and "description" in authentic Urdu script (اردو).
- Keep "visualPrompt" and "brollKeyword" in clear descriptive English.`
            : `Write all voiceoverText and captions in high-retention English.`;

          const systemPrompt = `You are a world-class viral short-form video producer.
${langInstruction}
Return ONLY valid raw JSON with no markdown formatting and no code fences matching this schema:
{
  "titleOptions": ["title 1", "title 2", "title 3"],
  "selectedTitle": "best title",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 7,
      "visualPrompt": "cinematic 8k visual prompt for image diffusion",
      "voiceoverText": "spoken script narration for this scene",
      "onScreenCaption": "PUNCHY 3-5 WORD CAPTION ⚡",
      "soundEffect": "Whoosh & Sub Bass",
      "brollKeyword": "stock footage search keyword"
    }
  ],
  "description": "Full YouTube/Instagram description with takeaways and calls to action",
  "hashtags": ["#shorts", "#reels", "#viral"],
  "thumbnailConcept": {
    "mainHeadline": "MAIN HEADLINE",
    "badgeText": "CTR BADGE",
    "bgColor": "#f97316"
  }
}`;
          const prompt = `Topic: "${promptToUse}"
Channel Name: "${channelName}"
Niche: "${nicheToUse}"
Tone: "${channelTone}"
Language: ${scriptLanguage}
Format: ${targetFormat === 'shorts_9_16' ? 'Vertical 9:16 Shorts/Reels' : 'Horizontal 16:9'}
Duration: ${targetDuration} seconds.
Create exactly 5 intense, progressive narrative scenes with bold pop captions.`;

          const result = await puterChatWithDetails(prompt, { 
            model: selectedPuterModel, 
            systemPrompt,
            autoFallback: true,
            onModelFallback: (fromM, toM) => {
              toast(`AI Model ${fromM.split('/')[1] || fromM} busy. Auto-cascading to ${toM.split('/')[1] || toM}...`, { icon: '🔄' });
            }
          });
          const raw = result.text;
          const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
          const data = JSON.parse(clean);
          if (data && data.scenes && data.scenes.length > 0) {
            setTitleOptions(data.titleOptions || [promptToUse]);
            setSelectedTitle(data.selectedTitle || promptToUse);
            setScenes(data.scenes || []);
            setDescription(data.description || '');
            setHashtags(data.hashtags || []);
            if (data.thumbnailConcept) {
              setThumbnailHeadline(data.thumbnailConcept.mainHeadline || 'VIRAL SECRET');
              setThumbnailBadge(data.thumbnailConcept.badgeText || 'MUST WATCH');
            }
            setCurrentTime(0);
            setCurrentSceneIdx(0);
            confetti({ particleCount: 50, spread: 60 });
            const modelUsedName = result.modelUsed.split('/')[1] || result.modelUsed;
            const langLabel = scriptLanguage === 'roman_urdu' ? 'Roman Urdu' : scriptLanguage === 'urdu' ? 'Urdu' : 'English';
            toast.success(`Generated 5-scene ${langLabel} video script via Puter (${modelUsedName})!`, { icon: '🎬' });
            setActiveTab('flow');
            setIsGenerating(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn('Puter script generation fallback to server API:', err.message);
      }
    }

    try {
      const response = await fetch('/api/admin/automation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_script',
          niche: nicheToUse,
          customPrompt: promptToUse,
          channelName,
          channelTone,
          targetFormat,
          duration: targetDuration,
          language: scriptLanguage,
          apiKey: apiKey || undefined,
        })
      });

      const res = await response.json();
      if (res.success && res.data) {
        const data = res.data;
        setTitleOptions(data.titleOptions || []);
        setSelectedTitle(data.selectedTitle || promptToUse);
        setScenes(data.scenes || []);
        setDescription(data.description || '');
        setHashtags(data.hashtags || []);
        if (data.thumbnailConcept) {
          setThumbnailHeadline(data.thumbnailConcept.mainHeadline);
          setThumbnailBadge(data.thumbnailConcept.badgeText);
        }

        setCurrentTime(0);
        setCurrentSceneIdx(0);
        confetti({ particleCount: 50, spread: 60 });
        toast.success(`Generated 5-scene viral video script for "${data.selectedTitle}"!`, { icon: '🎬' });
        setActiveTab('flow');
      } else {
        toast.error(res.error || 'Failed to generate script');
      }
    } catch (e: any) {
      toast.error('Error generating automation: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Batch Add All Self-Generated Topics to Content Queue
  const handleBatchScheduleToQueue = () => {
    if (selfGeneratedTopics.length === 0) return;
    const now = new Date();
    const newItems: ContentPlanItem[] = selfGeneratedTopics.map((top, idx) => {
      const sched = new Date(now.getTime() + (idx + 1) * 24 * 60 * 60 * 1000);
      return {
        id: `plan_${Date.now()}_${idx}`,
        title: top.title,
        niche: activeProfile.name,
        format: '9:16 Shorts',
        scheduledTime: `${sched.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at 7:00 AM UTC`,
        status: idx === 0 ? 'ready' : 'pending'
      };
    });

    setContentPlan(prev => [...newItems, ...prev]);
    confetti({ particleCount: 60, spread: 70 });
    toast.success(`Scheduled ${newItems.length} self-generated topics to Content Plan!`, { icon: '📅' });
    setActiveTab('planner');
  };

  // Compute active scene from currentTime
  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      accumulated += scenes[i].durationSeconds;
      if (currentTime <= accumulated || i === scenes.length - 1) {
        setCurrentSceneIdx(i);
        break;
      }
    }
  }, [currentTime, scenes]);

  // Video Animation Loop for Canvas Simulation
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();
    const animate = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime(prev => {
        const nextTime = prev + deltaSec;
        if (nextTime >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return nextTime;
      });

      renderCanvasFrame();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, totalDuration, scenes, currentSceneIdx]);

  // Canvas Frame Renderer
  const renderCanvasFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas || scenes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const scene = scenes[currentSceneIdx] || scenes[0];

    // Background Gradient based on active channel
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (activeChannelId === 'beshaan') {
      grad.addColorStop(0, '#9d174d'); // vibrant rose pink (fashion)
      grad.addColorStop(0.5, '#581c87'); // deep purple (lifestyle)
      grad.addColorStop(1, '#1e1b4b'); // midnight indigo (gaming zone)
    } else if (activeChannelId === 'wealth_business') {
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#022c22');
      grad.addColorStop(1, '#0f172a');
    } else if (activeChannelId === 'dark_psychology') {
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#090d16');
    } else if (activeChannelId === 'stoicism_mindset') {
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.5, '#451a03');
      grad.addColorStop(1, '#090d16');
    } else {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Channel Brand Watermark Top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${activeProfile.avatarIcon} ${channelName}`, 24, 36);

    // Dynamic Ken Burns Zoom Card in Center
    ctx.save();
    ctx.translate(w / 2, h / 2 - 40);
    const scale = 1 + (currentTime % 6) * 0.02;
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-w * 0.4, -h * 0.22, w * 0.8, h * 0.44, 20);
    ctx.fill();
    ctx.stroke();

    // Scene Keyword Badge
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SCENE ${scene.sceneNumber}: ${scene.brollKeyword.toUpperCase()}`, 0, -h * 0.12);

    // Visual Prompt Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Inter, sans-serif';
    const words = scene.visualPrompt.split(' ');
    const line1 = words.slice(0, 6).join(' ');
    const line2 = words.slice(6, 12).join(' ');
    const line3 = words.slice(12).join(' ');
    ctx.fillText(line1, 0, -20);
    if (line2) ctx.fillText(line2, 0, 0);
    if (line3) ctx.fillText(line3, 0, 20);

    ctx.restore();

    // Bold Hormozi-Style Captions
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.roundRect(w * 0.08, h - 160, w * 0.84, 90, 16);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.font = '900 24px Inter, Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText(scene.onScreenCaption, w / 2, h - 118);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 13px Inter, sans-serif';
    const narrationPreview = scene.voiceoverText.length > 45 
      ? scene.voiceoverText.slice(0, 45) + '...' 
      : scene.voiceoverText;
    ctx.fillText(narrationPreview, w / 2, h - 88);
    ctx.restore();

    // Progress Bar
    const progressRatio = totalDuration > 0 ? currentTime / totalDuration : 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, h - 8, w, 8);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, h - 8, w * progressRatio, 8);
  };

  useEffect(() => {
    renderCanvasFrame();
  }, [currentSceneIdx, scenes]);

  // Voiceover Speech Synthesis with Roman Urdu & Desi Accent Engine
  const playSceneVoiceover = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();

    if (scriptLanguage === 'roman_urdu' || scriptLanguage === 'urdu') {
      // Look for Urdu, Hindi, or South Asian English voice engines for natural phonetics
      const desiVoice = voices.find(v => 
        v.lang.startsWith('ur') || 
        v.lang.startsWith('hi') || 
        v.lang.startsWith('pa') ||
        v.lang === 'en-IN' ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('urdu') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('pakistan')
      );
      if (desiVoice) {
        utterance.voice = desiVoice;
        toast.success(`Voiceover preview using ${desiVoice.name} (Desi / Roman Urdu)...`, { icon: '🎙️' });
      } else {
        const generalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David')));
        if (generalVoice) utterance.voice = generalVoice;
        toast.success('Playing Roman Urdu voiceover narration...', { icon: '🎙️' });
      }
    } else {
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David')));
      if (preferredVoice) utterance.voice = preferredVoice;
      toast.success('Playing voiceover narration preview...', { icon: '🎙️' });
    }

    window.speechSynthesis.speak(utterance);
  };

  // Multi-Platform Publisher
  const handlePublishAll = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/admin/automation/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          title: selectedTitle,
          description,
          hashtags,
          webhookUrl,
        })
      });

      const data = await response.json();
      if (data.success) {
        setPublishedStatus(data.publishedPlatforms);
        confetti({ particleCount: 70, spread: 80 });
        toast.success('Successfully packaged & dispatched to all platforms!');

        setContentPlan(prev => [
          {
            id: Date.now().toString(),
            title: selectedTitle,
            niche: activeProfile.name,
            format: targetFormat === 'shorts_9_16' ? '9:16 Shorts' : '16:9 Video',
            scheduledTime: 'Published Just Now',
            status: 'published'
          },
          ...prev
        ]);
      }
    } catch (e: any) {
      toast.error('Dispatch error: ' + e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Bot className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Autonomous YouTube & Instagram Reels Automation Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Autonomous Channel Content Studio</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold uppercase">
              SELF-GENERATING
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Autonomous curriculum and topic discovery across different channels. Self-generates viral concepts, scene-by-scene scripts, visual B-roll prompts, Hormozi pop captions, and 1-click publishing.
          </p>
        </div>

        {/* Quick Launch Buttons & Puter Integration */}
        <div className="flex flex-wrap items-center gap-2.5">
          <PuterAuthBadge 
            selectedModel={selectedPuterModel} 
            onModelSelect={setSelectedPuterModel} 
          />

          <button
            onClick={() => setActiveTab('topics')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Discover Topics</span>
          </button>

          <button
            onClick={() => handleGenerateAutomation()}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-white" />}
            <span>{isGenerating ? 'Synthesizing...' : 'Auto-Generate Current'}</span>
          </button>
        </div>
      </div>

      {/* Channel Profile Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Select Active Channel Profile
            </span>
          </div>
          <button
            onClick={() => setIsEditingChannel(!isEditingChannel)}
            className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" /> {isEditingChannel ? 'Done Customizing' : 'Customize Channel Info'}
          </button>
        </div>

        {/* Channel Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CHANNEL_PROFILES.map((ch) => {
            const isSel = activeChannelId === ch.id;
            return (
              <div
                key={ch.id}
                onClick={() => handleSelectChannel(ch)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSel
                    ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500 shadow-md'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">{ch.avatarIcon}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 ${isSel ? 'text-amber-300' : 'text-slate-400'}`}>
                    {ch.badge.split(' ')[0]}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono truncate">{ch.handle}</p>
              </div>
            );
          })}
        </div>

        {/* Channel Info Editor Drawer */}
        {isEditingChannel && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Custom Channel Name</label>
              <input
                type="text"
                value={channelName}
                onChange={e => setChannelName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Channel Tone / Persona</label>
              <input
                type="text"
                value={channelTone}
                onChange={e => setChannelTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800 max-w-3xl mx-auto overflow-x-auto">
        {[
          { id: 'topics', label: 'Self-Generated Topics', icon: Sparkles },
          { id: 'flow', label: 'Scene-by-Scene Flow', icon: Layers },
          { id: 'player', label: 'Live Video Preview', icon: Play },
          { id: 'publisher', label: '1-Click Multi-Platform', icon: Send },
          { id: 'planner', label: 'Content Plan & Queue', icon: Calendar },
          { id: 'settings', label: 'Gemini & API Keys', icon: Settings2 },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: SELF-GENERATED DYNAMIC TOPICS & CURRICULUM DISCOVERY               */}
      {/* ========================================================================= */}
      {activeTab === 'topics' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{activeProfile.avatarIcon}</span>
                <span>Self-Generated Video Topics for {channelName}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic, non-default viral video concepts tailored to your channel persona ({activeProfile.tone}).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchChannelTopics()}
                disabled={isLoadingTopics}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                {isLoadingTopics ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shuffle className="w-3.5 h-3.5 text-amber-400" />}
                <span>Shuffle / Generate New Topics</span>
              </button>

              <button
                onClick={handleBatchScheduleToQueue}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-black" />
                <span>Batch Schedule to 7-Day Queue</span>
              </button>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {selfGeneratedTopics.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider">
                      #{idx + 1} {item.badge}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{item.viralScore}/100</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    "{item.hook}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Format: 9:16 Shorts • ~35s
                  </span>
                  <button
                    onClick={() => handleGenerateAutomation(item.title, item.niche)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Auto-Produce Video</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SCENE-BY-SCENE FLOW BUILDER                                        */}
      {/* ========================================================================= */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          {/* Quick Generator Controls Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Niche Curriculum</label>
                <select
                  value={selectedNiche}
                  onChange={e => {
                    const n = e.target.value;
                    setSelectedNiche(n);
                    fetchChannelTopics(n);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="beshaan_trio">🎀 Beshaan (Fashion, Lifestyle, Gaming)</option>
                  <option value="ai_tech">🤖 AI & Developer Engineering</option>
                  <option value="wealth_business">💰 High-Income Wealth & Micro-SaaS</option>
                  <option value="dark_psychology">🧠 Dark Psychology & Influence</option>
                  <option value="stoicism_mindset">⚡ High-Performance Stoicism</option>
                  <option value="science_space">🌌 Space & Cosmic Physics</option>
                  <option value="mystery_facts">🎙️ Curious Facts & Hidden History</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Voiceover Language</label>
                <select
                  value={scriptLanguage}
                  onChange={e => setScriptLanguage(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="roman_urdu">🇵🇰 Roman Urdu (رومن اردو - Voiceover)</option>
                  <option value="english">🌐 English (Global US/UK)</option>
                  <option value="urdu">🇵🇰 Urdu Script (اردو رسم الخط)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Format</label>
                <select
                  value={targetFormat}
                  onChange={e => setTargetFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="shorts_9_16">📱 Vertical 9:16 (Shorts/Reels)</option>
                  <option value="video_16_9">🖥️ Horizontal 16:9 (YouTube Video)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Duration: {targetDuration}s (Ideal 30s-40s)</label>
                <input
                  type="range"
                  min="25"
                  max="50"
                  step="5"
                  value={targetDuration}
                  onChange={e => setTargetDuration(parseInt(e.target.value))}
                  className="w-full accent-amber-500 mt-2"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleGenerateAutomation()}
                  disabled={isGenerating}
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Script</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Custom Video Topic / Prompt (Optional)</label>
              <input
                type="text"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="Type any topic, or leave blank to use the active channel's self-generated curriculum..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Title & SEO High-CTR Selection */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              High-CTR Clickbait Viral Titles (AI Generated)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {titleOptions.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTitle(t)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedTitle === t 
                      ? 'bg-amber-500/15 border-amber-500 text-white font-bold ring-1 ring-amber-500' 
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{t}</span>
                  {selectedTitle === t && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Scene-by-Scene Timeline Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">
                Storyboard Pipeline ({scenes.length} Scenes • {totalDuration}s Total Duration)
              </span>
              <button
                onClick={() => {
                  const newNum = scenes.length + 1;
                  setScenes([
                    ...scenes,
                    {
                      sceneNumber: newNum,
                      durationSeconds: 6,
                      visualPrompt: 'Cinematic dynamic visual prompt',
                      voiceoverText: 'Spoken voiceover script for scene ' + newNum,
                      onScreenCaption: 'NEW VIRAL HOOK',
                      soundEffect: 'Whoosh',
                      brollKeyword: 'technology'
                    }
                  ]);
                }}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Scene
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {scenes.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                        Scene #{sc.sceneNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {sc.durationSeconds}s duration
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-mono">
                        SFX: <strong className="text-slate-300">{sc.soundEffect}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playSceneVoiceover(sc.voiceoverText)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium text-xs flex items-center gap-1 cursor-pointer border border-slate-800 hover:border-amber-500/40"
                        title="Preview Speech Narration"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{scriptLanguage === 'roman_urdu' ? 'Roman Urdu VO' : scriptLanguage === 'urdu' ? 'Urdu VO' : 'Narration'}</span>
                      </button>

                      <button
                        onClick={() => setScenes(scenes.filter((_, i) => i !== idx))}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 cursor-pointer"
                        title="Delete Scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scene Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Visual Prompt (Image / Video Gen)</label>
                      <textarea
                        rows={3}
                        value={sc.visualPrompt}
                        onChange={e => {
                          const val = e.target.value;
                          setScenes(scenes.map((s, i) => i === idx ? { ...s, visualPrompt: val } : s));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1 flex items-center justify-between">
                        <span>Voiceover Narration Script</span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {scriptLanguage === 'roman_urdu' ? '🇵🇰 Roman Urdu' : scriptLanguage === 'urdu' ? '🇵🇰 Urdu' : '🌐 English'}
                        </span>
                      </label>
                      <textarea
                        rows={3}
                        value={sc.voiceoverText}
                        onChange={e => {
                          const val = e.target.value;
                          setScenes(scenes.map((s, i) => i === idx ? { ...s, voiceoverText: val } : s));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Hormozi Pop Caption</label>
                        <input
                          type="text"
                          value={sc.onScreenCaption}
                          onChange={e => {
                            const val = e.target.value;
                            setScenes(scenes.map((s, i) => i === idx ? { ...s, onScreenCaption: val } : s));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-300 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">B-Roll Keyword</label>
                        <input
                          type="text"
                          value={sc.brollKeyword}
                          onChange={e => {
                            const val = e.target.value;
                            setScenes(scenes.map((s, i) => i === idx ? { ...s, brollKeyword: val } : s));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE VIDEO SIMULATION PLAYER                                       */}
      {/* ========================================================================= */}
      {activeTab === 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-black shadow-2xl w-full max-w-sm aspect-[9/16]">
              <canvas
                ref={canvasRef}
                width={720}
                height={1280}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Scene {currentSceneIdx + 1}/{scenes.length}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-xs">
                <span className="font-mono text-amber-400 font-bold">
                  {currentTime.toFixed(1)}s / {totalDuration}s
                </span>
                <span className="text-slate-300 truncate max-w-[140px]">
                  {scenes[currentSceneIdx]?.soundEffect}
                </span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-3 mt-4 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-full shadow-lg">
              <button
                onClick={() => {
                  setCurrentTime(0);
                  setCurrentSceneIdx(0);
                }}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Preview Inspector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Currently Playing Scene #{currentSceneIdx + 1}
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Narration Script:</span>
                  <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 mt-1 leading-relaxed">
                    {scenes[currentSceneIdx]?.voiceoverText}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Hormozi Pop Caption:</span>
                  <p className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black text-base mt-1">
                    {scenes[currentSceneIdx]?.onScreenCaption}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">
                Auto-Generated Thumbnail & Cover Concept
              </span>
              <div className="p-6 rounded-xl bg-gradient-to-br from-amber-600 via-orange-700 to-red-900 text-center space-y-2 border border-amber-500/40 shadow-inner">
                <span className="inline-block px-3 py-1 rounded-full bg-black/40 text-amber-200 text-xs font-black tracking-widest uppercase">
                  {thumbnailBadge}
                </span>
                <h3 className="text-2xl font-black text-white uppercase drop-shadow-md">
                  {thumbnailHeadline}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ONE-CLICK MULTI-PLATFORM DISPATCHER                                 */}
      {/* ========================================================================= */}
      {activeTab === 'publisher' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>One-Click Multi-Platform Video Publisher</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispatches packaged viral metadata to YouTube Shorts, Instagram Reels, TikTok, and webhooks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'youtube', name: 'YouTube Shorts', icon: Youtube, color: 'text-red-500', desc: 'YouTube Data API v3' },
              { id: 'instagram', name: 'Instagram Reels', icon: Instagram, color: 'text-pink-500', desc: 'Instagram Graph API' },
              { id: 'tiktok', name: 'TikTok', icon: Film, color: 'text-cyan-400', desc: 'Direct Creator Posting' },
              { id: 'twitter', name: 'X / Twitter', icon: Share2, color: 'text-blue-400', desc: 'X Media API v2' },
            ].map(p => {
              const isSelected = selectedPlatforms.includes(p.id);
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedPlatforms(selectedPlatforms.filter(id => id !== p.id));
                    } else {
                      setSelectedPlatforms([...selectedPlatforms, p.id]);
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    isSelected 
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-black/40 flex items-center justify-center ${p.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <span className="text-[10px] text-slate-400">{p.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Video Title</label>
                <input
                  type="text"
                  value={selectedTitle}
                  onChange={e => setSelectedTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Description & Hashtags</label>
                  <button
                    onClick={() => copyToClipboard(description, 'Description')}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Webhook Dispatch URL (Zapier / Make.com)</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300">Hashtag Cloud:</span>
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.map((h, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300 font-mono">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Selected {selectedPlatforms.length} social platforms for simultaneous dispatch.
            </span>

            <button
              onClick={handlePublishAll}
              disabled={isPublishing || selectedPlatforms.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isPublishing ? 'Dispatching Payload...' : 'Publish to All Platforms Now'}</span>
            </button>
          </div>

          {publishedStatus && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Platform Dispatch Successful:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                {Object.entries(publishedStatus).map(([platform, item]: any) => (
                  <div key={platform} className="p-2 rounded bg-slate-950 border border-emerald-800/40 text-slate-300">
                    <strong className="text-amber-400 uppercase">{platform}:</strong> {item.status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONTENT PLAN & AUTONOMOUS QUEUE                                    */}
      {/* ========================================================================= */}
      {activeTab === 'planner' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Autonomous Content Plan & Production Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic schedule cycling daily production runs for {channelName}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchScheduleToQueue}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5 text-black" />
                <span>Populate With Self-Generated Topics</span>
              </button>

              <button
                onClick={() => {
                  const newTopic: ContentPlanItem = {
                    id: Date.now().toString(),
                    title: `Autonomous Episode #${contentPlan.length + 1}: ${channelName} Special`,
                    niche: activeProfile.name,
                    format: '9:16 Shorts',
                    scheduledTime: 'Scheduled for Tomorrow 7:00 AM UTC',
                    status: 'ready'
                  };
                  setContentPlan([...contentPlan, newTopic]);
                  toast.success('Added new topic to autonomous queue!');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Scheduled Lesson</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="p-2.5">Topic / Episode Title</th>
                  <th className="p-2.5">Channel / Niche</th>
                  <th className="p-2.5">Format</th>
                  <th className="p-2.5">Scheduled Production</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contentPlan.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-2.5 font-medium text-white flex items-center gap-2">
                      <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.title}</span>
                    </td>
                    <td className="p-2.5 text-slate-300">{item.niche}</td>
                    <td className="p-2.5 text-slate-400 font-mono">{item.format}</td>
                    <td className="p-2.5 text-slate-400 font-mono">{item.scheduledTime}</td>
                    <td className="p-2.5 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.status === 'ready' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AI ENGINE & PUTER.JS (UNLIMITED 400+ MODELS) CONFIGURATION         */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>AI Engine & Unlimited Access Configuration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Leverage Puter.js user-pays architecture for free access to 400+ frontier AI models, or configure your own Gemini API key.
            </p>
          </div>

          <div className="space-y-4">
            {/* Puter.js Unlimited AI Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 via-slate-950 to-purple-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs text-white">Puter.js Unlimited AI (Recommended)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  ZERO DEVELOPER COST
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Puter.js provides client-side access to <strong>GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek V3, and Llama 3.1</strong> without requiring server API keys. Users authenticate with their own Puter accounts to cover usage with free monthly allowances.
              </p>
              
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400">Selected Model:</label>
                  <select
                    value={selectedPuterModel}
                    onChange={(e) => setSelectedPuterModel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-cyan-300 rounded-lg px-2 py-1 font-mono"
                  >
                    {POPULAR_PUTER_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                    ))}
                  </select>
                </div>
                <PuterAuthBadge selectedModel={selectedPuterModel} onModelSelect={setSelectedPuterModel} />
              </div>
            </div>

            {/* Gemini API Key Fallback */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Google Gemini API Key (Optional Server Fallback)</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If both Puter and Gemini are offline, the built-in procedural engine creates curated viral storylines with 100% zero downtime.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-bold text-amber-400">Supported Autonomous Features:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Dynamic Channel Topic Self-Generation (Non-default viral ideas)</li>
                <li>Scene-by-scene script generator for 30s-40s vertical shorts</li>
                <li>Hormozi / MrBeast bold on-screen pop captions</li>
                <li>Visual B-roll prompts for image & video diffusion</li>
                <li>Multi-platform packaging (YouTube Shorts, Instagram Reels, TikTok)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
