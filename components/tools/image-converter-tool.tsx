'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  RefreshCw, 
  Download, 
  Loader2, 
  Sparkles, 
  Check, 
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [converting, setConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image');
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setConvertedUrl(null);
  };

  const handleConvert = async () => {
    if (!previewUrl || !file) return;

    setConverting(true);
    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, targetFormat, 0.95);
      });

      if (blob) {
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedSize(blob.size);

        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        toast.success('Converted successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to convert image');
    } finally {
      setConverting(false);
    }
  };

  const downloadConverted = () => {
    if (!convertedUrl || !file) return;
    const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
              ? 'border-pink-500 bg-pink-500/10'
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
          <div className="w-14 h-14 mx-auto rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop an image to convert, or <span className="text-pink-400 underline">browse</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Convert freely between JPG, PNG, and WebP format. Fast, lossless, 100% private.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">{file.name}</h4>
              <p className="text-xs text-slate-400">
                {(file.size / 1024).toFixed(1)} KB • Original format: {file.type.split('/')[1]?.toUpperCase()}
              </p>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setConvertedUrl(null);
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              Choose another
            </button>
          </div>

          {/* Conversion Options */}
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <label className="block text-sm font-medium text-white">
              Select Output Format:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { format: 'image/png', label: 'PNG', desc: 'Lossless, supports transparency' },
                { format: 'image/jpeg', label: 'JPG', desc: 'Standard high-compat photo' },
                { format: 'image/webp', label: 'WebP', desc: 'Modern small file size web format' },
              ].map((item) => (
                <button
                  key={item.format}
                  type="button"
                  onClick={() => {
                    setTargetFormat(item.format as any);
                    setConvertedUrl(null);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    targetFormat === item.format
                      ? 'bg-pink-500/20 border-pink-500/50 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-base font-bold text-white mb-0.5">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center pt-4">
              {!convertedUrl ? (
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl hover:shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Converting...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Convert to {targetFormat.split('/')[1]?.toUpperCase()}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={downloadConverted}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl hover:shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Converted File ({(convertedSize / 1024).toFixed(1)} KB)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
