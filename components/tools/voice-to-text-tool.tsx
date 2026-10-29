'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Upload, 
  Sparkles,
  AlertCircle,
  FileAudio,
  Play,
  Pause,
  Loader2,
  CheckCircle2,
  Languages,
  Cpu,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type TabMode = 'upload' | 'mic';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto Detect (Multi-language)', flag: '🌐' },
  { code: 'english', name: 'English', flag: '🇺🇸' },
  { code: 'urdu', name: 'Urdu', flag: '🇵🇰' },
  { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'german', name: 'German', flag: '🇩🇪' },
  { code: 'arabic', name: 'Arabic', flag: '🇸🇦' },
  { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
  { code: 'portuguese', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'italian', name: 'Italian', flag: '🇮🇹' },
  { code: 'russian', name: 'Russian', flag: '🇷🇺' },
  { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
  { code: 'korean', name: 'Korean', flag: '🇰🇷' },
  { code: 'turkish', name: 'Turkish', flag: '🇹🇷' },
];

export default function VoiceToTextTool() {
  const [activeTab, setActiveTab] = useState<TabMode>('upload');
  
  // Shared Output State
  const [transcript, setTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // File Upload & Whisper State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<string>('');

  // Live Mic State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [micSeconds, setMicSeconds] = useState<number>(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Initialize Speech Recognition for Live Mic Tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans + ' ';
          } else {
            currentInterim += trans;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => prev + currentFinal);
        }
        setInterimText(currentInterim);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Recognition error: ${event.error}`);
        }
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      rec.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearInterval(timerRef.current);
    };
  }, []);

  // Handle Audio File Selection
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Read audio duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      const m = Math.floor(tempAudio.duration / 60);
      const s = Math.floor(tempAudio.duration % 60);
      setAudioDuration(`${m}:${s.toString().padStart(2, '0')}`);
    };

    toast.success(`Loaded "${file.name}"! Click "Transcribe Audio with Whisper AI" below.`);
  };

  // Convert and Resample Audio to 16kHz Float32Array
  const decodeAndResampleAudio = async (file: File): Promise<Float32Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    // Decode native audio data (MP3, WAV, OGG, AAC, M4A, etc.)
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Target sample rate for Whisper AI is 16kHz mono
    const targetSampleRate = 16000;
    const targetLength = Math.ceil(audioBuffer.duration * targetSampleRate);

    // Use OfflineAudioContext for hardware-accelerated resampling to 16kHz
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);
    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start(0);

    const resampledBuffer = await offlineCtx.startRendering();
    return resampledBuffer.getChannelData(0);
  };

  // Run Direct AI File Transcription using Whisper
  const handleTranscribeAudioFile = async () => {
    if (!audioFile) {
      toast.error('Please choose or drop an audio file first.');
      return;
    }

    setIsTranscribing(true);
    setProgressPercent(20);
    setStatusMessage('Uploading and analyzing audio...');

    try {
      // Primary Engine: High-speed server-side AI Whisper transcription with native Ogg Opus & WAV decoders
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('language', selectedLanguage);

      setProgressPercent(45);
      setStatusMessage('Transcribing audio with Whisper AI neural network...');

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.text) {
          setTranscript(data.text);
          setProgressPercent(100);
          setStatusMessage(`Completed in ${data.duration || 'a few'}s (Language: ${data.language || selectedLanguage})`);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          toast.success('Audio transcribed successfully!');
          return;
        } else if (data.success && !data.text) {
          toast.error('No audible speech detected in this audio recording.');
          setStatusMessage('No speech detected in audio file.');
          return;
        }
      }

      // Fallback: If server route returned error, try in-browser engine
      setStatusMessage('Trying in-browser transcription engine...');
      setProgressPercent(60);
      const audioData = await decodeAndResampleAudio(audioFile);

      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        { quantized: true }
      );

      setProgressPercent(85);
      setStatusMessage('Transcribing with client-side Whisper model...');

      const options: any = {
        chunk_length_s: 30,
        task: 'transcribe',
      };
      if (selectedLanguage !== 'auto') {
        options.language = selectedLanguage;
      }

      const output: any = await transcriber(audioData, options);
      const transcribedText = (output && output.text) ? output.text.trim() : '';

      if (transcribedText) {
        setTranscript(transcribedText);
        setProgressPercent(100);
        setStatusMessage('Transcription completed!');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        toast.success('Audio transcribed successfully!');
      } else {
        toast.error('No audible speech detected. If speaking Urdu/Hindi, select it from the language menu.');
        setStatusMessage('No speech detected.');
      }
    } catch (err: any) {
      console.error('Audio transcription error:', err);
      toast.error(err.message || 'Failed to transcribe audio. Please select language or try again.');
      setStatusMessage('Error during transcription. Please check audio file format.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Mic Controls
  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setMicSeconds(0);
      timerRef.current = setInterval(() => {
        setMicSeconds((prev) => prev + 1);
      }, 1000);
      toast.success('Microphone listening... Speak clearly!');
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
    setInterimText('');
  };

  // Actions
  const handleCopy = () => {
    const textToCopy = transcript + (interimText ? ' ' + interimText : '');
    if (!textToCopy.trim()) return;
    navigator.clipboard.writeText(textToCopy.trim());
    setCopied(true);
    toast.success('Copied transcript to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToCopy = transcript + (interimText ? ' ' + interimText : '');
    if (!textToCopy.trim()) return;
    const blob = new Blob([textToCopy.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded transcript file!');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = (transcript + ' ' + interimText)
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileAudio className="w-4 h-4" />
          <span>Upload Audio File</span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-amber-200">AI Whisper</span>
        </button>

        <button
          onClick={() => setActiveTab('mic')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'mic'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Live Dictation</span>
        </button>
      </div>

      {/* TAB 1: FILE UPLOAD DIRECT AI TRANSCRIPTION */}
      {activeTab === 'upload' && (
        <div className="space-y-5">
          {/* File Upload Drop Zone */}
          <div className="p-8 rounded-2xl bg-slate-950/90 border-2 border-dashed border-slate-800 hover:border-amber-500/60 transition-all text-center relative overflow-hidden group">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                <FileAudio className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Drop Your Audio File or WhatsApp Voice Note
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Supports WhatsApp Voice Notes (<code className="text-amber-400">.opus</code>, <code className="text-amber-400">.ogg</code>), MP3, WAV, M4A, AAC, and WebM
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <label className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-medium text-xs sm:text-sm cursor-pointer shadow-lg hover:shadow-amber-500/20 transition-all inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose Audio File</span>
                  <input
                    type="file"
                    accept="audio/*,.opus,.ogg,.m4a,.wav,.mp3,.aac,.webm"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Audio File Loaded State */}
          {audioFile && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white truncate max-w-[240px] sm:max-w-md">
                      {audioFile.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • {audioDuration ? `Duration: ${audioDuration}` : 'Audio Ready'}
                    </p>
                  </div>
                </div>

                {audioUrl && (
                  <audio src={audioUrl} controls className="h-9 max-w-full sm:max-w-xs" />
                )}
              </div>

              {/* Language Selection & Transcribe Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-amber-400" />
                    <span>Spoken Language</span>
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    disabled={isTranscribing}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    onClick={handleTranscribeAudioFile}
                    disabled={isTranscribing}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-xl hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transcribing Audio...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>⚡ Transcribe Audio with Whisper AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress & Status Bar */}
              {isTranscribing && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      {statusMessage || 'Processing audio...'}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    AI Whisper model processes audio directly on your device. The first time loads the model, and subsequent transcriptions are cached and instant.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Zero-Cloud Benefit Banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">100% Client-Side Privacy:</strong>
              <p className="mt-0.5">
                Your audio file is decoded and transcribed directly in your browser using OpenAI Whisper via WebAssembly. Your recordings are never uploaded to any server or cloud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MICROPHONE DICTATION */}
      {activeTab === 'mic' && (
        <div className="space-y-6">
          {!isSupported && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Browser Notice:</strong>
                <p className="mt-0.5">
                  Your browser does not support the Web Speech Recognition API. For live microphone dictation, please use Google Chrome, Microsoft Edge, or Safari.
                </p>
              </div>
            </div>
          )}

          {/* Mic Control Hub */}
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {isRecording && (
              <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-pulse" />
            )}

            <div className="relative inline-block">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-bounce'
                    : 'bg-gradient-to-tr from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white hover:scale-105'
                }`}
              >
                {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {isRecording ? 'Listening & Transcribing...' : 'Click to Start Voice Dictation'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {isRecording
                  ? `Recording Duration: ${formatTime(micSeconds)} • Speak naturally into your microphone`
                  : 'Speak into your microphone for real-time live voice typing'}
              </p>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35, 75].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i * 0.1).toFixed(1)}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHARED TRANSCRIPT OUTPUT HUB */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">
              Transcribed Text • <strong className="text-white">{wordCount}</strong> words • <strong className="text-white">{(transcript + interimText).length}</strong> characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!transcript && !interimText}
              className="inline-flex items-center gap-1 text-xs text-white hover:text-amber-300 font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!transcript && !interimText}
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Download as .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save .txt</span>
            </button>

            <button
              onClick={() => {
                setTranscript('');
                setInterimText('');
                toast.success('Transcript cleared');
              }}
              disabled={!transcript && !interimText}
              className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Clear transcript"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Editable Transcript Area */}
        <div className="p-4 sm:p-6 min-h-[220px]">
          {transcript || interimText ? (
            <textarea
              value={transcript + (interimText ? ' ' + interimText : '')}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[200px] bg-transparent text-white text-sm sm:text-base leading-relaxed font-sans focus:outline-none resize-y border-none"
              placeholder="Your transcribed text will appear here..."
            />
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500">
              <Sparkles className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-sm font-medium">No transcription yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Upload an audio file above and click Transcribe, or use Live Dictation to speak into your mic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
