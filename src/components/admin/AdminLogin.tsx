import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rafcin.b' && password === '201347') {
      onLogin();
    } else {
      setError('ACCESS DENIED: INVALID TEMPLATE OPERATOR CREDENTIALS');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Structural Framing Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 25 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/[0.06] relative z-10 overflow-hidden"
      >
        {/* Decorative thin top line glow */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            {/* Pulsing ring aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
            
            <div className="relative w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
              <Cpu size={24} className="group-hover:rotate-90 transition-transform duration-700" />
            </div>
          </div>
          
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase glow-sm mb-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
            SECURE ACCESS GATEWAY
          </span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase text-center">
            Operator Console
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mt-1">
            Restricted Central Administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
              Terminal Identifier
            </label>
            <div className="relative group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors pointer-events-none">
                <User size={16} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 text-white border border-white/[0.05] group-hover/input:border-white/[0.1] rounded-2xl text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600 shadow-inner"
                placeholder="Enter operator code (e.g. username)"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
              Security Override Passkey
            </label>
            <div className="relative group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-rose-400 transition-colors pointer-events-none">
                <Lock size={16} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 text-white border border-white/[0.05] group-hover/input:border-white/[0.1] rounded-2xl text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-mono placeholder-slate-600 shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0 animate-ping" />
              <p className="text-rose-400 text-[9px] font-black uppercase tracking-wider leading-snug">
                {error}
              </p>
            </motion.div>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full relative group/btn overflow-hidden rounded-2xl p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-[0.98] transition-transform duration-100"
            >
              {/* Animated Border Line Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-500 group-hover/btn:opacity-100 opacity-70" />
              
              <div className="relative bg-slate-950 hover:bg-slate-900 transition-colors py-3.5 px-4 rounded-[15px] flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                  Authorize operator
                </span>
              </div>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-slate-600 text-[8px] font-mono tracking-widest uppercase flex items-center justify-center gap-1">
            <span>TERMINAL CONNECTION</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            <span className="text-emerald-500">ONLINE</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
