'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Eye, 
  FileDown, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ShieldCheck,
  AlignLeft,
  FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Document, Paragraph, TextRun, HeadingLevel, PageBreak, Packer } from 'docx';

interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: Array<{
    text: string;
    isHeading: boolean;
    fontSize: number;
  }>;
}

export default function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [pages, setPages] = useState<ExtractedPage[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [preserveHeadings, setPreserveHeadings] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF.js script dynamically
  const ensurePdfJsLoaded = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('Failed to initialize PDF.js'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js engine'));
      document.body.appendChild(script);
    });
  };

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid .pdf file');
      return;
    }

    setFile(selectedFile);
    setConverting(true);
    setProgress(10);
    setStatusMessage('Loading PDF engine...');

    try {
      const pdfjs = await ensurePdfJsLoaded();
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      setStatusMessage('Parsing PDF pages...');
      setProgress(25);

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const extracted: ExtractedPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        setStatusMessage(`Extracting text from page ${i} of ${numPages}...`);
        setProgress(25 + Math.round((i / numPages) * 55));

        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        let pageRawText = '';
        const linesMap = new Map<number, { text: string; fontSize: number }>();

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          const y = Math.round(item.transform[5]);
          const fontSize = Math.round(Math.hypot(item.transform[0], item.transform[1]));

          const existing = linesMap.get(y);
          if (existing) {
            existing.text += ' ' + item.str;
            if (fontSize > existing.fontSize) existing.fontSize = fontSize;
          } else {
            linesMap.set(y, { text: item.str, fontSize });
          }
          pageRawText += item.str + ' ';
        }

        // Sort lines top to bottom (descending Y in PDF coordinates)
        const sortedLines = Array.from(linesMap.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([_, line]) => ({
            text: line.text.trim(),
            isHeading: line.fontSize >= 14,
            fontSize: line.fontSize,
          }))
          .filter((l) => l.text.length > 0);

        extracted.push({
          pageNumber: i,
          text: pageRawText.trim(),
          lines: sortedLines,
        });
      }

      setPages(extracted);
      setProgress(100);
      setStatusMessage('Conversion complete! Ready to download as Word .docx');
      toast.success(`Successfully parsed ${numPages} pages!`);
    } catch (err: any) {
      console.error('PDF to Word extraction error:', err);
      toast.error(err.message || 'Failed to extract PDF contents. Ensure file is not encrypted.');
      setStatusMessage('Error parsing PDF.');
    } finally {
      setConverting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const downloadDocx = async () => {
    if (!pages.length || !file) {
      toast.error('No document content to export');
      return;
    }

    const toastId = toast.loading('Compiling Microsoft Word (.docx)...');

    try {
      const docChildren: any[] = [];

      pages.forEach((page, pageIdx) => {
        // If not first page, add page break
        if (pageIdx > 0) {
          docChildren.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
        }

        page.lines.forEach((line) => {
          if (preserveHeadings && line.isHeading) {
            docChildren.push(
              new Paragraph({
                text: line.text,
                heading: line.fontSize >= 18 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 120 },
              })
            );
          } else {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line.text,
                    size: 24, // 12pt in half-points
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        });
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      a.download = `${baseName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      toast.success('Word document (.docx) downloaded successfully!', { id: toastId });
    } catch (err: any) {
      console.error('Docx generation error:', err);
      toast.error('Failed to generate Word document: ' + err.message, { id: toastId });
    }
  };

  const handleCopyAll = () => {
    const fullText = pages.map((p) => `--- PAGE ${p.pageNumber} ---\n` + p.text).join('\n\n');
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('All text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalWords = pages.reduce(
    (acc, p) => acc + p.text.split(/\s+/).filter(Boolean).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!pages.length && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative p-10 sm:p-14 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer group ${
            isDragOver 
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
              : 'border-slate-800 bg-slate-950/60 hover:border-blue-500/50 hover:bg-slate-900/40'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Upload PDF Document
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Convert your PDF into an editable Microsoft Word (.docx) document
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Genuine .docx Format</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Preserves Headings</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Page Breaks Retained</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">100% In-Browser Privacy</span>
            </div>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Select PDF File</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress State */}
      {converting && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              {statusMessage || 'Processing PDF document...'}
            </span>
            <span className="font-mono text-blue-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Converted State & Preview */}
      {pages.length > 0 && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                  {file?.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {pages.length} pages • <strong className="text-slate-300">{totalWords}</strong> words extracted
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setFile(null);
                  setPages([]);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors cursor-pointer"
              >
                Upload Another
              </button>

              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All Text'}</span>
              </button>

              <button
                onClick={downloadDocx}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Word (.docx)</span>
              </button>
            </div>
          </div>

          {/* Options & Tab Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Formatted View
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'raw'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw Text
              </button>
            </div>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={preserveHeadings}
                onChange={(e) => setPreserveHeadings(e.target.checked)}
                className="rounded border-slate-800 text-blue-500 focus:ring-0"
              />
              <span>Detect & Preserve Headings in .docx</span>
            </label>
          </div>

          {/* Document Preview Sheets */}
          <div className="space-y-6">
            {activeTab === 'preview' ? (
              pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="rounded-2xl bg-white text-slate-900 p-8 sm:p-12 shadow-2xl border border-slate-200/50 max-w-4xl mx-auto"
                  style={{
                    minHeight: '600px',
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 text-xs text-slate-500 font-mono">
                    <span>PAGE {page.pageNumber} OF {pages.length}</span>
                    <span>{page.lines.length} lines</span>
                  </div>

                  <div className="space-y-3 font-sans leading-relaxed text-sm sm:text-base">
                    {page.lines.map((line, idx) => {
                      if (preserveHeadings && line.isHeading) {
                        return (
                          <h3
                            key={idx}
                            className="font-bold text-slate-900 mt-4 mb-2 text-lg sm:text-xl border-b border-slate-100 pb-1"
                          >
                            {line.text}
                          </h3>
                        );
                      }
                      return (
                        <p key={idx} className="text-slate-800">
                          {line.text}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed max-h-[600px] overflow-y-auto">
                {pages.map((p) => (
                  <div key={p.pageNumber} className="mb-6">
                    <div className="text-blue-400 font-bold mb-2">--- Page {p.pageNumber} ---</div>
                    <p className="whitespace-pre-wrap">{p.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy Guarantee */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">100% Client-Side Privacy:</strong>
          <p className="mt-0.5">
            Your PDF is parsed and rebuilt into a genuine Word .docx document directly in your browser. No files are uploaded to external servers.
          </p>
        </div>
      </div>
    </div>
  );
}

