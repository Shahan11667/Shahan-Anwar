'use client';

import React, { useState, useMemo } from 'react';
import { 
  Type, 
  Copy, 
  Trash2, 
  FileText, 
  Clock, 
  Mic, 
  Check, 
  BarChart2,
  FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WordCounterTool() {
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0,
        charactersWithSpaces: 0,
        charactersWithoutSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        speakingTimeMinutes: 0,
        keywords: [] as { word: string; count: number; density: string }[],
      };
    }

    const wordsArray = trimmed.match(/\b[^\s]+\b/g) || [];
    const words = wordsArray.length;
    const charactersWithSpaces = text.length;
    const charactersWithoutSpaces = text.replace(/\s+/g, '').length;
    const sentences = (text.match(/[.!?]+(?:\s|$)/g) || []).length || (trimmed ? 1 : 0);
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length;

    // Reading time: ~225 words/min
    const readingTimeMinutes = Math.max(0.1, Number((words / 225).toFixed(1)));
    // Speaking time: ~130 words/min
    const speakingTimeMinutes = Math.max(0.1, Number((words / 130).toFixed(1)));

    // Keyword density (words with length > 3, filtered common stop words)
    const stopWords = new Set([
      'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
      'his', 'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would',
      'there', 'their', 'what', 'about', 'which', 'when', 'make', 'can', 'like',
      'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
      'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
      'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after'
    ]);

    const frequencyMap: Record<string, number> = {};
    wordsArray.forEach((w) => {
      const cleaned = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleaned.length > 3 && !stopWords.has(cleaned)) {
        frequencyMap[cleaned] = (frequencyMap[cleaned] || 0) + 1;
      }
    });

    const keywords = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / words) * 100).toFixed(1) + '%',
      }));

    return {
      words,
      charactersWithSpaces,
      charactersWithoutSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
      keywords,
    };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    const sample = `Next.js is a powerful React framework that enables developers to build high-performance web applications with server-side rendering, static site generation, and seamless API routes.

With in-browser client-side processing, our utility tools execute entirely on your device without transmitting data over the internet. This architecture ensures absolute privacy, instantaneous speeds, and zero cloud hosting costs.

Whether you are converting PDF files, optimizing photos, extracting text with optical character recognition, or formatting complex JSON data, your files remain completely private and confidential.`;
    setText(sample);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Words</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">
            {stats.words.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Characters (with spaces)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {stats.charactersWithSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Characters (no spaces)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1">
            {stats.charactersWithoutSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Sentences & Paragraphs</span>
          <p className="text-lg sm:text-xl font-bold text-white mt-1">
            {stats.sentences} / {stats.paragraphs}
          </p>
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        {/* Editor Toolbar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Read: ~{stats.readingTimeMinutes} min</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Speak: ~{stats.speakingTimeMinutes} min</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!text && (
              <button
                onClick={loadSample}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Load Sample Text
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600/80 hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer disabled:opacity-30"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => setText('')}
              disabled={!text}
              className="p-1 rounded-md hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-30 cursor-pointer"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing, or paste your text here to analyze words, characters, and reading time..."
          rows={10}
          className="w-full bg-slate-950 p-4 sm:p-6 text-white text-sm sm:text-base leading-relaxed placeholder-slate-600 focus:outline-none resize-y"
        />
      </div>

      {/* Social Media Character Limits & Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Social Media Tracker */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Social Media Character Limits
          </h4>

          {/* Twitter / X */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">X (Twitter)</span>
              <span className={stats.charactersWithSpaces > 280 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                {stats.charactersWithSpaces} / 280
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.charactersWithSpaces > 280 ? 'bg-rose-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (stats.charactersWithSpaces / 280) * 100)}%` }}
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Instagram Caption</span>
              <span className={stats.charactersWithSpaces > 2200 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                {stats.charactersWithSpaces} / 2,200
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.charactersWithSpaces > 2200 ? 'bg-rose-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, (stats.charactersWithSpaces / 2200) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Top Keyword Density
          </h4>
          {stats.keywords.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              Type or paste longer text to reveal keyword frequency...
            </p>
          ) : (
            <div className="space-y-1.5">
              {stats.keywords.map((kw, idx) => (
                <div
                  key={kw.word}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none"
                >
                  <span className="font-medium text-slate-200">
                    {idx + 1}. {kw.word}
                  </span>
                  <span className="text-slate-400">
                    {kw.count} times ({kw.density})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
