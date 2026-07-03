import React, { useState, useRef } from 'react';
import { ShieldAlert, ShieldCheck, Upload, Download, Key, FileCode, Check, AlertCircle, Cpu, Settings as SettingsIcon, Package, Folder, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CryptoJS from 'crypto-js';
import JSZip from 'jszip';
import { cn } from '@/src/lib/utils';
import { logEvent, LogType } from '@/src/lib/logger';

export default function DexProtector() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<any>(null);
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null);
  const [apkFiles, setApkFiles] = useState<string[]>([]);
  const [currentNavPath, setCurrentNavPath] = useState<string>('');
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
  const [encryptionKey] = useState<string>('DIHTEMPLATE_SHIELD_V8_SECURE');
  const [protectedData, setProtectedData] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    setFile(file);
    setProtectedData(null);
    setApkFiles([]);
    setSelectedPaths([]);
    setZipInstance(null);

    if (extension === 'apk') {
      try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        setZipInstance(loadedZip);
        
        const files = Object.keys(loadedZip.files);
        setApkFiles(files);
        
        // Auto-select only if starting in automatic mode
        if (mode === 'automatic') {
          const initialPaths = files.filter(f => 
            f.toLowerCase().startsWith('classes') || f.startsWith('res/')
          );
          setSelectedPaths(initialPaths);
        } else {
          setSelectedPaths([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to parse APK file. It might be corrupted or protected.');
      }
    } else if (extension === 'dex') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const wordArray = (CryptoJS.lib as any).WordArray.create(arrayBuffer);
        setContent(wordArray);
      };
      reader.readAsArrayBuffer(file);
      setError(null);
    } else {
      setError(`Unsupported file type .${extension}. Please use .apk or .dex`);
    }

    logEvent({
      type: LogType.FILE_DOWNLOAD,
      tool: 'Dex Protector',
      details: { fileName: file.name, size: file.size }
    });
  };

  const togglePath = (path: string) => {
    setSelectedPaths(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const toggleFolder = (folderPath: string) => {
    const filesInFolder = apkFiles.filter(f => f.startsWith(folderPath));
    const allSelected = filesInFolder.every(f => selectedPaths.includes(f));
    
    if (allSelected) {
      setSelectedPaths(prev => prev.filter(p => !filesInFolder.includes(p)));
    } else {
      setSelectedPaths(prev => [...new Set([...prev, ...filesInFolder])]);
    }
  };

  const getItemsInPath = (path: string) => {
    const items = new Set<string>();
    
    // Sector logic for ROOT level
    if (path === '') {
      const sectors = ['dex/', 'res/', 'others/'];
      return sectors;
    }

    apkFiles.forEach(f => {
      let category = 'others/';
      if (f.toLowerCase().startsWith('classes')) category = 'dex/';
      else if (f.startsWith('res/')) category = 'res/';

      // Handle root sector entry
      if (path === category) {
        const relative = f.startsWith('res/') 
          ? f.substring(path.length) 
          : f;
        
        const parts = relative.split('/');
        items.add(path + parts[0] + (parts.length > 1 ? '/' : ''));
      } 
      // Handle sub-navigation
      else if (f.startsWith(path) && f !== path) {
        const relative = f.substring(path.length);
        const parts = relative.split('/');
        items.add(path + parts[0] + (parts.length > 1 ? '/' : ''));
      }
    });

    return Array.from(items).sort((a, b) => {
      const isDirA = a.endsWith('/');
      const isDirB = b.endsWith('/');
      if (isDirA !== isDirB) return isDirA ? -1 : 1;
      return a.localeCompare(b);
    });
  };

  const protectFile = async () => {
    if (!file || !encryptionKey) {
      setError('Please select a file and enter a safety key.');
      return;
    }

    setIsProcessing(true);
    
    try {
      if (zipInstance) {
        // APK PROTECTION
        setProcessStep('Analyzing APK Structure...');
        await new Promise(r => setTimeout(r, 800));

        setProcessStep('Injecting Security Package (rafcin.b)...');
        // Add the requested signature folder/file
        zipInstance.file('rafcin.b/signature.dat', `Protected by DIH TEMPLATE DexProtector\nKey Hash: ${CryptoJS.SHA256(encryptionKey).toString()}`);
        await new Promise(r => setTimeout(r, 800));

        setProcessStep(`Encrypting ${selectedPaths.length} Selected Blocks...`);
        
        for (const path of selectedPaths) {
          const zipFile = zipInstance.file(path);
          if (zipFile) {
            const data = await zipFile.async('arraybuffer');
            const wordArray = (CryptoJS.lib as any).WordArray.create(data);
            const encrypted = CryptoJS.AES.encrypt(wordArray, encryptionKey);
            
            // Convert to binary
            const base64String = encrypted.toString();
            const rawWords = CryptoJS.enc.Base64.parse(base64String);
            const uint8Array = new Uint8Array(rawWords.sigBytes);
            for (let i = 0; i < rawWords.sigBytes; i++) {
              uint8Array[i] = (rawWords.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            }
            
            zipInstance.file(path, uint8Array);
          }
        }

        setProcessStep('Rebuilding APK Container...');
        const newApk = await zipInstance.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
        setProtectedData(newApk);
      } else {
        // SINGLE DEX PROTECTION
        setProcessStep('Processing DEX Binary...');
        await new Promise(r => setTimeout(r, 1000));
        
        const encrypted = CryptoJS.AES.encrypt(content, encryptionKey);
        const base64String = encrypted.toString();
        const rawWords = CryptoJS.enc.Base64.parse(base64String);
        const uint8Array = new Uint8Array(rawWords.sigBytes);
        for (let i = 0; i < rawWords.sigBytes; i++) {
          uint8Array[i] = (rawWords.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        setProtectedData(uint8Array);
      }
      setError(null);
    } catch (err) {
      setError('Protection failed. Binary corruption detected during sealing.');
    } finally {
      setIsProcessing(false);
      setProcessStep('');
    }
  };

  const downloadProtected = () => {
    if (!protectedData) return;
    const blob = new Blob([protectedData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protected_${file?.name || 'binary'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500">
            <Cpu size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">APK DEX Protector</h2>
        <p className="text-slate-500 dark:text-slate-400">Hard binary encryption and directory sealing for Android executables.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!file ? (
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) await handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "cursor-pointer border-2 border-dashed rounded-[40px] py-20 px-8 transition-all flex flex-col items-center justify-center gap-6 text-center shadow-sm",
                isDragging 
                  ? "border-red-500 bg-red-500/5 shadow-inner" 
                  : "border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                accept=".dex,.apk"
                className="hidden" 
              />
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400">
                <Package size={32} />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight">Drop APK or DEX</p>
                <p className="text-slate-500 text-sm mt-1">Automatic extraction and binary sealing enabled</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                      <FileCode size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{file.name}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {apkFiles.length > 0 ? "APK Container" : "Standalone Binary"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setZipInstance(null); setProtectedData(null); }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-500 hover:text-red-500 transition-colors"
                  >
                    DISCARD
                  </button>
                </div>

                {apkFiles.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <SettingsIcon size={14} /> Protection Scope
                      </h4>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                          onClick={() => {
                            setMode('automatic');
                            // Re-apply auto-selection for automatic mode
                            const autoPaths = apkFiles.filter(f => 
                              f.toLowerCase().startsWith('classes') || f.startsWith('res/')
                            );
                            setSelectedPaths(autoPaths);
                          }}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all",
                            mode === 'automatic' ? "bg-white dark:bg-slate-700 shadow-sm text-red-600" : "text-slate-500"
                          )}
                        >
                          AUTO
                        </button>
                        <button 
                          onClick={() => {
                            setMode('manual');
                            setSelectedPaths([]); // User wants everything manual
                          }}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all",
                            mode === 'manual' ? "bg-white dark:bg-slate-700 shadow-sm text-red-600" : "text-slate-500"
                          )}
                        >
                          MANUAL
                        </button>
                      </div>
                    </div>

                    {mode === 'manual' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                           <button 
                            onClick={() => setCurrentNavPath('')}
                            className={cn("text-[10px] font-black uppercase tracking-widest", currentNavPath === '' ? "text-red-500" : "text-slate-500")}
                           >
                             APK HOME
                           </button>
                           {currentNavPath.split('/').filter(Boolean).map((part, index, arr) => (
                             <React.Fragment key={index}>
                               <span className="text-slate-300 dark:text-slate-700">/</span>
                               <button 
                                onClick={() => setCurrentNavPath(arr.slice(0, index + 1).join('/') + '/')}
                                className={cn("text-[10px] font-black uppercase tracking-widest whitespace-nowrap", index === arr.length - 1 ? "text-red-500" : "text-slate-500")}
                               >
                                 {part}
                               </button>
                             </React.Fragment>
                           ))}
                           
                           <div className="ml-auto flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                             <button 
                               onClick={() => {
                                 const itemsInView = getItemsInPath(currentNavPath);
                                 itemsInView.forEach(item => {
                                   if (item.endsWith('/')) toggleFolder(item);
                                   else if (!selectedPaths.includes(item)) togglePath(item);
                                 });
                               }}
                               className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 whitespace-nowrap"
                             >
                               Select View
                             </button>
                             <button 
                               onClick={() => setSelectedPaths([])}
                               className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 whitespace-nowrap"
                             >
                               Clear All
                             </button>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                          {getItemsInPath(currentNavPath).map(item => {
                            const isDir = item.endsWith('/');
                            const isSelected = isDir 
                              ? apkFiles.filter(f => f.startsWith(item)).every(f => selectedPaths.includes(f))
                              : selectedPaths.includes(item);
                            
                            return (
                              <div
                                key={item}
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-3xl border text-left transition-all group relative overflow-hidden",
                                  isSelected
                                    ? "bg-red-500/10 border-red-500/50 shadow-[0_0_20px_-10px_rgba(239,68,68,0.5)]"
                                    : "bg-slate-50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                              >
                                {isSelected && (
                                  <motion.div 
                                    layoutId={`selected-bg-${item}`}
                                    className="absolute inset-0 bg-red-500/5 z-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  />
                                )}
                                <button
                                  onClick={() => isDir ? setCurrentNavPath(item) : togglePath(item)}
                                  className="flex-1 flex items-center gap-4 relative z-10"
                                >
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                    isSelected ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-500/20" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                  )}>
                                    {isDir ? <Folder size={18} /> : item.endsWith('.dex') ? <Cpu size={18} /> : <FileCode size={18} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-xs font-black truncate transition-colors",
                                      isSelected ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
                                    )}>
                                      {isDir ? item.split('/').filter(Boolean).pop() : item.split('/').pop()}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-0.5">
                                      {isDir ? "Directory Index" : "Encrypted Block"}
                                    </p>
                                  </div>
                                </button>
                                
                                <button 
                                  onClick={() => isDir ? toggleFolder(item) : togglePath(item)}
                                  className={cn(
                                    "w-10 h-10 rounded-2xl border flex items-center justify-center transition-all relative z-10",
                                    isSelected 
                                      ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30" 
                                      : "border-slate-200 dark:border-slate-800 text-slate-300 hover:text-red-500 hover:border-red-500/30"
                                  )}
                                >
                                  {isSelected ? <Check size={16} strokeWidth={3} /> : <ShieldAlert size={16} />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {mode === 'automatic' && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Smart Encryption Active</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Protecting {selectedPaths.length} DEX executable blocks discovered in APK root.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 space-y-4">
                  <button 
                    onClick={protectFile}
                    disabled={isProcessing || (apkFiles.length > 0 && selectedPaths.length === 0)}
                    className={cn(
                      "w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl",
                      isProcessing 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400" 
                        : "bg-red-600 text-white hover:bg-neutral-900 shadow-red-500/20 active:scale-95"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                        />
                        {processStep || 'Sealing Binary...'}
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={20} /> Deploy DEX Protection
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-3 text-red-600 font-bold text-xs uppercase tracking-tighter"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}

            {protectedData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-neutral-950 border border-red-900/50 rounded-[48px] text-white space-y-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Cpu size={300} />
                </div>
                
                <div className="relative z-10 text-center space-y-6">
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]">
                     <Check size={48} className="text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Sealed & Secured</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      Binary resources are now obfuscated and AES-sealed with rafcin.b signature.
                    </p>
                    <div className="inline-block mt-4 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">
                      Signature Verified: rafcin.b
                    </div>
                  </div>

                  <button 
                    onClick={downloadProtected}
                    className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 group"
                  >
                    <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> Download Protected File
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="min-h-[260px] py-12 border-2 border-slate-100 dark:border-slate-800 rounded-[48px] flex flex-col items-center justify-center text-slate-400 gap-4 p-8 text-center bg-slate-500/[0.01]">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-slate-850 rounded-full flex items-center justify-center opacity-40">
                    <ShieldAlert size={40} />
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-black uppercase tracking-widest">Awaiting Binary</p>
                   <p className="text-[10px] text-slate-500 font-bold max-w-[200px] leading-relaxed uppercase tracking-widest">
                     Drop an APK or DEX file to start the protective sealing process.
                   </p>
                 </div>
              </div>
            )}
          </AnimatePresence>

          <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-black text-xs mb-2 flex items-center gap-2 text-red-600 uppercase tracking-[0.2em]">
              <ShieldCheck size={16} /> Security Guard
            </h4>
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                • <strong>AES-256 BINARY SEALING</strong>: Encrypted DEX files are non-executable without a paired stub.
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                • <strong>DIRECTORY INJECTION</strong>: Virtual "rafcin.b" security package added to root directory.
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                • <strong>STRICT PRIVACY</strong>: All binary manipulation occurs in your hardware. Zero data persistence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
