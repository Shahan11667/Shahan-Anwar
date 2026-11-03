'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Download, 
  Copy, 
  Sparkles, 
  Layers, 
  Monitor, 
  Smartphone, 
  Globe, 
  Maximize2, 
  Check, 
  Sliders, 
  Eye, 
  RotateCw, 
  Share2, 
  Search, 
  Eraser, 
  Hash, 
  ShieldCheck, 
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type FrameStyle = 'mac-dark' | 'mac-light' | 'browser' | 'phone' | 'glass' | 'shadow-only';
type BackgroundPreset = 'mesh' | 'sunset' | 'aurora' | 'cyber' | 'studio-dark' | 'studio-light' | 'transparent';

export default function ScreenshotStudioTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('screenshot-mockup');
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('mac-dark');
  const [bgPreset, setBgPreset] = useState<BackgroundPreset>('mesh');
  const [customBgColor, setCustomBgColor] = useState<string>('#6366f1');
  const [windowTitle, setWindowTitle] = useState<string>('app.example.com');

  // Sliders
  const [padding, setPadding] = useState<number>(48);
  const [borderRadius, setBorderRadius] = useState<number>(14);
  const [shadowBlur, setShadowBlur] = useState<number>(36);
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.35);
  const [tiltX, setTiltX] = useState<number>(0);
  const [tiltY, setTiltY] = useState<number>(0);
  const [scale, setScale] = useState<number>(100);

  // Loupe Magnifier
  const [showLoupe, setShowLoupe] = useState<boolean>(false);
  const [loupeX, setLoupeX] = useState<number>(50);
  const [loupeY, setLoupeY] = useState<number>(50);

  // Numbered step badges
  const [badges, setBadges] = useState<Array<{ id: string; num: number; x: number; y: number }>>([]);
  const [isAddingBadge, setIsAddingBadge] = useState<boolean>(false);

  // Exporting state
  const [exporting, setExporting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFileLoad(file);
            toast.success('Pasted screenshot from clipboard!');
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileLoad = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setBadges([]);
  };

  // Direct Screen / Tab Capture via Web API
  const handleCaptureScreen = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast.error('Screen capture is not supported on this device/browser');
        return;
      }
      toast.loading('Select a screen, window, or tab to capture...', { id: 'capture' });
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setImageSrc(dataUrl);
            setFileName(`screen-capture-${Date.now()}`);
            toast.success('Screen captured in high resolution!', { id: 'capture' });
            confetti({ particleCount: 35, spread: 60 });
          }
          // Stop media tracks
          stream.getTracks().forEach((track) => track.stop());
        }, 300);
      };
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        toast.error('Capture cancelled or failed: ' + err.message, { id: 'capture' });
      } else {
        toast.dismiss('capture');
      }
    }
  };

  // Add numbered step badge on click
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingBadge || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setBadges((prev) => [
      ...prev,
      {
        id: 'bdg-' + Date.now(),
        num: prev.length + 1,
        x: Math.max(2, Math.min(95, x)),
        y: Math.max(2, Math.min(95, y)),
      },
    ]);
    setIsAddingBadge(false);
    toast.success(`Badge #${badges.length + 1} placed!`);
  };

  // Render high-DPI canvas for copy & download
  const generateCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const width = 1600;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // 1. Draw Background
    if (bgPreset === 'mesh') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#ec4899');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgPreset === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#e11d48');
      grad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgPreset === 'aurora') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(0.5, '#06b6d4');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgPreset === 'cyber') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgPreset === 'studio-dark') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);
    } else if (bgPreset === 'studio-light') {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    // 2. Draw Screenshot with Frame
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res) => { img.onload = res; });

      const pad = (padding / 100) * 200;
      const targetW = width - pad * 2;
      const aspect = img.naturalWidth / img.naturalHeight;
      let targetH = targetW / aspect;
      const maxH = height - pad * 2 - (frameStyle.includes('mac') || frameStyle === 'browser' ? 60 : 0);
      if (targetH > maxH) {
        targetH = maxH;
      }
      const actualW = targetH * aspect;
      const startX = (width - actualW) / 2;
      const headerH = frameStyle.includes('mac') || frameStyle === 'browser' ? 44 : 0;
      const startY = (height - (targetH + headerH)) / 2;

      // Draw Shadow
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
      ctx.shadowBlur = shadowBlur * 2;
      ctx.shadowOffsetY = 24;

      // Draw Window Container
      const r = borderRadius * 1.5;
      ctx.fillStyle = frameStyle === 'mac-light' ? '#f8fafc' : '#0f172a';
      ctx.beginPath();
      ctx.roundRect(startX, startY, actualW, targetH + headerH, r);
      ctx.fill();
      ctx.restore();

      // Window Header Bar
      if (headerH > 0) {
        ctx.fillStyle = frameStyle === 'mac-light' ? '#e2e8f0' : '#1e293b';
        ctx.beginPath();
        ctx.roundRect(startX, startY, actualW, headerH, [r, r, 0, 0]);
        ctx.fill();

        // Mac Traffic Light Dots
        const dotY = startY + headerH / 2;
        ctx.fillStyle = '#ff5f56';
        ctx.beginPath(); ctx.arc(startX + 22, dotY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffbd2e';
        ctx.beginPath(); ctx.arc(startX + 40, dotY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27c93f';
        ctx.beginPath(); ctx.arc(startX + 58, dotY, 6, 0, Math.PI * 2); ctx.fill();

        // Address Bar or Title
        if (frameStyle === 'browser') {
          const addrW = Math.min(320, actualW - 140);
          const addrX = startX + (actualW - addrW) / 2;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(addrX, startY + 8, addrW, 28, 6);
          ctx.fill();

          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(windowTitle || 'https://example.com', startX + actualW / 2, startY + 22);
        }
      }

      // Draw Main Image
      ctx.drawImage(img, startX, startY + headerH, actualW, targetH);

      // Draw Numbered Badges
      badges.forEach((b) => {
        const bx = startX + (b.x / 100) * actualW;
        const by = startY + headerH + (b.y / 100) * targetH;

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(bx, by, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${b.num}`, bx, by);
      });
    }

    return canvas;
  };

  const downloadMockup = async () => {
    if (!imageSrc) return;
    setExporting(true);
    const toastId = toast.loading('Rendering 4K mockup...');
    try {
      const canvas = await generateCanvas();
      const url = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-studio.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      confetti({ particleCount: 50, spread: 70 });
      toast.success('Ultra-HD Mockup downloaded!', { id: toastId });
    } catch (err: any) {
      toast.error('Export failed: ' + err.message, { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!imageSrc) return;
    try {
      const canvas = await generateCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          confetti({ particleCount: 30, spread: 50 });
          toast.success('Mockup copied to clipboard! Ready to paste anywhere.');
        } catch (e) {
          toast.error('Direct clipboard image copy not supported in this browser.');
        }
      }, 'image/png');
    } catch (err: any) {
      toast.error('Copy failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Capture Bar */}
      {!imageSrc && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileLoad(e.dataTransfer.files[0]);
          }}
          className={`relative p-10 sm:p-14 border-2 border-dashed rounded-3xl text-center transition-all cursor-pointer group ${
            isDragOver 
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
              : 'border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-900/40'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileLoad(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Screenshot Studio & Mockup Generator
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Transform raw screenshots into marketing mockups with macOS window frames, gradients & 3D tilt
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">📸 1-Click Screen Capture</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">📋 Ctrl+V Instant Paste</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">💻 macOS & Browser Frames</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">✨ 3D Tilt & Inset Shadows</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCaptureScreen();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Screen / Tab</span>
              </button>

              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Editor */}
      {imageSrc && (
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                  {fileName}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ready for social media, portfolios & product docs
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingBadge(!isAddingBadge)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isAddingBadge
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title="Click anywhere on the mockup to place a numbered step badge"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{isAddingBadge ? 'Click to Place Badge' : '+ Numbered Badge'}</span>
              </button>

              <button
                onClick={handleCaptureScreen}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Re-Capture</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                title="Copy ready-to-paste image to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Image</span>
              </button>

              <button
                onClick={downloadMockup}
                disabled={exporting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download 4K Mockup</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              {/* Frame Style Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Device Frame</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'mac-dark', name: 'macOS Dark' },
                      { id: 'mac-light', name: 'macOS Light' },
                      { id: 'browser', name: 'Browser Tab' },
                      { id: 'shadow-only', name: 'Clean Floating' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFrameStyle(f.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer border ${
                        frameStyle === f.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Preset */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Studio Background</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'mesh', name: 'Hyper Mesh' },
                      { id: 'sunset', name: 'Sunset Glow' },
                      { id: 'aurora', name: 'Aurora Teal' },
                      { id: 'cyber', name: 'Obsidian' },
                      { id: 'studio-light', name: 'Studio Pure' },
                      { id: 'transparent', name: 'Transparent' },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBgPreset(b.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer border ${
                        bgPreset === b.id
                          ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browser Address Bar Input */}
              {frameStyle === 'browser' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">URL Bar Address:</label>
                  <input
                    type="text"
                    value={windowTitle}
                    onChange={(e) => setWindowTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              )}

              {/* Adjustments Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Padding</span>
                    <span className="font-mono text-white">{padding}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="80"
                    value={padding}
                    onChange={(e) => setPadding(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Corner Radius</span>
                    <span className="font-mono text-white">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="28"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>3D Tilt Angle</span>
                    <span className="font-mono text-white">{tiltX}°</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={tiltX}
                    onChange={(e) => setTiltX(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Shadow Blur</span>
                    <span className="font-mono text-white">{shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Central Live Interactive Canvas Preview */}
            <div className="lg:col-span-3 rounded-2xl bg-slate-900/60 p-6 sm:p-12 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[500px]">
              <div
                ref={previewContainerRef}
                onClick={handlePreviewClick}
                className="relative transition-transform duration-200 select-none max-w-full"
                style={{
                  padding: `${padding}px`,
                  borderRadius: '24px',
                  background:
                    bgPreset === 'mesh'
                      ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)'
                      : bgPreset === 'sunset'
                      ? 'linear-gradient(135deg, #f97316 0%, #e11d48 50%, #7c3aed 100%)'
                      : bgPreset === 'aurora'
                      ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #6366f1 100%)'
                      : bgPreset === 'cyber'
                      ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                      : bgPreset === 'studio-light'
                      ? '#f1f5f9'
                      : bgPreset === 'studio-dark'
                      ? '#090d16'
                      : 'transparent',
                  transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                  cursor: isAddingBadge ? 'crosshair' : 'default',
                }}
              >
                {/* Mockup Frame Container */}
                <div
                  className="overflow-hidden transition-all"
                  style={{
                    borderRadius: `${borderRadius}px`,
                    boxShadow: `0 25px ${shadowBlur}px -12px rgba(0, 0, 0, ${shadowOpacity})`,
                    backgroundColor: frameStyle === 'mac-light' ? '#ffffff' : '#0f172a',
                  }}
                >
                  {/* macOS / Browser Header */}
                  {(frameStyle.includes('mac') || frameStyle === 'browser') && (
                    <div
                      className={`px-4 py-2.5 flex items-center gap-2 border-b select-none ${
                        frameStyle === 'mac-light'
                          ? 'bg-slate-100 border-slate-200 text-slate-600'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {/* Traffic lights */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      </div>

                      {frameStyle === 'browser' ? (
                        <div className="flex-1 mx-4">
                          <div className="px-3 py-1 rounded-md text-[11px] font-mono text-center truncate bg-slate-950 border border-slate-800 text-slate-400">
                            🔒 {windowTitle || 'https://example.com'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 mx-auto">
                          {windowTitle}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Screenshot Content */}
                  <img
                    src={imageSrc}
                    alt="Screenshot"
                    className="max-w-[650px] w-full h-auto block"
                  />
                </div>

                {/* Overlaid Badges */}
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="absolute w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                    }}
                  >
                    {b.num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

