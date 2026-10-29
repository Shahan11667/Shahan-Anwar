'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  FileDown, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle,
  Plus,
  Settings2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function JpgToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'normal'>('small');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [converting, setConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: ImageItem[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      } else {
        toast.error(`"${file.name}" is not a supported image file`);
      }
    });

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      toast.success(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''}`);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setConverting(true);
      const pdfDoc = await PDFDocument.create();

      // Page size dimensions in points (72 points = 1 inch)
      const baseDims = pageSize === 'a4' ? PageSizes.A4 : PageSizes.Letter;
      const pageWidth = orientation === 'portrait' ? baseDims[0] : baseDims[1];
      const pageHeight = orientation === 'portrait' ? baseDims[1] : baseDims[0];

      // Margin values
      const marginMap = {
        none: 0,
        small: 18, // 0.25 inch
        normal: 36, // 0.5 inch
      };
      const marginVal = marginMap[margin];

      const availableWidth = pageWidth - marginVal * 2;
      const availableHeight = pageHeight - marginVal * 2;

      for (const item of images) {
        const fileBytes = await item.file.arrayBuffer();
        let pdfImage;

        if (item.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(fileBytes);
        } else {
          // For JPG, JPEG, and WebP (we convert WebP/others to JPG via canvas)
          try {
            pdfImage = await pdfDoc.embedJpg(fileBytes);
          } catch {
            // Fallback: draw onto canvas and get jpeg bytes
            const img = new Image();
            img.src = item.previewUrl;
            await new Promise((res) => {
              img.onload = res;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              const blob = await new Promise<Blob | null>((res) =>
                canvas.toBlob(res, 'image/jpeg', 0.95)
              );
              if (blob) {
                const jpegBytes = await blob.arrayBuffer();
                pdfImage = await pdfDoc.embedJpg(jpegBytes);
              }
            }
          }
        }

        if (pdfImage) {
          const imgDims = pdfImage.scale(1);
          // Scale to fit within available page bounds while preserving aspect ratio
          const scale = Math.min(
            availableWidth / imgDims.width,
            availableHeight / imgDims.height,
            1 // Do not upscale beyond original
          );

          const finalWidth = imgDims.width * scale;
          const finalHeight = imgDims.height * scale;

          // Center image on the page
          const x = marginVal + (availableWidth - finalWidth) / 2;
          const y = marginVal + (availableHeight - finalHeight) / 2;

          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawImage(pdfImage, {
            x,
            y,
            width: finalWidth,
            height: finalHeight,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `converted-document-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success('PDF successfully created and downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-rose-500 bg-rose-500/10'
            : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Drop your images here, or <span className="text-rose-400 underline">browse</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Supports JPG, PNG, and WebP. Multi-image selection supported. 100% processed in your browser.
        </p>
      </div>

      {/* Image Preview List and Settings */}
      {images.length > 0 && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="font-semibold text-white">{images.length}</span> image{images.length > 1 ? 's' : ''} selected
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Orientation */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Orientation:</span>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              {/* Margins */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Margin:</span>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="none">No Margin</option>
                  <option value="small">Small Margin</option>
                  <option value="normal">Normal Margin</option>
                </select>
              </div>

              {/* Page Size */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Page Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="a4">A4</option>
                  <option value="letter">US Letter</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setImages([])}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Grid of uploaded images with reordering */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="relative group rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-slate-900 flex items-center justify-center p-2">
                  {/* Page number badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[11px] font-bold text-white z-10">
                    Page {index + 1}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors z-10"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>

                <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[100px] text-slate-300 font-medium" title={img.file.name}>
                    {img.file.name}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === images.length - 1}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add more tile */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-800 hover:border-slate-600 bg-slate-950/30 hover:bg-slate-950/70 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <div className="p-3 rounded-full bg-slate-800 text-slate-300">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">Add more images</span>
            </button>
          </div>

          {/* Action Button */}
          <div className="text-center pt-4">
            <button
              onClick={handleConvert}
              disabled={converting}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-base shadow-xl hover:shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60"
            >
              {converting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compiling PDF Document...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  <span>Convert & Download PDF ({images.length} pages)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
