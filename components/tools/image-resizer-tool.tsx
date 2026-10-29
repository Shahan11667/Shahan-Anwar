'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Scaling, 
  Download, 
  Lock, 
  Unlock, 
  Loader2, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [resizing, setResizing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && origWidth > 0) {
      const ratio = origHeight / origWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const applyScalePercent = (pct: number) => {
    if (origWidth > 0 && origHeight > 0) {
      const w = Math.round((origWidth * pct) / 100);
      const h = Math.round((origHeight * pct) / 100);
      setWidth(w);
      setHeight(h);
    }
  };

  const applyPreset = (w: number, h: number) => {
    setLockAspectRatio(false);
    setWidth(w);
    setHeight(h);
  };

  const handleResizeAndDownload = async () => {
    if (!previewUrl || !file || width <= 0 || height <= 0) return;

    setResizing(true);
    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, format, 0.92);
      });

      if (blob) {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        a.download = `${baseName}-${width}x${height}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
        toast.success(`Resized to ${width}x${height} and downloaded!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to resize image');
    } finally {
      setResizing(false);
    }
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
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
            <Scaling className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop an image here, or <span className="text-cyan-400 underline">browse</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Resize by exact pixels or percentage with aspect ratio lock. Fast and 100% private.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Preview Card */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Original: {origWidth} x {origHeight} px</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="aspect-[4/3] bg-slate-900 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                )}
              </div>
              <div className="text-center">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Choose another image
                </button>
              </div>
            </div>

            {/* Resize Controls */}
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-5 space-y-5">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <span>Target Dimensions</span>
              </h4>

              {/* Dimension Inputs */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={width || ''}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Aspect ratio lock button */}
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      lockAspectRatio
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title={lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                  >
                    {lockAspectRatio ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={height || ''}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Percentage Presets */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Scale by Percentage:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyScalePercent(pct)}
                      className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Presets */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Social Presets:</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => applyPreset(1080, 1080)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                  >
                    Instagram Square (1080x1080)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(1080, 1920)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                  >
                    Story / Reel (1080x1920)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(1280, 720)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                  >
                    YouTube (1280x720)
                  </button>
                </div>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Export Format:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="image/jpeg">JPG / JPEG (Standard photo format)</option>
                  <option value="image/png">PNG (Lossless & transparent)</option>
                  <option value="image/webp">WebP (Modern high-efficiency format)</option>
                </select>
              </div>

              {/* Download Button */}
              <button
                onClick={handleResizeAndDownload}
                disabled={resizing}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {resizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scaling Image...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Resize & Download ({width} x {height} px)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
