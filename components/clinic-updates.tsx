"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, Heart, Calendar, Sparkles, Globe } from 'lucide-react'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6'

interface SocialPostItem {
  _id: string
  caption: string
  mediaUrl?: string
  targetPlatforms: string[]
  createdAt: string
  analytics?: {
    likes: number
    shares: number
    clicks: number
    reach: number
  }
}

export default function ClinicUpdates({ initialData }: { initialData?: SocialPostItem[] }) {
  const [posts, setPosts] = useState<SocialPostItem[]>(initialData || [])

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setPosts(initialData)
    }
  }, [initialData])

  const defaultUpdates: SocialPostItem[] = [
    {
      _id: "demo-1",
      caption: "5 essential tips for pediatric respiratory wellness during seasonal transitions. Always maintain proper hydration and consult your pediatrician early!",
      mediaUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
      targetPlatforms: ["facebook", "instagram"],
      createdAt: new Date().toISOString(),
      analytics: { likes: 18, shares: 4, clicks: 32, reach: 240 }
    },
    {
      _id: "demo-2",
      caption: "Our outpatient clinic is expanding evening consultation hours to better serve working parents and busy families.",
      mediaUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
      targetPlatforms: ["facebook", "portfolio"],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      analytics: { likes: 24, shares: 6, clicks: 45, reach: 310 }
    },
    {
      _id: "demo-3",
      caption: "Understanding annual blood panels: regular preventive screening is the cornerstone of long-term cardiovascular health.",
      mediaUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=400&fit=crop",
      targetPlatforms: ["instagram", "linkedin"],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      analytics: { likes: 31, shares: 8, clicks: 58, reach: 420 }
    }
  ]

  const items = posts.length > 0 ? posts : defaultUpdates

  return (
    <section id="updates" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#d97745]" />
            <span>COMMUNITY & CLINIC UPDATES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
            Latest Health Tips & <span className="text-[#d97745]">Clinic Broadcasts</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0a382c]/90 font-medium">
            Stay informed with clinical health advice, medical tips, and community news posted directly from our healthcare team.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((post, idx) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full"
            >
              <div>
                {/* Photo Attachment with increased height to show full picture without cropping */}
                {post.mediaUrl && (
                  <div className="relative w-full h-[460px] sm:h-[520px] overflow-hidden bg-slate-100/90 flex items-center justify-center border-b border-slate-100">
                    {/* Ambient backdrop to seamlessly frame vertical posters */}
                    <img
                      src={post.mediaUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-25 scale-110 pointer-events-none"
                    />
                    {/* Full uncropped image */}
                    <img
                      src={post.mediaUrl}
                      alt={post.caption || "Clinic Update"}
                      className="relative z-10 w-full h-full object-contain p-1.5 group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Content body */}
                <div className="p-5 sm:p-6 space-y-3">
                  {/* Platform badges & date */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.targetPlatforms && post.targetPlatforms.filter(p => p !== 'portfolio').length > 0 ? (
                        post.targetPlatforms.filter(p => p !== 'portfolio').map((plat) => {
                          const p = plat.toLowerCase()
                          if (p === 'facebook') {
                            return (
                              <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                <FaFacebook className="w-3 h-3 text-[#1877F2]" /> Facebook
                              </span>
                            )
                          }
                          if (p === 'instagram') {
                            return (
                              <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-semibold">
                                <FaInstagram className="w-3 h-3 text-[#E4405F]" /> Instagram
                              </span>
                            )
                          }
                          if (p === 'linkedin') {
                            return (
                              <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-semibold">
                                <FaLinkedin className="w-3 h-3 text-[#0A66C2]" /> LinkedIn
                              </span>
                            )
                          }
                          return null
                        })
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0a382c]/10 text-[#0a382c] text-[10px] font-semibold">
                          <Globe className="w-3 h-3 text-[#d97745]" /> Clinic Broadcast
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-[#0a382c]" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className="text-sm text-slate-800 font-medium leading-relaxed line-clamp-3">
                    {post.caption}
                  </p>
                </div>
              </div>

              {/* Engagement Footer */}
              <div className="px-5 sm:px-6 py-3.5 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50 mt-auto">
                <div className="flex items-center gap-3.5">
                  <span className="flex items-center gap-1 text-slate-600 font-medium text-xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {post.analytics?.likes ?? 0}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-medium text-xs">
                    <Share2 className="w-3.5 h-3.5 text-slate-500" /> {post.analytics?.shares ?? 0}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#0a382c] bg-[#0a382c]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Verified Update
                </span>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  )
}
