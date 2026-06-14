import React from 'react';
import { ShieldAlert, ArrowLeft, AlertTriangle, Clock, Rocket, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface UnderMaintenanceProps {
  toolName: string;
  customNotice?: string;
  onBack: () => void;
  statusType?: 'offline' | 'upcoming' | 'coming-soon';
}

export default function UnderMaintenance({ toolName, customNotice, onBack, statusType = 'offline' }: UnderMaintenanceProps) {
  let badgeText = "MAINTENANCE ACTIVE";
  let titleText = `${toolName} is currently offline`;
  let finalNotice = customNotice;
  let statusBadge = "Scheduled system updates in progress";
  
  let iconColor = "text-rose-500 border-rose-500/20 bg-rose-500/10 shadow-rose-500/5 hover:border-rose-500/20";
  let pingRingColor = "border-rose-500/30";
  let glowColor = "bg-rose-500/10";
  let Icon = AlertTriangle;

  if (statusType === 'upcoming') {
    badgeText = "IN ROADMAP";
    titleText = `${toolName} is under development`;
    finalNotice = customNotice || "This utility is in our development roadmap. We are actively writing code and preparing initial features for a future release.";
    statusBadge = "Planned Release Plan";
    iconColor = "text-indigo-500 border-indigo-500/20 bg-indigo-500/10 shadow-indigo-500/5 hover:border-indigo-500/20";
    pingRingColor = "border-indigo-500/30";
    glowColor = "bg-indigo-500/10";
    Icon = Sparkles;
  } else if (statusType === 'coming-soon') {
    badgeText = "COMING SOON";
    titleText = `${toolName} will be ready soon`;
    finalNotice = customNotice || "This module is undergoing final manual checks and system setup. We're getting it polished and ready for you.";
    statusBadge = "Final Testing & Polishing";
    iconColor = "text-pink-500 border-pink-500/20 bg-pink-500/10 shadow-pink-500/5 hover:border-pink-500/20";
    pingRingColor = "border-pink-500/30";
    glowColor = "bg-pink-500/10";
    Icon = Rocket;
  } else {
    finalNotice = customNotice || "This tool is undergoing maintenance to improve performance and reliability. It will be back online shortly.";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 ${glowColor} rounded-full blur-[80px] md:blur-[120px] pointer-events-none`} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={`max-w-md w-full bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 md:p-8 text-center space-y-6 relative z-10 shadow-2xl transition-all duration-500`}
      >
        {/* Warning Badge Container */}
        <div className={`relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner group mb-2 ${iconColor}`}>
          <Icon size={28} className="animate-pulse" />
          {/* Pulsing rings */}
          <div className={`absolute inset-0 rounded-2xl border-2 animate-ping opacity-75 scale-105 pointer-events-none ${pingRingColor}`} />
        </div>

        <div className="space-y-2">
          <span className={`text-[9px] font-black tracking-[0.25em] uppercase px-2 py-1 rounded-full border ${statusType === 'upcoming' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : statusType === 'coming-soon' ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
            {badgeText}
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase pt-1">
            {titleText}
          </h2>
        </div>

        {/* Custom Admin Notice Area */}
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed px-2 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-2xl">
          "{finalNotice}"
        </p>

        {/* Details Footer */}
        <div className="text-[10px] font-sans font-medium text-slate-400 dark:text-slate-500 tracking-wider flex items-center justify-center gap-1.5">
          <Clock size={12} className="opacity-75" /> {statusBadge}
        </div>

        {/* Back navigation */}
        <div className="pt-2">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-100 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 hover:translate-x-[-2px] active:scale-95 shadow-md shadow-black/10"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
