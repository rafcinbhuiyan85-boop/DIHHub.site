import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Upload, Download, Sparkles, RefreshCw, Trash2, Palette, Image as ImageIconLucide, Check, Plus, Minus, Cpu, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { removeBackground } from '@imgly/background-removal';

const PRESET_COLORS = [
  '#ffffff', '#000000', '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

const PRESET_BGS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=400',
];

export default function BackgroundRemover() {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [bgType, setBgType] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [activeBg, setActiveBg] = useState(PRESET_BGS[0]);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [isMagicWandActive, setIsMagicWandActive] = useState(false);
  const [wandTolerance, setWandTolerance] = useState(30);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult(null);
      setFinalImage(null);
      setIsEditing(false);
      setIsMagicWandActive(false);
    };
    reader.readAsDataURL(file);
  };

  const [progressMsg, setProgressMsg] = useState('');
  const [progressVal, setProgressVal] = useState(0);

  const handleRemoveBackground = async () => {
    if (!image) return;
    setProcessing(true);
    setProgressVal(0);
    setProgressMsg(useAI ? 'Connecting to Gemini Cloud...' : 'Initializing Local Engine...');
    
    try {
      if (useAI) {
        const apiResponse = await fetch('/api/passport/remove-background', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image }),
        });

        if (!apiResponse.ok) {
          const errData = await apiResponse.json().catch(() => ({ error: 'Unknown server error.' }));
          throw new Error(errData.error || 'Failed to remove background via Gemini server API.');
        }

        const apiResult = await apiResponse.json();
        if (!apiResult.success || !apiResult.imageUrl) {
          throw new Error('AI server did not return a valid image URL.');
        }

        const resData = apiResult.imageUrl;
        setProgressMsg('Refining Edges & Transparency...');
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Optimized Chroma Key for Magenta (#FF00FF)
            // This is much more robust than white thresholding
            const width = canvas.width;
            const height = canvas.height;
            
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i], g = data[i+1], b = data[i+2];
              // Magenta check: High Red, High Blue, Low Green
              // Allow for some JPEG compression artifacts
              const isMagenta = (r > 150 && b > 150 && g < 130) || (r > 200 && b > 200 && g < 180);
              
              if (isMagenta) {
                data[i+3] = 0;
              }
            }

            // Edge Erosion Pass (remains of magenta/halo removal)
            const alphaCopy = new Uint8Array(width * height);
            for (let i = 0; i < data.length; i += 4) alphaCopy[i/4] = data[i+3];
            
            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                if (alphaCopy[idx] > 0) {
                  // If near-boundary, check for color bleed and clean it
                  if (alphaCopy[idx-1] === 0 || alphaCopy[idx+1] === 0 || alphaCopy[idx-width] === 0 || alphaCopy[idx+width] === 0) {
                     // This is a border pixel
                     const i = idx * 4;
                     // If it's still "magenta-ish", kill it
                     if (data[i] > 120 && data[i+2] > 120) data[i+3] = 0;
                  }
                }
              }
            }
            
            ctx.putImageData(imageData, 0, 0);
            setResult(canvas.toDataURL('image/png'));
          }
        };
        img.src = resData;
      } else {
        const blob = await removeBackground(image, {
          model: 'isnet',
          progress: (key, current, total) => {
            const percent = Math.round((current / total) * 100);
            setProgressVal(percent);
            if (key.includes('model')) setProgressMsg(`Downloading Model (${percent}%)`);
            else setProgressMsg(`Processing Image (${percent}%)`);
          }
        });
        
        setProgressMsg('Isolating Main Subject...');
        const finalBlob = await isolateMainSubject(blob);
        const url = URL.createObjectURL(finalBlob);
        setResult(url);
      }
    } catch (error) {
      console.error("Background removal failed:", error);
      alert("Failed to remove background. Please try again.");
    } finally {
      setProcessing(false);
      setProgressVal(0);
      setProgressMsg('');
    }
  };

  /**
   * Smart Focus 8.0 (Pro Figure Isolation)
   * Focuses on the "Vertical Pillar" (Human Subject).
   * Aggressively prunes horizontal environmental clutter like benches.
   */
  const isolateMainSubject = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // Ultra-Fast Low-Res Analysis
        const maxProcDim = 380; 
        const scale = Math.min(maxProcDim / width, maxProcDim / height, 1);
        const pWidth = Math.round(width * scale);
        const pHeight = Math.round(height * scale);
        const pTotal = pWidth * pHeight;

        const pCanvas = document.createElement('canvas');
        pCanvas.width = pWidth;
        pCanvas.height = pHeight;
        const pCtx = pCanvas.getContext('2d', { willReadFrequently: true });
        if (!pCtx) { resolve(blob); return; }
        
        pCtx.drawImage(img, 0, 0, pWidth, pHeight);
        const pData = pCtx.getImageData(0, 0, pWidth, pHeight).data;

        // Step 1: Binary Mask
        const mask = new Uint8Array(pTotal);
        for (let i = 0; i < pData.length; i += 4) {
          if (pData[i + 3] > 160) mask[i / 4] = 1;
        }

        // Step 2: Extra-Heavy Adaptive Erosion (breaks connections to benches/chairs)
        const eroded = new Uint8Array(pTotal);
        const er = Math.max(2, Math.round(7 * scale)); 
        for (let y = er; y < pHeight - er; y++) {
          for (let x = er; x < pWidth - er; x++) {
            const idx = y * pWidth + x;
            if (mask[idx] && mask[idx-er] && mask[idx+er] && mask[idx-er*pWidth] && mask[idx+er*pWidth] &&
                mask[idx-er-er*pWidth] && mask[idx+er-er*pWidth] && mask[idx-er+er*pWidth] && mask[idx+er+er*pWidth]) {
              eroded[idx] = 1;
            }
          }
        }

        // Step 3: Fast Connected Components with Verticality Scoring
        const labels = new Int32Array(pTotal);
        let nextLabel = 1;
        const queue = new Int32Array(pTotal);
        const stats: { [k: number]: { size: number, sumX: number, sumY: number, minX: number, maxX: number, minY: number, maxY: number } } = {};

        for (let i = 0; i < pTotal; i++) {
          if (eroded[i] && labels[i] === 0) {
            const label = nextLabel++;
            let head = 0, tail = 0;
            queue[tail++] = i;
            labels[i] = label;
            
            let size = 0, sumX = 0, sumY = 0, minX = pWidth, maxX = 0, minY = pHeight, maxY = 0;
            while (head < tail) {
              const idx = queue[head++];
              const x = idx % pWidth;
              const y = (idx / pWidth) | 0;
              size++;
              sumX += x;
              sumY += y;
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;

              if (x+1 < pWidth && eroded[idx+1] && !labels[idx+1]) { labels[idx+1] = label; queue[tail++] = idx+1; }
              if (x-1 >= 0 && eroded[idx-1] && !labels[idx-1]) { labels[idx-1] = label; queue[tail++] = idx-1; }
              if (y+ head < pTotal && y+1 < pHeight && eroded[idx+pWidth] && !labels[idx+pWidth]) { labels[idx+pWidth] = label; queue[tail++] = idx+pWidth; }
              if (y-1 >= 0 && eroded[idx-pWidth] && !labels[idx-pWidth]) { labels[idx-pWidth] = label; queue[tail++] = idx-pWidth; }
            }
            stats[label] = { size, sumX, sumY, minX, maxX, minY, maxY };
          }
        }

        // Step 4: Vertical Pillar Detection (Human Subject Strategy)
        let bestLabel = -1;
        let bestScore = -1;
        const centerX = pWidth / 2;

        Object.entries(stats).forEach(([lStr, s]) => {
          const l = parseInt(lStr);
          const avgX = s.sumX / s.size;
          const dxNorm = Math.abs(avgX - centerX) / pWidth;
          const heightSpan = s.maxY - s.minY;
          const widthSpan = s.maxX - s.minX;
          
          const verticality = heightSpan / (widthSpan || 1);
          const heightRatio = heightSpan / pHeight;
          
          // Score favoring large, central, vertical components
          const score = s.size * (1 / (1 + dxNorm * 12)) * (heightRatio * 5) * Math.min(2.5, verticality);
          
          if (score > bestScore) {
            bestScore = score;
            bestLabel = l;
          }
        });

        // Step 5: Reconstruction
        const finalPMask = new Uint8Array(pTotal);
        if (bestLabel !== -1) {
          const dr = Math.round(10 * scale); 
          for (let i = 0; i < pTotal; i++) {
            if (labels[i] === bestLabel) {
              const x = i % pWidth;
              const y = (i / pWidth) | 0;
              for (let dy = -dr; dy <= dr; dy++) {
                for (let dx = -dr; dx <= dr; dx++) {
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < pWidth && ny >= 0 && ny < pHeight) {
                    finalPMask[ny * pWidth + nx] = 1;
                  }
                }
              }
            }
          }
        }

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = pWidth;
        maskCanvas.height = pHeight;
        const mcCtx = maskCanvas.getContext('2d');
        if (mcCtx) {
          const mData = mcCtx.createImageData(pWidth, pHeight);
          for (let i = 0; i < pTotal; i++) {
            const v = finalPMask[i] ? 255 : 0;
            const di = i * 4;
            mData.data[di] = mData.data[di+1] = mData.data[di+2] = v;
            mData.data[di+3] = v;
          }
          mcCtx.putImageData(mData, 0, 0);
        }

        const outCanvas = document.createElement('canvas');
        outCanvas.width = width;
        outCanvas.height = height;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) { resolve(blob); return; }

        outCtx.drawImage(img, 0, 0);
        outCtx.globalCompositeOperation = 'destination-in';
        outCtx.drawImage(maskCanvas, 0, 0, width, height);

        outCanvas.toBlob((b) => {
          URL.revokeObjectURL(url);
          resolve(b || blob);
        }, 'image/png');
      };
      img.onerror = () => resolve(blob);
      img.src = url;
    });
  };

  const resetRefinements = () => {
    handleRemoveBackground();
  };

  const [isProcessingManual, setIsProcessingManual] = useState(false);

  const applyMagicWand = (targetR: number, targetG: number, targetB: number) => {
    if (!result && !image) return;
    setIsProcessingManual(true);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessingManual(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const threshold = wandTolerance;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;

        const delta = Math.sqrt(
          Math.pow(data[i] - targetR, 2) +
          Math.pow(data[i + 1] - targetG, 2) +
          Math.pow(data[i + 2] - targetB, 2)
        );

        if (delta < threshold) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setResult(canvas.toDataURL('image/png'));
      setIsProcessingManual(false);
      setIsMagicWandActive(false);
    };
    img.onerror = () => {
      setIsProcessingManual(false);
      setIsMagicWandActive(false);
    };
    img.src = result || image!;
  };

  const autoRefineLogo = () => {
    if (!result && !image) return;
    setIsProcessingManual(true);
    
    setWandTolerance(50); 
    setTimeout(() => {
      applyMagicWand(255, 255, 255);
    }, 100);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMagicWandActive || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const innerWidth = canvas.width;
    const innerHeight = canvas.height;
    const elementWidth = rect.width;
    const elementHeight = rect.height;
    const innerAspect = innerWidth / innerHeight;
    const elementAspect = elementWidth / elementHeight;
    
    let renderWidth, renderHeight, xOffset = 0, yOffset = 0;
    
    if (elementAspect > innerAspect) {
      renderHeight = elementHeight;
      renderWidth = renderHeight * innerAspect;
      xOffset = (elementWidth - renderWidth) / 2;
    } else {
      renderWidth = elementWidth;
      renderHeight = renderWidth / innerAspect;
      yOffset = (elementHeight - renderHeight) / 2;
    }
    
    const mouseX = e.clientX - rect.left - xOffset;
    const mouseY = e.clientY - rect.top - yOffset;
    
    const x = (mouseX / renderWidth) * innerWidth;
    const y = (mouseY / renderHeight) * innerHeight;

    if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    applyMagicWand(pixel[0], pixel[1], pixel[2]);
  };

  const handlePreviewMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMagicWandActive) {
      handlePreviewClick(e);
    }
  };

  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Placeholder for future precision tools if needed
  };

  const handlePreviewMouseUp = () => {
    // Placeholder for interaction cleanup
  };

  useEffect(() => {
    if (!result && !image) return;

    const generateFinal = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const source = result || image;
      if (!source) return;

      const fgImg = new Image();
      fgImg.crossOrigin = 'anonymous';
      fgImg.onload = () => {
        canvas.width = fgImg.width;
        canvas.height = fgImg.height;

        // Draw for preview (always transparent background representation)
        // If we have a preview canvas in the DOM, update it for magic wand picking
        const previewCanvas = previewCanvasRef.current;
        if (previewCanvas) {
          previewCanvas.width = fgImg.width;
          previewCanvas.height = fgImg.height;
          const pCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
          if (pCtx) {
            pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            pCtx.drawImage(fgImg, 0, 0);
          }
        }

        // Draw for Final Output (with selected background styles)
        if (bgType === 'color') {
          ctx.fillStyle = activeColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(fgImg, 0, 0);
        } else if (bgType === 'image') {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.onload = () => {
            const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
            const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
            const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
            ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
            ctx.drawImage(fgImg, 0, 0);
            setFinalImage(canvas.toDataURL('image/png'));
          };
          bgImg.src = activeBg;
          return;
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(fgImg, 0, 0);
        }
        
        const dataUrl = canvas.toDataURL('image/png');
        setFinalImage(dataUrl);
      };
      fgImg.onerror = (e) => {
        console.error("Failed to load source image for rendering", e);
      };
      fgImg.src = source;
    };

    generateFinal();
  }, [result, image, bgType, activeColor, activeBg, isMagicWandActive, isEditing]);

  const downloadImage = (isHd = false) => {
    if (!finalImage) return;
    const a = document.createElement('a');
    a.href = finalImage;
    a.download = `removed-bg-${isHd ? 'hd-' : ''}${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen font-sans">
      {/* Premium Header */}
      <div className="flex flex-col items-center justify-center text-center mb-8 space-y-2">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-indigo-600 p-3 rounded-xl shadow-2xl shadow-indigo-500/40 mb-1"
        >
          <Sparkles className="text-white" size={28} />
        </motion.div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
          Magic BG Remover
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest text-xs uppercase">
          Automatic Smart Background Removal • Quality Like Erase.bg
        </p>
      </div>

      <div className="w-full">
        {!image ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => setImage(event.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="group relative h-[320px] bg-slate-50 dark:bg-slate-900 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer overflow-hidden"
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-xl font-black mb-1">Drop your image here</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-4 text-sm">Or click to browse your files</p>
              
              <div className="flex gap-4 items-center">
                 <span className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500">JPG</span>
                 <span className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500">PNG</span>
                 <span className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500">WEBP</span>
              </div>

              {/* Animated background elements */}
              <div className="absolute top-10 left-10 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full"></div>
            </div>
            
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFile} 
            />
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
              {/* Original Image Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-4">
                    <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Original</span>
                    <button 
                      onClick={() => { setImage(null); setResult(null); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
                 
                 <div className="aspect-video rounded-[1.5rem] overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 relative">
                    <img src={image} alt="Original" className="w-full h-full object-contain" />
                 </div>
                 
                {!result && !processing && (
                    <div className="space-y-4 mt-8">
                      {/* Engine Selector */}
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <button 
                          onClick={() => setUseAI(true)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-widest",
                            useAI ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          <Cloud size={16} />
                          Gemini Cloud
                        </button>
                        <button 
                          onClick={() => setUseAI(false)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-widest",
                            !useAI ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          <Cpu size={16} />
                          Local
                        </button>
                      </div>

                      <button 
                        onClick={handleRemoveBackground}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-indigo-500/40 group relative overflow-hidden"
                      >
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <Sparkles size={20} />
                        Remove Background {useAI ? '' : '(Local)'}
                      </button>
                    </div>
                 )}
              </div>

              {/* Background Removed Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <Check size={12} /> Removed
                    </span>
                    {result && (
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          isEditing ? "bg-white text-black" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        )}
                      >
                        <Palette size={12} className="inline mr-2" />
                        {isEditing ? 'Close Edit' : 'Edit Tools'}
                      </button>
                    )}
                  </div>
                  
                  {result && (
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg">
                      <button onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"><Minus size={14}/></button>
                      <span className="text-[10px] font-mono w-10 text-center font-black text-indigo-500">{Math.round(zoom * 100)}%</span>
                      <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"><Plus size={14}/></button>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-[300px] relative rounded-[1.5rem] overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center transition-all group">
                   {/* Checkerboard for Transparency */}
                   <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 10%, transparent 11%), radial-gradient(#fff 10%, transparent 11%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }}></div>
                   
                   <AnimatePresence mode="wait">
                    {(finalImage || processing || isProcessingManual) ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "relative h-full w-full flex items-center justify-center p-4",
                          isMagicWandActive ? "cursor-crosshair" : "cursor-default"
                        )}
                        style={{ transform: `scale(${zoom})` }}
                      >
                        {(processing || isProcessingManual) ? (
                          <div className="text-center p-12 space-y-6">
                            <div className="relative flex justify-center scale-110">
                               <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                               <RefreshCw className="text-indigo-600 animate-spin relative" size={64} />
                            </div>
                            <div className="max-w-xs mx-auto">
                              <h3 className="text-2xl font-black mb-2 text-white uppercase tracking-tighter">
                                {isProcessingManual ? 'Refining Details...' : 'Magic in Progress'}
                              </h3>
                              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest animate-pulse mb-4">
                                {isProcessingManual ? 'Removing internal pixels' : progressMsg || 'Isolating Object & Refining Edges'}
                              </p>
                              {progressVal > 0 && (
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-indigo-500 transition-all duration-300" 
                                     style={{ width: `${progressVal}%` }}
                                   />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Preview canvas for magic wand picking */}
                            <canvas 
                              ref={previewCanvasRef} 
                              onClick={handlePreviewClick}
                              className={cn(
                                "max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                                isMagicWandActive ? "opacity-100" : "hidden"
                              )}
                            />
                            {/* Final result with background */}
                            {!isMagicWandActive && (
                              <img 
                                src={finalImage!} 
                                alt="Result" 
                                className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                              />
                            )}
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <div className="text-center p-12 opacity-20">
                        <Sparkles size={64} className="text-slate-500 mx-auto mb-4" />
                        <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Waiting for processing</p>
                      </div>
                    )}
                   </AnimatePresence>

                   {/* Customization Drawer */}
                   <AnimatePresence>
                     {isEditing && (
                       <motion.div 
                         initial={{ x: '100%' }}
                         animate={{ x: 0 }}
                         exit={{ x: '100%' }}
                         transition={{ type: 'spring', damping: 20 }}
                         className="absolute inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl p-6 z-10 flex flex-col space-y-8 overflow-y-auto"
                       >
                          <div className="space-y-4">
                             <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">Magic Tools</h4>
                             <div className="space-y-4 text-center">
                                <div className="grid grid-cols-2 gap-2">
                                   <button
                                     onClick={() => {
                                        setIsMagicWandActive(!isMagicWandActive);
                                     }}
                                     className={cn(
                                       "py-4 rounded-xl flex flex-col items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border",
                                       isMagicWandActive 
                                         ? "bg-amber-500 border-amber-400 text-white shadow-lg scale-105" 
                                         : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                     )}
                                   >
                                     <Sparkles size={16} />
                                     <span>{isMagicWandActive ? 'Pick Color' : 'Magic Wand'}</span>
                                   </button>
                                   
                                   <button
                                     onClick={autoRefineLogo}
                                     className="py-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-400 flex flex-col items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all"
                                   >
                                     <RefreshCw size={16} />
                                     <span>Clean Logo</span>
                                   </button>
                                </div>
                                
                                {isMagicWandActive && (
                                  <div className="space-y-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                      <span>Wand Tolerance</span>
                                      <span>{wandTolerance}</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="1" 
                                      max="100" 
                                      value={wandTolerance}
                                      onChange={(e) => setWandTolerance(parseInt(e.target.value))}
                                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <p className="text-[10px] text-amber-400 font-bold leading-tight flex items-center gap-2">
                                      <Sparkles size={12} />
                                      Click on the image to remove similar colors.
                                    </p>
                                  </div>
                                )}

                                <button
                                  onClick={resetRefinements}
                                  className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                  Reset to Official Output
                                </button>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Change Scene</h4>
                             <div className="flex bg-slate-950 p-1 rounded-xl">
                               {(['transparent', 'color', 'image'] as const).map((type) => (
                                 <button
                                   key={type}
                                   onClick={() => setBgType(type)}
                                   className={cn(
                                     "flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all",
                                     bgType === type ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                   )}
                                 >
                                   {type === 'transparent' ? 'Clean' : type}
                                 </button>
                               ))}
                             </div>
                          </div>

                          {bgType === 'color' && (
                             <div className="space-y-4">
                               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Preset Colors</h4>
                               <div className="grid grid-cols-6 gap-2">
                                 {PRESET_COLORS.map(color => (
                                     <button
                                       key={color}
                                       onClick={() => setActiveColor(color)}
                                       className={cn(
                                         "aspect-square rounded-lg border-2 transition-transform active:scale-90 flex items-center justify-center",
                                         activeColor === color ? "border-indigo-500 scale-110" : "border-transparent"
                                       )}
                                       style={{ backgroundColor: color }}
                                     >
                                       {activeColor === color && <Check size={12} className={color === '#ffffff' ? 'text-black' : 'text-white'} />}
                                     </button>
                                 ))}
                               </div>
                               <input 
                                 type="color" 
                                 value={activeColor}
                                 onChange={(e) => setActiveColor(e.target.value)}
                                 className="w-full h-10 bg-slate-950 rounded-lg overflow-hidden cursor-pointer"
                               />
                             </div>
                          )}

                          {bgType === 'image' && (
                             <div className="space-y-4">
                               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Preset Landscapes</h4>
                               <div className="grid grid-cols-2 gap-2">
                                 {PRESET_BGS.map(bg => (
                                     <button
                                       key={bg}
                                       onClick={() => setActiveBg(bg)}
                                       className={cn(
                                         "aspect-video rounded-lg border-2 overflow-hidden transition-all relative group",
                                         activeBg === bg ? "border-indigo-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"
                                       )}
                                     >
                                       <img src={bg} alt="BG Preset" className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Plus size={16} className="text-white" />
                                       </div>
                                     </button>
                                 ))}
                               </div>
                             </div>
                          )}

                          <div className="pt-8 border-t border-slate-800">
                             <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                               Custom backgrounds are applied instantly. Download to save the composite image.
                             </p>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
                
                {result && (
                  <div className="mt-8 grid sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => downloadImage(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-black py-5 px-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border border-slate-700 group h-24"
                    >
                      <div className="flex items-center gap-2">
                         <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                         <span className="text-sm">Download</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-widest opacity-50 font-black">Standard Quality</span>
                    </button>
                    <button 
                      onClick={() => downloadImage(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-xl shadow-indigo-500/20 group h-24"
                    >
                      <div className="flex items-center gap-2">
                         <Sparkles size={20} className="animate-pulse" />
                         <span className="text-sm">Download HD</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-widest opacity-80 font-black">Lossless Production</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats / Features inspired by professional apps */}
            <div className="grid md:grid-cols-4 gap-8 py-12 border-t border-slate-200 dark:border-slate-800 mt-12">
               {[
                 { label: 'Speed', val: '< 5s', desc: 'Average processing time' },
                 { label: 'Edge Detection', val: '99.8%', desc: 'Precision segmentation' },
                 { label: 'Formats', val: 'All', desc: 'JPG, PNG, WEBP, HEIC' },
                 { label: 'Privacy', val: 'Local', desc: 'Your data stays on device' }
               ].map((stat, i) => (
                 <div key={i} className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-indigo-600 mb-1">{stat.val}</p>
                    <p className="text-xs text-slate-500 font-medium">{stat.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
