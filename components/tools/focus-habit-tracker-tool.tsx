'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Flame, 
  Clock, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Brain,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface HabitItem {
  id: string;
  name: string;
  // History mapping for past 7 days: 'YYYY-MM-DD' -> boolean
  completedDays: Record<string, boolean>;
}

interface PriorityItem {
  id: string;
  text: string;
  done: boolean;
}

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h-1', name: 'Deep Work Session (2h)', completedDays: {} },
  { id: 'h-2', name: 'Exercise / 30min Walk', completedDays: {} },
  { id: 'h-3', name: 'Read 20 Pages', completedDays: {} },
  { id: 'h-4', name: 'Drink 2L Water', completedDays: {} },
];

export default function FocusHabitTrackerTool() {
  // TIMER STATE
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // HABITS STATE
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [newHabitName, setNewHabitName] = useState<string>('');

  // TODAY PRIORITIES & SCRATCHPAD
  const [priorities, setPriorities] = useState<PriorityItem[]>([
    { id: 'p-1', text: 'Ship core feature deliverables', done: false },
    { id: 'p-2', text: 'Review pull requests and documentation', done: false },
    { id: 'p-3', text: 'Inbox zero before afternoon', done: false },
  ]);
  const [scratchpad, setScratchpad] = useState<string>('');

  // Sound Synth via Web Audio API (no external mp3 dependency)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // ignore
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playChime();
      confetti({ particleCount: 40, spread: 60 });
      if (timerMode === 'focus') {
        setCompletedSessions(c => c + 1);
        toast.success('Focus session complete! Take a well-deserved break.');
        setTimerMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        toast.success('Break finished! Ready for another deep focus block?');
        setTimerMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem('agy_habits_data');
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      const savedPriorities = localStorage.getItem('agy_priorities_data');
      if (savedPriorities) setPriorities(JSON.parse(savedPriorities));
      const savedNotes = localStorage.getItem('agy_scratchpad_data');
      if (savedNotes) setScratchpad(savedNotes);
      const savedSessions = localStorage.getItem('agy_sessions_data');
      if (savedSessions) setCompletedSessions(parseInt(savedSessions));
    } catch (e) {
      // ignore
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('agy_habits_data', JSON.stringify(habits));
      localStorage.setItem('agy_priorities_data', JSON.stringify(priorities));
      localStorage.setItem('agy_scratchpad_data', scratchpad);
      localStorage.setItem('agy_sessions_data', completedSessions.toString());
    } catch (e) {
      // ignore
    }
  }, [habits, priorities, scratchpad, completedSessions]);

  // Timer Handlers
  const handleSwitchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerMode(newMode);
    if (newMode === 'focus') setTimeLeft(25 * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Get past 7 dates
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ key, dayName, isToday: i === 0 });
    }
    return days;
  };
  const weekDays = getLast7Days();

  // Habit toggling
  const toggleHabitDay = (habitId: string, dayKey: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const current = !!h.completedDays[dayKey];
          return {
            ...h,
            completedDays: {
              ...h.completedDays,
              [dayKey]: !current,
            },
          };
        }
        return h;
      })
    );
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits(prev => [
      ...prev,
      {
        id: 'h-' + Date.now(),
        name: newHabitName.trim(),
        completedDays: {},
      },
    ]);
    setNewHabitName('');
    toast.success('Habit added to your grid');
  };

  const removeHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Single-Screen Focus & Habit Tracker
            </h4>
            <p className="text-[11px] text-slate-400">
              Distraction-free • Zero ads • Zero social feeds • Local-first privacy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-slate-300">
              Completed Focus Blocks: <strong className="text-white">{completedSessions}</strong>
            </span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Single-Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SECTION 1: Deep Work Pomodoro Timer (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 shadow-xl flex flex-col items-center text-center">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs w-full max-w-xs">
            <button
              onClick={() => handleSwitchMode('focus')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timerMode === 'focus' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => handleSwitchMode('shortBreak')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timerMode === 'shortBreak' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Short (5m)
            </button>
            <button
              onClick={() => handleSwitchMode('longBreak')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timerMode === 'longBreak' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Long (15m)
            </button>
          </div>

          {/* Big Digital Countdown */}
          <div className="space-y-2 my-2">
            <span className="text-6xl sm:text-7xl font-mono font-extrabold text-white tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <p className="text-xs text-slate-400">
              {isRunning 
                ? (timerMode === 'focus' ? 'Deep Work Session in Progress...' : 'Resting and recharging...') 
                : 'Paused • Press Play to Begin'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                handleSwitchMode(timerMode);
              }}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Today's 3 Priorities */}
          <div className="w-full text-left pt-4 border-t border-slate-800/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Today's 3 Non-Negotiable Priorities:
            </span>

            <div className="space-y-2">
              {priorities.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setPriorities(prev =>
                      prev.map(item => item.id === p.id ? { ...item, done: !item.done } : item)
                    );
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs cursor-pointer transition-all ${
                    p.done
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                      : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border ${
                      p.done ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                    }`}
                  >
                    {p.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="flex-1 select-none">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: 7-Day Habit Check-in Grid & Scratchpad (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Habit Check-In Matrix */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Daily Habit Streak Matrix (Past 7 Days)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any square to toggle completion for that day
                </p>
              </div>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2 font-medium">Habit</th>
                    {weekDays.map(d => (
                      <th
                        key={d.key}
                        className={`py-2 px-2 text-center font-mono ${
                          d.isToday ? 'text-rose-400 font-bold' : ''
                        }`}
                      >
                        {d.dayName}
                        {d.isToday && <span className="block text-[9px]">TODAY</span>}
                      </th>
                    ))}
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {habits.map(h => (
                    <tr key={h.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate-200">{h.name}</td>
                      {weekDays.map(d => {
                        const done = !!h.completedDays[d.key];
                        return (
                          <td key={d.key} className="py-3 px-2 text-center">
                            <button
                              onClick={() => toggleHabitDay(h.id, d.key)}
                              className={`w-7 h-7 rounded-lg transition-all transform hover:scale-110 cursor-pointer flex items-center justify-center border mx-auto ${
                                done
                                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/20'
                                  : 'bg-slate-900 border-slate-800 text-transparent hover:border-slate-700'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => removeHabit(h.id)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Habit Input */}
            <div className="flex gap-2 pt-2 border-t border-slate-800/80">
              <input
                type="text"
                placeholder="Add a new daily habit (e.g. Read 20 pages, Gym)..."
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHabit()}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={addHabit}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Scratchpad Notes */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Quick Focus Scratchpad (Auto-Saved)
            </span>
            <textarea
              rows={4}
              value={scratchpad}
              onChange={e => setScratchpad(e.target.value)}
              placeholder="Dump quick thoughts, phone numbers, or code snippets here during your focus block..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-rose-500 resize-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

