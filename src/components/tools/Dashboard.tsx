import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, QrCode, ShieldCheck, Image as ImageIcon, 
  UserSquare2, Download, Palette, ArrowRight, CreditCard, 
  ShieldAlert, Cpu, Package, Users, Star, Film, Smartphone,
  FileArchive, RefreshCcw, Globe, Server, Volume2, Tv
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAppSettings } from '../../hooks/useAppSettings';

interface DashboardProps {
  onSelectTool: (id: any) => void;
}

const stats = [
  { label: 'Total Users', value: '20.4k+' },
  { label: 'Daily Users', value: '5.2k+' },
  { label: 'Uptime', value: '100% Core' },
];

const tools = [
  { id: 'tenmin-ai', icon: Volume2, label: '10Min AI Voice', description: 'Speak anyway, practice Bengali, English, Japanese voice call.', color: 'bg-indigo-600', isNew: true },
  { id: 'qr', icon: QrCode, label: 'QR Tools', description: 'Generate and decode QR codes instantly.', color: 'bg-blue-500' },
  { id: 'encryption', icon: ShieldCheck, label: 'Encryption', description: 'Secure your text with Base64 encoding.', color: 'bg-indigo-500' },
  { id: 'to-base64', icon: ImageIcon, label: 'B64 Converter', description: 'Convert text or files to Base64 string.', color: 'bg-purple-500' },
  { id: 'bg-remover', icon: ImageIcon, label: 'Background Remover', description: 'Professional background removal for any image.', color: 'bg-indigo-600' },
  { id: 'passport', icon: UserSquare2, label: 'Passport Photo', description: 'Create print-ready passport sheets.', color: 'bg-orange-500' },
  { id: 'auto-passport', icon: Star, label: 'Auto Passport', description: 'Automatic passport photo generation.', color: 'bg-amber-500', isNew: true },
  { id: 'design-editor', icon: Palette, label: 'Design Editor', description: 'Create certificates, IDs, and more.', color: 'bg-pink-500' },
  { id: 'video', icon: Download, label: 'Video Downloader', description: 'Download from Social Media platforms.', color: 'bg-red-500' },
  { id: 'lib-encryptor', icon: ShieldAlert, label: 'Lib Encryptor', description: 'Hard AES-256 binary encryption.', color: 'bg-indigo-600' },
  { id: 'dex-protector', icon: Cpu, label: 'DEX Protector', description: 'Binary DEX/APK encryption.', color: 'bg-red-600' },
  { id: 'apk-store', icon: Package, label: 'APK & Account Store', description: 'Premium APKs and Social Accounts.', color: 'bg-blue-600' },
  { id: 'dih-movies', icon: Film, label: 'Dih Movies', description: 'Exclusive Movie Experience by DIH TEMPLATE.', color: 'bg-indigo-600', isNew: true },
  { id: 'bachelor-point', icon: Film, label: 'Bachelor Point S-5', description: 'Manually managed high-fidelity exclusive streaming portal.', color: 'bg-red-600', isNew: true },
  { id: 'mobile-bypass', icon: Smartphone, label: 'Mobile Bypass Pro', description: 'Advanced FRP, MDM and Bootloader bypass utility.', color: 'bg-primary', isNew: true },
  { id: 'migration', icon: FileArchive, label: 'Migration Tool', description: 'Migrate your Replit projects by uploading a ZIP file.', color: 'bg-emerald-500', isNew: true },
  { id: 'hosted-admin', icon: Globe, label: 'DIH TEMPLATE', description: 'Share DIH templates with your favorite person.', color: 'bg-orange-500', isNew: true },
];

export default function Dashboard({ onSelectTool }: DashboardProps) {
  const { settings } = useAppSettings();
  const [liveUsers, setLiveUsers] = useState(() => {
    const base = settings.liveUserBaseValue || 20245;
    const range = settings.liveUserRange || 450;
    const now = Date.now();
    const fiveMin = 300000;
    const seed = Math.floor(now / fiveMin);
    const getSeededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    const variation = Math.floor(getSeededRandom(seed) * (range * 2 + 1)) - range;
    return Math.max(1, base + variation);
  });
  
  const displayStats = [...(settings.dashboardStats || stats)];

  // Live User Counter Logic (Stable for 5-minute blocks)
  useEffect(() => {
    if (!settings.enableLiveUserCounter) return;

    const updateCounter = () => {
      const range = settings.liveUserRange || 450;
      const base = settings.liveUserBaseValue || 20245;
      const now = Date.now();
      const fiveMin = 300000;
      const seed = Math.floor(now / fiveMin);
      
      const getSeededRandom = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };
      
      const variation = Math.floor(getSeededRandom(seed) * (range * 2 + 1)) - range;
      setLiveUsers(Math.max(1, base + variation));
    };

    const interval = setInterval(updateCounter, 30000); // Check every 30s but only changes when time block shifts
    return () => clearInterval(interval);
  }, [settings.enableLiveUserCounter, settings.liveUserBaseValue, settings.liveUserRange]);

  if (settings.enableLiveUserCounter) {
    displayStats.push({ label: 'Live Users', value: liveUsers.toString() });
  }

  const filteredDisplayStats = displayStats.filter(stat => {
    const lbl = stat.label.toLowerCase();
    return !lbl.includes('daily user') && !lbl.includes('uptime') && !lbl.includes('live user');
  });

  const unfilteredVisibleTools = tools.filter(t => {
    return settings.visibleTools.includes(t.id);
  });

  const dihMoviesTool = unfilteredVisibleTools.find(t => t.id === 'dih-movies');
  const bachelorPointTool = unfilteredVisibleTools.find(t => t.id === 'bachelor-point');
  const otherVisibleTools = unfilteredVisibleTools.filter(t => t.id !== 'dih-movies' && t.id !== 'bachelor-point');

  const visibleTools = [
    ...otherVisibleTools,
    ...(dihMoviesTool ? [dihMoviesTool] : []),
    ...(bachelorPointTool ? [bachelorPointTool] : [])
  ];

  return (
    <div className="space-y-6 md:space-y-10 relative px-2 sm:px-0 max-w-7xl mx-auto">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-48 md:w-72 h-48 md:h-72 bg-indigo-500/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <h2 
            className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight relative group/title select-none"
            data-text={`${settings.appName.toUpperCase()}`}
          >
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-500 to-slate-900 dark:from-white dark:via-slate-400 dark:to-white">
              {settings.appName.toUpperCase()}
            </span>
          </h2>
          <p className="text-[10px] md:text-xs font-black tracking-[0.2em] text-primary dark:text-indigo-400 uppercase select-none opacity-80">
            Digital Innovation House Hub
          </p>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-2">
          {filteredDisplayStats.map(stat => {
            const isLive = stat.label.toLowerCase().includes('live');
            return (
              <div key={stat.label} className="flex-1 min-w-[80px] group relative text-center px-3 py-2 md:py-3 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-white/5 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[8px] font-black tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors uppercase mb-0.5 flex items-center justify-center gap-1">
                  {isLive && <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.6)]" />}
                  {stat.label}
                </div>
                <div className="text-base md:text-lg font-black tabular-nums tracking-tighter group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {settings.enableAds && settings.enableManualAds && settings.manualAdImage && (
        <a 
          href={settings.manualAdLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative z-10 w-full mb-6 block group/ad"
        >
          <div className="p-1 px-3 mb-2 flex items-center justify-between">
             <span className="text-[8px] font-black tracking-widest text-emerald-500 uppercase">Premium Partnership</span>
             <div className="flex gap-1">
                <div className="w-1 h-1 bg-emerald-500/20 rounded-full animate-ping" />
             </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-emerald-500/20 bg-slate-900 group-hover/ad:border-emerald-500/40 transition-all duration-500">
             <img 
               src={settings.manualAdImage} 
               alt={settings.manualAdTitle} 
               className="w-full h-auto max-h-[120px] object-cover opacity-80 group-hover/ad:opacity-100 group-hover/ad:scale-105 transition-all duration-700" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
             <div className="absolute bottom-4 left-6">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">{settings.manualAdTitle || 'SPONSOR'}</h4>
             </div>
          </div>
        </a>
      )}

      {settings.enableAds && (settings.adScriptInContent || settings.adScriptInContent2) && (
        <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-4">
           {settings.adScriptInContent && (
             <div className="w-full">
                <div className="p-1 px-3 mb-2 flex items-center justify-between">
                   <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase opacity-50">Promotion Engine I</span>
                </div>
                <div 
                  className="bg-white/5 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl min-h-[100px] flex items-center justify-center p-2"
                  dangerouslySetInnerHTML={{ __html: settings.adScriptInContent }}
                />
             </div>
           )}

           {settings.adScriptInContent2 && (
             <div className="w-full">
                <div className="p-1 px-3 mb-2 flex items-center justify-between">
                   <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase opacity-50">Promotion Engine II</span>
                </div>
                <div 
                  className="bg-white/5 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl min-h-[100px] flex items-center justify-center p-2"
                  dangerouslySetInnerHTML={{ __html: settings.adScriptInContent2 }}
                />
             </div>
           )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 relative z-10">
        {visibleTools.map((tool, idx) => {
          const label = settings.toolLabels?.[tool.id] || tool.label;
          const isDihMovies = tool.id === 'dih-movies';
          const isBachelorPoint = tool.id === 'bachelor-point';

          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03, type: 'spring', damping: 20 }}
              onClick={() => onSelectTool(tool.id)}
              className={cn(
                "group relative flex flex-col items-start p-4 md:p-5 bg-white/80 dark:bg-slate-900/40 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all duration-500 text-left overflow-hidden h-full min-h-[140px] md:min-h-[160px] shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1.5 cursor-pointer",
                isDihMovies && "hover:border-amber-500/50 hover:shadow-amber-500/25 dark:bg-gradient-to-b dark:from-slate-900/40 dark:to-amber-500/[0.02]",
                isBachelorPoint && "hover:border-rose-500/55 hover:shadow-rose-550/25 dark:bg-gradient-to-b dark:from-slate-900/40 dark:to-rose-500/[0.02]",
                settings.disabledTools?.includes(tool.id) && "hover:border-rose-500/40 hover:shadow-rose-500/20",
                settings.upcomingTools?.includes(tool.id) && "hover:border-violet-500/40 hover:shadow-violet-500/20",
                settings.comingSoonTools?.includes(tool.id) && "hover:border-pink-500/40 hover:shadow-pink-500/20",
                settings.enableGlassmorphism && "backdrop-blur-3xl"
              )}
            >
              {/* Premium Inner Radiance */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent", isDihMovies && "via-amber-500/50", isBachelorPoint && "via-rose-500/50")} />
                <div className={cn("absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent", isDihMovies && "via-amber-500/50", isBachelorPoint && "via-rose-500/50")} />
                <div className={cn("absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]", isDihMovies && "bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08),transparent_70%)]", isBachelorPoint && "bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.08),transparent_70%)]")} />
              </div>

              {/* Dynamic Shine Streak */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden rounded-2xl md:rounded-3xl">
                <div className="absolute inset-0 w-[200%] h-full bg-[linear-gradient(115deg,transparent_45%,rgba(255,255,255,0.05)_50%,transparent_55%)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              </div>

              {/* Technical Corner Brackets */}
              <div className={cn("absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 group-hover:-translate-y-1", isDihMovies ? "border-amber-500/20 group-hover:border-amber-400/80" : isBachelorPoint ? "border-rose-500/25 group-hover:border-[#ff2b56]/80" : "border-primary/10 group-hover:border-primary/60")} />
              <div className={cn("absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:translate-y-1", isDihMovies ? "border-amber-500/20 group-hover:border-amber-400/80" : isBachelorPoint ? "border-rose-500/25 group-hover:border-[#ff2b56]/80" : "border-primary/10 group-hover:border-primary/60")} />

              {/* Edge Light Effect */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", isDihMovies ? "from-amber-500/5 via-transparent to-transparent" : isBachelorPoint ? "from-rose-500/5 via-transparent to-transparent" : "from-primary/5 via-transparent to-transparent")} />

              {/* Holographic Overlay on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none hologram z-0" />
              
              {/* Tool Accent Glow */}
              <div className={cn(
                "absolute -right-6 -top-6 w-24 h-24 blur-[50px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-full z-0",
                isDihMovies ? "bg-amber-500" : isBachelorPoint ? "bg-[#ff2b56]" : tool.color
              )} />

              <div className="relative z-10 w-full mb-auto flex flex-col items-start">
                {!isBachelorPoint && (
                  <div className={cn(
                    "w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 shadow-2xl transition-all duration-700 relative ring-3 md:ring-4 ring-white/10 dark:ring-white/5 active:scale-95",
                    isDihMovies
                      ? "bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500 text-slate-950 shadow-amber-500/30 group-hover:scale-110 group-hover:shadow-amber-500/40"
                      : cn(tool.color, "text-white shadow-current/30 group-hover:scale-110 group-hover:shadow-primary/40")
                  )}>
                    <tool.icon size={18} className="md:w-5 md:h-5 group-hover:animate-pulse transition-transform" />
                    {settings.disabledTools?.includes(tool.id) ? (
                      <div className="absolute -top-2 -right-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] px-1.5 py-0.5 rounded-full z-20">
                        <span className="text-[7px] font-black text-white uppercase leading-none tracking-tighter flex items-center gap-0.5">
                          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          OFFLINE
                        </span>
                      </div>
                    ) : settings.upcomingTools?.includes(tool.id) ? (
                      <div className="absolute -top-2 -right-2 bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.6)] px-1.5 py-0.5 rounded-full z-20">
                        <span className="text-[7px] font-black text-white uppercase leading-none tracking-tighter flex items-center gap-0.5">
                          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          ROADMAP
                        </span>
                      </div>
                    ) : settings.comingSoonTools?.includes(tool.id) ? (
                      <div className="absolute -top-2 -right-2 bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)] px-1.5 py-0.5 rounded-full z-20">
                        <span className="text-[7px] font-black text-white uppercase leading-none tracking-tighter flex items-center gap-0.5">
                          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          SOON
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
                
                <h3 className={cn(
                  "font-black text-sm md:text-base mb-1 tracking-tighter transition-all duration-500 group-hover:translate-x-1",
                  isDihMovies
                    ? "text-amber-500 dark:text-amber-400 group-hover:text-amber-400 dark:group-hover:text-amber-300"
                    : isBachelorPoint
                      ? "text-rose-550 dark:text-rose-400 group-hover:text-rose-500 dark:group-hover:text-rose-350"
                      : "text-slate-900 dark:text-white group-hover:text-primary"
                )}>
                  {label.toUpperCase()}
                </h3>
                {!isBachelorPoint && (
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs leading-snug font-medium line-clamp-2 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-500 max-w-[95%]">
                    {settings.toolDescriptions?.[tool.id] || tool.description}
                  </p>
                )}
              </div>
              
              <div className="relative z-10 mt-4 w-full flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5 group-hover:border-primary/20 transition-colors duration-500">
                <div className="flex flex-col">
                  {!isBachelorPoint && (
                    <>
                      <span className={cn(
                        "text-[8px] font-black tracking-[0.3em] uppercase transition-colors duration-500",
                        isDihMovies ? "text-amber-500 group-hover:text-amber-400" : "text-slate-400 group-hover:text-primary"
                      )}>
                        {isDihMovies ? "VIP_PREMIER" : (settings.activeLinkLabel || 'Active_Link')}
                      </span>
                      <div className="flex gap-1 mt-1">
                         {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={cn(
                            "w-1 h-1 rounded-full transition-all duration-500", 
                            i <= (idx % 5 + 1) 
                              ? isDihMovies ? "bg-amber-500 group-hover:scale-125" : "bg-primary group-hover:scale-125"
                              : "bg-slate-200 dark:bg-slate-800"
                          )} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className={cn(
                  "group/btn w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl border flex items-center justify-center transition-all duration-500 shadow-xl shadow-transparent active:scale-90 group-hover:-rotate-3",
                  isDihMovies
                    ? "border-amber-500/30 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-slate-950 group-hover:shadow-amber-500/40"
                    : isBachelorPoint
                      ? "border-rose-500/30 group-hover:bg-[#e5173f] group-hover:border-[#e5173f] group-hover:text-white group-hover:shadow-rose-500/40"
                      : "border-slate-200 dark:border-white/10 group-hover:bg-primary group-hover:border-primary group-hover:text-white group-hover:shadow-primary/40"
                )}>
                  <ArrowRight size={13} className="md:w-4 md:h-4 group-hover/btn:translate-x-1 transition-transform duration-500" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
