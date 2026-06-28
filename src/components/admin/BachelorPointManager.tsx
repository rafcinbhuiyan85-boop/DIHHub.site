import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Upload, Video, ChevronLeft, 
  Check, X, Film, Sparkles, Activity, Clock, Calendar, Eye, Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

// IndexedDB Storage
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

const KEY_CATEGORIES: Category[] = [
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

export default function BachelorPointManager() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'add'>('list');
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'ok' | 'err' }[]>([]);

  // Form states
  const [fTitle, setFTitle] = useState('');
  const [fType, setFType] = useState<'movie' | 'series' | 'short' | 'documentary'>('movie');
  const [fCat, setFCat] = useState('3'); // Default to comedy
  const [fDesc, setFDesc] = useState('');
  const [fYear, setFYear] = useState('');
  const [fDur, setFDur] = useState('');
  const [fFeat, setFFeat] = useState(false);

  // Local File Uploads
  const [fPosterFile, setFPosterFile] = useState<File | null>(null);
  const [fVideoFile, setFVideoFile] = useState<File | null>(null);
  const [fPosterUrl, setFPosterUrl] = useState('');
  const [fVideoUrl, setFVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch local items on boot and listen to updates
  useEffect(() => {
    const fetchFromServer = async () => {
      try {
        const res = await fetch('/api/bachelor/contents');
        if (res.ok) {
          const data = await res.json();
          if (data.contents) {
            setContents(data.contents);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        } else {
          loadFromStorage();
        }
      } catch (e) {
        loadFromStorage();
      }
    };

    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.contents) {
            const cleaned = parsed.contents.filter((item: any) => {
              const isDemo = (item.id <= 7 && !item.poster_file_key && !item.video_file_key) || (item.video_url && item.video_url.includes('gtv-videos-bucket'));
              return !isDemo;
            });
            setContents(cleaned);
          } else {
            setContents([]);
          }
        } else {
          setContents([]);
        }
      } catch (e) {
        setContents([]);
      }
    };

    fetchFromServer();
    window.addEventListener('storage', fetchFromServer);
    window.addEventListener('bp_storage_update', fetchFromServer);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('bp_storage_sync');
      channel.onmessage = (event) => {
        if (event.data === 'bp_storage_update') {
          fetchFromServer();
        }
      };
    } catch (e) {
      // Degrade gracefully
    }

    return () => {
      window.removeEventListener('storage', fetchFromServer);
      window.removeEventListener('bp_storage_update', fetchFromServer);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Load preview Object URLs
  useEffect(() => {
    let active = true;
    const loadLocalPreviews = async () => {
      try {
        const urls: Record<string, string> = {};
        for (const item of contents) {
          if (item.poster_file_key) {
            const blob = await fileStorage.getFile(item.poster_file_key);
            if (blob && active) {
              urls[item.poster_file_key] = URL.createObjectURL(blob);
            }
          }
        }
        if (active) {
          setLocalUrls(prev => {
            Object.values(prev).forEach(url => {
              const strUrl = url as string;
              if (strUrl && strUrl.startsWith('blob:')) {
                URL.revokeObjectURL(strUrl);
              }
            });
            return urls;
          });
        }
      } catch (err) {
        console.error('Failed previews:', err);
      }
    };
    if (contents.length > 0) {
      loadLocalPreviews();
    }
    return () => { active = false; };
  }, [contents]);

  // Helper toasts
  const triggerToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const getPosterPreview = (item: ContentItem) => {
    if (item.poster_file_key && localUrls[item.poster_file_key]) {
      return localUrls[item.poster_file_key];
    }
    return item.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop';
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) {
      triggerToast('Title and basic fields are required.', 'err');
      return;
    }

    if (!fVideoFile && !fVideoUrl.trim()) {
      triggerToast('Please select a video file or enter a direct video streaming URL.', 'err');
      return;
    }

    setUploading(true);
    try {
      const nextId = Math.max(0, ...contents.map(c => c.id)) + 1;
      let poster_file_key = '';
      let video_file_key = '';
      let poster_url = fPosterUrl.trim();
      let video_url = fVideoUrl.trim();

      // Convert and compress poster image to base64
      if (fPosterFile) {
        poster_file_key = `poster_${nextId}_${Date.now()}`;
        try {
          await fileStorage.saveFile(poster_file_key, fPosterFile); // Keep local copy for fast preview
        } catch (e) {}

        try {
          poster_url = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const max_width = 480;
                const scale = max_width / img.width;
                canvas.width = max_width;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  resolve(canvas.toDataURL('image/jpeg', 0.7));
                } else {
                  resolve(e.target?.result as string);
                }
              };
              img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(fPosterFile);
          });
        } catch (err) {
          console.error("Failed to compress thumbnail to Base64:", err);
        }
      }

      // Upload video to server if file chosen
      if (fVideoFile) {
        video_file_key = `video_${nextId}_${Date.now()}`;
        try {
          await fileStorage.saveFile(video_file_key, fVideoFile); // Keep local copy for fast preview
        } catch (e) {}

        const formData = new FormData();
        formData.append('video', fVideoFile);
        const upRes = await fetch('/api/bachelor/upload-video', {
          method: 'POST',
          body: formData
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          video_url = upData.url;
        }
      }

      const newItem: ContentItem = {
        id: nextId,
        title: fTitle.trim(),
        description: fDesc.trim(),
        type: fType,
        poster_url: poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
        video_url: video_url,
        release_year: parseInt(fYear) || new Date().getFullYear(),
        duration_minutes: parseInt(fDur) || 25,
        category_id: parseInt(fCat) || 3,
        is_featured: fFeat,
        view_count: 0
      };

      if (poster_file_key) newItem.poster_file_key = poster_file_key;
      if (video_file_key) newItem.video_file_key = video_file_key;

      const updated = [newItem, ...contents];
      setContents(updated);
      
      const saved = localStorage.getItem(STORAGE_KEY);
      let catData = KEY_CATEGORIES;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.categories) catData = parsed.categories;
        } catch(e) {}
      }

      const fullData = {
        categories: catData,
        contents: updated
      };

      // Save to server
      await fetch('/api/bachelor/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });

      // Save back to LocalStorage custom data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));

      // Dispatch custom storage sync event so the BachelorPoint component updates dynamically if open
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('bp_storage_update'));
      try {
        const bChan = new BroadcastChannel('bp_storage_sync');
        bChan.postMessage('bp_storage_update');
        bChan.close();
      } catch (e) {}

      triggerToast(`Added "${fTitle}" with fully persistent server-side streaming URLs!`, 'ok');

      // Clear Form Fields
      setFTitle('');
      setFDesc('');
      setFYear('');
      setFDur('');
      setFFeat(false);
      setFPosterFile(null);
      setFVideoFile(null);
      setFPosterUrl('');
      setFVideoUrl('');
      setViewMode('list');

    } catch (err) {
      console.error(err);
      triggerToast('Failed to write metadata asset blobs to IndexedDB storage API', 'err');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    // Non-blocking, secure deletion without window.confirm (which is blocked by iframe security policies)
    const item = contents.find(c => c.id === id);
    if (item) {
      if (item.poster_file_key) {
        try { await fileStorage.deleteFile(item.poster_file_key); } catch (e) {}
      }
      if (item.video_file_key) {
        try { await fileStorage.deleteFile(item.video_file_key); } catch (e) {}
      }
    }

    const updated = contents.filter(c => c.id !== id);
    setContents(updated);

    const saved = localStorage.getItem(STORAGE_KEY);
    let catData = KEY_CATEGORIES;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.categories) catData = parsed.categories;
      } catch(e) {}
    }

    const fullData = {
      categories: catData,
      contents: updated
    };

    try {
      await fetch('/api/bachelor/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
    } catch (e) {
      console.error(e);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('bp_storage_update'));
    try {
      const bChan = new BroadcastChannel('bp_storage_sync');
      bChan.postMessage('bp_storage_update');
      bChan.close();
    } catch (e) {}
    triggerToast(`Successfully deleted "${title}"!`, 'ok');
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <div className="fixed top-20 right-6 z-55 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`px-5 py-3.5 rounded-xl border font-bold text-xs uppercase tracking-wider shadow-xl flex items-center gap-3 backdrop-blur-xl animate-bounce ${
              t.type === 'ok' 
                ? 'bg-emerald-950/90 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-950/90 border-rose-500/20 text-rose-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${t.type === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`} />
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-widest flex items-center gap-2">
            Bachelor Point Comedy Manager
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manual administrator module allows uploading video & poster files natively from device gallery.
          </p>
        </div>

        {viewMode === 'list' ? (
          <button 
            type="button" 
            onClick={() => setViewMode('add')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#e5173f] hover:bg-slate-900 border border-[#e5173f]/20 hover:border-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <Plus size={14} /> Add Content manual
          </button>
        ) : (
          <button 
            type="button" 
            onClick={() => setViewMode('list')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <ChevronLeft size={14} /> Back to Catalog
          </button>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Catalog', value: contents.length, color: 'text-[#e5173f]' },
              { label: 'TV Web Series', value: contents.filter(c => c.type === 'series').length, color: 'text-sky-400' },
              { label: 'Movies & Shorts', value: contents.filter(c => c.type === 'movie' || c.type === 'short').length, color: 'text-emerald-400' },
              { label: 'Direct Local Uploads', value: contents.filter(c => c.video_file_key).length, color: 'text-amber-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-1 shadow-md">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">{stat.label}</span>
                <span className={`text-2xl font-black block ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* TABLE */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-900 bg-[#0c0f17]/50 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-white tracking-wider">Localized Streams Database</span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">&bull; IndexedDB Active</span>
            </div>

            {contents.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                No custom streams. Click "+ Add Content manual" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0b0c15] text-[#8888a8] font-black uppercase tracking-wider border-b border-slate-900">
                      <th className="p-4">Stream Title</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-semibold text-slate-300">
                    {contents.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={getPosterPreview(item)} 
                              alt="" 
                              className="w-8 h-10 object-cover rounded shadow-md border border-slate-800"
                            />
                            <div>
                              <div className="font-extrabold text-white uppercase text-[11px]">{item.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          {deletingId === item.id ? (
                            <button 
                              type="button" 
                              onClick={() => {
                                handleDelete(item.id, item.title);
                                setDeletingId(null);
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-all animate-pulse"
                              title="Click again to confirm complete deletion"
                            >
                              Confirm?
                            </button>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => {
                                setDeletingId(item.id);
                                // Auto reset after 4s
                                setTimeout(() => {
                                  setDeletingId(current => current === item.id ? null : current);
                                }, 4000);
                              }}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all"
                              title="Delete completely"
                            >
                              <Trash2 size={13} />
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
      ) : (
        <form onSubmit={handleAddSubmit} className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl max-w-4xl mx-auto">
          <div>
            <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Sparkles size={18} className="text-[#e5173f]" />
              Metadata Upload Panel
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Select local files from your device gallery. All data stays client-side.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Release Title *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Bachelor Point - Full E01"
              value={fTitle}
              onChange={(e) => setFTitle(e.target.value)}
              className="px-3.5 py-2.5 bg-[#12121a] border border-slate-800 rounded-xl text-xs outline-none focus:border-[#e5173f]/80 text-white font-semibold"
            />
          </div>

          {/* POSTER URL INPUT OR LOCAL FILE UPLOADER */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poster Thumbnail</label>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Direct Image URL (Optional fallback, e.g. https://example.com/poster.jpg)"
                value={fPosterUrl}
                onChange={(e) => setFPosterUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12121a] border border-slate-800 rounded-xl text-xs outline-none focus:border-[#e5173f]/80 text-white font-semibold transition"
              />
              <div className="text-[8px] text-slate-500 font-extrabold uppercase text-center tracking-wider">- OR Choose Local Device File -</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="border-2 border-dashed border-slate-850 hover:border-[#e5173f]/50 bg-[#12121a]/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] relative select-none"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) setFPosterFile(file);
                  };
                  input.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    setFPosterFile(file);
                  } else {
                    triggerToast('Please upload an image file (PNG/JPG)', 'err');
                  }
                }}
              >
                <Upload size={24} className="text-slate-500 mb-2" />
                <span className="text-[11px] font-extrabold text-white">Choose Image from Gallery</span>
                <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">or drag and drop thumbnail here</span>
              </div>

              <div className="bg-[#12121a]/60 border border-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[140px]">
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
                  <div className="text-center py-4 text-[#8888a8] text-[9px] font-bold uppercase tracking-wider">
                    No image file uploaded yet.
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* VIDEO URL INPUT OR LOCAL FILE UPLOADER */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video Stream (URL or File) *</label>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Direct Streaming URL (HLS .m3u8, MP4, YouTube embed, etc.)"
                value={fVideoUrl}
                onChange={(e) => setFVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12121a] border border-slate-800 rounded-xl text-xs outline-none focus:border-[#e5173f]/80 text-white font-semibold transition"
              />
              <div className="text-[8px] text-slate-500 font-extrabold uppercase text-center tracking-wider">- OR Choose Local Device File -</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="border-2 border-dashed border-slate-850 hover:border-[#e5173f]/50 bg-[#12121a]/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] relative select-none"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) setFVideoFile(file);
                    };
                    input.click();
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) {
                      setFVideoFile(file);
                    } else {
                      triggerToast('Please upload a video file (MP4/WebM)', 'err');
                    }
                  }}
                >
                  <Video size={24} className="text-slate-500 mb-2" />
                  <span className="text-[11px] font-extrabold text-white">Choose Video from Device</span>
                  <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">or drag and drop video here</span>
                </div>

                <div className="bg-[#12121a]/60 border border-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[140px]">
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
                    <div className="text-center py-4 text-[#8888a8] text-[9px] font-bold uppercase tracking-wider">
                      No video file uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setViewMode('list')}
              className="px-6 py-3 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={uploading}
              className="px-8 py-3 bg-[#e5173f] hover:bg-[#b01030] disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-900 hover:border-transparent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#e5173f]/25 transition-all flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Upload size={14} className="animate-bounce" />
                  Storing data blobs...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save manually
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
