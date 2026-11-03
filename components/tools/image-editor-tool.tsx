'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Crop, 
  Sliders, 
  PenTool, 
  Type, 
  Sparkles, 
  Undo2, 
  Redo2, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Pipette, 
  Share2, 
  Check, 
  Square, 
  Circle, 
  ArrowRight, 
  Image as ImageIcon,
  Eraser,
  RefreshCw,
  Palette,
  Layers,
  ShieldCheck,
  SplitSquareVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type ToolTab = 'adjust' | 'crop' | 'filters' | 'draw' | 'text' | 'social';
type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  hasBackground?: boolean;
}

interface FilterPreset {
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  hue: number;
  blur: number;
}

const PRESETS: Record<string, FilterPreset> = {
  normal: { name: 'Normal', brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hue: 0, blur: 0 },
  vintage: { name: 'Vintage 1977', brightness: 110, contrast: 90, saturation: 85, sepia: 40, grayscale: 0, hue: -10, blur: 0 },
  cyberpunk: { name: 'Cyberpunk', brightness: 115, contrast: 140, saturation: 180, sepia: 0, grayscale: 0, hue: 45, blur: 0 },
  noir: { name: 'Noir B&W', brightness: 105, contrast: 150, saturation: 0, sepia: 0, grayscale: 100, hue: 0, blur: 0 },
  sunset: { name: 'Warm Sunset', brightness: 105, contrast: 110, saturation: 130, sepia: 30, grayscale: 0, hue: -15, blur: 0 },
  cold: { name: 'Cool Crisp', brightness: 105, contrast: 110, saturation: 90, sepia: 0, grayscale: 0, hue: 180, blur: 0 },
};

const SOCIAL_PRESETS = [
  { name: 'Instagram Post (Square)', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'Instagram Story / Reel / TikTok', width: 1080, height: 1920, ratio: '9:16' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, ratio: '16:9' },
  { name: 'Twitter / X Banner', width: 1500, height: 500, ratio: '3:1' },
  { name: 'Facebook Cover', width: 820, height: 312, ratio: '16:6' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, ratio: '4:1' },
];

export default function ImageEditorTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('edited-image');
  const [activeTab, setActiveTab] = useState<ToolTab>('adjust');
  const [zoom, setZoom] = useState<number>(1);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Image Dimensions
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [displaySize, setDisplaySize] = useState<string>('');

  // Adjustments (100 = default)
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [exposure, setExposure] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [hue, setHue] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);

  // Transformations
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Eyedropper / Color Picker
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [eyedropperActive, setEyedropperActive] = useState<boolean>(false);

  // Drawing Brush
  const [brushColor, setBrushColor] = useState<string>('#ef4444');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Text Overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>('Impact, sans-serif');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textSize, setTextSize] = useState<number>(36);

  // Export Settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.92);
  const [estimatedSize, setEstimatedSize] = useState<string>('');

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Listen for Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) handleFileLoad(file);
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

    const img = new Image();
    img.src = url;
    img.onload = () => {
      originalImageRef.current = img;
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setDisplaySize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      resetAdjustments();
      toast.success(`Loaded image (${img.naturalWidth} × ${img.naturalHeight}px)`);
    };
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setExposure(100);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setHue(0);
    setInvert(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setTextOverlays([]);
  };

  // Re-render canvas whenever filters, transformations or drawings change
  useEffect(() => {
    renderCanvas();
  }, [
    imageSrc,
    brightness,
    contrast,
    saturation,
    exposure,
    blur,
    sepia,
    grayscale,
    hue,
    invert,
    rotation,
    flipH,
    flipV,
    textOverlays,
  ]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotated90or270 = Math.abs(rotation) % 180 !== 0;
    const w = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
    const h = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply Transformation Matrix
    ctx.translate(w / 2, h / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Build CSS Filter string
    const filterParts = [
      `brightness(${brightness * (exposure / 100)}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `sepia(${sepia}%)`,
      `grayscale(${grayscale}%)`,
      `hue-rotate(${hue}deg)`,
      `invert(${invert}%)`,
    ];
    if (blur > 0) filterParts.push(`blur(${blur}px)`);
    ctx.filter = filterParts.join(' ');

    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Render Text Overlays
    textOverlays.forEach((overlay) => {
      ctx.save();
      ctx.font = `bold ${overlay.fontSize}px ${overlay.fontFamily}`;
      ctx.fillStyle = overlay.color;
      ctx.textBaseline = 'top';

      if (overlay.hasBackground) {
        const textMetrics = ctx.measureText(overlay.text);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          overlay.x - 8,
          overlay.y - 4,
          textMetrics.width + 16,
          overlay.fontSize + 8
        );
        ctx.fillStyle = overlay.color;
      }

      ctx.fillText(overlay.text, overlay.x, overlay.y);
      ctx.restore();
    });

    // Update estimated file size
    try {
      const dataUrl = canvas.toDataURL(exportFormat, exportQuality);
      const byteLen = Math.round((dataUrl.length * 3) / 4);
      setEstimatedSize(`${(byteLen / 1024).toFixed(1)} KB`);
    } catch (e) {
      // ignore
    }
  };

  // Eyedropper Tool
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!eyedropperActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;

    setPickedColor(hex);
    setBrushColor(hex);
    setTextColor(hex);
    setEyedropperActive(false);
    toast.success(`Sampled Color: ${hex}`);
  };

  // Freehand Drawing Handlers on Canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'draw' || eyedropperActive) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const addTextOverlay = () => {
    const text = prompt('Enter text for overlay:', 'Sample Text');
    if (!text || !canvasRef.current) return;

    setTextOverlays((prev) => [
      ...prev,
      {
        id: 'txt-' + Date.now(),
        text,
        x: canvasRef.current!.width * 0.2,
        y: canvasRef.current!.height * 0.4,
        fontSize: textSize,
        color: textColor,
        fontFamily: selectedFont,
        hasBackground: true,
      },
    ]);
    toast.success('Text placed on canvas');
  };

  // Crop / Resize to Social Preset
  const applySocialPreset = (preset: typeof SOCIAL_PRESETS[0]) => {
    if (!canvasRef.current || !originalImageRef.current) return;
    const srcCanvas = canvasRef.current;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = preset.width;
    newCanvas.height = preset.height;
    const ctx = newCanvas.getContext('2d')!;

    // Background fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, preset.width, preset.height);

    // Fit contain image in center
    const scale = Math.min(preset.width / srcCanvas.width, preset.height / srcCanvas.height);
    const w = srcCanvas.width * scale;
    const h = srcCanvas.height * scale;
    const x = (preset.width - w) / 2;
    const y = (preset.height - h) / 2;

    ctx.drawImage(srcCanvas, x, y, w, h);

    const newUrl = newCanvas.toDataURL('image/png');
    setImageSrc(newUrl);
    const newImg = new Image();
    newImg.src = newUrl;
    newImg.onload = () => {
      originalImageRef.current = newImg;
      setOriginalWidth(preset.width);
      setOriginalHeight(preset.height);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      toast.success(`Adapted to ${preset.name} (${preset.width} × ${preset.height}px)`);
    };
  };

  const applyPresetFilter = (p: FilterPreset) => {
    setBrightness(p.brightness);
    setContrast(p.contrast);
    setSaturation(p.saturation);
    setSepia(p.sepia);
    setGrayscale(p.grayscale);
    setHue(p.hue);
    setBlur(p.blur);
    toast.success(`Applied ${p.name}`);
  };

  // Final Export
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    const dataUrl = canvasRef.current.toDataURL(exportFormat, exportQuality);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${fileName}-edited.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    toast.success(`Downloaded ${fileName}-edited.${ext}!`);
  };

  return (
    <div className="space-y-4">
      {/* Upload Screen if no image loaded */}
      {!imageSrc && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileLoad(e.dataTransfer.files[0]);
          }}
          className={`relative p-10 sm:p-14 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer group ${
            isDragOver 
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' 
              : 'border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-slate-900/40'
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
              <ImageIcon className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Upload Image or Paste from Clipboard (Ctrl+V)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Full-featured photo editor with crop, filters, drawing, text, social media presets, and eyedropper
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Crop & Rotate</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Filters & Adjustments</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Brush & Text Overlays</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Color Eyedropper</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Instagram & YouTube Presets</span>
            </div>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Select Image File</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Interface */}
      {imageSrc && (
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="bg-transparent text-white font-bold text-sm sm:text-base focus:outline-none focus:border-b border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  {originalWidth} × {originalHeight} px • Est. {estimatedSize || displaySize}
                </p>
              </div>
            </div>

            {/* Quick Actions & Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Eyedropper Button */}
              <button
                onClick={() => setEyedropperActive(!eyedropperActive)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                  eyedropperActive
                    ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
                title="Sample exact pixel color from image"
              >
                <Pipette className="w-4 h-4" />
                <span>{eyedropperActive ? 'Click Image...' : 'Eyedropper'}</span>
                {pickedColor && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/50 inline-block"
                    style={{ backgroundColor: pickedColor }}
                  />
                )}
              </button>

              {/* Hold to Compare */}
              <button
                onMouseDown={() => setIsComparing(true)}
                onMouseUp={() => setIsComparing(false)}
                onTouchStart={() => setIsComparing(true)}
                onTouchEnd={() => setIsComparing(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 cursor-pointer flex items-center gap-1.5 select-none"
              >
                <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hold to Compare</span>
              </button>

              <button
                onClick={() => {
                  setImageSrc(null);
                  originalImageRef.current = null;
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 cursor-pointer"
              >
                Change Image
              </button>

              <button
                onClick={downloadImage}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>
            </div>
          </div>

          {/* Studio Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'adjust' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Adjustments</span>
            </button>

            <button
              onClick={() => setActiveTab('filters')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'filters' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Aesthetic Filters</span>
            </button>

            <button
              onClick={() => setActiveTab('draw')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'draw' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Brush & Doodle</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'text' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Text Overlays</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'social' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-4 h-4 text-pink-400" />
              <span>Social Presets</span>
            </button>
          </div>

          {/* Sub-panel Controls */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            {/* Tab: Adjustments */}
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Brightness</span>
                      <span className="font-mono text-emerald-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Contrast</span>
                      <span className="font-mono text-emerald-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Saturation</span>
                      <span className="font-mono text-emerald-400">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Exposure</span>
                      <span className="font-mono text-emerald-400">{exposure}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="180"
                      value={exposure}
                      onChange={(e) => setExposure(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Sepia (Warmth)</span>
                      <span className="font-mono text-emerald-400">{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Blur</span>
                      <span className="font-mono text-emerald-400">{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blur}
                      onChange={(e) => setBlur(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick Transforms */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRotation((r) => (r - 90) % 360)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                      title="Rotate 90° Left"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rotate Left</span>
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                      title="Rotate 90° Right"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate Right</span>
                    </button>
                    <button
                      onClick={() => setFlipH((f) => !f)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip H</span>
                    </button>
                    <button
                      onClick={() => setFlipV((f) => !f)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span>Flip V</span>
                    </button>
                  </div>

                  <button
                    onClick={resetAdjustments}
                    className="px-3 py-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    Reset Adjustments
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Aesthetic Filters */}
            {activeTab === 'filters' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.values(PRESETS).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPresetFilter(preset)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center transition-all hover:scale-105 cursor-pointer space-y-1.5"
                  >
                    <div className="w-full h-14 rounded-lg bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-white text-xs">
                      {preset.name.split(' ')[0]}
                    </div>
                    <span className="text-slate-300 text-[11px] font-medium block">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Brush & Doodle */}
            {activeTab === 'draw' && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Brush Color:</span>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => {
                      setBrushColor(e.target.value);
                      setIsEraser(false);
                    }}
                    className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ffffff', '#000000'].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setBrushColor(c);
                          setIsEraser(false);
                        }}
                        className={`w-5 h-5 rounded-full border ${brushColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Brush Size:</span>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-28 accent-emerald-500"
                  />
                  <span className="font-mono text-emerald-400">{brushSize}px</span>

                  <button
                    onClick={() => setIsEraser(!isEraser)}
                    className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isEraser ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Text Overlays */}
            {activeTab === 'text' && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Font:</span>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white"
                  >
                    <option value="Impact, sans-serif">Impact (Meme / Bold)</option>
                    <option value="'Inter', sans-serif">Inter (Modern Clean)</option>
                    <option value="'Georgia', serif">Georgia (Editorial Serif)</option>
                    <option value="'Courier New', monospace">Courier (Code)</option>
                  </select>

                  <span className="text-slate-400">Color:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                  />
                </div>

                <button
                  onClick={addTextOverlay}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Type className="w-4 h-4" />
                  <span>+ Add Text to Image</span>
                </button>
              </div>
            )}

            {/* Tab: Social Media Presets */}
            {activeTab === 'social' && (
              <div className="space-y-2">
                <p className="text-slate-400 text-[11px]">
                  1-click resize and format your artwork for major social platforms with smart canvas centering:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {SOCIAL_PRESETS.map((social) => (
                    <button
                      key={social.name}
                      onClick={() => applySocialPreset(social)}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all hover:border-pink-500/50 cursor-pointer"
                    >
                      <div className="text-white font-semibold text-xs truncate">{social.name.split('(')[0]}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5 font-mono">{social.width} × {social.height}</div>
                      <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[9px] font-bold">
                        {social.ratio}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Canvas Stage */}
          <div className="rounded-2xl bg-slate-900/60 p-4 sm:p-8 border border-slate-800 overflow-x-auto flex justify-center items-center min-h-[460px]">
            {isComparing ? (
              // Original Image Preview
              <img
                src={imageSrc}
                alt="Original"
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              // Edited Dynamic Canvas
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={startDrawing}
                onMouseMove={drawOnCanvas}
                onMouseUp={() => setIsDrawing(false)}
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl cursor-crosshair transition-transform"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              />
            )}
          </div>

          {/* Export Settings Strip */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Export Format:</span>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                      exportFormat === fmt ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>

              {exportFormat !== 'image/png' && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Quality:</span>
                  <input
                    type="range"
                    min="0.4"
                    max="1.0"
                    step="0.05"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="font-mono text-emerald-400">{Math.round(exportQuality * 100)}%</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Estimated Output:</span>
              <span className="font-mono text-emerald-400 font-bold">{estimatedSize || displaySize}</span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Guarantee */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">100% In-Browser Studio:</strong>
          <p className="mt-0.5">
            Image manipulations, filters, adjustments, drawings, and social presets execute entirely inside your device canvas GPU. No photos are ever uploaded to cloud servers.
          </p>
        </div>
      </div>
    </div>
  );
}

