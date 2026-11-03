'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Flame, 
  Check, 
  Calendar,
  Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface Habit {
  id: string;
  name: string;
  history: boolean[]; // 7 days: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'h-1', name: 'Deep Focus Coding (4 Hours)', history: [true, true, true, false, true, true, false] },
  { id: 'h-2', name: 'Read 20 Pages Technical Documentation', history: [true, true, false, true, true, false, false] },
  { id: 'h-3', name: 'Workout & Stretch Session', history: [false, true, true, true, false, true, false] },
  { id: 'h-4', name: 'Clean Inbox & Client Updates', history: [true, true, true, true, true, false, false] }
];

export default function FocusTimerTool() {
  // Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  // Ambient Noise Generator (Web Audio API - 100% client side!)
  const [ambientActive, setAmbientActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Daily Habit Matrix State
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [newHabitName, setNewHabitName] = useState<string>('');

  // Load from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('sol_focus_habits');
    if (savedHabits) {
      try { setHabits(JSON.parse(savedHabits)); } catch (e) {}
    }
    const savedSessions = localStorage.getItem('sol_focus_sessions');
    if (savedSessions) {
      setCompletedSessions(parseInt(savedSessions) || 0);
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({ particleCount: 60, spread: 80 });
      if (timerMode === 'focus') {
        const nextSessions = completedSessions + 1;
        setCompletedSessions(nextSessions);
        localStorage.setItem('sol_focus_sessions', nextSessions.toString());
        toast.success('Focus session complete! Take a well-earned break.');
      } else {
        toast.success('Break finished! Ready to get back into flow?');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode, completedSessions]);

  // Mode change
  const handleModeChange = (mode: 'focus' | 'short' | 'long') => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  // Synthesize gentle pink noise for deep focus (Zero MP3 files required)
  const toggleAmbientSound = () => {
    if (ambientActive) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAmbientActive(false);
      toast.dismiss();
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        whiteNoise.connect(ctx.destination);
        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;

        setAmbientActive(true);
        toast.success('Gentle pink noise generator active');
      } catch (e: any) {
        toast.error('Audio synthesizer not supported in this browser');
      }
    }
  };

  // Habit operations
  const toggleHabitDay = (habitId: string, dayIndex: number) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const nextHistory = [...h.history];
        nextHistory[dayIndex] = !nextHistory[dayIndex];
        return { ...h, history: nextHistory };
      }
      return h;
    });
    setHabits(updated);
    localStorage.setItem('sol_focus_habits', JSON.stringify(updated));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const updated = [
      ...habits,
      { id: 'h-' + Date.now(), name: newHabitName.trim(), history: [false, false, false, false, false, false, false] }
    ];
    setHabits(updated);
    localStorage.setItem('sol_focus_habits', JSON.stringify(updated));
    setNewHabitName('');
    toast.success('Habit added to your tracker!');
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    localStorage.setItem('sol_focus_habits', JSON.stringify(updated));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = timerMode === 'focus' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Single-Screen Habit & Focus Station</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/40">
                Distraction Free
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Clean Pomodoro timer, ambient pink noise, and a single-screen weekly habit check-in grid. No subscriptions or feeds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Sound Button */}
          <button
            onClick={toggleAmbientSound}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              ambientActive
                ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Synthesize soothing pink noise directly in browser"
          >
            {ambientActive ? <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Pink Noise {ambientActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            title="Toggle Fullscreen Focus"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Single-Screen Station */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Column: Pomodoro Focus Dial (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 text-center shadow-xl">
          {/* Mode Tabs */}
          <div className="flex justify-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs max-w-xs mx-auto">
            <button
              onClick={() => handleModeChange('focus')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timerMode === 'focus' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleModeChange('short')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timerMode === 'short' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              5m Break
            </button>
            <button
              onClick={() => handleModeChange('long')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timerMode === 'long' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              15m Long
            </button>
          </div>

          {/* Time Display */}
          <div className="space-y-2">
            <div className="font-mono text-6xl sm:text-7xl font-black text-white tracking-tighter">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Circular or linear progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 max-w-xs mx-auto">
              <div 
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-500/25 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => handleModeChange(timerMode)}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Daily Streak Counter */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{completedSessions} Pomodoros completed today</span>
            </div>
          </div>
        </div>

        {/* Right Column: Minimalist Habit Check-in Matrix (3 Cols) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-bold text-white">Weekly Habit Consistency Matrix</h4>
            </div>
            <span className="text-xs text-slate-400">Click circle to check-in</span>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-slate-500 border-b border-slate-800 pb-2">
            <span className="col-span-5 text-left text-slate-400">HABIT / RITUAL</span>
            {DAYS.map((d) => (
              <span key={d} className="col-span-1 text-center">{d}</span>
            ))}
          </div>

          {/* Habit Rows */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {habits.map((habit) => {
              const streak = habit.history.filter(Boolean).length;
              return (
                <div key={habit.id} className="grid grid-cols-12 gap-1 items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 group">
                  <div className="col-span-5 flex items-center justify-between pr-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]" title={habit.name}>
                      {habit.name}
                    </span>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="hidden group-hover:block text-slate-500 hover:text-red-400 text-xs ml-1"
                    >
                      ×
                    </button>
                  </div>

                  {habit.history.map((done, idx) => (
                    <div key={idx} className="col-span-1 flex justify-center">
                      <button
                        onClick={() => toggleHabitDay(habit.id, idx)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          done
                            ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-transparent'
                        }`}
                      >
                        {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Add Habit Form */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Add new habit (e.g. Read 20 mins, Cold shower, Meditate)..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <button
              onClick={addHabit}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

