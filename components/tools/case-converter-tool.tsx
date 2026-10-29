'use client';

import React, { useState } from 'react';
import { 
  CaseSensitive, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CaseConverterTool() {
  const [text, setText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const conversions = [
    {
      id: 'upper',
      name: 'UPPERCASE',
      example: 'HELLO WORLD',
      transform: (str: string) => str.toUpperCase(),
    },
    {
      id: 'lower',
      name: 'lowercase',
      example: 'hello world',
      transform: (str: string) => str.toLowerCase(),
    },
    {
      id: 'title',
      name: 'Title Case',
      example: 'Hello World',
      transform: (str: string) => {
        return str.toLowerCase().replace(/\b\w+/g, (txt) => {
          return txt.charAt(0).toUpperCase() + txt.substring(1);
        });
      },
    },
    {
      id: 'sentence',
      name: 'Sentence case',
      example: 'Hello world. Here is sentence two.',
      transform: (str: string) => {
        return str
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      },
    },
    {
      id: 'camel',
      name: 'camelCase',
      example: 'helloWorld',
      transform: (str: string) => {
        return str
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^([A-Z])/, (c) => c.toLowerCase());
      },
    },
    {
      id: 'snake',
      name: 'snake_case',
      example: 'hello_world',
      transform: (str: string) => {
        return str
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
      },
    },
    {
      id: 'kebab',
      name: 'kebab-case',
      example: 'hello-world',
      transform: (str: string) => {
        return str
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      },
    },
    {
      id: 'pascal',
      name: 'PascalCase',
      example: 'HelloWorld',
      transform: (str: string) => {
        return str
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[a-z]/, (c) => c.toUpperCase());
      },
    },
  ];

  const applyCaseToMain = (transformFn: (s: string) => string) => {
    if (!text) {
      toast.error('Please enter some text first');
      return;
    }
    setText(transformFn(text));
    toast.success('Converted text!');
  };

  const copyResult = (str: string, key: string) => {
    if (!str) return;
    navigator.clipboard.writeText(str);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Textarea */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {text.length} characters • {text.trim() ? text.trim().split(/\s+/).length : 0} words
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setText('the quick brown fox jumps over the lazy dog')}
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Load Example
            </button>
            <button
              onClick={() => setText('')}
              disabled={!text}
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors disabled:opacity-30"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          rows={6}
          className="w-full bg-slate-950 p-4 sm:p-5 text-white text-sm sm:text-base leading-relaxed placeholder-slate-600 focus:outline-none resize-y font-sans"
        />
      </div>

      {/* Quick Action Transform Buttons */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Transform Main Text Directly
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {conversions.map((conv) => (
            <button
              key={conv.id}
              onClick={() => applyCaseToMain(conv.transform)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-200 hover:text-white text-xs font-semibold transition-all flex flex-col items-start gap-1 cursor-pointer"
            >
              <span className="text-purple-400">{conv.name}</span>
              <span className="text-[10px] text-slate-500 truncate max-w-full font-mono">
                {conv.example}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Previews of All Formats (Click to Copy Any) */}
      {text.trim() && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            One-Click Copy Any Case Format
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conversions.map((conv) => {
              const result = conv.transform(text);
              const isCopied = copiedKey === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => copyResult(result, conv.id)}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/60 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      {conv.name}
                    </span>
                    <p className="text-xs text-white truncate max-w-xs sm:max-w-sm mt-0.5 font-mono">
                      {result}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-lg bg-slate-800 group-hover:bg-purple-600 text-slate-300 group-hover:text-white transition-colors shrink-0"
                    title="Copy this format"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
