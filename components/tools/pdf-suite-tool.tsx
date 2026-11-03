'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Merge, 
  Split, 
  Trash2, 
  Scissors, 
  Layers, 
  Camera, 
  Minimize2, 
  Wrench, 
  ScanText, 
  Image as ImageIcon, 
  FileCode, 
  Presentation, 
  Table, 
  Globe, 
  Archive, 
  RotateCw, 
  Hash, 
  Stamp, 
  Crop, 
  Edit3, 
  CheckSquare, 
  Unlock, 
  Lock, 
  PenTool, 
  EyeOff, 
  GitCompare, 
  Bot, 
  Languages, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PdfToolItem {
  id: string;
  name: string;
  desc: string;
  slug: string;
  icon: any;
  color: string;
  badge?: string;
}

interface PdfCategory {
  title: string;
  tools: PdfToolItem[];
}

const PDF_SUITE_CATEGORIES: PdfCategory[] = [
  {
    title: 'ORGANIZE PDF',
    tools: [
      { id: 'merge', name: 'Merge PDF', desc: 'Combine multiple PDFs into one unified document', slug: 'merge-pdf', icon: Merge, color: 'text-orange-500' },
      { id: 'split', name: 'Split PDF', desc: 'Separate pages or extract ranges into standalone PDFs', slug: 'split-pdf', icon: Split, color: 'text-orange-500' },
      { id: 'remove', name: 'Remove Pages', desc: 'Delete unwanted or blank pages from your PDF', slug: 'organize-pdf', icon: Trash2, color: 'text-red-500' },
      { id: 'extract', name: 'Extract Pages', desc: 'Extract selected page numbers into a fresh PDF file', slug: 'organize-pdf', icon: Scissors, color: 'text-red-500' },
      { id: 'organize', name: 'Organize PDF', desc: 'Sort, reorder, duplicate and rotate pages visually', slug: 'organize-pdf', icon: Layers, color: 'text-orange-400', badge: 'Interactive' },
      { id: 'scan', name: 'Scan to PDF', desc: 'Capture paper docs via webcam or phone camera into PDF', slug: 'organize-pdf', icon: Camera, color: 'text-red-400' },
    ]
  },
  {
    title: 'OPTIMIZE PDF',
    tools: [
      { id: 'compress', name: 'Compress PDF', desc: 'Reduce file size by up to 80% while keeping quality', slug: 'compress-pdf', icon: Minimize2, color: 'text-emerald-500', badge: 'Popular' },
      { id: 'repair', name: 'Repair PDF', desc: 'Recover damaged, corrupted, or unreadable PDF files', slug: 'compress-pdf', icon: Wrench, color: 'text-emerald-500' },
      { id: 'ocr', name: 'OCR PDF', desc: 'Extract selectable text from scanned paper & book images', slug: 'compress-pdf', icon: ScanText, color: 'text-emerald-400' },
    ]
  },
  {
    title: 'CONVERT TO PDF',
    tools: [
      { id: 'jpg-to-pdf', name: 'JPG to PDF', desc: 'Convert JPG, PNG, WebP images into a clean PDF', slug: 'jpg-to-pdf', icon: ImageIcon, color: 'text-amber-500' },
      { id: 'word-to-pdf', name: 'WORD to PDF', desc: 'Convert DOCX documents to formatted PDF files', slug: 'word-to-pdf', icon: FileText, color: 'text-blue-500', badge: 'DOCX' },
      { id: 'ppt-to-pdf', name: 'POWERPOINT to PDF', desc: 'Turn PPTX presentation slide decks into PDF', slug: 'convert-to-pdf', icon: Presentation, color: 'text-orange-500' },
      { id: 'excel-to-pdf', name: 'EXCEL to PDF', desc: 'Convert spreadsheets and CSV data to styled PDF tables', slug: 'convert-to-pdf', icon: Table, color: 'text-emerald-500' },
      { id: 'html-to-pdf', name: 'HTML to PDF', desc: 'Convert web pages, markdown, or HTML code to PDF', slug: 'convert-to-pdf', icon: Globe, color: 'text-amber-500' },
    ]
  },
  {
    title: 'CONVERT FROM PDF',
    tools: [
      { id: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Extract high-resolution images from each PDF page', slug: 'pdf-to-jpg', icon: ImageIcon, color: 'text-amber-500' },
      { id: 'pdf-to-word', name: 'PDF to WORD', desc: 'Convert PDF files into fully editable Word DOCX', slug: 'pdf-to-word', icon: FileText, color: 'text-blue-500', badge: 'Editable' },
      { id: 'pdf-to-ppt', name: 'PDF to POWERPOINT', desc: 'Transform PDF pages into editable PowerPoint slides', slug: 'convert-from-pdf', icon: Presentation, color: 'text-orange-500' },
      { id: 'pdf-to-excel', name: 'PDF to EXCEL', desc: 'Extract tabular PDF rows into Excel CSV spreadsheets', slug: 'convert-from-pdf', icon: Table, color: 'text-emerald-500' },
      { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', desc: 'Convert to ISO-19005 compliant archival standard', slug: 'convert-from-pdf', icon: Archive, color: 'text-blue-400' },
    ]
  },
  {
    title: 'EDIT PDF',
    tools: [
      { id: 'rotate-pdf', name: 'Rotate PDF', desc: 'Rotate specific or all pages 90°, 180°, or 270°', slug: 'pdf-annotate', icon: RotateCw, color: 'text-purple-500' },
      { id: 'page-numbers', name: 'Add Page Numbers', desc: 'Stamp customized pagination, headers & footers', slug: 'pdf-annotate', icon: Hash, color: 'text-purple-500' },
      { id: 'watermark', name: 'Add Watermark', desc: 'Stamp text or image watermarks with custom opacity', slug: 'pdf-annotate', icon: Stamp, color: 'text-purple-400' },
      { id: 'crop-pdf', name: 'Crop PDF', desc: 'Trim document margins and adjust bounding boxes', slug: 'pdf-annotate', icon: Crop, color: 'text-purple-400' },
      { id: 'edit-pdf', name: 'Edit PDF', desc: 'Specialist PDF editor with Reflow, Mind Map & Zotero', slug: 'pdf-editor', icon: Edit3, color: 'text-purple-500', badge: '6 Specialist Features' },
      { id: 'pdf-forms', name: 'PDF Forms', desc: 'Create and fill out interactive digital form fields', slug: 'pdf-annotate', icon: CheckSquare, color: 'text-purple-400' },
    ]
  },
  {
    title: 'PDF SECURITY',
    tools: [
      { id: 'unlock-pdf', name: 'Unlock PDF', desc: 'Remove document passwords and permissions restrictions', slug: 'pdf-security', icon: Unlock, color: 'text-blue-500' },
      { id: 'protect-pdf', name: 'Protect PDF', desc: 'Encrypt your document with AES-256 passwords', slug: 'pdf-security', icon: Lock, color: 'text-blue-500' },
      { id: 'sign-pdf', name: 'Sign PDF', desc: 'Stamp digital handwritten signatures and legal seals', slug: 'pdf-security', icon: PenTool, color: 'text-blue-400', badge: 'Legal' },
      { id: 'redact-pdf', name: 'Redact PDF', desc: 'Permanently blackout SSNs, credit cards, and PII', slug: 'pdf-security', icon: EyeOff, color: 'text-blue-400' },
      { id: 'compare-pdf', name: 'Compare PDF', desc: 'Side-by-side visual diff to compare two document versions', slug: 'pdf-security', icon: GitCompare, color: 'text-blue-400' },
    ]
  },
  {
    title: 'PDF INTELLIGENCE',
    tools: [
      { id: 'ai-summarizer', name: 'AI Summarizer', desc: 'Generate executive briefs, takeaways and action items', slug: 'pdf-intelligence', icon: Bot, color: 'text-indigo-400', badge: 'AI Neural' },
      { id: 'translate-pdf', name: 'Translate PDF', desc: 'Translate document text across 50+ languages', slug: 'pdf-intelligence', icon: Languages, color: 'text-indigo-400' },
      { id: 'pdf-to-md', name: 'PDF to Markdown', desc: 'Convert structured PDF into GitHub-flavored Markdown', slug: 'pdf-intelligence', icon: FileCode, color: 'text-indigo-400' },
    ]
  }
];

export default function PdfSuiteTool() {
  const [searchFilter, setSearchFilter] = useState<string>('');

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Complete All-In-One PDF Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Every PDF Tool You Will Ever Need, 100% Free & Local-First
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          From organizing, optimizing, and converting to advanced AES security, digital signing, and neural AI intelligence — all processed instantly inside your browser with bank-grade privacy.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-2">
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Search tools (e.g. compress, sign, excel, reflow)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Categories Matrix matching the user's reference image */}
      <div className="space-y-8">
        {PDF_SUITE_CATEGORIES.map(category => {
          const filteredTools = category.tools.filter(t => 
            t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            t.desc.toLowerCase().includes(searchFilter.toLowerCase())
          );

          if (filteredTools.length === 0) return null;

          return (
            <div key={category.title} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase font-mono">
                  {category.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {filteredTools.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      className="group p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between hover:shadow-lg relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className={`w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {tool.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
                            <span>{tool.name}</span>
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {tool.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-amber-400 transition-colors">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

