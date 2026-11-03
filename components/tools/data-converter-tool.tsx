'use client';

import React, { useState } from 'react';
import { 
  FileCode, 
  ArrowRightLeft, 
  Copy, 
  Trash2, 
  Check, 
  Sparkles, 
  Download, 
  Code2, 
  Mail, 
  FileText, 
  CheckCircle2,
  Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type ConverterMode = 'csv-json' | 'md-html' | 'minify' | 'email-dedupe' | 'text-clean';

export default function DataConverterTool() {
  const [mode, setMode] = useState<ConverterMode>('csv-json');
  const [input, setInput] = useState<string>('id,name,role,department\n1,Alex Rivera,Staff Engineer,Platform\n2,Sarah Chen,Design Lead,Product\n3,Marcus Vance,DevOps Lead,Infrastructure');
  const [output, setOutput] = useState<string>('');
  const [stats, setStats] = useState<string>('');

  // 1. CSV <-> JSON
  const handleCsvToJson = () => {
    try {
      const lines = input.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        toast.error('Enter at least a CSV header and 1 row');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim());
      const result = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => {
          const val = values[i] ?? '';
          obj[h] = !isNaN(Number(val)) && val !== '' ? Number(val) : val;
        });
        return obj;
      });
      const jsonStr = JSON.stringify(result, null, 2);
      setOutput(jsonStr);
      setStats(`${result.length} objects converted from ${headers.length} columns`);
      toast.success('Converted CSV to JSON!');
    } catch (err: any) {
      toast.error('CSV Parsing Error: ' + err.message);
    }
  };

  const handleJsonToCsv = () => {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.error('JSON input must be an array of objects');
        return;
      }
      const headers = Object.keys(parsed[0]);
      const csvRows = [
        headers.join(','),
        ...parsed.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
      ];
      setOutput(csvRows.join('\n'));
      setStats(`${parsed.length} rows generated with ${headers.length} headers`);
      toast.success('Converted JSON to CSV!');
    } catch (err: any) {
      toast.error('Invalid JSON format: ' + err.message);
    }
  };

  // 2. Markdown <-> HTML
  const handleMarkdownToHtml = () => {
    let html = input
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
      .replace(/^\s*\n\*/gm, '<ul>\n*')
      .replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n$2')
      .replace(/^\* (.*)/gim, '<li>$1</li>')
      .replace(/\n$/gim, '<br />');

    setOutput(html);
    setStats(`${html.length} chars generated`);
    toast.success('Rendered Markdown to HTML!');
  };

  // 3. Minifier (CSS / JS)
  const handleMinify = () => {
    const originalSize = new Blob([input]).size;
    let minified = input
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '')
      // Remove line breaks and tabs
      .replace(/[\r\n\t]+/g, ' ')
      // Collapse whitespace
      .replace(/\s{2,}/g, ' ')
      // Remove spaces around symbols
      .replace(/\s*([\{\}\:\;\,\(\)\=\+\-\*\/])\s*/g, '$1')
      .trim();

    const newSize = new Blob([minified]).size;
    const saved = Math.max(0, originalSize - newSize);
    const percent = originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) : '0';

    setOutput(minified);
    setStats(`Reduced from ${originalSize}B to ${newSize}B (Saved ${saved}B / -${percent}%)`);
    toast.success(`Minified! Saved ${percent}% payload size.`);
  };

  // 4. Email List Deduplicator
  const handleDedupeEmails = () => {
    const rawList = input.split(/[\n,; ]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = rawList.filter((e) => emailRegex.test(e));
    const unique = Array.from(new Set(validEmails)).sort();
    const duplicatesRemoved = rawList.length - unique.length;

    setOutput(unique.join('\n'));
    setStats(`${unique.length} unique emails verified (${duplicatesRemoved} duplicates / invalid removed)`);
    toast.success(`Cleaned! Removed ${duplicatesRemoved} duplicates.`);
  };

  // 5. Text Cleaner & Unformatter
  const handleCleanText = () => {
    let clean = input
      // Smart quotes to straight quotes
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      // Non-breaking and zero-width spaces
      .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ')
      // Dashes to standard hyphen
      .replace(/[\u2013\u2014]/g, '-')
      // Multiple blank lines to double newline
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    setOutput(clean);
    setStats(`Cleaned ${clean.length} characters (Stripped non-breaking spaces & smart quotes)`);
    toast.success('Text cleaned and normalized!');
  };

  const handleCopy = () => {
    if (!output) {
      toast.error('Nothing to copy yet');
      return;
    }
    navigator.clipboard.writeText(output);
    confetti({ particleCount: 30, spread: 50 });
    toast.success('Copied output to clipboard!');
  };

  const handleDownload = () => {
    if (!output) return;
    const extension = mode === 'csv-json' ? (output.startsWith('[') ? 'json' : 'csv') : 'txt';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-output.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded output file!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Universal Data & Plain-Text Utilities</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                100% Client-Side • Fast
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              CSV to JSON, code minification, email deduplication, and markdown conversion. Zero server uploads.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
          {[
            { id: 'csv-json', label: 'CSV ⇄ JSON' },
            { id: 'minify', label: 'Code Minifier' },
            { id: 'email-dedupe', label: 'Email Purifier' },
            { id: 'md-html', label: 'Markdown ⇄ HTML' },
            { id: 'text-clean', label: 'Text Cleaner' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as any);
                setOutput('');
                setStats('');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                mode === m.id ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Conversion Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Input Data</span>
            <button
              onClick={() => setInput('')}
              className="text-slate-500 hover:text-slate-300 text-[11px] cursor-pointer"
            >
              Clear
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Paste your raw text, CSV, JSON, code, or emails here..."
          />

          {/* Action Trigger Buttons based on mode */}
          <div className="flex flex-wrap gap-2 pt-1">
            {mode === 'csv-json' && (
              <>
                <button
                  onClick={handleCsvToJson}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow cursor-pointer"
                >
                  Convert CSV → JSON
                </button>
                <button
                  onClick={handleJsonToCsv}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Convert JSON → CSV
                </button>
              </>
            )}

            {mode === 'minify' && (
              <button
                onClick={handleMinify}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Minify Code (Strip Comments & Spaces)</span>
              </button>
            )}

            {mode === 'email-dedupe' && (
              <button
                onClick={handleDedupeEmails}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Deduplicate & Validate Emails</span>
              </button>
            )}

            {mode === 'md-html' && (
              <button
                onClick={handleMarkdownToHtml}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow cursor-pointer"
              >
                Render to HTML
              </button>
            )}

            {mode === 'text-clean' && (
              <button
                onClick={handleCleanText}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow cursor-pointer"
              >
                Strip Formatting & Non-Breaking Spaces
              </button>
            )}
          </div>
        </div>

        {/* Output Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Converted Output</span>
            {stats && (
              <span className="text-[11px] text-cyan-400 font-mono font-medium">{stats}</span>
            )}
          </div>

          <textarea
            readOnly
            value={output}
            rows={14}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            placeholder="Result will appear here immediately after conversion..."
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Output</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!output}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

