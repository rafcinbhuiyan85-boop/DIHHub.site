import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Info, Star, Flame, Clock, Tv, Sparkles, Film, Heart, 
  Search, X, ChevronLeft, Trash2, Plus, RefreshCw, Layers, Check
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface ContentItem {
  id: number;
  title: string;
  description: string;
  type: 'movie' | 'series' | 'short' | 'documentary';
  poster_url: string;
  video_url: string;
  duration_minutes: number;
  release_year: number;
  category_id: number;
  is_featured: boolean;
  view_count: number;
}

const STORAGE_KEY = 'bp_s5_custom_data_v2';

const KEY_CATEGORIES = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Drama' },
  { id: 3, name: 'Comedy' },
  { id: 4, name: 'Thriller' },
  { id: 5, name: 'Romance' },
  { id: 6, name: 'Horror' },
  { id: 7, name: 'Sci-Fi' },
  { id: 8, name: 'Documentary' }
];

const INITIAL_CONTENTS: ContentItem[] = [
  {
    id: 1,
    title: 'Bachelor Point Season 5',
    description: 'The beloved Bangla comedy series returns with a brand new season full of humor and heart from the bachelor boys of Dhaka.',
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=600&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_minutes: 25,
    release_year: 2024,
    category_id: 3,
    is_featured: true,
    view_count: 8520
  },
  {
    id: 2,
    title: 'Hawa',
    description: 'A group of fishermen encounter a mysterious woman on their boat, leading to terrifying events in the deep sea.',
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=600&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_minutes: 132,
    release_year: 2022,
    category_id: 6,
    is_featured: true,
    view_count: 12050
  },
  {
    id: 3,
    title: 'Debi',
    description: 'A psychological thriller about a woman who claims to be possessed, blurring the lines between faith, sanity, and science.',
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_minutes: 118,
    release_year: 2018,
    category_id: 4,
    is_featured: false,
    view_count: 6210
  },
  {
    id: 4,
    title: 'Mohanagar',
    description: 'A gripping crime drama following a detective navigating the dark underbelly of Dhaka city within one intense night.',
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=600&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration_minutes: 40,
    release_year: 2021,
    category_id: 4,
    is_featured: true,
    view_count: 9815
  },
  {
    id: 5,
    title: 'Poran',
    description: 'A young man falls in love while trying to escape the cycle of poverty and violent obsession in rural Bangladesh.',
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=600&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    duration_minutes: 140,
    release_year: 2022,
    category_id: 5,
    is_featured: false,
    view_count: 5120
  },
  {
    id: 6,
    title: 'Rickshaw Girl',
    description: 'An inspiring drama following a young girl who fights social norms to ride a rickshaw and support her ailing family.',
    type: 'documentary',
    poster_url: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&h=600&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration_minutes: 85,
    release_year: 2021,
    category_id: 8,
    is_featured: false,
    view_count: 3450
  },
  {
    id: 7,
    title: 'Eid Special Short Film',
    description: 'A heartwarming family short celebrating the reunion, laughter, and emotional attachment of modern relations.',
    type: 'short',
    poster_url: 'https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=400&h=600&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    duration_minutes: 18,
    release_year: 2023,
    category_id: 2,
    is_featured: false,
    view_count: 4730
  }
];

export default function BachelorPoint() {
  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'watch' | 'admin' | 'add'>('home');
  const [categories, setCategories] = useState<Category[]>(KEY_CATEGORIES);
  const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENTS);
  const [selectedWatchId, setSelectedWatchId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom navigation history to go back easily
  const [history, setHistory] = useState<('home' | 'browse' | 'admin')[]>(['home']);

  // Filters for browse tab
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseType, setBrowseType] = useState<string>('');
  const [browseCat, setBrowseCat] = useState<string>('');

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Custom Form fields
  const [fTitle, setFTitle] = useState('');
  const [fType, setFType] = useState<'movie' | 'series' | 'short' | 'documentary'>('movie');
  const [fCat, setFCat] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fVideo, setFVideo] = useState('');
  const [fPoster, setFPoster] = useState('');
  const [fYear, setFYear] = useState('');
  const [fDur, setFDur] = useState('');
  const [fFeat, setFFeat] = useState(false);

  // Notifications (Toasts)
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'ok' | 'err' }[]>([]);

  // Video container reference for scrolling top
  const playerRef = useRef<HTMLVideoElement>(null);

  // Load from LS on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.contents) setContents(parsed.contents);
      }
    } catch (e) {
      console.error('Failed to load custom streamer data', e);
    }
  }, []);

  // Save to LS whenever data changes
  const saveData = (nextCats: Category[], nextItems: ContentItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        categories: nextCats,
        contents: nextItems
      }));
    } catch (e) {
      console.error('Failed to persist custom streamer data', e);
    }
  };

  const showToast = (message: string, type: 'ok' | 'err' = 'ok') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const changeTab = (tab: 'home' | 'browse' | 'watch' | 'admin' | 'add', watchId: number | null = null) => {
    if (tab === 'watch' && watchId !== null) {
      setSelectedWatchId(watchId);
      // Increment stats count on watch
      setContents(prev => {
        const mapped = prev.map(item => {
          if (item.id === watchId) {
            return { ...item, view_count: (item.view_count || 0) + 1 };
          }
          return item;
        });
        saveData(categories, mapped);
        return mapped;
      });
      
      // Update history if current tab wasn't watch/add
      if (activeTab === 'home' || activeTab === 'browse' || activeTab === 'admin') {
        setHistory(prev => [...prev, activeTab]);
      }
    } else {
      setSelectedWatchId(null);
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    const last = history[history.length - 1] || 'home';
    setHistory(prev => prev.slice(0, -1));
    setActiveTab(last);
  };

  const handleAddCategory = () => {
    const cleaned = newCatName.trim();
    if (!cleaned) return;
    
    if (categories.some(c => c.name.toLowerCase() === cleaned.toLowerCase())) {
      showToast('Category already exists', 'err');
      return;
    }

    const nextId = Math.max(0, ...categories.map(c => c.id)) + 1;
    const updated = [...categories, { id: nextId, name: cleaned }];
    setCategories(updated);
    saveData(updated, contents);
    showToast(`Category "${cleaned}" added successfully!`, 'ok');
    setNewCatName('');
    setShowCatModal(false);
  };

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim() || !fVideo.trim()) {
      showToast('Please fill out all required fields marked with *', 'err');
      return;
    }

    const nextId = Math.max(0, ...contents.map(c => c.id)) + 1;
    const newItem: ContentItem = {
      id: nextId,
      title: fTitle.trim(),
      type: fType,
      video_url: fVideo.trim(),
      description: fDesc.trim() || 'No description provided.',
      poster_url: fPoster.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
      release_year: parseInt(fYear) || new Date().getFullYear(),
      duration_minutes: parseInt(fDur) || 120,
      category_id: parseInt(fCat) || 1,
      is_featured: fFeat,
      view_count: 0
    };

    const updated = [newItem, ...contents];
    setContents(updated);
    saveData(categories, updated);
    showToast(`Added "${fTitle}" successfully!`, 'ok');

    // Reset Form
    setFTitle('');
    setFType('movie');
    setFCat('');
    setFDesc('');
    setFVideo('');
    setFPoster('');
    setFYear('');
    setFDur('');
    setFFeat(false);

    changeTab('admin');
  };

  const handleDeleteContent = (id: number, title: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${title}"?`)) return;
    const updated = contents.filter(c => c.id !== id);
    setContents(updated);
    saveData(categories, updated);
    showToast(`Deleted "${title}"`, 'ok');
  };

  // Helper selectors
  const getCategoryName = (id: number) => {
    const c = categories.find(cat => cat.id === id);
    return c ? c.name : 'Unknown';
  };

  const featured = contents.filter(c => c.is_featured);
  const heroContent = featured[0] || contents[0];

  // Recently Added list
  const recent = [...contents].sort((a,b) => b.id - a.id);

  // Filters calculation
  const filteredBrowse = contents.filter(c => {
    if (browseSearch && !c.title.toLowerCase().includes(browseSearch.toLowerCase())) return false;
    if (browseType && c.type !== browseType) return false;
    if (browseCat && c.category_id !== parseInt(browseCat)) return false;
    return true;
  });

  const activeWatchItem = contents.find(c => c.id === selectedWatchId);

  return (
    <div className="min-h-screen bg-[#07090f] text-[#f0f0f5] pb-16 font-sans relative">
      
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`px-5 py-3.5 rounded-xl border min-w-[260px] text-xs font-bold shadow-2xl backdrop-blur-md animate-[slideIn_0.2s_ease-out] flex items-center justify-between ${
              t.type === 'ok' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{t.message}</span>
            <button onClick={() => setToasts(p => p.filter(toast => toast.id !== t.id))} className="ml-3 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Styled Keyframes Injection */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Embedded Style Block to replicate custom HTML classes without conflict */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Sub Navigation / Header modeled after selected template */}
        <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mb-4 border-b border-slate-900 sticky top-0 z-40 bg-[#07090f]/95 backdrop-blur-xl">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => changeTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e5173f] to-[#ff2b56] flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Tv size={20} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-black tracking-widest text-[#f5173f] uppercase">Bachelor Point S-5</div>
              <div className="text-[9px] font-bold text-[#8888a8] uppercase tracking-[0.2em]">Manual Streaming Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'browse', label: 'Browse' },
              { id: 'admin', label: 'Admin Panel' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => changeTab(item.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all ${
                  (activeTab === item.id || (item.id === 'admin' && activeTab === 'add'))
                    ? 'bg-[#e5173f]/10 border border-[#e5173f]/30 text-[#e5173f] shadow-sm shadow-red-500/10'
                    : 'text-[#8888a8] border border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[220px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setBrowseSearch(e.target.value);
                setActiveTab('browse');
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs outline-none text-white focus:border-[#e5173f]/50 transition-all font-semibold"
            />
          </div>
        </nav>

        {/* 1. HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-[slideIn_0.3s_ease] select-none">
            
            {/* HERO BANNER */}
            {heroContent ? (
              <div 
                className="relative min-h-[460px] rounded-2xl md:rounded-3xl overflow-hidden border border-slate-900 bg-center bg-cover flex items-end shadow-2xl"
                style={{ backgroundImage: `linear-gradient(to right, rgba(7,9,15,0.95) 45%, rgba(7,9,15,0.3) 100%), linear-gradient(to top, rgba(7,9,15,0.98) 10%, transparent 60%), url('${heroContent.poster_url}')` }}
              >
                <div className="p-6 md:p-12 max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e5173f] text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                    <Sparkles size={11} fill="white" /> FEATURED CONTENT
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                    {heroContent.title}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                    {heroContent.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-extrabold uppercase">
                    <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80 text-white">{heroContent.release_year}</span>
                    <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80 text-[#e5173f]">{heroContent.duration_minutes} MIN</span>
                    <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80 text-orange-400">{getCategoryName(heroContent.category_id)}</span>
                    <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80 text-sky-400">{heroContent.view_count.toLocaleString()} VIEWS</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                      onClick={() => changeTab('watch', heroContent.id)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#e5173f] hover:bg-[#b01030] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 active:scale-95"
                    >
                      <Play size={14} fill="white" /> Start Watching
                    </button>
                    <button 
                      onClick={() => changeTab('watch', heroContent.id)}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                      <Info size={14} /> Full Information
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#12121a] rounded-2xl border border-dashed border-slate-800">
                <Film className="mx-auto text-slate-600 mb-3" size={36} />
                <h3 className="text-sm font-black tracking-widest text-[#f0f0f5]">No streaming banners available.</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Please visit the Admin Panel tab to upload and manage your video contents.</p>
              </div>
            )}

            {/* CATEGORY CHIPS */}
            <div className="space-y-3">
              <div className="text-[10px] font-black tracking-[0.25em] text-[#8888a8] uppercase">Browse by Genre / Category</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => { setBrowseCat(''); changeTab('browse'); }}
                  className="px-4 py-2 bg-slate-955 border border-slate-800 hover:border-slate-700 hover:text-white rounded-full text-xs font-extrabold text-[#8888a8] hover:bg-slate-900 transition-all uppercase"
                >
                  ✨ ALL RELEASES
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setBrowseCat(c.id.toString()); changeTab('browse'); }}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-[#e5173f]/40 hover:text-[#e5173f] rounded-full text-xs font-extrabold text-[#8888a8] transition-all uppercase"
                  >
                    🚀 {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FEATURED / THEATER ROWS */}
            {contents.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#e5173f] rounded-sm" /> Exclusive Spotlight
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {contents.slice(0, 6).map(item => (
                    <div 
                      key={item.id}
                      onClick={() => changeTab('watch', item.id)}
                      className="group cursor-pointer bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:scale-105 active:scale-98 transition-all hover:shadow-2xl hover:shadow-[#e5173f]/10"
                    >
                      <div className="aspect-[2/3] relative bg-[#12121a] overflow-hidden">
                        <img 
                          src={item.poster_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <div className="w-11 h-11 rounded-full bg-[#e5173f] flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-red-500/30">
                            <Play size={16} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                          <span className="bg-[#e5173f] text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-[11px] font-black text-[#f0f0f5] truncate uppercase tracking-tight group-hover:text-white">
                          {item.title}
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-extrabold">
                          <span>{item.release_year}</span>
                          <span>{item.duration_minutes} M</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECENTLY UPLOADED MANUAL RELEASES */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-sm" /> Recently Added
                </h2>
                <button onClick={() => changeTab('browse')} className="text-[11px] font-black tracking-widest text-[#8888a8] hover:text-[#e5173f] uppercase">
                  View Catalogue &rarr;
                </button>
              </div>
              
              {contents.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">No entries. Click Admin Panel to populate.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recent.slice(0, 12).map(item => (
                    <div 
                      key={item.id}
                      onClick={() => changeTab('watch', item.id)}
                      className="group cursor-pointer bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:scale-105 active:scale-98 transition-all hover:shadow-2xl"
                    >
                      <div className="aspect-[2/3] relative bg-[#12121a] overflow-hidden">
                        <img 
                          src={item.poster_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <div className="w-11 h-11 rounded-full bg-[#e5173f] flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play size={16} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="bg-slate-950/90 text-amber-400 border border-slate-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-[11px] font-black text-[#f0f0f5] truncate uppercase tracking-tight">
                          {item.title}
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-extrabold">
                          <span>{item.release_year}</span>
                          <span>{item.duration_minutes} M</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. BROWSE TAB */}
        {activeTab === 'browse' && (
          <div className="space-y-6 animate-[slideIn_0.3s_ease]">
            <div>
              <h1 className="text-xl font-black uppercase text-white tracking-widest">Browse Manual Releases</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">Filter, sort, and search manually added cinematic uploads.</p>
            </div>

            {/* FITLERS ROW */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-md">
              <input 
                type="text" 
                placeholder="Search releases by name..."
                value={browseSearch}
                onChange={(e) => setBrowseSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f]/40 font-semibold text-white"
              />

              <select 
                value={browseType} 
                onChange={(e) => setBrowseType(e.target.value)}
                className="px-4 py-2.5 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none text-slate-400 font-extrabold uppercase cursor-pointer focus:border-[#e5173f]"
              >
                <option value="">All Formats</option>
                <option value="movie">Movies</option>
                <option value="series">TV Web Series</option>
                <option value="short">Short Films</option>
                <option value="documentary">Documentaries</option>
              </select>

              <select 
                value={browseCat} 
                onChange={(e) => setBrowseCat(e.target.value)}
                className="px-4 py-2.5 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none text-slate-400 font-extrabold uppercase cursor-pointer focus:border-[#e5173f]"
              >
                <option value="">All Genres</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button 
                onClick={() => { setBrowseSearch(''); setBrowseType(''); setBrowseCat(''); }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-[#8888a8] hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              >
                Reset Filters
              </button>
            </div>

            {/* RESULTS GRID */}
            {filteredBrowse.length === 0 ? (
              <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-900">
                <Film className="mx-auto text-slate-600 mb-3" size={32} />
                <h3 className="text-sm font-black text-slate-400 tracking-wider">No matches found.</h3>
                <p className="text-xs text-slate-600 mt-1">Try resetting filters or adjusting search queries.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredBrowse.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => changeTab('watch', item.id)}
                    className="group cursor-pointer bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300"
                  >
                    <div className="aspect-[2/3] relative bg-[#12121a] overflow-hidden">
                      <img 
                        src={item.poster_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <div className="w-11 h-11 rounded-full bg-[#e5173f] flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                          <Play size={16} fill="white" className="text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="bg-slate-950/90 text-sky-400 border border-slate-800/80 font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                          {getCategoryName(item.category_id)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-[11px] font-black text-[#f0f0f5] truncate uppercase tracking-tight">
                        {item.title}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-extrabold">
                        <span>{item.release_year}</span>
                        <span>{item.duration_minutes} MIN</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. WATCH TAB */}
        {activeTab === 'watch' && activeWatchItem && (
          <div className="space-y-6 animate-[slideIn_0.3s_ease]">
            <button 
              onClick={handleBack} 
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#8888a8] hover:text-white uppercase tracking-widest bg-slate-950 px-4 py-2 border border-slate-900 rounded-lg transition-all active:scale-95"
            >
              <ChevronLeft size={14} /> Back to previous list
            </button>

            {/* VIDEO BOX AND SCREEN */}
            <div className="bg-[#000] border border-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
              <video 
                ref={playerRef}
                controls 
                autoPlay 
                preload="metadata" 
                poster={activeWatchItem.poster_url}
                className="w-full aspect-[16/9] max-h-[600px] object-contain"
              >
                <source src={activeWatchItem.video_url} type="video/mp4" />
                Your browser does not support HTML5 video streaming. Please update browser protocols.
              </video>
              
              {/* Custom Logo overlay like HTML */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-800 pointer-events-none">
                <span className="text-[10px] font-black text-white/95">DIH <span className="text-[#e5173f]">CINEMA</span></span>
              </div>
            </div>

            {/* INFORMATION AREA */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-900/60">
                <h1 className="text-2xl font-black text-white uppercase tracking-wide leading-tight">
                  {activeWatchItem.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1 bg-[#e5173f]/10 border border-[#e5173f]/30 text-[#e5173f] text-[10px] font-black uppercase tracking-widest rounded-md">
                    {activeWatchItem.type}
                  </span>
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                    ★ {getCategoryName(activeWatchItem.category_id)}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <div className="bg-[#12121a]/60 p-3 rounded-xl border border-slate-900/60 flex flex-col gap-1">
                  <span className="text-[8px] text-slate-500 font-black">Release Year</span>
                  <span className="text-white text-xs font-black">{activeWatchItem.release_year}</span>
                </div>
                <div className="bg-[#12121a]/60 p-3 rounded-xl border border-slate-900/60 flex flex-col gap-1">
                  <span className="text-[8px] text-slate-500 font-black">Duration Minutes</span>
                  <span className="text-white text-xs font-black">{activeWatchItem.duration_minutes} min</span>
                </div>
                <div className="bg-[#12121a]/60 p-3 rounded-xl border border-slate-900/60 flex flex-col gap-1">
                  <span className="text-[8px] text-slate-500 font-black">Total Views tracked</span>
                  <span className="text-[#e5173f] text-xs font-black">{(activeWatchItem.view_count || 1).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] font-black tracking-widest uppercase text-[#8888a8]">Synopsis & Information</div>
                <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed">
                  {activeWatchItem.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-[slideIn_0.3s_ease]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black uppercase tracking-widest text-white">Manual Streaming Administrator</h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">Maintain content database catalog completely localized.</p>
              </div>
              <button 
                onClick={() => changeTab('add')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#e5173f] hover:bg-[#b01030] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
              >
                <Plus size={14} /> Add Content manual
              </button>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Streams', value: contents.length, color: 'text-[#e5173f]' },
                { label: 'Movies Listed', value: contents.filter(c => c.type === 'movie').length, color: 'text-sky-400' },
                { label: 'Web Series', value: contents.filter(c => c.type === 'series').length, color: 'text-[#e5173f]' },
                { label: 'Short Films', value: contents.filter(c => c.type === 'short').length, color: 'text-amber-400' },
                { label: 'Documentaries', value: contents.filter(c => c.type === 'documentary').length, color: 'text-emerald-400' }
              ].map((m, i) => (
                <div key={i} className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-1 shadow-md">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{m.label}</div>
                  <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* CONTENT DATABASE TABLE */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-900 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase text-white tracking-widest">Release Database Catalog</span>
                <span className="text-[9px] font-extrabold text-[#8888a8]">ALL OPERATIONS SAVED FOR PRESETS</span>
              </div>

              {contents.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">No entries. Click "+ Add Content manual" to create one.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#12121a]/80 text-[#8888a8] font-black uppercase tracking-wider border-b border-slate-900">
                        <th className="p-3.5">Release Title</th>
                        <th className="p-3.5">Format Type</th>
                        <th className="p-3.5">Release Year</th>
                        <th className="p-3.5">Genre</th>
                        <th className="p-3.5">Tracking Views</th>
                        <th className="p-3.5 text-center">Spotlight Featured</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 font-semibold text-slate-300">
                      {contents.map(c => (
                        <tr key={c.id} className="hover:bg-[#12121a]/40 transition-colors">
                          <td className="p-3.5 max-w-[200px] truncate font-bold text-white uppercase">{c.title}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              c.type === 'movie' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 
                              c.type === 'series' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              'bg-[#e5173f]/10 text-[#e5173f] border border-[#e5173f]/20'
                            }`}>
                              {c.type}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono">{c.release_year}</td>
                          <td className="p-3.5 text-slate-400">{getCategoryName(c.category_id)}</td>
                          <td className="p-3.5 font-mono text-emerald-400">{c.view_count.toLocaleString()}</td>
                          <td className="p-3.5 text-center">
                            {c.is_featured ? (
                              <span className="inline-flex items-center gap-1 bg-[#e5173f]/10 text-[#e5173f] border border-[#e5173f]/20 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                                <Check size={10} /> Active
                              </span>
                            ) : (
                              <span className="text-slate-600 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => changeTab('watch', c.id)}
                              className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[#8888a8] hover:text-white rounded font-extrabold text-[10px] uppercase tracking-wider"
                            >
                              Watch
                            </button>
                            <button 
                              onClick={() => handleDeleteContent(c.id, c.title)}
                              className="px-2.5 py-1 bg-rose-950/40 border border-rose-500/15 text-rose-400 hover:bg-[#e5173f] hover:text-white rounded font-extrabold text-[10px] uppercase tracking-wider transition-all"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. ADD CONTENT FORM TAB */}
        {activeTab === 'add' && (
          <div className="space-y-6 animate-[slideIn_0.3s_ease] max-w-[800px] mx-auto">
            <button 
              onClick={() => changeTab('admin')}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#8888a8] hover:text-white uppercase tracking-widest bg-slate-950 px-4 py-2 border border-slate-900 rounded-lg transition-all active:scale-95"
            >
              <ChevronLeft size={14} /> Back to dashboard
            </button>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6 shadow-2xl">
              <div>
                <h2 className="text-lg font-black uppercase text-white tracking-widest">Metadata upload panel</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Manual details creation bypasses external automated Lookups perfectly.</p>
              </div>

              <form onSubmit={handleAddContent} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Release Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Aynabaji"
                      value={fTitle}
                      onChange={(e) => setFTitle(e.target.value)}
                      className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f] text-white font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Content format block *</label>
                    <select 
                      value={fType}
                      onChange={(e) => setFType(e.target.value as any)}
                      className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none text-slate-400 font-bold uppercase cursor-pointer focus:border-[#e5173f]"
                    >
                      <option value="movie">Movie</option>
                      <option value="series">TV Web Series</option>
                      <option value="short">Short Film</option>
                      <option value="documentary">Documentary</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Release Year</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2024"
                      value={fYear}
                      onChange={(e) => setFYear(e.target.value)}
                      className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f] text-white font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration (Minutes)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 132"
                      value={fDur}
                      onChange={(e) => setFDur(e.target.value)}
                      className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f] text-white font-semibold"
                    />
                  </div>
                </div>

                {/* CATEGORIES dropdown with inline addition trigger */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Content category genre</label>
                    <button 
                      type="button" 
                      onClick={() => setShowCatModal(true)}
                      className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1"
                    >
                      + Add New Category
                    </button>
                  </div>
                  <select 
                    value={fCat}
                    onChange={(e) => setFCat(e.target.value)}
                    className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none text-slate-400 font-bold uppercase cursor-pointer focus:border-[#e5173f]"
                  >
                    <option value="">None / Select genre</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Video stream direct URL *</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="https://example.com/video_file.mp4"
                    value={fVideo}
                    onChange={(e) => setFVideo(e.target.value)}
                    className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f] text-white font-mono"
                  />
                  <span className="text-[9px] font-bold text-slate-600 mt-0.5">DIRECT MP4, WEBM, OR COMPATIBLE HOSTED SECURE URLS REQUIRED.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Poster illustration graphics URL</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/photo-..."
                    value={fPoster}
                    onChange={(e) => setFPoster(e.target.value)}
                    className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f ] text-white font-mono"
                  />
                  <span className="text-[9px] font-bold text-slate-600 mt-0.5">vertical orientation graphics design works beautifully.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">release description / synopsis</label>
                  <textarea 
                    placeholder="Brief explanation on plot details, actors, characters..."
                    value={fDesc}
                    onChange={(e) => setFDesc(e.target.value)}
                    className="px-3 py-2.5 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f] text-white min-h-[90px] font-semibold"
                  />
                </div>

                <div className="p-3.5 bg-[#12121a]/60 border border-slate-900 rounded-xl flex items-center justify-between hover:border-slate-800 transition-all select-none">
                  <div>
                    <div className="font-extrabold text-xs text-white uppercase">Feature on Homepage Banner</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Toggle this block to trigger home page sliders</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={fFeat}
                      onChange={(e) => setFFeat(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e5173f] peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900">
                  <button 
                    type="button" 
                    onClick={() => changeTab('admin')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-[#e5173f] hover:bg-[#b01030] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
                  >
                    Save Release
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* QUICK NEW CATEGORY POPUP MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-widest">Register New Category</span>
              <button onClick={() => setShowCatModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category name *</label>
              <input 
                type="text" 
                autoFocus
                placeholder="e.g. Romance, Horror..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[#e5173f] text-white font-semibold"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setShowCatModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white  rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory}
                className="px-4 py-2 bg-[#e5173f] hover:bg-[#b01030] text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
