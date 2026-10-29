'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  ScanText, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  FileText, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function ImageToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image or screenshot');
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setExtractedText('');
    setProgress(0);
    setStatusText('');
  };

  const runOcr = async () => {
    if (!previewUrl) return;

    setProcessing(true);
    setProgress(10);
    setStatusText('Initializing AI OCR neural engine...');

    try {
      // Dynamic import of Tesseract.js so it runs purely in client browser
      const Tesseract = (await import('tesseract.js')).default;

      setStatusText('Recognizing text characters...');
      const result = await Tesseract.recognize(previewUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && m.progress) {
            setProgress(Math.round(m.progress * 100));
            setStatusText(`Recognizing characters: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text.trim();
      setExtractedText(text || 'No legible text was detected in this image.');

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      toast.success('Text extraction complete!');
    } catch (err) {
      console.error(err);
      toast.error('OCR processing failed. Please try a clearer image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success('Copied text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded text file!');
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
              ? 'border-indigo-500 bg-indigo-500/10'
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
          <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <ScanText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop an image or screenshot here, or <span className="text-indigo-400 underline">browse</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Extract text from book pages, receipts, scanned forms, and screenshots. 100% private in-browser OCR.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Preview */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300 truncate max-w-[200px]">
                  {file.name}
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setExtractedText('');
                  }}
                  className="text-slate-500 hover:text-white"
                >
                  Change image
                </button>
              </div>

              <div className="aspect-[4/3] bg-slate-900 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Uploaded"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                )}
              </div>

              {!extractedText && !processing && (
                <button
                  onClick={runOcr}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl hover:shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Text with AI OCR</span>
                </button>
              )}
            </div>

            {/* Extracted Text Result / Progress Box */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 flex flex-col h-full min-h-[300px]">
              {processing ? (
                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <div>
                    <h4 className="text-base font-semibold text-white">
                      Processing Optical Character Recognition...
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{statusText}</p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : extractedText ? (
                <div className="flex flex-col h-full">
                  <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Extracted Text</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 text-xs text-white hover:text-indigo-300 font-medium px-2 py-1 rounded bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Download as .txt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    rows={12}
                    className="w-full flex-1 bg-slate-950 p-4 text-white text-sm leading-relaxed focus:outline-none resize-none font-sans"
                  />
                </div>
              ) : (
                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
                  <ScanText className="w-8 h-8 text-slate-700 mb-2" />
                  <p>Click &quot;Extract Text with AI OCR&quot; to begin scanning.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
