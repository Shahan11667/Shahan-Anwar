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
      // Call our internal Next.js Middleman API
      // This fixes CORS errors and allows the server to retry different engines
      const response = await fetch('/api/download/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.text || `Server error (${response.status})`);
      }

      const data: CobaltResponse = await response.json()

      if (data.status === 'stream' || data.status === 'redirect') {
        setVideoInfo({
          title: data.text || 'Ready to download',
          url: data.url!,
          status: data.status
        })
      } else if (data.status === 'picker') {
        setVideoInfo({
          title: 'Multiple files found. Please select one.',
          url: '',
          status: 'picker',
          picker: data.picker
        })
      } else {
        setError(data.text || 'The extraction engine could not process this link. It may be restricted or private.')
      }
    } catch (err: any) {
      console.error('Download error:', err)
      setError(err.message || 'Could not connect to the download service. Please try again later.')
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
      </main>

      <Footer />
    </div>
  )
}

export default VideoDownloader
