'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  CreditCard, 
  Building, 
  DollarSign, 
  RotateCcw,
  Calendar,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  items: LineItem[];
  taxRate: number; // percentage e.g. 10
  discount: number; // percentage e.g. 5
  notes: string;
  paymentDetails: string;
}

const SAMPLE_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-2026-0042',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  currency: '$',
  fromName: 'NovaCraft Studio LLC',
  fromEmail: 'billing@novacraft.dev',
  fromAddress: '100 Innovation Way, Suite 400\nAustin, TX 78701',
  toName: 'Acme Global Ventures',
  toEmail: 'accounts@acmeglobal.com',
  toAddress: '742 Evergreen Terrace\nSeattle, WA 98101',
  items: [
    {
      id: 'item-1',
      description: 'Full-Stack Web Application Architecture & MVP Development',
      quantity: 1,
      rate: 4500
    },
    {
      id: 'item-2',
      description: 'API Integration & Real-Time WebSocket Infrastructure',
      quantity: 1,
      rate: 1800
    },
    {
      id: 'item-3',
      description: 'Responsive UI Design & Performance Optimization (Core Web Vitals)',
      quantity: 1,
      rate: 1200
    }
  ],
  taxRate: 8.25,
  discount: 0,
  notes: 'Thank you for your business! Payment is due within 14 days of invoice date.',
  paymentDetails: 'Wire Transfer / ACH:\nBank: Silicon Valley Bank\nRouting: 121000358\nAccount: 9876543210\nOr PayPal / Stripe: billing@novacraft.dev'
};

const CURRENCIES = [
  { symbol: '$', code: 'USD / CAD / AUD' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
  { symbol: '₹', code: 'INR' },
  { symbol: '¥', code: 'JPY' },
  { symbol: 'Fr.', code: 'CHF' },
];

export default function InvoiceGeneratorTool() {
  const [data, setData] = useState<InvoiceData>(SAMPLE_INVOICE);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'payment'>('details');

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agy_invoice_generator_data');
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('agy_invoice_generator_data', JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }, [data]);

  // Calculations
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const discountAmount = subtotal * (data.discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (data.taxRate / 100);
  const totalDue = taxableAmount + taxAmount;

  const handlePrint = () => {
    window.print();
    confetti({ particleCount: 30, spread: 60 });
  };

  const handleResetSample = () => {
    if (confirm('Load sample freelance invoice?')) {
      setData(SAMPLE_INVOICE);
      toast.success('Sample invoice loaded!');
    }
  };

  const handleClear = () => {
    if (confirm('Clear invoice to blank?')) {
      setData({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        currency: '$',
        fromName: '',
        fromEmail: '',
        fromAddress: '',
        toName: '',
        toEmail: '',
        toAddress: '',
        items: [
          { id: 'item-1', description: 'Consulting / Development Service', quantity: 1, rate: 0 }
        ],
        taxRate: 0,
        discount: 0,
        notes: 'Payment is due within 14 days.',
        paymentDetails: ''
      });
      toast.success('Cleared!');
    }
  };

  // Line Items
  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: 'item-' + Date.now(),
          description: 'New Service or Product item',
          quantity: 1,
          rate: 100
        }
      ]
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length <= 1) {
      toast.error('Invoice must have at least one line item');
      return;
    }
    setData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: val } : i)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Instant PDF Invoice & Receipt Generator
            </h4>
            <p className="text-[11px] text-slate-400">
              No database • Local-first • Auto-calculated totals & tax
            </p>
          </div>
        </div>

        {/* Currency & Print Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={data.currency}
            onChange={e => setData({ ...data, currency: e.target.value })}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-medium cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} ({c.code})
              </option>
            ))}
          </select>

          <button
            onClick={handleResetSample}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
          >
            Load Sample
          </button>

          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Controls, Right Clean Invoice Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 max-h-[850px] overflow-y-auto">
          {/* Form Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Parties & Dates
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'items' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Line Items ({data.items.length})
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'payment' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Terms & Notes
            </button>
          </div>

          {/* TAB 1: Parties & Dates */}
          {activeTab === 'details' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={data.invoiceNumber}
                    onChange={e => setData({ ...data, invoiceNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={data.issueDate}
                    onChange={e => setData({ ...data, issueDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={data.dueDate}
                  onChange={e => setData({ ...data, dueDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="font-semibold text-emerald-400 block mb-2">From (Your Business / Freelancer)</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your Company / Full Name"
                    value={data.fromName}
                    onChange={e => setData({ ...data, fromName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={data.fromEmail}
                    onChange={e => setData({ ...data, fromEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Address / Tax ID / Phone"
                    value={data.fromAddress}
                    onChange={e => setData({ ...data, fromAddress: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="font-semibold text-blue-400 block mb-2">Bill To (Client Details)</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Client Company or Contact Name"
                    value={data.toName}
                    onChange={e => setData({ ...data, toName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="email"
                    placeholder="Client Billing Email"
                    value={data.toEmail}
                    onChange={e => setData({ ...data, toEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Client Billing Address"
                    value={data.toAddress}
                    onChange={e => setData({ ...data, toAddress: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Line Items & Taxes */}
          {activeTab === 'items' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Invoice Items ({data.items.length})</span>
                <button
                  onClick={addItem}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {data.items.map((item, idx) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">Item #{idx + 1}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Item or Service Description"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-0.5">Quantity / Hrs</label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-0.5">Rate ({data.currency})</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.rate}
                        onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    Total: <span className="text-white font-bold">{data.currency}{(item.quantity * item.rate).toLocaleString()}</span>
                  </div>
                </div>
              ))}

              {/* Tax & Discount Inputs */}
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block">Taxes & Discounts</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.25"
                      value={data.taxRate}
                      onChange={e => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={data.discount}
                      onChange={e => setData({ ...data, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Terms & Payment */}
          {activeTab === 'payment' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Payment Instructions & Wire / PayPal Details</label>
                <textarea
                  rows={4}
                  value={data.paymentDetails}
                  onChange={e => setData({ ...data, paymentDetails: e.target.value })}
                  placeholder="Bank name, routing, account number, or payment link..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white leading-relaxed resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes & Terms of Service</label>
                <textarea
                  rows={3}
                  value={data.notes}
                  onChange={e => setData({ ...data, notes: e.target.value })}
                  placeholder="e.g. Net 14 days. 1.5% late fee applies to overdue balances..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white leading-relaxed resize-none text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Live Printable Invoice Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/40 p-4 sm:p-8 rounded-2xl border border-slate-800 flex justify-center overflow-x-auto">
          <div
            id="printable-invoice"
            className="w-full max-w-[750px] bg-white text-slate-900 p-8 sm:p-12 rounded-sm shadow-2xl transition-all select-text font-sans"
            style={{
              minHeight: '920px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.1)'
            }}
          >
            {/* Header: Brand & Invoice Meta */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-8 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                  Invoice
                </h1>
                <p className="font-mono text-xs text-slate-500 font-semibold mt-1">
                  #{data.invoiceNumber}
                </p>
              </div>

              <div className="text-right text-xs space-y-1">
                <h3 className="font-bold text-slate-950 text-sm">{data.fromName || 'Your Business'}</h3>
                {data.fromEmail && <p className="text-slate-600">{data.fromEmail}</p>}
                {data.fromAddress && (
                  <p className="text-slate-500 whitespace-pre-line leading-relaxed">{data.fromAddress}</p>
                )}
              </div>
            </div>

            {/* Bill To & Dates Bar */}
            <div className="grid grid-cols-2 gap-6 text-xs mb-8">
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Billed To:
                </span>
                <p className="font-bold text-slate-950 text-sm">{data.toName || 'Client Name'}</p>
                {data.toEmail && <p className="text-slate-600">{data.toEmail}</p>}
                {data.toAddress && (
                  <p className="text-slate-500 whitespace-pre-line leading-relaxed">{data.toAddress}</p>
                )}
              </div>

              <div className="text-right space-y-1 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Issue Date</span>
                  <span className="font-semibold text-slate-900">{data.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Payment Due</span>
                  <span className="font-bold text-emerald-700">{data.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8 overflow-hidden rounded border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {data.currency}{item.rate.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">
                        {data.currency}{(item.quantity * item.rate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">{data.currency}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {data.discount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 border-b border-slate-100">
                    <span>Discount ({data.discount}%):</span>
                    <span>-{data.currency}{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {data.taxRate > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Tax ({data.taxRate}%):</span>
                    <span className="font-semibold text-slate-900">+{data.currency}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 text-sm font-bold text-slate-950 border-t-2 border-slate-950">
                  <span>Total Due:</span>
                  <span>{data.currency}{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Payment Details & Notes Footer */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
              {data.paymentDetails && (
                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Payment Instructions:
                  </span>
                  <p className="text-slate-600 whitespace-pre-line font-mono leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 text-[11px]">
                    {data.paymentDetails}
                  </p>
                </div>
              )}

              {data.notes && (
                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Notes:
                  </span>
                  <p className="text-slate-600 leading-relaxed italic">
                    {data.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print CSS Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
