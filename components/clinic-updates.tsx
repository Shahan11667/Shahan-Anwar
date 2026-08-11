"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, Heart, MessageCircle, Calendar, Sparkles, Globe } from 'lucide-react'

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

export default function ClinicUpdates() {
  const [posts, setPosts] = useState<SocialPostItem[]>([])

  useEffect(() => {
    fetch('/api/buffer/posts?portfolioOnly=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data)
        }
      })
      .catch((err) => console.error('Error fetching portfolio updates:', err))
  }, [])

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
            <Sparkles className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((post, idx) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Photo Attachment */}
                {post.mediaUrl && (
                  <div className="aspect-video w-full overflow-hidden relative bg-slate-200">
                    <img
                      src={post.mediaUrl}
                      alt="Clinic Update"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-6 space-y-3">
                  {/* Platform badges & date */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#d97745]" />
                      <span className="font-semibold text-[#0a382c] uppercase tracking-wider text-[10px]">
                        Clinic Post
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-[#0a382c]" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              </div>

              {/* Engagement Footer */}
              <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-red-500 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-red-500" /> {post.analytics?.likes || 12}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-semibold">
                    <Share2 className="w-3.5 h-3.5 text-[#0a382c]" /> {post.analytics?.shares || 3}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#0a382c] uppercase tracking-wider">
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
