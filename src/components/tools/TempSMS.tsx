import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Signal, Smartphone, MessageSquare, Clock, RefreshCcw, Copy, CheckCircle2, Search, ChevronRight, XCircle, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Types for Simulation
interface SMSMessage {
  id: string;
  from: string;
  text: string;
  code: string;
  timestamp: Date;
}

interface VirtualNumber {
  id: string;
  number: string;
  country: string;
  countryCode: string;
}

const COUNTRIES = [
  { id: 'bd', name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { id: 'usa', name: 'USA', code: '+1', flag: '🇺🇸' },
  { id: 'uk', name: 'UK', code: '+44', flag: '🇬🇧' },
  { id: 'in', name: 'India', code: '+91', flag: '🇮🇳' },
  { id: 'ca', name: 'Canada', code: '+1', flag: '🇨🇦' },
  { id: 'de', name: 'Germany', code: '+49', flag: '🇩🇪' },
];

const SERVICES = [
  'Telegram', 'Google', 'WhatsApp', 'Discord', 'Facebook', 'TikTok', 'Instagram', 'OpenAI', 'Amazon', 'PayPal'
];

export default function TempSMS() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [availableNumbers, setAvailableNumbers] = useState<VirtualNumber[]>([]);
  const [activeNumber, setActiveNumber] = useState<VirtualNumber | null>(null);
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const refreshTimeout = useRef<any>(null);

  // Generate numbers when country changes
  useEffect(() => {
    generateNumbers();
  }, [selectedCountry]);

  // Simulated Message Stream with random intervals
  useEffect(() => {
    const scheduleNextMessage = () => {
      const delay = Math.floor(Math.random() * (25000 - 15000 + 1)) + 15000; // 15-25 seconds
      refreshTimeout.current = setTimeout(() => {
        generateNewMessage();
        scheduleNextMessage();
      }, delay);
    };

    if (activeNumber) {
      scheduleNextMessage();
    } else {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    }
    
    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [activeNumber]);

  const generateNumbers = () => {
    const numbers: VirtualNumber[] = Array.from({ length: 12 }, (_, i) => {
      const suffix = Math.floor(10000000 + Math.random() * 90000000).toString();
      return {
        id: `num-${i}-${selectedCountry.id}`,
        number: `${selectedCountry.code} 1${suffix.substring(0, 3)} ${suffix.substring(3, 7)}`,
        country: selectedCountry.name,
        countryCode: selectedCountry.code
      };
    });
    setAvailableNumbers(numbers);
  };

  const createFakeMessage = () => {
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const code = Math.floor(100000 + Math.random() * 899999).toString();
    return {
      id: Math.random().toString(36).substring(7),
      from: service,
      text: `Your ${service} verification code is: ${code}. Do not share this with anyone.`,
      code: code,
      timestamp: new Date()
    };
  };

  const generateNewMessage = () => {
    const newMessage = createFakeMessage();
    setMessages(prev => [newMessage, ...prev].slice(0, 8));
  };

  const selectNumber = (num: VirtualNumber) => {
    setIsOrdering(true);
    setTimeout(() => {
      setActiveNumber(num);
      
      // Generate 1-2 initial messages immediately for realism
      const initialCount = Math.random() > 0.5 ? 2 : 1;
      const initialMessages = Array.from({ length: initialCount }, () => createFakeMessage());
      
      setMessages(initialMessages);
      setIsOrdering(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearInbox = () => {
    setMessages([]);
  };

  const deactivateLine = () => {
    setActiveNumber(null);
    setMessages([]);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-slate-400 to-primary animate-gradient-x">
            VIRTUAL SMS HUB
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">
             Dahhub Satellite Verification System // Simulated V1
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
          <ShieldCheck size={16} className="text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Encrypted Uplink Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {activeNumber ? (
              /* Active Line Dashboard */
              <motion.div
                key="active-line"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative overflow-hidden rounded-[2rem] bg-slate-900 border border-primary/30 shadow-2xl shadow-primary/10 p-8"
              >
                {/* Status Bar */}
                <div className="absolute top-0 right-0 p-6 flex items-center gap-3">
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Line Operational</span>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-10">
                   <div className="relative">
                      <div className="w-32 h-32 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative z-10 overflow-hidden group">
                         <Smartphone size={48} className="group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                   </div>

                   <div className="flex-1 text-center md:text-left">
                      <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                        <Zap size={12} className="text-primary" /> Active Virtual Frequency
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                         <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-mono leading-none">
                            {activeNumber.number}
                         </h3>
                         <button 
                            onClick={() => copyToClipboard(activeNumber.number)}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all hover:scale-110 active:scale-90"
                         >
                            {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} className="text-zinc-400" />}
                         </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                         <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                            {activeNumber.country} Agent
                         </span>
                         <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} /> Live Sync
                         </span>
                      </div>
                   </div>
                </div>

                {/* Inbox Section */}
                <div className="mt-12 pt-10 border-t border-white/5">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="text-lg font-black tracking-tight flex items-center gap-3">
                         <div className="p-2 bg-primary/20 rounded-lg">
                            <MessageSquare size={18} className="text-primary" />
                         </div>
                         Decrypted Incoming Streams
                      </h4>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={clearInbox}
                          className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                          title="Clear Inbox"
                        >
                          <Trash2 size={16} />
                        </button>
                        <RefreshCcw size={16} className="text-zinc-500 animate-spin" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {messages.length > 0 ? (
                          messages.map((msg) => (
                            <motion.div 
                              key={msg.id}
                              layout
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-primary/20 rounded-[1.5rem] p-6 relative transition-all duration-300"
                            >
                               <div className="absolute top-0 right-0 p-4">
                                  <button 
                                    onClick={() => copyToClipboard(msg.code)}
                                    className="px-5 py-2 bg-primary text-white text-[10px] font-black rounded-xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 active:scale-95"
                                  >
                                     COPY OTP
                                  </button>
                               </div>
                               <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-primary">
                                    {msg.from[0]}
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">{msg.from} Verification</p>
                                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{msg.timestamp.toLocaleTimeString()}</p>
                                  </div>
                               </div>
                               <h5 className="text-3xl font-black tracking-tighter mb-2 text-white font-mono">{msg.code}</h5>
                               <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-md">{msg.text}</p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="py-20 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-zinc-600 space-y-4">
                             <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center animate-pulse">
                                <RefreshCcw size={32} />
                             </div>
                             <div className="text-center">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1">Scanning Satellite Bands...</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Estimated intercept time: 10-30s</p>
                             </div>
                          </div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex gap-4">
                   <button 
                     onClick={deactivateLine}
                     className="flex-1 py-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:border-red-500/30 flex items-center justify-center gap-2"
                   >
                      <XCircle size={14} /> Release Frequency
                   </button>
                </div>
              </motion.div>
            ) : (
              /* Selection Interface */
              <motion.div
                key="selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Configuration Bar */}
                <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_60%)]" />
                   
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:scale-110 transition-all duration-700">
                         <Globe size={40} className="animate-pulse" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">Global Gateway</p>
                         <h4 className="text-2xl font-black tracking-tight text-white uppercase">{selectedCountry.name} Core</h4>
                      </div>
                   </div>

                   <div className="flex flex-col items-end gap-3 w-full md:w-auto relative z-10">
                      <div className="relative w-full md:w-72">
                        <select 
                          value={selectedCountry.id}
                          onChange={(e) => {
                            const country = COUNTRIES.find(c => c.id === e.target.value);
                            if (country) setSelectedCountry(country);
                          }}
                          className="w-full bg-black/60 border border-white/10 rounded-[1.5rem] py-5 px-8 text-sm font-black text-white hover:border-primary/50 transition-all cursor-pointer appearance-none uppercase tracking-widest shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                           {COUNTRIES.map(c => (
                             <option key={c.id} value={c.id}>{c.flag} {c.name.toUpperCase()}</option>
                           ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                           <ChevronRight size={20} className="rotate-90" />
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-extrabold tracking-[0.2em] uppercase">Satellite Link Optimal</span>
                   </div>
                </div>

                {/* Number Grid */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-black tracking-[0.3em] text-zinc-400 uppercase">Available Frequencies</h3>
                      <div className="text-[10px] font-black text-primary uppercase">12 Nodes Detected</div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableNumbers.map((num) => (
                        <button
                          key={num.id}
                          onClick={() => selectNumber(num)}
                          className="group relative overflow-hidden bg-white/[0.02] hover:bg-primary/[0.08] border border-white/5 hover:border-primary/40 rounded-3xl p-6 transition-all duration-300 text-left active:scale-95"
                        >
                           <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-zinc-500 group-hover:text-primary transition-colors">
                                 <Smartphone size={16} />
                              </div>
                              <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
                           </div>
                           <h5 className="text-xl font-bold font-mono text-zinc-300 group-hover:text-white transition-colors mb-1">
                             {num.number}
                           </h5>
                           <p className="text-[10px] font-black text-zinc-600 group-hover:text-primary/60 uppercase tracking-widest transition-colors">
                             Virtual Node // Online
                           </p>
                        </button>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info/Stats Panel */}
        <div className="lg:col-span-4 space-y-6">
           {/* Terminal Output */}
           <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Signal size={24} />
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active Link</span>
                 </div>
              </div>

              <h5 className="text-[10px] font-black tracking-[0.3em] mb-4 uppercase text-zinc-500">System Diagnostics</h5>
              <div className="space-y-4">
                 {[
                   { label: 'Uplink Power', val: '99.4%', color: 'bg-emerald-500' },
                   { label: 'Packet Integrity', val: '100%', color: 'bg-primary' },
                   { label: 'Network Latency', val: '14ms', color: 'bg-emerald-500' },
                 ].map((stat, i) => (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                         <span>{stat.label}</span>
                         <span className="text-white">{stat.val}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className={cn("h-full rounded-full shadow-[0_0_8px]", stat.color)} style={{ width: stat.val }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Guidelines */}
           <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-6">
              <h5 className="text-xs font-black tracking-[0.2em] uppercase border-b border-white/5 pb-4 text-zinc-400">Security Protocols</h5>
              <div className="space-y-5">
                 {[
                   { icon: ShieldCheck, title: 'Identity Shield', desc: 'All virtual frequencies are isolated and untraceable.' },
                   { icon: Trash2, title: 'Auto-Purge', desc: 'Messages and logs are wiped permanently upon frequency release.' },
                   { icon: Zap, title: 'Instant Sync', desc: 'Near-zero latency on message decryption from global networks.' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500">
                         <item.icon size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{item.title}</p>
                         <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Full Screen Loading Overlay */}
      <AnimatePresence>
        {isOrdering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <div className="text-center space-y-6">
               <div className="relative">
                  <RefreshCcw size={64} className="text-primary animate-spin" />
                  <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
               </div>
               <div>
                  <p className="text-xl font-black tracking-[0.4em] text-white uppercase italic">Allocating Node</p>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">Securing Satellite Handshake...</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
