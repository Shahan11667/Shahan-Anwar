'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Layers, 
  Printer, 
  HardDrive, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type CalcTab = 'freelance' | 'loan' | 'print' | 'bandwidth';

export default function NicheCalculatorsTool() {
  const [activeTab, setActiveTab] = useState<CalcTab>('freelance');

  // --- 1. Freelance Rate Calculator State ---
  const [desiredAnnualIncome, setDesiredAnnualIncome] = useState<number>(120000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(15000);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(25);
  const [weeksVacation, setWeeksVacation] = useState<number>(4);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25);

  // Freelance calculations
  const grossTarget = (desiredAnnualIncome + annualExpenses) / (1 - (taxRatePercent / 100));
  const workingWeeks = Math.max(1, 52 - weeksVacation);
  const totalBillableHours = workingWeeks * billableHoursPerWeek;
  const hourlyRate = totalBillableHours > 0 ? grossTarget / totalBillableHours : 0;
  const dayRate = hourlyRate * 8;
  const monthlyGrossTarget = grossTarget / 12;

  // --- 2. Loan & EMI Calculator State ---
  const [loanPrincipal, setLoanPrincipal] = useState<number>(300000);
  const [loanApr, setLoanApr] = useState<number>(6.5);
  const [loanYears, setLoanYears] = useState<number>(30);

  // Loan calculations
  const totalMonths = loanYears * 12;
  const monthlyRate = loanApr / 100 / 12;
  const monthlyPayment = monthlyRate > 0
    ? (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : loanPrincipal / totalMonths;
  const totalLoanRepaid = monthlyPayment * totalMonths;
  const totalInterest = totalLoanRepaid - loanPrincipal;

  // --- 3. Print & Bleed Calculator State ---
  const [printPreset, setPrintPreset] = useState<'a4' | 'letter' | 'card' | 'poster'>('a4');
  const [printWidthInches, setPrintWidthInches] = useState<number>(8.27); // A4 width
  const [printHeightInches, setPrintHeightInches] = useState<number>(11.69); // A4 height
  const [dpi, setDpi] = useState<number>(300);
  const [bleedInches, setBleedInches] = useState<number>(0.125); // Standard 1/8" bleed

  // Print calculations
  const totalWInches = printWidthInches + (bleedInches * 2);
  const totalHInches = printHeightInches + (bleedInches * 2);
  const pixelWidth = Math.round(totalWInches * dpi);
  const pixelHeight = Math.round(totalHInches * dpi);
  const megapixels = ((pixelWidth * pixelHeight) / 1000000).toFixed(1);

  // --- 4. Bandwidth & Transfer Time Calculator State ---
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(25); // 25 GB
  const [fileSizeUnit, setFileSizeUnit] = useState<'GB' | 'MB' | 'TB'>('GB');
  const [internetSpeedMbps, setInternetSpeedMbps] = useState<number>(100); // 100 Mbps

  // Transfer calculations
  const totalMB = fileSizeUnit === 'TB' ? fileSizeBytes * 1024 * 1024 : fileSizeUnit === 'GB' ? fileSizeBytes * 1024 : fileSizeBytes;
  const totalBits = totalMB * 8 * 1024 * 1024;
  const speedBitsPerSec = internetSpeedMbps * 1000000;
  const transferSeconds = speedBitsPerSec > 0 ? totalBits / speedBitsPerSec : 0;

  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${Math.round(sec)} seconds`;
    if (sec < 3600) return `${Math.floor(sec / 60)} min ${Math.round(sec % 60)} sec`;
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hours} hrs ${mins} mins`;
  };

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    confetti({ particleCount: 25, spread: 45 });
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Niche Unit & Smart Calculators</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-400 border border-purple-800/40">
                Ad-Free • Instant Load
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero clutter, no SEO spam pages. Instant mathematical modeling for creators, freelancers & engineers.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('freelance')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'freelance' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Freelance Rate
          </button>
          <button
            onClick={() => setActiveTab('loan')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'loan' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Loan / Mortgage
          </button>
          <button
            onClick={() => setActiveTab('print')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'print' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Print & DPI Bleed
          </button>
          <button
            onClick={() => setActiveTab('bandwidth')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'bandwidth' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Download Time
          </button>
        </div>
      </div>

      {/* Main Calculator Body */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
        {/* TAB 1: FREELANCE HOURLY RATE CALCULATOR */}
        {activeTab === 'freelance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Freelance Hourly & Revenue Target Calculator</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Most freelancers undercharge because they forget taxes, business overhead, and non-billable admin time. Calculate what you genuinely need to bill.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Desired Take-Home Annual Income</span>
                    <span className="font-mono text-purple-400 font-bold">${desiredAnnualIncome.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="300000"
                    step="5000"
                    value={desiredAnnualIncome}
                    onChange={(e) => setDesiredAnnualIncome(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Annual Business Expenses ($)</label>
                    <input
                      type="number"
                      value={annualExpenses}
                      onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Tax Reserve (%)</label>
                    <input
                      type="number"
                      value={taxRatePercent}
                      onChange={(e) => setTaxRatePercent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Weeks Off / Vacation</label>
                    <input
                      type="number"
                      value={weeksVacation}
                      onChange={(e) => setWeeksVacation(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Billable Hours / Week</label>
                    <input
                      type="number"
                      value={billableHoursPerWeek}
                      onChange={(e) => setBillableHoursPerWeek(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/40 space-y-5 text-center shadow-2xl">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-purple-400">
                  Target Minimum Billable Rate
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">
                  ${Math.round(hourlyRate)}<span className="text-xl font-normal text-slate-400">/hr</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-purple-800/30 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Standard Day Rate</span>
                  <span className="text-base font-bold text-emerald-400">${Math.round(dayRate)}/day</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Gross Revenue / Month</span>
                  <span className="text-base font-bold text-cyan-400">${Math.round(monthlyGrossTarget).toLocaleString()}/mo</span>
                </div>
              </div>

              <button
                onClick={() => copyResult(`Minimum Billable Rate: $${Math.round(hourlyRate)}/hr | Day Rate: $${Math.round(dayRate)}/day`)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Rates Summary</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: LOAN & EMI CALCULATOR */}
        {activeTab === 'loan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Mortgage & Loan Payment (EMI) Calculator</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculate your exact fixed monthly payment and total interest cost over the life of the loan with zero bank advertising.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Principal Amount ($)</span>
                    <span className="font-mono text-emerald-400 font-bold">${loanPrincipal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1500000"
                    step="5000"
                    value={loanPrincipal}
                    onChange={(e) => setLoanPrincipal(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Interest Rate (APR %)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={loanApr}
                      onChange={(e) => setLoanApr(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Term (Years)</label>
                    <input
                      type="number"
                      value={loanYears}
                      onChange={(e) => setLoanYears(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/40 space-y-5 text-center shadow-2xl">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                  Monthly Payment (Principal + Interest)
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">
                  ${Math.round(monthlyPayment).toLocaleString()}<span className="text-xl font-normal text-slate-400">/mo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-800/30 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Interest Paid</span>
                  <span className="text-base font-bold text-amber-400">${Math.round(totalInterest).toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Repayment</span>
                  <span className="text-base font-bold text-white">${Math.round(totalLoanRepaid).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => copyResult(`Monthly Payment: $${Math.round(monthlyPayment)}/mo | Total Interest: $${Math.round(totalInterest)}`)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Loan Estimate</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PRINT & DPI BLEED CALCULATOR */}
        {activeTab === 'print' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print Canvas, DPI & Bleed Pixel Calculator</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eliminate pixelation and cutting errors. Calculates exact canvas pixel resolutions including 3mm standard printer bleed margins.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  {[
                    { id: 'a4', name: 'A4', w: 8.27, h: 11.69 },
                    { id: 'letter', name: 'US Letter', w: 8.5, h: 11 },
                    { id: 'card', name: 'Business Card', w: 3.5, h: 2.0 },
                    { id: 'poster', name: 'Poster (18×24")', w: 18, h: 24 }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPrintPreset(p.id as any);
                        setPrintWidthInches(p.w);
                        setPrintHeightInches(p.h);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        printPreset === p.id
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Width (Inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={printWidthInches}
                      onChange={(e) => setPrintWidthInches(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Height (Inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={printHeightInches}
                      onChange={(e) => setPrintHeightInches(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">DPI / PPI</label>
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="300">300 DPI (High Print Standard)</option>
                      <option value="150">150 DPI (Large Format Banner)</option>
                      <option value="600">600 DPI (Ultra-Fine Art)</option>
                      <option value="72">72 DPI (Web Screen)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-800/40 space-y-5 text-center shadow-2xl">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400">
                  Required Photoshop / Canvas Dimensions
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight font-mono">
                  {pixelWidth} × {pixelHeight} px
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Includes 0.125" (3mm) standard bleed border</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cyan-800/30 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Resolution Quality</span>
                  <span className="text-base font-bold text-emerald-400">{megapixels} Megapixels</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Trim Size (No Bleed)</span>
                  <span className="text-xs font-mono font-bold text-white">{Math.round(printWidthInches * dpi)} × {Math.round(printHeightInches * dpi)} px</span>
                </div>
              </div>

              <button
                onClick={() => copyResult(`${pixelWidth}x${pixelHeight}`)}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Pixel Dimensions</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: BANDWIDTH & TRANSFER TIME CALCULATOR */}
        {activeTab === 'bandwidth' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-pink-400" />
                <span>File Download & Upload Transfer Estimator</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estimate how long massive file transfers, game downloads, or database backups will take based on actual real-world Mbps speeds.
              </p>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400">File / Backup Size</label>
                    <input
                      type="number"
                      min="1"
                      value={fileSizeBytes}
                      onChange={(e) => setFileSizeBytes(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Unit</label>
                    <select
                      value={fileSizeUnit}
                      onChange={(e) => setFileSizeUnit(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="GB">Gigabytes (GB)</option>
                      <option value="TB">Terabytes (TB)</option>
                      <option value="MB">Megabytes (MB)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Connection Speed (Mbps)</span>
                    <span className="font-mono text-pink-400 font-bold">{internetSpeedMbps} Mbps</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={internetSpeedMbps}
                    onChange={(e) => setInternetSpeedMbps(parseFloat(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-800/40 space-y-5 text-center shadow-2xl">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-pink-400">
                  Estimated Transfer Duration
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                  {formatSeconds(transferSeconds)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-pink-800/30 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Real Download Speed</span>
                  <span className="text-base font-bold text-white">{(internetSpeedMbps / 8).toFixed(1)} MB/sec</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Transfer Volume</span>
                  <span className="text-base font-bold text-emerald-400">{fileSizeBytes} {fileSizeUnit}</span>
                </div>
              </div>

              <button
                onClick={() => copyResult(`Transfer time for ${fileSizeBytes} ${fileSizeUnit} at ${internetSpeedMbps} Mbps: ${formatSeconds(transferSeconds)}`)}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Estimate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

