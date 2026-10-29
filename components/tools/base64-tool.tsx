'use client';

import React, { useState } from 'react';
import { 
  Binary, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRightLeft, 
  Upload, 
  FileText 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode' | 'file'>('encode');
  const [inputVal, setInputVal] = useState<string>('');
  const [outputVal, setOutputVal] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // UTF-8 safe Base64 encoding
  const utf8ToBase64 = (str: string) => {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  };

  // UTF-8 safe Base64 decoding
  const base64ToUtf8 = (str: string) => {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str.trim()), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  };

  const handleProcess = () => {
    if (!inputVal.trim()) {
      setOutputVal('');
      return;
    }
    try {
      if (mode === 'encode') {
        setOutputVal(utf8ToBase64(inputVal));
        toast.success('Encoded to Base64');
      } else if (mode === 'decode') {
        setOutputVal(base64ToUtf8(inputVal));
        toast.success('Decoded from Base64');
      }
    } catch {
      toast.error('Invalid Base64 string for decoding');
      setOutputVal('Error: The input is not a valid Base64 encoded string.');
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setOutputVal(reader.result);
        toast.success(`Converted ${file.name} to Base64 Data URL!`);
      }
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!outputVal) return;
    navigator.clipboard.writeText(outputVal);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => {
            setMode('encode');
            setOutputVal('');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'encode'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Encode Text
        </button>
        <button
          onClick={() => {
            setMode('decode');
            setOutputVal('');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'decode'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Decode Text
        </button>
        <button
          onClick={() => {
            setMode('file');
            setOutputVal('');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'file'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          File to Base64
        </button>
      </div>

      {mode !== 'file' ? (
        <div className="space-y-4">
          {/* Input Box */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
              </span>
              <button
                onClick={() => {
                  setInputVal('');
                  setOutputVal('');
                }}
                className="text-slate-500 hover:text-rose-400"
              >
                Clear
              </button>
            </div>
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? 'Type or paste the text you want to encode...'
                  : 'Paste Base64 string to decode...'
              }
              rows={5}
              className="w-full bg-slate-950 p-4 text-white text-sm font-mono focus:outline-none resize-y"
            />
          </div>

          {/* Action Trigger */}
          <div className="text-center">
            <button
              onClick={handleProcess}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{mode === 'encode' ? 'Encode to Base64' : 'Decode to Text'}</span>
            </button>
          </div>

          {/* Output Box */}
          {outputVal && (
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-semibold">
                  {mode === 'encode' ? 'Base64 Output' : 'Decoded Plain Text'}
                </span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-white hover:text-cyan-300 font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <textarea
                value={outputVal}
                readOnly
                rows={5}
                className="w-full bg-slate-950/70 p-4 text-slate-200 text-sm font-mono focus:outline-none resize-y"
              />
            </div>
          )}
        </div>
      ) : (
        /* File to Base64 mode */
        <div className="space-y-4">
          <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/50 rounded-xl p-8 block text-center cursor-pointer transition-colors">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Select any file to generate Base64 Data URL
            </h4>
            <p className="text-xs text-slate-400">
              Images, SVGs, audio clips, small PDFs
            </p>
          </label>

          {outputVal && (
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-semibold">Base64 Data URL</span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-white hover:text-cyan-300 font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Data URL'}</span>
                </button>
              </div>
              <textarea
                value={outputVal}
                readOnly
                rows={6}
                className="w-full bg-slate-950 p-4 text-xs font-mono text-cyan-300 focus:outline-none resize-y"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
