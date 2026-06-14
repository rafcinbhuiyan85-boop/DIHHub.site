import React, { useState, useRef } from 'react';
import { Upload, FileArchive, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const Migration = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.zip')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a .zip file from your Replit project.');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(10);

    const formData = new FormData();
    formData.append('project', file);

    try {
      // Simulate progress since fetch doesn't support progress out of the box easily without XHR
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);

      const response = await fetch('/api/admin/migration/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        setStatus('success');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-white font-sans selection:bg-amber-500 selection:text-black">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-12 text-slate-500 hover:text-white transition-colors uppercase italic font-black text-xs tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to App
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
            Project <span className="text-amber-500">ZIP</span> Uploader
          </h1>
          <p className="text-slate-400 font-medium">
            Upload your Replit project ZIP file (without <code className="bg-white/10 px-2 py-0.5 rounded text-amber-500 text-sm">node_modules</code>) and I'll read the source code.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase italic text-amber-500 flex items-center gap-2">
                  <div className="w-6 h-1 bg-amber-500 rounded-full" />
                  Before uploading:
                </h2>
                <ul className="space-y-4 text-slate-300 font-medium">
                  <li className="flex gap-3">
                    <span className="text-amber-500 font-black italic">1.</span>
                    Open your old Replit project
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-500 font-black italic">2.</span>
                    Delete the <code className="bg-white/10 px-1.5 rounded text-xs text-amber-500">node_modules</code> folder first
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-500 font-black italic">3.</span>
                    Download the project as ZIP (3 dots menu → Download as ZIP)
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-500 font-black italic">4.</span>
                    Upload that ZIP here — max size 500MB
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {status === 'idle' || status === 'error' ? (
                    <motion.div 
                      key="upload-ui"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full"
                    >
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`aspect-video w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group ${
                          error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept=".zip"
                        />
                        {file ? (
                          <>
                            <div className="p-4 bg-amber-500 text-black rounded-2xl shadow-xl">
                              <FileArchive size={32} />
                            </div>
                            <div className="text-center px-4">
                              <p className="font-black uppercase italic tracking-wider truncate max-w-[200px]">{file.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-white/10 text-white rounded-2xl group-hover:bg-amber-500 group-hover:text-black transition-all">
                              <Upload size={32} />
                            </div>
                            <div className="text-center">
                              <p className="font-black uppercase italic tracking-wider">Drag & drop your ZIP file here</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">or click to browse</p>
                            </div>
                          </>
                        )}
                      </div>

                      {error && (
                        <p className="text-red-400 text-xs font-bold uppercase mt-4 flex items-center gap-2">
                          <AlertCircle size={14} /> {error}
                        </p>
                      )}

                      <button 
                        disabled={!file}
                        onClick={handleUpload}
                        className={`w-full mt-6 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${
                          file 
                            ? 'bg-amber-500 text-black shadow-2xl shadow-amber-500/20 active:scale-95' 
                            : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                        }`}
                      >
                        Start Uploading
                      </button>
                    </motion.div>
                  ) : status === 'uploading' ? (
                    <motion.div 
                      key="uploading-ui"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full space-y-8 py-12"
                    >
                      <div className="relative h-48 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 size={80} className="text-amber-500 animate-spin opacity-20" />
                        </div>
                        <div className="text-6xl font-black italic tracking-tighter text-amber-500">
                          {progress}%
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                          />
                        </div>
                        <p className="text-center font-black uppercase italic text-xs tracking-widest text-slate-500">
                          Uploading & processing your project...
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="success-ui"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full py-12 text-center space-y-6"
                    >
                      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                        <CheckCircle2 size={48} className="text-green-500" />
                      </div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tight">Upload Complete!</h3>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto">
                        Your project has been securely uploaded. Just tell me in the chat "read my uploaded project" and I'll explore the files.
                      </p>
                      <button 
                        onClick={() => navigate('/')}
                        className="px-12 py-5 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all border border-white/10"
                      >
                        Return Home
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                Data is stored in a temporary container. No persistent external storage used.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Migration;
