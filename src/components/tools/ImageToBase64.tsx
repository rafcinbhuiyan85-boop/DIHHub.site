import React, { useState, useRef } from 'react';
import { Image, Copy, Check, Upload, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { logEvent, LogType } from '@/src/lib/logger';

export default function ImageToBase64() {
  const [mode, setMode] = useState<'img2b64' | 'b642img'>('img2b64');
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      setBase64(result);
      logEvent({
        type: LogType.PAGE_VIEW,
        tool: 'Image to Base64',
        details: { fileName: file.name, fileSize: file.size }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const copyToClipboard = () => {
    if (!base64) return;
    navigator.clipboard.writeText(base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([base64], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-base64.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    if (!base64) return;
    const a = document.createElement('a');
    a.href = base64;
    a.download = 'decoded-image.png';
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Base64 Converter</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Convert images to Base64 strings or decode strings back to images.</p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button 
            onClick={() => { setMode('img2b64'); setImage(null); setBase64(''); }}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              mode === 'img2b64' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500"
            )}
          >
            Image to Base64
          </button>
          <button 
            onClick={() => { setMode('b642img'); setImage(null); setBase64(''); }}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              mode === 'b642img' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500"
            )}
          >
            Base64 to Image
          </button>
        </div>
      </div>

      {mode === 'img2b64' ? (
        <>
          {!image ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-4",
                isDragging 
                  ? "border-blue-500 bg-blue-500/5" 
                  : "border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                accept="image/*"
                className="hidden" 
              />
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">Drop your image here</p>
                <p className="text-slate-500 mt-1 text-xs font-medium">PNG, JPG, SVG or WEBP</p>
              </div>
              <div className="px-5 py-2 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-500/20">
                Select File
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Preview</span>
                  <button 
                    onClick={() => { setImage(null); setBase64(''); }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="relative h-[200px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <img src={image} alt="Preview" className="max-w-full max-h-full object-contain p-4" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Base64 Output</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={downloadText}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                        title="Download as TXT"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={copyToClipboard}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                          copied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                      >
                        {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy String</>}
                      </button>
                    </div>
                  </div>
                  <textarea 
                    readOnly
                    value={base64}
                    className="w-full h-[180px] bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-200 p-4 rounded-2xl font-mono font-bold text-[10px] break-all border-none focus:ring-0 resize-none"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Paste Base64 Here</span>
              {base64 && (
                <button 
                  onClick={() => setBase64('')}
                  className="text-[10px] font-bold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <textarea 
              value={base64}
              onChange={(e) => setBase64(e.target.value)}
              placeholder="data:image/png;base64,..."
              className="w-full h-[180px] bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-200 p-4 rounded-2xl font-mono text-[10px] break-all border-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Image Result</span>
              {base64 && (
                <button 
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} /> Save Image
                </button>
              )}
            </div>
            <div className="relative h-[180px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              {base64 ? (
                <img 
                  src={base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`} 
                  alt="Decoded result" 
                  className="max-w-full max-h-full object-contain shadow-2xl p-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center space-y-2 text-slate-400">
                  <Image size={48} className="mx-auto opacity-20" />
                  <p className="text-xs font-medium">Decoded image will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      
      <p className="text-[10px] text-slate-500 italic text-center p-4 border-t border-slate-100 dark:border-slate-800">
        Tip: Always ensure your Base64 string includes the data prefix (e.g., data:image/png;base64,) for best results.
      </p>
    </div>
  );
}
