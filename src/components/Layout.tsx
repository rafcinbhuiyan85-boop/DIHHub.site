import React, { useState, useEffect } from 'react';
import { Sun, Moon, LayoutDashboard, QrCode, ShieldCheck, Image as ImageIcon, UserSquare2, Download, Palette, Menu, X, ShieldAlert, Cpu, ShieldAlert as Lock, Package, Film, Mail, MessageSquare, Scissors, Star, Users, Smartphone, RefreshCcw, Globe, Server, Instagram, User, LogIn, LogOut, Volume2, Tv, Cat, Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppSettings } from '@/src/hooks/useAppSettings';
import DihLogo from './DihLogo';

type ToolId = 'dashboard' | 'qr' | 'encryption' | 'to-base64' | 'bg-remover' | 'video' | 'admin-login' | 'admin-panel' | 'lib-encryptor' | 'dex-protector' | 'apk-store' | 'dih-movies' | 'bachelor-point' | 'mobile-bypass' | 'hosted-admin' | 'dih-smm';

interface LayoutProps {
  children: React.ReactNode;
  activeTool: string;
  setActiveTool: (id: any) => void;
  currentUser?: any;
  onAuthClick?: () => void;
  onLogout?: () => void;
}

const navItems = [
  { id: 'dashboard' as ToolId, icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'qr' as ToolId, icon: QrCode, label: 'QR Code Tools' },
  { id: 'encryption' as ToolId, icon: ShieldCheck, label: 'Secure Encryption' },
  { id: 'to-base64' as ToolId, icon: ImageIcon, label: 'Base64 Converter' },
  { id: 'bg-remover' as ToolId, icon: ImageIcon, label: 'Background Remover' },
  { id: 'video' as ToolId, icon: Download, label: 'Video Downloader' },
  { id: 'dex-protector' as ToolId, icon: Cpu, label: 'DEX Protector' },
  { id: 'lib-encryptor' as ToolId, icon: Lock, label: 'Lib Protector' },
  { id: 'apk-store' as ToolId, icon: Package, label: 'APK Store' },
  { id: 'dih-movies' as ToolId, icon: Film, label: 'Dih Movies' },
  { id: 'bachelor-point' as ToolId, icon: Film, label: 'Bachelor Point S-5' },
  { id: 'mobile-bypass' as ToolId, icon: Smartphone, label: 'Mobile Bypass' },
  { id: 'hosted-admin' as ToolId, icon: Globe, label: 'DIH Templates' },
  { id: 'dih-smm' as ToolId, icon: Flame, label: 'DIH SMM' },
];

declare global {
  interface Window {
    DesiPayBD: {
      init: (config: any) => void;
      showModal: (options: any) => void;
      initPayment: (options: any) => void;
    };
  }
}

export default function Layout({ 
  children, 
  activeTool, 
  setActiveTool, 
  currentUser, 
  onAuthClick, 
  onLogout 
}: LayoutProps) {
  const { settings } = useAppSettings();
  const isDarkMode = true;
  const setIsDarkMode = (val?: any) => {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [currentMovieSector, setCurrentMovieSector] = useState<'movie' | 'tv' | 'anime'>(() => {
    const saved = localStorage.getItem('dih_movies_sector');
    return (saved === 'movie' || saved === 'tv' || saved === 'anime') ? (saved as any) : 'movie';
  });

  useEffect(() => {
    const syncSector = () => {
      const saved = localStorage.getItem('dih_movies_sector');
      if (saved === 'movie' || saved === 'tv' || saved === 'anime') {
        setCurrentMovieSector(saved as any);
      }
    };
    window.addEventListener('dih-movies-sector-changed', syncSector);
    return () => {
      window.removeEventListener('dih-movies-sector-changed', syncSector);
    };
  }, []);

  const changeSector = (sect: 'movie' | 'tv' | 'anime') => {
    localStorage.setItem('dih_movies_sector', sect);
    setCurrentMovieSector(sect);
    window.dispatchEvent(new Event('dih-movies-sector-changed'));
  };

  const handleLogoClick = () => {
    if (logoClicks >= 4) {
      setActiveTool('admin-login');
      setLogoClicks(0);
    } else {
      setLogoClicks(prev => prev + 1);
    }
  };

  // Check if we are in a "Full Screen" mode or page
  const isGalleryPage = typeof window !== 'undefined' && (window.location.pathname === '/templates' || window.location.pathname === '/admin/templates');
  const isLandingPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/rb/');
  const isFullScreenMode = isGalleryPage || isLandingPage;
  const shouldHideSidebar = isFullScreenMode || activeTool === 'admin-panel' || activeTool === 'admin-login';

  useEffect(() => {
    if (shouldHideSidebar || window.innerWidth < 768) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [shouldHideSidebar, activeTool]);

  useEffect(() => {
    // Apply dynamic colors
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    }
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    }
  }, [settings.primaryColor, settings.accentColor]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Sync balance if user logged in
  const [balance, setBalance] = useState<number>(0);
  
  useEffect(() => {
    if (currentUser?.id) {
      const fetchBalance = async () => {
        try {
          const r = await fetch(`/api/auth/me/${currentUser.id}`);
          const d = await r.json();
          if (d.balance !== undefined) {
             setBalance(d.balance);
             // Update localStorage to keep it in sync
             const updatedUser = { ...currentUser, balance: d.balance };
             localStorage.setItem('dihhub_user', JSON.stringify(updatedUser));
          }
        } catch (e) {}
      };
      fetchBalance();
      const interval = setInterval(fetchBalance, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleAddFunds = () => {
    if (window.DesiPayBD && currentUser) {
      window.DesiPayBD.showModal({
        userEmail: currentUser.email,
        userName: currentUser.name,
        userId: currentUser.id
      });
    }
  };

  const unfilteredNavItems = settings.visibleTools
    .map(id => navItems.find(i => i.id === id))
    .filter((item): item is typeof navItems[0] => !!item && item.id !== 'dashboard');

  const dihMoviesNavItem = unfilteredNavItems.find(i => i.id === 'dih-movies');
  const bachelorPointNavItem = unfilteredNavItems.find(i => i.id === 'bachelor-point');
  const isBachelorPointThemed = bachelorPointNavItem && settings.bachelorEnableColorTheme !== false;
  const otherNavItems = unfilteredNavItems.filter(i => i.id !== 'dih-movies' && (isBachelorPointThemed ? i.id !== 'bachelor-point' : true));

  const filteredNavItems = [
    navItems.find(i => i.id === 'dashboard')!,
    ...otherNavItems,
    ...(dihMoviesNavItem ? [dihMoviesNavItem] : []),
    ...(isBachelorPointThemed ? [bachelorPointNavItem] : [])
  ];

  return (
    <div className="min-h-screen flex text-slate-100 selection:bg-primary/30 overflow-x-hidden relative">
      {/* Premium Infrastructure Layers */}
      <div className="fixed inset-0 bg-[#02040a] -z-50" />
      
      {/* Subtle Depth Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(59,130,246,0.05),transparent_80%)] -z-45" />

      {/* Atmospheric Glows */}
      <div className="fixed inset-0 -z-40 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[160px] animate-pulse delay-1000" />
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[55] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
           />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[60] w-56 bg-slate-950/80 border-r border-white/5 transition-all duration-500 md:translate-x-0 group overflow-hidden shadow-2xl",
        (shouldHideSidebar || !isSidebarOpen) ? "-translate-x-full md:-translate-x-full" : "translate-x-0",
        (shouldHideSidebar || !isSidebarOpen) && "md:w-0",
        settings.enableGlassmorphism && "backdrop-blur-3xl",
        settings.showScanlines && "scanlines"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
        <div className="flex flex-col h-full relative z-20">
          <div className="px-4 py-4 flex items-center justify-between">
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-2 group/logo cursor-pointer py-1 select-none"
              title="Double click or tap multiple times for terminal configuration"
            >
              <DihLogo small={true} className="flex-shrink-0 transition-transform duration-500 group-hover/logo:scale-105" />
              <div className="flex flex-col justify-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] font-black uppercase tracking-[0.12em] text-[11px] leading-tight">
                  {settings.appName.toUpperCase()}
                </span>
                <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 tracking-[0.05em] uppercase leading-none mt-0.5 group-hover/logo:text-amber-400 transition-colors">
                  INNOVATION HOUSE
                </span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all hover:scale-110 active:scale-95">
              <X size={28} />
            </button>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
            <div className="px-3 mb-1">
              <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">{settings.sidebarSystemCoreLabel || 'System Core'}</p>
            </div>
            {/* Navigation Items */}
            {filteredNavItems.map((item) => {
              const label = settings.toolLabels?.[item.id] || item.label;
              const isActive = activeTool === item.id;
              const isDisabled = settings.disabledTools?.includes(item.id);
              const isDihMovies = item.id === 'dih-movies';
              const isBachelorPoint = item.id === 'bachelor-point';
              const isDihSmm = item.id === 'dih-smm';
              const isBachelorPointThemedItem = isBachelorPoint && settings.bachelorEnableColorTheme !== false;
              const isStreamingTool = isDihMovies || isBachelorPointThemedItem;

              return (
                <React.Fragment key={item.id}>
                  {isDihMovies && (
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[9px] font-black tracking-[0.2em] text-amber-500 dark:text-amber-400 uppercase flex items-center gap-1.5 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        PREMIER CINEMA
                      </p>
                    </div>
                  )}

                  {isBachelorPointThemedItem && (
                    <div className="px-3 pt-4 pb-1 mt-2">
                      <p className={cn(
                        "text-[9px] font-black tracking-[0.2em] uppercase flex items-center gap-1.5 select-none",
                        "text-rose-500 dark:text-rose-400"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          "bg-rose-500 shadow-[0_0_8px_rgba(229,23,63,0.6)]"
                        )} />
                        BANGLA COMEDY
                      </p>
                    </div>
                  )}

                  {isDihSmm && (
                    <div className="px-3 pt-4 pb-1 mt-2">
                      <p className={cn(
                        "text-[9px] font-black tracking-[0.2em] uppercase flex items-center gap-1.5 select-none",
                        settings.smmEnableColorTheme !== false
                          ? "text-violet-500 dark:text-violet-400"
                          : "text-slate-500 dark:text-slate-400"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          settings.smmEnableColorTheme !== false
                            ? "bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.6)]"
                            : "bg-slate-500/80 shadow-none"
                        )} />
                        {settings.smmEnableColorTheme !== false ? "PREMIUM PANEL" : "SMM PANEL"}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveTool(item.id);
                      if (isDihMovies) {
                        changeSector('movie');
                      }
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all relative group/item",
                      isDihMovies
                        ? isActive
                          ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-[1.01]"
                          : "text-amber-700 dark:text-amber-300/90 hover:text-amber-600 dark:hover:text-amber-200 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/5 dark:hover:bg-amber-500/15 border border-amber-500/10 hover:border-amber-500/30 font-extrabold hover:translate-x-1"
                        : isBachelorPointThemedItem
                          ? isActive
                            ? "bg-[#e5173f] text-white font-black shadow-lg shadow-[#e5173f]/40 scale-[1.01]"
                            : "text-rose-700 dark:text-rose-300 hover:text-rose-650 dark:hover:text-rose-200 bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/5 dark:hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/30 font-extrabold hover:translate-x-1"
                          : isDihSmm
                            ? isActive
                              ? settings.smmEnableColorTheme !== false
                                ? "bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#0ea5e9] text-white font-black shadow-lg shadow-purple-500/35 scale-[1.01]"
                                : "bg-slate-100 dark:bg-white text-slate-900 dark:text-slate-900 font-extrabold scale-[1.01]"
                              : settings.smmEnableColorTheme !== false
                                ? "text-[#7c3aed] dark:text-violet-350 hover:text-white dark:hover:text-white bg-violet-500/5 hover:bg-gradient-to-r hover:from-white/[0.02] hover:to-white/[0.04] border border-[#7c3aed]/15 hover:border-[#8b5cf6]/40 font-extrabold hover:translate-x-1"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:translate-x-1"
                            : isActive 
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/5 dark:shadow-white/5 scale-[1.01]" 
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:translate-x-1",
                      isDisabled && !isActive && "opacity-75 hover:opacity-100 text-rose-600/80 dark:text-rose-500/80 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10"
                    )}
                  >
                    {!isBachelorPointThemedItem && (
                      <item.icon size={14} className={cn(
                        "transition-transform", 
                        isActive ? "scale-110" : "group-hover/item:scale-110", 
                        isDihMovies && !isActive && "text-amber-500 dark:text-amber-400 animate-pulse",
                        isDihSmm && !isActive && (settings.smmEnableColorTheme !== false ? "text-violet-500 dark:text-violet-400 animate-pulse" : "text-slate-400")
                      )} />
                    )}
                    <span className={cn("flex-1 text-left truncate uppercase", (isStreamingTool || isDihSmm) && "tracking-wide")}>{label}</span>
                    {isDisabled ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_4px_rgba(244,63,94,0.6)]" title="Under Management / Offline" />
                    ) : isDihMovies ? (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-md animate-pulse">
                        STREAM
                      </span>
                    ) : isDihSmm ? (
                      settings.smmEnableColorTheme !== false ? (
                        <span className="bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-md animate-pulse font-sans">
                          BOOST
                        </span>
                      ) : (
                        <span className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[8px] px-1.5 py-0 rounded font-mono font-black tracking-widest uppercase">
                          SMM
                        </span>
                      )
                    ) : null}
                    {isActive && !isStreamingTool && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                      />
                    )}
                  </button>

                  {isDihMovies && isActive && (
                    <div className="mt-1 ml-3 pl-3.5 border-l border-amber-500/20 space-y-1.5 py-1">
                      {[
                        { id: 'tv' as const, label: 'TV SHOWS', desc: 'WEB SERIES & SEASONS', icon: Tv },
                        { id: 'anime' as const, label: 'ANIMATION SERIES', desc: 'ANIME & CARTOONS', icon: Cat },
                      ].map(sub => {
                        const isSubActive = currentMovieSector === sub.id;
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={sub.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTool('dih-movies');
                              changeSector(sub.id);
                              if (window.innerWidth < 768) setIsSidebarOpen(false);
                            }}
                            className={cn(
                              "w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 relative overflow-hidden group/subitem",
                              isSubActive
                                ? "bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5 scale-[1.02]"
                                : "text-slate-400 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/5 border border-transparent hover:border-amber-500/10 hover:translate-x-0.5"
                            )}
                          >
                            <div className={cn(
                              "p-1.5 rounded-md transition-colors",
                              isSubActive ? "bg-amber-500/15" : "bg-slate-100 dark:bg-white/5 group-hover/subitem:bg-amber-500/10"
                            )}>
                              <SubIcon size={12} className={cn(
                                isSubActive ? "text-amber-500" : "text-slate-500 dark:text-slate-400 group-hover/subitem:text-amber-500"
                              )} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={cn(
                                "text-[10px] uppercase font-black tracking-wide truncate",
                                isSubActive ? "text-amber-400" : "text-slate-600 dark:text-slate-300 group-hover/subitem:text-amber-400"
                              )}>
                                {sub.label}
                              </span>
                              <span className="text-[7.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider truncate uppercase">
                                {sub.desc}
                              </span>
                            </div>
                            
                            {isSubActive && (
                              <motion.div
                                layoutId="sub-active-line"
                                className="absolute right-0 h-4 w-1 bg-amber-500 rounded-l-full"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            {/* Admin Area */}
          </nav>
          <div className="p-3 pb-6 md:pb-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-[8px] text-center text-slate-500 font-bold tracking-tight px-3 leading-relaxed opacity-60">
              {settings.footerText.toUpperCase()}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 bg-slate-950/40 transition-all duration-500 pb-20 md:pb-0",
        (!shouldHideSidebar && isSidebarOpen) ? "md:ml-56" : "ml-0",
        settings.enableGlassmorphism && "backdrop-blur-3xl"
      )}>
        {!isFullScreenMode && (
        <header className={cn(
          "h-12 md:h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-slate-950/20 sticky top-0 z-10 transition-all group/header",
          settings.enableGlassmorphism && "backdrop-blur-3xl"
        )}>
          {/* Technical Progress Bar */}
          <div className="absolute bottom-0 left-0 h-[1px] bg-primary group-hover:h-[2px] transition-all duration-700 animate-pulse w-full opacity-20 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          
            <div className="flex items-center gap-3 md:gap-6">
            {!(activeTool === 'admin-panel' || activeTool === 'admin-login') && (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block text-slate-500 p-2 hover:bg-white/10 rounded-lg transition-all active:scale-90">
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-sm xs:text-base md:text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-300 to-white truncate sm:overflow-visible sm:whitespace-normal max-w-[180px] xs:max-w-xs sm:max-w-none">
                {settings.toolLabels?.[activeTool]?.toUpperCase() || navItems.find(i => i.id === activeTool)?.label?.toUpperCase() || (activeTool === 'nid' ? 'NID CARD MAKER' : 'ADMIN SETTINGS')}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 md:gap-3 group cursor-pointer select-none"
                  >
                    <div className="hidden sm:block text-right">
                      {activeTool === 'admin-panel' ? (
                        <p className="text-[10px] font-black tracking-tighter text-slate-400 uppercase leading-none">{settings.headerOperatorLabel || 'Admin'}</p>
                      ) : (
                        <p className="text-[10px] font-black tracking-tighter text-slate-400 uppercase leading-none">&nbsp;</p>
                      )}
                      <p className="text-xs font-black leading-none group-hover:text-primary transition-colors">{currentUser.name}</p>
                    </div>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] md:text-xs font-black shadow-lg shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-all border border-indigo-400/20">
                      {currentUser.name[0]?.toUpperCase()}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setIsUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2.5 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl z-50 space-y-4"
                        >
                          {/* User Header */}
                          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-amber-500/20">
                              {currentUser.name[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                            </div>
                          </div>



                          {/* User actions */}
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                onLogout && onLogout();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <LogOut size={13} />
                              <span>Log Out Account</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              activeTool === 'dashboard' && (
                <button 
                  onClick={onAuthClick}
                  className="relative overflow-hidden group/login px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 dark:from-amber-600 dark:via-yellow-400 dark:to-amber-500 text-slate-950 dark:text-slate-950 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-amber-500/20 dark:shadow-amber-500/10 border border-amber-400/35 flex items-center gap-1.5"
                >
                  {/* Visual glare shine animation */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/login:translate-x-full transition-transform duration-1000" />
                  <User size={13} className="text-slate-950 group-hover/login:scale-110 transition-transform" />
                  <span>Member Access</span>
                </button>
              )
            )}
          </div>
        </header>
        )}

        <div className={cn(
          "flex-1 scroll-smooth flex flex-col justify-between",
          (isFullScreenMode || activeTool === 'dih-smm') 
            ? "p-0 pb-0 overflow-hidden h-[calc(100vh-48px)] md:h-[calc(100vh-56px)]" 
            : "p-3 md:p-4 lg:p-6 pb-24 md:pb-6 overflow-y-auto"
        )}>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "h-full",
                  activeTool !== 'dih-movies' && "max-w-7xl mx-auto"
                )}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {!isFullScreenMode && (
            <footer className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-900 pb-28 md:pb-10 text-center max-w-7xl mx-auto px-4 w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* Disclaimer Badge */}
                  <div className="flex items-center gap-1.5 text-[9px] tracking-widest text-slate-400 dark:text-slate-500 font-extrabold uppercase bg-slate-50 dark:bg-slate-950/40 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/80">
                    <ShieldAlert size={11} className="text-amber-500 dark:text-amber-400" />
                    <span>Disclaimer & Legal Notice</span>
                  </div>

                  {/* Contact Email Badge */}
                  <a 
                    href="mailto:contact@dihhub.site?subject=Support%20%26%20Inquiry%20-%20DIH%20Hub&body=Dear%20DIH%20Hub%20Support%20Team%2C%0A%0AI%20am%20reaching%20out%20to%20you%20regarding%20the%2520following%2520inquiry%3A%0A%0A%5BPlease%20type%20your%20message%20here%5D%0A%0AThank%20you%2C%0A%5BYour%20Name%5D"
                    className="flex items-center gap-1.5 text-[9px] tracking-widest text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-extrabold uppercase bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-950/80 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/80 transition-all active:scale-95 cursor-pointer"
                    title="Click to Compose Support Email"
                  >
                    <Mail size={11} className="text-indigo-500 dark:text-indigo-400" />
                    <span>SUPPORT: contact@dihhub.site</span>
                  </a>
                </div>

                {/* Disclaimer Content - Warm, Professional and Human-written */}
                <p className="text-[10.5px] text-slate-400/90 dark:text-slate-500 max-w-3xl leading-relaxed font-medium">
                  Hey there! DIH Hub is an independent, personal toolbox built and maintained by Rafcin. This platform is a passion project created to host hand-crafted web utilities, media experiments, and security tools for educational, development, and day-to-day productivity. Since this is a personal workspace, we don't host, upload, or own any of the media, files, or external streams processed through these pages. We’re just here to make cool tools and keep things running smoothly. Got an idea, a question, or just want to chat? Reach out to me directly at <a href="mailto:contact@dihhub.site?subject=Support%20%26%20Inquiry%20-%20DIH%20Hub&body=Dear%20DIH%20Hub%20Support%20Team%2C%0A%0AI%20am%20reaching%20out%20to%20you%20regarding%20the%2520following%2520inquiry%3A%0A%0A%5BPlease%20type%20your%20message%20here%5D%0A%0AThank%20you%2C%0A%5BYour%20Name%5D" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold transition-all underline decoration-dotted underline-offset-2">contact@dihhub.site</a> — let's build a more useful web together!
                </p>

                {/* Subtle Divider */}
                <div className="w-16 h-[1px] bg-slate-200/60 dark:bg-slate-800/60 my-1"></div>

                {/* Meta Rows */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-[10px]">
                  <p className="font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">
                    © 2024 DIH HUB (DIGITAL INNOVATION HOUSE HUB). ALL RIGHTS RESERVED
                  </p>
                  <span className="hidden sm:inline text-slate-200 dark:text-slate-800 font-light">|</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-widest text-[9px]">
                      Developed by
                    </span>
                    <a 
                      href="https://www.instagram.com/rafcin.b/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-1.5 rounded-full text-white bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:scale-110 active:scale-95 transition-all shadow-md shadow-pink-500/10 hover:shadow-pink-500/25 cursor-pointer border border-transparent"
                      title="Follow on Instagram @rafcin.b"
                    >
                      <Instagram size={11} className="stroke-[2.5]" />
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </div>
      </main>

      {/* Premium Translucent Mobile Bottom Bar Navigation */}
      {!isFullScreenMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-slate-900/95 dark:bg-slate-950/95 border-t border-slate-250/15 dark:border-white/5 backdrop-blur-2xl py-3 px-3 shadow-[0_-5px_25px_rgba(0,0,0,0.5)] flex items-center justify-around pb-safe">
            
            {/* Home / Dashboard */}
            <button 
              onClick={() => {
                setActiveTool('dashboard');
                setIsSidebarOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all py-1.5 px-3.5 rounded-xl cursor-pointer active:scale-95",
                activeTool === 'dashboard' 
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <LayoutDashboard size={16} className={activeTool === 'dashboard' ? 'text-slate-950' : 'text-amber-500'} />
              <span className="text-[9px] font-black tracking-widest uppercase">Home</span>
            </button>

            {/* SMM Panel */}
            <button 
              onClick={() => {
                setActiveTool('dih-smm');
                setIsSidebarOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all py-1.5 px-3.5 rounded-xl cursor-pointer active:scale-95",
                activeTool === 'dih-smm' 
                  ? "bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#0ea5e9] text-white font-black shadow-lg shadow-purple-500/25 scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Zap size={16} className={activeTool === 'dih-smm' ? "text-white animate-pulse" : "text-violet-500"} />
              <span className="text-[9px] font-black tracking-widest uppercase">SMM</span>
            </button>

            {/* Movies */}
            <button 
              onClick={() => {
                setActiveTool('dih-movies');
                changeSector('movie');
                setIsSidebarOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all py-1.5 px-3.5 rounded-xl cursor-pointer active:scale-95",
                activeTool === 'dih-movies' 
                  ? "bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f97316] text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Film size={16} className={activeTool === 'dih-movies' ? "text-slate-950" : "text-amber-500"} />
              <span className="text-[9px] font-black tracking-widest uppercase">Movies</span>
            </button>

            {/* Toggle Sidebar Drawer */}
            <button 
              onClick={() => {
                setIsSidebarOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 active:scale-95 transition-all cursor-pointer"
            >
              <Menu size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase">More</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
