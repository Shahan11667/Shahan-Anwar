"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Link as LinkIcon, Loader2, Play } from 'lucide-react'
import { FaYoutube, FaFacebook } from 'react-icons/fa'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

interface CobaltResponse {
  status: 'error' | 'redirect' | 'stream' | 'success' | 'rate-limit' | 'picker'
  url?: string
  text?: string
  picker?: Array<{
    type: 'video' | 'audio' | 'photo' | 'gif'
    url: string
    text: string
  }>
}

interface VideoInfo {
  title: string
  url: string
  status: string
  picker?: CobaltResponse['picker']
}

export default function VideoDownloaderClient() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setError(null)
    setVideoInfo(null)

    try {
      const response = await fetch('/api/download/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.text || `Server error (${response.status})`)
      }

      const data: CobaltResponse = await response.json()

      if (data.status === 'stream' || data.status === 'redirect') {
        setVideoInfo({ title: data.text || 'Ready to download', url: data.url!, status: data.status })
      } else if (data.status === 'picker') {
        setVideoInfo({ title: 'Multiple files found. Please select one.', url: '', status: 'picker', picker: data.picker })
      } else {
        setError(data.text || 'The extraction engine could not process this link. It may be restricted or private.')
      }
    } catch (err: any) {
      setError(err.message || 'Could not connect to the download service. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Free Online Video <span className="text-primary">Downloader</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Download videos from YouTube, Facebook, Instagram, and 1000+ sites for free in HD quality.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            No software installation needed. Paste the video URL and download instantly.
          </p>

          <form onSubmit={handleFetchInfo} className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Paste video URL (YouTube, Facebook, Instagram...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 text-lg"
                aria-label="Video URL"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="h-12 px-8">
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Download className="h-5 w-5 mr-2" />}
              Fetch Video
            </Button>
          </form>

          <div className="flex justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <FaYoutube className="h-5 w-5" />
              <span>YouTube</span>
            </div>
            <div className="flex items-center gap-2">
              <FaFacebook className="h-5 w-5" />
              <span>Facebook</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <span>& 1000+ More</span>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center mb-8"
          >
            {error}
          </motion.div>
        )}

        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="overflow-hidden border-2 border-primary/20 p-6">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Play className="h-10 w-10 text-primary" />
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{videoInfo.title}</h2>
                  <p className="text-muted-foreground mb-6">
                    Your download link is ready! Click the button below to start the transfer.
                  </p>

                  {videoInfo.status !== 'picker' ? (
                    <Button size="lg" className="w-full sm:w-auto px-12" asChild>
                      <a
                        href={`/api/download/stream?url=${encodeURIComponent(videoInfo.url)}&filename=${encodeURIComponent(videoInfo.title)}.mp4`}
                        download
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download Now
                      </a>
                    </Button>
                  ) : (
                    <div className="grid gap-3 w-full">
                      {videoInfo.picker?.map((item, idx) => (
                        <Button key={idx} variant="outline" className="w-full justify-between" asChild>
                          <a
                            href={`/api/download/stream?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(item.text || 'video')}.mp4`}
                            download
                          >
                            <span className="flex items-center">
                              <Play className="h-4 w-4 mr-2" />
                              {item.text || `${item.type} ${idx + 1}`}
                            </span>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto mt-16 text-left">
          <h2 className="text-2xl font-bold mb-4 text-center">Supported Video Platforms</h2>
          <p className="text-muted-foreground text-center mb-8">
            Our free video downloader supports YouTube, Facebook, Instagram, Twitter/X, TikTok, Vimeo, Dailymotion, and hundreds more platforms.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-center">How to Download a Video Online</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { step: '1', title: 'Copy the Video URL', desc: 'Go to YouTube, Facebook, or Instagram and copy the URL from your browser address bar.' },
              { step: '2', title: 'Paste the URL', desc: 'Paste the copied video link into the input field above and click "Fetch Video".' },
              { step: '3', title: 'Download in HD', desc: 'Click "Download Now" to save the video in high definition quality to your device.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-xl border p-5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">
                  {step}
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this video downloader completely free?', a: 'Yes, this online video downloader is 100% free. No registration, no subscription, and no software installation needed.' },
              { q: 'Can I download YouTube videos in HD quality?', a: 'Yes, you can download YouTube videos in HD quality. Paste the YouTube video URL and click Download Now to save it in high resolution.' },
              { q: 'Which video platforms are supported?', a: 'We support YouTube, Facebook, Instagram, Twitter/X, TikTok, Vimeo, Dailymotion, and 1000+ other video websites.' },
              { q: 'Is it safe to use this video downloader?', a: 'Yes, completely safe. We do not store your videos and the download is processed directly between you and the video platform.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="rounded-xl border p-5">
                <h3 className="font-semibold mb-1">{q}</h3>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
