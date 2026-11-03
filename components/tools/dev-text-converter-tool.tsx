'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  FileCode, 
  FileSpreadsheet, 
  Sparkles, 
  Copy, 
  Download, 
  ArrowRightLeft, 
  Trash2, 
  Check, 
  Scissors, 
  Filter, 
  SortAsc,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type ConverterMode = 'csv-json' | 'md-html' | 'minify' | 'cleaner';

export default function DevTextConverterTool() {
  const [mode, setMode] = useState<ConverterMode>('csv-json');
  const [inputVal, setInputVal] = useState<string>('');
  const [outputVal, setOutputVal] = useState<string>('');
  const [csvToJsonDirection, setCsvToJsonDirection] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [mdToHtmlDirection, setMdToHtmlDirection] = useState<'md2html' | 'html2md'>('md2html');

  // Stats
  const [stats, setStats] = useState<string>('');

  // Sample Data Loaders
  const loadSample = () => {
    if (mode === 'csv-json') {
      const sampleCsv = `id,name,role,email,status\n101,Sarah Connor,Security Lead,sarah@skynet.ai,active\n102,John Doe,Full Stack Developer,john@acme.dev,active\n103,Alex Vance,Research Scientist,alex@blackmesa.org,pending`;
      setInputVal(sampleCsv);
      handleCsvToJson(sampleCsv);
    } else if (mode === 'md-html') {
      const sampleMd = `# Project Phoenix Documentation\n\nWelcome to **Phoenix**, a high-performance *cloud-native* suite.\n\n### Key Features\n- Sub-second latency\n- Zero-trust security\n- Automated scaling\n\n> "Simplicity is prerequisite for reliability." — Edsger Dijkstra`;
      setInputVal(sampleMd);
      handleMdToHtml(sampleMd);
    } else if (mode === 'minify') {
      const sampleCss = `/* Main Application Styles */\n.hero-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 48px 24px;\n  background-color: #0f172a;\n}\n\n.hero-title {\n  font-size: 3rem;\n  font-weight: 800;\n  color: #ffffff;\n  line-height: 1.2;\n}`;
      setInputVal(sampleCss);
      handleMinify(sampleCss);
    } else if (mode === 'cleaner') {
      const sampleList = `alex@example.com\nSARAH@EXAMPLE.COM\n  john@acme.org  \nalex@example.com\n\n\nsarah@example.com\nmark@zuck.org\nJohn@Acme.org`;
      setInputVal(sampleList);
      handleCleanList(sampleList);
    }
  };

  // MODE 1: CSV ↔ JSON
  const handleCsvToJson = (raw: string) => {
    try {
      if (!raw.trim()) { setOutputVal(''); setStats(''); return; }
      if (csvToJsonDirection === 'csv2json') {
        const lines = raw.trim().split('\n').filter(Boolean);
        if (lines.length < 2) throw new Error('CSV must have a header row and at least 1 data row.');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const result = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = vals[i] || '';
          });
          return obj;
        });
        const jsonStr = JSON.stringify(result, null, 2);
        setOutputVal(jsonStr);
        setStats(`${result.length} rows converted`);
      } else {
        // JSON to CSV
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.length) throw new Error('Input must be a JSON array of objects.');
        const headers = Object.keys(parsed[0]);
        const csvLines = [
          headers.join(','),
          ...parsed.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
        ];
        setOutputVal(csvLines.join('\n'));
        setStats(`${parsed.length} objects converted to CSV`);
      }
    } catch (err: any) {
      setOutputVal(`Error: ${err.message}`);
      setStats('Conversion failed');
    }
  };

  // MODE 2: Markdown ↔ HTML
  const handleMdToHtml = (raw: string) => {
    if (!raw.trim()) { setOutputVal(''); setStats(''); return; }
    if (mdToHtmlDirection === 'md2html') {
      let html = raw
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n$/gim, '<br />');
      setOutputVal(html);
      setStats(`${raw.length} chars rendered to clean HTML`);
    } else {
      let md = raw
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i>(.*?)<\/i>/gi, '*$1*')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
      setOutputVal(md);
      setStats('HTML converted to Markdown');
    }
  };

  // MODE 3: Code Minifier
  const handleMinify = (raw: string) => {
    if (!raw.trim()) { setOutputVal(''); setStats(''); return; }
    const originalLen = raw.length;
    // Strip comments & excess whitespace
    const minified = raw
      .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '') // remove comments
      .replace(/\s+/g, ' ') // collapse multiple spaces
      .replace(/\s*([\{\}\:\;\,])\s*/g, '$1') // remove spacing around braces and colons
      .trim();
    setOutputVal(minified);
    const saved = originalLen - minified.length;
    const pct = Math.round((saved / originalLen) * 100);
    setStats(`Compressed: ${originalLen} B → ${minified.length} B (Saved ${pct}%)`);
  };

  // MODE 4: List Cleaner & De-duplicator
  const handleCleanList = (raw: string) => {
    if (!raw.trim()) { setOutputVal(''); setStats(''); return; }
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const totalLines = lines.length;

    // Deduplicate case-insensitively
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    lines.forEach(l => {
      const lower = l.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueLines.push(l);
      }
    });

    uniqueLines.sort((a, b) => a.localeCompare(b));
    setOutputVal(uniqueLines.join('\n'));
    setStats(`Cleaned: ${totalLines} original lines → ${uniqueLines.length} unique lines (${totalLines - uniqueLines.length} duplicates removed)`);
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    if (mode === 'csv-json') handleCsvToJson(val);
    else if (mode === 'md-html') handleMdToHtml(val);
    else if (mode === 'minify') handleMinify(val);
    else if (mode === 'cleaner') handleCleanList(val);
  };

  const copyToClipboard = () => {
    if (!outputVal) return;
    navigator.clipboard.writeText(outputVal);
    toast.success('Copied output to clipboard!');
  };

  const downloadOutput = () => {
    if (!outputVal) return;
    const ext = mode === 'csv-json' 
      ? (csvToJsonDirection === 'csv2json' ? 'json' : 'csv') 
      : mode === 'md-html' ? (mdToHtmlDirection === 'md2html' ? 'html' : 'md') : 'txt';
    const blob = new Blob([outputVal], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-output.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Plain-Text, Markdown & Data Conversion Utilities
            </h4>
            <p className="text-[11px] text-slate-400">
              100% Client-side • Instant execution • Zero server data retention
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => { setMode('csv-json'); setInputVal(''); setOutputVal(''); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'csv-json' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV ↔ JSON</span>
          </button>

          <button
            onClick={() => { setMode('md-html'); setInputVal(''); setOutputVal(''); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'md-html' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>MD ↔ HTML</span>
          </button>

          <button
            onClick={() => { setMode('minify'); setInputVal(''); setOutputVal(''); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'minify' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Minifier</span>
          </button>

          <button
            onClick={() => { setMode('cleaner'); setInputVal(''); setOutputVal(''); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'cleaner' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>List De-duplicator</span>
          </button>
        </div>
      </div>

      {/* Control Strip & Sample Loader */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {mode === 'csv-json' && (
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              <button
                onClick={() => { setCsvToJsonDirection('csv2json'); handleCsvToJson(inputVal); }}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  csvToJsonDirection === 'csv2json' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                CSV to JSON
              </button>
              <button
                onClick={() => { setCsvToJsonDirection('json2csv'); handleCsvToJson(inputVal); }}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  csvToJsonDirection === 'json2csv' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                JSON to CSV
              </button>
            </div>
          )}

          {mode === 'md-html' && (
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              <button
                onClick={() => { setMdToHtmlDirection('md2html'); handleMdToHtml(inputVal); }}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  mdToHtmlDirection === 'md2html' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                Markdown to HTML
              </button>
              <button
                onClick={() => { setMdToHtmlDirection('html2md'); handleMdToHtml(inputVal); }}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  mdToHtmlDirection === 'html2md' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                HTML to Markdown
              </button>
            </div>
          )}

          <button
            onClick={loadSample}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
          >
            Load Sample Data
          </button>

          <button
            onClick={() => { setInputVal(''); setOutputVal(''); setStats(''); }}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
          >
            Clear
          </button>
        </div>

        {stats && (
          <span className="font-mono text-purple-300 font-semibold text-[11px] bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-800/40">
            {stats}
          </span>
        )}
      </div>

      {/* Dual Workspace Panels: Input & Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Input Panel */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Input {mode === 'csv-json' ? (csvToJsonDirection === 'csv2json' ? 'CSV' : 'JSON') : mode === 'md-html' ? (mdToHtmlDirection === 'md2html' ? 'Markdown' : 'HTML') : 'Text'}
            </span>
            <span>{inputVal.length} chars</span>
          </div>

          <textarea
            rows={16}
            value={inputVal}
            onChange={e => handleInputChange(e.target.value)}
            placeholder="Paste or type content here..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        {/* Output Panel */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-purple-400">
              Converted Output
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={copyToClipboard}
                disabled={!outputVal}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
              <button
                onClick={downloadOutput}
                disabled={!outputVal}
                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <textarea
            rows={16}
            readOnly
            value={outputVal}
            placeholder="Converted output will appear here automatically..."
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-purple-200 font-mono text-xs leading-relaxed focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </div>
  );
}

