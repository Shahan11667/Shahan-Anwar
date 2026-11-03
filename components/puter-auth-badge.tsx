'use client';

import React, { useState, useEffect } from 'react';
import { 
  POPULAR_PUTER_MODELS, 
  PuterModelOption, 
  PuterUser, 
  loadPuter, 
  isPuterSignedIn, 
  puterSignIn, 
  puterSignOut, 
  puterGetUser 
} from '@/lib/puter';
import { Sparkles, CheckCircle2, LogIn, LogOut, ChevronDown, Cpu, ShieldCheck } from 'lucide-react';

interface PuterAuthBadgeProps {
  selectedModel?: string;
  onModelSelect?: (modelId: string) => void;
  className?: string;
  compact?: boolean;
}

export default function PuterAuthBadge({
  selectedModel = 'openai/gpt-4o',
  onModelSelect,
  className = '',
  compact = false
}: PuterAuthBadgeProps) {
  const [user, setUser] = useState<PuterUser | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [currentModel, setCurrentModel] = useState(selectedModel);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        await loadPuter();
        const signed = await isPuterSignedIn();
        if (mounted) {
          setIsSignedIn(signed);
          if (signed) {
            const u = await puterGetUser();
            if (mounted) setUser(u);
          }
        }
      } catch (e) {
        console.warn('Puter init check:', e);
      }
    }
    checkAuth();
    return () => { mounted = false; };
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const u = await puterSignIn();
      if (u) {
        setUser(u);
        setIsSignedIn(true);
      }
    } catch (err: any) {
      console.error('Puter sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await puterSignOut();
      setUser(null);
      setIsSignedIn(false);
    } catch (err) {
      console.error('Puter sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (model: PuterModelOption) => {
    setCurrentModel(model.id);
    if (onModelSelect) {
      onModelSelect(model.id);
    }
    setShowModels(false);
  };

  const activeModelMeta = POPULAR_PUTER_MODELS.find(m => m.id === currentModel) || POPULAR_PUTER_MODELS[0];

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {isSignedIn ? (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-emerald-200">
              Puter AI Connected: <span className="font-bold text-white">@{user?.username || 'user'}</span>
            </span>
          </div>

          <div className="h-4 w-px bg-emerald-500/30 mx-1" />

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 border border-emerald-500/20 text-emerald-200 hover:text-white transition-all font-mono text-[11px]"
            >
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>{activeModelMeta.name}</span>
              <ChevronDown className="w-3 h-3 text-emerald-400/70" />
            </button>

            {showModels && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1 flex items-center justify-between">
                  <span>Puter.js AI Models (400+)</span>
                  <span className="text-emerald-400">Zero Server Cost</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 my-1 pr-1">
                  {POPULAR_PUTER_MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectModel(m)}
                      className={`w-full text-left p-2 rounded-lg transition-all flex items-start justify-between ${
                        currentModel === m.id
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                          : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-xs flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {m.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-sans font-bold">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{m.description}</div>
                      </div>
                      {currentModel === m.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Disconnect Puter"
            className="p-1 hover:bg-emerald-500/20 rounded-md text-emerald-400 hover:text-white transition-all ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-200 hover:text-white text-xs font-medium transition-all shadow-sm hover:shadow-cyan-500/10 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Connect Puter (Unlimited AI: GPT-4o, Claude 3.5, Gemini)</span>
            <LogIn className="w-3 h-3 text-cyan-400 ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}

