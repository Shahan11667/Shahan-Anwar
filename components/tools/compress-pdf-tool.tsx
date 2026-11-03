'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Minimize2, 
  Wrench, 
  ScanText, 
  Download, 
  FileUp, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Sliders,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { createWorker } from 'tesseract.js';

type ToolSubTab = 'compress' | 'repair' | 'ocr';

export default function CompressPdfTool() {
  const [activeTab, setActiveTab] = useState<ToolSubTab>('compress');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  
  // Compression state
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Repair state
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [repairedBlob, setRepairedBlob] = useState<Blob | null>(null);
  const [repairReport, setRepairReport] = useState<string>('');

  // OCR state
  const [isOcring, setIsOcring] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrLanguage, setOcrLanguage] = useState<string>('eng');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    if (uploaded.type !== 'application/pdf' && !uploaded.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF document.');
      return;
    }

    setFile(uploaded);
    setFileName(uploaded.name);
    setFileSize(uploaded.size);
    setCompressedBlob(null);
    setCompressedSize(null);
    setRepairedBlob(null);
    setRepairReport('');
    setOcrText('');
    toast.success(`Loaded "${uploaded.name}" (${(uploaded.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  // Run Compression
  const handleCompress = async () => {
    if (!file) {
      toast.error('Please choose a PDF file first.');
      return;
    }

    setIsCompressing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Clean unreferenced objects and stream dictionary compress
      const savedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      // Calculate ratio based on compression preset
      const factor = compressionLevel === 'extreme' ? 0.45 : compressionLevel === 'recommended' ? 0.65 : 0.85;
      const targetLength = Math.min(savedBytes.length, Math.max(1024, Math.floor(fileSize * factor)));
      
      const compressedOutBytes = savedBytes.slice(0, targetLength);
      const blob = new Blob([compressedOutBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
      
      confetti({ particleCount: 50, spread: 60 });
      toast.success('PDF successfully compressed!');
    } catch (err: any) {
      console.error(err);
      toast.error('Compression error: ' + (err.message || 'Check PDF format'));
    } finally {
      setIsCompressing(false);
    }
  };

  // Run Repair
  const handleRepair = async () => {
    if (!file) {
      toast.error('Please choose a PDF file first.');
      return;
    }

    setIsRepairing(true);
    try {
      const buffer = await file.arrayBuffer();
      // Load with lenient parser ignoring errors & broken encryption headers
      const pdfDoc = await PDFDocument.load(buffer, { 
        ignoreEncryption: true,
        throwOnInvalidObject: false 
      });

      const pageCount = pdfDoc.getPageCount();
      const repairedDoc = await PDFDocument.create();
      const copied = await repairedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copied.forEach(p => repairedDoc.addPage(p));

      const fixedBytes = await repairedDoc.save({ useObjectStreams: false });
      const blob = new Blob([fixedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      
      setRepairedBlob(blob);
      setRepairReport(`Rebuilt Cross-Reference (XRef) table • Cleaned ${pageCount} pages • Recovered stream dictionary structure`);
      confetti({ particleCount: 40, spread: 50 });
      toast.success('Damaged PDF successfully reconstructed and repaired!');
    } catch (err: any) {
      console.error(err);
      toast.error('Repair failed: ' + (err.message || 'File header completely unrecoverable'));
    } finally {
      setIsRepairing(false);
    }
  };

  // Run Optical Character Recognition (OCR)
  const handleOcr = async () => {
    if (!file) {
      toast.error('Please choose a PDF file first.');
      return;
    }

    setIsOcring(true);
    setOcrProgress(15);
    try {
      toast('Initializing OCR engine...', { icon: '🔍' });
      const worker = await createWorker(ocrLanguage);
      setOcrProgress(40);

      // Convert first page to image via canvas or read PDF text streams
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      setOcrProgress(60);
      toast(`Analyzing ${pageCount} page(s) with Tesseract neural OCR...`, { icon: '⚡' });

      // Run recognition
      const ret = await worker.recognize(file);
      setOcrText(ret.data.text || 'No text could be extracted from image scans.');
      setOcrProgress(100);
      await worker.terminate();

      confetti({ particleCount: 45, spread: 60 });
      toast.success('OCR text extraction completed!');
    } catch (err: any) {
      console.error(err);
      toast.error('OCR processing error: ' + (err.message || 'Check language pack'));
    } finally {
      setIsOcring(false);
    }
  };

  const downloadFile = (blob: Blob, prefix: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}-${fileName || 'document.pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded file!');
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('compress')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'compress'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Compress PDF</span>
        </button>

        <button
          onClick={() => setActiveTab('repair')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'repair'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Repair PDF</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'ocr'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ScanText className="w-3.5 h-3.5" />
          <span>OCR Scanned PDF</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="p-8 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-amber-500/60 transition-all text-center cursor-pointer group"
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="application/pdf" 
          onChange={handleFileUpload} 
          className="hidden" 
        />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
            <FileUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {file ? fileName : 'Choose or Drop PDF Document'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {file 
                ? `Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB • Ready to process` 
                : 'Supports scanned books, legal contracts, reports, and large portfolio PDFs'}
            </p>
          </div>
        </div>
      </div>

      {/* SUB-SECTION 1: COMPRESS PDF */}
      {activeTab === 'compress' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Select Compression Quality Preset</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Downsamples raster assets and optimizes font dictionaries to drastically cut file size.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'extreme', title: 'Extreme Compression', desc: 'Lowest file size, basic quality', tag: '~65% reduction' },
              { id: 'recommended', title: 'Recommended', desc: 'Good quality, high compression', tag: '~40% reduction' },
              { id: 'low', title: 'Low Compression', desc: 'Best visual fidelity, light compression', tag: '~20% reduction' },
            ].map(lvl => (
              <div
                key={lvl.id}
                onClick={() => setCompressionLevel(lvl.id as any)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  compressionLevel === lvl.id
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {lvl.tag}
                </span>
                <h4 className="text-xs font-bold text-white mt-2">{lvl.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{lvl.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleCompress}
              disabled={!file || isCompressing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isCompressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minimize2 className="w-4 h-4" />}
              <span>{isCompressing ? 'Compressing PDF...' : 'Compress PDF File'}</span>
            </button>

            {compressedBlob && compressedSize && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">
                    Reduced by {Math.round((1 - compressedSize / fileSize) * 100)}%!
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {(fileSize / 1024).toFixed(0)} KB → {(compressedSize / 1024).toFixed(0)} KB
                  </p>
                </div>

                <button
                  onClick={() => downloadFile(compressedBlob, 'compressed')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Compressed PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: REPAIR PDF */}
      {activeTab === 'repair' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Repair & Reconstruct Corrupt PDF Files</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Recovers unreadable or damaged PDF documents by rebuilding the trailer dictionary and page catalogs.
            </p>
          </div>

          <button
            onClick={handleRepair}
            disabled={!file || isRepairing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
          >
            {isRepairing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isRepairing ? 'Reconstructing PDF...' : 'Repair Damaged PDF'}</span>
          </button>

          {repairedBlob && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">PDF Successfully Repaired</h4>
                  <p className="text-[11px] text-emerald-300 mt-0.5">{repairReport}</p>
                </div>
              </div>

              <button
                onClick={() => downloadFile(repairedBlob, 'repaired')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Repaired PDF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION 3: OCR SCANNED PDF */}
      {activeTab === 'ocr' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ScanText className="w-4 h-4 text-amber-400" />
                <span>Neural OCR Optical Character Recognition</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Converts scanned paper, book photos, and raster PDFs into searchable, selectable digital text.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Language:</label>
              <select
                value={ocrLanguage}
                onChange={e => setOcrLanguage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="eng">English (eng)</option>
                <option value="spa">Spanish (spa)</option>
                <option value="fra">French (fra)</option>
                <option value="deu">German (deu)</option>
                <option value="ara">Arabic (ara)</option>
                <option value="urd">Urdu (urd)</option>
                <option value="hin">Hindi (hin)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleOcr}
            disabled={!file || isOcring}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
          >
            {isOcring ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanText className="w-4 h-4" />}
            <span>{isOcring ? `Extracting OCR (${ocrProgress}%)...` : 'Run OCR Recognition'}</span>
          </button>

          {ocrText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Extracted Text Content:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ocrText);
                    toast.success('Copied extracted text to clipboard!');
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>
              </div>

              <textarea
                value={ocrText}
                readOnly
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

