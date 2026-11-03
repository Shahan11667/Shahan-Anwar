'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Settings2, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  FileDown, 
  Maximize2,
  Printer,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type PageSize = 'a4' | 'letter' | 'legal';
type Orientation = 'portrait' | 'landscape';
type Margins = 'normal' | 'narrow' | 'wide';
type FontStyle = 'modern' | 'classic' | 'mono';

export default function WordToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [converting, setConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  
  // Customization options
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margins, setMargins] = useState<Margins>('normal');
  const [fontStyle, setFontStyle] = useState<FontStyle>('modern');
  const [documentTitle, setDocumentTitle] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
      toast.error('Please upload a valid Word (.docx) document');
      return;
    }

    setFile(selectedFile);
    setDocumentTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setLoading(true);
    setProgress(30);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setProgress(60);

      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement((image) => {
            return image.read('base64').then((imageBuffer) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`,
              };
            });
          }),
        }
      );

      const html = result.value;
      setHtmlContent(html);

      // Estimate words
      const text = html.replace(/<[^>]*>/g, ' ');
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);

      setProgress(100);
      toast.success(`Parsed "${selectedFile.name}" (${words} words)`);
    } catch (err: any) {
      console.error('Word parse error:', err);
      toast.error(err.message || 'Failed to read Word document. Please ensure it is a valid .docx file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const convertToPdf = async () => {
    if (!previewRef.current || !htmlContent) {
      toast.error('No document content to convert');
      return;
    }

    setConverting(true);
    const toastId = toast.loading('Rendering high-resolution PDF pages...');

    try {
      // Create hidden rendering container with exact styling
      const element = previewRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, // 2x Retina resolution for sharp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgWidth = orientation === 'portrait' ? 210 : 297;
      const pageHeight = orientation === 'portrait' ? 297 : 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const outputFileName = `${documentTitle || 'converted-document'}.pdf`;
      pdf.save(outputFileName);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      toast.success('PDF successfully generated & downloaded!', { id: toastId });
    } catch (err: any) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF. You can also use the "Print to PDF" button.', { id: toastId });
    } finally {
      setConverting(false);
    }
  };

  const handleNativePrint = () => {
    if (!htmlContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to use browser print to PDF');
      return;
    }

    const marginStyles = {
      normal: '25mm',
      narrow: '12mm',
      wide: '35mm',
    }[margins];

    const fontStyles = {
      modern: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      classic: 'font-family: "Georgia", "Times New Roman", serif;',
      mono: 'font-family: "Courier New", Courier, monospace;',
    }[fontStyle];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle || 'Document'}</title>
          <style>
            @page {
              size: ${pageSize} ${orientation};
              margin: ${marginStyles};
            }
            body {
              ${fontStyles}
              color: #111;
              line-height: 1.6;
              font-size: 14pt;
              margin: 0;
              padding: 0;
            }
            h1, h2, h3, h4 { color: #000; margin-top: 1.2em; margin-bottom: 0.5em; font-weight: 700; }
            h1 { font-size: 24pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
            h2 { font-size: 18pt; }
            h3 { font-size: 14pt; }
            p { margin: 0.8em 0; }
            table { width: 100%; border-collapse: collapse; margin: 1em 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: 600; }
            img { max-width: 100%; height: auto; }
            blockquote { border-left: 4px solid #3b82f6; padding-left: 12px; margin-left: 0; color: #4b5563; font-style: italic; }
            ul, ol { padding-left: 24px; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getMarginClass = () => {
    switch (margins) {
      case 'narrow':
        return 'p-6 sm:p-8';
      case 'wide':
        return 'p-12 sm:p-16';
      default:
        return 'p-8 sm:p-12';
    }
  };

  const getFontClass = () => {
    switch (fontStyle) {
      case 'classic':
        return 'font-serif';
      case 'mono':
        return 'font-mono text-xs sm:text-sm';
      default:
        return 'font-sans';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!htmlContent && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative p-10 sm:p-14 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer group ${
            isDragOver 
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
              : 'border-slate-800 bg-slate-950/60 hover:border-blue-500/50 hover:bg-slate-900/40'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Upload Word Document (.docx)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Drag & drop your Microsoft Word document here or click to browse
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Preserves Headings</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Tables & Lists</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Embedded Images</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">100% In-Browser</span>
            </div>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Select .docx File</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor & Configuration Toolbar */}
      {htmlContent && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="bg-transparent text-white font-semibold text-sm sm:text-base focus:outline-none focus:border-b border-blue-500"
                  placeholder="Document Title"
                />
                <p className="text-xs text-slate-400">
                  {file?.name} • <strong className="text-slate-300">{wordCount}</strong> words
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setFile(null);
                  setHtmlContent('');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors cursor-pointer"
              >
                Change File
              </button>

              <button
                onClick={handleNativePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs border border-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Print using browser native vector engine"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Vector Print to PDF</span>
              </button>

              <button
                onClick={convertToPdf}
                disabled={converting}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                {converting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PDF Page Layout Options */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Page Format</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSize)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="a4">A4 Standard (210 × 297 mm)</option>
                <option value="letter">US Letter (8.5 × 11 in)</option>
                <option value="legal">Legal (8.5 × 14 in)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as Orientation)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="portrait">Portrait (Vertical)</option>
                <option value="landscape">Landscape (Horizontal)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Page Margins</label>
              <select
                value={margins}
                onChange={(e) => setMargins(e.target.value as Margins)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="normal">Normal (Standard)</option>
                <option value="narrow">Narrow (More Content)</option>
                <option value="wide">Wide (Spacious)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Typography</label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value as FontStyle)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="modern">Modern Sans-Serif</option>
                <option value="classic">Classic Serif (Book)</option>
                <option value="mono">Clean Monospace</option>
              </select>
            </div>
          </div>

          {/* Live Document Sheet Preview */}
          <div className="rounded-2xl bg-slate-900/60 p-4 sm:p-8 border border-slate-800 overflow-x-auto flex justify-center">
            <div
              ref={previewRef}
              className={`bg-white text-slate-900 shadow-2xl rounded-sm transition-all ${getMarginClass()} ${getFontClass()} ${
                orientation === 'portrait'
                  ? 'w-[794px] min-h-[1123px]'
                  : 'w-[1123px] min-h-[794px]'
              }`}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)',
                lineHeight: '1.6',
              }}
            >
              <div 
                className="word-to-pdf-content prose max-w-none prose-slate prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:my-2 prose-table:w-full prose-td:border prose-td:p-2 prose-th:border prose-th:p-2 prose-th:bg-slate-100"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Guarantee Banner */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">100% In-Browser Privacy:</strong>
          <p className="mt-0.5">
            Your Word document is parsed and compiled directly in your browser using WebAssembly. Files are never uploaded to any remote server or third-party cloud.
          </p>
        </div>
      </div>
    </div>
  );
}

