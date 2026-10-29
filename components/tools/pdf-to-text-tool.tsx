'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  Sparkles,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function PdfToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extracting, setExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      script.onerror = () => reject(new Error('Failed to load PDF engine'));
      document.body.appendChild(script);
    });
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid .pdf file');
      return;
    }

    setFile(selectedFile);
    setExtracting(true);
    setProgress(0);

    try {
      const pdfjsLib = await ensurePdfJsLoaded();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map((item: any) => item.str);
        fullText += `--- PAGE ${i} ---\n` + pageStrings.join(' ') + '\n\n';
        setProgress(Math.round((i / totalPages) * 100));
      }

      setExtractedText(fullText.trim());
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      toast.success(`Extracted text from ${totalPages} pages!`);
    } catch (err) {
      console.error(err);
      toast.error('Could not extract text. Make sure the PDF contains readable text.');
    } finally {
      setExtracting(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success('Copied text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-extracted-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded text file!');
  };

  return (
    <div className="space-y-6">
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
              ? 'border-teal-500 bg-teal-500/10'
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
          <div className="w-14 h-14 mx-auto rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop your PDF to extract text, or <span className="text-teal-400 underline">browse</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Extract digital text from multi-page PDFs directly in your browser. 100% private.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">{file.name}</h4>
              <p className="text-xs text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!extractedText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All Text'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!extractedText}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
                title="Download as .txt"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setExtractedText('');
                }}
                className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Upload another"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {extracting ? (
            <div className="p-12 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">Extracting text streams...</h4>
                <p className="text-xs text-slate-400 mt-1">{progress}% processed</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 p-4 sm:p-6 text-white text-xs sm:text-sm leading-relaxed focus:outline-none resize-y font-mono"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
