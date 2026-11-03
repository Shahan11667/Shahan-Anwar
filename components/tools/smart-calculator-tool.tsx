'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Printer, 
  Briefcase, 
  TrendingUp, 
  HardDrive, 
  Copy, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  Sliders,
  DollarSign,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type CalcMode = 'print' | 'freelance' | 'compound' | 'bandwidth';

export default function SmartCalculatorTool() {
  const [mode, setMode] = useState<CalcMode>('print');

  // MODE 1: Print & Bleed Calculator
  const [printWidthIn, setPrintWidthIn] = useState<number>(8.5);
  const [printHeightIn, setPrintHeightIn] = useState<number>(11);
  const [dpi, setDpi] = useState<number>(300);
  const [bleedIn, setBleedIn] = useState<number>(0.125); // 1/8th inch

  // Calculations for Print
  const pixelWidth = Math.round(printWidthIn * dpi);
  const pixelHeight = Math.round(printHeightIn * dpi);
  const totalWidthWithBleed = printWidthIn + bleedIn * 2;
  const totalHeightWithBleed = printHeightIn + bleedIn * 2;
  const bleedPixelWidth = Math.round(totalWidthWithBleed * dpi);
  const bleedPixelHeight = Math.round(totalHeightWithBleed * dpi);

  // MODE 2: Freelancer Hourly Rate Calculator
  const [targetAnnualIncome, setTargetAnnualIncome] = useState<number>(120000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(15000);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(25);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25);
  const [vacationWeeks, setVacationWeeks] = useState<number>(4);

  // Calculations for Freelancer
  const workingWeeks = Math.max(1, 52 - vacationWeeks);
  const annualBillableHours = workingWeeks * billableHoursPerWeek;
  const grossTarget = (targetAnnualIncome + annualExpenses) / (1 - taxRatePercent / 100);
  const recommendedHourlyRate = Math.round(grossTarget / annualBillableHours);
  const recommendedDayRate = recommendedHourlyRate * 8;
  const monthlyRevenue = Math.round(grossTarget / 12);

  // MODE 3: Compound Growth Calculator
  const [initialPrincipal, setInitialPrincipal] = useState<number>(10000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(500);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(8);
  const [investmentYears, setInvestmentYears] = useState<number>(10);

  // Calculations for Compound Growth
  const calculateCompoundGrowth = () => {
    const monthlyRate = (annualReturnRate / 100) / 12;
    const totalMonths = investmentYears * 12;
    let balance = initialPrincipal;
    let totalDeposited = initialPrincipal;

    for (let i = 0; i < totalMonths; i++) {
      balance = balance * (1 + monthlyRate) + monthlyDeposit;
      totalDeposited += monthlyDeposit;
    }

    const totalInterest = balance - totalDeposited;
    return {
      futureValue: Math.round(balance),
      totalDeposited: Math.round(totalDeposited),
      totalInterest: Math.round(totalInterest),
    };
  };
  const compoundResults = calculateCompoundGrowth();

  // MODE 4: Bandwidth & File Transfer
  const [fileSizeGb, setFileSizeGb] = useState<number>(50);
  const [speedMbps, setSpeedMbps] = useState<number>(100);

  const calculateTransferTime = () => {
    const totalBits = fileSizeGb * 8 * 1024 * 1024 * 1024;
    const speedBps = speedMbps * 1000 * 1000;
    const seconds = (totalBits / speedBps) * 1.08; // 8% TCP overhead
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    return { hours, mins, secs, totalSeconds: Math.round(seconds) };
  };
  const transferTime = calculateTransferTime();

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied result to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Niche Unit, Rate & Financial Calculators
            </h4>
            <p className="text-[11px] text-slate-400">
              Zero ads • Zero SEO bloat • Instant client-side computation
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMode('print')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'print' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print & Bleed</span>
          </button>

          <button
            onClick={() => setMode('freelance')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'freelance' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Freelance Rate</span>
          </button>

          <button
            onClick={() => setMode('compound')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'compound' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Compound Growth</span>
          </button>

          <button
            onClick={() => setMode('bandwidth')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'bandwidth' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Data Transfer</span>
          </button>
        </div>
      </div>

      {/* MODE 1: Print & Bleed Calculator */}
      {mode === 'print' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Document & Print Settings</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Width (Inches)</label>
                <input
                  type="number"
                  step="0.25"
                  value={printWidthIn}
                  onChange={e => setPrintWidthIn(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Height (Inches)</label>
                <input
                  type="number"
                  step="0.25"
                  value={printHeightIn}
                  onChange={e => setPrintHeightIn(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">DPI / Resolution</label>
                <select
                  value={dpi}
                  onChange={e => setDpi(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white cursor-pointer"
                >
                  <option value="72">72 DPI (Web / Screen)</option>
                  <option value="150">150 DPI (Draft / Newsprint)</option>
                  <option value="300">300 DPI (Commercial Print Standard)</option>
                  <option value="600">600 DPI (Fine Art / High Definition)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Bleed Allowance (Inches)</label>
                <select
                  value={bleedIn}
                  onChange={e => setBleedIn(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white cursor-pointer"
                >
                  <option value="0">0.0" (No Bleed)</option>
                  <option value="0.125">0.125" / 1/8 in (Standard US Bleed)</option>
                  <option value="0.118">0.118" / 3mm (Standard Metric Bleed)</option>
                  <option value="0.25">0.250" / 1/4 in (Large Format)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Output */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Required Canvas Specifications</span>
              <span className="text-xs font-mono text-amber-400">@ {dpi} DPI</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Cut Trim Size (No Bleed):</span>
                  <span className="text-base font-mono font-bold text-white">
                    {pixelWidth} × {pixelHeight} px
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    ({(printWidthIn * 25.4).toFixed(1)} × {(printHeightIn * 25.4).toFixed(1)} mm)
                  </span>
                </div>
                <button
                  onClick={() => copyResult(`${pixelWidth}x${pixelHeight}`)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-300 block font-semibold">
                    Full Canvas With Bleed (Setup in Photoshop/Figma):
                  </span>
                  <span className="text-xl font-mono font-extrabold text-amber-400">
                    {bleedPixelWidth} × {bleedPixelHeight} px
                  </span>
                  <span className="text-[11px] text-amber-300/80 block">
                    Total: {totalWidthWithBleed.toFixed(3)}" × {totalHeightWithBleed.toFixed(3)}" (Adds {bleedIn}" to all 4 edges)
                  </span>
                </div>
                <button
                  onClick={() => copyResult(`${bleedPixelWidth}x${bleedPixelHeight}`)}
                  className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Freelance Rate Calculator */}
      {mode === 'freelance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Income & Lifestyle Inputs</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Desired Net Annual Income ($)</label>
                <input
                  type="number"
                  step="5000"
                  value={targetAnnualIncome}
                  onChange={e => setTargetAnnualIncome(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Annual Expenses ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={annualExpenses}
                    onChange={e => setAnnualExpenses(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estimated Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={taxRatePercent}
                    onChange={e => setTaxRatePercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Billable Hours / Week</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={billableHoursPerWeek}
                    onChange={e => setBillableHoursPerWeek(parseFloat(e.target.value) || 20)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vacation / Sick Weeks</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={vacationWeeks}
                    onChange={e => setVacationWeeks(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Output */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Recommended Billing Rates</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 space-y-1">
                <span className="text-xs text-amber-300 font-medium">Hourly Rate</span>
                <p className="text-2xl font-extrabold text-amber-400 font-mono">
                  ${recommendedHourlyRate}
                  <span className="text-xs font-normal text-amber-300">/hr</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Day Rate (8h)</span>
                <p className="text-2xl font-extrabold text-white font-mono">
                  ${recommendedDayRate}
                  <span className="text-xs font-normal text-slate-400">/day</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Monthly Gross:</span>
                <span className="font-bold text-white font-mono">${monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Billable Hours:</span>
                <span className="font-bold text-white font-mono">{annualBillableHours} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Gross Target (inc. taxes):</span>
                <span className="font-bold text-emerald-400 font-mono">${Math.round(grossTarget).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: Compound Growth */}
      {mode === 'compound' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Investment Parameters</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Initial Starting Deposit ($)</label>
                <input
                  type="number"
                  step="1000"
                  value={initialPrincipal}
                  onChange={e => setInitialPrincipal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Monthly Contribution ($)</label>
                <input
                  type="number"
                  step="50"
                  value={monthlyDeposit}
                  onChange={e => setMonthlyDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={annualReturnRate}
                    onChange={e => setAnnualReturnRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Time Horizon (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={investmentYears}
                    onChange={e => setInvestmentYears(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Projected Growth</h3>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-1">
              <span className="text-xs text-emerald-300 font-medium">Future Value ({investmentYears} Years)</span>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">
                ${compoundResults.futureValue.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Total Money Deposited:</span>
                <span className="font-bold text-white font-mono">${compoundResults.totalDeposited.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Total Compound Interest Earned:</span>
                <span className="font-bold text-emerald-400 font-mono">+${compoundResults.totalInterest.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: Bandwidth & File Transfer */}
      {mode === 'bandwidth' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Transfer Variables</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">File or Dataset Size (GB)</label>
                <input
                  type="number"
                  step="5"
                  value={fileSizeGb}
                  onChange={e => setFileSizeGb(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Network Download/Upload Speed (Mbps)</label>
                <input
                  type="number"
                  step="25"
                  value={speedMbps}
                  onChange={e => setSpeedMbps(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Estimated Transfer Time</h3>

            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 space-y-1">
              <span className="text-xs text-cyan-300 font-medium">Duration</span>
              <p className="text-3xl font-extrabold text-cyan-400 font-mono">
                {transferTime.hours > 0 && `${transferTime.hours}h `}
                {transferTime.mins}m {transferTime.secs}s
              </p>
              <span className="text-[11px] text-slate-400 block pt-1">
                Calculated with 8% real-world TCP packet overhead.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

