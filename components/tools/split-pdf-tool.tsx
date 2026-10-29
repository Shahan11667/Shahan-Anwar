'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  Split, 
  FileDown, 
  Loader2, 
  FileText, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('');
  const [splitting, setSplitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid .pdf file');
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();

      setFile(selectedFile);
      setPageCount(count);
      setPageRange(`1-${count}`);
      toast.success(`Loaded PDF with ${count} page${count > 1 ? 's' : ''}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not load PDF. It may be corrupted or encrypted.');
    }
  };

  const parseRanges = (input: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    const parts = input.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          indices.add(page - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file || pageCount === 0) {
      toast.error('Please upload a PDF file first');
      return;
    }

    const targetIndices = parseRanges(pageRange, pageCount);
    if (targetIndices.length === 0) {
      toast.error('No valid pages found in range. Example: "1-3, 5"');
      return;
    }

    try {
      setSplitting(true);
      const fileBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileBuffer);
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(sourcePdf, targetIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      a.download = `${baseName}-extracted-pages.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      toast.success(`Extracted ${targetIndices.length} page(s) successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract pages. Please try again.');
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
            <Split className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop your PDF to split, or <span className="text-blue-400 underline">browse</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Extract custom pages or ranges into a separate PDF file instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Loaded File Info Card */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{file.name}</h4>
                <p className="text-xs text-slate-400">
                  {pageCount} total pages • {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setPageCount(0);
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Choose another PDF
            </button>
          </div>

          {/* Page Range Input */}
          <div className="p-6 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Specify pages or page ranges to extract:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Available pages: <strong>1 to {pageCount}</strong>. Example formats: &quot;1-5&quot;, &quot;2, 4, 7&quot;, or &quot;1-3, 6-8&quot;.
                </span>
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-500">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setPageRange('1')}
                className="text-xs px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                First Page Only
              </button>
              <button
                type="button"
                onClick={() => setPageRange(`${pageCount}`)}
                className="text-xs px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                Last Page Only
              </button>
              {pageCount > 1 && (
                <button
                  type="button"
                  onClick={() => setPageRange(`1-${Math.ceil(pageCount / 2)}`)}
                  className="text-xs px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  First Half (1-{Math.ceil(pageCount / 2)})
                </button>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center pt-2">
            <button
              onClick={handleSplit}
              disabled={splitting}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base shadow-xl hover:shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {splitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Slicing PDF Pages...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  <span>Extract Selected Pages</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
