import React, { useState, useRef } from 'react';
import { ShieldAlert, ShieldCheck, Upload, Download, Key, FileCode, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CryptoJS from 'crypto-js';
import { cn } from '@/src/lib/utils';
import { logEvent, LogType } from '@/src/lib/logger';

export default function LibEncryptor() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<any>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension !== 'lib' && extension !== 'sp') {
      setError(`Warning: This file has a .${extension} extension. Are you sure it's a Lib/SP file?`);
    } else {
      setError(null);
    }
    
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      // Convert ArrayBuffer to WordArray for CryptoJS to handle binary correctly
      const wordArray = (CryptoJS.lib as any).WordArray.create(arrayBuffer);
      setContent(wordArray);
    };
    reader.readAsArrayBuffer(file);
    
    logEvent({
      type: LogType.FILE_DOWNLOAD,
      tool: 'Lib Encryptor',
      details: { fileName: file.name, size: file.size }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const encryptFile = () => {
    if (!content || !encryptionKey) {
      setError('Please provide both a file and an encryption key.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        // AES-256 Hard Encryption using the WordArray representation
        const encrypted = CryptoJS.AES.encrypt(content as any, encryptionKey);
        
        // Convert the OpenSSL-formatted Base64 result back to raw binary bytes
        // This prevents the 33% size increase caused by Base64 encoding
        const base64String = encrypted.toString();
        const rawWords = CryptoJS.enc.Base64.parse(base64String);
        
        // Helper to convert WordArray to Uint8Array for binary download
        const uint8Array = new Uint8Array(rawWords.sigBytes);
        for (let i = 0; i < rawWords.sigBytes; i++) {
          uint8Array[i] = (rawWords.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }

        setEncryptedData(uint8Array as any);
        setError(null);
      } catch (err) {
        setError('Encryption failed. Check your data and key.');
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  };

  const downloadEncrypted = () => {
    if (!encryptedData) return;
    const blob = new Blob([encryptedData as any], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encrypted_${file?.name || 'file.lib'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500">
            <ShieldAlert size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Hard File Encryptor</h2>
        <p className="text-slate-500 dark:text-slate-400">Military-grade AES-256 encryption for .lib and .sp files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {!file ? (
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "cursor-pointer border-2 border-dashed rounded-[40px] p-12 transition-all flex flex-col items-center justify-center gap-4 text-center min-h-[300px]",
                isDragging 
                  ? "border-indigo-500 bg-indigo-500/5 shadow-inner" 
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                accept="*"
                className="hidden" 
              />
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Upload size={28} />
              </div>
              <div>
                <p className="text-lg font-bold">Select Lib/SP File</p>
                <p className="text-slate-500 text-sm">Dropped files must be .lib or .sp</p>
              </div>
            </motion.div>
          ) : (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <FileCode size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm truncate max-w-[150px]">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setContent(''); setEncryptedData(''); }}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Change File
                </button>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <Key size={10} /> Encryption Key
                </label>
                <input 
                  type="password"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Enter secret passkey..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-black dark:text-black focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <button 
                onClick={encryptFile}
                disabled={isProcessing || !encryptionKey}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                  isProcessing 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20"
                )}
              >
                {isProcessing ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"
                    />
                    Hashing & Sealing...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} /> Hard Encrypt File
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}

            {encryptedData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-indigo-600 rounded-[40px] text-white space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <ShieldCheck size={200} />
                </div>
                
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto scale-110">
                     <Check size={40} className="text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold">Securely Encrypted!</h3>
                    <p className="text-indigo-100 text-sm">Your file is now sealed with AES-256 binary headers.</p>
                  </div>

                  <button 
                    onClick={downloadEncrypted}
                    className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-lg"
                  >
                    <Download size={20} /> Download Sealed File
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full border-2 border-slate-100 dark:border-slate-800 rounded-[40px] flex flex-col items-center justify-center text-slate-400 gap-4 p-12 text-center">
                 <ShieldAlert size={48} className="opacity-10" />
                 <p className="text-sm font-medium">Locked result will appear after processing.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-indigo-600">
          <ShieldCheck size={16} /> Security Assurance
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          This tool uses <strong>Advanced Encryption Standard (AES) with a 256-bit key length</strong>. 
          Processing happens entirely in your browser memory; your file contents and keys are never uploaded to any server. 
          The output is a salt-prefixed ciphertext that is practically impossible to crack without the original key.
        </p>
      </div>
    </div>
  );
}
