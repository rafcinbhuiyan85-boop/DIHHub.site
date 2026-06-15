import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Globe, 
  Search, 
  Sparkles, 
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Layers,
  Heart,
  Gift,
  Cake,
  Flame,
  MousePointer,
  Compass,
  Layout,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface HtmlTemplate {
  id: string;
  name: string;
  category: string;
  createdAt: any;
}

interface TemplatesGalleryProps {
  onBack?: () => void;
}

export default function TemplatesGallery({ onBack }: TemplatesGalleryProps) {
  const [templates, setTemplates] = useState<HtmlTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL_SECTORS');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const categories = [
    { id: 'ALL_SECTORS', label: '✨ ALL THEMES', icon: Compass },
    { id: 'BIRTHDAY', label: '🎂 BIRTHDAY', icon: Cake },
    { id: 'WISH', label: '💖 WISH', icon: Heart },
    { id: 'LANDING', label: '🚀 LANDING', icon: Layout },
    { id: 'GIFTS', label: '🎁 GIFTS', icon: Gift },
    { id: 'OTHERS', label: '🌟 OTHERS', icon: Sparkles }
  ];

  useEffect(() => {
    const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ ...d.data() } as HtmlTemplate));
      setTemplates(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/t/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const sector = activeCategory === 'ALL_SECTORS' ? 'All' : activeCategory;
    const matchesCategory = sector === 'All' || t.category?.toUpperCase() === sector;
    return matchesSearch && matchesCategory;
  });

  const getTemplateArt = (category: string, name: string) => {
    const catLower = category?.toLowerCase();
    if (catLower === 'birthday' || name.toLowerCase().includes('birthday')) {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 via-purple-600/10 to-amber-500/10 flex flex-col items-center justify-center p-4">
          <div className="relative w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-lg mb-3">
            <Cake className="text-pink-400 group-hover:scale-110 transition-transform duration-500 animate-bounce" size={32} />
          </div>
          <p className="text-[10px] font-black tracking-[0.2em] text-pink-400 uppercase">BIRTHDAY EDITION</p>
        </div>
      );
    }
    if (catLower === 'wish' || name.toLowerCase().includes('wish')) {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 via-red-650/10 to-pink-500/10 flex flex-col items-center justify-center p-4">
          <div className="relative w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-lg mb-3">
            <Heart className="text-rose-400 animate-pulse group-hover:scale-110 transition-transform duration-500" size={32} fill="currentColor" />
          </div>
          <p className="text-[10px] font-black tracking-[0.2em] text-rose-400 uppercase">CELEBRATION WISH</p>
        </div>
      );
    }
    if (catLower === 'landing' || name.toLowerCase().includes('landing') || name.toLowerCase().includes('page')) {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-indigo-650/10 to-teal-500/10 flex flex-col items-center justify-center p-4">
          <div className="relative w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-lg mb-3">
            <Layout className="text-blue-400 group-hover:rotate-6 transition-transform duration-500" size={32} />
          </div>
          <p className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">PREMIUM LANDING</p>
        </div>
      );
    }
    if (catLower === 'gifts' || name.toLowerCase().includes('gift')) {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-650/20 via-orange-600/10 to-yellow-500/10 flex flex-col items-center justify-center p-4">
          <div className="relative w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-lg mb-3">
            <Gift className="text-amber-400 group-hover:-translate-y-1 transition-transform duration-500" size={32} />
          </div>
          <p className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase">GIFT SHOWCASE</p>
        </div>
      );
    }
    return (
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-slate-900/30 to-blue-500/15 flex flex-col items-center justify-center p-4">
        <div className="relative w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-lg mb-3">
          <Sparkles className="text-purple-400 group-hover:rotate-12 transition-transform duration-500" size={32} />
        </div>
        <p className="text-[10px] font-black tracking-[0.2em] text-purple-400 uppercase">EXCLUSIVE TEMPLATE</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090c] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-amber-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-amber-500/30 animate-spin duration-1000" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Crown size={18} className="text-amber-500 animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] text-amber-500 uppercase animate-pulse">
            LOADING PREMIUM WORKSPACE...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080b] text-slate-350 relative overflow-x-hidden font-sans">
      
      {/* Premium Decorative Lighting Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/[0.04] rounded-full blur-[140px] pointer-events-none" />
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 lg:py-16">
        
        {/* Top Navbar / Back actions */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-900/60">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="group flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900/85 hover:bg-amber-500 text-[#8888a8] hover:text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 border border-slate-800/60 active:scale-95 shadow-md shadow-black/20"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            )}
            <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-500/20">
              PREMIUM VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Central Server Active
            </span>
          </div>
        </div>

        {/* Hero Header Section */}
        <header className="mb-14 text-center sm:text-left space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-[0.25em]">
                <Crown size={14} className="text-amber-500" /> CREATIVE HQ SHOWROOM
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase italic leading-none drop-shadow-md">
                DIH <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-450 via-amber-400 to-orange-500">TEMPLATE</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide max-w-2xl">
                Deploy and share beautifully sculpted templates with your special friends. Access {templates.length} manual high-fidelity nodes instantly.
              </p>
            </div>
            
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 px-6 py-4 rounded-2xl flex flex-col items-center sm:items-start gap-1 shadow-lg shadow-black/10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">AVAILABLE RESOURCES</span>
              <span className="text-3xl font-black text-white">{templates.length} <span className="text-xs text-amber-500 uppercase font-bold">Templates</span></span>
            </div>
          </div>
        </header>

        {/* Browser Filtering Controls with Glowing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-12">
          
          {/* Categories Horizontal Navigation */}
          <div className="lg:col-span-8 flex items-center gap-2 overflow-x-auto pb-3 pl-1 scrollbar-thin scrollbar-thumb-slate-800 no-scrollbar">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 h-10 rounded-full font-black text-[10px] tracking-wider uppercase transition-all duration-300 relative shrink-0",
                    isActive 
                      ? "text-slate-950 bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20" 
                      : "text-slate-400 bg-slate-900/40 border border-slate-800/60 hover:text-white hover:bg-slate-900/80"
                  )}
                >
                  <Icon size={12} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Elegant Search bar */}
          <div className="lg:col-span-4 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-500" size={15} />
            <input 
              type="text" 
              placeholder="Search template registry..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/30 border border-slate-800/80 rounded-full py-3.5 pl-11 pr-5 font-semibold text-xs text-white focus:border-amber-500/50 focus:bg-slate-900/60 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Gallery Premium Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, idx) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
                className="group relative"
              >
                {/* Premium Glow Container */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[8px] pointer-events-none" />
                
                {/* Glass Card */}
                <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 hover:border-amber-500/30 p-5 rounded-3xl h-full flex flex-col justify-between transition-all duration-500 shadow-md hover:shadow-2xl shadow-black/10 hover:shadow-amber-500/[0.04] hover:-translate-y-1.5">
                  
                  {/* Decorative Frame corner borders */}
                  <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-slate-800 group-hover:border-amber-500/40 duration-350 transition-all rounded-tl-md" />
                  <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-slate-800 group-hover:border-amber-500/40 duration-350 transition-all rounded-br-md" />

                  {/* Card ID Bar */}
                  <div className="flex items-center justify-between mb-5 font-black text-[9px] tracking-wider text-slate-500 border-b border-slate-900/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                      ID: {t.id.slice(0, 10).toUpperCase()}
                    </div>
                    <span className="text-[8px] px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-500 font-mono">
                      PRESETS_V2
                    </span>
                  </div>

                  {/* Decorative Arts Placeholder with responsive categories */}
                  <div className="relative aspect-[16/10] w-full mb-5 bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden group/viz">
                    <div className="absolute inset-0 bg-[radial-gradient(#20293a_1px,transparent_1px)] [background-size:12px_12px] opacity-[0.25]" />
                    {getTemplateArt(t.category, t.name)}
                    
                    {/* Hover Glow Light Overlay */}
                    <div className="absolute inset-y-0 -left-1/2 w-1/4 bg-white/5 skew-x-12 opacity-0 group-hover/viz:opacity-100 group-hover/viz:left-full duration-1000 transition-all ease-out pointer-events-none" />
                  </div>

                  {/* Content Area */}
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[8px] font-black text-amber-500 tracking-[0.2em] uppercase">
                        <Crown size={9} />
                        THEME_ID_{t.id.slice(0, 4).toUpperCase()}
                      </div>
                      
                      <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors duration-300 leading-tight">
                        {t.name}
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      {/* Specifications Block */}
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 font-semibold text-[8px] tracking-widest text-[#8888a8] bg-slate-950/80 p-3 rounded-xl border border-slate-900">
                        <div className="flex items-center gap-1 uppercase">
                          <span className="w-1 h-1 rounded-full bg-slate-700" /> CATEGORY: 
                        </div>
                        <div className="text-right text-white font-bold truncate max-w-[100px]">{t.category?.toUpperCase() || 'GENERAL'}</div>
                        <div className="flex items-center gap-1 uppercase">
                          <span className="w-1 h-1 rounded-full bg-slate-700" /> STATUS: 
                        </div>
                        <div className="text-right text-emerald-400 font-black">DEPLOYED</div>
                      </div>

                      {/* Launch and Copy Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(`/t/${t.id}`, '_blank')}
                          className="flex-1 bg-white hover:bg-amber-500 text-slate-950 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-black/15 active:scale-95"
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                          Live Launch
                        </button>
                        
                        <button 
                          onClick={(e) => handleCopyLink(e, t.id)}
                          className={cn(
                            "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300",
                            copiedId === t.id 
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" 
                              : "bg-slate-950 border-slate-800/80 text-slate-500 hover:text-white hover:border-slate-700"
                          )}
                          title="Copy direct share Link"
                        >
                          {copiedId === t.id ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty Database Case */}
          {filtered.length === 0 && !loading && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full py-24 text-center border-2 border-dashed border-slate-900 rounded-3xl bg-slate-950/20"
            >
              <div className="max-w-md mx-auto space-y-6 px-4">
                <Globe size={48} strokeWidth={1} className="mx-auto text-amber-500/20 rotate-6" />
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">No Templates Found</h3>
                  <p className="text-slate-500 text-xs font-semibold">
                    No custom templates have been deployed matching the filter. Use the dashboard to create new templates or modify target categories.
                  </p>
                </div>
                <button 
                  onClick={() => { setSearch(''); setActiveCategory('ALL_SECTORS'); }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 font-semibold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-800"
                >
                  Reset Active Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
