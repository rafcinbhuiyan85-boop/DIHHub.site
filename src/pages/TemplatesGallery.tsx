import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Globe, 
  Search, 
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
  Crown,
  Loader2
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
    { id: 'ALL_SECTORS', label: 'All Designs', icon: Compass }
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
    const url = `${window.location.origin}/rb/${id}`;
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
        <div className="absolute inset-0 bg-[#080b0f] flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-radial-gradient from-rose-500/10 via-transparent to-transparent opacity-50" />
          <div className="relative w-16 h-16 flex items-center justify-center bg-rose-500/5 rounded-2xl border border-rose-500/10 shadow-inner mb-3 group-hover:scale-105 transition-transform duration-500">
            <Cake className="text-rose-450" size={26} />
          </div>
          <p className="text-[10px] font-medium tracking-widest text-[#a1a1aa] uppercase">Birthday Card Template</p>
        </div>
      );
    }
    if (catLower === 'wish' || name.toLowerCase().includes('wish')) {
      return (
        <div className="absolute inset-0 bg-[#080b0f] flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-radial-gradient from-pink-500/10 via-transparent to-transparent opacity-50" />
          <div className="relative w-16 h-16 flex items-center justify-center bg-pink-500/5 rounded-2xl border border-pink-500/10 shadow-inner mb-3 group-hover:scale-105 transition-transform duration-500">
            <Heart className="text-pink-400" size={24} />
          </div>
          <p className="text-[10px] font-medium tracking-widest text-[#a1a1aa] uppercase">Greeting celebration</p>
        </div>
      );
    }
    if (catLower === 'landing' || name.toLowerCase().includes('landing') || name.toLowerCase().includes('page')) {
      return (
        <div className="absolute inset-0 bg-[#080b0f] flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 via-transparent to-transparent opacity-50" />
          <div className="relative w-16 h-16 flex items-center justify-center bg-blue-500/5 rounded-2xl border border-blue-500/10 shadow-inner mb-3 group-hover:scale-105 transition-transform duration-500">
            <Layout className="text-blue-400" size={24} />
          </div>
          <p className="text-[10px] font-medium tracking-widest text-[#a1a1aa] uppercase">Professional Landing page</p>
        </div>
      );
    }
    if (catLower === 'gifts' || name.toLowerCase().includes('gift')) {
      return (
        <div className="absolute inset-0 bg-[#080b0f] flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent opacity-50" />
          <div className="relative w-16 h-16 flex items-center justify-center bg-amber-500/5 rounded-2xl border border-amber-500/10 shadow-inner mb-3 group-hover:scale-105 transition-transform duration-500">
            <Gift className="text-amber-400" size={24} />
          </div>
          <p className="text-[10px] font-medium tracking-widest text-[#a1a1aa] uppercase">Digital Gift Box</p>
        </div>
      );
    }
    return (
      <div className="absolute inset-0 bg-[#080b0f] flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent opacity-50" />
        <div className="relative w-16 h-16 flex items-center justify-center bg-purple-500/5 rounded-2xl border border-purple-500/10 shadow-inner mb-3 group-hover:scale-105 transition-transform duration-500">
          <Globe className="text-purple-400" size={24} />
        </div>
        <p className="text-[10px] font-medium tracking-widest text-[#a1a1aa] uppercase">Exclusive Template</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090c] flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080b] text-slate-350 relative overflow-x-hidden font-sans">
      
      {/* Premium Decorative Lighting Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/[0.04] rounded-full blur-[140px] pointer-events-none" />
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 lg:py-16">
        
        {/* Top Navbar / Back actions */}
        <div className="flex items-center justify-between mb-16 pb-6 border-b border-slate-900/45">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="group flex items-center justify-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-350 hover:text-white font-semibold text-xs rounded-xl transition-all duration-300 border border-slate-800/80 active:scale-95 shadow-sm"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Return to Dashboard
              </button>
            )}
            <span className="text-[10px] font-medium text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800/60">
              Template Gallery
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium font-mono">
              Ready to deploy
            </span>
          </div>
        </div>

        {/* Hero Header Section */}
        <header className="mb-14 text-left space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-indigo-100">DIH</span>
                <span className="font-light text-slate-400">Templates</span>
                <span className="text-[9px] bg-blue-500/10 text-blue-405 border border-blue-500/25 px-2 py-0.5 rounded font-mono tracking-normal font-black uppercase ml-1">PORTAL</span>
              </h1>
              <p className="text-sm text-slate-400 font-normal leading-relaxed max-w-xl">
                Deploy, manage, and share elegant, isolated single-page web experiences and high-fidelity custom micro-portals.
              </p>
            </div>
            
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/50 px-6 py-4 rounded-2xl flex flex-col items-center md:items-start gap-1 shadow-sm self-stretch md:self-auto justify-center min-w-[160px]">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TOTAL DESIGNS</span>
              <span className="text-2xl font-bold text-white font-mono">{templates.length} <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider ml-1">Live</span></span>
            </div>
          </div>
        </header>

        {/* Browser Filtering Controls with Glowing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-12">
          
          {/* Categories Horizontal Navigation */}
          {categories.length > 1 && (
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
          )}

          {/* Elegant Search bar */}
          <div className={cn("relative group", categories.length > 1 ? "lg:col-span-4" : "lg:col-span-12")}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" size={15} />
            <input 
              type="text" 
              placeholder="Search template registry..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/30 border border-slate-800/80 rounded-full py-3.5 pl-11 pr-5 font-semibold text-xs text-white focus:border-indigo-500/50 focus:bg-slate-900/60 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600"
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
                {/* Subtle soft gradient glow */}
                <div className="absolute inset-0 bg-indigo-500/[0.02] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Modern Card */}
                <div className="relative bg-[#0b0e14] border border-slate-800/80 hover:border-indigo-500/20 p-5 rounded-2xl h-full flex flex-col justify-between transition-all duration-350 shadow-sm hover:shadow-md hover:-translate-y-1">
                  
                  {/* Decorative Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-medium text-slate-500 font-mono">
                      id: {t.id.slice(0, 8)}
                    </span>
                    <span className="text-[9px] px-2.5 py-0.5 bg-slate-900 border border-slate-800/60 rounded-full text-slate-400 font-semibold uppercase tracking-wider">
                      {t.category || 'General'}
                    </span>
                  </div>

                  {/* Aesthetic Visual preview */}
                  <div className="relative aspect-[16/10] w-full mb-4 bg-slate-950 rounded-xl border border-slate-900/60 overflow-hidden group/viz">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-[0.2]" />
                    {getTemplateArt(t.category, t.name)}
                  </div>

                  {/* Content Area */}
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors duration-250 leading-snug">
                        {t.name}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(`/rb/${t.id}`, '_blank')}
                          className="flex-1 bg-slate-900 hover:bg-indigo-650 text-slate-300 hover:text-white py-3 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-800 hover:border-indigo-550/25 active:scale-95"
                        >
                          <ExternalLink size={13} />
                          Launch Live
                        </button>
                        
                        <button 
                          onClick={(e) => handleCopyLink(e, t.id)}
                          className={cn(
                            "w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0",
                            copiedId === t.id 
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-450" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-705"
                          )}
                          title="Copy Link"
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
                <Globe size={48} strokeWidth={1} className="mx-auto text-indigo-500/20 rotate-6" />
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
