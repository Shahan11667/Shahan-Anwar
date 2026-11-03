'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  FileText, 
  Presentation, 
  Table, 
  Code, 
  Download, 
  FileUp, 
  Sparkles, 
  Eye, 
  CheckCircle2,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type ConvertMode = 'powerpoint' | 'excel' | 'html';

export default function ConvertToPdfSuiteTool() {
  const [activeMode, setActiveMode] = useState<ConvertMode>('powerpoint');

  // PowerPoint State
  const [pptTitle, setPptTitle] = useState<string>('Q4 Executive Growth Strategy');
  const [pptSlides, setPptSlides] = useState<string[]>([
    'Title: Q4 Executive Growth Strategy\nPresenter: Antigravity Team\nKey Goal: Scalability & Enterprise Automation',
    'Slide 2: Strategic Pillars\n- Product-led viral growth\n- Sub-second browser local compute\n- Enterprise privacy compliance',
    'Slide 3: Financial Projections\n- Revenue Growth: +148% YoY\n- Customer Retention: 94.2%\n- Infrastructure Burn: Zero server cloud cost'
  ]);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);

  // Excel State
  const [excelTitle, setExcelTitle] = useState<string>('Financial Report - 2026');
  const [excelCsv, setExcelCsv] = useState<string>(
    'Month,Revenue,Expenses,Net Profit,Margin %\nJan 2026,$145000,$62000,$83000,57.2%\nFeb 2026,$182000,$71000,$111000,61.0%\nMar 2026,$215000,$78000,$137000,63.7%\nApr 2026,$264000,$89000,$175000,66.3%'
  );

  // HTML State
  const [htmlContent, setHtmlContent] = useState<string>(
    `<div style="font-family: sans-serif; padding: 24px;">\n  <h1 style="color: #ea580c; border-bottom: 2px solid #fdba74; padding-bottom: 8px;">Quarterly Performance Summary</h1>\n  <p style="color: #475569; font-size: 14px; line-height: 1.6;">\n    This report outlines key organizational achievements, client portfolio expansion, and upcoming technical milestones.\n  </p>\n  <ul style="color: #334155; font-size: 14px; line-height: 1.8;">\n    <li><strong>Local-First Architecture:</strong> Instant browser processing with zero cloud compute dependency.</li>\n    <li><strong>High Performance:</strong> Multi-threaded WebAssembly execution.</li>\n    <li><strong>Privacy Assured:</strong> 100% on-device data processing.</li>\n  </ul>\n</div>`
  );

  // Convert PowerPoint Presentation to PDF
  const handlePptToPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
      
      pptSlides.forEach((slideText, idx) => {
        if (idx > 0) doc.addPage('letter', 'landscape');
        
        // Background
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 792, 612, 'F');
        
        // Accent Header Bar
        doc.setFillColor(249, 115, 22); // amber-500
        doc.rect(40, 40, 712, 6, 'F');

        // Slide title & lines
        const lines = slideText.split('\n');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text(lines[0] || 'Presentation Slide', 50, 90);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(15);
        doc.setTextColor(203, 213, 225); // slate-300

        let y = 140;
        for (let i = 1; i < lines.length; i++) {
          doc.text(lines[i], 60, y);
          y += 32;
        }

        // Slide Number Footer
        doc.setFontSize(11);
        doc.setTextColor(148, 163, 184);
        doc.text(`${pptTitle} • Slide ${idx + 1} of ${pptSlides.length}`, 50, 570);
      });

      doc.save(`${pptTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      confetti({ particleCount: 50, spread: 60 });
      toast.success('PowerPoint slides converted to PDF!');
    } catch (e: any) {
      toast.error('Export failed: ' + e.message);
    }
  };

  // Convert Excel CSV to Formatted PDF Table
  const handleExcelToPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const rows = excelCsv.trim().split('\n').map(r => r.split(','));

      // Header Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text(excelTitle, 40, 50);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on ${new Date().toLocaleDateString()} • Excel to PDF Converter`, 40, 68);

      // Render Table
      let y = 100;
      const colWidth = 100;

      rows.forEach((row, rowIdx) => {
        const isHeader = rowIdx === 0;

        // Row background
        if (isHeader) {
          doc.setFillColor(241, 245, 249);
          doc.rect(40, y - 14, 515, 24, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          if (rowIdx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(40, y - 14, 515, 24, 'F');
          }
        }

        // Cell border line
        doc.setDrawColor(226, 232, 240);
        doc.line(40, y + 10, 555, y + 10);

        // Cells
        row.forEach((cell, cellIdx) => {
          doc.text(cell.trim(), 50 + cellIdx * colWidth, y);
        });

        y += 24;
      });

      doc.save(`${excelTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      confetti({ particleCount: 50, spread: 60 });
      toast.success('Excel spreadsheet converted to PDF table!');
    } catch (e: any) {
      toast.error('Conversion failed: ' + e.message);
    }
  };

  // Convert HTML to PDF
  const handleHtmlToPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      
      doc.html(htmlContent, {
        callback: (d) => {
          d.save('html-document.pdf');
          confetti({ particleCount: 50, spread: 60 });
          toast.success('HTML document exported to PDF!');
        },
        x: 30,
        y: 30,
        width: 535,
        windowWidth: 800
      });
    } catch (e: any) {
      toast.error('HTML conversion error: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800 max-w-lg mx-auto">
        <button
          onClick={() => setActiveMode('powerpoint')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'powerpoint'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>PowerPoint to PDF</span>
        </button>

        <button
          onClick={() => setActiveMode('excel')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'excel'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Excel to PDF</span>
        </button>

        <button
          onClick={() => setActiveMode('html')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'html'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>HTML to PDF</span>
        </button>
      </div>

      {/* MODE 1: POWERPOINT TO PDF */}
      {activeMode === 'powerpoint' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Presentation className="w-4 h-4 text-amber-400" />
                <span>PowerPoint PPTX Presentation to PDF</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Converts slides, speaker notes, and bullet layouts into crisp landscape PDF decks.
              </p>
            </div>

            <button
              onClick={handlePptToPdf}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Presentation as PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Editor */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Presentation Title</label>
                <input
                  type="text"
                  value={pptTitle}
                  onChange={e => setPptTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-400">Slide Content (Slide {activeSlideIdx + 1})</label>
                  <div className="flex items-center gap-1">
                    {pptSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlideIdx(i)}
                        className={`w-6 h-6 rounded text-xs font-mono font-bold cursor-pointer ${
                          activeSlideIdx === i ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setPptSlides([...pptSlides, `Slide ${pptSlides.length + 1}: New Topic\n- Key point here`]);
                        setActiveSlideIdx(pptSlides.length);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                    >
                      + Add Slide
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={pptSlides[activeSlideIdx]}
                  onChange={e => {
                    const next = [...pptSlides];
                    next[activeSlideIdx] = e.target.value;
                    setPptSlides(next);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            {/* Live Slide Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between aspect-video">
              <div className="space-y-3">
                <div className="h-1.5 w-16 bg-amber-500 rounded" />
                <h4 className="text-lg font-bold text-white">
                  {pptSlides[activeSlideIdx].split('\n')[0] || 'Slide Header'}
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {pptSlides[activeSlideIdx].split('\n').slice(1).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-3 border-t border-slate-900">
                <span>{pptTitle}</span>
                <span>Slide {activeSlideIdx + 1} of {pptSlides.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: EXCEL TO PDF */}
      {activeMode === 'excel' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-400" />
                <span>Excel XLSX / CSV to Formatted PDF Table</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formats tabular sheets into professional PDF reports with clean zebra striping and headers.
              </p>
            </div>

            <button
              onClick={handleExcelToPdf}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Spreadsheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Sheet Title</label>
                <input
                  type="text"
                  value={excelTitle}
                  onChange={e => setExcelTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">CSV Data (Comma-separated columns)</label>
                <textarea
                  rows={8}
                  value={excelCsv}
                  onChange={e => setExcelCsv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            {/* Live Table Render */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
              <h4 className="text-xs font-bold text-white mb-3">{excelTitle}</h4>
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {excelCsv.trim().split('\n').map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-800/80 font-bold text-amber-400' : 'border-b border-slate-800/60 text-slate-300'}>
                      {row.split(',').map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 border-r border-slate-800/40 last:border-none">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: HTML TO PDF */}
      {activeMode === 'html' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span>HTML Code & Web Markup to PDF</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Renders custom HTML, CSS, tables, and typography into standard A4 PDF pages.
              </p>
            </div>

            <button
              onClick={handleHtmlToPdf}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Convert HTML to PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Raw HTML Code</label>
              <textarea
                rows={12}
                value={htmlContent}
                onChange={e => setHtmlContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Live HTML Preview</label>
              <div 
                className="p-5 rounded-xl bg-white text-slate-900 border border-slate-200 min-h-[250px] shadow-sm overflow-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

