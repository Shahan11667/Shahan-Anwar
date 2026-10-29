'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Minimize2, 
  Download, 
  Loader2, 
  Sparkles, 
  Check, 
  Sliders,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(75);
  const [maxDimensionScale, setMaxDimensionScale] = useState<number>(1);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
  };

  const compressImage = async () => {
    if (!file || !originalUrl) return;

    setCompressing(true);
    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      const targetWidth = Math.round(img.naturalWidth * maxDimensionScale);
      const targetHeight = Math.round(img.naturalHeight * maxDimensionScale);
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Use better smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If output format is JPEG or WebP, fill white background for transparency
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      if (outputType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const targetQuality = quality / 100;
      const blob = await new Promise<Blob | null>((resolve) => {
        // If PNG and quality < 90, compress as WebP/JPEG for significant savings
        if (file.type === 'image/png' && quality < 90) {
          canvas.toBlob(resolve, 'image/webp', targetQuality);
        } else {
          canvas.toBlob(resolve, outputType, targetQuality);
        }
      });

      if (blob) {
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        const url = URL.createObjectURL(blob);
        setCompressedBlob(blob);
        setCompressedUrl(url);
        setCompressedSize(blob.size);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to compress image');
    } finally {
      setCompressing(false);
    }
  };

  useEffect(() => {
    if (file && originalUrl) {
      compressImage();
    }
  }, [file, originalUrl, quality, maxDimensionScale]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const savingsPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  const downloadCompressed = () => {
    if (!compressedUrl || !file) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    const ext = compressedBlob?.type.includes('webp')
      ? 'webp'
      : file.type.includes('png') && quality >= 90
      ? 'png'
      : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
    toast.success('Downloaded optimized image!');
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
              ? 'border-emerald-500 bg-emerald-500/10'
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
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <Minimize2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop an image here, or <span className="text-emerald-400 underline">browse</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Compress JPG, PNG, and WebP up to 90% without visible quality loss. Instant and 100% private.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Original File Size</span>
              <p className="text-lg font-bold text-white mt-1">
                {formatSize(originalSize)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Compressed Size</span>
              <p className="text-lg font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                {compressing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  formatSize(compressedSize)
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-950/40 to-teal-950/40 border border-emerald-800/60 text-center">
              <span className="text-xs text-emerald-300 font-medium">Saved</span>
              <p className="text-lg font-extrabold text-emerald-300 mt-1 flex items-center justify-center gap-1">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                <span>{savingsPercent}% smaller</span>
              </p>
            </div>
          </div>

          {/* Quality Slider Controls */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Compression Quality: {quality}%</span>
              </label>
              <span className="text-xs text-slate-400">
                {quality > 80 ? 'High Quality' : quality > 60 ? 'Optimal Web' : 'Max Compression'}
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Resolution Scale:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Original (100%)', val: 1 },
                  { label: '75%', val: 0.75 },
                  { label: '50%', val: 0.5 },
                ].map((scaleOpt) => (
                  <button
                    key={scaleOpt.label}
                    onClick={() => setMaxDimensionScale(scaleOpt.val)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      maxDimensionScale === scaleOpt.val
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {scaleOpt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side-by-Side Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Preview */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Original Image</span>
                <span className="text-slate-400">{formatSize(originalSize)}</span>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center bg-slate-950/80">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-64 max-w-full object-contain rounded"
                  />
                )}
              </div>
            </div>

            {/* Compressed Preview */}
            <div className="rounded-xl bg-slate-950 border border-emerald-800/40 overflow-hidden flex flex-col">
              <div className="p-3 bg-emerald-950/30 border-b border-emerald-800/40 text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span>Compressed Preview ({savingsPercent}% reduction)</span>
                <span>{formatSize(compressedSize)}</span>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center bg-slate-950/80">
                {compressedUrl && (
                  <img
                    src={compressedUrl}
                    alt="Compressed"
                    className="max-h-64 max-w-full object-contain rounded"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={downloadCompressed}
              disabled={!compressedUrl || compressing}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl hover:shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>Download Optimized Image ({formatSize(compressedSize)})</span>
            </button>

            <button
              onClick={() => {
                setFile(null);
                setOriginalUrl(null);
                setCompressedUrl(null);
              }}
              className="px-4 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
            >
              Compress Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
