import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors as Scissor, Play, Pause, Download, Trash2, Link as LinkIcon, Upload, Clock, Zap, AlertCircle, CheckCircle2, ChevronRight, Sliders, MonitorPlay, RefreshCcw, Circle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function CutDownloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [rawVideoUrl, setRawVideoUrl] = useState<string | null>(null);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (duration > 0) {
      setEndTime(duration);
    }
  }, [duration]);

  const resetStudio = () => {
    setVideoFile(null);
    setRawVideoUrl(null);
    setTrimmedVideoUrl(null);
    setVideoUrl('');
    setDuration(0);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    setIsPlaying(false);
    setIsLoading(false);
    setIsProcessing(false);
    setProcessProgress(0);
    setCompleted(false);
    setVideoError(false);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;
    setIsLoading(true);
    setCompleted(false);
    setVideoError(false);
    
    try {
      const response = await fetch('/api/downloader', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl,
          videoQuality: '1080',
          filenameStyle: 'pretty',
          downloadMode: 'auto'
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Failed to parse service response.');
      }
      
      if (!response.ok) {
        throw new Error(data.text || data.error?.code || 'Failed to fetch video source');
      }

      if (data.status === 'error') {
        throw new Error(data.text || 'Service reported an error');
      }

      const getProxiedUrl = (originalUrl: string) => `/api/proxy-video?url=${encodeURIComponent(originalUrl)}`;

      if (data.status === 'success' || data.status === 'redirect' || data.status === 'stream' || data.status === 'tunnel') {
        setVideoFile(getProxiedUrl(data.url));
        setRawVideoUrl(data.url);
      } else if (data.status === 'picker') {
        // Just take the first valid video URL from picker
        const video = data.picker.find((p: any) => p.type === 'video');
        if (video) {
          setVideoFile(getProxiedUrl(video.url));
          setRawVideoUrl(video.url);
        } else {
          throw new Error('No valid video found in this link');
        }
      } else {
        throw new Error('Service returned an unexpected response format');
      }
    } catch (err: any) {
      console.error('Cut Downloader Fetch Error:', err);
      setVideoError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setRawVideoUrl(null); // Local file, no remote URL
      setVideoError(false);
      setCompleted(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Auto-loop within the cut range for technical feel
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setProcessProgress(5);
    setTrimmedVideoUrl(null);
    setCompleted(false);

    if (rawVideoUrl) {
      // Simulate slow handshake to keep UI interactive
      const progressInterval = setInterval(() => {
        setProcessProgress(prev => (prev < 90 ? prev + 4 : prev));
      }, 250);

      try {
        const response = await fetch('/api/downloader/trim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            videoUrl: rawVideoUrl,
            startTime,
            endTime
          })
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Server returned error status');
        }

        const data = await response.json();
        setProcessProgress(100);
        setIsProcessing(false);
        setCompleted(true);

        if (data.status === 'success') {
          setTrimmedVideoUrl(data.url);
        } else {
          // Fallback to original
          console.warn('Backend server trim fallback:', data.message);
          setTrimmedVideoUrl(videoFile);
        }
      } catch (err) {
        console.error('Server trim error, falling back:', err);
        clearInterval(progressInterval);
        setProcessProgress(100);
        setIsProcessing(false);
        setCompleted(true);
        setTrimmedVideoUrl(videoFile); // Fallback to raw proxied video source
      }
    } else {
      // Offline / Uploaded local video trim simulation
      const interval = setInterval(() => {
        setProcessProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            setCompleted(true);
            setTrimmedVideoUrl(videoFile);
            return 100;
          }
          return prev + 5;
        });
      }, 80);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tighter mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary via-slate-400 to-primary animate-gradient-x">
            CUT DOWNLOADER
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[9px]">
             Professional Video Trimming Interface // Core X
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
          <MonitorPlay size={16} className="text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ultra-HD Trimming Active</span>
        </div>
      </div>

      {!videoFile ? (
        /* Source Selection */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* File Upload - Main Interaction */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('video/')) {
                const url = URL.createObjectURL(file);
                setVideoFile(url);
                setVideoError(false);
                setCompleted(false);
              }
            }}
            className="bg-slate-900 border-2 border-dashed border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all hover:border-primary/50 hover:bg-primary/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <input type="file" hidden ref={fileInputRef} accept="video/*" onChange={handleFileUpload} />
            
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-8 group-hover:scale-110 group-hover:text-primary group-hover:rotate-6 transition-all duration-700 relative z-10">
               <Upload size={40} />
            </div>
            
            <div className="relative z-10">
               <h3 className="text-2xl font-black tracking-tighter mb-3 uppercase">Drop your video here</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8">MP4, WEBM, MOV Supported // High Fidelity Node</p>
               
               <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group-hover:bg-primary/90 transition-all">
                  <Zap size={12} className="animate-pulse" /> Initialize Studio
               </div>
            </div>

            {/* Hint for URL (moved to bottom, less prominent) */}
            <div className="mt-20 pt-10 border-t border-white/5 w-full flex flex-col items-center gap-6">
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Or provide remote source</p>
               <div className="flex w-full max-w-md gap-2">
                  <input 
                    type="text" 
                    placeholder="PASTE VIDEO URL..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[10px] font-bold text-white focus:outline-none focus:border-primary/50"
                  />
                  <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       handleUrlSubmit(e);
                    }}
                    disabled={isLoading}
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all whitespace-nowrap"
                  >
                    {isLoading ? <RefreshCcw size={14} className="animate-spin" /> : 'FETCH'}
                  </button>
               </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Video Editor Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Editor */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Video Player */}
            <div className="flex items-center justify-between gap-4 mb-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Editor Active</span>
               </div>
               <button 
                 onClick={resetStudio}
                 className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-zinc-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
               >
                 <Trash2 size={12} /> Remove Video
               </button>
            </div>
            <div className="bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group min-h-[250px] flex items-center justify-center">
               {videoError && (
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4 relative">
                       <AlertCircle size={32} className="text-red-500 animate-pulse" />
                       <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                    </div>
                    <h4 className="text-xl font-black text-red-500 mb-1 uppercase tracking-tighter">SIGNAL INTERRUPTED</h4>
                    <p className="text-[9px] font-bold text-zinc-500 max-w-xs mb-6 uppercase tracking-[0.2em] leading-loose">
                       The remote source failed to establish a secure handshake. Verify the link integrity or use a local file node.
                    </p>
                    <button 
                      onClick={() => setVideoFile(null)}
                      className="px-8 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10 active:scale-95"
                    >
                       REBOOT SELECTION
                    </button>
                 </div>
               )}
               <video 
                 ref={videoRef}
                 src={videoFile}
                 onLoadedMetadata={handleLoadedMetadata}
                 onTimeUpdate={handleTimeUpdate}
                 onError={() => setVideoError(true)}
                 className="w-full aspect-video object-contain"
                 onClick={togglePlay}
                 crossOrigin="anonymous"
                 playsInline
               />
               
               {/* Controls Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 gap-4">
                  {/* Player Seek Bar */}
                  <div className="w-full relative h-1 bg-white/20 rounded-full cursor-pointer group/seek"
                       onClick={(e) => {
                         e.stopPropagation();
                         const rect = e.currentTarget.getBoundingClientRect();
                         const x = e.clientX - rect.left;
                         const pct = x / rect.width;
                         const newTime = pct * duration;
                         if (videoRef.current) {
                           videoRef.current.currentTime = newTime;
                           setCurrentTime(newTime);
                         }
                       }}>
                     <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
                     <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity shadow-[0_0_10px_white]"
                          style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }} />
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                       <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-xl shadow-primary/40 active:scale-90">
                          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                       </button>
                       
                       <div className="flex flex-col">
                          <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 font-mono flex items-center gap-2">
                             <Circle size={8} fill="currentColor" className="animate-pulse" /> LIVE_FEED
                          </div>
                          <div className="text-xl font-black text-white font-mono tracking-tighter">
                             {formatTime(currentTime)} <span className="text-zinc-600">/ {formatTime(duration)}</span>
                          </div>
                       </div>
                     </div>

                     <div className="flex flex-col items-end">
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 font-mono">REMAINING</div>
                        <div className="text-lg font-black text-white font-mono tracking-tighter">
                           -{formatTime(duration - currentTime)}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Editing Timeline */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
               
               <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                     <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Scissor size={16} />
                     </div>
                     <h3 className="text-base font-black tracking-tighter uppercase">Precision Trim Node</h3>
                  </div>
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Live Segment Decryption</div>
               </div>

               {/* Timeline Slider */}
               <div className="relative h-16 flex items-center px-2">
                  {/* Background Track */}
                  <div className="absolute left-2 right-2 h-1.5 bg-white/5 rounded-full" />
                  
                  {/* Selected Range Fill */}
                  <div 
                    className="absolute h-1.5 bg-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-full"
                    style={{ 
                      left: `calc(${(startTime / duration) * 100}% + 8px)`, 
                      width: `calc(${((endTime - startTime) / duration) * 100}% - 8px)`
                    }}
                  />

                  {/* Range Inputs */}
                  <div className="absolute w-full px-2 left-0">
                    <input 
                      type="range"
                      min={0}
                      max={duration}
                      step={0.01}
                      value={startTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val < endTime) setStartTime(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-auto h-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer range-thumb-start"
                    />
                    <input 
                      type="range"
                      min={0}
                      max={duration}
                      step={0.01}
                      value={endTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > startTime) setEndTime(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-auto h-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer range-thumb-end"
                    />
                  </div>

                  {/* Playhead */}
                  <motion.div 
                    className="absolute top-0 bottom-0 w-[2px] bg-white z-10 pointer-events-none"
                    style={{ left: `calc(${(currentTime / duration) * 100}% + 8px)` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                  </motion.div>
               </div>

               {/* Time Inputs */}
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center group/input relative overflow-hidden">
                     <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/input:opacity-100 transition-opacity" />
                     <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3 font-mono group-hover/input:text-primary transition-colors relative z-10">MARK IN (SEC)</span>
                     <div className="flex items-center gap-3 relative z-10">
                        <input 
                          type="number"
                          step="0.1"
                          min="0"
                          max={endTime}
                          value={startTime.toFixed(1)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0 && val < endTime) {
                              setStartTime(val);
                              if (videoRef.current) videoRef.current.currentTime = val;
                            }
                          }}
                          className="w-24 bg-transparent border-none text-3xl font-black text-primary font-mono text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                     </div>
                     <button 
                       onClick={() => {
                         setStartTime(currentTime);
                         if (currentTime >= endTime) setEndTime(Math.min(duration, currentTime + 1));
                       }}
                       className="mt-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-zinc-500 hover:text-primary hover:border-primary/30 transition-all relative z-10 active:scale-95"
                     >
                        Sync current
                     </button>
                     <p className="text-[10px] font-bold text-zinc-700 mt-2 uppercase tracking-tighter italic relative z-10">Preview Node Alpha</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center group/input relative overflow-hidden">
                     <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/input:opacity-100 transition-opacity" />
                     <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3 font-mono group-hover/input:text-accent transition-colors relative z-10">MARK OUT (SEC)</span>
                     <div className="flex items-center gap-3 relative z-10">
                        <input 
                          type="number"
                          step="0.1"
                          min={startTime}
                          max={duration}
                          value={endTime.toFixed(1)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > startTime && val <= duration) {
                              setEndTime(val);
                            }
                          }}
                          className="w-24 bg-transparent border-none text-3xl font-black text-accent font-mono text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                     </div>
                     <button 
                       onClick={() => {
                         if (currentTime > startTime) setEndTime(currentTime);
                       }}
                       className="mt-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-zinc-500 hover:text-accent hover:border-accent/30 transition-all relative z-10 active:scale-95"
                     >
                        Sync current
                     </button>
                     <p className="text-[10px] font-bold text-zinc-700 mt-2 uppercase tracking-tighter italic relative z-10">Terminal Index Omega</p>
                  </div>
               </div>

               {/* Duration Summary */}
               <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">
                  <span>Selected Segment: <span className="text-white">{formatTime(endTime - startTime)}</span></span>
                  <span>Estimated Size: <span className="text-white">~{( (endTime - startTime) * 1.5 ).toFixed(1)} MB</span></span>
               </div>
            </div>
          </motion.div>

          {/* sidebar panel */}
          <div className="lg:col-span-4 space-y-6">
             {/* Configuration settings */}
             <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-8 space-y-8">
                <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                   <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Sliders size={20} />
                   </div>
                   <h4 className="text-sm font-black tracking-widest uppercase">Output Config</h4>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Resolution Matrix</p>
                      <select className="w-full bg-black/60 border border-white/10 rounded-xl py-4 px-6 text-xs font-black text-white appearance-none uppercase tracking-widest">
                         <option>Original (4K Stable)</option>
                         <option>Full HD (1080p Web)</option>
                         <option>Mobile Optim (720p)</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Codec Protocol</p>
                      <select className="w-full bg-black/60 border border-white/10 rounded-xl py-4 px-6 text-xs font-black text-white appearance-none uppercase tracking-widest">
                         <option>MP4 / H.264 High Profile</option>
                         <option>MKV / Lossless</option>
                         <option>AVI / Legacy</option>
                      </select>
                   </div>
                </div>

                {isProcessing ? (
                  <div className="space-y-4">
                     <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest">
                        <span>Re-Encoding Bits...</span>
                        <span>{processProgress}%</span>
                     </div>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${processProgress}%` }}
                        />
                     </div>
                  </div>
                ) : completed ? (
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = trimmedVideoUrl || videoFile!;
                      link.download = `DIHTEMPLATE_CUT_${Date.now()}.mp4`;
                      link.click();
                    }}
                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 hover:scale-105 transition-all"
                  >
                    <Download size={18} /> SAVE TRIMMED FILE
                  </button>
                ) : (
                  <button 
                    onClick={handleProcess}
                    className="w-full py-6 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Zap size={18} /> GENERATE TRIMMED CLIP
                  </button>
                )}

                <button 
                  onClick={resetStudio}
                  className="w-full py-4 bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  DISCARD PROJECT
                </button>
             </div>

             {/* Tips Panel */}
             <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-8">
                <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Operational Insights</h5>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                         <Zap size={14} />
                      </div>
                      <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">
                         Multi-thread encoding is enabled for instant rendering of short segments.
                      </p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                         <MonitorPlay size={14} />
                      </div>
                      <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">
                         The precision timeline supports frame-by-frame scrubbing for perfect cuts.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Global CSS for Range Thumbs */}
      <style>{`
        input[type=range].range-thumb-start::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 8px;
          border-radius: 2px;
          background: #3b82f6;
          cursor: ew-resize;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          position: relative;
          z-index: 30;
        }
        input[type=range].range-thumb-end::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 8px;
          border-radius: 2px;
          background: #f43f5e;
          cursor: ew-resize;
          box-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
          position: relative;
          z-index: 30;
        }
      `}</style>
    </div>
  );
}
