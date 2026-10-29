'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  FileCode, 
  AlertCircle, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function JsonFormatterTool() {
  const [inputJson, setInputJson] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleJson = {
    appName: "Shahan Productivity Suite",
    version: "2.4.0",
    features: [
      { id: 1, name: "JPG to PDF", status: "active", privacy: "100% Client-Side" },
      { id: 2, name: "Image Compressor", status: "active", algorithm: "Canvas Lossless" },
      { id: 3, name: "OCR Text Extraction", status: "active", engine: "Tesseract WASM" }
    ],
    metadata: {
      zeroCloudUpload: true,
      freeForever: true,
      dailyUsers: 25000
    }
  };

  const loadSample = () => {
    setInputJson(JSON.stringify(sampleJson));
    setError(null);
  };

  const handleFormat = () => {
    if (!inputJson.trim()) {
      toast.error('Please enter JSON text');
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indent);
      setInputJson(formatted);
      setError(null);
      toast.success('JSON formatted successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      toast.error('Invalid JSON syntax');
    }
  };

  const handleMinify = () => {
    if (!inputJson.trim()) {
      toast.error('Please enter JSON text');
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setInputJson(minified);
      setError(null);
      toast.success('JSON minified!');
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      toast.error('Invalid JSON syntax');
    }
  };

  const handleValidate = () => {
    if (!inputJson.trim()) {
      toast.error('Please enter JSON text');
      return;
    }
    try {
      JSON.parse(inputJson);
      setError(null);
      toast.success('Valid JSON! Syntax is correct.');
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      toast.error('Invalid JSON syntax');
    }
  };

  const handleCopy = () => {
    if (!inputJson) return;
    navigator.clipboard.writeText(inputJson);
    setCopied(true);
    toast.success('Copied JSON to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!inputJson) return;
    const blob = new Blob([inputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded JSON file!');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Beautify */}
          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beautify</span>
          </button>

          {/* Minify */}
          <button
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            <span>Minify</span>
          </button>

          {/* Validate */}
          <button
            onClick={handleValidate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validate</span>
          </button>

          {/* Indent selector */}
          <div className="flex items-center gap-1 text-slate-400 ml-2">
            <span>Indent:</span>
            <select
              value={indent}
              onChange={(e) => setIndent(parseInt(e.target.value, 10))}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!inputJson && (
            <button
              onClick={loadSample}
              className="text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              Load Sample
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!inputJson}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            disabled={!inputJson}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setInputJson('');
              setError(null);
            }}
            disabled={!inputJson}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-30"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Syntax Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">JSON Syntax Error:</strong>
            <p className="font-mono mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Professional Code Editor Window */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Editor Titlebar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-slate-400 font-mono text-[11px] ml-2">
              document.json
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>
              {inputJson ? inputJson.split('\n').length : 0} lines
            </span>
            <span>•</span>
            <span>
              {inputJson ? inputJson.length : 0} chars
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">UTF-8</span>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste raw, unformatted, or minified JSON here..."
          rows={16}
          className="w-full bg-slate-950 p-4 sm:p-5 text-emerald-300 font-mono text-xs sm:text-sm leading-relaxed placeholder-slate-600 focus:outline-none resize-y selection:bg-emerald-500/20"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
