'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  Loader2, 
  FileText,
  Plus,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PdfFileItem {
  id: string;
  file: File;
  pageCount?: number;
}

export default function MergePdfTool() {
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [merging, setMerging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: PdfFileItem[] = [];

    for (const file of Array.from(files)) {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const buffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            pageCount: doc.getPageCount(),
          });
        } catch {
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
          });
        }
      } else {
        toast.error(`"${file.name}" is not a PDF file`);
      }
    }

    if (newItems.length > 0) {
      setPdfFiles((prev) => [...prev, ...newItems]);
      toast.success(`Added ${newItems.length} PDF file${newItems.length > 1 ? 's' : ''}`);
    }
  };

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge');
      return;
    }

    try {
      setMerging(true);
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfFiles) {
        const fileBuffer = await item.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `merged-document-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      toast.success('PDFs merged successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to merge PDFs. Ensure files are valid and not password-protected.');
    } finally {
      setMerging(false);
    }
  };

  const totalPages = pdfFiles.reduce((acc, curr) => acc + (curr.pageCount || 0), 0);

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
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 mx-auto rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Select multiple PDFs to merge, or <span className="text-violet-400 underline">browse</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Combine two or more PDF files into a single unified document. Drag to reorder.
        </p>
      </div>

      {/* Files List */}
      {pdfFiles.length > 0 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-300 font-medium">
              <strong className="text-white">{pdfFiles.length}</strong> files selected{' '}
              {totalPages > 0 && <span>({totalPages} total pages)</span>}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => setPdfFiles([])}
                className="text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {pdfFiles.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(item.file.size / (1024 * 1024)).toFixed(2)} MB{' '}
                      {item.pageCount && `• ${item.pageCount} pages`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === pdfFiles.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 cursor-pointer ml-1"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Button */}
          <div className="text-center pt-4">
            <button
              onClick={handleMerge}
              disabled={merging || pdfFiles.length < 2}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-xl hover:shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {merging ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Merging PDF Documents...</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5" />
                  <span>Merge {pdfFiles.length} PDFs Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
