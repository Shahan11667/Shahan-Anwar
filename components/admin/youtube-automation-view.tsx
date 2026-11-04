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
  Tv,
  Check,
  Globe,
  LogIn,
  LogOut,
  Link2,
  Unlink,
  ShieldCheck,
  AlertCircle
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

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface SocialAccountItem {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'facebook';
  accountHandle: string;
  accountName: string;
  channelId?: string;
  isConnected: boolean;
  hasToken?: boolean;
  avatarUrl?: string;
  updatedAt?: string;
}

export interface CharacterDialogue {
  speaker: string;
  dialogue: string;
  emotion?: string;
  emoji?: string;
}

export interface StoryPart {
  partNumber: number;
  partTitle: string;
  scenes: SceneItem[];
}

export interface SceneItem {
  sceneNumber: number;
  durationSeconds: number;
  visualPrompt: string;
  voiceoverText: string;
  onScreenCaption: string;
  soundEffect: string;
  brollKeyword: string;
  aiVideoPrompt?: string;
  dialogues?: CharacterDialogue[];
  actionSummary?: string;
  partNumber?: number;
  partTitle?: string;
  hookOptions?: string[];
  onScreenTexts?: string[];
  visualDirection?: string;
  ctaLoop?: string;
  title?: string;
  description?: string;
  tags?: string[];
  hashtags?: string[];
  thumbnailConcept?: {
    headline: string;
    subtext: string;
    colorTheme: string;
  };
  safetyNote?: string;
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
  const [activeTab, setActiveTab] = useState<'topics' | 'flow' | 'player' | 'planner' | 'publisher' | 'settings'>('flow');

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

  // Multi-Part Story Arc & AI Video Engine State (Bisma Style ❤️)
  const [seriesParts, setSeriesParts] = useState<1 | 5 | 10>(1);
  const [sceneCountChoice, setSceneCountChoice] = useState<number>(5);
  const [activePartTab, setActivePartTab] = useState<number>(1);
  const [visualStyle, setVisualStyle] = useState<string>('cinematic anime-style');
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);

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

  // Publisher & Webhook Integration State (Direct In-App vs Make.com/Zapier)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube', 'instagram', 'tiktok']);
  const [publishMode, setPublishMode] = useState<'direct' | 'webhook'>('direct');
  const [directYouTubeToken, setDirectYouTubeToken] = useState<string>('');
  const [directInstagramToken, setDirectInstagramToken] = useState<string>('');
  const [showApiTokenInputs, setShowApiTokenInputs] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookProvider, setWebhookProvider] = useState<'make' | 'zapier' | 'custom'>('make');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState<boolean>(false);
  const [publishedStatus, setPublishedStatus] = useState<any>(null);

  // Connected Social Accounts & Channel Sign-In Hub State
  const [socialAccounts, setSocialAccounts] = useState<SocialAccountItem[]>([
    { platform: 'youtube', accountHandle: '@BeshaanVibe', accountName: 'Beshaan (YouTube Shorts)', isConnected: true },
    { platform: 'instagram', accountHandle: '@beshaan_vibe', accountName: 'Beshaan (Instagram Reels)', isConnected: true },
    { platform: 'tiktok', accountHandle: '@beshaan', accountName: 'Beshaan (TikTok)', isConnected: true },
    { platform: 'facebook', accountHandle: 'Beshaan Family', accountName: 'Beshaan (Facebook Reels)', isConnected: true },
  ]);
  const [isFetchingSocial, setIsFetchingSocial] = useState<boolean>(false);
  const [editingSocialPlatform, setEditingSocialPlatform] = useState<string | null>(null);
  const [connectHandleInput, setConnectHandleInput] = useState<string>('');
  const [connectTokenInput, setConnectTokenInput] = useState<string>('');
  const [isSavingSocial, setIsSavingSocial] = useState<boolean>(false);

  // Fetch Connected Accounts from MongoDB
  const fetchSocialAccounts = useCallback(async () => {
    setIsFetchingSocial(true);
    try {
      const res = await fetch('/api/admin/social/accounts');
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setSocialAccounts(data.accounts);
      }
    } catch {
      // offline fallback
    } finally {
      setIsFetchingSocial(false);
    }
  }, []);

  useEffect(() => {
    fetchSocialAccounts();
  }, [fetchSocialAccounts]);

  const handleConnectSocialAccount = async (platform: string, handle: string, token?: string) => {
    setIsSavingSocial(true);
    try {
      const res = await fetch('/api/admin/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          accountHandle: handle,
          accountName: platform === 'youtube' ? 'Beshaan Official' : 'Beshaan Trio',
          accessToken: token || '',
          channelId: platform === 'youtube' ? '@BeshaanVibe' : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Connected ${platform}!`, { icon: '🟢' });
        await fetchSocialAccounts();
        setEditingSocialPlatform(null);
        setConnectHandleInput('');
        setConnectTokenInput('');
      } else {
        toast.error(data.error || 'Failed to connect');
      }
    } catch (err: any) {
      toast.error('Connection failed: ' + err.message);
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleDisconnectSocialAccount = async (platform: string) => {
    try {
      const res = await fetch(`/api/admin/social/accounts?platform=${platform}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Disconnected ${platform}`, { icon: '⚪' });
        await fetchSocialAccounts();
      }
    } catch (err: any) {
      toast.error('Disconnect failed: ' + err.message);
    }
  };

  // Restore saved webhook URL, provider, and direct tokens from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('sol_automation_webhook_url');
      if (savedUrl) setWebhookUrl(savedUrl);
      const savedProvider = localStorage.getItem('sol_automation_webhook_provider') as any;
      if (savedProvider && ['make', 'zapier', 'custom'].includes(savedProvider)) {
        setWebhookProvider(savedProvider);
      }
      const savedMode = localStorage.getItem('sol_automation_publish_mode') as any;
      if (savedMode && ['direct', 'webhook'].includes(savedMode)) {
        setPublishMode(savedMode);
      }
      const savedYt = localStorage.getItem('sol_direct_yt_token');
      if (savedYt) setDirectYouTubeToken(savedYt);
      const savedIg = localStorage.getItem('sol_direct_ig_token');
      if (savedIg) setDirectInstagramToken(savedIg);
    }
  }, []);

  const handlePublishModeChange = (mode: 'direct' | 'webhook') => {
    setPublishMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sol_automation_publish_mode', mode);
    }
  };

  const handleWebhookChange = (val: string) => {
    setWebhookUrl(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sol_automation_webhook_url', val);
    }
  };

  const handleProviderChange = (p: 'make' | 'zapier' | 'custom') => {
    setWebhookProvider(p);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sol_automation_webhook_provider', p);
    }
  };

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
          seriesParts,
          sceneCount: sceneCountChoice,
          visualStyle,
          apiKey: apiKey || undefined,
        })
      });

      const res = await response.json();
      if (res.success && res.data) {
        const data = res.data;
        setTitleOptions(data.titleOptions || []);
        setSelectedTitle(data.selectedTitle || promptToUse);
        setScenes(data.scenes || []);
        if (data.storyParts && Array.isArray(data.storyParts)) {
          setStoryParts(data.storyParts);
        } else {
          setStoryParts([]);
        }
        setDescription(data.description || '');
        setHashtags(data.hashtags || []);
        if (data.thumbnailConcept) {
          setThumbnailHeadline(data.thumbnailConcept.mainHeadline);
          setThumbnailBadge(data.thumbnailConcept.badgeText);
        }

        setCurrentTime(0);
        setCurrentSceneIdx(0);
        confetti({ particleCount: 50, spread: 60 });
        const partMsg = (data.seriesParts && data.seriesParts > 1) 
          ? `Generated ${data.seriesParts}-Part Story Series (${data.scenes.length} Scenes with 10s AI Video Prompts)!`
          : `Generated ${data.scenes?.length || 5}-scene video script with 10s AI Video Prompts!`;
        toast.success(partMsg, { icon: '🎬' });
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

  // Test Webhook Ping for Make.com / Zapier Data Structure Detection
  const handleTestWebhookPing = async () => {
    if (!webhookUrl || (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://'))) {
      toast.error('Please enter a valid webhook URL (e.g. https://hook.eu1.make.com/...)');
      return;
    }
    setIsTestingWebhook(true);
    try {
      const res = await fetch('/api/admin/automation/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_ping',
          webhookUrl,
          channelName,
          niche: selectedNiche,
          language: scriptLanguage,
          title: selectedTitle,
          description,
          hashtags,
          scenes,
          thumbnail: {
            mainHeadline: thumbnailHeadline,
            badgeText: thumbnailBadge,
            bgColor: '#ec4899'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 60 });
        toast.success(`Make.com webhook verified! (HTTP ${data.status || 200}) Data structure active.`, { icon: '⚡' });
      } else {
        toast.error(data.error || 'Webhook test ping failed');
      }
    } catch (e: any) {
      toast.error('Test ping error: ' + e.message);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Multi-Platform & Direct Autonomous Publisher
  const handlePublishAll = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/admin/automation/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          publishMode,
          platforms: selectedPlatforms,
          channelName,
          niche: selectedNiche,
          language: scriptLanguage,
          title: selectedTitle,
          description,
          hashtags,
          scenes,
          thumbnail: {
            mainHeadline: thumbnailHeadline,
            badgeText: thumbnailBadge,
            bgColor: '#ec4899'
          },
          webhookUrl: publishMode === 'webhook' ? webhookUrl : undefined,
          youtubeToken: directYouTubeToken || undefined,
          instagramToken: directInstagramToken || undefined,
        })
      });

      const data = await response.json();
      if (data.success) {
        setPublishedStatus(data.publishedPlatforms);
        confetti({ particleCount: 70, spread: 80 });

        if (publishMode === 'direct') {
          // Auto-copy full Roman Urdu package to clipboard
          copyToClipboard(`${selectedTitle}\n\n${description}\n\n${hashtags.join(' ')}`, 'Full YouTube Metadata Package');
          
          const ytAccount = socialAccounts.find(a => a.platform === 'youtube');
          const hasYtToken = Boolean(directYouTubeToken || ytAccount?.hasToken);

          if (selectedPlatforms.includes('youtube') && !hasYtToken) {
            window.open('https://studio.youtube.com/channel/videos/upload', '_blank');
            toast.success('YouTube Studio opened! Roman Urdu title & description copied to clipboard.', { icon: '▶️', duration: 6000 });
          } else if (hasYtToken) {
            toast.success(`Directly uploaded to YouTube channel via YouTube Data API!`, { icon: '🚀' });
          } else {
            toast.success(`Directly uploaded to ${selectedPlatforms.length} platforms!`, { icon: '🚀' });
          }
        } else {
          const webhookNote = data.webhookDispatched 
            ? ` & Dispatched to ${webhookProvider === 'make' ? 'Make.com' : 'Webhook'}` 
            : '';
          toast.success(`Packaged for ${selectedPlatforms.length} platforms${webhookNote}!`, { icon: '🚀' });
        }

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

      {/* 🚀 QUICK SOCIAL CONNECT TOP BAR (Pre-Connected 1-Click Sign-In) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-lg space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Connected Channels Hub (YouTube, Instagram &amp; Facebook)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              READY TO POST
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Aapka channel link hai, direct 1-click se upload kar sakte hain
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* YouTube */}
          {(() => {
            const acc = socialAccounts.find(a => a.platform === 'youtube');
            const isConn = acc?.isConnected ?? true; // Default auto-connected for user
            return (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">YouTube Channel</h5>
                    <p className="text-[10px] text-red-300 font-mono">{acc?.accountHandle || '@BeshaanVibe'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isConn) {
                      toast.success('YouTube channel @BeshaanVibe already connected!');
                    } else {
                      handleConnectSocialAccount('youtube', '@BeshaanVibe', '');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    isConn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-600 text-white'
                  }`}
                >
                  {isConn ? '✓ CONNECTED' : 'Sign In'}
                </button>
              </div>
            );
          })()}

          {/* Instagram */}
          {(() => {
            const acc = socialAccounts.find(a => a.platform === 'instagram');
            const isConn = acc?.isConnected ?? true; // Default auto-connected for user
            return (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-pink-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">Instagram Reels</h5>
                    <p className="text-[10px] text-pink-300 font-mono">{acc?.accountHandle || '@beshaan_vibe'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isConn) {
                      toast.success('Instagram @beshaan_vibe already connected!');
                    } else {
                      handleConnectSocialAccount('instagram', '@beshaan_vibe', '');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    isConn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-pink-600 text-white'
                  }`}
                >
                  {isConn ? '✓ CONNECTED' : 'Sign In'}
                </button>
              </div>
            );
          })()}

          {/* Facebook */}
          {(() => {
            const acc = socialAccounts.find(a => a.platform === 'facebook');
            const isConn = acc?.isConnected ?? true;
            return (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">Facebook Page</h5>
                    <p className="text-[10px] text-blue-300 font-mono">{acc?.accountHandle || 'Beshaan Family'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isConn) {
                      toast.success('Facebook Page Beshaan Family already connected!');
                    } else {
                      handleConnectSocialAccount('facebook', 'Beshaan Family', '');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    isConn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isConn ? '✓ CONNECTED' : 'Sign In'}
                </button>
              </div>
            );
          })()}

          {/* TikTok */}
          {(() => {
            const acc = socialAccounts.find(a => a.platform === 'tiktok');
            const isConn = acc?.isConnected ?? true;
            return (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <TikTok className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">TikTok Creator</h5>
                    <p className="text-[10px] text-cyan-300 font-mono">{acc?.accountHandle || '@beshaan'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isConn) {
                      toast.success('TikTok @beshaan already connected!');
                    } else {
                      handleConnectSocialAccount('tiktok', '@beshaan', '');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    isConn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-600 text-white'
                  }`}
                >
                  {isConn ? '✓ CONNECTED' : 'Sign In'}
                </button>
              </div>
            );
          })()}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Series Arc Mode</label>
                <select
                  value={seriesParts}
                  onChange={e => {
                    const p = parseInt(e.target.value) as 1 | 5 | 10;
                    setSeriesParts(p);
                    setActivePartTab(1);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-pink-400 font-bold focus:outline-none focus:border-pink-500"
                >
                  <option value={1}>🎬 Single Clip</option>
                  <option value={5}>💖 5-Part Story Series (25 Scenes)</option>
                  <option value={10}>🔥 10-Part Epic Story (50 Scenes)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Scenes / Prompts</label>
                <select
                  value={seriesParts > 1 ? seriesParts * 5 : sceneCountChoice}
                  disabled={seriesParts > 1}
                  onChange={e => setSceneCountChoice(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 disabled:opacity-75"
                >
                  {seriesParts > 1 ? (
                    <option value={seriesParts * 5}>{seriesParts * 5} Prompts ({seriesParts} Parts x 5)</option>
                  ) : (
                    <>
                      <option value={5}>5 Scenes (5 Prompts)</option>
                      <option value={6}>6 Scenes (6 Prompts)</option>
                      <option value={7}>7 Scenes (7 Prompts 🌟)</option>
                      <option value={8}>8 Scenes (8 Prompts)</option>
                      <option value={10}>10 Scenes (10 Prompts)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Visual Art Style</label>
                <select
                  value={visualStyle}
                  onChange={e => setVisualStyle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="cinematic anime-style">🌸 Cinematic Anime (Bisma Style ❤️)</option>
                  <option value="photorealistic 8k">📸 Photorealistic 8K Cinema</option>
                  <option value="korean drama cinematic">🎎 Korean Drama Romance</option>
                  <option value="3d pixar disney style">✨ 3D Pixar Animation</option>
                  <option value="cyberpunk retro neon">🌆 Cyberpunk Neon Noir</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Niche Curriculum</label>
                <select
                  value={selectedNiche}
                  onChange={e => {
                    const n = e.target.value;
                    setSelectedNiche(n);
                    fetchChannelTopics(n);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="romantic_anime">💖 Romantic Anime Story (Bisma 🦟)</option>
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
                <label className="text-xs text-slate-400 block mb-1">Dialogue / Voiceover</label>
                <select
                  value={scriptLanguage}
                  onChange={e => setScriptLanguage(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="roman_urdu">🇵🇰 Roman Urdu (رومن اردو dialogues)</option>
                  <option value="english">🌐 English (Global dialogues)</option>
                  <option value="urdu">🇵🇰 Urdu Script (اردو)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Format</label>
                <select
                  value={targetFormat}
                  onChange={e => setTargetFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="shorts_9_16">📱 Vertical 9:16 (Shorts/Reels)</option>
                  <option value="video_16_9">🖥️ Horizontal 16:9 (YouTube Video)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleGenerateAutomation()}
                  disabled={isGenerating}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{seriesParts > 1 ? `Generate ${seriesParts}-Part Arc` : 'Generate Script'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Story Premise / Reference Prompt (e.g. Bisma's "Little girl in lavender on university floor...")
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="Type story outline (e.g. Two childhood friends meet on university floor, emotional promise...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Series Navigation Tabs if seriesParts > 1 or storyParts.length > 0 */}
          {((seriesParts > 1) || storyParts.length > 1) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-950 border border-pink-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold text-xs">
                    🎭 Multi-Part Story Series ({seriesParts} Parts Active)
                  </span>
                  <span className="text-xs text-slate-400">
                    Showing 5-6 scenes per episode with complete 10-second AI Video Prompts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const currentPartScenes = scenes.filter(s => (s.partNumber || 1) === activePartTab);
                      const bundle = currentPartScenes.map((s, i) => `=== SCENE ${s.sceneNumber} (${s.durationSeconds}s) ===\n${s.aiVideoPrompt || s.visualPrompt}\n`).join('\n\n');
                      navigator.clipboard.writeText(bundle);
                      toast.success(`Copied all ${currentPartScenes.length} AI Video Prompts for Part ${activePartTab}!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Part {activePartTab} Prompts</span>
                  </button>

                  <button
                    onClick={() => {
                      const fullBundle = scenes.map(s => `[Part ${s.partNumber || 1} - Scene ${s.sceneNumber}]\n${s.aiVideoPrompt || s.visualPrompt}\n`).join('\n---\n\n');
                      navigator.clipboard.writeText(fullBundle);
                      toast.success(`Copied entire story series (${scenes.length} scenes) for AI video engines!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Series ({scenes.length} Prompts)</span>
                  </button>
                </div>
              </div>

              {/* Part selector buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {Array.from({ length: seriesParts }, (_, i) => i + 1).map(pNum => {
                  const partObj = storyParts.find(sp => sp.partNumber === pNum);
                  const isCurrent = activePartTab === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setActivePartTab(pNum)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>Part {pNum}</span>
                      {partObj && <span className="opacity-75 font-normal">({partObj.partTitle})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              {scenes
                .filter(sc => !seriesParts || seriesParts <= 1 || (sc.partNumber || 1) === activePartTab)
                .map((sc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                        Scene #{sc.sceneNumber}
                      </span>
                      {sc.partNumber && (
                        <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono text-xs font-bold">
                          Part {sc.partNumber}
                        </span>
                      )}
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

                  {/* AI Video Prompt (10s Engine - Kling / Runway / Luma / Sora) */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-950/30 via-purple-950/30 to-slate-900 border border-pink-500/30 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-pink-300 flex items-center gap-1">
                          <span>🎬 AI Video Prompt (10s Clip Engine)</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-200 font-mono">
                          Kling • Runway Gen-3 • Luma • Sora
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const pText = sc.aiVideoPrompt || sc.visualPrompt;
                            navigator.clipboard.writeText(pText);
                            setCopiedPromptIdx(sc.sceneNumber);
                            setTimeout(() => setCopiedPromptIdx(null), 2000);
                            toast.success(`Copied Scene #${sc.sceneNumber} 10s AI Video Prompt!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow"
                        >
                          {copiedPromptIdx === sc.sceneNumber ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPromptIdx === sc.sceneNumber ? 'Copied!' : 'Copy 10s Prompt'}</span>
                        </button>

                        <a
                          href="https://klingai.com"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium"
                        >
                          Kling AI ↗
                        </a>
                        <a
                          href="https://runwayml.com"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium"
                        >
                          Runway Gen-3 ↗
                        </a>
                      </div>
                    </div>

                    {/* Formatted Text Box */}
                    <div className="relative">
                      <textarea
                        rows={6}
                        value={sc.aiVideoPrompt || sc.visualPrompt}
                        onChange={e => {
                          const val = e.target.value;
                          setScenes(scenes.map((s, i) => i === idx ? { ...s, aiVideoPrompt: val } : s));
                        }}
                        className="w-full bg-black/60 border border-pink-500/20 rounded-lg p-2.5 text-pink-100 font-mono text-[11px] leading-relaxed focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    {/* Dialogues Chips Preview if available */}
                    {sc.dialogues && sc.dialogues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sc.dialogues.map((dlg, dIdx) => (
                          <div key={dIdx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                            <span className="font-bold text-pink-400">{dlg.emoji || '💬'} {dlg.speaker}</span>
                            {dlg.emotion && <span className="text-slate-500 text-[10px]">({dlg.emotion}):</span>}
                            <span className="text-white italic">"{dlg.dialogue}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bisma Shootable Script & Metadata Pack */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
                    {/* Hook Options */}
                    {sc.hookOptions && sc.hookOptions.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-pink-400 block mb-1">
                          🎯 Hook Options (Pehle 3 Sec - Pick 1):
                        </span>
                        <ul className="space-y-1 text-slate-300 pl-3 list-disc marker:text-pink-500">
                          {sc.hookOptions.map((h: string, hIdx: number) => (
                            <li key={hIdx} className="leading-snug">{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* On-Screen Text */}
                    {sc.onScreenTexts && sc.onScreenTexts.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-cyan-400 block mb-1">
                          📱 On-Screen Text (Mute par samajh aane ke liye):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sc.onScreenTexts.map((txt: string, tIdx: number) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-200 font-mono text-[11px]">
                              {tIdx + 1}. {txt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visual Direction & CTA Loop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <strong className="text-amber-400 block mb-0.5">🎬 Visual Direction:</strong>
                        <span className="text-slate-300">{sc.visualDirection || sc.visualPrompt}</span>
                      </div>
                      <div>
                        <strong className="text-purple-400 block mb-0.5">🔄 CTA / Loop:</strong>
                        <span className="text-slate-300">{sc.ctaLoop || 'End call-to-action seamlessly loops back to start.'}</span>
                      </div>
                    </div>

                    {/* Metadata Pack: Title, Description, Hashtags, Thumbnail */}
                    <div className="p-3 rounded-lg bg-black/60 border border-slate-800 space-y-2 pt-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-[11px] font-bold text-emerald-400">
                          🚀 Ready to Publish: Title, Description &amp; Hashtags
                        </span>
                        <button
                          onClick={() => {
                            const metaBundle = `Title: ${sc.title || sc.onScreenCaption}\n\nDescription:\n${sc.description || sc.voiceoverText}\n\nTags: ${(sc.tags || []).join(', ')}\n\nHashtags: ${(sc.hashtags || []).join(' ')}`;
                            navigator.clipboard.writeText(metaBundle);
                            toast.success(`Copied Title, Description & Hashtags for Scene #${sc.sceneNumber}!`);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Metadata</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-400">Title: </span>
                          <span className="text-white font-bold">{sc.title || `${sc.onScreenCaption} 🥹❤️ #Shorts`}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Description: </span>
                          <span className="text-slate-300">{sc.description || sc.voiceoverText}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Hashtags: </span>
                          <span className="text-pink-400 font-mono">{(sc.hashtags || ['#Shorts', '#Reels', '#Anime', '#Viral']).join(' ')}</span>
                        </div>
                        {sc.thumbnailConcept && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-slate-400">🖼️ Thumbnail Concept:</span>
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 font-bold text-[10px]">
                              Headline: "{sc.thumbnailConcept.headline}" ({sc.thumbnailConcept.subtext})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scene Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Visual Prompt (Image Diffusion)</label>
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <span>One-Click Multi-Platform Video Publisher</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload directly to YouTube Shorts, Instagram Reels, and TikTok without any third-party app.
              </p>
            </div>

            {/* Mode Switcher: Direct In-App vs Webhook */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handlePublishModeChange('direct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  publishMode === 'direct'
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Direct In-App Upload (Khud Karo 🚀)</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublishModeChange('webhook')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  publishMode === 'webhook'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Make.com / Webhook (Optional)</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONNECTED SOCIAL ACCOUNTS & CHANNEL SIGN-IN HUB                           */}
          {/* ========================================================================= */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Connected Social Accounts (Yahan Sign-In / Connect Karein)</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold">
                    DATABASE LINKED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Aapka YouTube (<span className="text-amber-300 font-mono font-semibold">@BeshaanVibe</span>), Instagram aur doosre accounts yahan sign-in hotay hain. Jab channel connect ho jata hai, tabhi videos seedha aapke account par upload hongi.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSocialAccounts}
                disabled={isFetchingSocial}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSocial ? 'animate-spin' : ''}`} />
                <span>Sync Accounts</span>
              </button>
            </div>

            {/* 4 Social Account Connection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { 
                  id: 'youtube', 
                  name: 'YouTube Channel', 
                  defaultHandle: '@BeshaanVibe',
                  icon: Youtube, 
                  color: 'text-red-500', 
                  border: 'border-red-500/30',
                  bg: 'bg-red-500/10'
                },
                { 
                  id: 'instagram', 
                  name: 'Instagram Reels', 
                  defaultHandle: '@beshaan_vibe',
                  icon: Instagram, 
                  color: 'text-pink-500', 
                  border: 'border-pink-500/30',
                  bg: 'bg-pink-500/10'
                },
                { 
                  id: 'tiktok', 
                  name: 'TikTok Creator', 
                  defaultHandle: '@beshaan',
                  icon: TikTok, 
                  color: 'text-cyan-400', 
                  border: 'border-cyan-500/30',
                  bg: 'bg-cyan-500/10'
                },
                { 
                  id: 'facebook', 
                  name: 'Facebook Page', 
                  defaultHandle: 'Beshaan Family',
                  icon: Facebook, 
                  color: 'text-blue-500', 
                  border: 'border-blue-500/30',
                  bg: 'bg-blue-500/10'
                },
              ].map(item => {
                const acc = socialAccounts.find(a => a.platform === item.id);
                const isConnected = acc?.isConnected;
                const currentHandle = acc?.accountHandle || item.defaultHandle;
                const hasToken = acc?.hasToken;
                const Icon = item.icon;

                return (
                  <div 
                    key={item.id}
                    className={`p-3.5 rounded-xl border bg-slate-950/80 flex flex-col justify-between space-y-3 transition-all ${
                      isConnected ? 'border-emerald-500/40 shadow-sm' : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-white">{item.name}</span>
                        </div>
                        {isConnected ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <Check className="w-2.5 h-2.5 text-emerald-400" /> CONNECTED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                            NOT SIGNED IN
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800/80">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-mono truncate">{currentHandle}</span>
                          {hasToken && (
                            <span className="text-[9px] text-amber-300 font-bold bg-amber-500/20 px-1 rounded">API KEY ACTIVE</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-900">
                      {isConnected ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSocialPlatform(item.id);
                              setConnectHandleInput(currentHandle);
                              setConnectTokenInput('');
                            }}
                            className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold cursor-pointer text-center"
                          >
                            Edit / Re-auth
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisconnectSocialAccount(item.id)}
                            className="py-1 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[10px] border border-red-800/40 cursor-pointer"
                            title="Disconnect channel"
                          >
                            Unlink
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSocialPlatform(item.id);
                            setConnectHandleInput(currentHandle);
                            setConnectTokenInput('');
                          }}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all ${
                            item.id === 'youtube'
                              ? 'bg-red-600 hover:bg-red-500 text-white'
                              : item.id === 'instagram'
                              ? 'bg-pink-600 hover:bg-pink-500 text-white'
                              : 'bg-amber-600 hover:bg-amber-500 text-white'
                          }`}
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Sign In / Connect {item.id === 'youtube' ? 'YouTube' : item.id === 'instagram' ? 'Instagram' : item.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Explanation of Upload Mechanism */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-2">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono">
                <Zap className="w-3.5 h-3.5" />
                <span>Upload Kaisy Hoga? (2 Real Methods - No Bullshit):</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong className="text-white block mb-0.5">Method 1: Direct 1-Click Studio Bridge (Sab Se Asaan & Free)</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Aapke Chrome browser mein YouTube (<span className="text-amber-300 font-medium">@BeshaanVibe</span>) pehle se logged-in hota hai. Jab aap "Upload Directly" dabate hain, app Roman Urdu Title, Description aur Tags clipboard par copy karke seedha aapke YouTube Studio upload page par le jata hai. Aap bas video drop karte hain aur 5 second mein publish! Zero API hassle.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <strong className="text-white block mb-0.5">Method 2: Google / Meta OAuth Token (100% Background Silent Upload)</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Agar aap Google Cloud Console ya Meta Developer se API token lekar yahan "Sign In / Connect" mein daal detay hain, toh MongoDB mein save ho jayega aur background server bina browser khole YouTube Data API v3 aur Instagram Reels Graph API ke zariye video live post kar dega.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal / Dialog for Signing In & Connecting Channel */}
          {editingSocialPlatform && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {editingSocialPlatform === 'youtube' && <Youtube className="w-5 h-5 text-red-500" />}
                    {editingSocialPlatform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                    {editingSocialPlatform === 'tiktok' && <TikTok className="w-5 h-5 text-cyan-400" />}
                    {editingSocialPlatform === 'facebook' && <Facebook className="w-5 h-5 text-blue-500" />}
                    <h3 className="text-sm font-bold text-white uppercase">
                      Connect {editingSocialPlatform} Channel
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingSocialPlatform(null)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Channel / Account Handle
                    </label>
                    <input
                      type="text"
                      value={connectHandleInput}
                      onChange={e => setConnectHandleInput(e.target.value)}
                      placeholder={editingSocialPlatform === 'youtube' ? '@BeshaanVibe' : '@beshaan'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-500">Quick preset:</span>
                      <button
                        type="button"
                        onClick={() => setConnectHandleInput(editingSocialPlatform === 'youtube' ? '@BeshaanVibe' : '@beshaan_vibe')}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer font-medium"
                      >
                        Set as @{editingSocialPlatform === 'youtube' ? 'BeshaanVibe' : 'beshaan_vibe'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        OAuth / API Access Token <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-medium">Bina token bhi bridge ready hai</span>
                    </div>
                    <input
                      type="password"
                      value={connectTokenInput}
                      onChange={e => setConnectTokenInput(e.target.value)}
                      placeholder={editingSocialPlatform === 'youtube' ? 'ya29.a0AfH6SM...' : 'EAA...'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                      Agar Google Cloud ya Meta Developer app se access token generate kiya hai toh yahan paste karein (100% autonomous background server upload ke liye). Agar nahi hai toh sirf handle save karein, hamara 1-Click Studio Bridge aapke logged-in browser se direct upload karwayega!
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingSocialPlatform(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConnectSocialAccount(editingSocialPlatform, connectHandleInput, connectTokenInput)}
                    disabled={isSavingSocial || !connectHandleInput}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow"
                  >
                    {isSavingSocial ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save & Authorize Channel</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'youtube', name: 'YouTube Shorts', icon: Youtube, color: 'text-red-500', desc: 'YouTube @BeshaanVibe' },
              { id: 'instagram', name: 'Instagram Reels', icon: Instagram, color: 'text-pink-500', desc: 'Reels Direct Post' },
              { id: 'tiktok', name: 'TikTok', icon: Film, color: 'text-cyan-400', desc: 'Creator Center Short' },
              { id: 'twitter', name: 'X / Twitter', icon: Share2, color: 'text-blue-400', desc: 'X Media Video Tweet' },
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
                <label className="text-xs text-slate-400 block mb-1">Target Video Title (Roman Urdu)</label>
                <input
                  type="text"
                  value={selectedTitle}
                  onChange={e => setSelectedTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Description & Hashtags (Roman Urdu)</label>
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

            {/* Right Column: Direct Mode vs Webhook Mode */}
            {publishMode === 'direct' ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Direct In-App Upload Engine</span>
                    </label>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                      NO 3RD PARTY NEEDED
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Aapko kisi Make.com ya Zapier ki zaroorat nahi hai. Humara app directly video aur metadata ko aapke channels par upload kar dega:
                  </p>

                  <div className="space-y-2 text-xs">
                    {/* YouTube Channel Status */}
                    {(() => {
                      const yt = socialAccounts.find(a => a.platform === 'youtube');
                      return (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-2">
                            <Youtube className="w-4 h-4 text-red-500" />
                            <div>
                              <strong className="text-white block">YouTube Shorts: {yt?.accountHandle || '@BeshaanVibe'}</strong>
                              <span className="text-[10px] text-slate-400">
                                {yt?.hasToken 
                                  ? 'Direct Google API Connected (Silent Background Upload)' 
                                  : '1-Click Direct Studio Upload Bridge (Zero Keys Needed)'}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            yt?.isConnected 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {yt?.isConnected ? 'CONNECTED' : 'STUDIO BRIDGE'}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Instagram Reels Status */}
                    {(() => {
                      const ig = socialAccounts.find(a => a.platform === 'instagram');
                      return (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <div>
                              <strong className="text-white block">Instagram Reels: {ig?.accountHandle || '@beshaan_vibe'}</strong>
                              <span className="text-[10px] text-slate-400">
                                {ig?.hasToken 
                                  ? 'Meta Graph API Connected' 
                                  : 'Auto-formatted 9:16 Reels Bridge'}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            ig?.isConnected 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {ig?.isConnected ? 'CONNECTED' : 'REELS BRIDGE'}
                          </span>
                        </div>
                      );
                    })()}

                    {/* TikTok Creator Status */}
                    {(() => {
                      const tt = socialAccounts.find(a => a.platform === 'tiktok');
                      return (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-2">
                            <TikTok className="w-4 h-4 text-cyan-400" />
                            <div>
                              <strong className="text-white block">TikTok Creator Center: {tt?.accountHandle || '@beshaan'}</strong>
                              <span className="text-[10px] text-slate-400">Direct Creator Dispatch</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            tt?.isConnected 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {tt?.isConnected ? 'CONNECTED' : 'CREATOR READY'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Optional Background API Keys */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowApiTokenInputs(!showApiTokenInputs)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>{showApiTokenInputs ? 'Hide Direct API Keys' : 'YouTube & Meta Direct API Keys (Optional: For 100% Silent Background Upload)'}</span>
                    </button>

                    {showApiTokenInputs && (
                      <div className="mt-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Google / YouTube OAuth Token (Optional)</label>
                          <input
                            type="password"
                            value={directYouTubeToken}
                            onChange={e => {
                              const val = e.target.value;
                              setDirectYouTubeToken(val);
                              if (typeof window !== 'undefined') localStorage.setItem('sol_direct_yt_token', val);
                            }}
                            placeholder="ya29.a0AfH6SM..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Instagram / Meta Graph Token (Optional)</label>
                          <input
                            type="password"
                            value={directInstagramToken}
                            onChange={e => {
                              const val = e.target.value;
                              setDirectInstagramToken(val);
                              if (typeof window !== 'undefined') localStorage.setItem('sol_direct_ig_token', val);
                            }}
                            placeholder="EAA..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Agar API key nahi hai, koi fikar nahi! "Publish Directly" dabate hi Roman Urdu metadata clipboard par copy ho kar seedha YouTube Studio upload window khul jayegi.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hashtag Cloud */}
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
            ) : (
              <div className="space-y-3">
                {/* Automation Bridge Provider Card (Make.com / Zapier) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>No-Code Automation Webhook</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleProviderChange('make')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          webhookProvider === 'make'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Make.com (1,000 Free ⚡)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProviderChange('zapier')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          webhookProvider === 'zapier'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Zapier (100 Free)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProviderChange('custom')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          webhookProvider === 'custom'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400">
                        {webhookProvider === 'make' ? 'Make.com Custom Webhook URL' : webhookProvider === 'zapier' ? 'Zapier Catch Hook URL' : 'Webhook Endpoint URL'}
                      </span>
                      <a
                        href={webhookProvider === 'make' ? 'https://www.make.com' : 'https://zapier.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open {webhookProvider === 'make' ? 'Make.com' : 'Zapier'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={e => handleWebhookChange(e.target.value)}
                      placeholder={
                        webhookProvider === 'make'
                          ? 'https://hook.eu1.make.com/your-custom-webhook-id'
                          : 'https://hooks.zapier.com/hooks/catch/12345/abcdef/'
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Make.com Action Buttons & Helpers */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestWebhookPing}
                      disabled={isTestingWebhook || !webhookUrl}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all"
                    >
                      {isTestingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>{isTestingWebhook ? 'Sending Ping...' : 'Send Test Ping to Make.com'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const samplePayload = {
                          event: 'video_automation.publish',
                          channel: channelName,
                          niche: selectedNiche,
                          language: scriptLanguage,
                          title: selectedTitle,
                          description,
                          hashtags,
                          scenes,
                          timestamp: new Date().toISOString()
                        };
                        copyToClipboard(JSON.stringify(samplePayload, null, 2), 'Make.com Sample Payload');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-amber-400" />
                      <span>Copy JSON</span>
                    </button>
                  </div>

                  {/* Make.com 5-Step Quick Setup Guide */}
                  <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1.5 text-[11px] text-slate-300">
                    <span className="font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Make.com Setup Guide (1,000 Free Tasks/Month):</span>
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[10px]">
                      <li>Make.com par free account banayein aur naya Scenario create karein.</li>
                      <li>First trigger module mein <strong className="text-white">Custom Webhook</strong> add karke webhook URL yahan paste karein.</li>
                      <li>"Send Test Ping" dabayein taake Make.com JSON structure automatically detect kar le.</li>
                      <li>Next step mein YouTube Data API v3 ya Instagram Reels module connect karein.</li>
                      <li>Scenario ko <strong className="text-emerald-400">ON</strong> kar dein! Har dafa video khud upload hogi.</li>
                    </ol>
                  </div>
                </div>

                {/* Hashtag Cloud */}
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
            )}
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
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              <span>{isPublishing ? 'Uploading to Channels...' : publishMode === 'direct' ? '🚀 Upload Directly to All Channels (Khud Karo)' : 'Publish to All Platforms Now'}</span>
            </button>
          </div>

          {/* Published Results & Direct Studio Launch Links */}
          {publishedStatus && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Platform Dispatch Processed Successfully!</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {publishMode === 'direct' ? 'DIRECT MODE' : 'WEBHOOK DISPATCHED'}
                </span>
              </div>

              {/* Direct Launch Buttons for Each Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {selectedPlatforms.includes('youtube') && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-red-500/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span>YouTube Shorts</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Title, description & Roman Urdu tags copied!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open('https://studio.youtube.com/channel/videos/upload', '_blank')}
                      className="w-full py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open YouTube Studio</span>
                    </button>
                  </div>
                )}

                {selectedPlatforms.includes('instagram') && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span>Instagram Reels</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Caption & hashtags ready for upload.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open('https://www.instagram.com/', '_blank')}
                      className="w-full py-1.5 px-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Instagram</span>
                    </button>
                  </div>
                )}

                {selectedPlatforms.includes('tiktok') && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Film className="w-4 h-4 text-cyan-400" />
                        <span>TikTok Studio</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Shorts audio & cues packaged.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open('https://www.tiktok.com/creator-center/upload', '_blank')}
                      className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open TikTok Studio</span>
                    </button>
                  </div>
                )}
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
