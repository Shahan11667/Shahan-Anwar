'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Lock, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Image as ImageIcon, 
  ScanText, 
  Mic, 
  Type, 
  Code2, 
  Video,
  FileImage,
  FileSpreadsheet,
  Layers,
  Split,
  Minimize2,
  Scaling,
  RefreshCw,
  CaseSensitive,
  Binary
} from 'lucide-react';
import { ALL_TOOLS_LIST, CATEGORIES } from '@/lib/tools-data';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Icon resolver helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'FileText':
      return <FileText className="w-4 h-4" />;
    case 'Image':
      return <ImageIcon className="w-4 h-4" />;
    case 'ScanText':
      return <ScanText className="w-4 h-4" />;
    case 'Mic':
      return <Mic className="w-4 h-4" />;
    case 'Type':
      return <Type className="w-4 h-4" />;
    case 'Code2':
      return <Code2 className="w-4 h-4" />;
    case 'Video':
      return <Video className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const getToolIcon = (slug: string) => {
  switch (slug) {
    case 'jpg-to-pdf':
      return <FileImage className="w-5 h-5 text-rose-400" />;
    case 'pdf-to-jpg':
      return <FileSpreadsheet className="w-5 h-5 text-amber-400" />;
    case 'merge-pdf':
      return <Layers className="w-5 h-5 text-violet-400" />;
    case 'split-pdf':
      return <Split className="w-5 h-5 text-blue-400" />;
    case 'image-compressor':
      return <Minimize2 className="w-5 h-5 text-emerald-400" />;
    case 'image-resizer':
      return <Scaling className="w-5 h-5 text-cyan-400" />;
    case 'jpg-to-png':
      return <RefreshCw className="w-5 h-5 text-pink-400" />;
    case 'word-counter':
      return <Type className="w-5 h-5 text-blue-400" />;
    case 'case-converter':
      return <CaseSensitive className="w-5 h-5 text-purple-400" />;
    case 'json-formatter':
      return <Code2 className="w-5 h-5 text-emerald-400" />;
    case 'base64-tool':
      return <Binary className="w-5 h-5 text-cyan-400" />;
    case 'image-to-text':
      return <ScanText className="w-5 h-5 text-indigo-400" />;
    case 'pdf-to-text':
      return <FileText className="w-5 h-5 text-teal-400" />;
    case 'voice-message-to-text':
      return <Mic className="w-5 h-5 text-red-400" />;
    default:
      return <Sparkles className="w-5 h-5 text-rose-400" />;
  }
};

export default function ToolsHubView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Video tools entries
  const allTools = useMemo(() => {
    const list = [...ALL_TOOLS_LIST];
    // Add existing video tools into the catalogue
    list.push({
      id: 'video-downloader',
      slug: 'video-downloader',
      title: 'Universal Video Downloader',
      shortTitle: 'Video Downloader',
      tagline: 'Download videos from YouTube, Facebook, and Instagram in HD quality with direct media extraction.',
      category: 'video',
      categoryName: 'Video Tools',
      icon: 'Video',
      badge: 'Popular',
      gradient: 'from-red-600 to-rose-600',
      metaTitle: 'Free Online Video Downloader',
      metaDescription: 'Download videos from popular platforms in HD.',
      keywords: ['video downloader', 'download youtube video'],
      features: [],
      howToSteps: [],
      faqs: [],
      relatedSlugs: ['video-editor'],
    });

    list.push({
      id: 'video-editor',
      slug: 'video-editor',
      title: 'Online Video Converter & Trimmer',
      shortTitle: 'Video Editor',
      tagline: 'Convert, compress, and trim MP4, WebM, and MOV video clips directly in your browser.',
      category: 'video',
      categoryName: 'Video Tools',
      icon: 'Video',
      badge: 'Pro',
      gradient: 'from-purple-600 to-indigo-600',
      metaTitle: 'Free Video Converter & Editor Online',
      metaDescription: 'Convert and trim video clips online.',
      keywords: ['video converter', 'trim video online'],
      features: [],
      howToSteps: [],
      faqs: [],
      relatedSlugs: ['video-downloader'],
    });

    return list;
  }, []);

  const filteredTools = useMemo(() => {
    return allTools.filter((tool) => {
      const matchesCategory =
        activeCategory === 'all' || tool.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.keywords.some((kw) => kw.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allTools, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Subtle Background Lighting */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-rose-600/10 via-violet-600/10 to-blue-600/10 blur-[140px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-rose-300 mb-4 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Free In-Browser Utilities</span>
              <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full text-[10px] border border-rose-500/30">
                Zero Cloud Storage
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
              All-In-One Free Online Tools
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
              Instant, privacy-first productivity utilities for everyday tasks: PDF conversion, image compression, AI OCR, voice message transcription, and developer tools.
            </p>

            {/* Privacy Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% In-Browser Privacy</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/60 text-blue-300">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero File Upload to Servers</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/60 text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>No Accounts or Paywalls</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xl sm:text-2xl font-black text-rose-400">16+</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Free Utilities</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">0 MB</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Server Storage</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xl sm:text-2xl font-black text-blue-400">100%</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Private in Browser</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xl sm:text-2xl font-black text-amber-400">$0</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Free Forever</div>
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. JPG to PDF, Compress Image, OCR, JSON)..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white text-sm sm:text-base placeholder-slate-500 shadow-2xl focus:outline-none focus:border-rose-500/70 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start sm:justify-center">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                      : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tools Grid */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-base">
                No tools match &quot;{searchQuery}&quot;. Try a different search term or select another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                const targetHref =
                  tool.slug === 'video-downloader'
                    ? '/video-downloader'
                    : tool.slug === 'video-editor'
                    ? '/video-editor'
                    : `/tools/${tool.slug}`;

                return (
                  <Link
                    key={tool.id}
                    href={targetHref}
                    className="group relative rounded-2xl bg-slate-900/70 border border-slate-800/90 p-6 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl"
                  >
                    {/* Top gradient glow on hover */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                          {getToolIcon(tool.slug)}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {tool.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                              {tool.badge}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-500">
                            {tool.categoryName}
                          </span>
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <h2 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors mb-2">
                        {tool.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {tool.tagline}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-rose-400 transition-colors">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-rose-400" />
                        <span>Instant & Free</span>
                      </span>
                      <div className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
