import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Globe, 
  Save, 
  X, 
  Layout, 
  Code2, 
  Settings2,
  ExternalLink,
  ChevronRight,
  Search,
  Lock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HtmlTemplate {
  id: string; // the slug
  name: string;
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  category: string;
  createdAt: any;
}

export default function AdminTemplates() {
  const [user, setUser] = useState<any>(null);
  const [templates, setTemplates] = useState<HtmlTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState<Partial<HtmlTemplate>>({
    id: '',
    name: '',
    htmlContent: '',
    cssContent: '',
    jsContent: '',
    category: 'Wish'
  });

  const PRESETS = [
    {
      name: 'GF Romantic Birthday',
      category: 'Birthday',
      html: `<div class="heart-bg">
  <div class="content">
    <h1 class="animate-pop">Happy Birthday Princess! 👑</h1>
    <p>Every day with you is a gift. Today, it's your turn to be gifted.</p>
    <div class="candle"></div>
    <div class="floating-hearts">❤️</div>
  </div>
</div>`,
      css: `@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Poppins:wght@300;600&display=swap');
.heart-bg { 
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
  height: 100vh; display: flex; align-items: center; justify-content: center;
  text-align: center; color: #fff; font-family: 'Poppins', sans-serif;
  overflow: hidden; position: relative;
}
.content { position: relative; z-index: 2; padding: 40px; border-radius: 40px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.2); }
h1 { font-family: 'Dancing Script', cursive; font-size: 5rem; margin-bottom: 20px; text-shadow: 2px 2px 20px rgba(0,0,0,0.1); color: #fff; }
p { font-size: 1.2rem; font-weight: 300; letter-spacing: 2px; }
.animate-pop { animation: pop 1s cubic-bezier(0.17, 0.67, 0.83, 0.67) infinite alternate; }
@keyframes pop { from { transform: scale(1); } to { transform: scale(1.05); } }
.floating-hearts { position: absolute; font-size: 2rem; animation: float 3s linear infinite; }
@keyframes float { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(-500px) rotate(360deg); opacity: 0; } }`,
      js: `setInterval(() => {
  const heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.className = 'floating-hearts';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.top = '100vh';
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 3000);
}, 300);`
    },
    {
      name: 'BF Success/Grind',
      category: 'Wish',
      html: `<div class="dark-grid">
  <div class="status-badge">REACHING NEXT LEVEL</div>
  <h1 class="glitch" data-text="CHASE GREATNESS">CHASE GREATNESS</h1>
  <div class="stats-panel">
    <div class="stat"><span>LEVEL</span><h3>99</h3></div>
    <div class="stat"><span>POWER</span><h3>MAX</h3></div>
  </div>
  <p>To my legendary man. The world isn't ready for what's coming.</p>
</div>`,
      css: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&family=Inter:wght@900&display=swap');
.dark-grid {
  background: #000; background-image: radial-gradient(#333 1px, transparent 1px); background-size: 40px 40px;
  height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #fff; font-family: 'Inter', sans-serif; text-align: center;
}
.status-badge { background: #fbbf24; color: #000; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 900; margin-bottom: 20px; }
h1 { font-size: 7rem; font-weight: 900; line-height: 0.9; margin: 0; color: #fff; }
.stats-panel { display: flex; gap: 40px; margin: 40px 0; }
.stat { text-align: left; }
.stat span { color: #555; font-size: 12px; font-weight: bold; }
.stat h3 { margin: 0; font-size: 3rem; font-family: 'JetBrains Mono'; color: #fbbf24; }
p { color: #888; max-width: 400px; font-weight: 500; font-size: 18px; }`,
      js: `/* Logic for BF success template */`
    },
    {
        name: 'Pro Landing Page',
        category: 'Landing',
        html: `<nav><div>LOGO</div><button>Contact</button></nav>
<section>
  <h1>Build your <span>Dreams</span> Fast.</h1>
  <p>The ultimate solution for high-conversion web experiences. Deploy in seconds, scale infinitely.</p>
  <button class="cta">Get Started Free</button>
</section>`,
        css: `body { margin: 0; background: #fafafa; font-family: system-ui; }
nav { padding: 20px 80px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
section { max-width: 1000px; margin: 100px auto; text-align: center; }
h1 { font-size: 5rem; font-weight: 900; letter-spacing: -3px; }
h1 span { color: #f97316; }
p { color: #666; font-size: 1.5rem; max-width: 600px; margin: 20px auto; }
.cta { background: #000; color: #fff; padding: 20px 40px; border-radius: 50px; font-weight: bold; font-size: 1.1rem; border: none; cursor: pointer; transition: 0.3s; }
.cta:hover { transform: scale(1.05); }`,
        js: `console.log('Landing Page Ready');`
    }
  ];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      category: preset.category,
      htmlContent: preset.html,
      cssContent: preset.css,
      jsContent: preset.js
    });
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ ...d.data() } as HtmlTemplate));
      setTemplates(docs);
    });
    return () => unsub();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.htmlContent) return;

    try {
      const templateDoc = doc(db, 'templates', formData.id);
      await setDoc(templateDoc, {
        ...formData,
        createdAt: formData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      setIsEditing(false);
      resetForm();
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Failed to save template. Check permissions.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteDoc(doc(db, 'templates', id));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      htmlContent: '',
      cssContent: '',
      jsContent: '',
      category: 'Wish'
    });
  };

  const handleEdit = (t: HtmlTemplate) => {
    setFormData(t);
    setIsEditing(true);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#161618] border border-white/5 p-8 rounded-3xl shadow-2xl text-center space-y-8"
      >
        <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="text-orange-500" size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400">Please sign in to manage your templates</p>
        </div>
        <button 
          onClick={() => signInWithPopup(auth, googleProvider)}
          className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Globe className="text-orange-500" />
              Template Manager
            </h1>
            <p className="text-slate-500 font-medium">Create and host custom HTML experiences</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#161618] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold w-full md:w-64 focus:border-orange-500/50 outline-none transition-all"
              />
            </div>
            
            <button 
              onClick={() => { resetForm(); setIsEditing(true); }}
              className="bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-2xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="bg-[#161618] border border-white/5 p-3 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTemplates.map(t => (
              <motion.div 
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#161618] border border-white/5 rounded-3xl p-6 group hover:border-orange-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
                      {t.category || 'Static'}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(t)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-500/5 rounded-xl text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">{t.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">/{t.id}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600">Created: {t.createdAt?.toDate().toLocaleDateString()}</span>
                  <a 
                    href={`/t/${t.id}`} 
                    target="_blank"
                    className="flex items-center gap-2 text-xs font-black text-white hover:text-orange-500 transition-colors"
                  >
                    View Live <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTemplates.length === 0 && !isEditing && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Layout className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold">No templates found. Click + to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Modal for Editing */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 px-4 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#161618] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1a1a1c]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                      <Settings2 size={20} />
                    </div>
                    <h2 className="text-xl font-bold">Template Config</h2>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white p-2"><X /></button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {/* Presets Selection */}
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Quick Presets (GF/BF/Wish)</label>
                    <div className="flex flex-wrap gap-3">
                      {PRESETS.map((p, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold hover:bg-orange-500/10 hover:border-orange-500/30 transition-all flex items-center gap-2"
                        >
                          <Zap size={14} className="text-orange-500" />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">Template ID / Slug</label>
                      <input 
                        type="text" 
                        placeholder="e.g. birthday-2024"
                        value={formData.id}
                        onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-4 py-3 font-bold focus:border-orange-500 outline-none transition-all"
                        required
                      />
                      <p className="text-[10px] text-slate-600">This becomes the URL: yoursite.com/t/{formData.id || 'slug'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">Display Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. My Cool Birthday Wish"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-4 py-3 font-bold focus:border-orange-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-500">Live Preview</label>
                       <div className="w-full h-48 bg-white rounded-xl overflow-hidden border border-white/5 relative group">
                          <iframe 
                            srcDoc={`
                              <html>
                                <head><style>${formData.cssContent || ''}</style></head>
                                <body>${formData.htmlContent || ''}</body>
                                <script>${formData.jsContent || ''}</script>
                              </html>
                            `}
                            className="w-full h-full border-none"
                            title="Preview"
                          />
                          <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-orange-500/50 transition-all rounded-xl"></div>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Code2 size={14} className="text-orange-500" />
                          HTML Content
                        </label>
                      </div>
                      <textarea 
                        rows={8}
                        value={formData.htmlContent}
                        onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                        className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-4 py-3 font-mono text-sm focus:border-orange-500 outline-none transition-all custom-scrollbar"
                        placeholder="<div>Your HTML here...</div>"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">CSS (Optional)</label>
                        <textarea 
                          rows={6}
                          value={formData.cssContent}
                          onChange={e => setFormData({ ...formData, cssContent: e.target.value })}
                          className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-4 py-3 font-mono text-sm focus:border-orange-500 outline-none transition-all custom-scrollbar"
                          placeholder="body { background: red; }"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">JavaScript (Optional)</label>
                        <textarea 
                          rows={6}
                          value={formData.jsContent}
                          onChange={e => setFormData({ ...formData, jsContent: e.target.value })}
                          className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-4 py-3 font-mono text-sm focus:border-orange-500 outline-none transition-all custom-scrollbar"
                          placeholder="console.log('hello world');"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-orange-600/10"
                    >
                      <Save size={20} />
                      Save Template
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}
