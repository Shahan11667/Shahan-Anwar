'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { 
  FileUp, 
  Trash2, 
  RotateCw, 
  Copy, 
  Download, 
  Camera, 
  Sparkles, 
  Loader2, 
  Layers, 
  Scissors, 
  RefreshCw,
  MoveLeft,
  MoveRight,
  ZoomIn,
  Eye,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface PageItem {
  pageIndex: number; // 0-indexed in original document
  rotation: number; // degrees: 0, 90, 180, 270
  selected: boolean;
  thumbnailUrl?: string;
}

export default function OrganizePdfTool() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>('document.pdf');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedScans, setCapturedScans] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load PDF file and initialize page list
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF document.');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setPdfBytes(bytes);

      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      const newPages: PageItem[] = [];
      for (let i = 0; i < pageCount; i++) {
        newPages.push({
          pageIndex: i,
          rotation: 0,
          selected: false,
        });
      }

      setPages(newPages);
      toast.success(`Loaded "${file.name}" with ${pageCount} pages!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to parse PDF document: ' + (err.message || 'Corrupted file'));
    } finally {
      setIsLoading(false);
    }
  };

  // Rotate a single page
  const rotatePage = (index: number) => {
    setPages(prev => prev.map((p, idx) => {
      if (idx === index) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  };

  // Rotate all pages
  const rotateAllPages = () => {
    setPages(prev => prev.map(p => ({
      ...p,
      rotation: (p.rotation + 90) % 360
    })));
    toast.success('Rotated all pages by 90°');
  };

  // Delete / Remove Page
  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      toast.error('PDF must contain at least one page.');
      return;
    }
    setPages(prev => prev.filter((_, idx) => idx !== index));
    toast.success(`Removed page ${index + 1}`);
  };

  // Delete all selected pages
  const deleteSelectedPages = () => {
    const selectedCount = pages.filter(p => p.selected).length;
    if (selectedCount === 0) {
      toast.error('No pages selected to remove.');
      return;
    }
    if (selectedCount === pages.length) {
      toast.error('Cannot remove all pages.');
      return;
    }
    setPages(prev => prev.filter(p => !p.selected));
    toast.success(`Removed ${selectedCount} selected page(s)`);
  };

  // Duplicate a page
  const duplicatePage = (index: number) => {
    const target = pages[index];
    const newPages = [...pages];
    newPages.splice(index + 1, 0, { ...target, selected: false });
    setPages(newPages);
    toast.success(`Duplicated page ${index + 1}`);
  };

  // Move page left
  const moveLeft = (index: number) => {
    if (index === 0) return;
    const newPages = [...pages];
    const temp = newPages[index - 1];
    newPages[index - 1] = newPages[index];
    newPages[index] = temp;
    setPages(newPages);
  };

  // Move page right
  const moveRight = (index: number) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    const temp = newPages[index + 1];
    newPages[index + 1] = newPages[index];
    newPages[index] = temp;
    setPages(newPages);
  };

  // Toggle selection
  const toggleSelect = (index: number) => {
    setPages(prev => prev.map((p, idx) => {
      if (idx === index) {
        return { ...p, selected: !p.selected };
      }
      return p;
    }));
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    const allSelected = pages.every(p => p.selected);
    setPages(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  // Extract selected pages as a new PDF
  const extractSelectedPages = async () => {
    const selected = pages.filter(p => p.selected);
    if (selected.length === 0) {
      toast.error('Please check/select the pages you want to extract.');
      return;
    }

    if (!pdfBytes) return;

    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();

      for (const p of selected) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [p.pageIndex]);
        if (p.rotation !== 0) {
          copiedPage.setRotation(degrees(p.rotation));
        }
        newDoc.addPage(copiedPage);
      }

      const outBytes = await newDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted-${selected.length}-pages-${fileName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 40, spread: 60 });
      toast.success(`Extracted ${selected.length} pages to new PDF!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Extraction failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save the full organized PDF
  const saveOrganizedPdf = async () => {
    if (!pdfBytes || pages.length === 0) {
      toast.error('No pages to save.');
      return;
    }

    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();

      for (const p of pages) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [p.pageIndex]);
        if (p.rotation !== 0) {
          copiedPage.setRotation(degrees(p.rotation));
        }
        newDoc.addPage(copiedPage);
      }

      // Append any camera captured scans
      for (const scanDataUrl of capturedScans) {
        const imgBytes = await fetch(scanDataUrl).then(r => r.arrayBuffer());
        const jpgImg = await newDoc.embedJpg(imgBytes);
        const imgPage = newDoc.addPage([jpgImg.width, jpgImg.height]);
        imgPage.drawImage(jpgImg, {
          x: 0,
          y: 0,
          width: jpgImg.width,
          height: jpgImg.height,
        });
      }

      const outBytes = await newDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organized-${fileName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 50, spread: 70 });
      toast.success('Organized PDF exported successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to export PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Camera / Scan to PDF Mode
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      toast.error('Camera access denied or unavailable.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedScans(prev => [...prev, dataUrl]);
    toast.success(`Scanned page ${capturedScans.length + 1} added!`);
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Toolbar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Organize, Split, Extract & Scan to PDF</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reorder pages with 1 click, rotate, remove unwanted pages, extract custom ranges, or scan camera paper docs directly into the PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <FileUp className="w-4 h-4 text-amber-400" />
            <span>Upload PDF</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />

          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>{cameraActive ? 'Close Camera' : 'Scan to PDF (Webcam)'}</span>
          </button>
        </div>
      </div>

      {/* Camera Scanner Viewfinder Modal / Block */}
      {cameraActive && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Live Document Camera Scanner
            </span>
            <span className="text-[11px] text-slate-400">{capturedScans.length} pages scanned</span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-xl mx-auto border border-slate-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-4 border-2 border-dashed border-white/40 pointer-events-none rounded-lg" />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={capturePhoto}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Capture & Add Page</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}

      {/* Main Grid View of Pages */}
      {pages.length > 0 ? (
        <div className="space-y-5">
          {/* Action Ribbon */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {pages.every(p => p.selected) ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-slate-400">
                {pages.length} total pages ({pages.filter(p => p.selected).length} selected)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={rotateAllPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Rotate All 90°</span>
              </button>

              <button
                onClick={deleteSelectedPages}
                disabled={pages.filter(p => p.selected).length === 0}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Selected</span>
              </button>

              <button
                onClick={extractSelectedPages}
                disabled={pages.filter(p => p.selected).length === 0 || isProcessing}
                className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Scissors className="w-3.5 h-3.5 text-purple-400" />
                <span>Extract to New PDF</span>
              </button>

              <button
                onClick={saveOrganizedPdf}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Save & Export PDF</span>
              </button>
            </div>
          </div>

          {/* Thumbnail / Page Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pages.map((p, idx) => (
              <div
                key={idx}
                className={`relative p-3 rounded-xl border transition-all flex flex-col justify-between group ${
                  p.selected 
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-2 ring-amber-500/30' 
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header: Page Badge & Checkbox */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300 font-semibold">
                    Page {idx + 1}
                  </span>
                  <input
                    type="checkbox"
                    checked={p.selected}
                    onChange={() => toggleSelect(idx)}
                    className="w-4 h-4 rounded text-amber-500 border-slate-700 cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Page Visual Canvas Representation */}
                <div 
                  onClick={() => toggleSelect(idx)}
                  className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center p-3 text-slate-800 cursor-pointer overflow-hidden transition-transform"
                  style={{ transform: `rotate(${p.rotation}deg)` }}
                >
                  <div className="w-full space-y-1.5 opacity-60 pointer-events-none">
                    <div className="h-1.5 bg-slate-400 rounded w-3/4" />
                    <div className="h-1 bg-slate-300 rounded w-full" />
                    <div className="h-1 bg-slate-300 rounded w-5/6" />
                    <div className="h-1 bg-slate-300 rounded w-4/5" />
                    <div className="h-8 bg-slate-200 rounded my-2" />
                    <div className="h-1 bg-slate-300 rounded w-full" />
                    <div className="h-1 bg-slate-300 rounded w-2/3" />
                  </div>
                  <span className="mt-2 text-[10px] text-slate-500 font-mono font-bold">
                    Orig. P.{p.pageIndex + 1}
                  </span>
                  {p.rotation !== 0 && (
                    <span className="text-[9px] text-amber-600 font-bold">({p.rotation}°)</span>
                  )}
                </div>

                {/* Bottom Page Controls */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveLeft(idx)}
                      disabled={idx === 0}
                      title="Move Left"
                      className="p-1 hover:text-white rounded disabled:opacity-20 cursor-pointer"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveRight(idx)}
                      disabled={idx === pages.length - 1}
                      title="Move Right"
                      className="p-1 hover:text-white rounded disabled:opacity-20 cursor-pointer"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => rotatePage(idx)}
                      title="Rotate 90°"
                      className="p-1 hover:text-amber-400 rounded cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicatePage(idx)}
                      title="Duplicate Page"
                      className="p-1 hover:text-blue-400 rounded cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePage(idx)}
                      title="Delete Page"
                      className="p-1 hover:text-red-400 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty Upload Placeholder */
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-12 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-amber-500/60 transition-all text-center cursor-pointer group"
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">
              Drop or Upload a PDF to Organize Pages
            </h3>
            <p className="text-xs text-slate-400">
              Drag pages to reorder, delete blank pages, rotate individual or all pages, extract chapters, and merge camera scans.
            </p>
            <span className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-medium text-xs shadow-md">
              Select PDF Document
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

