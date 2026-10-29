'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  FileImage, 
  Minimize2, 
  Code2, 
  ScanText, 
  Type, 
  Layers,
  Lock,
  Zap,
  ShieldCheck
} from 'lucide-react';

const TOP_TOOLS = [
  {
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF Converter',
    category: 'PDF Tools',
    description: 'Convert JPG, PNG, and WebP images into high-resolution PDF documents online for free. Custom margins and page reordering.',
    icon: FileImage,
    badge: 'Popular',
    color: 'from-rose-500 to-red-600',
  },
  {
    slug: 'image-compressor',
    title: 'Image Compressor',
    category: 'Image Tools',
    description: 'Reduce JPG, PNG, and WebP file sizes by up to 90% without visible quality loss. Real-time before and after preview.',
    icon: Minimize2,
    badge: 'Trending',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    slug: 'json-formatter',
    title: 'JSON Formatter & Validator',
    category: 'Developer Tools',
    description: 'Format, beautify, validate, and minify JSON data online with instant syntax error detection and 1-click clipboard copy.',
    icon: Code2,
    badge: 'Dev Favorite',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    slug: 'image-to-text',
    title: 'Image to Text (OCR)',
    category: 'OCR & Vision',
    description: 'Extract text from screenshots, scanned receipts, and document photos using in-browser AI optical character recognition.',
    icon: ScanText,
    badge: 'AI Powered',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    slug: 'word-counter',
    title: 'Word & Character Counter',
    category: 'Text Tools',
    description: 'Calculate words, characters, sentences, reading time, speaking time, and keyword density live as you type.',
    icon: Type,
    badge: 'Real-time',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    slug: 'merge-pdf',
    title: 'Merge PDF Online',
    category: 'PDF Tools',
    description: 'Combine multiple PDF documents into a single consolidated file in seconds. Drag to reorder pages with 100% privacy.',
    icon: Layers,
    badge: 'Zero Upload',
    color: 'from-violet-500 to-purple-600',
  },
];

export default function FeaturedTools() {
  return (
    <section id="tools" className="py-20 relative overflow-hidden bg-slate-950/60 border-t border-b border-slate-900">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-300 mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Productivity Utilities</span>
            <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full text-[10px] border border-rose-500/30">
              100% Client-Side
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Free Online Productivity Tools
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
            Instant utilities for everyday digital tasks. Files are processed locally on your device without ever being uploaded to a remote server.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% In-Browser Privacy</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/60 text-blue-300">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Conversion</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/60 text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>No Signups Required</span>
            </span>
          </div>
        </div>

        {/* Featured Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {TOP_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group relative rounded-2xl bg-slate-900/70 border border-slate-800 p-6 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-rose-400" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                        {tool.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors mb-2">
                    {tool.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-rose-400 transition-colors">
                  <span className="inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                    <span>Free & Private</span>
                  </span>
                  <div className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Use Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Tools CTA Button */}
        <div className="text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl hover:shadow-rose-500/25 transition-all group"
          >
            <span>Explore All 16+ Free Tools</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
