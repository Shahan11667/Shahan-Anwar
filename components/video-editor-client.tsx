'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Download, Loader2, Video, AlertCircle, Scissors, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function VideoEditorClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'convert' | 'trim'>('convert');
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();

        if (data.success) {
          setIsEnabled(data.data.videoEditorEnabled);
          if (!data.data.videoEditorEnabled) {
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSettings();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }

      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setConvertedUrl(null);
      setConvertedBlob(null);

      const url = URL.createObjectURL(selectedFile);
      setOriginalUrl(url);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 3000);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedBlob(blob);
      setConvertedUrl(url);
      setProgress(100);
    } catch (error: any) {
      setError(error.message || 'Failed to convert video');
    } finally {
      setConverting(false);
    }
  };

  const handleTrim = async () => {
    if (!file) return;

    setConverting(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 2000);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('startTime', startTime.toString());
      formData.append('endTime', endTime.toString());

      const response = await fetch('/api/video/trim', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Trim failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedBlob(blob);
      setConvertedUrl(url);
      setProgress(100);
    } catch (error: any) {
      setError(error.message || 'Failed to trim video');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8 pt-28">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
                  <Video className="w-8 h-8" />
                  Online Video Converter &amp; Trimmer
                </CardTitle>
                <p className="text-center text-blue-100 mt-2">
                  Convert to 9:16 for YouTube Shorts, Instagram Reels &amp; TikTok — or trim any video clip
                </p>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {!convertedUrl && file && (
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'convert' | 'trim')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="convert">
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Convert to 9:16
                      </TabsTrigger>
                      <TabsTrigger value="trim">
                        <Scissors className="w-4 h-4 mr-2" />
                        Trim / Cut Video
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}

                {!convertedUrl && (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {file ? file.name : 'Click to upload or drag and drop'}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">MP4, MOV, AVI (Max 500MB)</p>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {file && !converting && activeTab === 'trim' && originalUrl && (
                      <div className="space-y-6 max-w-3xl mx-auto">
                        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                          <video
                            ref={(ref) => {
                              setVideoRef(ref);
                              if (ref) {
                                ref.onloadedmetadata = () => {
                                  setVideoDuration(ref.duration);
                                  setEndTime(Math.min(60, ref.duration));
                                };
                                ref.ontimeupdate = () => setCurrentTime(ref.currentTime);
                              }
                            }}
                            src={originalUrl}
                            controls
                            className="w-full h-auto"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="relative">
                            <Label className="text-sm font-semibold mb-2 block">
                              Select Trim Range (Green = Keep, Gray = Remove)
                            </Label>
                            <div className="relative h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <div className="absolute top-0 left-0 h-full bg-gray-400 dark:bg-gray-600" style={{ width: `${(startTime / videoDuration) * 100}%` }} />
                              <div className="absolute top-0 h-full bg-green-500" style={{ left: `${(startTime / videoDuration) * 100}%`, width: `${((endTime - startTime) / videoDuration) * 100}%` }} />
                              <div className="absolute top-0 right-0 h-full bg-gray-400 dark:bg-gray-600" style={{ width: `${((videoDuration - endTime) / videoDuration) * 100}%` }} />
                              <div className="absolute top-0 h-full w-0.5 bg-red-500" style={{ left: `${(currentTime / videoDuration) * 100}%` }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startTime" className="flex items-center justify-between">
                                <span>Start Time</span>
                                <span className="text-xs text-gray-500">{startTime.toFixed(1)}s</span>
                              </Label>
                              <input
                                id="startTime"
                                type="range"
                                min="0"
                                max={videoDuration}
                                step="0.1"
                                value={startTime}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setStartTime(val);
                                  if (videoRef) videoRef.currentTime = val;
                                }}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endTime" className="flex items-center justify-between">
                                <span>End Time</span>
                                <span className="text-xs text-gray-500">{endTime.toFixed(1)}s</span>
                              </Label>
                              <input
                                id="endTime"
                                type="range"
                                min={startTime}
                                max={videoDuration}
                                step="0.1"
                                value={endTime}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setEndTime(val);
                                  if (videoRef) videoRef.currentTime = val;
                                }}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div>
                              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                Trim Duration: {(endTime - startTime).toFixed(1)}s
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                From {startTime.toFixed(1)}s to {endTime.toFixed(1)}s
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setStartTime(0); setEndTime(Math.min(60, videoDuration)); }}>
                                Reset
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { if (videoRef) setStartTime(videoRef.currentTime); }}>
                                Set Start Here
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { if (videoRef) setEndTime(videoRef.currentTime); }}>
                                Set End Here
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Button onClick={handleTrim} disabled={converting || endTime <= startTime} size="lg" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4">
                          <Scissors className="w-5 h-5 mr-2" />
                          Trim Video ({(endTime - startTime).toFixed(1)}s)
                        </Button>
                      </div>
                    )}

                    {file && !converting && activeTab === 'convert' && (
                      <div className="flex justify-center">
                        <Button onClick={handleConvert} disabled={converting} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
                          <Maximize2 className="w-5 h-5 mr-2" />
                          Convert to 9:16
                        </Button>
                      </div>
                    )}

                    {converting && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
                          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            Converting video... {progress}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {convertedUrl && originalUrl && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full">
                        <Video className="w-5 h-5" />
                        <span className="font-semibold">Conversion Complete!</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200">Original Video</h3>
                        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                          <video src={originalUrl} controls className="w-full h-auto" />
                        </div>
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                          Size: {(file!.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200">9:16 Converted Video</h3>
                        <div className="bg-black rounded-lg overflow-hidden shadow-lg mx-auto" style={{ maxWidth: '405px' }}>
                          <video src={convertedUrl} controls className="w-full h-auto" />
                        </div>
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                          720x1280 • 9:16 Aspect Ratio<br />
                          Size: {(convertedBlob!.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                      <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white px-6">
                        <a href={convertedUrl} download={`${file?.name.replace(/\.[^/.]+$/, '')}_9-16.mp4`}>
                          <Download className="w-5 h-5 mr-2" />
                          Download 9:16 Video
                        </a>
                      </Button>
                      <Button
                        onClick={() => { setConvertedUrl(null); setConvertedBlob(null); setOriginalUrl(null); setFile(null); setProgress(0); }}
                        variant="outline"
                        size="lg"
                        className="px-6"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Convert Another Video
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
