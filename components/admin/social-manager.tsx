"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import ImageUpload from '@/components/ui/image-upload'
import {
  Share2,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  TrendingUp,
  Globe,
  Sparkles,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6'

interface BufferProfile {
  id: string
  service: string
  service_username?: string
  formatted_username?: string
  avatar_icon?: string
}

interface SocialPostItem {
  _id: string
  caption: string
  mediaUrl?: string
  targetPlatforms: string[]
  profileIds: string[]
  status: 'draft' | 'queued' | 'published' | 'failed'
  scheduledFor?: string
  showOnPortfolio: boolean
  analytics?: {
    likes: number
    shares: number
    clicks: number
    reach: number
  }
  createdAt: string
}

export default function SocialManager() {
  const [profiles, setProfiles] = useState<BufferProfile[]>([])
  const [posts, setPosts] = useState<SocialPostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false)
  const { toast } = useToast()

  // Form State
  const [caption, setCaption] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [showOnPortfolio, setShowOnPortfolio] = useState(true)
  const [publishNow, setPublishNow] = useState(true)
  const [scheduledDate, setScheduledDate] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [profilesRes, postsRes] = await Promise.all([
        fetch('/api/buffer/profiles'),
        fetch('/api/buffer/posts')
      ])

      if (profilesRes.ok) {
        const profData = await profilesRes.json()
        if (Array.isArray(profData)) {
          setProfiles(profData)
          // Default select all connected profiles
          setSelectedProfiles(profData.map((p: any) => p.id))
        }
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        if (Array.isArray(postsData)) {
          setPosts(postsData)
        }
      }
    } catch (error) {
      console.error('Error loading social manager data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProfile = (id: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caption.trim()) {
      toast({ title: "Caption Required", description: "Please enter post caption text.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const platforms = profiles
        .filter((p) => selectedProfiles.includes(p.id))
        .map((p) => p.service)

      if (showOnPortfolio) {
        platforms.push('portfolio')
      }

      const payload = {
        caption,
        mediaUrl,
        targetPlatforms: platforms,
        profileIds: selectedProfiles,
        scheduledFor: publishNow ? null : scheduledDate,
        showOnPortfolio,
        publishNow
      }

      const res = await fetch('/api/buffer/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const warnings = data.warnings || []
        if (warnings.length > 0) {
          const failedDetails = warnings.map((w: any) => `${w.channelName}: ${w.error}`).join('; ')
          toast({
            title: "Partial Success with Warnings",
            description: `Published to some channels, but failed on: ${failedDetails}`,
            variant: "destructive"
          })
        } else {
          toast({
            title: publishNow ? "Post Dispatched & Published!" : "Post Scheduled!",
            description: publishNow
              ? "Your update was sent to Buffer and published across all selected channels."
              : `Scheduled for ${scheduledDate}.`
          })
        }

        // Reset Form
        setCaption('')
        setMediaUrl('')
        fetchInitialData()
      } else {
        const errorMsg = data.error || (data.warnings && data.warnings.map((w: any) => `${w.channelName}: ${w.error}`).join('; ')) || 'Failed to dispatch post'
        toast({
          title: "Posting Failed",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Posting Error",
        description: error.message || "Failed to dispatch post to Buffer API.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this social post record?")) return
    try {
      const res = await fetch(`/api/buffer/posts?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Post Record Deleted" })
        fetchInitialData()
      }
    } catch (error) {
      toast({ title: "Error deleting post", variant: "destructive" })
    }
  }

  const handleRefreshAnalytics = async () => {
    setIsRefreshingMetrics(true)
    try {
      const res = await fetch('/api/buffer/analytics')
      if (res.ok) {
        toast({ title: "Analytics Updated", description: "Engagement metrics refreshed." })
        fetchInitialData()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsRefreshingMetrics(false)
    }
  }

  const getChannelIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'instagram':
        return <FaInstagram className="w-4 h-4 text-pink-500" />
      case 'linkedin':
        return <FaLinkedin className="w-4 h-4 text-sky-600" />
      default:
        return <FaFacebook className="w-4 h-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Buffer Connection Status Banner */}
      <Card className="bg-gradient-to-r from-[#0a382c] to-[#072b22] text-white border-none shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#d97745] text-xs font-semibold uppercase tracking-wider">
                <Share2 className="w-3.5 h-3.5" />
                <span>Buffer API Connected</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#faf7f2]">
                Social Media Command Center
              </h3>
              <p className="text-xs text-[#faf7f2]/80 font-light">
                Draft once and dispatch instantly to Facebook, Instagram, LinkedIn, and your Portfolio Website feed.
              </p>
            </div>

            {/* Connected Channels List */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#faf7f2]/70 font-medium">Connected Channels:</span>
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-white shadow-sm"
                >
                  {getChannelIcon(p.service)}
                  <span>{p.formatted_username || p.service_username || p.service}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Post Creator + Recent Posts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Post Creator Form */}
        <div className="lg:col-span-6">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-lg">
            <CardHeader className="bg-slate-50 dark:bg-[#071d17] border-b pb-4">
              <CardTitle className="text-lg font-serif text-[#0a382c] dark:text-[#faf7f2] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d97745]" />
                Create & Broadcast Post
              </CardTitle>
              <CardDescription className="text-xs">
                Write a caption, attach photo graphics, select target social platforms, and post.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Caption Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Post Caption & Text *
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {caption.length} chars
                    </span>
                  </div>
                  <Textarea
                    required
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. 5 essential health tips for maintaining strong cardiovascular wellness this season! #HealthTips #DoctorAdvice"
                    className="text-xs rounded-xl focus-visible:ring-[#0a382c]"
                  />
                </div>

                {/* Cloudinary Image Attachment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Image / Poster Attachment (Cloudinary URL)
                  </label>
                  <ImageUpload
                    value={mediaUrl}
                    onChange={(url) => setMediaUrl(url)}
                    placeholder="Upload or paste image graphic URL"
                  />
                </div>

                {/* Target Platforms Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Target Social Channels
                  </label>
                  <div className="space-y-2">
                    {profiles.map((p) => {
                      const isChecked = selectedProfiles.includes(p.id)
                      return (
                        <label
                          key={p.id}
                          onClick={() => handleToggleProfile(p.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#0a382c]/10 border-[#0a382c] dark:bg-[#072b22]'
                              : 'bg-white dark:bg-[#0d2820] border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {getChannelIcon(p.service)}
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                              {p.formatted_username || p.service_username || p.service}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 accent-[#0a382c]"
                          />
                        </label>
                      )
                    })}

                    {/* Show on Portfolio Toggle */}
                    <label
                      onClick={() => setShowOnPortfolio(!showOnPortfolio)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        showOnPortfolio
                          ? 'bg-[#d97745]/10 border-[#d97745]'
                          : 'bg-white dark:bg-[#0d2820] border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-[#d97745]" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          Show on Portfolio Website Feed ("Latest Clinic Updates")
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={showOnPortfolio}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#d97745]"
                      />
                    </label>
                  </div>
                </div>

                {/* Scheduling Options */}
                <div className="pt-2 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Publishing Schedule
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPublishNow(true)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          publishNow ? 'bg-[#0a382c] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Publish Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishNow(false)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          !publishNow ? 'bg-[#0a382c] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Schedule Date
                      </button>
                    </div>
                  </div>

                  {!publishNow && (
                    <div>
                      <Input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#d97745] hover:bg-[#c86030] text-white py-3 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md"
                  >
                    {isSubmitting ? (
                      "Dispatching to Buffer..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {publishNow ? "Publish Now to Selected Platforms" : "Schedule Social Post"}
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Social Posts History & Analytics */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-lg">
            <CardHeader className="bg-slate-50 dark:bg-[#071d17] border-b flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-serif text-[#0a382c] dark:text-[#faf7f2] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#d97745]" />
                  Broadcast History & Analytics ({posts.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Monitor past social posts, engagement metrics, and portfolio status.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isRefreshingMetrics}
                onClick={handleRefreshAnalytics}
                className="text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefreshingMetrics ? 'animate-spin' : ''}`} />
                Refresh Metrics
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Share2 className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">No social media posts sent yet. Create your first broadcast!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="p-4 rounded-2xl border bg-slate-50 dark:bg-[#0d2820] border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs text-slate-800 dark:text-slate-100 font-medium line-clamp-2">
                          {post.caption}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>

                      {post.mediaUrl && (
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-200 relative">
                          <img src={post.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Engagement Metrics Row */}
                      {post.analytics && (
                        <div className="grid grid-cols-4 gap-2 text-center p-2 rounded-xl bg-white dark:bg-[#071d17] border text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">Likes</span>
                            <span className="font-bold text-[#d97745]">{post.analytics.likes}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">Shares</span>
                            <span className="font-bold text-[#0a382c] dark:text-[#faf7f2]">{post.analytics.shares}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">Clicks</span>
                            <span className="font-bold text-sky-600">{post.analytics.clicks}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">Reach</span>
                            <span className="font-bold text-emerald-600">{post.analytics.reach}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePost(post._id)}
                          className="h-7 text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
