'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { 
  RotateCw, 
  Hash, 
  Stamp, 
  Crop, 
  CheckSquare, 
  Download, 
  FileUp, 
  Sparkles, 
  Loader2, 
  Eye,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type AnnotateTab = 'watermark' | 'pagenumbers' | 'rotate' | 'crop' | 'forms';

export default function PdfAnnotateTool() {
  const [activeTab, setActiveTab] = useState<AnnotateTab>('watermark');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  // Watermark Settings
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(48);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(45);

  // Page Number Settings
  const [pageNumberFormat, setPageNumberFormat] = useState<'page_x_of_y' | 'x_y' | 'simple'>('page_x_of_y');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom_center' | 'bottom_right' | 'top_right'>('bottom_center');
  const [pageNumberStart, setPageNumberStart] = useState<number>(1);

  // Rotate Settings
  const [rotateDegrees, setRotateDegrees] = useState<number>(90);

  // Forms Settings
  const [formFields, setFormFields] = useState<Array<{ name: string; value: string; type: 'text' | 'checkbox' }>>([
    { name: 'Full Name', value: 'Alex Vance', type: 'text' },
    { name: 'Email Address', value: 'alex@example.com', type: 'text' },
    { name: 'I agree to terms and conditions', value: 'true', type: 'checkbox' },
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    if (uploaded.type !== 'application/pdf' && !uploaded.name.endsWith('.pdf')) {
      toast.error('Please choose a valid PDF file.');
      return;
    }

    setFile(uploaded);
    setFileName(uploaded.name);
    setOutputBlob(null);
    toast.success(`Loaded "${uploaded.name}"!`);
  };

  // Apply Watermark
  const handleApplyWatermark = async () => {
    if (!file) {
      toast.error('Please choose a PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: watermarkFontSize,
          font: helveticaBold,
          color: rgb(0.8, 0.2, 0.2),
          opacity: watermarkOpacity,
          rotate: degrees(watermarkAngle),
        });
      }

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setOutputBlob(blob);

      confetti({ particleCount: 50, spread: 60 });
      toast.success('Watermark added to all pages!');
    } catch (err: any) {
      toast.error('Watermark error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply Page Numbers
  const handleApplyPageNumbers = async () => {
    if (!file) {
      toast.error('Please choose a PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const total = pages.length;

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        const current = idx + pageNumberStart;

        let label = '';
        if (pageNumberFormat === 'page_x_of_y') label = `Page ${current} of ${total}`;
        else if (pageNumberFormat === 'x_y') label = `${current} / ${total}`;
        else label = `${current}`;

        let xPos = width / 2 - 30;
        let yPos = 30;

        if (pageNumberPosition === 'bottom_right') {
          xPos = width - 90;
          yPos = 30;
        } else if (pageNumberPosition === 'top_right') {
          xPos = width - 90;
          yPos = height - 30;
        }

        page.drawText(label, {
          x: xPos,
          y: yPos,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setOutputBlob(blob);

      confetti({ particleCount: 50, spread: 60 });
      toast.success('Page numbers stamped on all pages!');
    } catch (err: any) {
      toast.error('Numbering error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply Global Rotation
  const handleApplyRotation = async () => {
    if (!file) {
      toast.error('Please choose a PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      pages.forEach(p => {
        const current = p.getRotation().angle;
        p.setRotation(degrees((current + rotateDegrees) % 360));
      });

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setOutputBlob(blob);

      confetti({ particleCount: 50, spread: 60 });
      toast.success(`Rotated all pages by ${rotateDegrees}°!`);
    } catch (err: any) {
      toast.error('Rotation error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = (prefix: string) => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}-${fileName || 'document.pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded modified PDF!');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800 max-w-xl mx-auto overflow-x-auto">
        {[
          { id: 'watermark', label: 'Add Watermark', icon: Stamp },
          { id: 'pagenumbers', label: 'Page Numbers', icon: Hash },
          { id: 'rotate', label: 'Rotate PDF', icon: RotateCw },
          { id: 'forms', label: 'PDF Forms', icon: CheckSquare },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setOutputBlob(null); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* File Upload Box */}
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
              Add stamps, pagination, headers, rotation or fillable form fields
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: WATERMARK */}
      {activeTab === 'watermark' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Stamp className="w-4 h-4 text-amber-400" />
                <span>Custom Watermark Stamp</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stamps custom diagonal text or confidentiality notices across all pages with transparency.
              </p>
            </div>

            <button
              onClick={handleApplyWatermark}
              disabled={!file || isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Apply Watermark</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Opacity ({Math.round(watermarkOpacity * 100)}%)</label>
              <input
                type="range"
                min="0.05"
                max="0.9"
                step="0.05"
                value={watermarkOpacity}
                onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
                className="w-full accent-amber-500 mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Font Size ({watermarkFontSize}px)</label>
              <input
                type="range"
                min="24"
                max="96"
                step="4"
                value={watermarkFontSize}
                onChange={e => setWatermarkFontSize(parseInt(e.target.value))}
                className="w-full accent-amber-500 mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Rotation Angle ({watermarkAngle}°)</label>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={watermarkAngle}
                onChange={e => setWatermarkAngle(parseInt(e.target.value))}
                className="w-full accent-amber-500 mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAGE NUMBERS */}
      {activeTab === 'pagenumbers' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-400" />
                <span>Add Page Numbers & Pagination</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically stamps standardized page numbers, headers, or footers.
              </p>
            </div>

            <button
              onClick={handleApplyPageNumbers}
              disabled={!file || isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
              <span>Stamp Page Numbers</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Numbering Format</label>
              <select
                value={pageNumberFormat}
                onChange={e => setPageNumberFormat(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="page_x_of_y">Page X of Y</option>
                <option value="x_y">X / Y</option>
                <option value="simple">X (Simple number)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Position on Page</label>
              <select
                value={pageNumberPosition}
                onChange={e => setPageNumberPosition(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="bottom_center">Bottom Center</option>
                <option value="bottom_right">Bottom Right</option>
                <option value="top_right">Top Right</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Starting Page Number</label>
              <input
                type="number"
                min="1"
                value={pageNumberStart}
                onChange={e => setPageNumberStart(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              >
              </input>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROTATE PDF */}
      {activeTab === 'rotate' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-amber-400" />
                <span>Rotate All Pages in PDF</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanently fixes upside-down or sideways PDF scans.
              </p>
            </div>

            <button
              onClick={handleApplyRotation}
              disabled={!file || isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
              <span>Rotate Document</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {[90, 180, 270].map(deg => (
              <button
                key={deg}
                onClick={() => setRotateDegrees(deg)}
                className={`py-3 px-6 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  rotateDegrees === deg 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Rotate {deg}° Clockwise
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PDF FORMS */}
      {activeTab === 'forms' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>PDF Interactive Form Filler</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill out form field values, checkboxes, and signatures on digital application forms.
            </p>
          </div>

          <div className="space-y-3">
            {formFields.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 w-1/3 truncate">{f.name}:</span>
                {f.type === 'text' ? (
                  <input
                    type="text"
                    value={f.value}
                    onChange={e => {
                      const next = [...formFields];
                      next[i].value = e.target.value;
                      setFormFields(next);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={f.value === 'true'}
                    onChange={e => {
                      const next = [...formFields];
                      next[i].value = e.target.checked ? 'true' : 'false';
                      setFormFields(next);
                    }}
                    className="w-4 h-4 accent-amber-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Download Action */}
      {outputBlob && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Document Processed Successfully</h4>
              <p className="text-[11px] text-emerald-300 mt-0.5">Ready for instant download</p>
            </div>
          </div>

          <button
            onClick={() => downloadResult(activeTab)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Modified PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}

