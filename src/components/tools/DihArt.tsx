import React, { useState, useEffect, useRef } from 'react';
import { Palette, Eye, Volume2, VolumeX, ShieldAlert, Share2, Copy, Check, Play, AlertTriangle, RefreshCw, X, ExternalLink, Info, ZoomIn, Heart, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DihArtProps {
  currentUser?: any;
}

interface Artwork {
  id: string;
  title: string;
  subtitle: string;
  category: 'Abstract' | 'Contemporary' | 'Landscape' | 'Oil & Canvas' | 'Minimalist';
  year: string;
  medium: string;
  dimensions: string;
  image: string;
  description: string;
  likes: number;
}

const ARTWORKS: Artwork[] = [
  {
    id: 'art-1',
    title: 'Whispers of Dawn',
    subtitle: 'Chromatic Tension Series',
    category: 'Abstract',
    year: '2024',
    medium: 'Oil & Mixed Media on Linen',
    dimensions: '180 × 140 cm',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1000&auto=format&fit=crop&q=80',
    description: 'Vibrant layers of warm vermilion and deep cerulean investigating the boundary between dawn illumination and human consciousness.',
    likes: 482
  },
  {
    id: 'art-2',
    title: 'Silent Echoes',
    subtitle: 'Meditations on Solitude',
    category: 'Contemporary',
    year: '2024',
    medium: 'Acrylic & Charcoal on Canvas',
    dimensions: '200 × 160 cm',
    image: 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=1000&auto=format&fit=crop&q=80',
    description: 'An exploration of quiet architectural spaces and structural rhythm where emotional stillness meets dynamic color gradients.',
    likes: 567
  },
  {
    id: 'art-3',
    title: 'Crimson Tide',
    subtitle: 'Fluid Dynamics Series',
    category: 'Abstract',
    year: '2023',
    medium: 'Liquid Acrylic & Heavy Pigments',
    dimensions: '160 × 160 cm',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1000&auto=format&fit=crop&q=80',
    description: 'Rich, swirling impasto strokes and fiery crimson waves evoking raw cosmic energy and organic movement.',
    likes: 395
  },
  {
    id: 'art-4',
    title: 'Midnight Blues',
    subtitle: 'Nocturnal Atmosphere',
    category: 'Oil & Canvas',
    year: '2024',
    medium: 'Heavy Impasto Oil on Canvas',
    dimensions: '190 × 130 cm',
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1000&auto=format&fit=crop&q=80',
    description: 'Deep oceanic indigo and textured shadows capturing the mystical quietude of late-night contemplation.',
    likes: 641
  },
  {
    id: 'art-5',
    title: 'Ethereal Dreams',
    subtitle: 'Transcendental Expressionism',
    category: 'Abstract',
    year: '2024',
    medium: 'Oil & Gold Leaf on Linen',
    dimensions: '175 × 140 cm',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&auto=format&fit=crop&q=80',
    description: 'Luminous golden undertones dancing across deep atmospheric pigments to evoke timeless dreamscapes.',
    likes: 729
  },
  {
    id: 'art-6',
    title: 'Urban Poetry',
    subtitle: 'Architectonic Formations',
    category: 'Contemporary',
    year: '2024',
    medium: 'Mixed Media & Layered Resin',
    dimensions: '180 × 150 cm',
    image: 'https://images.unsplash.com/photo-1545989253-02cc26577f88?w=1000&auto=format&fit=crop&q=80',
    description: 'Expressive brushwork and raw textures reflecting the pulse, lights, and poetry of modern metropolis nights.',
    likes: 512
  },
  {
    id: 'art-7',
    title: "Nature's Canvas",
    subtitle: 'Organic Color Synthesis',
    category: 'Landscape',
    year: '2023',
    medium: 'Pure Mineral Pigments on Raw Silk',
    dimensions: '190 × 140 cm',
    image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1000&auto=format&fit=crop&q=80',
    description: 'Bold, saturated natural dyes blending in organic fluid harmony to celebrate earth’s raw visual elegance.',
    likes: 438
  },
  {
    id: 'art-8',
    title: 'Abstract Thoughts',
    subtitle: 'Subconscious Geometries',
    category: 'Abstract',
    year: '2023',
    medium: 'Acrylic & Oil Glaze',
    dimensions: '150 × 150 cm',
    image: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=1000&auto=format&fit=crop&q=80',
    description: 'Hypnotic layering of transparent hues creating an illusion of endless depth and mental reflections.',
    likes: 384
  },
  {
    id: 'art-9',
    title: 'Serenity',
    subtitle: 'Harmonic Balance',
    category: 'Minimalist',
    year: '2024',
    medium: 'Minimalist Oil & Fine Charcoal',
    dimensions: '160 × 120 cm',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1000&auto=format&fit=crop&q=80',
    description: 'Restrained, balanced tonal compositions inviting quiet mindfulness, space, and aesthetic purity.',
    likes: 620
  }
];

export default function DihArt({ currentUser }: DihArtProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isScreamerActive, setIsScreamerActive] = useState<boolean>(false);
  const [screamerPhase, setScreamerPhase] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [escapeCount, setEscapeCount] = useState<number>(0);

  // Persistent audio and lock refs
  const isScreamerActiveRef = useRef<boolean>(false);
  const wakeLockRef = useRef<any>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const bufferSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);

  // Keep ref synchronized
  useEffect(() => {
    isScreamerActiveRef.current = isScreamerActive;
  }, [isScreamerActive]);

  // Request Screen Wake Lock so phone screen won't turn off
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          if (isScreamerActiveRef.current && document.visibilityState === 'visible') {
            requestWakeLock();
          }
        });
      }
    } catch (err) {}
  };

  // Preload kexart prankaudio.mp3 on mount
  useEffect(() => {
    const preloadKexartAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current && AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
        const resp = await fetch('/prankaudio.mp3');
        if (resp.ok) {
          const arrayBuf = await resp.arrayBuffer();
          if (audioCtxRef.current) {
            const decoded = await audioCtxRef.current.decodeAudioData(arrayBuf);
            audioBufferRef.current = decoded;
          }
        }
      } catch (e) {
        console.warn('Preload kexart audio note:', e);
      }
    };
    preloadKexartAudio();

    return () => {
      stopScreamerAudio();
    };
  }, []);

  // Persistent Screamer Trap, Background Audio Lock, and Anti-Escape Handlers
  useEffect(() => {
    if (isScreamerActive) {
      isScreamerActiveRef.current = true;

      // 1. Keep phone screen from turning off (WakeLock API)
      requestWakeLock();

      // 2. Trap Back Button with PushState
      const pushHistory = () => {
        window.history.pushState(null, '', window.location.href);
      };
      pushHistory();
      window.addEventListener('popstate', pushHistory);

      // 3. Prevent Closing / Navigating Away with beforeunload
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Exhibition stream in progress. Are you sure you want to close?';
        return 'Exhibition stream in progress. Are you sure you want to close?';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      // 4. Background Audio Continuity: Keep playing if phone screen locks or user switches apps
      const ensureAudioRunning = () => {
        if (isScreamerActiveRef.current) {
          audioElementsRef.current.forEach((a) => {
            a.volume = 1.0;
            if (a.paused) {
              a.play().catch(() => {});
            }
          });
          if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
          }
        }
      };

      const handleVisibilityChange = () => {
        ensureAudioRunning();
        if (document.visibilityState === 'visible') {
          requestWakeLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pagehide', ensureAudioRunning);
      window.addEventListener('blur', ensureAudioRunning);
      window.addEventListener('focus', handleVisibilityChange);

      // Heartbeat pulse every 250ms to enforce uninterrupted audio playback
      const audioHeartbeat = setInterval(ensureAudioRunning, 250);

      // 5. Request Fullscreen if supported
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (err) {}

      // 6. Mobile Vibration burst
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 300, 100, 500, 100, 800, 200, 1000]);
        } catch (e) {}
      }

      // 7. Screamer strobe phase timing
      const phaseTimer = setInterval(() => {
        setScreamerPhase((p) => (p + 1) % 6);
      }, 70);

      // 8. Start full-blast overlapping audio
      startScreamerAudio();

      return () => {
        isScreamerActiveRef.current = false;
        window.removeEventListener('popstate', pushHistory);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', ensureAudioRunning);
        window.removeEventListener('blur', ensureAudioRunning);
        window.removeEventListener('focus', handleVisibilityChange);
        clearInterval(audioHeartbeat);
        clearInterval(phaseTimer);
        if (wakeLockRef.current) {
          try {
            wakeLockRef.current.release().catch(() => {});
          } catch (e) {}
          wakeLockRef.current = null;
        }
        stopScreamerAudio();
      };
    }
  }, [isScreamerActive]);

  // Key press safety listener (ESC 3 times or 'stop' to dismiss prank for creator)
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEscapeCount((c) => {
          const next = c + 1;
          if (next >= 3) {
            stopPrank();
            return 0;
          }
          return next;
        });
      }
      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-4);
      if (keyBuffer === 'stop' || keyBuffer === 'exit') {
        stopPrank();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Multi-Channel Persistent Audio Engine with MediaSession & Lock Screen playback
  const startScreamerAudio = () => {
    try {
      stopScreamerAudio();
      const audioSrc = '/prankaudio.mp3';

      // 1. Configure OS Media Session so mobile OS keeps playing audio even when screen is locked/off
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Exhibition Masterpiece Audio Tour',
            artist: 'Mayank Parmar - Modern Art Gallery',
            album: 'Live Exhibition Stream'
          });
          navigator.mediaSession.playbackState = 'playing';

          const forcePlay = () => {
            if (isScreamerActiveRef.current) {
              audioElementsRef.current.forEach((a) => {
                a.volume = 1.0;
                if (a.paused) a.play().catch(() => {});
              });
              if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().catch(() => {});
              }
            }
          };

          // Override pause/stop action handlers: refuse to pause, always keep screaming!
          navigator.mediaSession.setActionHandler('play', forcePlay);
          navigator.mediaSession.setActionHandler('pause', forcePlay);
          navigator.mediaSession.setActionHandler('stop', forcePlay);
        } catch (e) {}
      }

      // 2. Launch 4 overlapping looping HTML5 Audio players with auto-restart on pause/ended
      const players: HTMLAudioElement[] = [];
      for (let i = 0; i < 4; i++) {
        const audio = new Audio(audioSrc);
        audio.loop = true;
        audio.volume = 1.0;
        audio.preload = 'auto';
        audio.currentTime = (i * 0.12) % 1.5;

        // Auto re-trigger if browser tries to pause in background
        audio.onpause = () => {
          if (isScreamerActiveRef.current) {
            setTimeout(() => {
              audio.volume = 1.0;
              audio.play().catch(() => {});
            }, 30);
          }
        };

        audio.onended = () => {
          if (isScreamerActiveRef.current) {
            audio.currentTime = 0;
            audio.volume = 1.0;
            audio.play().catch(() => {});
          }
        };

        audio.onerror = () => {
          audio.src = 'https://kexart.com/prankaudio.mp3';
          audio.play().catch(() => {});
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
        players.push(audio);
      }
      audioElementsRef.current = players;

      // 3. Web Audio API with Amplified 250% Gain
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (audioBufferRef.current) {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(2.5, ctx.currentTime);
        masterGain.connect(ctx.destination);

        const source = ctx.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.loop = true;
        source.connect(masterGain);
        source.start(0);

        bufferSourceNodesRef.current.push(source);
        gainNodesRef.current.push(masterGain);
      } else {
        fetch(audioSrc)
          .then((res) => res.arrayBuffer())
          .then((buf) => ctx.decodeAudioData(buf))
          .then((decoded) => {
            audioBufferRef.current = decoded;
            if (isScreamerActiveRef.current) {
              const masterGain = ctx.createGain();
              masterGain.gain.setValueAtTime(2.5, ctx.currentTime);
              masterGain.connect(ctx.destination);

              const source = ctx.createBufferSource();
              source.buffer = decoded;
              source.loop = true;
              source.connect(masterGain);
              source.start(0);

              bufferSourceNodesRef.current.push(source);
              gainNodesRef.current.push(masterGain);
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error('Audio trigger error:', e);
    }
  };

  const stopScreamerAudio = () => {
    try {
      if (audioElementsRef.current && audioElementsRef.current.length > 0) {
        audioElementsRef.current.forEach((aud) => {
          try {
            aud.onpause = null;
            aud.onended = null;
            aud.pause();
            aud.currentTime = 0;
            aud.src = '';
          } catch (e) {}
        });
        audioElementsRef.current = [];
      }

      if (bufferSourceNodesRef.current && bufferSourceNodesRef.current.length > 0) {
        bufferSourceNodesRef.current.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch (e) {}
        });
        bufferSourceNodesRef.current = [];
      }

      if (gainNodesRef.current && gainNodesRef.current.length > 0) {
        gainNodesRef.current.forEach((g) => {
          try {
            g.disconnect();
          } catch (e) {}
        });
        gainNodesRef.current = [];
      }

      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.suspend().catch(() => {});
      }
    } catch (e) {}
  };

  const triggerPrank = () => {
    setIsScreamerActive(true);
  };

  const stopPrank = () => {
    isScreamerActiveRef.current = false;
    setIsScreamerActive(false);
    stopScreamerAudio();
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release().catch(() => {});
      } catch (e) {}
      wakeLockRef.current = null;
    }
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleCopyPrankLink = () => {
    const url = `${window.location.origin}/dih-art`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const filteredArtworks = selectedCategory === 'All' 
    ? ARTWORKS 
    : ARTWORKS.filter(a => a.category === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-rose-500 selection:text-white pb-20">
      {/* KexArt Style Screamer Modal & Anti-Escape Horror Overlay */}
      <AnimatePresence>
        {isScreamerActive && (
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none cursor-none overflow-hidden ${
              screamerPhase % 2 === 0 ? 'bg-red-700' : screamerPhase % 3 === 0 ? 'bg-black' : 'bg-white'
            }`}
            onClick={() => {
              // Ensure all 4 kexart audio players and web audio context are actively playing
              if (audioElementsRef.current.length === 0) {
                startScreamerAudio();
              } else {
                audioElementsRef.current.forEach((a) => {
                  a.volume = 1.0;
                  if (a.paused) a.play().catch(() => {});
                });
              }
              if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().catch(() => {});
              }
              if ('vibrate' in navigator) {
                try {
                  navigator.vibrate([300, 100, 500]);
                } catch (e) {}
              }
            }}
          >
            {/* Rapid Strobe Flash Overlay */}
            <div className={`absolute inset-0 pointer-events-none mix-blend-difference ${
              screamerPhase % 2 === 0 ? 'opacity-100 bg-red-600' : 'opacity-80 bg-white'
            }`} />

            {/* Screamer Demonic Monster Visual */}
            <div className="relative z-10 flex flex-col items-center justify-center p-4 max-w-2xl w-full text-center">
              {/* Demonic Screamer Face Canvas / Graphic with intense vibration */}
              <div 
                className="w-72 h-72 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] relative rounded-full border-4 border-black bg-black flex items-center justify-center shadow-[0_0_120px_#ff0000] overflow-hidden"
                style={{
                  transform: `translate(${(Math.random() - 0.5) * 40}px, ${(Math.random() - 0.5) * 40}px) scale(${1 + (Math.random() - 0.5) * 0.2})`,
                  filter: 'contrast(300%) brightness(120%)'
                }}
              >
                {/* Terrifying Screamer Face Visual Elements */}
                <div className="absolute inset-0 bg-radial from-red-950 via-black to-red-900" />
                
                {/* Glowing Blood-Red Hollow Eyes */}
                <div className="absolute top-1/4 left-1/4 w-16 h-20 sm:w-20 sm:h-28 bg-black rounded-full border-4 border-red-600 flex items-center justify-center animate-ping">
                  <div className="w-8 h-8 rounded-full bg-red-500 blur-xs" />
                </div>
                <div className="absolute top-1/4 right-1/4 w-16 h-20 sm:w-20 sm:h-28 bg-black rounded-full border-4 border-red-600 flex items-center justify-center animate-ping">
                  <div className="w-8 h-8 rounded-full bg-red-500 blur-xs" />
                </div>

                {/* Massive Gaping Screaming Mouth */}
                <div className="absolute bottom-8 w-44 sm:w-60 h-36 sm:h-48 bg-black rounded-b-full border-8 border-red-600 flex flex-col items-center justify-between p-2 overflow-hidden shadow-[inset_0_0_40px_#ff0000]">
                  <div className="flex gap-1.5 justify-center w-full">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-4 h-8 bg-slate-100 clip-path-polygon rounded-t-xs" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                    ))}
                  </div>
                  <div className="w-16 h-20 bg-red-950 rounded-full blur-sm" />
                  <div className="flex gap-1.5 justify-center w-full">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-4 h-8 bg-slate-100 clip-path-polygon rounded-b-xs" style={{ clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }} />
                    ))}
                  </div>
                </div>

                {/* Blood drip & horror veins */}
                <div className="absolute inset-0 opacity-70 mix-blend-screen pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-red-900/50 to-black" />
              </div>

              {/* Horror Glitch Text */}
              <motion.h1 
                animate={{ 
                  x: [Math.random() * 20 - 10, Math.random() * 20 - 10, 0],
                  y: [Math.random() * 20 - 10, Math.random() * 20 - 10, 0]
                }}
                transition={{ repeat: Infinity, duration: 0.05 }}
                className="mt-6 text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase text-white drop-shadow-[0_0_25px_#ff0000] font-mono select-none"
              >
                {screamerPhase % 2 === 0 ? 'LOOK AT ME' : 'YOU CANNOT LEAVE'}
              </motion.h1>

              <p className="text-sm sm:text-xl font-bold uppercase tracking-widest text-red-200 mt-2 font-mono drop-shadow-[0_0_10px_#000]">
                {screamerPhase % 3 === 0 ? 'ERROR: 0x666_GALLERY_LOCK' : 'DO NOT CLOSE YOUR EYES'}
              </p>
            </div>

            {/* Secret Emergency Exit (Invisible top-right button for owner testing) */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                stopPrank();
              }}
              title="Emergency Release (Owner)"
              className="absolute top-2 right-2 w-10 h-10 bg-transparent hover:bg-white/10 rounded-full cursor-pointer flex items-center justify-center text-[10px] text-white/30 hover:text-white z-50 transition-all"
            >
              <X size={16} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main KexArt Digital Exhibition UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Top Navigation Bar / Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
              <Palette size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-serif">
                  DIH<span className="text-rose-500">ART</span>
                </h1>
                <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 uppercase tracking-wider">
                  Exhibition 2024–2025
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Mayank Parmar — Modern & Contemporary Fine Art Gallery
              </p>
            </div>
          </div>

          {/* Gallery Navigation & Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrankLink}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              title="Share exhibition link"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} className="text-rose-400" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Exhibition'}</span>
            </button>
            <button
              onClick={triggerPrank}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Play size={13} fill="currentColor" />
              <span>Enter Exhibition</span>
            </button>
          </div>
        </div>

        {/* Hero Section — Inspired by KexArt's Modern Artist Showcase */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0c101d] p-6 sm:p-10 lg:p-14 shadow-2xl">
          {/* Subtle Ambient Backlights */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Exhibition 2024–2025 • London & Global Tour</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-serif">
                EXPLORATION OF <br />
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                  CONSCIOUSNESS
                </span> & FORM
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-light">
                Step inside the multidimensional visual archives of Mayank Parmar. Featuring high-definition original canvases, textured oil abstractions, and immersive sensory acoustics designed to captivate your deepest attention.
              </p>

              {/* Main "Explore Gallery" Action Button */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={triggerPrank}
                  className="px-8 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:brightness-115 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-600/30 transition-all flex items-center gap-3 cursor-pointer group active:scale-95 animate-pulse"
                >
                  <Eye size={18} className="group-hover:scale-110 transition-transform" />
                  <span>EXPLORE GALLERY</span>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-3 rounded-2xl border border-slate-800">
                  <Volume2 size={15} className="text-rose-400" />
                  <span>Interactive Audio Enabled for Deep Immersion</span>
                </div>
              </div>

              {/* Prank Disclaimer Notice */}
              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <Info size={13} className="text-slate-400 shrink-0" />
                <span>Tip: Turn your device volume UP before clicking Explore Gallery for the full kexart sensory effect.</span>
              </div>
            </div>

            {/* Featured Artwork Preview Frame */}
            <div className="lg:col-span-5 relative group">
              <div 
                onClick={triggerPrank}
                className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-900 shadow-2xl cursor-pointer transition-all duration-500 group-hover:scale-[1.02] group-hover:border-rose-500"
              >
                <img 
                  src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&auto=format&fit=crop&q=80" 
                  alt="Featured Artwork" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1000&auto=format&fit=crop&q=80";
                  }}
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:brightness-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Featured Masterpiece</span>
                  <h3 className="text-lg font-bold text-white font-serif">Ethereal Dreams</h3>
                  <p className="text-xs text-slate-300">Click to inspect high-resolution canvas details</p>
                </div>
                <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 group-hover:bg-rose-600 transition-colors">
                  <ZoomIn size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Filtering Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight uppercase">
                Curated Exhibition Pieces
              </h3>
              <p className="text-xs text-slate-400">Click any artwork to enter full-screen viewer</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              {['All', 'Abstract', 'Contemporary', 'Oil & Canvas', 'Minimalist'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map((art) => (
              <motion.div
                key={art.id}
                whileHover={{ y: -4 }}
                onClick={triggerPrank}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0d101a] shadow-lg cursor-pointer transition-all hover:border-rose-500/60 flex flex-col"
              >
                {/* Artwork Image Container */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
                  <img 
                    src={art.image} 
                    alt={art.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1000&auto=format&fit=crop&q=80";
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d101a] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    {art.category}
                  </div>
                  <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/10 group-hover:bg-rose-600 transition-colors">
                    <Maximize2 size={14} />
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-white font-serif group-hover:text-rose-400 transition-colors">
                      {art.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">{art.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{art.medium}</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Eye size={12} /> Inspect
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Artist Biography & Studio Statement */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0d17] p-6 sm:p-10 text-left space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-rose-400 font-black">Artist Profile</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-serif">Mayank Parmar</h3>
              <p className="text-xs text-slate-400">Contemporary Painter & Multidisciplinary Visual Artist</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-slate-900 text-xs text-slate-300 border border-slate-800">
                120+ International Exhibitions
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-900 text-xs text-slate-300 border border-slate-800">
                Studio: London • NYC • Zurich
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300 leading-relaxed font-light">
            <div className="space-y-2">
              <h4 className="text-white font-bold font-serif text-base">Creative Philosophy</h4>
              <p className="text-xs text-slate-400">
                My work addresses the fragility of human perception. By combining stark chromatic tension with subtle atmospheric layering, each canvas challenges the observer to examine what lies beneath the immediate sensory surface.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold font-serif text-base">Material & Technique</h4>
              <p className="text-xs text-slate-400">
                Utilizing hand-ground pigments, natural gums, and heavy textured impasto, the paintings preserve kinetic physical energy that manifests when viewed in real-time illuminated environments.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold font-serif text-base">Commission Inquiries</h4>
              <p className="text-xs text-slate-400">
                Private commissions and gallery acquisitions are welcomed for selected collectors. Reach out via the official curation portal to schedule private viewings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
