'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Table, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Quote, 
  Code, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Upload, 
  FileText, 
  Printer, 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  Replace, 
  Eraser, 
  LayoutTemplate,
  FileDown,
  Clock,
  Subscript,
  Superscript,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import mammoth from 'mammoth';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Pre-made Document Templates
const TEMPLATES = {
  resume: `
    <h1>Alex Morgan</h1>
    <p><strong>Senior Full-Stack Software Engineer</strong> | alex.morgan@email.com | +1 (555) 019-2834 | San Francisco, CA</p>
    <hr/>
    <h2>Professional Summary</h2>
    <p>Innovative Senior Software Engineer with 7+ years of experience building scalable web applications, real-time distributed systems, and cloud architectures. Proven track record of improving system latency by 45% and leading high-performing engineering teams.</p>
    <h2>Work Experience</h2>
    <p><strong>Lead Full-Stack Engineer</strong> — CloudScale Technologies (2022 – Present)</p>
    <ul>
      <li>Architected high-throughput microservices handling over 50M daily API requests with 99.99% uptime.</li>
      <li>Spearheaded modern migration to Next.js, TypeScript, and Docker, reducing bundle size by 35%.</li>
      <li>Mentored 8 junior and mid-level developers through structured pair programming and code reviews.</li>
    </ul>
    <p><strong>Software Engineer</strong> — Apex Systems (2019 – 2022)</p>
    <ul>
      <li>Developed responsive React/Node.js web portals serving 250,000+ monthly active users.</li>
      <li>Engineered automated CI/CD deployment pipelines using GitHub Actions and AWS ECS.</li>
    </ul>
    <h2>Core Skills</h2>
    <p><strong>Languages:</strong> TypeScript, JavaScript, Python, Go, SQL</p>
    <p><strong>Frameworks:</strong> Next.js, React, Node.js, Express, Tailwind CSS, PostgreSQL, MongoDB, Redis</p>
    <h2>Education</h2>
    <p><strong>B.S. in Computer Science</strong> — University of California, Berkeley (2015 – 2019)</p>
  `,
  coverLetter: `
    <p><strong>Alex Morgan</strong><br/>123 Innovation Blvd, San Francisco, CA<br/>alex.morgan@email.com | +1 (555) 019-2834</p>
    <p>November 2, 2026</p>
    <p><strong>Hiring Team</strong><br/>Acme Global Innovations<br/>500 Tech Parkway, Suite 400<br/>San Francisco, CA 94105</p>
    <p>Dear Hiring Manager,</p>
    <p>I am writing to express my strong enthusiasm for the Senior Software Engineer position at Acme Global Innovations. With over seven years of hands-on experience designing robust web platforms and modern cloud architectures, I have long admired Acme’s leadership in high-performance developer tooling.</p>
    <p>In my recent role at CloudScale Technologies, I led the development of customer-facing applications that processed tens of millions of interactions daily. I focus heavily on writing clean, accessible, and type-safe code while optimizing serverless and edge workloads for maximum speed and minimal operational costs.</p>
    <p>I welcome the opportunity to discuss how my technical leadership and passion for building world-class digital products can contribute to Acme’s continued growth. Thank you for your time and consideration.</p>
    <p>Warm regards,</p>
    <p><strong>Alex Morgan</strong></p>
  `,
  proposal: `
    <h1>Project Proposal: AI-Powered Document Utility Suite</h1>
    <p><strong>Prepared for:</strong> Executive Stakeholders<br/><strong>Prepared by:</strong> Product Engineering Team<br/><strong>Date:</strong> November 2026</p>
    <hr/>
    <h2>1. Executive Summary</h2>
    <p>This proposal outlines the strategy, architecture, and timeline for deploying a high-speed, zero-cloud-cost multi-tool utility SaaS platform. By processing files directly inside the user's browser, we eliminate backend cloud compute fees while offering 100% data privacy.</p>
    <h2>2. Key Deliverables</h2>
    <ul>
      <li><strong>PDF Transformation Engine:</strong> Word to PDF, PDF to Word, Merge, Split, and Visual Annotation.</li>
      <li><strong>Visual Media Studio:</strong> Comprehensive in-browser image editing, filters, crop, and social presets.</li>
      <li><strong>Natural Speech AI:</strong> Neural Whisper speech-to-text with multi-lingual support.</li>
    </ul>
    <h2>3. Implementation Roadmap</h2>
    <table border="1">
      <thead>
        <tr><th>Phase</th><th>Focus Area</th><th>Duration</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td>Phase 1</td><td>Core Client Architecture & PDF Engines</td><td>2 Weeks</td><td>Completed</td></tr>
        <tr><td>Phase 2</td><td>WYSIWYG Word Editor & Image Canvas Studio</td><td>2 Weeks</td><td>In Progress</td></tr>
        <tr><td>Phase 3</td><td>SEO Optimization & Production Hardening</td><td>1 Week</td><td>Scheduled</td></tr>
      </tbody>
    </table>
  `,
  meetingNotes: `
    <h1>Sprint Review & Strategy Meeting</h1>
    <p><strong>Date:</strong> November 2, 2026 | <strong>Time:</strong> 10:00 AM – 11:30 AM EST<br/><strong>Attendees:</strong> Alex M., Sarah K., David L., Elena R.</p>
    <hr/>
    <h2>1. Agenda Topics</h2>
    <ol>
      <li>Q4 Product Launch Metrics & Customer Feedback</li>
      <li>In-browser WebAssembly Performance Review</li>
      <li>Q1 Roadmap Prioritization & Resource Allocation</li>
    </ol>
    <h2>2. Key Discussion Points</h2>
    <ul>
      <li>Client-side PDF and DOCX processing reduced server compute load by 98%.</li>
      <li>Mobile traffic accounts for 42% of document conversions; UI layout adjustments are verified for small screens.</li>
      <li>User demand for the in-browser PDF Editor and Image Studio is the highest trending feature request.</li>
    </ul>
    <h2>3. Action Items</h2>
    <ul>
      <li><strong>Alex M.:</strong> Finalize export modules for DOCX and PDF by Wednesday.</li>
      <li><strong>Sarah K.:</strong> Complete QA verification across mobile browsers.</li>
      <li><strong>David L.:</strong> Update sitemaps and metadata for newly deployed routes.</li>
    </ul>
  `,
  invoice: `
    <h1>INVOICE</h1>
    <p><strong>Invoice Number:</strong> #INV-2026-1049<br/><strong>Date of Issue:</strong> November 2, 2026<br/><strong>Due Date:</strong> November 16, 2026 (Net 14)</p>
    <hr/>
    <p><strong>Billed To:</strong><br/>Acme Enterprises Inc.<br/>Attn: Accounts Payable<br/>100 Enterprise Way, Suite 300<br/>New York, NY 10001</p>
    <table border="1">
      <thead>
        <tr><th>Description</th><th>Hours / Qty</th><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>
        <tr><td>Full-Stack SaaS Platform Architecture & Engineering</td><td>40 hrs</td><td>$125.00</td><td>$5,000.00</td></tr>
        <tr><td>Custom PDF & Document Manipulation Engine Integration</td><td>20 hrs</td><td>$125.00</td><td>$2,500.00</td></tr>
        <tr><td>Interactive Canvas Image Studio & UI Components</td><td>15 hrs</td><td>$125.00</td><td>$1,875.00</td></tr>
      </tbody>
    </table>
    <p style="text-align: right;"><strong>Subtotal:</strong> $9,375.00<br/><strong>Tax (0%):</strong> $0.00<br/><strong>Total Due:</strong> <strong>$9,375.00</strong></p>
    <p><strong>Payment Instructions:</strong> Wire transfer or ACH to Account #XXXX-4829.</p>
  `,
};

export default function WordEditorTool() {
  const [docTitle, setDocTitle] = useState<string>('Untitled Document');
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(1);
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [highlightColor, setHighlightColor] = useState<string>('#ffff00');

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load initial content or restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shahan_word_editor_content');
    if (editorRef.current) {
      if (saved) {
        editorRef.current.innerHTML = saved;
      } else {
        editorRef.current.innerHTML = TEMPLATES.resume;
      }
      updateStats();
    }
  }, []);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
    setReadingTime(Math.max(1, Math.ceil(words / 200)));

    // Auto-save to localStorage
    localStorage.setItem('shahan_word_editor_content', editorRef.current.innerHTML);
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateStats();
  };

  const handleHeading = (tag: string) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  const handleInsertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (!rows || !cols) return;

    let html = '<table border="1" style="width: 100%; border-collapse: collapse; margin: 1em 0;"><tbody>';
    for (let r = 0; r < parseInt(rows); r++) {
      html += '<tr>';
      for (let c = 0; c < parseInt(cols); c++) {
        html += `<td style="border: 1px solid #cbd5e1; padding: 8px 12px;">${r === 0 ? 'Header' : 'Cell'}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br/></p>';
    executeCommand('insertHTML', html);
  };

  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      executeCommand('insertHTML', `<img src="${src}" alt="Inserted Image" style="max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0;" /><p><br/></p>`);
      toast.success('Image inserted into document');
    };
    reader.readAsDataURL(file);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL (e.g. https://example.com):', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleOpenFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));

    if (name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const res = await mammoth.convertToHtml({ arrayBuffer });
        if (editorRef.current) {
          editorRef.current.innerHTML = res.value;
          updateStats();
          toast.success(`Imported Word document: ${file.name}`);
        }
      } catch (err: any) {
        toast.error('Failed to read .docx file: ' + err.message);
      }
    } else if (name.endsWith('.html') || name.endsWith('.txt') || name.endsWith('.md')) {
      const text = await file.text();
      if (editorRef.current) {
        editorRef.current.innerHTML = name.endsWith('.txt') ? `<p>${text.replace(/\n/g, '<br/>')}</p>` : text;
        updateStats();
        toast.success(`Loaded file: ${file.name}`);
      }
    }
  };

  const loadTemplate = (key: keyof typeof TEMPLATES) => {
    if (editorRef.current) {
      if (confirm('Load template? Any unsaved edits will be replaced.')) {
        editorRef.current.innerHTML = TEMPLATES[key];
        updateStats();
        toast.success('Template loaded!');
      }
    }
  };

  // Find and Replace
  const handleFindReplace = (replaceAll: boolean = false) => {
    if (!editorRef.current || !findText) return;
    const content = editorRef.current.innerHTML;
    if (!content.includes(findText)) {
      toast.error('Text not found in document');
      return;
    }

    if (replaceAll) {
      const updated = content.split(findText).join(replaceText);
      editorRef.current.innerHTML = updated;
      toast.success('Replaced all occurrences!');
    } else {
      const updated = content.replace(findText, replaceText);
      editorRef.current.innerHTML = updated;
      toast.success('Replaced first occurrence!');
    }
    updateStats();
  };

  // Export to Genuine DOCX
  const exportToDocx = async () => {
    if (!editorRef.current) return;
    setExporting(true);
    const toastId = toast.loading('Building Microsoft Word (.docx)...');

    try {
      const text = editorRef.current.innerText || '';
      const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);

      const docParagraphs = paragraphs.map((p) => {
        return new Paragraph({
          children: [
            new TextRun({
              text: p.trim(),
              size: 24, // 12pt
            }),
          ],
          spacing: { after: 140 },
        });
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docParagraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle || 'document'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      toast.success('Downloaded Word document (.docx)!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to export DOCX: ' + err.message, { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  // Export to PDF
  const exportToPdf = async () => {
    if (!editorRef.current) return;
    setExporting(true);
    const toastId = toast.loading('Rendering PDF document...');

    try {
      const canvas = await html2canvas(editorRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${docTitle || 'document'}.pdf`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      toast.success('Downloaded PDF document!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('PDF export failed. Try browser Print to PDF.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const exportAsText = (format: 'html' | 'md' | 'txt') => {
    if (!editorRef.current) return;
    let content = '';
    let ext = format;
    let mime = 'text/plain';

    if (format === 'html') {
      content = `<!DOCTYPE html><html><head><title>${docTitle}</title></head><body>${editorRef.current.innerHTML}</body></html>`;
      mime = 'text/html';
    } else if (format === 'md') {
      content = editorRef.current.innerText || '';
      mime = 'text/markdown';
    } else {
      content = editorRef.current.innerText || '';
      mime = 'text/plain';
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'document'}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported as .${ext}`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="bg-transparent text-white font-bold text-sm sm:text-base focus:outline-none focus:border-b border-blue-500 px-1"
              placeholder="Document Title"
            />
            <p className="text-[11px] text-slate-400 px-1">
              {wordCount} words • {charCount} chars • {readingTime} min read
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Templates Dropdown */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer">
              <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
              <span>Templates</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-48 p-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl space-y-1">
              <button
                onClick={() => loadTemplate('resume')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                📄 Resume / CV
              </button>
              <button
                onClick={() => loadTemplate('coverLetter')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                ✉️ Cover Letter
              </button>
              <button
                onClick={() => loadTemplate('proposal')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                📊 Project Proposal
              </button>
              <button
                onClick={() => loadTemplate('meetingNotes')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                📝 Meeting Minutes
              </button>
              <button
                onClick={() => loadTemplate('invoice')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                🧾 Professional Invoice
              </button>
            </div>
          </div>

          {/* Open File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open DOCX</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleOpenFile}
              accept=".docx,.html,.txt,.md"
              className="hidden"
            />
          </button>

          {/* Find & Replace Toggle */}
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`p-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer ${
              showFindReplace ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Find & Replace"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Export DOCX Button */}
          <button
            onClick={exportToDocx}
            disabled={exporting}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save .DOCX</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={exportToPdf}
            disabled={exporting}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2 text-xs animate-in fade-in slide-in-from-top-1">
          <input
            type="text"
            placeholder="Find text..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 flex-1 min-w-[140px]"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 flex-1 min-w-[140px]"
          />
          <button
            onClick={() => handleFindReplace(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
          >
            Replace Once
          </button>
          <button
            onClick={() => handleFindReplace(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Rich Text Toolbar */}
      <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-1 text-slate-300 shadow-md">
        {/* Undo / Redo */}
        <button
          onClick={() => executeCommand('undo')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('redo')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Headings */}
        <button
          onClick={() => handleHeading('h1')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-900 hover:text-white font-bold text-xs"
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => handleHeading('h2')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-900 hover:text-white font-bold text-xs"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => handleHeading('p')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-900 hover:text-white text-xs"
          title="Paragraph text"
        >
          Normal
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Formatting */}
        <button
          onClick={() => executeCommand('bold')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white font-bold cursor-pointer"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('italic')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white italic cursor-pointer"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('underline')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white underline cursor-pointer"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('strikeThrough')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('subscript')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Subscript"
        >
          <Subscript className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('superscript')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Superscript"
        >
          <Superscript className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Alignment */}
        <button
          onClick={() => executeCommand('justifyLeft')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('justifyCenter')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('justifyRight')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('justifyFull')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Lists */}
        <button
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('insertOrderedList')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Color Pickers */}
        <label className="flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-slate-900" title="Text Color">
          <span className="text-[11px] font-bold">A</span>
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              executeCommand('foreColor', e.target.value);
            }}
            className="w-4 h-4 rounded border-none bg-transparent cursor-pointer"
          />
        </label>

        <label className="flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-slate-900" title="Highlight Color">
          <span className="text-[10px] bg-yellow-400 text-black px-1 rounded font-bold">HL</span>
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => {
              setHighlightColor(e.target.value);
              executeCommand('hiliteColor', e.target.value);
            }}
            className="w-4 h-4 rounded border-none bg-transparent cursor-pointer"
          />
        </label>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Inserts */}
        <button
          onClick={handleInsertTable}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Insert Table"
        >
          <Table className="w-4 h-4" />
        </button>
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleInsertImage}
            accept="image/*"
            className="hidden"
          />
        </button>
        <button
          onClick={handleInsertLink}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Insert Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('formatBlock', '<pre>')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-white cursor-pointer"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={() => executeCommand('removeFormat')}
          className="p-2 rounded-lg hover:bg-slate-900 hover:text-rose-400 cursor-pointer"
          title="Clear Formatting"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Realistic A4 Document Canvas Sheet */}
      <div className="rounded-2xl bg-slate-900/60 p-4 sm:p-8 border border-slate-800 overflow-x-auto flex justify-center">
        <div
          ref={editorRef}
          contentEditable
          onInput={updateStats}
          spellCheck
          className="w-[820px] min-h-[1140px] bg-white text-slate-950 p-10 sm:p-16 rounded-sm shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-sans leading-relaxed text-base"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      {/* Bottom Export Formats Strip */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Auto-saved to local browser cache. Export formats:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAsText('html')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            HTML
          </button>
          <button
            onClick={() => exportAsText('md')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            Markdown (.md)
          </button>
          <button
            onClick={() => exportAsText('txt')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            Plain Text (.txt)
          </button>
        </div>
      </div>
    </div>
  );
}
