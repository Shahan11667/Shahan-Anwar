'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Download, 
  Share2, 
  Users, 
  Sparkles, 
  Disc, 
  Radio, 
  RotateCcw, 
  Layers, 
  Copy, 
  Check, 
  Headphones, 
  Activity, 
  Send,
  Zap,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface DrumVoice {
  name: string;
  steps: boolean[];
}

interface SynthKey {
  note: string;
  freq: number;
  isBlack: boolean;
  char: string;
}

const PIANO_KEYS: SynthKey[] = [
  { note: 'C3', freq: 130.81, isBlack: false, char: 'A' },
  { note: 'C#3', freq: 138.59, isBlack: true, char: 'W' },
  { note: 'D3', freq: 146.83, isBlack: false, char: 'S' },
  { note: 'D#3', freq: 155.56, isBlack: true, char: 'E' },
  { note: 'E3', freq: 164.81, isBlack: false, char: 'D' },
  { note: 'F3', freq: 174.61, isBlack: false, char: 'F' },
  { note: 'F#3', freq: 185.00, isBlack: true, char: 'T' },
  { note: 'G3', freq: 196.00, isBlack: false, char: 'G' },
  { note: 'G#3', freq: 207.65, isBlack: true, char: 'Y' },
  { note: 'A3', freq: 220.00, isBlack: false, char: 'H' },
  { note: 'A#3', freq: 233.08, isBlack: true, char: 'U' },
  { note: 'B3', freq: 246.94, isBlack: false, char: 'J' },
  { note: 'C4', freq: 261.63, isBlack: false, char: 'K' },
  { note: 'C#4', freq: 277.18, isBlack: true, char: 'O' },
  { note: 'D4', freq: 293.66, isBlack: false, char: 'L' },
];

const PRESETS = {
  trap: {
    name: 'Trap / Hip-Hop',
    bpm: 140,
    drums: [
      [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-Hat
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Clap
    ],
  },
  house: {
    name: 'House / EDM',
    bpm: 124,
    drums: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick 4-on-floor
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Off-beat Hat
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Clap
    ],
  },
  lofi: {
    name: 'Lo-Fi Chill',
    bpm: 82,
    drums: [
      [true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // Hi-Hat
      [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false], // Rim
    ],
  },
};

export default function MusicStudioTool() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(124);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [latencyCompensation, setLatencyCompensation] = useState<number>(12); // ms
  const [activeTab, setActiveTab] = useState<'sequencer' | 'synth' | 'mixer' | 'session'>('sequencer');

  // Multi-Track State
  const [trackVolumes, setTrackVolumes] = useState<{ drums: number; bass: number; lead: number; vocals: number }>({
    drums: 85,
    bass: 80,
    lead: 75,
    vocals: 90,
  });
  const [trackMutes, setTrackMutes] = useState<{ drums: boolean; bass: boolean; lead: boolean; vocals: boolean }>({
    drums: false,
    bass: false,
    lead: false,
    vocals: false,
  });

  // DRUM SEQUENCER MATRIX (4 Voices x 16 Steps)
  const [drumGrid, setDrumGrid] = useState<boolean[][]>(PRESETS.house.drums);

  // SYNTH CONFIG
  const [synthWaveform, setSynthWaveform] = useState<OscillatorType>('sawtooth');
  const [synthFilterCutoff, setSynthFilterCutoff] = useState<number>(2400);
  const [synthAttack, setSynthAttack] = useState<number>(0.02);
  const [synthRelease, setSynthRelease] = useState<number>(0.3);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  // MIC RECORDING
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [vocalAudioUrl, setVocalAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // VIRTUAL SESSIONWIRE COLLABORATION ROOM
  const [roomCode, setRoomCode] = useState<string>('JAM-808');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'StudioHost (You)', text: 'Started session in room JAM-808 @ 124 BPM.', time: 'Just now' },
    { sender: 'Marcus (Guitarist)', text: 'Connected with 4.8ms audio roundtrip latency. Ready on Track 4!', time: '1m ago' },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Audio Context & Visualizer Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Audio Engine
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx({ latencyHint: 'interactive' });
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 64;
      analyser.connect(audioCtxRef.current.destination);
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Sound Synthesizers for Drums (Zero Sample Lag)
  const playKick = (ctx: AudioContext, time: number) => {
    if (trackMutes.drums) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const masterGain = ctx.createGain();
    masterGain.gain.value = trackVolumes.drums / 100;

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(gain);
    gain.connect(masterGain);
    if (analyserRef.current) masterGain.connect(analyserRef.current);
    else masterGain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.4);
  };

  const playSnare = (ctx: AudioContext, time: number) => {
    if (trackMutes.drums) return;
    // White noise buffer for snare snap
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7 * (trackVolumes.drums / 100), time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    if (analyserRef.current) gain.connect(analyserRef.current);
    else gain.connect(ctx.destination);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.15);
  };

  const playHiHat = (ctx: AudioContext, time: number) => {
    if (trackMutes.drums) return;
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4 * (trackVolumes.drums / 100), time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    if (analyserRef.current) gain.connect(analyserRef.current);
    else gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.05);
  };

  const playClap = (ctx: AudioContext, time: number) => {
    if (trackMutes.drums) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, time);

    gain.gain.setValueAtTime(0.8 * (trackVolumes.drums / 100), time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(gain);
    if (analyserRef.current) gain.connect(analyserRef.current);
    else gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  };

  // Play Step
  const triggerStepSounds = (step: number) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (drumGrid[0][step]) playKick(ctx, now);
    if (drumGrid[1][step]) playSnare(ctx, now);
    if (drumGrid[2][step]) playHiHat(ctx, now);
    if (drumGrid[3][step]) playClap(ctx, now);
  };

  // Playback Sequencer Loop
  useEffect(() => {
    if (!isPlaying) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      return;
    }

    const stepDurationMs = (60 / bpm / 4) * 1000; // 16th note in ms
    stepTimerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = (prev + 1) % 16;
        triggerStepSounds(next);
        return next;
      });
    }, stepDurationMs);

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isPlaying, bpm, drumGrid, trackVolumes, trackMutes]);

  // Audio Visualizer Canvas Loop
  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bufferLength = analyserRef.current?.frequencyBinCount || 32;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#7c3aed');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Play Synth Note on Keyboard
  const playSynthNote = (note: SynthKey) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = synthWaveform;
    osc.frequency.setValueAtTime(note.freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(synthFilterCutoff, now);
    filter.Q.value = 3;

    const vol = trackMutes.lead ? 0 : trackVolumes.lead / 100;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol * 0.7, now + synthAttack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + synthAttack + synthRelease);

    osc.connect(filter);
    filter.connect(gain);
    if (analyserRef.current) gain.connect(analyserRef.current);
    else gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + synthAttack + synthRelease);

    setActiveNotes(prev => new Set(prev).add(note.note));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note.note);
        return next;
      });
    }, (synthAttack + synthRelease) * 1000);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const matched = PIANO_KEYS.find(k => k.char === key);
      if (matched) {
        playSynthNote(matched);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [synthWaveform, synthFilterCutoff, synthAttack, synthRelease, trackVolumes, trackMutes]);

  // Live Microphone Recording
  const startRecordingMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVocalAudioUrl(url);
        toast.success('Mic recording captured on Track 4!');
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecordingMic(true);
      toast.success('Recording microphone...');
    } catch (err: any) {
      toast.error('Microphone access denied: ' + err.message);
    }
  };

  const stopRecordingMic = () => {
    if (mediaRecorderRef.current && isRecordingMic) {
      mediaRecorderRef.current.stop();
      setIsRecordingMic(false);
    }
  };

  // Drum Grid Toggle
  const toggleStep = (voiceIdx: number, stepIdx: number) => {
    setDrumGrid(prev => {
      const copy = prev.map(row => [...row]);
      copy[voiceIdx][stepIdx] = !copy[voiceIdx][stepIdx];
      return copy;
    });
  };

  // Load Presets
  const applyPreset = (presetKey: 'trap' | 'house' | 'lofi') => {
    const p = PRESETS[presetKey];
    setDrumGrid(p.drums);
    setBpm(p.bpm);
    toast.success(`Loaded ${p.name} pattern @ ${p.bpm} BPM`);
  };

  // Send Collaboration Chat
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'You',
        text: chatInput.trim(),
        time: 'Just now'
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top DAW Control Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Web Music Collaboration Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                DAW v2.0
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Ultra-low latency browser audio • 16-step sequencer • Polyphonic synth • Live room
            </p>
          </div>
        </div>

        {/* Master Playback & Latency Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Latency Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">Hardware Latency:</span>
            <span className="font-mono text-emerald-400 font-bold">~{latencyCompensation}ms</span>
          </div>

          {/* BPM Slider & Tap */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">BPM:</span>
            <span className="font-mono text-white font-bold w-7 text-center">{bpm}</span>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={e => setBpm(parseInt(e.target.value))}
              className="w-16 accent-violet-500"
            />
          </div>

          {/* Master Transport Controls */}
          <button
            onClick={() => {
              getAudioContext();
              setIsPlaying(!isPlaying);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isPlaying ? 'Pause' : 'Play Session'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(0);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            title="Stop & Rewind"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Time Audio Frequency Spectrum Visualizer */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Stereo Master Bus Frequency Visualizer</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">48,000 Hz • 32-bit Float</span>
        </div>

        <canvas
          ref={visualizerCanvasRef}
          width={800}
          height={65}
          className="w-full h-16 rounded-xl bg-slate-900/60 border border-slate-800/80"
        />
      </div>

      {/* Main Studio Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs shadow-md">
        <button
          onClick={() => setActiveTab('sequencer')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'sequencer' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>16-Step Drum Machine</span>
        </button>

        <button
          onClick={() => setActiveTab('synth')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'synth' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Polyphonic Synth & Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('mixer')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'mixer' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>4-Track Mixer & Mic</span>
        </button>

        <button
          onClick={() => setActiveTab('session')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'session' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Sessionwire Room ({roomCode})</span>
        </button>
      </div>

      {/* TAB 1: 16-STEP DRUM MACHINE */}
      {activeTab === 'sequencer' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 shadow-xl">
          {/* Preset Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Genre Patterns:</span>
              <button
                onClick={() => applyPreset('house')}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              >
                House / EDM (124 BPM)
              </button>
              <button
                onClick={() => applyPreset('trap')}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              >
                Trap / Hip-Hop (140 BPM)
              </button>
              <button
                onClick={() => applyPreset('lofi')}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              >
                Lo-Fi Chill (82 BPM)
              </button>
            </div>

            <button
              onClick={() => {
                setDrumGrid([
                  Array(16).fill(false),
                  Array(16).fill(false),
                  Array(16).fill(false),
                  Array(16).fill(false),
                ]);
                toast.success('Cleared sequencer grid');
              }}
              className="text-slate-400 hover:text-red-400 cursor-pointer"
            >
              Clear Grid
            </button>
          </div>

          {/* 16-Step Sequencer Grid */}
          <div className="space-y-3 overflow-x-auto">
            {['Kick Drum', 'Snare Snap', 'Closed Hi-Hat', 'Perc / Clap'].map((voiceName, vIdx) => (
              <div key={voiceName} className="flex items-center gap-3 min-w-[650px]">
                <div className="w-28 text-xs font-bold text-slate-300 shrink-0">
                  {voiceName}
                </div>

                <div className="flex-1 grid grid-cols-16 gap-1.5">
                  {drumGrid[vIdx].map((isActive, sIdx) => {
                    const isCurrent = currentStep === sIdx && isPlaying;
                    const isQuarter = sIdx % 4 === 0;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => toggleStep(vIdx, sIdx)}
                        className={`h-11 rounded-lg transition-all cursor-pointer border transform hover:scale-105 flex items-center justify-center ${
                          isActive
                            ? 'bg-gradient-to-t from-violet-600 to-pink-500 border-violet-400 text-white shadow-md shadow-violet-600/30 font-bold'
                            : isQuarter
                            ? 'bg-slate-900 border-slate-700/80 hover:border-slate-500'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        } ${isCurrent ? 'ring-2 ring-white scale-110' : ''}`}
                      >
                        <span className="text-[10px] font-mono opacity-40">{sIdx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
            <span>💡 Click any step to toggle trigger. 4-bar beats automatically synchronize to master tempo.</span>
            <span className="font-mono text-violet-400">Step: {currentStep + 1} / 16</span>
          </div>
        </div>
      )}

      {/* TAB 2: SYNTHESIZER & PIANO KEYBOARD */}
      {activeTab === 'synth' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 shadow-xl">
          {/* Synth Parameters */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Oscillator Waveform</label>
              <select
                value={synthWaveform}
                onChange={e => setSynthWaveform(e.target.value as OscillatorType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-semibold cursor-pointer"
              >
                <option value="sawtooth">Sawtooth (Synth Lead)</option>
                <option value="square">Square (8-bit / Chiptune)</option>
                <option value="sine">Sine (Pure / Sub-bass)</option>
                <option value="triangle">Triangle (Warm Vintage)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Low-Pass Filter Cutoff</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="200"
                  max="6000"
                  step="100"
                  value={synthFilterCutoff}
                  onChange={e => setSynthFilterCutoff(parseInt(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="font-mono text-white text-[11px] w-12">{synthFilterCutoff}Hz</span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Attack (ADSR)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={synthAttack}
                  onChange={e => setSynthAttack(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="font-mono text-white text-[11px] w-12">{Math.round(synthAttack * 1000)}ms</span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Release (ADSR)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.05"
                  max="1.5"
                  step="0.05"
                  value={synthRelease}
                  onChange={e => setSynthRelease(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="font-mono text-white text-[11px] w-12">{Math.round(synthRelease * 1000)}ms</span>
              </div>
            </div>
          </div>

          {/* Interactive Piano Keyboard */}
          <div className="flex justify-center overflow-x-auto py-2">
            <div className="relative flex select-none bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl">
              {PIANO_KEYS.map((k) => {
                const isPressed = activeNotes.has(k.note);
                if (k.isBlack) {
                  return (
                    <button
                      key={k.note}
                      onClick={() => playSynthNote(k)}
                      className={`relative z-10 w-9 h-28 -mx-4 rounded-b-lg border-2 border-slate-950 transition-all cursor-pointer flex flex-col justify-end items-center pb-2 ${
                        isPressed
                          ? 'bg-violet-600 text-white shadow-lg scale-95'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-mono">{k.char}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={k.note}
                    onClick={() => playSynthNote(k)}
                    className={`w-12 h-44 rounded-b-xl border-r border-slate-300 transition-all cursor-pointer flex flex-col justify-end items-center pb-3 ${
                      isPressed
                        ? 'bg-violet-300 text-violet-950 font-bold shadow-inner'
                        : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{k.note}</span>
                    <span className="text-[10px] font-mono text-slate-400">[{k.char}]</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            ⌨️ Play with computer keys: <strong className="text-slate-300 font-mono">A, W, S, E, D, F, T, G, Y, H, U, J, K</strong> or click any key.
          </p>
        </div>
      )}

      {/* TAB 3: 4-TRACK MIXER & LIVE VOCAL RECORDING */}
      {activeTab === 'mixer' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Track 1: Drums */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-pink-400">Track 1: Drums</span>
                <button
                  onClick={() => setTrackMutes({ ...trackMutes, drums: !trackMutes.drums })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-pointer ${
                    trackMutes.drums ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  MUTE
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Volume ({trackVolumes.drums}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackVolumes.drums}
                  onChange={e => setTrackVolumes({ ...trackVolumes, drums: parseInt(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>

            {/* Track 2: Bass Synth */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-cyan-400">Track 2: Bass</span>
                <button
                  onClick={() => setTrackMutes({ ...trackMutes, bass: !trackMutes.bass })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-pointer ${
                    trackMutes.bass ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  MUTE
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Volume ({trackVolumes.bass}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackVolumes.bass}
                  onChange={e => setTrackVolumes({ ...trackVolumes, bass: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Track 3: Lead Synth */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-violet-400">Track 3: Synth Lead</span>
                <button
                  onClick={() => setTrackMutes({ ...trackMutes, lead: !trackMutes.lead })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-pointer ${
                    trackMutes.lead ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  MUTE
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Volume ({trackVolumes.lead}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackVolumes.lead}
                  onChange={e => setTrackVolumes({ ...trackVolumes, lead: parseInt(e.target.value) })}
                  className="w-full accent-violet-500"
                />
              </div>
            </div>

            {/* Track 4: Live Vocal Mic Recording */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-400">Track 4: Live Mic</span>
                <button
                  onClick={() => setTrackMutes({ ...trackMutes, vocals: !trackMutes.vocals })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-pointer ${
                    trackMutes.vocals ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  MUTE
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Volume ({trackVolumes.vocals}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackVolumes.vocals}
                  onChange={e => setTrackVolumes({ ...trackVolumes, vocals: parseInt(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Record Mic Button */}
              <div className="pt-1">
                {isRecordingMic ? (
                  <button
                    onClick={stopRecordingMic}
                    className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={startRecordingMic}
                    className="w-full py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-400 border border-rose-900/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Mic / Vocals</span>
                  </button>
                )}
              </div>

              {vocalAudioUrl && (
                <audio src={vocalAudioUrl} controls className="w-full h-8 pt-1" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SESSIONWIRE-STYLE VIRTUAL JAM ROOM */}
      {activeTab === 'session' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 shadow-xl">
          {/* Room Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-violet-950/30 border border-violet-800/40">
            <div className="space-y-1">
              <span className="text-xs text-violet-300 font-semibold block">Live Collaboration Jam Room</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-black text-white">{roomCode}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Session link copied to clipboard!');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Invite Bandmates</span>
              </button>
            </div>
          </div>

          {/* Connected Musicians Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center">
                SH
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">StudioHost (You)</span>
                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                  ● Master Clock • 0ms
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center">
                MC
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">Marcus C. (Guitar)</span>
                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                  ● Audio Stream • 4.8ms
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center">
                EL
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">Elena L. (Vocals)</span>
                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                  ● Monitoring • 6.2ms
                </span>
              </div>
            </div>
          </div>

          {/* Chat & Notes */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-300 block">Session Notes & Arranger Chat</span>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="text-violet-400">{msg.sender}: </strong>
                    <span className="text-slate-200">{msg.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share arrangement instructions or key notes..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                onClick={sendChatMessage}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
