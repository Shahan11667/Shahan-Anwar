'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Copy,
  Trash2,
  Download,
  Plus,
  Type,
  Music,
  Image as ImageIcon,
  Sparkles,
  Film,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  Monitor,
  Square,
  Sparkle,
  Zap,
  Palette,
  Eye,
  Sliders,
  Activity,
  Layers,
  Camera,
  FileText,
  Volume2,
  VolumeX,
  MessageSquare,
  Users,
  ShieldCheck,
  Globe,
  Wand2,
  FastForward,
  CornerDownRight,
  Crosshair,
  Gauge,
  Maximize2,
  Compass,
  Check,
  Search,
  Radio,
  Upload,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PuterAuthBadge from '@/components/puter-auth-badge';

// =========================================================================
// TYPES & PRESETS
// =========================================================================

export type AspectRatioType = '9:16' | '16:9' | '1:1' | '4:5' | '21:9';

export interface AspectConfig {
  id: AspectRatioType;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  icon: typeof Smartphone;
}

export const ASPECT_RATIOS: AspectConfig[] = [
  { id: '16:9', label: '16:9 Landscape', sublabel: 'YouTube, Desktop Cinema', width: 1280, height: 720, icon: Monitor },
  { id: '9:16', label: '9:16 Vertical', sublabel: 'Shorts, Reels, TikTok', width: 720, height: 1280, icon: Smartphone },
  { id: '1:1', label: '1:1 Square', sublabel: 'Instagram Posts', width: 1080, height: 1080, icon: Square },
  { id: '4:5', label: '4:5 Portrait', sublabel: 'IG Feed & Ads', width: 864, height: 1080, icon: Smartphone },
  { id: '21:9', label: '21:9 Cinematic', sublabel: 'Anamorphic Ultrawide', width: 1680, height: 720, icon: Monitor }
];

// Log & RAW Camera Profiles (Color Space Transforms - CST)
export interface LogProfile {
  id: string;
  name: string;
  camera: string;
  gamma: string;
  lutCurve: string;
  desc: string;
}

export const CAMERA_LOG_PROFILES: LogProfile[] = [
  { id: 'rec709', name: 'Rec.709 Standard', camera: 'Standard HD', gamma: '2.4 Gamma', lutCurve: 'none', desc: 'Standard broadcast color space' },
  { id: 'slog3', name: 'Sony S-Log3 / S-Gamut3', camera: 'Sony FX3 / A7S III / FX6', gamma: 'S-Log3 to Rec.709', lutCurve: 'contrast(135%) saturate(125%) brightness(105%)', desc: '14+ stops high dynamic range conversion' },
  { id: 'applelog', name: 'Apple Log (ProRes)', camera: 'iPhone 15/16 Pro', gamma: 'Apple Log to Rec.709', lutCurve: 'contrast(130%) saturate(120%) brightness(108%) sepia(5%)', desc: 'Apple ProRes Log natural skin-tone mapping' },
  { id: 'clog2', name: 'Canon C-Log2 / Cinema', camera: 'Canon C70 / C300 / R5C', gamma: 'Canon Log2 to Wide DR', lutCurve: 'contrast(128%) saturate(130%) brightness(102%)', desc: 'Rich organic Canon highlight roll-off' },
  { id: 'bmd5', name: 'Blackmagic Film Gen 5', camera: 'BMPCC 4K/6K / URSA', gamma: 'Gen 5 to Extended Video', lutCurve: 'contrast(132%) saturate(128%) brightness(104%)', desc: 'Deep color fidelity with gentle shadows' },
  { id: 'arri', name: 'ARRI LogC3 / LogC4', camera: 'ARRI Alexa Mini / 35', gamma: 'ARRI LogC to Rec.709', lutCurve: 'contrast(125%) saturate(115%) brightness(106%)', desc: 'Hollywood gold standard cinematic response' }
];

// Timeline Clip Types
export interface VideoClip {
  id: string;
  track: 'video';
  title: string;
  start: number; // timeline seconds
  duration: number; // seconds
  sourceUrl?: string;
  thumbnailUrl?: string;
  isVideoElement?: boolean;
  color: string;
  speed: number;
  zoom: number;
  pan: { x: number; y: number };
  angleId?: number; // 1 to 4 for multicam
}

export interface TranscriptSentence {
  id: string;
  start: number;
  duration: number;
  speaker: string;
  text: string;
  active: boolean;
}

export interface ReviewComment {
  id: string;
  timestamp: number;
  author: string;
  avatar: string;
  text: string;
  status: 'approved' | 'revision' | 'in_review';
  date: string;
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  date: string;
  clipCount: number;
}

// Initial Sample Timeline Project
const INITIAL_VIDEO_CLIPS: VideoClip[] = [
  {
    id: 'v1',
    track: 'video',
    title: 'Cam A: Studio Master Wide',
    start: 0,
    duration: 6,
    color: '#3B82F6',
    speed: 1,
    zoom: 1.05,
    pan: { x: 0, y: 0 },
    angleId: 1,
    sourceUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&fit=crop'
  },
  {
    id: 'v2',
    track: 'video',
    title: 'Cam B: Close-Up Interview',
    start: 6,
    duration: 8,
    color: '#8B5CF6',
    speed: 1,
    zoom: 1.15,
    pan: { x: -5, y: 0 },
    angleId: 2,
    sourceUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&fit=crop'
  },
  {
    id: 'v3',
    track: 'video',
    title: 'Cam C: B-Roll Product Macro',
    start: 14,
    duration: 9,
    color: '#EC4899',
    speed: 1,
    zoom: 1.25,
    pan: { x: 5, y: -5 },
    angleId: 3,
    sourceUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&fit=crop'
  },
  {
    id: 'v4',
    track: 'video',
    title: 'Cam D: Over-Shoulder Action',
    start: 23,
    duration: 7,
    color: '#10B981',
    speed: 1,
    zoom: 1.1,
    pan: { x: 0, y: 0 },
    angleId: 4,
    sourceUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&fit=crop'
  }
];

const INITIAL_TRANSCRIPT: TranscriptSentence[] = [
  { id: 's1', start: 0, duration: 3, speaker: 'Host', text: 'Welcome back to the studio. Today we are breaking down industry-standard video editing.', active: true },
  { id: 's2', start: 3, duration: 3, speaker: 'Host', text: 'Tools like Premiere Pro and DaVinci Resolve give professionals complete creative freedom.', active: true },
  { id: 's3', start: 6, duration: 4, speaker: 'Director', text: 'Non-linear editing lets you splice and rearrange footage without altering your master source files.', active: true },
  { id: 's4', start: 10, duration: 4, speaker: 'Director', text: 'With text-based editing, you can cut video simply by deleting sentences from the transcript.', active: true },
  { id: 's5', start: 14, duration: 4.5, speaker: 'Colorist', text: 'Professional waveform and vectorscope monitors guarantee accurate broadcast legal exposure.', active: true },
  { id: 's6', start: 18.5, duration: 4.5, speaker: 'Colorist', text: 'And direct Log transformations restore full dynamic range from Sony, Canon, and Apple Log.', active: true },
  { id: 's7', start: 23, duration: 3.5, speaker: 'Sound Eng', text: 'Submixes, audio ducking, and AI voice clarity polish your dialogue to perfection.', active: true },
  { id: 's8', start: 26.5, duration: 3.5, speaker: 'Host', text: 'Let us dive straight into the timeline and begin our master edit.', active: true }
];

const ROMAN_URDU_TRANSCRIPT: Record<string, string> = {
  s1: 'Studio me aap sab ka welcome hai! Aaj hum professional video editing seekhenge.',
  s2: 'Premiere Pro aur DaVinci Resolve jaise tools creators ko poori azaadi dete hain.',
  s3: 'Non-linear editing se aap original footage ko kharab kiye baghair cuts laga sakte hain.',
  s4: 'Text-based editing me aap transcript se sentence delete karke video direct cut kar sakte hain.',
  s5: 'Professional waveform aur vectorscopes perfect broadcast colors guarantee karte hain.',
  s6: 'Sony aur Canon Log transforms se full dynamic range restore ho jati hai.',
  s7: 'Submixes aur AI audio ducking se dialogue crystal-clear sunai deta hai.',
  s8: 'Chalein timeline me chalte hain aur master edit shuru karte hain.'
};

const URDU_SCRIPT_TRANSCRIPT: Record<string, string> = {
  s1: 'اسٹوڈیو میں خوش آمدید! آج ہم پروفیشنل ویڈیو ایڈیٹنگ سیکھیں گے۔',
  s2: 'پریمیئر پرو اور ڈی ونچی جیسے ٹولز کریئیٹرز کو مکمل آزادی دیتے ہیں۔',
  s3: 'نان لینیر ایڈیٹنگ سے آپ ماسٹر فائلز کو چھیڑے بغیر کٹس لگا سکتے ہیں۔',
  s4: 'ٹیکسٹ بیسڈ ایڈیٹنگ میں آپ ٹرانسکرپٹ سے جملے ہٹا کر ویڈیو کٹ کر سکتے ہیں۔',
  s5: 'پروفیشنل اسکوپس بہترین کلر بیلنس کی ضمانت دیتے ہیں۔',
  s6: 'لاگ ٹرانسفارمز مکمل ڈائنامک رینج بحال کر دیتے ہیں۔',
  s7: 'آڈیو ڈکنگ اور اے آئی کلیئرٹی سے آواز صاف رہتی ہے۔',
  s8: 'آئیے ٹائم لائن میں چلتے ہیں اور ایڈیٹنگ شروع کرتے ہیں۔'
};

const INITIAL_REVIEW_COMMENTS: ReviewComment[] = [
  { id: 'c1', timestamp: 3.5, author: 'Alex Reed (Lead Client)', avatar: 'AR', text: 'Can we tighten the cut here by about 0.5s before the close-up starts?', status: 'revision', date: 'Today 10:14 AM' },
  { id: 'c2', timestamp: 14.2, author: 'Sarah Jenkins (Producer)', avatar: 'SJ', text: 'Love the color grade on this shot! The Rec.709 transform looks clean.', status: 'approved', date: 'Today 10:25 AM' },
  { id: 'c3', timestamp: 24.0, author: 'Michael Chen (Sound Lead)', avatar: 'MC', text: 'Applied -14dB audio ducking here so background music leaves room for the voiceover.', status: 'in_review', date: 'Today 10:40 AM' }
];

export interface VideoEditorStudioProps {
  initialFile?: File | null;
  initialVideoUrl?: string | null;
}

export default function VideoEditorStudio({ initialFile, initialVideoUrl }: VideoEditorStudioProps = {}) {
  // Master Studio Mode Tabs
  const [studioMode, setStudioMode] = useState<'edit' | 'transcript' | 'color' | 'audio' | 'review' | 'export'>('edit');

  // Timeline & Playback
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [totalDuration, setTotalDuration] = useState<number>(30);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(24); // px per sec
  const [selectedClipId, setSelectedClipId] = useState<string | null>('v1');

  // Three-Point Editing State
  const [sourceInPoint, setSourceInPoint] = useState<number | null>(1.5);
  const [sourceOutPoint, setSourceOutPoint] = useState<number | null>(5.5);

  // Multicam Angle State (1 to 4)
  const [activeMulticamAngle, setActiveMulticamAngle] = useState<number>(1);
  const [isMulticamView, setIsMulticamView] = useState<boolean>(false);

  // Proxy Workflow State
  const [isProxyEnabled, setIsProxyEnabled] = useState<boolean>(false);

  // Color & Scopes State
  const [selectedLogProfile, setSelectedLogProfile] = useState<string>('rec709');
  const [scopeType, setScopeType] = useState<'waveform' | 'vectorscope' | 'histogram'>('waveform');
  const [aiMaskMode, setAiMaskMode] = useState<'none' | 'bokeh' | 'spotlight' | 'colorpop' | 'vignette'>('none');
  const [stabilizerAmount, setStabilizerAmount] = useState<number>(0); // 0 to 100%

  // Audio Engineering State
  const [dialogVolume, setDialogVolume] = useState<number>(0); // dB (-24 to +6)
  const [musicVolume, setMusicVolume] = useState<number>(-4);
  const [sfxVolume, setSfxVolume] = useState<number>(-2);
  const [masterVolume, setMasterVolume] = useState<number>(0);
  const [isAiDenoiseEnabled, setIsAiDenoiseEnabled] = useState<boolean>(true);
  const [isAudioDuckingEnabled, setIsAudioDuckingEnabled] = useState<boolean>(true);
  const [isMusicRemixActive, setIsMusicRemixActive] = useState<boolean>(true);

  // Text-Based Editing & Captions
  const [transcript, setTranscript] = useState<TranscriptSentence[]>(INITIAL_TRANSCRIPT);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Review & Collaboration State
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>(INITIAL_REVIEW_COMMENTS);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [projectSnapshots, setProjectSnapshots] = useState<ProjectSnapshot[]>([
    { id: 'snap1', name: 'v1.0 Assembly Cut', date: 'Nov 3, 9:00 AM', clipCount: 4 },
    { id: 'snap2', name: 'v1.1 Client Review Edit', date: 'Nov 3, 11:30 AM', clipCount: 4 }
  ]);

  // Video Clips State
  const [videoClips, setVideoClips] = useState<VideoClip[]>(INITIAL_VIDEO_CLIPS);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Canvas Refs
  const programCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastPlayTimeRef = useRef<number>(0);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const videoElementsMapRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingClip, setIsUploadingClip] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Active Aspect Ratio Spec
  const activeAspect = useMemo(() => {
    return ASPECT_RATIOS.find((a) => a.id === aspectRatio) || ASPECT_RATIOS[0];
  }, [aspectRatio]);

  // Active Camera Log CST
  const activeLog = useMemo(() => {
    return CAMERA_LOG_PROFILES.find((l) => l.id === selectedLogProfile) || CAMERA_LOG_PROFILES[0];
  }, [selectedLogProfile]);

  // Auto-import initialFile or initialVideoUrl if passed from parent page
  useEffect(() => {
    if (initialFile) {
      const blobUrl = URL.createObjectURL(initialFile);
      const vEl = document.createElement('video');
      vEl.preload = 'auto';
      vEl.src = blobUrl;
      vEl.muted = true;
      vEl.playsInline = true;

      vEl.onloadedmetadata = () => {
        const duration = Math.max(1, Math.round((vEl.duration || 10) * 10) / 10);
        if (vEl.videoHeight > vEl.videoWidth) setAspectRatio('9:16');
        videoElementsMapRef.current.set(blobUrl, vEl);

        const newClipId = `init_v_${Date.now()}`;
        setVideoClips([
          {
            id: newClipId,
            track: 'video',
            title: initialFile.name.replace(/\.[^/.]+$/, '').slice(0, 32),
            start: 0,
            duration,
            sourceUrl: blobUrl,
            thumbnailUrl: blobUrl,
            isVideoElement: true,
            color: '#6366F1',
            speed: 1,
            zoom: 1.0,
            pan: { x: 0, y: 0 },
            angleId: 1
          }
        ]);
        setTotalDuration(duration);
        setSelectedClipId(newClipId);
        setSourceInPoint(0);
        setSourceOutPoint(Math.min(duration, 5));
        setUploadFeedback(`Imported ${initialFile.name} (${duration}s) into timeline.`);
      };
    } else if (initialVideoUrl) {
      const vEl = document.createElement('video');
      vEl.preload = 'auto';
      vEl.src = initialVideoUrl;
      vEl.muted = true;
      vEl.playsInline = true;

      vEl.onloadedmetadata = () => {
        const duration = Math.max(1, Math.round((vEl.duration || 10) * 10) / 10);
        videoElementsMapRef.current.set(initialVideoUrl, vEl);

        const newClipId = `init_url_${Date.now()}`;
        setVideoClips([
          {
            id: newClipId,
            track: 'video',
            title: 'Imported Master Video',
            start: 0,
            duration,
            sourceUrl: initialVideoUrl,
            thumbnailUrl: initialVideoUrl,
            isVideoElement: true,
            color: '#6366F1',
            speed: 1,
            zoom: 1.0,
            pan: { x: 0, y: 0 },
            angleId: 1
          }
        ]);
        setTotalDuration(duration);
        setSelectedClipId(newClipId);
        setSourceInPoint(0);
        setSourceOutPoint(Math.min(duration, 5));
      };
    }
  }, [initialFile, initialVideoUrl]);

  // Preload Clip Images for Canvas
  useEffect(() => {
    videoClips.forEach((clip) => {
      if (clip.sourceUrl && !imageCacheRef.current.has(clip.sourceUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = clip.sourceUrl;
        img.onload = () => {
          imageCacheRef.current.set(clip.sourceUrl!, img);
        };
      }
    });
  }, [videoClips]);

  // Active Clip under Playhead
  const activeClip = useMemo(() => {
    return videoClips.find((c) => currentTime >= c.start && currentTime < c.start + c.duration) || videoClips[0];
  }, [videoClips, currentTime]);

  // Active Transcript Sentence under Playhead
  const currentSentence = useMemo(() => {
    return transcript.find((s) => s.active && currentTime >= s.start && currentTime < s.start + s.duration);
  }, [transcript, currentTime]);

  // Format Timecode (HH:MM:SS:FF)
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  // Render Video Frame on Program Monitor
  const renderProgramFrame = useCallback(
    (canvas: HTMLCanvasElement, timeSec: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      // 2. Render Active Clip
      const clip = videoClips.find((c) => timeSec >= c.start && timeSec < c.start + c.duration) || videoClips[0];
      const videoEl = clip?.sourceUrl ? videoElementsMapRef.current.get(clip.sourceUrl) : null;
      const img = clip?.sourceUrl ? imageCacheRef.current.get(clip.sourceUrl) : null;
      const drawable = (videoEl && videoEl.readyState >= 2) ? videoEl : img;

      if (clip && clip.sourceUrl && drawable) {
        ctx.save();

        // Apply Color Space Transform (CST) curve
        if (activeLog.lutCurve !== 'none') {
          ctx.filter = activeLog.lutCurve;
        }

        // Warp Stabilizer micro-crop simulation
        let cropFactor = 1.0;
        if (stabilizerAmount > 0) {
          cropFactor = 1.0 + (stabilizerAmount / 100) * 0.12; // 0-12% smooth zoom
        }

        // Ken Burns motion (for images) or natural playback sync
        const progressInClip = (timeSec - clip.start) / Math.max(0.1, clip.duration);
        const currentScale = (1.0 + (clip.zoom - 1.0) * progressInClip) * cropFactor;
        const panX = (clip.pan?.x || 0) * progressInClip * (w * 0.05);
        const panY = (clip.pan?.y || 0) * progressInClip * (h * 0.05);

        ctx.translate(w / 2 + panX, h / 2 + panY);
        ctx.scale(currentScale, currentScale);

        // Aspect fit cover
        const mediaWidth = (drawable as HTMLVideoElement).videoWidth || (drawable as HTMLImageElement).width || w;
        const mediaHeight = (drawable as HTMLVideoElement).videoHeight || (drawable as HTMLImageElement).height || h;
        const imgRatio = mediaWidth / Math.max(1, mediaHeight);
        const canvasRatio = w / h;
        let dw = w;
        let dh = h;
        if (imgRatio > canvasRatio) {
          dh = h;
          dw = h * imgRatio;
        } else {
          dw = w;
          dh = w / imgRatio;
        }

        ctx.drawImage(drawable as CanvasImageSource, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();

        // AI Object Masking Effects
        if (aiMaskMode !== 'none') {
          ctx.save();
          if (aiMaskMode === 'bokeh') {
            // Simulated depth blur around central subject
            const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.65);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          } else if (aiMaskMode === 'spotlight') {
            const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, h * 0.6);
            grad.addColorStop(0, 'rgba(255,255,255,0.18)');
            grad.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          } else if (aiMaskMode === 'vignette') {
            const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.85)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          }
          ctx.restore();
        }
      }

      // 3. Render Burned-In Dialogue Caption
      const sentence = transcript.find((s) => s.active && timeSec >= s.start && timeSec < s.start + s.duration);
      if (sentence) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        const capY = h - 70;
        ctx.roundRect(w * 0.1, capY - 24, w * 0.8, 50, 10);
        ctx.fill();

        ctx.fillStyle = '#FACC15';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayCaption = (selectedLanguage === 'roman_urdu' && ROMAN_URDU_TRANSCRIPT[sentence.id])
          ? ROMAN_URDU_TRANSCRIPT[sentence.id]
          : (selectedLanguage === 'ur' && URDU_SCRIPT_TRANSCRIPT[sentence.id])
          ? URDU_SCRIPT_TRANSCRIPT[sentence.id]
          : sentence.text;
        ctx.fillText(displayCaption, w / 2, capY);
        ctx.restore();
      }

      // 4. Proxy Mode Overlay Badge
      if (isProxyEnabled) {
        ctx.save();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.beginPath();
        ctx.roundRect(16, 16, 110, 26, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('⚡ PROXY 720p', 26, 33);
        ctx.restore();
      }

      // 5. Warp Stabilizer Badge
      if (stabilizerAmount > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.beginPath();
        ctx.roundRect(w - 150, 16, 134, 26, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`WARP STAB: ${stabilizerAmount}%`, w - 142, 33);
        ctx.restore();
      }
    },
    [videoClips, activeLog, stabilizerAmount, aiMaskMode, transcript, isProxyEnabled]
  );

  // Render Realtime Broadcast Scopes (Waveform / Vectorscope / Histogram)
  const renderScopes = useCallback(() => {
    const scopeCanvas = scopeCanvasRef.current;
    if (!scopeCanvas) return;
    const ctx = scopeCanvas.getContext('2d');
    if (!ctx) return;

    const w = scopeCanvas.width;
    const h = scopeCanvas.height;

    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, w, h);

    if (scopeType === 'waveform') {
      // 1. Draw Waveform Monitor (IRE 0 to 100)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      // IRE Grid lines
      [0.1, 0.3, 0.5, 0.7, 0.9].forEach((frac) => {
        const y = h * frac;
        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px monospace';
        const ire = Math.round((1 - frac) * 110);
        ctx.fillText(`${ire}`, 8, y + 3);
      });

      // Simulated Green/Cyan Luminance Trace
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 35; x < w - 10; x += 3) {
        const seed = Math.sin(x * 0.05 + currentTime * 2) * Math.cos(x * 0.02);
        const yVal = h * 0.55 + seed * (h * 0.28);
        if (x === 35) ctx.moveTo(x, yVal);
        else ctx.lineTo(x, yVal);
      }
      ctx.stroke();
    } else if (scopeType === 'vectorscope') {
      // 2. Vectorscope Circular Color Wheel & Skin-Tone Line
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Skin Tone Line (I-Bar at ~137 degrees)
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - radius * 0.75, cy - radius * 0.75);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.font = '9px sans-serif';
      ctx.fillText('SKIN TONE', cx - radius * 0.85, cy - radius * 0.8);

      // Chroma Cloud
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (radius * 0.6);
        ctx.fillRect(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 2, 2);
      }
    } else if (scopeType === 'histogram') {
      // 3. RGB Histogram
      const colors = ['#EF4444', '#10B981', '#3B82F6'];
      colors.forEach((col, cIdx) => {
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(20, h - 10);
        for (let x = 20; x < w - 20; x += 5) {
          const val = Math.sin((x + cIdx * 40) * 0.03 + currentTime) * 0.5 + 0.5;
          const y = (h - 15) - val * (h * 0.7);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w - 20, h - 10);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    }
  }, [scopeType, currentTime]);

  // Sync Video Elements with Current Playhead Time
  useEffect(() => {
    videoClips.forEach((clip) => {
      if (!clip.sourceUrl) return;
      const el = videoElementsMapRef.current.get(clip.sourceUrl);
      if (el) {
        if (currentTime >= clip.start && currentTime < clip.start + clip.duration) {
          const clipTime = (currentTime - clip.start) * (clip.speed || 1);
          if (Math.abs(el.currentTime - clipTime) > 0.25) {
            el.currentTime = clipTime;
          }
          if (isPlaying && el.paused) {
            el.play().catch(() => {});
          } else if (!isPlaying && !el.paused) {
            el.pause();
          }
        } else {
          if (!el.paused) el.pause();
        }
      }
    });
  }, [currentTime, isPlaying, videoClips]);

  // Main Realtime Animation Loop
  useEffect(() => {
    if (isPlaying) {
      lastPlayTimeRef.current = performance.now();
      const step = (now: number) => {
        const delta = (now - lastPlayTimeRef.current) / 1000;
        lastPlayTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
        animFrameRef.current = requestAnimationFrame(step);
      };
      animFrameRef.current = requestAnimationFrame(step);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Redraw Canvas on Frame Change
  useEffect(() => {
    if (programCanvasRef.current) {
      renderProgramFrame(programCanvasRef.current, currentTime);
    }
    renderScopes();
  }, [currentTime, renderProgramFrame, renderScopes]);

  // Handle Uploading Local Video / Audio / Footage Files
  const handleUploadLocalVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploadingClip(true);
    setUploadFeedback(`Importing ${file.name}...`);

    try {
      const blobUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(file.name);
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(file.name);

      if (isVideo) {
        // Create an invisible video element to inspect duration, width, height, and extract thumbnail
        const vEl = document.createElement('video');
        vEl.preload = 'auto';
        vEl.src = blobUrl;
        vEl.muted = true;
        vEl.playsInline = true;

        await new Promise<void>((resolve, reject) => {
          vEl.onloadedmetadata = () => resolve();
          vEl.onerror = () => reject(new Error('Failed to load video metadata. Format may not be supported by this browser.'));
          setTimeout(() => resolve(), 4000); // safety fallback
        });

        const duration = Math.max(1, Math.round((vEl.duration || 10) * 10) / 10);
        const vidWidth = vEl.videoWidth || 1280;
        const vidHeight = vEl.videoHeight || 720;

        // Auto-suggest aspect ratio based on uploaded footage
        if (vidHeight > vidWidth && aspectRatio !== '9:16') {
          setAspectRatio('9:16');
        } else if (vidWidth > vidHeight && aspectRatio !== '16:9') {
          setAspectRatio('16:9');
        }

        // Capture a clean thumbnail from the first second
        let thumbUrl = '';
        try {
          vEl.currentTime = Math.min(1.0, duration * 0.1);
          await new Promise<void>((r) => {
            vEl.onseeked = () => r();
            setTimeout(r, 600);
          });
          const snapCanvas = document.createElement('canvas');
          snapCanvas.width = 320;
          snapCanvas.height = Math.round((320 * vidHeight) / vidWidth);
          const snapCtx = snapCanvas.getContext('2d');
          if (snapCtx) {
            snapCtx.drawImage(vEl, 0, 0, snapCanvas.width, snapCanvas.height);
            thumbUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
          }
        } catch {
          // ignore thumbnail capture failures
        }

        // Cache video element for realtime canvas drawing
        videoElementsMapRef.current.set(blobUrl, vEl);

        const newClipId = `user_v_${Date.now()}`;
        const newClip: VideoClip = {
          id: newClipId,
          track: 'video',
          title: file.name.replace(/\.[^/.]+$/, '').slice(0, 32),
          start: 0,
          duration,
          sourceUrl: blobUrl,
          thumbnailUrl: thumbUrl || blobUrl,
          isVideoElement: true,
          color: '#6366F1',
          speed: 1,
          zoom: 1.0,
          pan: { x: 0, y: 0 },
          angleId: 1
        };

        // Replace default sample timeline with user's uploaded master footage
        setVideoClips([newClip]);
        setTotalDuration(duration);
        setCurrentTime(0);
        setSelectedClipId(newClipId);
        setSourceInPoint(0);
        setSourceOutPoint(Math.min(duration, 5));

        // Create initial matching transcript placeholder
        setTranscript([
          {
            id: `ts_${Date.now()}`,
            start: 0,
            duration,
            speaker: 'User Footage',
            text: `[Video: ${file.name}] Clip imported. Playhead scrub and text cuts active.`,
            active: true
          }
        ]);

        setUploadFeedback(`Successfully loaded "${file.name}" (${duration}s, ${vidWidth}x${vidHeight}) into timeline!`);
        setTimeout(() => setUploadFeedback(null), 5000);
      } else if (isAudio) {
        // Audio file upload
        const aEl = document.createElement('audio');
        aEl.src = blobUrl;
        await new Promise<void>((resolve) => {
          aEl.onloadedmetadata = () => resolve();
          setTimeout(resolve, 2000);
        });
        const duration = Math.max(1, Math.round(aEl.duration || 15));
        setUploadFeedback(`Loaded audio track "${file.name}" (${duration}s)!`);
        setTimeout(() => setUploadFeedback(null), 5000);
      } else {
        alert('Please select a valid video or audio file (MP4, MOV, WebM, AVI, MKV, MP3, WAV).');
      }
    } catch (err: any) {
      alert('Error importing file: ' + err.message);
    } finally {
      setIsUploadingClip(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Three-Point Editing Operations: Insert / Overwrite
  const handleThreePointInsert = () => {
    if (sourceInPoint === null || sourceOutPoint === null) return;
    const clipDur = Math.max(1, sourceOutPoint - sourceInPoint);
    const newClip: VideoClip = {
      id: `v_${Date.now()}`,
      track: 'video',
      title: `Inserted Source (${sourceInPoint.toFixed(1)}s-${sourceOutPoint.toFixed(1)}s)`,
      start: currentTime,
      duration: clipDur,
      color: '#06B6D4',
      speed: 1,
      zoom: 1.1,
      pan: { x: 0, y: 0 },
      sourceUrl: activeClip?.sourceUrl
    };

    // Ripple shift clips after playhead
    setVideoClips((prev) => {
      const shifted = prev.map((c) => (c.start >= currentTime ? { ...c, start: c.start + clipDur } : c));
      return [...shifted, newClip].sort((a, b) => a.start - b.start);
    });
    setTotalDuration((prev) => prev + clipDur);
  };

  const handleThreePointOverwrite = () => {
    if (sourceInPoint === null || sourceOutPoint === null) return;
    const clipDur = Math.max(1, sourceOutPoint - sourceInPoint);
    const newClip: VideoClip = {
      id: `v_${Date.now()}`,
      track: 'video',
      title: `Overwrite Source (${sourceInPoint.toFixed(1)}s-${sourceOutPoint.toFixed(1)}s)`,
      start: currentTime,
      duration: clipDur,
      color: '#F59E0B',
      speed: 1,
      zoom: 1.1,
      pan: { x: 0, y: 0 },
      sourceUrl: activeClip?.sourceUrl
    };
    setVideoClips((prev) => [...prev, newClip]);
  };

  // Text-Based Editing: Delete Sentence from Transcript and Ripple Delete from Video
  const handleDeleteTranscriptSentence = (sentenceId: string) => {
    const target = transcript.find((s) => s.id === sentenceId);
    if (!target) return;

    // Remove sentence
    setTranscript((prev) => prev.filter((s) => s.id !== sentenceId));

    // Ripple cut video timeline
    setVideoClips((prev) => {
      return prev
        .filter((c) => !(c.start >= target.start && c.start + c.duration <= target.start + target.duration))
        .map((c) => (c.start > target.start ? { ...c, start: Math.max(0, c.start - target.duration) } : c));
    });
    setTotalDuration((prev) => Math.max(5, prev - target.duration));
  };

  // Add Timecoded Review Comment
  const handleAddReviewComment = () => {
    if (!newCommentText.trim()) return;
    const newC: ReviewComment = {
      id: `rc_${Date.now()}`,
      timestamp: currentTime,
      author: 'Antigravity Studio Director',
      avatar: 'AD',
      text: newCommentText.trim(),
      status: 'in_review',
      date: 'Just Now'
    };
    setReviewComments((prev) => [newC, ...prev]);
    setNewCommentText('');
  };

  // Client-Side Video Rendering & Export
  const handleExportFullVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportedUrl(null);
    setIsPlaying(false);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = activeAspect.width;
      exportCanvas.height = activeAspect.height;

      const stream = exportCanvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
        ? 'video/webm; codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8500000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      const finishPromise = new Promise<string>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(URL.createObjectURL(blob));
        };
      });

      recorder.start();
      const fps = 30;
      const totalFrames = Math.round(totalDuration * fps);
      for (let f = 0; f < totalFrames; f++) {
        renderProgramFrame(exportCanvas, f / fps);
        setExportProgress(Math.round(((f + 1) / totalFrames) * 100));
        if (f % 6 === 0) await new Promise((r) => setTimeout(r, 4));
      }
      recorder.stop();

      const dlUrl = await finishPromise;
      setExportedUrl(dlUrl);
    } catch (e: any) {
      alert('Export failed: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[780px] bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Studio Header: DaVinci / Premiere Pro Navigation */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg">
            <Film className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                DaVinci & Premiere Studio Pro
                <Badge className="bg-gradient-to-r from-amber-500 to-red-500 text-white font-mono text-[9px] px-1.5 py-0 border-0">
                  NLE SUITE
                </Badge>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Three-Point Edit • Text-Based Edit • Multicam • Log CST • Fairlight Mixer • Frame.io Review
            </p>
          </div>
        </div>

        {/* Master Workspace Switcher Buttons (Like Premiere / DaVinci Tabs) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'edit', label: 'Edit (NLE)', icon: Film },
            { id: 'transcript', label: 'Text Edit', icon: FileText },
            { id: 'color', label: 'Color & Scopes', icon: Palette },
            { id: 'audio', label: 'Fairlight Audio', icon: Volume2 },
            { id: 'review', label: 'Review & Collab', icon: MessageSquare },
            { id: 'export', label: 'Deliver / Export', icon: Download }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSel = studioMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setStudioMode(mode.id as typeof studioMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Proxy Mode Toggle, Aspect Ratio, Upload Button & Puter AI */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input for Real Local Video/Audio Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            onChange={handleUploadLocalVideo}
            className="hidden"
          />

          {/* Prominent Upload Video / Footage Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingClip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50"
            title="Upload and edit your own local video or audio file"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{isUploadingClip ? 'Importing...' : 'Upload Video'}</span>
          </button>

          <PuterAuthBadge compact />

          {/* Proxy Workflow Switcher */}
          <button
            onClick={() => setIsProxyEnabled(!isProxyEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
              isProxyEnabled
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle between Original 4K and ProRes Proxy for 60fps smooth playback"
          >
            <Zap className={`h-3.5 w-3.5 ${isProxyEnabled ? 'text-emerald-400 fill-current' : ''}`} />
            <span>{isProxyEnabled ? 'PROXY ACTIVE' : 'USE PROXY'}</span>
          </button>

          {/* Aspect Ratio Switcher */}
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            {ASPECT_RATIOS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Feedback Toast Notification Banner */}
      {uploadFeedback && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-5 py-2 text-xs text-emerald-300 font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{uploadFeedback}</span>
          </div>
          <button
            onClick={() => setUploadFeedback(null)}
            className="text-emerald-400/70 hover:text-emerald-200 text-[11px]"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Center Workspace */}
      <div className="flex-1 flex min-h-0">
        {/* ========================================================================= */}
        {/* 1. EDIT MODE: Non-Linear Editing, Three-Point, Multicam & Dual Monitors    */}
        {/* ========================================================================= */}
        {studioMode === 'edit' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Monitors Row: Source Clip Monitor + Program Master Monitor */}
            <div className="h-[48%] flex border-b border-slate-800 bg-slate-950 p-2 gap-2">
              {/* Left: Source Monitor (Three-Point In/Out) */}
              <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-2 overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-cyan-400" /> Source Clip Monitor
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    <span>IN: {sourceInPoint ? `${sourceInPoint.toFixed(1)}s` : '--'}</span>
                    <span>OUT: {sourceOutPoint ? `${sourceOutPoint.toFixed(1)}s` : '--'}</span>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden relative my-1">
                  {activeClip?.isVideoElement && activeClip?.sourceUrl ? (
                    <video
                      src={activeClip.sourceUrl}
                      className="w-full h-full object-contain"
                      muted
                      playsInline
                    />
                  ) : activeClip?.sourceUrl ? (
                    <img
                      src={activeClip.thumbnailUrl || activeClip.sourceUrl}
                      alt="Source Monitor"
                      className="w-full h-full object-contain opacity-85"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-500 text-xs">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                      <span>No clip selected. Click "Upload Video" to load local footage.</span>
                    </div>
                  )}
                  {/* Three-Point In/Out Overlay Badges */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => setSourceInPoint(currentTime)}
                      className="h-6 text-[10px] bg-slate-800/90 text-cyan-300 border border-cyan-500/40 px-2"
                    >
                      Mark IN (I)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSourceOutPoint(currentTime)}
                      className="h-6 text-[10px] bg-slate-800/90 text-cyan-300 border border-cyan-500/40 px-2"
                    >
                      Mark OUT (O)
                    </Button>
                  </div>
                </div>

                {/* Three-Point Insertion Buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[10px] text-slate-500">Insert (,) or Overwrite (.) to timeline</span>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={handleThreePointInsert}
                      className="h-6 text-[11px] bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 font-bold"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Insert
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleThreePointOverwrite}
                      className="h-6 text-[11px] bg-amber-600 hover:bg-amber-500 text-white px-2.5 font-bold"
                    >
                      <CornerDownRight className="h-3 w-3 mr-1" /> Overwrite
                    </Button>
                  </div>
                </div>
              </div>

              {/* Center/Right: Program Monitor (Live Composition) OR Multicam Switcher */}
              <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-2 overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5 text-amber-400" /> Program Master Monitor
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMulticamView(!isMulticamView)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                        isMulticamView
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Camera className="h-3 w-3 inline mr-1" />
                      {isMulticamView ? 'MULTICAM 4-UP ON' : 'MULTICAM 4-UP'}
                    </button>
                    <span className="font-mono text-amber-400 font-bold text-xs">
                      {formatTimecode(currentTime)}
                    </span>
                  </div>
                </div>

                {/* Multicam 4-Quadrant Switcher vs Single Master Canvas */}
                {isMulticamView ? (
                  <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1.5 bg-black rounded-lg p-1.5 my-1">
                    {[1, 2, 3, 4].map((angle) => {
                      const isLive = activeMulticamAngle === angle;
                      return (
                        <div
                          key={angle}
                          onClick={() => setActiveMulticamAngle(angle)}
                          className={`relative rounded-md overflow-hidden bg-slate-900 border-2 cursor-pointer transition-all ${
                            isLive ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img
                            src={videoClips[(angle - 1) % videoClips.length]?.sourceUrl}
                            alt={`Camera Angle ${angle}`}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                            isLive ? 'bg-red-600 text-white animate-pulse' : 'bg-black/70 text-slate-300'
                          }`}>
                            CAM {angle} {isLive ? '• ON AIR' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden relative my-1">
                    <canvas
                      ref={programCanvasRef}
                      width={activeAspect.width}
                      height={activeAspect.height}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Playback Transport Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentTime((t) => Math.max(0, t - 1))}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Step back 1s"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-7 w-7 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setCurrentTime((t) => Math.min(totalDuration, t + 1))}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Step forward 1s"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {[0.5, 1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-1.5 py-0.5 rounded ${
                          playbackSpeed === spd ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Multi-Track Timeline (V1 Video, V2 Overlay, A1 Dialog, A2 Music, A3 SFX) */}
            <div className="flex-1 flex flex-col bg-slate-950 select-none overflow-hidden">
              {/* Timeline Toolbar */}
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800 bg-slate-900/60">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-6 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 shadow-sm"
                  >
                    <Upload className="h-3 w-3 mr-1" /> Import Footage
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Razor Split at playhead
                      const target = videoClips.find((c) => currentTime > c.start + 0.3 && currentTime < c.start + c.duration - 0.3);
                      if (!target) return;
                      const split = currentTime - target.start;
                      const first: VideoClip = { ...target, duration: split, title: `${target.title} (A)` };
                      const second: VideoClip = { ...target, id: `v_${Date.now()}`, start: currentTime, duration: target.duration - split, title: `${target.title} (B)` };
                      setVideoClips((prev) => prev.map((c) => (c.id === target.id ? first : c)).concat(second));
                    }}
                    className="h-6 text-[11px] border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                  >
                    <Scissors className="h-3 w-3 mr-1 text-amber-400" /> Razor Split (C)
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!selectedClipId) return;
                      setVideoClips((prev) => prev.filter((c) => c.id !== selectedClipId));
                      setSelectedClipId(null);
                    }}
                    className="h-6 text-[11px] border-slate-700 bg-slate-800/80 text-red-300 hover:bg-red-950"
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Ripple Delete
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <ZoomOut className="h-3 w-3" />
                    <input
                      type="range"
                      min="12"
                      max="40"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                      className="w-16 accent-indigo-500"
                    />
                    <ZoomIn className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Tracks Container */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left - 100;
                  if (clickX > 0) {
                    setCurrentTime(Math.max(0, Math.min(totalDuration, clickX / zoomLevel)));
                  }
                }}
                className="flex-1 overflow-x-auto overflow-y-auto relative bg-slate-950 p-2"
              >
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none"
                  style={{ left: `${100 + currentTime * zoomLevel}px` }}
                >
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full -ml-[4px] -mt-1 shadow-md shadow-amber-400/50" />
                </div>

                {/* Ruler */}
                <div
                  className="h-5 flex items-center border-b border-slate-800/80 ml-24 text-[9px] font-mono text-slate-400 relative"
                  style={{ width: `${totalDuration * zoomLevel}px` }}
                >
                  {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
                    <div key={sec} className="absolute border-l border-slate-800 pl-1" style={{ left: `${sec * zoomLevel}px` }}>
                      {sec % 5 === 0 ? `${sec}s` : ''}
                    </div>
                  ))}
                </div>

                {/* TRACK V1: Master Video */}
                <div className="flex items-center h-12 border-b border-slate-800/50 relative my-1">
                  <div className="w-24 flex-shrink-0 text-[11px] font-bold text-slate-400 flex items-center gap-1 px-2 font-mono">
                    <Film className="h-3 w-3 text-indigo-400" /> V1 Video
                  </div>
                  <div className="relative flex-1 h-full" style={{ width: `${totalDuration * zoomLevel}px` }}>
                    {videoClips.map((clip) => (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClipId(clip.id);
                          setCurrentTime(clip.start);
                        }}
                        className={`absolute top-1 bottom-1 rounded-md px-2 text-[11px] font-semibold flex items-center justify-between truncate cursor-pointer transition border ${
                          selectedClipId === clip.id
                            ? 'bg-indigo-600 text-white border-white shadow-lg'
                            : 'bg-indigo-950/80 text-indigo-200 border-indigo-800 hover:bg-indigo-900'
                        }`}
                        style={{
                          left: `${clip.start * zoomLevel}px`,
                          width: `${clip.duration * zoomLevel}px`
                        }}
                      >
                        <span className="truncate">{clip.title}</span>
                        <span className="text-[9px] opacity-75 font-mono">{clip.duration.toFixed(1)}s</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TRACK A1: Dialogue */}
                <div className="flex items-center h-9 border-b border-slate-800/40 relative my-0.5">
                  <div className="w-24 flex-shrink-0 text-[11px] font-bold text-slate-400 flex items-center gap-1 px-2 font-mono">
                    <Volume2 className="h-3 w-3 text-cyan-400" /> A1 Dialog
                  </div>
                  <div className="relative flex-1 h-full" style={{ width: `${totalDuration * zoomLevel}px` }}>
                    <div
                      className="absolute top-1 bottom-1 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-[10px] flex items-center px-2 truncate"
                      style={{ left: `0px`, width: `${totalDuration * zoomLevel}px` }}
                    >
                      🎙️ Dialogue Master Track (AI Noise Filter Active • Auto-Ducked)
                    </div>
                  </div>
                </div>

                {/* TRACK A2: Music */}
                <div className="flex items-center h-9 border-b border-slate-800/40 relative my-0.5">
                  <div className="w-24 flex-shrink-0 text-[11px] font-bold text-slate-400 flex items-center gap-1 px-2 font-mono">
                    <Music className="h-3 w-3 text-pink-400" /> A2 Music
                  </div>
                  <div className="relative flex-1 h-full" style={{ width: `${totalDuration * zoomLevel}px` }}>
                    <div
                      className="absolute top-1 bottom-1 rounded bg-pink-950/60 border border-pink-800 text-pink-300 text-[10px] flex items-center px-2 truncate"
                      style={{ left: `0px`, width: `${totalDuration * zoomLevel}px` }}
                    >
                      🎵 Cinematic Ambient BGM (Smart Retimed to {totalDuration}s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TEXT-BASED EDITING (Premiere Pro Style Transcript Splicing)            */}
        {/* ========================================================================= */}
        {studioMode === 'transcript' && (
          <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Text-Based Editing (Premiere Pro Style)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Edit your video simply by deleting or reordering text in the transcript below. The timeline will ripple-cut automatically.
                </p>
              </div>

              {/* Search transcript */}
              <div className="relative w-64">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search dialogue text..."
                  className="h-8 pl-8 text-xs bg-slate-900 border-slate-800"
                />
              </div>
            </div>

            {/* Transcript Sentence Blocks */}
            <div className="space-y-2 max-w-4xl mx-auto w-full">
              {transcript
                .filter((s) => !searchFilter || s.text.toLowerCase().includes(searchFilter.toLowerCase()))
                .map((sentence) => {
                  const isCurrent = currentTime >= sentence.start && currentTime < sentence.start + sentence.duration;
                  return (
                    <div
                      key={sentence.id}
                      onClick={() => setCurrentTime(sentence.start)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        isCurrent
                          ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300 font-bold">
                          {formatTimecode(sentence.start)}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            {sentence.speaker}
                          </span>
                          <p className="text-sm font-medium text-slate-200 leading-relaxed">
                            {sentence.text}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTranscriptSentence(sentence.id);
                          }}
                          className="h-7 text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/50"
                          title="Ripple delete video for this sentence"
                        >
                          <Scissors className="h-3.5 w-3.5 mr-1" /> Cut Out
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. COLOR & PROFESSIONAL SCOPES (DaVinci Resolve Style CST & Waveforms)    */}
        {/* ========================================================================= */}
        {studioMode === 'color' && (
          <div className="flex-1 flex p-4 gap-4 overflow-hidden">
            {/* Left: Program Monitor with Active Color Space */}
            <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Palette className="h-4 w-4 text-emerald-400" />
                  Color Grading & Color Space Transform (CST)
                </span>
                <span className="font-mono text-emerald-400 font-bold text-[11px]">
                  ACTIVE CST: {activeLog.name}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden my-2 relative">
                <canvas
                  ref={programCanvasRef}
                  width={activeAspect.width}
                  height={activeAspect.height}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Scopes Type Selector */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  {(['waveform', 'vectorscope', 'histogram'] as const).map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setScopeType(sc)}
                      className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded transition cursor-pointer ${
                        scopeType === sc ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">Warp Stabilizer:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stabilizerAmount}
                    onChange={(e) => setStabilizerAmount(parseInt(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="font-mono text-xs text-emerald-400 font-bold w-8">{stabilizerAmount}%</span>
                </div>
              </div>
            </div>

            {/* Right: Broadcast Scopes Canvas + Camera Log CST Picker */}
            <div className="w-80 flex flex-col gap-3 overflow-y-auto">
              {/* Broadcast Scopes Visualizer */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" /> Broadcast Scope Monitor
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">{scopeType}</span>
                </div>

                <div className="h-44 w-full bg-black rounded-lg overflow-hidden border border-slate-800">
                  <canvas ref={scopeCanvasRef} width={300} height={176} className="w-full h-full" />
                </div>
              </div>

              {/* Log & RAW Camera Profile Transform (CST) */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Log & RAW Camera Profiles (CST)
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {CAMERA_LOG_PROFILES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLogProfile(l.id)}
                      className={`w-full p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                        selectedLogProfile === l.id
                          ? 'border-emerald-500 bg-emerald-950/40 text-white font-bold ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{l.name}</span>
                        {selectedLogProfile === l.id && <Check className="h-3 w-3 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Object Masking & Depth */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">
                  AI Object Masking & Isolation
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'none', label: 'None (Full Frame)' },
                    { id: 'bokeh', label: 'Cinematic Bokeh' },
                    { id: 'spotlight', label: 'Subject Spotlight' },
                    { id: 'vignette', label: 'Vignette Focus' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAiMaskMode(m.id as typeof aiMaskMode)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer text-center ${
                        aiMaskMode === m.id
                          ? 'border-violet-500 bg-violet-950/40 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. FAIRLIGHT AUDIO ENGINEERING & SUBMIXES                                 */}
        {/* ========================================================================= */}
        {studioMode === 'audio' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-cyan-400" />
                Fairlight Multi-Track Mixing & Audio Submixes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Group audio tracks, apply automatic dialogue ducking, and run one-click AI speech enhancement.
              </p>
            </div>

            {/* Smart Processing Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">AI Voice Clarity</span>
                  <input
                    type="checkbox"
                    checked={isAiDenoiseEnabled}
                    onChange={(e) => setIsAiDenoiseEnabled(e.target.checked)}
                    className="accent-cyan-500 h-4 w-4"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Removes HVAC background hum, room echo, and auto-levels vocal peaks.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Auto Audio Ducking</span>
                  <input
                    type="checkbox"
                    checked={isAudioDuckingEnabled}
                    onChange={(e) => setIsAudioDuckingEnabled(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Automatically attenuates music by -14dB when spoken dialogue is detected.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Smart Music Retime</span>
                  <input
                    type="checkbox"
                    checked={isMusicRemixActive}
                    onChange={(e) => setIsMusicRemixActive(e.target.checked)}
                    className="accent-indigo-500 h-4 w-4"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Seamlessly loops BGM to match sequence duration ({totalDuration}s) without hard cutoffs.
                </p>
              </div>
            </div>

            {/* Fairlight Channel Faders Mixer */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono block">
                Channel Strips & Submix Faders (dB)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { name: 'A1 Dialogue', val: dialogVolume, set: setDialogVolume, color: 'accent-cyan-500' },
                  { name: 'A2 Music', val: musicVolume, set: setMusicVolume, color: 'accent-pink-500' },
                  { name: 'A3 SFX', val: sfxVolume, set: setSfxVolume, color: 'accent-amber-500' },
                  { name: 'Master Out', val: masterVolume, set: setMasterVolume, color: 'accent-emerald-500' }
                ].map((strip) => (
                  <div key={strip.name} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <span className="text-xs font-bold text-slate-200 block">{strip.name}</span>
                    <input
                      type="range"
                      min="-24"
                      max="6"
                      value={strip.val}
                      onChange={(e) => strip.set(parseInt(e.target.value))}
                      className={`w-full ${strip.color}`}
                    />
                    <div className="font-mono text-xs font-bold text-slate-300">
                      {strip.val > 0 ? `+${strip.val}` : strip.val} dB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. REVIEW & COLLABORATION (Frame.io Timecoded Feedback & Versioning)     */}
        {/* ========================================================================= */}
        {studioMode === 'review' && (
          <div className="flex-1 flex p-5 gap-6 overflow-hidden max-w-5xl mx-auto w-full">
            {/* Left: Frame.io Timecoded Review Feed */}
            <div className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 overflow-hidden">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  In-App Review & Approval (Frame.io Style)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client and stakeholder notes linked directly to timeline timecodes.
                </p>
              </div>

              {/* Add Comment Box at current playhead */}
              <div className="flex gap-2">
                <Input
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`Add review note at ${formatTimecode(currentTime)}...`}
                  className="text-xs bg-slate-950 border-slate-800"
                />
                <Button
                  onClick={handleAddReviewComment}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0"
                >
                  Pin Note
                </Button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {reviewComments.map((comment) => (
                  <div
                    key={comment.id}
                    onClick={() => setCurrentTime(comment.timestamp)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white">
                          {comment.avatar}
                        </span>
                        <span className="text-xs font-bold text-white">{comment.author}</span>
                      </div>
                      <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                        {formatTimecode(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-7">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Version Control & Project History */}
            <div className="w-72 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Version Control
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    const snap: ProjectSnapshot = {
                      id: `snap_${Date.now()}`,
                      name: `v${projectSnapshots.length + 1}.0 Revision`,
                      date: 'Just Now',
                      clipCount: videoClips.length
                    };
                    setProjectSnapshots([snap, ...projectSnapshots]);
                  }}
                  className="h-6 text-[10px] bg-slate-800 text-slate-200"
                >
                  Save Snapshot
                </Button>
              </div>

              <div className="space-y-2">
                {projectSnapshots.map((snap) => (
                  <div key={snap.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950 space-y-1 text-xs">
                    <div className="font-bold text-slate-200">{snap.name}</div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{snap.date}</span>
                      <span>{snap.clipCount} clips</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. DELIVER / EXPORT & TRANSLATION                                         */}
        {/* ========================================================================= */}
        {studioMode === 'export' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-2xl mx-auto w-full">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-pink-400" />
                Master Delivery & Multi-Language Burn-In
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Client-side ProRes WebM render with burned-in subtitles and proxy-relink.
              </p>
            </div>

            {/* Language Burn-In Selector */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" /> Burn-In Subtitle Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="roman_urdu">🇵🇰 Roman Urdu (رومن اردو)</option>
                <option value="ur">🇵🇰 Urdu Script (اردو رسم الخط)</option>
                <option value="en">English (Master Original)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="zh">Chinese (中文)</option>
                <option value="ar">Arabic (العربية)</option>
              </select>
            </div>

            {/* Render Progress Card */}
            {isExporting ? (
              <div className="p-5 rounded-2xl border border-indigo-800 bg-indigo-950/40 text-center space-y-3">
                <Sparkles className="h-8 w-8 text-indigo-400 mx-auto animate-spin" />
                <div className="font-bold text-sm text-white">Rendering Master Timeline...</div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-indigo-300">{exportProgress}% Complete</div>
              </div>
            ) : exportedUrl ? (
              <div className="p-5 rounded-2xl border border-emerald-800 bg-emerald-950/40 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-sm text-white">Master Export Ready!</div>
                <a
                  href={exportedUrl}
                  download={`master-render-${Date.now()}.webm`}
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                >
                  <Download className="h-4 w-4 mr-2" /> Download Master Video File
                </a>
              </div>
            ) : (
              <Button
                onClick={handleExportFullVideo}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 text-white font-bold text-sm shadow-xl"
              >
                <Zap className="h-4 w-4 mr-2 fill-current" /> Start High-Bitrate Master Render
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
