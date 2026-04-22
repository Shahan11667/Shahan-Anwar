"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Link as LinkIcon, Loader2, Play, Clock, User } from 'lucide-react'
import { FaYoutube, FaFacebook } from 'react-icons/fa'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

interface VideoFormat {
  formatId: string
  extension: string
  resolution: string
  filesize: number
  url: string
}

interface VideoInfo {
  title: string
  thumbnail: string
  duration: number
  uploader: string
  formats: VideoFormat[]
}

const VideoDownloader = () => {
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
      const response = await fetch(`/api/download/info?url=${encodeURIComponent(url)}`)
      const data = await response.json()

      if (data.success) {
        setVideoInfo(data)
      } else {
        setError(data.error || 'Failed to fetch video information')
      }
    } catch (err) {
      setError('An error occurred while fetching video info')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
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
            Video <span className="text-primary">Downloader</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Download your favorite videos from YouTube, Facebook, and more using yt-dlp.
          </p>

          <form onSubmit={handleFetchInfo} className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Paste video URL (YouTube, Facebook, etc.)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 text-lg"
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
              <span>& More</span>
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
            <Card className="overflow-hidden border-2 border-primary/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative aspect-video">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl mb-4 line-clamp-2">{videoInfo.title}</CardTitle>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span>{videoInfo.uploader}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatDuration(videoInfo.duration)}</span>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="font-semibold text-lg">Available Formats</h3>
                    {videoInfo.formats.length === 0 ? (
                      <p className="text-muted-foreground italic text-sm">No direct downloads found for this video.</p>
                    ) : (
                      videoInfo.formats.map((format, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-all group"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-sm block">
                              {format.resolution} ({format.extension})
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatSize(format.filesize)}
                            </span>
                          </div>
                          <Button size="sm" asChild>
                            <a 
                              href={`/api/download/stream?url=${encodeURIComponent(url)}&format=${format.formatId}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardHeader>
              </div>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default VideoDownloader
