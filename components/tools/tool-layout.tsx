'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Zap, 
  Lock, 
  Layers, 
  ArrowRight,
  CheckCircle2,
  Share2,
  Bookmark
} from 'lucide-react';
import { ToolDefinition, TOOLS_DATA } from '@/lib/tools-data';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import toast from 'react-hot-toast';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Structured Data (JSON-LD)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${tool.title}`,
    description: tool.tagline,
    totalTime: 'PT1M',
    step: tool.howToSteps.map((step) => ({
      '@type': 'HowToStep',
      position: step.step,
      name: step.title,
      text: step.description,
    })),
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    url: `https://www.shahananwar.tech/tools/${tool.slug}`,
    operatingSystem: 'All',
    applicationCategory: 'UtilitiesApplication',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: tool.metaDescription,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.shahananwar.tech',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://www.shahananwar.tech/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.categoryName,
        item: 'https://www.shahananwar.tech/tools',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tool.shortTitle,
        item: `https://www.shahananwar.tech/tools/${tool.slug}`,
      },
    ],
  };

  const relatedTools = tool.relatedSlugs
    .map((slug) => TOOLS_DATA[slug])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* Schema Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Subtle Background Glows */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-rose-600/10 via-violet-600/10 to-blue-600/10 blur-[130px] rounded-full" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/tools" className="hover:text-white transition-colors">
              Tools
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-500">{tool.categoryName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-rose-400 font-medium">{tool.shortTitle}</span>
          </nav>

          {/* Tool Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-rose-300 mb-4 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{tool.categoryName}</span>
              {tool.badge && (
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                  {tool.badge}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              {tool.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
              {tool.tagline}
            </p>

            {/* Privacy & Speed Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% In-Browser Privacy</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/60 text-blue-300">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant Processing</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/60 text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>No Upload to Servers</span>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Share this tool"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Interactive Tool Container */}
          <section aria-label="Tool Workspace" className="mb-16">
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-rose-500/20 via-transparent to-blue-500/20 -z-10 blur-sm pointer-events-none" />
              {children}
            </div>
          </section>

          {/* How-To Steps Section (Rich Snippet SEO) */}
          <section aria-labelledby="how-to-heading" className="mb-16">
            <div className="text-center mb-8">
              <h2 id="how-to-heading" className="text-2xl sm:text-3xl font-bold text-white mb-2">
                How to Use {tool.shortTitle}
              </h2>
              <p className="text-sm text-slate-400">
                Fast, effortless, and private in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tool.howToSteps.map((step) => (
                <div
                  key={step.step}
                  className="relative rounded-xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col hover:border-slate-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-bold text-white mb-4 shadow-lg group-hover:scale-105 transition-transform">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Features Grid */}
          <section aria-labelledby="features-heading" className="mb-16">
            <div className="text-center mb-8">
              <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Why Choose Our {tool.shortTitle}?
              </h2>
              <p className="text-sm text-slate-400">
                Built for creators, developers, and daily productivity
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tool.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-6 flex items-start gap-4 hover:border-rose-500/40 transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Frequently Asked Questions (FAQ Accordion) */}
          <section aria-labelledby="faq-heading" className="mb-16 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-400">
                Everything you need to know about {tool.shortTitle}
              </p>
            </div>

            <div className="space-y-3">
              {tool.faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-medium text-white hover:text-rose-300 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-rose-400' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-800/80 px-5 py-4 text-sm text-slate-300 leading-relaxed bg-slate-950/40"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Related Tools Internal Linking Grid */}
          {relatedTools.length > 0 && (
            <section aria-labelledby="related-heading" className="pt-8 border-t border-slate-900">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 id="related-heading" className="text-xl sm:text-2xl font-bold text-white">
                    Related Tools
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Explore more free online utilities
                  </p>
                </div>
                <Link
                  href="/tools"
                  className="text-xs sm:text-sm text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1 group"
                >
                  <span>View all tools</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedTools.map((relTool) => (
                  <Link
                    key={relTool.slug}
                    href={`/tools/${relTool.slug}`}
                    className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 hover:border-rose-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-rose-400 mb-1">
                        {relTool.categoryName}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors mb-1">
                        {relTool.shortTitle}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {relTool.tagline}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-rose-300">
                      <span>Use Tool</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
