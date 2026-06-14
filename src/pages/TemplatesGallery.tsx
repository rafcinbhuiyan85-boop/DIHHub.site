import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Globe, 
  Search, 
  Zap, 
  Cpu,
  Activity,
  Terminal,
  Database,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Layers,
  Box
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

  const categories = ['ALL_SECTORS', 'BIRTHDAY', 'WISH', 'LANDING', 'GIFTS', 'OTHERS'];

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

  const getCategoryCode = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'birthday': return 'BD-01';
      case 'wish': return 'WH-42';
      case 'landing': return 'LD-77';
      default: return 'GN-00';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] tech-grid flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                animate={{ height: [10, 30, 10] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1 bg-primary shadow-[0_0_10px_#00f2ff]"
              />
            ))}
          </div>
          <span className="text-[10px] tracking-[0.4em] text-primary terminal-glow">INITIALIZING_ARCHIVE_CORE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 relative overflow-x-hidden font-sans tech-grid">
      {/* HUD Borders */}
      <div className="fixed inset-0 pointer-events-none z-50 border-[20px] border-[#0a0a0a] hidden md:block" />
      <div className="fixed inset-4 pointer-events-none z-50 border border-white/[0.03] hidden md:block" />
      
      {/* Corner Brackets */}
      <div className="fixed top-8 left-8 z-50 text-white/20 select-none hidden md:block">
        <div className="font-mono text-[10px] tracking-widest">[ HUB_v4.0 ]</div>
      </div>
      <div className="fixed top-8 right-8 z-50 text-white/20 select-none hidden md:block">
        <div className="font-mono text-[10px] tracking-widest text-right">SECURE_CONNECTION: TRIPLE_AES</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 lg:py-32">
        {/* Header Section */}
        <header className="mb-20 space-y-6">
          <div className="flex items-center gap-4 text-primary font-mono text-[10px] tracking-[0.5em] uppercase">
            <Activity size={14} className="animate-pulse" />
            LIVE_DATA_STREAM
            <div className="h-[1px] flex-1 bg-white/[0.05]" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                The <span className="text-white">Archive</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Central</span>
              </h1>
              <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
                Nodes available: {templates.length} // System status: Operational
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/10 p-2 rounded-lg">
              <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded text-primary font-mono text-[10px] tracking-widest">
                LATEST_VERSION: STABLE
              </div>
            </div>
          </div>
        </header>

        {/* Browser Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-8 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-white/[0.05]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 h-10 font-mono text-[10px] tracking-widest uppercase transition-all whitespace-nowrap relative group",
                  activeCategory === cat 
                    ? "text-primary bg-primary/5" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div layoutId="nav-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_#00f2ff]" />
                )}
              </button>
            ))}
          </div>

          <div className="lg:col-span-4 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-primary" size={16} />
            <input 
              type="text" 
              placeholder="QUERY_DATABASE..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.01] border-b-2 border-white/5 py-4 pl-12 pr-6 font-mono text-xs focus:border-primary outline-none transition-all placeholder:text-slate-800"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-40">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, idx) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  delay: idx * 0.05,
                  ease: "easeOut"
                }}
                className="group relative"
              >
                {/* Asymmetric Technical Container */}
                <div className="relative bg-[#0d0d0d] border border-white/[0.05] p-6 h-full flex flex-col group-hover:border-primary/30 transition-all duration-300">
                  {/* Card ID Bar */}
                  <div className="flex items-center justify-between mb-8 font-mono text-[9px] tracking-widest text-slate-600 border-b border-white/[0.03] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      INST_ID: {t.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div>SEC_LVL_04</div>
                  </div>

                  {/* Visual Preview Surrogate */}
                  <div className="relative aspect-video w-full mb-8 bg-black border border-white/[0.03] overflow-hidden group/viz">
                    <div className="absolute inset-0 tech-grid-fine opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <Box size={48} strokeWidth={0.5} className="text-white/[0.05] group-hover:text-primary/10 transition-colors duration-700 group-hover:scale-110" />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 blur-xl bg-primary/20 rounded-full opacity-0 group-hover:opacity-100" 
                        />
                      </div>
                    </div>
                    
                    {/* Floating Indicators */}
                    <div className="absolute top-4 right-4 flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-1 h-3 bg-white/5 group-hover:bg-primary/20 transition-colors" />)}
                    </div>
                    
                    <div className="absolute bottom-4 left-4 font-mono text-[8px] text-slate-700">
                      SYS_LOAD: 0.0{Math.floor(Math.random() * 9)}ms
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-mono text-primary/60 tracking-widest">
                        <Terminal size={10} />
                        SECTOR_{getCategoryCode(t.category)}
                      </div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                        {t.name}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Technical Specs */}
                      <div className="grid grid-cols-2 gap-2 font-mono text-[8px] tracking-widest text-slate-700 bg-black/40 p-3 border border-white/[0.03]">
                        <div>ARCH: X86_CLOUD</div>
                        <div className="text-right">PROTO: DAA_v1</div>
                        <div>LATENCY: 12ms</div>
                        <div className="text-right text-emerald-500/50">SECURE_LINK</div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(`/t/${t.id}`, '_blank')}
                          className="flex-1 bg-white text-black py-4 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                        >
                          <Zap size={12} fill="currentColor" />
                          LAUNCH_NODE
                        </button>
                        
                        <button 
                          onClick={(e) => handleCopyLink(e, t.id)}
                          className={cn(
                            "w-12 h-12 border flex items-center justify-center transition-all",
                            copiedId === t.id 
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                              : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/20"
                          )}
                        >
                          {copiedId === t.id ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Scanline */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.01] to-transparent h-4 w-full animate-[scan_4s_linear_infinite] opacity-0 group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full py-40 text-center border border-dashed border-white/10"
            >
              <div className="space-y-6">
                <Database size={40} strokeWidth={0.5} className="mx-auto text-primary/20" />
                <div className="space-y-2">
                  <h3 className="text-xl font-mono text-white/40 tracking-widest uppercase">ERROR: RESOURCE_NOT_FOUND</h3>
                  <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Adjust search parameters and re-query database</p>
                </div>
                <button 
                  onClick={() => setSearch('')}
                  className="px-6 py-2 border border-primary/30 text-primary font-mono text-[10px] tracking-widest hover:bg-primary/5 transition-all"
                >
                  SYSTEM_RESET
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
