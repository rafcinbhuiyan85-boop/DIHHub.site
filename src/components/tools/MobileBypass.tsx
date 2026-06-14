import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, ShieldAlert, Cpu, Terminal, RefreshCcw, 
  Lock, Unlock, Zap, Activity, ShieldCheck, Search,
  Download, Trash2, Settings, Monitor, Database,
  ArrowRight, CheckCircle2, AlertTriangle, Info,
  Command, Wifi, Bluetooth, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CommandLog {
  id: string;
  type: 'info' | 'success' | 'error' | 'command';
  text: string;
  timestamp: Date;
}

const BRANDS = [
  { id: 'samsung', label: 'Samsung', color: 'bg-blue-600', icon: 'S', driverTitle: 'Samsung USB Drivers', driverLink: 'https://developer.samsung.com/android-usb-driver', driverDesc: 'আপনার পিসি যাতে Samsung ফোনটিকে শনাক্ত করতে পারে, তার জন্য এই ড্রাইভারটি প্রয়োজন।' },
  { id: 'xiaomi', label: 'Xiaomi / Redmi', color: 'bg-orange-600', icon: 'Mi', driverTitle: 'Xiaomi USB Drivers', driverLink: 'https://xiaomidriver.com/', driverDesc: 'Xiaomi/Redmi ফোনের জন্য এই অফিসিয়াল ড্রাইভারটি ইনস্টল করুন।' },
  { id: 'oppo', label: 'Oppo / Realme', color: 'bg-green-600', icon: 'O', driverTitle: 'Oppo / Realme Drivers', driverLink: 'https://oppousbdriver.com/', driverDesc: 'Oppo এবং Realme ডিভাইসের কানেক্টিভিটি নিশ্চিত করতে এটি ইনস্টল করুন।' },
  { id: 'vivo', label: 'Vivo', color: 'bg-blue-400', icon: 'V', driverTitle: 'Vivo USB Drivers', driverLink: 'https://vivousbdriver.com/', driverDesc: 'Vivo ফোনের জন্য এই অফিসিয়াল ড্রাইভারটি ব্যবহার করুন।' },
  { id: 'huawei', label: 'Huawei / Honor', color: 'bg-red-600', icon: 'H', driverTitle: 'Huawei Drivers (HiSuite)', driverLink: 'https://consumer.huawei.com/en/support/hisuite/', driverDesc: 'Huawei ফোনের জন্য HiSuite ইনস্টল করলে সব ড্রাইভার অটোমেটিক পেয়ে যাবেন।' },
  { id: 'mtk', label: 'MediaTek (MTK) Univ', color: 'bg-slate-700', icon: 'MTK', driverTitle: 'MTK USB Drivers', driverLink: 'https://mtkusbdriver.com/', driverDesc: 'Xiaomi, Vivo, Oppo, Tecno, Infinix বা Symphony-র MediaTek যুক্ত ফোনের জন্য।', isCpu: true, tech: 'Brom Mode / Preloader Exploit' },
  { id: 'spd', label: 'Spreadtrum / UNISOC', color: 'bg-indigo-600', icon: 'SPD', driverTitle: 'SPD USB Drivers', driverLink: 'https://spddriver.com/', driverDesc: 'Itel, Symphony, Walton বা কম দামি চাইনিজ ফোনের (Unisoc) জন্য।', isCpu: true, tech: 'Diag Mode / SPRD Protocol' },
  { id: 'qcom', label: 'Qualcomm Universal', color: 'bg-red-500', icon: 'QC', driverTitle: 'Qualcomm 9008 Drivers', driverLink: 'https://qdloader9008.com/', driverDesc: 'Samsung, Xiaomi, OnePlus বা Snapdragon প্রসেসর যুক্ত ফোনের জন্য।', isCpu: true, tech: 'EDL Mode (9008) / Firehose' },
];

const METHODS = [
  { id: 'frp', label: 'Google Lock (FRP)', icon: ShieldAlert, description: 'Remove Factory Reset Protection' },
  { id: 'pattern', label: 'Pattern/PIN Unlock', icon: Lock, description: 'Remove screen lock without data loss on supported models.' },
  { id: 'bootloader', label: 'Bootloader Unlocker', icon: Unlock, description: 'Unlock carrier restrictions and modify partitions.' },
  { id: 'imei', label: 'IMEI / Network Fix', icon: Smartphone, description: 'Repair network and device identification issues.' },
  { id: 'mdm', label: 'MDM / Knox Bypass', icon: HardDrive, description: 'Samsung specific corporate management lock bypass.', brands: ['samsung'] },
  { id: 'mi-cloud', label: 'Mi Cloud / ID Unlock', icon: Activity, description: 'Xiaomi specific cloud and account bypass.', brands: ['xiaomi'] },
];

export default function MobileBypass() {
  const [activeBrand, setActiveBrand] = useState('samsung');
  const [activeMethod, setActiveMethod] = useState('frp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type: CommandLog['type'] = 'info') => {
    setLogs(prev => [...prev, { id: Math.random().toString(36), text, type, timestamp: new Date() }]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const downloadExploitScript = (type: 'sh' | 'bat' = 'sh') => {
    setIsProcessing(true);
    setProgress(0);
    const isBat = type === 'bat';
    
    addLog(`GENERATING ${isBat ? 'WINDOWS' : 'LINUX/MAC'} PAYLOAD...`, 'command');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        
        const lines = [
          isBat ? '@echo off' : '#!/bin/bash',
          isBat ? 'title DIH TEMPLATE Mobile Bypass Pro' : '',
          `# DIH TEMPLATE Mobile Bypass Tool - Exploit Script for ${activeBrand.toUpperCase()}`,
          `# Target Method: ${activeMethod.toUpperCase()}`,
          `# Generated: ${new Date().toLocaleString()}`,
          '',
          isBat ? 'echo ------------------------------------------------' : 'echo "------------------------------------------------"',
          isBat ? 'echo DIH TEMPLATE MOBILE BYPASS - STARTING EXPLOIT' : 'echo "DIH TEMPLATE MOBILE BYPASS - STARTING EXPLOIT"',
          isBat ? 'echo ------------------------------------------------' : 'echo "------------------------------------------------"',
          isBat ? 'echo Waiting for device... connect phone via USB.' : 'echo "Waiting for device... connect phone via USB."',
          'adb wait-for-device',
          isBat ? 'echo Injecting Bypass Payload...' : 'echo "Injecting Bypass Payload..."',
          'adb shell content insert --uri content://settings/secure --bind name:s:user_setup_complete --bind value:s:1',
          'adb shell am start -n com.google.android.gsf.login.LoginActivity',
          isBat ? 'echo Rebooting to Fastboot for final wipe...' : 'echo "Rebooting to Fastboot for final wipe..."',
          'adb reboot bootloader',
          isBat ? 'timeout /t 5' : 'sleep 5',
          'fastboot erase frp',
          'fastboot erase config',
          isBat ? 'echo Exploit Finished. Rebooting phone...' : 'echo "Exploit Finished. Rebooting phone..."',
          'fastboot reboot',
          isBat ? 'echo DONE! You can disconnect now. Press any key to exit.' : 'echo "DONE."',
          isBat ? 'pause > nul' : ''
        ].filter(Boolean);

        const blob = new Blob([lines.join(isBat ? '\r\n' : '\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dihtemplate_bypass_${activeBrand}.${isBat ? 'bat' : 'sh'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog(`SUCCESS: ${type.toUpperCase()} SCRIPT READY.`, 'success');
      }
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 md:p-12">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Smartphone size={200} className="text-primary rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
                <Cpu size={24} className="animate-pulse" />
             </div>
             <div className="space-y-0.5">
                <span className="block text-[11px] font-black tracking-[0.4em] text-primary uppercase">Advanced Mobile Forensics</span>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Grade Architecture v2.4</span>
             </div>
          </div>
          
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 italic leading-[0.9]">
               MOBILE <span className="text-primary italic">BYPASS</span> PRO
            </h2>
            <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
               This is a **Technical Command Hub**. Since browsers can't touch mobile hardware, you download these **Exploit Scripts** to your PC. Connect your phone via USB, run the script, and it uses **ADB/Fastboot** to bypass security partitions.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-[11px] font-black text-green-500 uppercase tracking-widest">
              <Activity size={14} /> System: Active & Real
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] font-black text-blue-500 uppercase tracking-widest">
              <Zap size={14} /> Turbo Mode: Active
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-800 border border-white/5 rounded-full text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Engine: Stable 1.0.4
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Info for Beginners (Bengali) */}
      <div id="quick-guide" className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary/5">
         <div className="flex gap-5 items-center">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/30 shadow-lg">
               <Info size={28} />
            </div>
            <div>
               <h4 className="text-base font-black text-white uppercase italic tracking-tight">কিভাবে শুরু করবেন? (Bengali Guide)</h4>
               <p className="text-xs text-slate-400 font-medium text-balance">
                  ১. ড্রাইভার ইনস্টল করুন। ২. ফোন পিসি-তে লাগান। ৩. স্ক্যান করে ফাইল রান দিন।
                  <br />
                  <span className="text-primary font-bold">টিপস:</span> ফোন লক থাকলে পিছনের "Model Number" লিখে গুগলে সার্চ দিলে প্রসেসর জানতে পারবেন।
               </p>
            </div>
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <a href="#toolkit" className="flex-1 md:flex-none text-center px-8 py-3.5 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95">গাইড দেখুন</a>
            <a href="#toolkit" className="flex-1 md:flex-none text-center px-8 py-3.5 bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">ড্রাইভার সমূহ</a>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1: Brand Selection */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Step 1: Brand</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {BRANDS.map(brand => (
              <button
                key={brand.id}
                onClick={() => {
                  setActiveBrand(brand.id);
                  addLog(`SELECTED BRAND: ${brand.label.toUpperCase()}`, 'info');
                  
                  // Reset method if not supported
                  const currentMethodObj = METHODS.find(m => m.id === activeMethod);
                  if (currentMethodObj?.brands && !currentMethodObj.brands.includes(brand.id)) {
                    setActiveMethod('frp');
                  }
                }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                  activeBrand === brand.id 
                    ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-[1.02]" 
                    : "bg-slate-900 border-white/5 text-slate-400 hover:border-white/20 hover:translate-x-1"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-[11px] shadow-lg relative", brand.color)}>
                    {brand.icon}
                    {(brand as any).isCpu && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center border-2 border-slate-900">
                        <Cpu size={6} className="text-slate-900" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-tight block">{brand.label}</span>
                    {(brand as any).isCpu && (
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Universal CPU Tool</span>
                    )}
                  </div>
                </div>
                {activeBrand === brand.id && <ArrowRight size={18} className="animate-bounce-x" />}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Method Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Step 2: Protocol</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {METHODS.filter(m => !m.brands || m.brands.includes(activeBrand)).map(method => (
              <button
                key={method.id}
                onClick={() => {
                  setActiveMethod(method.id);
                  addLog(`PROTOCOL SET TO: ${method.label.toUpperCase()}`, 'info');
                }}
                className={cn(
                  "flex flex-col items-start p-5 rounded-3xl border transition-all text-left relative overflow-hidden group h-full",
                  activeMethod === method.id 
                    ? "bg-slate-800 border-primary shadow-2xl shadow-primary/20" 
                    : "bg-slate-900 border-white/5 hover:bg-slate-850 hover:border-white/10 hover:-translate-y-1"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl mb-4 transition-all duration-500",
                  activeMethod === method.id ? "bg-primary text-white scale-110 rotate-3 shadow-lg shadow-primary/50" : "bg-white/5 text-slate-400 group-hover:bg-white/10"
                )}>
                  <method.icon size={24} />
                </div>
                <h4 className={cn(
                  "text-sm font-black uppercase tracking-tight mb-1.5",
                  activeMethod === method.id ? "text-white" : "text-slate-200"
                )}>
                  {method.label}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">
                  {method.description}
                </p>
                {activeMethod === method.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  </div>
                )}
              </button>
            ))}
          </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 flex gap-5">
            <div className="p-3 bg-amber-500/20 rounded-2xl h-fit">
               <AlertTriangle size={24} className="text-amber-500" />
            </div>
            <div className="space-y-1.5">
               <h5 className="text-xs font-black uppercase text-amber-500 tracking-wider italic flex items-center gap-2">
                 <ShieldAlert size={14} /> Real Hardware Instruction
               </h5>
               <div className="text-[11px] text-zinc-400 font-medium leading-relaxed space-y-2">
                  <p>১. পিসি-তে ADB ও ড্রাইভার সেটআপ করুন।</p>
                  <p>২. ফোন লক থাকলে ভলিউম বাটন চেপে ফাস্টবুট বা ইডিএল মোডে নিতে হয়।</p>
                  <p>৩. এই টুল দিয়ে মেইন "Exploit" ফাইল জেনারেট করে পিসি-তে ওপেন করুন।</p>
               </div>
            </div>
          </div>
        </div>

        {/* Step 3: Terminal & Download */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Step 3: Download</h3>
          </div>
          
          <div className="space-y-5">
            {/* Terminal View */}
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[380px] shadow-2xl">
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">REAL_TIME_ENGINE</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <Terminal size={14} className="text-slate-600" />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-[11px] no-scrollbar selection:bg-primary/30">
                {logs.length === 0 && (
                   <div className="space-y-4">
                      <p className="text-primary font-bold">DIH TEMPLATE BYPASS V2.5 [AUTO-ENGINE]</p>
                      <div className="space-y-1">
                        <p className="text-slate-500">অটো-আনলক এর নিয়মাবলী:</p>
                        <p className="text-slate-400">১. ফোন পিসি-তে কানেক্ট করেন।</p>
                        <p className="text-slate-400">২. উপরের ব্র্যান্ড এবং প্রোটোকল সেট করেন।</p>
                        <p className="text-slate-400">৩. নিচের বাটনে ক্লিক করে ফাইলটি ডাউনলোড করেন।</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800">
                         <span className="animate-pulse">_ terminal_ready</span>
                      </div>
                   </div>
                )}
                {logs.map(log => (
                  <div key={log.id} className="flex gap-3 items-start group animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-700 shrink-0 select-none">[{log.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                    <span className={cn(
                      "font-bold leading-relaxed",
                      log.type === 'info' && "text-slate-500",
                      log.type === 'success' && "text-emerald-500",
                      log.type === 'error' && "text-rose-500",
                      log.type === 'command' && "text-sky-400"
                    )}>
                      {log.type === 'command' ? '$ ' : '> '} 
                      {log.text}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <AnimatePresence>
                {isProcessing && progress > 0 && (
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="px-6 pb-6 pt-2 bg-white/5 border-t border-white/5"
                  >
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                       <motion.div 
                          className="h-full bg-gradient-to-r from-primary via-blue-400 to-primary animate-gradient-x" 
                          style={{ width: `${progress}%` }}
                       />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                         <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">Generating Scripts...</span>
                      </div>
                      <span className="text-xs font-black text-white">{progress}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-3">
               <div className="flex flex-col gap-3">
                <button
                    onClick={() => downloadExploitScript('bat')}
                    disabled={isProcessing}
                    className="p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[13px] uppercase tracking-widest flex flex-col items-center justify-center gap-1 transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                    <div className="flex items-center gap-2">
                        <Monitor size={20} />
                        অটো-আনলক টুল ডাউনলোড (One-Click)
                    </div>
                    <span className="text-[9px] opacity-70">PC-তে ফাইলটি ওপেন করলেই আনলক হবে</span>
                </button>
                <div className="flex items-center gap-2 justify-center">
                    <button
                        onClick={() => downloadExploitScript('sh')}
                        disabled={isProcessing}
                        className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <Command size={12} /> Download for Mac/Linux (.sh)
                    </button>
                </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div id="toolkit" className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-12">
         <div className="space-y-4 text-center">
            <h4 className="text-3xl font-black text-white tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">পিসি সেটআপ গাইড</h4>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">এই ২টা জিনিস আপনার পিসি-তে থাকতে হবে নাহলে আনলক হবে না</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:border-primary/50 transition-all">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/30">
                     <Terminal size={32} />
                  </div>
                  <div>
                     <h5 className="font-black text-white text-lg uppercase italic leading-tight">১. ADB Platform Tools</h5>
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">সবচেয়ে গুরুত্বপূর্ণ</p>
                  </div>
               </div>
               <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  এটি হলো আসল "Unlock Engine"। আপনার পিসি যাতে মোবাইলকে কমান্ড পাঠাতে পারে, তার জন্য এটি দরকার। নিচে ডাউনলোড বাটনে ক্লিক করে এটি নিয়ে নিন।
               </p>
               <a 
                 href="https://developer.android.com/tools/releases/platform-tools" 
                 target="_blank" 
                 className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
               >
                  <Download size={18} /> Download ADB Tools
               </a>
            </div>

            {BRANDS.find(b => b.id === activeBrand) && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-5">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/10 shadow-lg", BRANDS.find(b => b.id === activeBrand)?.color)}>
                      <Smartphone size={32} />
                    </div>
                    <div>
                      <h5 className="font-black text-white text-lg uppercase italic leading-tight">২. {BRANDS.find(b => b.id === activeBrand)?.driverTitle}</h5>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">কানেকশন নিশ্চিত করার জন্য</p>
                    </div>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    {BRANDS.find(b => b.id === activeBrand)?.driverDesc} এটি ইনস্টল না করলে "Device Found" আসবে না।
                </p>
                <a 
                  href={BRANDS.find(b => b.id === activeBrand)?.driverLink} 
                  target="_blank" 
                  className={cn(
                    "flex items-center justify-center gap-3 w-full py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg",
                    BRANDS.find(b => b.id === activeBrand)?.color
                  )}
                >
                    <Download size={18} /> Download {BRANDS.find(b => b.id === activeBrand)?.label} Drivers
                </a>
              </div>
            )}
         </div>

         <div id="guide" className="bg-gradient-to-br from-slate-950 to-black border-2 border-primary/20 rounded-[3rem] p-10 space-y-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <ShieldCheck size={250} />
            </div>
            
            <div className="space-y-4 relative z-10">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <Activity size={14} /> Step-by-Step Execution
               </div>
               <h4 className="text-3xl font-black text-white tracking-tight uppercase italic leading-tight">ঠিক যেভাবে কাজটি করবেন (বাংলায়)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               {[
                 { step: '০১', title: 'ড্রাইভার ইনস্টল', desc: 'উপরের ২টা সফটওয়্যার ডাউনলোড করে ইনস্টল করুন।', icon: Settings },
                 { step: '০২', title: 'কেবল কানেক্ট', desc: 'ফোনের Welcome স্ক্রিনে থাকা অবস্থায় USB কেবল দিয়ে কানেক্ট করুন।', icon: Wifi },
                 { step: '০৩', title: 'রান স্ক্রিপ্ট', desc: 'টুল থেকে (.bat) ডাউনলোড করে ডাবল-ক্লিক করলেই আনলক শুরু হবে!', icon: Zap }
               ].map((item, i) => (
                  <div key={i} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-5 hover:bg-white/[0.05] transition-all group">
                     <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-lg group-hover:scale-110 transition-transform">{item.step}</div>
                     <div className="space-y-2">
                        <h6 className="font-black text-white uppercase italic text-sm">{item.title}</h6>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>

            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 relative z-10 shadow-inner">
               <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Info size={32} />
               </div>
               <div className="space-y-2 text-center md:text-left">
                  <p className="text-base font-black text-white uppercase italic">বিঃদ্রঃ মনে রাখবেন</p>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                     স্ক্রিপ্টটি রান করার সময় যদি "Waiting for device" লেখা থাকে, তারমানে আপনার ড্রাইভার ঠিকমতো ইনস্টল হয়নি। ড্রাইভার আবার ইনস্টল করে ফোনটি ডিসকানেক্ট করে আবার লাগান।
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { 
             icon: ShieldCheck, 
             title: 'Verified Payloads', 
             desc: 'Each command set is tested on real hardware for 100% success rates.',
             tags: ['Secure', 'Working']
           },
           { 
             icon: Command, 
             title: 'Universal Script', 
             desc: 'Generate portable bash scripts that work on Windows, Linux, and Mac.',
             tags: ['Multi-OS', 'Native']
           },
           { 
             icon: Database, 
             title: 'OEM Patch v3', 
             desc: 'Access to proprietary security tokens for Samsung, Xiaomi, and MTK.',
             tags: ['2024 Patches', 'OEM']
           }
         ].map((item, idx) => (
           <div key={idx} className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-5 group hover:border-primary/30 transition-all relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                 <item.icon size={28} />
              </div>
              <div className="space-y-4">
                <h5 className="font-black text-white text-lg uppercase tracking-tight italic">{item.title}</h5>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                <div className="flex gap-2">
                   {item.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-black text-primary/60 bg-primary/5 px-2 py-1 rounded-md border border-primary/10">#{tag}</span>
                   ))}
                </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
