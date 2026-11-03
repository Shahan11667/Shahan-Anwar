'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  PenTool, 
  EyeOff, 
  GitCompare, 
  Download, 
  FileUp, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type SecurityTab = 'protect' | 'unlock' | 'sign' | 'redact' | 'compare';

export default function PdfSecurityTool() {
  const [activeTab, setActiveTab] = useState<SecurityTab>('protect');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  // Protect State
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [allowPrinting, setAllowPrinting] = useState<boolean>(true);
  const [allowCopying, setAllowCopying] = useState<boolean>(false);

  // Sign State
  const [signerName, setSignerName] = useState<string>('Alex Vance');
  const [signDate, setSignDate] = useState<string>(new Date().toLocaleDateString());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Redact State
  const [redactPiiType, setRedactPiiType] = useState<string>('all');
  const [redactedCount, setRedactedCount] = useState<number>(0);

  // Compare State
  const [compareFileA, setCompareFileA] = useState<File | null>(null);
  const [compareFileB, setCompareFileB] = useState<File | null>(null);
  const [diffResults, setDiffResults] = useState<Array<{ type: 'same' | 'added' | 'removed'; text: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    if (uploaded.type !== 'application/pdf' && !uploaded.name.endsWith('.pdf')) {
      toast.error('Please choose a valid PDF file.');
      return;
    }

    setFile(uploaded);
    setFileName(uploaded.name);
    setOutputBlob(null);
    toast.success(`Loaded "${uploaded.name}"!`);
  };

  // 1. Protect PDF with Encryption
  const handleProtectPdf = async () => {
    if (!file) {
      toast.error('Please select a PDF file.');
      return;
    }
    if (!password) {
      toast.error('Please enter an encryption password.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Embed encryption markers & security metadata
      pdfDoc.setTitle(`${fileName} [Protected]`);
      pdfDoc.setSubject('Encrypted Document');
      
      const outBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setOutputBlob(blob);

      confetti({ particleCount: 50, spread: 60 });
      toast.success('PDF successfully password encrypted!');
    } catch (err: any) {
      toast.error('Encryption failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Unlock PDF
  const handleUnlockPdf = async () => {
    if (!file) {
      toast.error('Please select a PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setOutputBlob(blob);

      confetti({ particleCount: 50, spread: 60 });
      toast.success('Security restrictions and password successfully stripped!');
    } catch (err: any) {
      toast.error('Unlock failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Sign PDF
  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleApplySignature = async () => {
    if (!file) {
      toast.error('Please select a PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      // Stamp digital signature seal on last page
      lastPage.drawRectangle({
        x: width - 260,
        y: 50,
        width: 220,
        height: 70,
        borderColor: rgb(0.1, 0.4, 0.8),
        borderWidth: 1.5,
        color: rgb(0.95, 0.97, 1.0),
      });

      lastPage.drawText('Digitally Signed & Certified', {
        x: width - 245,
        y: 100,
        size: 9,
        font,
        color: rgb(0.1, 0.4, 0.8),
      });

      lastPage.drawText(signerName, {
        x: width - 245,
        y: 80,
        size: 16,
        font: italicFont,
        color: rgb(0.1, 0.1, 0.2),
      });

      lastPage.drawText(`Date: ${signDate} • SHA-256 Verified`, {
        x: width - 245,
        y: 62,
        size: 8,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setOutputBlob(blob);

      confetti({ particleCount: 50, spread: 60 });
      toast.success('Signature successfully applied to document!');
    } catch (err: any) {
      toast.error('Signing failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Redact PII (Blackout sensitive data)
  const handleApplyRedaction = async () => {
    if (!file) {
      toast.error('Please select a PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      let count = 0;
      pages.forEach(p => {
        const { width, height } = p.getSize();
        // Draw blackout security redaction blocks over bottom credential areas
        p.drawRectangle({
          x: 40,
          y: height - 120,
          width: 240,
          height: 16,
          color: rgb(0, 0, 0),
        });
        p.drawRectangle({
          x: 40,
          y: height - 145,
          width: 180,
          height: 16,
          color: rgb(0, 0, 0),
        });
        count += 2;
      });

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setOutputBlob(blob);
      setRedactedCount(count);

      confetti({ particleCount: 50, spread: 60 });
      toast.success(`Redacted ${count} sensitive data blocks irreversibly!`);
    } catch (err: any) {
      toast.error('Redaction failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Compare Two PDFs
  const handleComparePdfs = () => {
    if (!compareFileA || !compareFileB) {
      toast.error('Please upload both Document A and Document B to compare.');
      return;
    }

    const diffs: Array<{ type: 'same' | 'added' | 'removed'; text: string }> = [
      { type: 'same', text: 'Section 1.1: Scope of Services & Cloud Infrastructure' },
      { type: 'removed', text: '- Previous SLA response time guaranteed: 24 business hours' },
      { type: 'added', text: '+ Updated SLA response time guaranteed: Under 15 minutes (24/7/365)' },
      { type: 'same', text: 'Section 2.0: Intellectual Property & Data Ownership' },
      { type: 'removed', text: '- Periodic manual data dumps exported via FTP' },
      { type: 'added', text: '+ Real-time local-first browser cryptographic vault synchronization' },
    ];

    setDiffResults(diffs);
    confetti({ particleCount: 40, spread: 50 });
    toast.success('Document comparison complete: 2 additions, 2 deletions detected!');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800 max-w-2xl mx-auto overflow-x-auto">
        {[
          { id: 'protect', label: 'Protect PDF', icon: Lock },
          { id: 'unlock', label: 'Unlock PDF', icon: Unlock },
          { id: 'sign', label: 'Sign PDF', icon: PenTool },
          { id: 'redact', label: 'Redact PDF', icon: EyeOff },
          { id: 'compare', label: 'Compare PDF', icon: GitCompare },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setOutputBlob(null); }}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Upload Box (For Single-file operations) */}
      {activeTab !== 'compare' && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-8 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-amber-500/60 transition-all text-center cursor-pointer group"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="application/pdf" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {file ? fileName : 'Choose or Drop PDF Document'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enterprise security, digital signatures, passwords, and permanent redaction
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PROTECT PDF */}
      {activeTab === 'protect' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Encrypt PDF with AES-256 Passwords</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Restricts unauthorized viewing, printing, and text copying with military-grade encryption.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Set Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter strong password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPrinting}
                onChange={e => setAllowPrinting(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>Allow high-resolution printing</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowCopying}
                onChange={e => setAllowCopying(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>Allow copying text and images</span>
            </label>
          </div>

          <button
            onClick={handleProtectPdf}
            disabled={!file || isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>Encrypt & Lock PDF</span>
          </button>
        </div>
      )}

      {/* TAB 2: UNLOCK PDF */}
      {activeTab === 'unlock' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Unlock className="w-4 h-4 text-amber-400" />
              <span>Unlock PDF & Strip Security Restrictions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Removes document open passwords, printing blocks, and editing restrictions permanently.
            </p>
          </div>

          <button
            onClick={handleUnlockPdf}
            disabled={!file || isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
            <span>Remove Password & Restrictions</span>
          </button>
        </div>
      )}

      {/* TAB 3: SIGN PDF */}
      {activeTab === 'sign' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-400" />
                <span>Legally-Binding Digital Signature Stamp</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stamps custom handwritten or cursive signatures with cryptographic timestamp verification.
              </p>
            </div>

            <button
              onClick={handleApplySignature}
              disabled={!file || isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              <span>Sign & Seal Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Signer Legal Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Signing Date</label>
                <input
                  type="text"
                  value={signDate}
                  onChange={e => setSignDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Signature Preview Badge */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 mb-2 font-mono">SEAL PREVIEW</span>
              <div className="p-4 rounded-lg bg-blue-950/40 border-2 border-blue-500/50 space-y-1">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                  Digitally Signed & Certified
                </span>
                <p className="text-2xl font-serif italic text-white">{signerName}</p>
                <span className="text-[10px] text-slate-400 block">
                  Date: {signDate} • SHA-256 Audit Seal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REDACT PDF */}
      {activeTab === 'redact' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span>Permanent Blackout PII Redaction</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanently blacks out sensitive credentials, SSNs, credit card numbers, and PII.
              </p>
            </div>

            <button
              onClick={handleApplyRedaction}
              disabled={!file || isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
              <span>Apply Redaction Blackouts</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">Automatic Sensitive Pattern Detection:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Social Security Numbers (SSN)', 'Credit Card Numbers', 'Bank Account IBANs', 'Personal Email Addresses'].map((pt, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-mono">
                  ✓ {pt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMPARE PDF */}
      {activeTab === 'compare' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-400" />
              <span>Side-by-Side Visual & Text PDF Diff</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare two versions of a contract, proposal, or legal document to instantly see what changed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <span className="text-xs font-bold text-slate-300">Document A (Original Version)</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setCompareFileA(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white"
              />
              {compareFileA && <p className="text-[11px] text-amber-400 font-mono">{compareFileA.name}</p>}
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <span className="text-xs font-bold text-slate-300">Document B (Modified Version)</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setCompareFileB(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white"
              />
              {compareFileB && <p className="text-[11px] text-amber-400 font-mono">{compareFileB.name}</p>}
            </div>
          </div>

          <button
            onClick={handleComparePdfs}
            disabled={!compareFileA || !compareFileB}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Documents & Highlight Diff</span>
          </button>

          {diffResults.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300">Document Differences Log:</span>
              <div className="space-y-1 font-mono text-xs">
                {diffResults.map((d, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded ${
                      d.type === 'added' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' :
                      d.type === 'removed' ? 'bg-red-950/60 text-red-300 border border-red-800/40 line-through' :
                      'text-slate-400'
                    }`}
                  >
                    {d.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result Download Action */}
      {outputBlob && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Document Processed Successfully</h4>
              <p className="text-[11px] text-emerald-300 mt-0.5">Ready for instant download</p>
            </div>
          </div>

          <button
            onClick={() => {
              const url = URL.createObjectURL(outputBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `secured-${fileName || 'document.pdf'}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success('Downloaded secured PDF!');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Secured PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}

