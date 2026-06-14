import React, { useState, useRef, useEffect } from 'react';
import { UserSquare2, Upload, Download, Grid, Maximize, FileText, Smartphone, LayoutGrid, Check, Trash2, Contrast, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { jsPDF } from 'jspdf';
import { removeBackground } from "@imgly/background-removal";
import { logEvent, LogType } from '@/src/lib/logger';

type PhotoCount = 4 | 6 | 8 | 12;

interface PassportPreset {
  id: string;
  name: string;
  width: number; // in mm
  height: number; // in mm
  label: string;
}

const PRESETS: PassportPreset[] = [
  { id: 'uk_in', name: 'UK / India / EU', width: 35, height: 45, label: '35x45mm' },
  { id: 'us', name: 'USA', width: 51, height: 51, label: '2x2 inch' },
  { id: 'china', name: 'China', width: 33, height: 48, label: '33x48mm' },
];

export default function PassportPhotoTool() {
  const [image, setImage] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreset, setActivePreset] = useState<PassportPreset>(PRESETS[0]);
  const [photoCount, setPhotoCount] = useState<PhotoCount>(8);
  const [bgColor, setBgColor] = useState('white');
  const [singlePhoto, setSinglePhoto] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [smoothness, setSmoothness] = useState(0);
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const interactiveCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const colors = [
    { name: 'white', value: '#ffffff', label: 'White' },
    { name: 'blue', value: '#003399', label: 'Blue' },
    { name: 'gray', value: '#f1f5f9', label: 'Gray' },
    { name: 'red', value: '#e11d48', label: 'Red' },
  ];

  // Keyboard controls for precision
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!image) return;
      const step = e.shiftKey ? 10 : 1;
      
      switch(e.key) {
        case 'ArrowLeft': setOffset(prev => ({ ...prev, x: prev.x - step })); break;
        case 'ArrowRight': setOffset(prev => ({ ...prev, x: prev.x + step })); break;
        case 'ArrowUp': setOffset(prev => ({ ...prev, x: prev.y - step })); break;
        case 'ArrowDown': setOffset(prev => ({ ...prev, x: prev.y + step })); break;
        case '+': case '=': setZoom(prev => Math.min(3, prev + 0.05)); break;
        case '-': case '_': setZoom(prev => Math.max(0.1, prev - 0.05)); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      setProcessedUrl(null);
      const img = new Image();
      img.onload = () => {
        imageObjRef.current = img;
        const targetRatio = activePreset.width / activePreset.height;
        const imgRatio = img.width / img.height;
        let initialZoom = 1;
        
        // Display dimensions (350x450 scale)
        const displayWidth = 350;
        const displayHeight = 450;
        
        if (imgRatio > targetRatio) {
          initialZoom = displayHeight / img.height;
        } else {
          initialZoom = displayWidth / img.width;
        }
        setZoom(initialZoom);
        setOffset({ x: 0, y: 0 });
        setRotate(0);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    setSinglePhoto(null);
  };

  const handleRemoveBackground = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const blob = await removeBackground(image);
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      const img = new Image();
      img.onload = () => {
        imageObjRef.current = img;
        drawCanvas(interactiveCanvasRef.current);
      };
      img.src = url;
    } catch (error) {
      console.error("Background removal failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const drawCanvas = (canvas: HTMLCanvasElement | null, isExport = false) => {
    if (!canvas || !imageObjRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    
    // Scale for display or high-res export
    const scaleFactor = isExport ? 4 : 1; // 4x for professional printing
    const pW = 350 * scaleFactor;
    const pH = 450 * scaleFactor;
    
    const z = zoom * scaleFactor;
    const ox = offset.x * scaleFactor;
    const oy = offset.y * scaleFactor;

    canvas.width = pW;
    canvas.height = pH;

    const colorValue = colors.find(c => c.name === bgColor)?.value || '#ffffff';
    ctx.fillStyle = colorValue;
    ctx.fillRect(0, 0, pW, pH);

    ctx.save();
    
    // Filters + Smoothing logic
    // Smoothing is simulated by a slight blur + contrast boost combo
    const blurAmount = (smoothness / 100) * 2 * scaleFactor;
    let filterString = `brightness(${brightness}%) contrast(${contrast + (smoothness * 0.1)}%) blur(${blurAmount}px)`;
    
    if (filter === 'grayscale') filterString += ' grayscale(100%)';
    if (filter === 'sepia') filterString += ' sepia(50%)';
    
    ctx.filter = filterString;
    
    ctx.translate(pW / 2 + ox, pH / 2 + oy);
    ctx.rotate((rotate * Math.PI) / 180);
    
    const drawWidth = img.width * (z / zoom); 
    const drawHeight = img.height * (z / zoom);
    ctx.drawImage(img, -drawWidth / 2 * zoom, -drawHeight / 2 * zoom, drawWidth * zoom, drawHeight * zoom);
    ctx.restore();

    // Biometric Guides Overlay (Only for preview)
    if (!isExport) {
      ctx.strokeStyle = 'rgba(255, 107, 0, 0.4)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      
      // Vertical Center
      ctx.beginPath();
      ctx.moveTo(pW / 2, 0);
      ctx.lineTo(pW / 2, pH);
      ctx.stroke();

      // Horizontal guides based on active preset proportions
      // Standard: Eye level 35%, Chin 85%
      ctx.beginPath();
      ctx.moveTo(0, pH * 0.35);
      ctx.lineTo(pW, pH * 0.35);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pH * 0.85);
      ctx.lineTo(pW, pH * 0.85);
      ctx.stroke();

      // Head Oval Helper
      ctx.beginPath();
      ctx.ellipse(pW / 2, pH * 0.48, 100, 140, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    if (isExport) {
      const data = canvas.toDataURL('image/jpeg', 0.98);
      setSinglePhoto(data);
      return data;
    }
  };

  const generateSheet = (singleData: string) => {
    const sheetCanvas = document.createElement('canvas');
    const sCtx = sheetCanvas.getContext('2d');
    if (!sCtx) return;

    const pW = 350;
    const pH = 450;
    const margin = 30;
    let cols = 4, rows = 2;
    if (photoCount === 4) { cols = 2; rows = 2; }
    if (photoCount === 6) { cols = 3; rows = 2; }
    if (photoCount === 12) { cols = 4; rows = 3; }

    sheetCanvas.width = (pW * cols) + (margin * (cols + 1));
    sheetCanvas.height = (pH * rows) + (margin * (rows + 1));

    sCtx.fillStyle = 'white';
    sCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    const singleImg = new Image();
    singleImg.onload = () => {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = margin + c * (pW + margin);
          const y = margin + r * (pH + margin);
          sCtx.drawImage(singleImg, x, y, pW, pH);
          
          // Cut marks
          sCtx.strokeStyle = '#e2e8f0';
          sCtx.lineWidth = 1;
          sCtx.setLineDash([5, 5]);
          sCtx.strokeRect(x - 1, y - 1, pW + 2, pH + 2);
        }
      }
      setSheetUrl(sheetCanvas.toDataURL('image/jpeg', 0.95));
    };
    singleImg.src = singleData;
  };

  useEffect(() => {
    drawCanvas(interactiveCanvasRef.current);
    const exportCanvas = document.createElement('canvas');
    const data = drawCanvas(exportCanvas, true);
    if (data) generateSheet(data);
  }, [image, processedUrl, zoom, offset, rotate, bgColor, brightness, contrast, smoothness, filter, activePreset, photoCount]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length === 2) {
      setPinchStartDistance(getDistance(e.touches));
      return;
    }
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length === 2 && pinchStartDistance !== null) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / pinchStartDistance;
      setZoom(prev => Math.max(0.1, Math.min(3, prev * scale)));
      setPinchStartDistance(currentDistance);
      return;
    }
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setPinchStartDistance(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!image) return;
    const delta = e.deltaY;
    setZoom(prev => {
      const newZoom = delta > 0 ? prev - 0.05 : prev + 0.05;
      return Math.max(0.1, Math.min(3, newZoom));
    });
  };

  const getDistance = (touches: React.TouchList) => {
    return Math.sqrt(
      Math.pow(touches[0].clientX - touches[1].clientX, 2) +
      Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
  };

  const download = async (type: 'single' | 'sheet') => {
    const dataUrl = type === 'single' ? singlePhoto : sheetUrl;
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport_${activePreset.id}_${type}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      logEvent({
        type: LogType.PASSPORT_GENERATE,
        tool: 'Passport Photo Maker',
        details: { type, preset: activePreset.name }
      });

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Direct download failed, trying fallback", error);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `passport_${activePreset.id}_${type}.jpg`;
      a.click();
    }
  };

  const downloadPDF = () => {
    if (!sheetUrl) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(sheetUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(sheetUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`passport_sheet_${activePreset.id}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 items-start p-4">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-64 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <UserSquare2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Studio Master</h2>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Professional Tools</p>
            </div>
          </div>

          {!image ? (
            <div className="space-y-4">
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] border-3 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-orange-500 hover:bg-orange-50/50 transition-all text-slate-300 group"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={32} className="group-hover:text-orange-500" />
                </div>
                <span className="text-sm font-bold text-slate-500">Drop or Upload Photo</span>
               </button>
               <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Standard Size</p>
                   <p className="text-xs font-bold">35mm x 45mm</p>
                 </div>
                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">DPI Output</p>
                   <p className="text-xs font-bold">300 PPI Pro</p>
                 </div>
               </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Preset Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                  <span>Photo Dimension</span>
                  <Maximize size={10} />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setActivePreset(p)}
                      className={cn(
                        "flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all gap-1",
                        activePreset.id === p.id 
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                          : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 text-slate-400"
                      )}
                    >
                      <span className="text-[9px] font-black uppercase tracking-tighter">
                        {p.id === 'uk_in' ? 'EU/IN' : p.id.toUpperCase()}
                      </span>
                      <span className="text-[9px] font-bold opacity-60 leading-none">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position & Filters */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tone Filters</span>
                  <div className="flex gap-2">
                    {(['none', 'grayscale', 'sepia'] as const).map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-bold border-2 transition-all capitalize flex-1",
                          filter === f ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" : "border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        {f === 'none' ? 'Natural' : f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Position / Zoom</span>
                    <span className="text-orange-500">{(zoom * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min="0.1" max="2.5" step="0.01" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full accent-orange-500 h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Bright</span>
                    <input type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="w-full accent-orange-500 h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Contrast</span>
                    <input type="range" min="50" max="150" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="w-full accent-orange-500 h-1.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Skin Smoothing</span>
                    <span className="text-orange-500">{smoothness}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={smoothness} onChange={e => setSmoothness(parseInt(e.target.value))} className="w-full accent-orange-500 h-1.5" />
                </div>
              </div>

              {/* AI Tools */}
              <div className="pt-2">
                <button 
                  onClick={handleRemoveBackground}
                  disabled={isProcessing || !!processedUrl}
                  className={cn(
                    "w-full py-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-xs transition-all shadow-sm",
                    isProcessing ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : 
                    processedUrl ? "bg-green-600 border-green-600 text-white shadow-green-600/30" : "bg-slate-900 border-slate-900 text-white hover:bg-black"
                  )}
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isProcessing ? "Backend Processing..." : processedUrl ? "Background Successfully Removed" : "One-Click BG Removal"}
                </button>
              </div>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
        </div>

        {image && (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Studio Background</label>
              <div className="grid grid-cols-4 gap-2.5">
                {colors.map(c => (
                  <button 
                    key={c.name}
                    onClick={() => setBgColor(c.name)}
                    className={cn(
                      "aspect-square rounded-xl border-[3px] transition-all relative group overflow-hidden",
                      bgColor === c.name ? "border-orange-500 shadow-md scale-105" : "border-slate-50 dark:border-slate-800"
                    )}
                  >
                    <div style={{ backgroundColor: c.value }} className="w-full h-full" />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    {bgColor === c.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} className="text-orange-500 bg-white rounded-full p-0.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-4 flex gap-3 text-orange-700 dark:text-orange-400">
               <Grid size={20} className="shrink-0 mt-0.5" />
               <div className="text-[10px] font-bold leading-relaxed">
                 <p className="uppercase tracking-widest mb-1 opacity-60">Pro Tip</p>
                 <p>Use arrow keys for pixel-perfect positioning. Shift + Arrow moves 10px. Scroll to zoom faster.</p>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 w-full space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-8 flex flex-col items-center justify-center min-h-[400px] relative">
          
          {/* Mode Switcher */}
          {image && (
            <div className="absolute top-4 left-0 w-full flex justify-center z-10">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setShowSheet(false)} 
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", !showSheet ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800")}
                >
                  Single View
                </button>
                <button 
                  onClick={() => setShowSheet(true)} 
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", showSheet ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800")}
                >
                  Print Sheet
                </button>
              </div>
            </div>
          )}

          {image ? (
            <div className="w-full flex flex-col items-center">
              {!showSheet ? (
                <div className="relative">
                  <div 
                    className="relative rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden cursor-move touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    onWheel={handleWheel}
                  >
                    <canvas ref={interactiveCanvasRef} className="w-[350px] h-[450px]" />
                  </div>
                  {/* Studio Guides Label */}
                  <div className="absolute -top-10 left-0 w-full text-center">
                    <span className="text-[9px] font-black uppercase text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">Biometric Alignment Mode</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 w-full max-w-2xl flex flex-col items-center">
                   <div className="bg-slate-50 dark:bg-slate-800 p-10 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-inner">
                      <img src={sheetUrl || ''} alt="Print Sheet" className="max-w-full shadow-2xl rounded-sm ring-1 ring-slate-200" />
                   </div>
                   
                   <div className="flex gap-4 items-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 mr-2">Photos Per Sheet:</p>
                      {[4, 6, 8, 12].map(c => (
                        <button 
                          key={c} 
                          onClick={() => setPhotoCount(c as PhotoCount)} 
                          className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", photoCount === c ? "bg-orange-500 text-white" : "bg-white dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600")}
                        >
                          {c}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div className="mt-16 flex flex-col items-center gap-5">
                 <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={() => download(showSheet ? 'sheet' : 'single')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-5 rounded-[2rem] font-bold flex items-center gap-3 transition-all transform hover:scale-[1.03] shadow-xl shadow-orange-600/30 active:scale-95"
                    >
                      <Download size={22} />
                      <span className="text-lg">Download {showSheet ? 'Print Sheet' : 'Passport Photo'}</span>
                    </button>
                    {showSheet && (
                      <button 
                        onClick={downloadPDF}
                        className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 px-8 py-5 rounded-[2rem] font-bold flex items-center gap-3 transition-all shadow-lg"
                      >
                        <FileText size={22} className="text-red-500" />
                        <span className="text-lg">PDF Export</span>
                      </button>
                    )}
                 </div>
                 <div className="flex items-center gap-2 text-slate-400">
                    <Check size={14} className="text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">300 DPI Ultra High Quality JPEG Output</span>
                 </div>
              </div>
            </div>
          ) : (
             <div className="text-center space-y-8">
               <div className="w-40 h-40 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] flex items-center justify-center animate-bounce duration-[3000ms]">
                  <Smartphone className="text-slate-200 dark:text-slate-700" size={80} />
               </div>
               <div className="space-y-2">
                 <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Professional Studio View</h3>
                 <p className="text-slate-500 font-medium max-w-xs mx-auto">Upload a portrait to begin processing and biometric styling.</p>
               </div>
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary px-8 py-3 rounded-2xl font-bold"
               >
                 Get Started
               </button>
             </div>
          )}
        </div>

        {/* Footer Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex gap-5">
             <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center shrink-0">
               <FileText className="text-orange-500" size={24} />
             </div>
             <div>
               <h4 className="font-bold text-base mb-1">Standard Compliance</h4>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">Auto-scaling logic ensures your head size and eye levels match global passport standards for 35mm x 45mm dimensions.</p>
             </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex gap-5">
             <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center shrink-0">
               <Sparkles className="text-orange-500" size={24} />
             </div>
             <div>
               <h4 className="font-bold text-base mb-1">Advanced Retouching</h4>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">Use the "Skin Smoothing" slider to subtly refine textures, giving your passport photo a clean, studio-processed look.</p>
             </div>
          </div>
        </div>
        
        {image && (
          <button 
            onClick={() => { setImage(null); setProcessedUrl(null); setSinglePhoto(null); }}
            className="w-full py-4 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all border border-dashed border-red-200 dark:border-red-900"
          >
            <Trash2 size={14} className="inline mr-2" /> Session Reset: Destroy Current Data
          </button>
        )}
      </div>
    </div>
  );
}


export const LayoutGridIconPlaceholder = () => null; // Cleanup
