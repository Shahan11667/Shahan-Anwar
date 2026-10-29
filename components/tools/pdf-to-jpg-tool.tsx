'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileDown, 
  Loader2, 
  CheckCircle, 
  FileSpreadsheet, 
  Download,
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface PagePreview {
  pageNumber: number;
  dataUrl: string;
}

export default function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [rendering, setRendering] = useState(false);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState<number>(1.5); // 1.5x for sharp HD rendering
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid .pdf file');
      return;
    }

    setFile(selectedFile);
    setPages([]);
    setRendering(true);
    setProgress(0);

    try {
      const pdfjsLib = await ensurePdfJsLoaded();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const renderedPages: PagePreview[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          renderedPages.push({ pageNumber: i, dataUrl });
        }
        setProgress(Math.round((i / totalPages) * 100));
      }

      setPages(renderedPages);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      toast.success(`Successfully rendered ${renderedPages.length} pages!`);
    } catch (err) {
      console.error(err);
      toast.error('Could not render PDF. Make sure it is not password protected.');
    } finally {
      setRendering(false);
    }
  };

  const downloadPage = (pageNumber: number, dataUrl: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}-page-${pageNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllPages = () => {
    pages.forEach((p, idx) => {
      setTimeout(() => {
        downloadPage(p.pageNumber, p.dataUrl);
      }, idx * 250);
    });
    toast.success(`Downloading ${pages.length} images...`);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      {!file && (
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
              ? 'border-amber-500 bg-amber-500/10'
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
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop your PDF here, or <span className="text-amber-400 underline">browse</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Extract pages into high-resolution JPG images. 100% private, processed in your browser.
          </p>
        </div>
      )}

      {/* Rendering Progress */}
      {rendering && (
        <div className="p-8 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">
              Rendering PDF Pages in High Resolution...
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Processing on your device • {progress}% complete
            </p>
          </div>
          <div className="w-full max-w-md mx-auto bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Rendered Pages View */}
      {pages.length > 0 && !rendering && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">
                {file?.name}
              </h4>
              <p className="text-xs text-slate-400">
                {pages.length} page{pages.length > 1 ? 's' : ''} extracted successfully
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadAllPages}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All JPGs</span>
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setPages([]);
                }}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Convert Another PDF
              </button>
            </div>
          </div>

          {/* Grid of Pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((p) => (
              <div
                key={p.pageNumber}
                className="group rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-slate-900 flex items-center justify-center p-2">
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[11px] font-bold text-white z-10">
                    Page {p.pageNumber}
                  </span>
                  <img
                    src={p.dataUrl}
                    alt={`Page ${p.pageNumber}`}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>

                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Page {p.pageNumber}
                  </span>
                  <button
                    onClick={() => downloadPage(p.pageNumber, p.dataUrl)}
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
