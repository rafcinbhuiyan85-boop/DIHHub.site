import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Info, Star, Flame, Clock, Tv, Sparkles, Film, Heart, 
  Search, X, ChevronLeft, Trash2, Plus, RefreshCw, Layers, Check,
  Upload, HardDrive, FileText, Video
} from 'lucide-react';
import { useAppSettings } from '../../hooks/useAppSettings';
import { cn } from '../../lib/utils';
import bachelorPointS5Poster from '../../assets/images/bachelor_point_s5_premium_1781464542219.jpg';

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
  poster_file_key?: string;
  video_file_key?: string;
}

// Helper for storing and retrieving files from IndexedDB
class FileStorage {
  private dbName = 'bachelor_point_db_v3';
  private storeName = 'files';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async saveFile(key: string, file: File | Blob): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(file, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(key: string): Promise<Blob | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const fileStorage = new FileStorage();

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

const INITIAL_CONTENTS: ContentItem[] = [];

export default function BachelorPoint() {
  const { settings } = useAppSettings();
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
  const [fYear, setFYear] = useState('');
  const [fDur, setFDur] = useState('');
  const [fFeat, setFFeat] = useState(false);

  // File pick / upload states
  const [fPosterFile, setFPosterFile] = useState<File | null>(null);
  const [fVideoFile, setFVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});

  // Notifications (Toasts)
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'ok' | 'err' }[]>([]);

  // Video container reference for scrolling top
  const playerRef = useRef<HTMLVideoElement>(null);

  // State for delete confirmation to avoid window.confirm in iframe sandbox
  const [bDeletingId, setBDeletingId] = useState<number | null>(null);

  // Load from LS on boot and keep synchronized
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.categories) setCategories(parsed.categories);
          if (parsed.contents) {
            // Filter out any default demo videos (with ID <= 7 or gtv-videos-bucket URLs)
            const cleaned = parsed.contents.filter((item: any) => {
              const isDemo = item.id <= 7 || (item.video_url && item.video_url.includes('gtv-videos-bucket'));
              return !isDemo;
            });
            setContents(cleaned);
            if (cleaned.length !== parsed.contents.length) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                categories: parsed.categories || KEY_CATEGORIES,
                contents: cleaned
              }));
              window.dispatchEvent(new Event('bp_storage_update'));
              try {
                const bChan = new BroadcastChannel('bp_storage_sync');
                bChan.postMessage('bp_storage_update');
                bChan.close();
              } catch (e) {}
            }
          }
        } else {
          setContents([]);
        }
      } catch (e) {
        console.error('Failed to load custom streamer data', e);
      }
    };

    loadFromStorage();
    window.addEventListener('storage', loadFromStorage);
    window.addEventListener('bp_storage_update', loadFromStorage);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('bp_storage_sync');
      channel.onmessage = (event) => {
        if (event.data === 'bp_storage_update') {
          loadFromStorage();
        }
      };
    } catch (e) {
      // fallback
    }

    return () => {
      window.removeEventListener('storage', loadFromStorage);
      window.removeEventListener('bp_storage_update', loadFromStorage);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Load local media Blob URLs from IndexedDB
  useEffect(() => {
    let active = true;
    const loadLocalMedia = async () => {
      try {
        const urls: Record<string, string> = {};
        for (const item of contents) {
          if (item.poster_file_key) {
            const blob = await fileStorage.getFile(item.poster_file_key);
            if (blob && active) {
              urls[item.poster_file_key] = URL.createObjectURL(blob);
            }
          }
          if (item.video_file_key) {
            const blob = await fileStorage.getFile(item.video_file_key);
            if (blob && active) {
              urls[item.video_file_key] = URL.createObjectURL(blob);
            }
          }
        }
        if (active) {
          setLocalUrls(prev => {
            // Revoke old object URLs to prevent memory leaks
            Object.values(prev).forEach(url => {
              const strUrl = url as string;
              if (strUrl && strUrl.startsWith('blob:')) {
                URL.revokeObjectURL(strUrl);
              }
            });
            return urls;
          });
        }
      } catch (e) {
        console.error('Error loading local IndexedDB media:', e);
      }
    };
    loadLocalMedia();

    return () => {
      active = false;
    };
  }, [contents]);

  const getPosterUrl = (item: ContentItem) => {
    if (item.poster_file_key && localUrls[item.poster_file_key]) {
      return localUrls[item.poster_file_key];
    }
    return item.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop';
  };

  const getVideoUrl = (item: ContentItem) => {
    if (item.video_file_key && localUrls[item.video_file_key]) {
      return localUrls[item.video_file_key];
    }
    return item.video_url;
  };

  // Save to LS whenever data changes
  const saveData = (nextCats: Category[], nextItems: ContentItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        categories: nextCats,
        contents: nextItems
      }));
      window.dispatchEvent(new Event('bp_storage_update'));
      try {
        const bChan = new BroadcastChannel('bp_storage_sync');
        bChan.postMessage('bp_storage_update');
        bChan.close();
      } catch (e) {}
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

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) {
      showToast('Please fill out Title', 'err');
      return;
    }

    if (!fVideoFile) {
      showToast('Please select a video file from your device.', 'err');
      return;
    }

    setUploading(true);
    try {
      const nextId = Math.max(0, ...contents.map(c => c.id)) + 1;
      let poster_file_key = '';
      let video_file_key = '';

      if (fPosterFile) {
        poster_file_key = `poster_${nextId}_${Date.now()}`;
        await fileStorage.saveFile(poster_file_key, fPosterFile);
      }

      if (fVideoFile) {
        video_file_key = `video_${nextId}_${Date.now()}`;
        await fileStorage.saveFile(video_file_key, fVideoFile);
      }

      const newItem: ContentItem = {
        id: nextId,
        title: fTitle.trim(),
        type: fType,
        video_url: '',
        description: fDesc.trim() || 'No description provided.',
        poster_url: '',
        release_year: parseInt(fYear) || new Date().getFullYear(),
        duration_minutes: parseInt(fDur) || 120,
        category_id: parseInt(fCat) || 3, // Default to Comedy (Bengali Comedy starts here)
        is_featured: fFeat,
        view_count: 0
      };

      if (poster_file_key) newItem.poster_file_key = poster_file_key;
      if (video_file_key) newItem.video_file_key = video_file_key;

      const updated = [newItem, ...contents];
      setContents(updated);
      saveData(categories, updated);
      showToast(`Added "${fTitle}" successfully!`, 'ok');

      // Reset Form
      setFTitle('');
      setFType('movie');
      setFCat('');
      setFDesc('');
      setFYear('');
      setFDur('');
      setFFeat(false);
      setFPosterFile(null);
      setFVideoFile(null);

      changeTab('admin');
    } catch (err) {
      console.error(err);
      showToast('Error uploading local files to device storage', 'err');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteContent = async (id: number, title: string) => {
    // Attempt deleting associated offline storage keys
    const item = contents.find(c => c.id === id);
    if (item) {
      if (item.poster_file_key) {
        try { await fileStorage.deleteFile(item.poster_file_key); } catch(e) { console.error(e); }
      }
      if (item.video_file_key) {
        try { await fileStorage.deleteFile(item.video_file_key); } catch(e) { console.error(e); }
      }
    }

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
  const recent = [...contents]
    .sort((a,b) => b.id - a.id)
    .filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // User uploaded custom-only (Newly added items)
  const newlyAddedOnly = recent.filter(item => item.id > 7 || !!item.poster_file_key || !!item.video_file_key);

  // Filters calculation
  const filteredBrowse = contents.filter(c => {
    if (browseSearch && !c.title.toLowerCase().includes(browseSearch.toLowerCase())) return false;
    if (browseType && c.type !== browseType) return false;
    if (browseCat && c.category_id !== parseInt(browseCat)) return false;
    return true;
  });

  const activeWatchItem = contents.find(c => c.id === selectedWatchId);
  const isColorTheme = settings.bachelorEnableColorTheme !== false;
  const bpPrimary = isColorTheme ? '#e5173f' : '#3b82f6';
  const bpHover = isColorTheme ? '#b01030' : '#1d4ed8';
  const bgRgb = isColorTheme ? '7, 9, 15' : '9, 15, 30';

  return (
    <div 
      style={{
        '--bp-primary': bpPrimary,
        '--bp-hover': bpHover,
      } as React.CSSProperties}
      className={cn("min-h-screen pb-16 font-sans relative", isColorTheme ? "bg-[#07090f] text-[#f0f0f5]" : "bg-[#090f1e] text-slate-100")}
    >
      
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
        
        {/* Sub Navigation */}
        <nav className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mb-6 border-b sticky top-0 z-40 backdrop-blur-xl", isColorTheme ? "border-[#ff003c]/10 bg-[#07090f]/95 text-white" : "border-slate-800 bg-[#090f1e]/95 text-slate-100")}>
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => changeTab('home')}>
            <div>
              <div className="text-[9px] font-black tracking-[0.2em] text-[var(--bp-primary)] uppercase">BANGLA COMEDY</div>
              <div className="text-sm font-black tracking-widest text-[var(--bp-primary)] uppercase">Bachelor Point S-5</div>
            </div>
          </div>

          <div className="relative w-full sm:w-[220px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveTab('home');
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs outline-none text-white focus:border-[var(--bp-primary)]/50 transition-all font-semibold"
            />
          </div>
        </nav>

        {/* 1. HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-[slideIn_0.3s_ease] select-none">
            
            {/* HERO BANNER */}
            {heroContent && !searchQuery ? (
              <div 
                className="relative min-h-[460px] rounded-2xl md:rounded-3xl overflow-hidden border border-slate-900 bg-center bg-cover flex items-end shadow-2xl"
                style={{ backgroundImage: `linear-gradient(to right, rgba(7,9,15,0.95) 45%, rgba(7,9,15,0.3) 100%), linear-gradient(to top, rgba(7,9,15,0.98) 10%, transparent 60%), url('${getPosterUrl(heroContent)}')` }}
              >
                <div className="p-6 md:p-12 max-w-xl space-y-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                    {heroContent.title}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                    {heroContent.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                      onClick={() => changeTab('watch', heroContent.id)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bp-primary)] hover:bg-[var(--bp-hover)] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-[var(--bp-primary)]/20 hover:-translate-y-0.5 active:scale-95"
                    >
                      <Play size={14} fill="white" /> Start Watching
                    </button>
                  </div>
                </div>
              </div>
            ) : null}


            {/* SECTION 1: NEWLY ADDED (CUSTOM NEW RELEASES ONLY) */}
            {newlyAddedOnly.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[var(--bp-primary)] rounded-sm" /> Newly Uploaded (New Only)
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {newlyAddedOnly.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => changeTab('watch', item.id)}
                      className="group cursor-pointer bg-slate-950 border border-slate-905 rounded-xl overflow-hidden hover:scale-105 active:scale-98 transition-all hover:shadow-2xl hover:shadow-[var(--bp-primary)]/5"
                    >
                      <div className="aspect-[2/3] relative bg-[#12121a] overflow-hidden">
                        <img 
                          src={getPosterUrl(item)} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <div className="w-11 h-11 rounded-full bg-[var(--bp-primary)] flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-[var(--bp-primary)]/20">
                            <Play size={16} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-[11px] font-black text-[#f0f0f5] truncate uppercase tracking-tight">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: COMPLETE COLLECTION */}
            {contents.length > 0 && (
              <div className="space-y-5 pt-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-slate-500 rounded-sm" /> Complete Collection (Old + New)
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recent.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => changeTab('watch', item.id)}
                      className="group cursor-pointer bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:scale-105 active:scale-98 transition-all hover:shadow-2xl"
                    >
                      <div className="aspect-[2/3] relative bg-[#12121a] overflow-hidden">
                        <img 
                          src={getPosterUrl(item)} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play size={16} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                        {(item.id > 7 || item.poster_file_key || item.video_file_key) && (
                          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
                            <span className="bg-[var(--bp-primary)] text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                              New
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-[11px] font-black text-[#f0f0f5] truncate uppercase tracking-tight">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[var(--bp-primary)]/40 font-semibold text-white"
              />

              <select 
                value={browseType} 
                onChange={(e) => setBrowseType(e.target.value)}
                className="px-4 py-2.5 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none text-slate-400 font-extrabold uppercase cursor-pointer focus:border-[var(--bp-primary)]"
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
                className="px-4 py-2.5 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none text-slate-400 font-extrabold uppercase cursor-pointer focus:border-[var(--bp-primary)]"
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
                        src={getPosterUrl(item)} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <div className="w-11 h-11 rounded-full bg-[var(--bp-primary)] flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                          <Play size={16} fill="white" className="text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[11px] font-black text-[#f0f0f5] truncate uppercase tracking-tight">
                        {item.title}
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
                key={getVideoUrl(activeWatchItem)}
                ref={playerRef}
                controls 
                autoPlay 
                preload="metadata" 
                poster={getPosterUrl(activeWatchItem)}
                className="w-full aspect-[16/9] max-h-[600px] object-contain"
              >
                <source src={getVideoUrl(activeWatchItem)} type="video/mp4" />
                Your browser does not support HTML5 video streaming. Please update browser protocols.
              </video>
              
              {/* Custom Logo overlay like HTML */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-800 pointer-events-none">
                <span className="text-[10px] font-black text-white/95">DIH <span className="text-[var(--bp-primary)]">CINEMA</span></span>
              </div>
            </div>

            {/* INFORMATION AREA */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-xl">
              <h1 className="text-2xl font-black text-white uppercase tracking-wide leading-tight">
                {activeWatchItem.title}
              </h1>
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[var(--bp-primary)] hover:bg-[var(--bp-hover)] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
              >
                <Plus size={14} /> Add Content manual
              </button>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Streams', value: contents.length, color: 'text-[var(--bp-primary)]' },
                { label: 'Movies Listed', value: contents.filter(c => c.type === 'movie').length, color: 'text-sky-400' },
                { label: 'Web Series', value: contents.filter(c => c.type === 'series').length, color: 'text-[var(--bp-primary)]' },
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
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 font-semibold text-slate-300">
                      {contents.map(c => (
                        <tr key={c.id} className="hover:bg-[#12121a]/40 transition-colors">
                          <td className="p-3.5 max-w-[200px] truncate font-bold text-white uppercase">{c.title}</td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => changeTab('watch', c.id)}
                              className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[#8888a8] hover:text-white rounded font-extrabold text-[10px] uppercase tracking-wider"
                            >
                              Watch
                            </button>
                            {bDeletingId === c.id ? (
                               <button 
                                onClick={() => {
                                  handleDeleteContent(c.id, c.title);
                                  setBDeletingId(null);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-black text-[10px] uppercase tracking-wider transition-all animate-pulse"
                                title="Click again to confirm delete"
                              >
                                Confirm?
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setBDeletingId(c.id);
                                  setTimeout(() => {
                                    setBDeletingId(current => current === c.id ? null : current);
                                  }, 4000);
                                }}
                                className="px-2.5 py-1 bg-rose-950/40 border border-rose-500/15 text-rose-400 hover:bg-[var(--bp-primary)] hover:text-white rounded font-extrabold text-[10px] uppercase tracking-wider transition-all"
                              >
                                Delete
                              </button>
                            )}
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Release Title *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Aynabaji"
                    value={fTitle}
                    onChange={(e) => setFTitle(e.target.value)}
                    className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[var(--bp-primary)] text-white font-semibold"
                  />
                </div>

                  {/* LOCAL FILE UPLOADER FOR POSTER THUMBNAIL */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Poster Thumbnail Graphic (Optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className="border-2 border-dashed border-slate-850 hover:border-[var(--bp-primary)]/50 bg-[#12121a]/30 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] relative select-none"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          setFPosterFile(file);
                        } else {
                          showToast('Please upload an image file (PNG/JPG)', 'err');
                        }
                      }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) setFPosterFile(file);
                        };
                        input.click();
                      }}
                    >
                      <Upload size={24} className="text-slate-500 mb-2" />
                      <span className="text-[11px] font-extrabold text-white">Choose Image from Gallery</span>
                      <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">or drag and drop thumbnail here</span>
                    </div>

                    <div className="bg-[#12121a]/60 border border-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[140px]">
                      {fPosterFile ? (
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-16 h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
                            <img src={URL.createObjectURL(fPosterFile)} alt="Poster preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <Check size={12} /> Local File Selected
                            </div>
                            <div className="text-xs font-bold text-white truncate mt-0.5">{fPosterFile.name}</div>
                            <div className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase">{(fPosterFile.size / 1024 / 1024).toFixed(2)} MB</div>
                            <button 
                              type="button" 
                              onClick={() => setFPosterFile(null)}
                              className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest mt-2 flex items-center gap-1"
                            >
                              <X size={10} /> Clear selection
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-[#8888a8] text-[10px] font-bold uppercase tracking-wider">
                          No poster file uploaded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* LOCAL FILE UPLOADER FOR VIDEO */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Video File Upload *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className="border-2 border-dashed border-slate-850 hover:border-[var(--bp-primary)]/50 bg-[#12121a]/30 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] relative select-none"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('video/')) {
                          setFVideoFile(file);
                        } else {
                          showToast('Please upload a video file (MP4/WebM)', 'err');
                        }
                      }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) setFVideoFile(file);
                        };
                        input.click();
                      }}
                    >
                      <Video size={24} className="text-slate-500 mb-2" />
                      <span className="text-[11px] font-extrabold text-white">Choose Video from Device</span>
                      <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">or drag and drop video here</span>
                    </div>

                    <div className="bg-[#12121a]/60 border border-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[140px]">
                      {fVideoFile ? (
                        <div className="w-full">
                          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                            <Check size={12} /> Video File Selected
                          </div>
                          <div className="text-xs font-bold text-white truncate mt-1">{fVideoFile.name}</div>
                          <div className="text-[10px] text-slate-500 font-black mt-0.5 uppercase">{(fVideoFile.size / 1024 / 1024).toFixed(2)} MB</div>
                          <button 
                            type="button" 
                            onClick={() => setFVideoFile(null)}
                            className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest mt-2.5 flex items-center gap-1"
                          >
                            <X size={10} /> Clear selection
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-[#8888a8] text-[10px] font-bold uppercase tracking-wider">
                          No video file uploaded yet.
                        </div>
                      )}
                    </div>
                  </div>
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
                    className="px-6 py-2.5 bg-[var(--bp-primary)] hover:bg-[var(--bp-hover)] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
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
                className="px-3 py-2 bg-[#12121a] border border-slate-800 rounded-lg text-xs outline-none focus:border-[var(--bp-primary)] text-white font-semibold"
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
                className="px-4 py-2 bg-[var(--bp-primary)] hover:bg-[var(--bp-hover)] text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
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
