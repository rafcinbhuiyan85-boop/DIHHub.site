import React, { useState, useEffect } from 'react';
import { 
  Settings, Key, Layers, Eye, EyeOff, Plus, 
  Trash2, Save, LogOut, ChevronRight, Activity, Menu,
  LayoutDashboard, Palette, QrCode, ShieldCheck, Download, Image, ShieldAlert, Cpu, Smartphone, Mail, MessageSquare, Film, Scissors, Cloud,
  Users, ListFilter, Calendar, Clock, Upload, Package, Star, ArrowUp, ArrowDown, Layout, Calculator, RefreshCcw, Globe, Edit2, Code2, Settings2, ExternalLink, Zap, Search, X, Copy, Check, Shield, DollarSign, Rocket,
  Tv, Video
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  Timestamp,
  orderBy,
  getFirestore
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { initializeApp, getApps } from 'firebase/app';
import { useAppSettings, Template, AppSettings, DEFAULT_SETTINGS } from '../../hooks/useAppSettings';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import BachelorPointManager from './BachelorPointManager';

interface AdminPanelProps {
  onLogout: () => void;
}

interface UserLog {
  id: string;
  timestamp: string;
  type: string;
  tool: string;
  ip: string;
  details?: any;
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  registeredAt: string;
  lastActive: string;
  status: string;
}

interface HtmlTemplate {
  id: string;
  name: string;
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  createdAt: any;
}

import bachelorPointS5Poster from '../../assets/images/bachelor_point_s5_premium_1781464542219.jpg';

export interface BP_Category {
  id: number;
  name: string;
}

export interface BP_ContentItem {
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

class BP_FileStorage {
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

const bpFileStorage = new BP_FileStorage();
const BP_STORAGE_KEY = 'bp_s5_custom_data_v2';

const BP_INITIAL_CONTENTS: BP_ContentItem[] = [
  {
    id: 1,
    title: 'Bachelor Point Season 5',
    description: 'The beloved Bangla comedy series returns with a brand new season full of humor and heart from the bachelor boys of Dhaka.',
    type: 'series',
    poster_url: bachelorPointS5Poster,
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

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { settings, updateSettings, addTemplate, removeTemplate } = useAppSettings();
  const [activeTab, setActiveTab] = useState<'tools' | 'templates' | 'store' | 'users' | 'general' | 'appearance' | 'dashboard' | 'dashboard-stats' | 'dashboard-counter' | 'dashboard-traffic' | 'api-keys' | 'api-systems' | 'api-payment' | 'config-video' | 'config-movies' | 'config-ai' | 'config-ads' | 'hosted-templates' | 'config-maintenance' | 'config-bachelor-point'>('dashboard');
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({ name: '', width: 800, height: 600, category: 'Custom' });
  
  // HTML Hosting State
  const [htmlTemplates, setHtmlTemplates] = useState<HtmlTemplate[]>([]);
  const [isEditingHtml, setIsEditingHtml] = useState(false);
  const [htmlSearch, setHtmlSearch] = useState('');
  const [htmlFormData, setHtmlFormData] = useState<Partial<HtmlTemplate>>({
    id: '',
    name: '',
    htmlContent: '',
    cssContent: '',
    jsContent: '',
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  
  // Real-time Firebase maintenance states
  const [maintenanceModeLive, setMaintenanceModeLive] = useState<boolean | null>(null);
  const [maintenanceConnectionStatus, setMaintenanceConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isCopiedHtmlCode, setIsCopiedHtmlCode] = useState(false);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/t/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const PRESETS = [
    {
      name: 'GF Romantic Birthday',
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
    },
    {
      name: 'BF/GF Surprise',
      html: `<div class="min-h-screen bg-pink-50 flex items-center justify-center font-sans p-6">
  <div class="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center space-y-6">
    <div class="text-5xl">❤️</div>
    <h1 class="text-3xl font-black text-pink-600">Surprise My Love!</h1>
    <p class="text-slate-600">Every moment I spend with you is like a beautiful dream come true. You are my everything.</p>
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-pink-100 p-4 rounded-2xl"><div class="text-2xl font-bold text-pink-600">365</div><div class="text-xs text-pink-400 font-bold uppercase">Days</div></div>
      <div class="bg-pink-100 p-4 rounded-2xl"><div class="text-2xl font-bold text-pink-600">∞</div><div class="text-xs text-pink-400 font-bold uppercase">Love</div></div>
    </div>
    <button class="w-full py-4 bg-pink-600 text-white rounded-2xl font-black shadow-lg shadow-pink-200">Open Our Memories</button>
  </div>
</div>`,
      css: '',
      js: ''
    },
    {
      name: 'Birthday Wish',
      html: `<div class="min-h-screen bg-indigo-950 flex items-center justify-center font-sans overflow-hidden relative">
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_70%)]"></div>
  <div class="relative z-10 text-center space-y-8 p-12 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 max-w-lg mx-auto">
    <div class="text-6xl animate-bounce">🎂</div>
    <h1 class="text-5xl font-black text-white tracking-tighter">HAPPY BIRTHDAY!</h1>
    <p class="text-indigo-200 text-lg">Wishing you a day filled with laughter, joy, and plenty of cake. You deserve the best today and always!</p>
    <div class="flex justify-center gap-4">
       <div class="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl">🎈</div>
       <div class="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl">🎁</div>
       <div class="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl">✨</div>
    </div>
    <button class="px-8 py-4 bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-110 active:scale-95 transition-all">Make a Wish</button>
  </div>
</div>`,
      css: '',
      js: ''
    }
  ];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setHtmlFormData({
      ...htmlFormData,
      name: preset.name,
      htmlContent: preset.html,
      cssContent: preset.css,
      jsContent: preset.js
    });
  };

  useEffect(() => {
    const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ ...d.data() } as HtmlTemplate));
      setHtmlTemplates(docs);
    }, (error) => {
      // Pass list errors to our error handler
      handleFirestoreError(error, OperationType.LIST, 'templates');
    });
    return () => {
      unsub();
    };
  }, []);

  const handleSaveHtml = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlFormData.id) { alert("Slug ID is required!"); return; }
    if (!htmlFormData.name) { alert("Name is required!"); return; }
    if (!htmlFormData.htmlContent) { alert("HTML Content is required!"); return; }

    const templatePath = `templates/${htmlFormData.id}`;
    try {
      const templateDoc = doc(db, 'templates', htmlFormData.id);
      await setDoc(templateDoc, {
        ...htmlFormData,
        createdAt: htmlFormData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      setSuccessSlug(htmlFormData.id);
      resetHtmlForm();
    } catch (err: any) {
      if (err.message?.includes('permission')) {
        handleFirestoreError(err, OperationType.WRITE, templatePath);
      }
      console.error("Error saving template:", err);
      alert("Failed to save. Check Firestore permissions.");
    }
  };

  const handleDeleteHtml = async (id: string) => {
    if (!confirm('Delete this hosted template?')) return;
    const templatePath = `templates/${id}`;
    try {
      await deleteDoc(doc(db, 'templates', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, templatePath);
      console.error("Error deleting:", err);
    }
  };

  const resetHtmlForm = () => {
    setHtmlFormData({
      id: '',
      name: '',
      htmlContent: '',
      cssContent: '',
      jsContent: '',
    });
  };

  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId?: string | null;
      email?: string | null;
      emailVerified?: boolean | null;
      isAnonymous?: boolean | null;
    }
  }

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleEditHtml = (t: HtmlTemplate) => {
    setHtmlFormData(t);
    setSuccessSlug(null);
    setIsEditingHtml(true);
  };
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [store, setStore] = useState<any[]>([]);
  const [newStoreItem, setNewStoreItem] = useState({ 
    type: 'apk', 
    title: '', 
    description: '', 
    tutorial: '', 
    apkUrl: '', 
    platform: 'facebook',
    price: '',
    thumbnail: '' 
  });
  const [uploading, setUploading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'store') fetchStore();
  }, [activeTab]);

  // Secondary firestore subscription hook for real-time maintenance and live-visibility status
  useEffect(() => {
    let unsub: (() => void) | undefined;
    setMaintenanceConnectionStatus('connecting');

    try {
      // Since our main 'db' import is now fully connected to the user's real Firestore 'dih-hub'
      // we can listen directly to the 'site/settings' document shown in the user's database.
      const docRef = doc(db, 'site', 'settings');
      unsub = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // The user's field shown in Firestore is 'maintenance: false'
          setMaintenanceModeLive(data.maintenance === true || data.maintenanceMode === true);
          
          // Natively sync live visibility state (enableLiveUserCounter)
          if (data.liveVisibility !== undefined) {
            updateSettings({ enableLiveUserCounter: !!data.liveVisibility });
          }
        } else {
          // Fallback to maintenance/config if site/settings doesn't exist yet
          const fallbackRef = doc(db, 'maintenance', 'config');
          onSnapshot(fallbackRef, (fbSnapshot) => {
            if (fbSnapshot.exists()) {
              const fbData = fbSnapshot.data();
              setMaintenanceModeLive(fbData.maintenanceMode === true || fbData.maintenance === true);
            } else {
              setMaintenanceModeLive(false);
            }
          });
        }
        setMaintenanceConnectionStatus('connected');
      }, (error) => {
        console.error("Firebase main database subscription failed:", error);
        setMaintenanceConnectionStatus('error');
      });
    } catch (err) {
      console.error("Initiation of maintenance snapshot failed:", err);
      setMaintenanceConnectionStatus('error');
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const setMaintenanceModeFirebase = async (value: boolean) => {
    try {
      // Set to both site/settings and maintenance/config to ensure 100% database compatibility
      const docRefSite = doc(db, 'site', 'settings');
      await setDoc(docRefSite, { maintenance: value, maintenanceMode: value }, { merge: true });

      const docRefMaintenance = doc(db, 'maintenance', 'config');
      await setDoc(docRefMaintenance, { maintenance: value, maintenanceMode: value }, { merge: true });
    } catch (error) {
       console.error("Error updating maintenance mode:", error);
       alert("Failed to update status. Please make sure user permissions are allowed.");
    }
  };

  const setLiveVisibilityFirebase = async (value: boolean) => {
    try {
      const docRefSite = doc(db, 'site', 'settings');
      await setDoc(docRefSite, { liveVisibility: value }, { merge: true });
      updateSettings({ enableLiveUserCounter: value });
    } catch (error) {
      console.error("Error updating live visibility:", error);
      alert("Failed to update live visibility in Firestore.");
    }
  };

  const fetchStore = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store');
      if (res.ok) setStore(await res.json());
    } catch (err) {
      console.error('Failed to fetch store:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadApk = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('apk', file);

    try {
      const res = await fetch('/api/admin/upload-apk', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setNewStoreItem(prev => ({ ...prev, apkUrl: data.url }));
        alert('APK Uploaded successfully!');
      }
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImgUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setNewStoreItem(prev => ({ ...prev, thumbnail: data.url }));
      }
    } catch (err) {
      alert('Image upload failed.');
    } finally {
      setImgUploading(false);
    }
  };

  const handleAddStoreItem = async () => {
    if (!newStoreItem.title || ((newStoreItem.type === 'apk' || newStoreItem.type === 'premium_apk') && !newStoreItem.apkUrl)) {
      alert('Title and resource are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStoreItem)
      });
      if (res.ok) {
        fetchStore();
        setNewStoreItem({ 
          type: 'apk', 
          title: '', 
          description: '', 
          tutorial: '', 
          apkUrl: '', 
          platform: 'facebook',
          price: '',
          thumbnail: '' 
        });
      }
    } catch (err) {
      console.error('Failed to add store item:', err);
    }
  };

  const handleDeleteStoreItem = async (id: string) => {
    if (!confirm('Delete this store item?')) return;
    try {
      const res = await fetch(`/api/admin/store/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStore();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSettings = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Settings synchronized to server!');
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const toggleTool = (toolId: string) => {
    const isVisible = settings.visibleTools.includes(toolId);
    if (isVisible) {
      updateSettings({ visibleTools: settings.visibleTools.filter(id => id !== toolId) });
    } else {
      updateSettings({ visibleTools: [...settings.visibleTools, toolId] });
    }
  };

  const toggleNew = (toolId: string) => {
    const isNew = settings.newTools?.includes(toolId);
    if (isNew) {
      updateSettings({ newTools: settings.newTools.filter(id => id !== toolId) });
    } else {
      updateSettings({ newTools: [...(settings.newTools || []), toolId] });
    }
  };

  const toggleDisableTool = (toolId: string) => {
    const disabledList = settings.disabledTools || [];
    const isDisabled = disabledList.includes(toolId);
    if (isDisabled) {
      updateSettings({ disabledTools: disabledList.filter(id => id !== toolId) });
    } else {
      const upcomingList = settings.upcomingTools || [];
      const comingSoonList = settings.comingSoonTools || [];
      updateSettings({ 
        disabledTools: [...disabledList, toolId],
        upcomingTools: upcomingList.filter(id => id !== toolId),
        comingSoonTools: comingSoonList.filter(id => id !== toolId)
      });
    }
  };

  const toggleUpcomingTool = (toolId: string) => {
    const upcomingList = settings.upcomingTools || [];
    const isUpcoming = upcomingList.includes(toolId);
    if (isUpcoming) {
      updateSettings({ upcomingTools: upcomingList.filter(id => id !== toolId) });
    } else {
      const comingSoonList = settings.comingSoonTools || [];
      const disabledList = settings.disabledTools || [];
      updateSettings({
        upcomingTools: [...upcomingList, toolId],
        comingSoonTools: comingSoonList.filter(id => id !== toolId),
        disabledTools: disabledList.filter(id => id !== toolId)
      });
    }
  };

  const toggleComingSoonTool = (toolId: string) => {
    const comingSoonList = settings.comingSoonTools || [];
    const isComingSoon = comingSoonList.includes(toolId);
    if (isComingSoon) {
      updateSettings({ comingSoonTools: comingSoonList.filter(id => id !== toolId) });
    } else {
      const upcomingList = settings.upcomingTools || [];
      const disabledList = settings.disabledTools || [];
      updateSettings({
        comingSoonTools: [...comingSoonList, toolId],
        upcomingTools: upcomingList.filter(id => id !== toolId),
        disabledTools: disabledList.filter(id => id !== toolId)
      });
    }
  };

  const moveTool = (toolId: string, direction: 'up' | 'down') => {
    const visibleTools = [...settings.visibleTools];
    const index = visibleTools.indexOf(toolId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [visibleTools[index], visibleTools[index - 1]] = [visibleTools[index - 1], visibleTools[index]];
    } else if (direction === 'down' && index < visibleTools.length - 1) {
      [visibleTools[index], visibleTools[index + 1]] = [visibleTools[index + 1], visibleTools[index]];
    }

    updateSettings({ visibleTools });
  };

  const handleAddTemplate = () => {
    if (newTemplate.name) {
      addTemplate({
        id: Math.random().toString(36).substr(2, 9),
        name: newTemplate.name,
        width: Number(newTemplate.width),
        height: Number(newTemplate.height),
        category: newTemplate.category || 'Custom',
        elements: [],
        svg: newTemplate.svg
      });
      setNewTemplate({ name: '', width: 800, height: 600, category: 'Custom', svg: '' });
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white font-sans overflow-x-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isAdminSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAdminSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-52 border-r border-slate-800 flex flex-col p-3 bg-slate-950 transition-all duration-300 md:relative md:translate-x-0 h-screen",
        isAdminSidebarOpen ? "translate-x-0 shadow-2xl shadow-primary/10" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,242,255,0.2)]">
              <Shield size={16} />
            </div>
            <div>
              <h1 className="text-[12px] font-black tracking-tighter uppercase text-white leading-none">DIH ADMIN</h1>
              <p className="text-[7px] text-primary uppercase tracking-[0.3em] font-bold mt-0.5">RAFCIN_CORE</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdminSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 pr-1 custom-scrollbar overflow-y-auto">
          {[
            { type: 'separator', label: 'Core Operations' },
            { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
            { id: 'tools', icon: Activity, label: 'Manage Tools' },
            { id: 'templates', icon: Layers, label: 'Design Templates' },
            { id: 'hosted-templates', icon: Globe, label: 'DIH TEMPLATE' },
            { id: 'store', icon: Download, label: 'Resource Store' },
            
            { type: 'separator', label: 'User Management' },
            { id: 'users', icon: Users, label: 'User Database' },

            { type: 'separator', label: 'App Configuration' },
            { id: 'appearance', icon: Palette, label: 'Branding & UI' },
            { id: 'dashboard-stats', icon: Activity, label: 'Dashboard Labels' },
            { id: 'dashboard-traffic', icon: Activity, label: 'Traffic Analysis' },
            { id: 'dashboard-counter', icon: Users, label: 'Live User Counter' },

            { type: 'separator', label: 'Module Settings' },
            { id: 'config-video', icon: Download, label: 'Video Downloader' },
            { id: 'config-movies', icon: Film, label: 'Dih Movie Pro' },
            { id: 'config-bachelor-point', icon: Film, label: 'Bachelor Point' },
            { id: 'config-utility', icon: Calculator, label: 'Utility Pro' },
            { id: 'config-ai', icon: Star, label: 'Advanced Engine Tools' },
            { id: 'config-ads', icon: MessageSquare, label: 'Ads Management' },
            
            { type: 'separator', label: 'Maintenance System' },
            { id: 'config-maintenance', icon: ShieldAlert, label: 'Firebase Maintenance' },
            
            { type: 'separator', label: 'Master Integrations' },
            { id: 'api-keys', icon: Key, label: 'Master API Keys' },
            { id: 'api-systems', icon: Cpu, label: 'System Proxies' },
            { id: 'api-payment', icon: Smartphone, label: 'Payment Gateway' },
          ].map((tab, idx) => {
            const actualId = (tab as any).idActual || (tab as any).id;
            const isActive = activeTab === actualId;
            return tab.type === 'separator' ? (
              <div key={`sep-${idx}`} className={cn("pt-6 pb-2 px-4 sticky top-0 bg-slate-950 z-10", idx === 0 && "pt-1")}>
                <span className="text-[8px] font-black uppercase text-slate-700 tracking-[0.3em] font-mono">{tab.label}</span>
              </div>
            ) : (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(actualId as any);
                  setIsAdminSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all mb-0.5 relative group overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/5 " 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-bg"
                    className="absolute inset-0 border-l-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
                  />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  {actualId !== 'config-bachelor-point' && (
                    <tab.icon size={14} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-primary shadow-[0_0_10px_#00f2ff]" : "text-slate-600 group-hover:text-slate-400")} />
                  )}
                  <span className={cn(
                    "text-[10px] font-bold tracking-tight uppercase transition-all",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )}>{tab.label}</span>
                </div>
                {isActive && (
                  <div className="relative z-10 flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                    <ChevronRight size={10} className="text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center justify-between px-4 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-lg transition-all text-red-500/60 hover:text-red-500 group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Terminate_Session</span>
          </div>
        </button>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto h-screen relative">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-3 bg-slate-900 border border-white/5 rounded-2xl mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdminSidebarOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700 active:scale-95"
            >
              <Menu size={16} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff]">
              {activeTab.toUpperCase().replace('-', ' ')}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-colors active:scale-95"
            title="Terminate Session"
          >
            <LogOut size={14} />
          </button>
        </div>

        <div className={cn(
          "mx-auto transition-all duration-300",
          (activeTab === 'dashboard-traffic' || activeTab === 'dashboard' || activeTab === 'dashboard-stats' || activeTab === 'dashboard-counter') 
            ? "max-w-6xl" : "max-w-4xl"
        )}>
          {activeTab === 'hosted-templates' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900 shadow-2xl p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[8px]">
                    <span className="w-6 h-[1px] bg-blue-500" />
                    Cloud Infrastructure
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">DIH TEMPLATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Station</span></h2>
                  <p className="text-slate-500 font-medium tracking-wide text-xs max-w-sm">Manage your ultra-low latency digital architectures with real-time deployment monitoring.</p>
                </div>
                <div className="relative z-10 flex gap-3">
                   <div className="relative group/search">
                    <div className="absolute inset-0 bg-blue-500/10 blur-lg rounded-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/search:text-blue-500 transition-colors" size={14} />
                    <input 
                      type="text" 
                      placeholder="Query Endpoint..." 
                      value={htmlSearch}
                      onChange={e => setHtmlSearch(e.target.value)}
                      className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] focus:border-blue-500 outline-none transition-all w-56 font-bold placeholder:text-slate-800"
                    />
                  </div>
                  {/* Button removed by user request */}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pb-24">
                {htmlTemplates.filter(t => t.name.toLowerCase().includes(htmlSearch.toLowerCase()) || t.id.toLowerCase().includes(htmlSearch.toLowerCase())).map(t => (
                  <div key={t.id} className="relative group overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-4 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 group-hover:border-blue-500/30 transition-all shadow-lg">
                      
                      <div className="flex items-center gap-4 flex-1 w-full">
                        <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Globe size={20} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                             <h4 className="text-xl font-black text-white italic tracking-tighter uppercase truncate">{t.name}</h4>
                             <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase tracking-widest rounded border border-emerald-500/20">Active</span>
                          </div>
                          <div className="flex items-center gap-4 text-[9px] text-slate-500 font-mono tracking-wider">
                             <div className="flex items-center gap-1.5 text-blue-400">
                                <Activity size={10} />
                                {typeof window !== 'undefined' ? window.location.host : 'dihhub.site'}/t/{t.id}
                             </div>
                             <div className="flex items-center gap-1.5 opacity-60">
                                <Clock size={10} />
                                {t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleDateString() : 'System'}
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                         <button 
                           onClick={() => handleCopyLink(t.id)} 
                           className={cn(
                             "flex-1 md:flex-none px-5 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg",
                             copiedId === t.id 
                              ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                              : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 active:scale-95"
                           )} 
                         >
                           {copiedId === t.id ? <Check size={14} /> : <Copy size={14} />}
                           {copiedId === t.id ? "COPIED" : "MANAGE LINK"}
                         </button>
                         <div className="flex items-center gap-1.5 p-1.5 bg-black/40 rounded-xl border border-white/5">
                           <button onClick={() => handleEditHtml(t)} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all group/btn" title="Edit Site">
                              <Edit2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                           </button>
                           <button onClick={() => handleDeleteHtml(t.id)} className="w-9 h-9 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500 transition-all group/btn" title="Delete Site">
                              <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                           </button>
                           <a href={`/t/${t.id}`} target="_blank" className="w-9 h-9 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-slate-500 hover:text-blue-500 transition-all group/btn" title="Launch Site">
                              <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
                           </a>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {htmlTemplates.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                     <Globe className="mx-auto mb-4 text-slate-800" size={40} />
                     <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No sites hosted yet</p>
                     <button onClick={() => setIsEditingHtml(true)} className="mt-4 text-blue-500 font-black text-[11px] underline">CREATE FIRST SITE</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Editor Drawer - Moved outside tab condition for reliable rendering */}
          <AnimatePresence>
            {isEditingHtml && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
                onClick={() => setIsEditingHtml(false)}
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="bg-slate-950 border border-white/10 w-full max-w-6xl h-[92vh] rounded-[2.5rem] flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden relative"
                  onClick={e => e.stopPropagation()}
                >
                   <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-500 shadow-inner"><Code2 size={24} /></div>
                         <div>
                           <h2 className="text-xl font-black italic tracking-tight underline decoration-blue-500/30">Hosted Site Editor</h2>
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Live Deployment Hub</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEditingHtml(false);
                          setSuccessSlug(null);
                        }} 
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-full transition-all border border-white/5"
                      >
                        <X size={20}/>
                      </button>
                   </div>
                    {successSlug ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in zoom-in fade-in duration-500 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.1),transparent_60%)] pointer-events-none" />
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.2)] animate-bounce relative z-10">
                           <ShieldCheck size={48} strokeWidth={1} />
                        </div>
                        <div className="space-y-2 relative z-10">
                           <div className="flex items-center justify-center gap-3 text-emerald-500 font-black uppercase tracking-[0.4em] text-[8px]">
                              <span className="w-6 h-[1px] bg-emerald-500/50" />
                              SIGNAL BROADCASTING
                              <span className="w-6 h-[1px] bg-emerald-500/50" />
                           </div>
                           <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Node <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Live</span></h3>
                           <p className="text-slate-500 font-medium tracking-wide max-w-xs mx-auto text-xs">Your architecture has been successfully synthesized and deployed to the global edge network.</p>
                        </div>
                        
                        <div className="w-full max-w-lg bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative group z-10">
                           <div className="space-y-3">
                              <div className="flex items-center justify-between px-2">
                                 <label className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em]">Network Address</label>
                                 <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">LIVE</span>
                                 </div>
                              </div>
                              <div className="text-lg md:text-2xl font-mono font-black text-blue-400 bg-white/5 p-6 rounded-[2rem] border border-white/5 select-all break-all shadow-inner tracking-tighter">
                                 {typeof window !== 'undefined' ? window.location.host : 'dihhub.site'}/t/{successSlug}
                              </div>
                           </div>
 
                           <div className="flex gap-3">
                              <button 
                                type="button"
                                onClick={() => handleCopyLink(successSlug!)}
                                className={cn(
                                  "flex-[2] py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all",
                                  copiedId === successSlug 
                                    ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30 scale-105" 
                                    : "bg-white text-black hover:bg-blue-600 hover:text-white shadow-2xl active:scale-95"
                                )}
                              >
                                {copiedId === successSlug ? <Check size={20} strokeWidth={3} /> : <Copy size={20} strokeWidth={2.5} />}
                                <span>{copiedId === successSlug ? "SYNCED" : "TRANSMIT LINK"}</span>
                              </button>
                              <a 
                                href={`/t/${successSlug}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="w-16 h-16 bg-white/5 border border-white/10 hover:bg-blue-600/10 hover:border-blue-500/30 rounded-[2rem] text-slate-500 hover:text-blue-500 transition-all flex items-center justify-center group/btn shadow-xl"
                              >
                                 <ExternalLink size={24} strokeWidth={1} className="group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-all" />
                              </a>
                           </div>
                        </div>
 
                        <button 
                          onClick={() => {
                            setSuccessSlug(null);
                            resetHtmlForm();
                          }}
                          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em] transition-all border border-white/5"
                        >
                           System Reset
                        </button>
                     </div>
                   ) : (
                     <div className="flex-1 flex overflow-hidden">
                       {/* LEFT: FORM INPUTS */}
                       <form onSubmit={handleSaveHtml} className="w-[45%] flex flex-col border-r border-white/5 overflow-hidden">
                          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                            <div className="space-y-8">
                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                                     <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                     Archival Parameters
                                  </label>
                                  <div className="grid grid-cols-1 gap-4">
                                     <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Network ID (Slug)</span>
                                          <span className="text-[8px] font-mono text-blue-500">{typeof window !== 'undefined' ? window.location.host : 'dihhub.site'}/t/{htmlFormData.id || '...'}</span>
                                        </div>
                                        <input 
                                          type="text" value={htmlFormData.id} onChange={e => setHtmlFormData({...htmlFormData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')})}
                                          className="w-full bg-black/60 border border-white/5 px-6 py-4 rounded-2xl font-black text-lg focus:border-blue-500 transition-all tracking-tight" required placeholder="site-id-name"
                                        />
                                     </div>
                                     <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Architecture Title</span>
                                        <input 
                                          type="text" value={htmlFormData.name} 
                                          onChange={e => {
                                            const val = e.target.value;
                                            const newUpdate: any = { name: val };
                                            if (!htmlFormData.id) newUpdate.id = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
                                            setHtmlFormData({...htmlFormData, ...newUpdate});
                                          }}
                                          className="w-full bg-black/60 border border-white/5 px-6 py-4 rounded-2xl font-black text-lg focus:border-blue-500 transition-all tracking-tight" required placeholder="Project Alpha"
                                        />
                                     </div>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                                     <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                                     Synthesis Matrix
                                  </label>
                                  <div className="grid grid-cols-2 gap-3">
                                     <div className="relative group/up">
                                        <input 
                                          type="file" accept=".html,.htm"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (event) => setHtmlFormData({ ...htmlFormData, htmlContent: event.target?.result as string, name: file.name.replace(/\.[^/.]+$/, "") });
                                            reader.readAsText(file);
                                          }}
                                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover/up:bg-blue-600 group-hover/up:border-blue-500 transition-all text-slate-500 group-hover/up:text-white">
                                           <Globe size={24} />
                                           <span className="text-[9px] font-black uppercase tracking-widest">Single File</span>
                                        </div>
                                     </div>
                                     <div className="relative group/up">
                                        <input 
                                          type="file" {...({ webkitdirectory: "", directory: "" } as any)} multiple
                                          onChange={async (e) => {
                                            const files = e.target.files;
                                            if (!files?.length) return;
                                            let h='', c='', j='', n='';
                                            for(let f of files) {
                                              const text = await f.text();
                                              const fn = f.name.toLowerCase();
                                              if (fn.endsWith('.html')) { if (fn === 'index.html' || !h) { h=text; n=f.name.replace(/\.[^/.]+$/, ""); } else h+='\n'+text; }
                                              else if (fn.endsWith('.css')) c+='\n'+text;
                                              else if (fn.endsWith('.js')) j+='\n'+text;
                                            }
                                            setHtmlFormData(p => ({ ...p, htmlContent: h||p.htmlContent, cssContent: c.trim()||p.cssContent, jsContent: j.trim()||p.jsContent, name: n||p.name }));
                                          }}
                                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover/up:bg-amber-600 group-hover/up:border-amber-500 transition-all text-slate-500 group-hover/up:text-white">
                                           <Package size={24} />
                                           <span className="text-[9px] font-black uppercase tracking-widest">Multi-Asset</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                                     <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                     Presets Repository
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                     {PRESETS.map((p, i) => (
                                       <button key={i} type="button" onClick={() => applyPreset(p)} className="px-4 py-3 bg-black/60 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-blue-500/50 hover:bg-blue-600/10 transition-all flex items-center gap-2 group text-slate-400 hover:text-white">
                                         <Zap size={12} className="text-blue-500 group-hover:scale-125" /> {p.name}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                            </div>

                            <button 
                              type="submit" 
                              className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-[0_20px_60px_rgba(37,99,235,0.3)] active:scale-95 group/save"
                            >
                               <Save size={24} className="group-hover/save:rotate-12 transition-transform" />
                               DEPLOY CORE ENGINE
                            </button>
                          </div>
                       </form>

                       {/* RIGHT: LIVE CODE EDITOR & PREVIEW */}
                       <div className="flex-1 flex flex-col bg-black/40 overflow-hidden">
                          <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                      Live Simulation [60FPS]
                                   </label>
                                   <div className="flex gap-1">
                                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                                   </div>
                                </div>
                                <div className="w-full h-80 bg-white rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.4)] relative mt-4">
                                   <iframe 
                                     srcDoc={`<html><head><style>${htmlFormData.cssContent || ''}</style></head><body>${htmlFormData.htmlContent || ''}</body><script>${htmlFormData.jsContent || ''}</script></html>`}
                                     className="w-full h-full" title="Preview"
                                   />
                                </div>
                             </div>

                             <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">HTML Skeleton</label>
                                   <textarea 
                                     value={htmlFormData.htmlContent} onChange={e => setHtmlFormData({...htmlFormData, htmlContent: e.target.value})}
                                     rows={8} className="w-full bg-[#030303] border border-white/10 p-6 rounded-[2rem] font-mono text-xs focus:border-blue-500 outline-none transition-all resize-none no-scrollbar text-blue-300/80" required
                                     placeholder="<!-- STRUCTURE -->"
                                   />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                   <div className="space-y-3">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">Visual Styles (CSS)</label>
                                      <textarea 
                                        value={htmlFormData.cssContent} onChange={e => setHtmlFormData({...htmlFormData, cssContent: e.target.value})} 
                                        rows={6} className="w-full bg-[#030303] border border-white/10 p-6 rounded-[2rem] font-mono text-xs focus:border-blue-500 outline-none resize-none no-scrollbar text-pink-300/80" 
                                        placeholder="/* DESIGN */"
                                      />
                                   </div>
                                   <div className="space-y-3">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">Logic Layers (JS)</label>
                                      <textarea 
                                        value={htmlFormData.jsContent} onChange={e => setHtmlFormData({...htmlFormData, jsContent: e.target.value})} 
                                        rows={6} className="w-full bg-[#030303] border border-white/10 p-6 rounded-[2rem] font-mono text-xs focus:border-blue-500 outline-none resize-none no-scrollbar text-emerald-300/80" 
                                        placeholder="// FUNCTION"
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                     </div>
                   )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'tools' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Tool Management</h2>
                  <p className="text-[10px] text-slate-500 whitespace-nowrap uppercase tracking-widest font-bold">Configure active service modules</p>
                </div>
                <button
                  onClick={handleSyncSettings}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 uppercase tracking-wider transition-all self-start sm:self-auto"
                >
                  <Save size={14} /> SAVE & SYNC SERV_CONF
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'tenmin-ai', label: '10Min AI Voice', icon: Zap },
                  { id: 'qr', label: 'QR Generator & Decoder', icon: QrCode },
                  { id: 'encryption', label: 'Text Encryption', icon: ShieldCheck },
                  { id: 'to-base64', label: 'File to Base64 (Legacy)', icon: Image },
                  { id: 'img-to-base64', label: 'Image to Base64', icon: Image },
                  { id: 'bg-remover', label: 'Background Remover', icon: Palette },
                  { id: 'passport', label: 'Passport Photo Maker', icon: LayoutDashboard },
                  { id: 'auto-passport', label: 'Auto Passport', icon: Star },
                  { id: 'design-editor', label: 'Design Editor (SaaS)', icon: Palette },
                  { id: 'video', label: 'Video Downloader', icon: Download },
                  { id: 'cut-downloader', label: 'Cut Downloader', icon: Scissors },
                  { id: 'dih-movies', label: 'Dih Movies Streaming', icon: Film },
                  { id: 'bachelor-point', label: 'Bachelor Point S-5', icon: Film },
                  { id: 'lib-encryptor', label: 'Lib Encryptor', icon: ShieldAlert },
                  { id: 'dex-protector', label: 'DEX Protector', icon: Cpu },
                  { id: 'apk-store', label: 'APK Store', icon: Package },
                  { id: 'temp-mail', label: 'Temp Mail', icon: MessageSquare },
                  { id: 'temp-sms', label: 'Temp SMS', icon: Smartphone },
                  { id: 'mobile-bypass', label: 'Mobile Bypass Pro', icon: ShieldAlert },
                  { id: 'migration', label: 'Migration Tool', icon: Cloud },
                  { id: 'hosted-admin', label: 'DIH TEMPLATE (Hosted)', icon: Globe },
                ].map(tool => (
                  <div key={tool.id} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1 mr-2 text-slate-600">
                          <button 
                            disabled={settings.visibleTools.indexOf(tool.id) <= 0}
                            onClick={() => moveTool(tool.id, 'up')}
                            className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-20"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button 
                            disabled={settings.visibleTools.indexOf(tool.id) === -1 || settings.visibleTools.indexOf(tool.id) === settings.visibleTools.length - 1}
                            onClick={() => moveTool(tool.id, 'down')}
                            className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-20"
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 relative">
                           <tool.icon size={20} />
                           {settings.visibleTools.includes(tool.id) && (
                             <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-bold flex items-center gap-2 uppercase">
                            {tool.label}
                            {settings.visibleTools.includes(tool.id) && (
                              <span className="text-[7px] bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded font-black uppercase tracking-tighter border border-emerald-500/20">Active</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">ID: {tool.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => toggleNew(tool.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-[10px]",
                            settings.newTools?.includes(tool.id) 
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                              : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-750"
                          )}
                        >
                          <ShieldAlert size={12} /> NEW Badge
                        </button>
                        <button 
                          onClick={() => toggleDisableTool(tool.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-[10px]",
                            settings.disabledTools?.includes(tool.id) 
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]" 
                              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750"
                          )}
                        >
                          {settings.disabledTools?.includes(tool.id) ? (
                            <><ShieldAlert size={12} className="text-rose-500 animate-pulse" /> Maintenance On</>
                          ) : (
                            <><Shield size={12} /> Maintenance Off</>
                          )}
                        </button>
                        <button 
                          onClick={() => toggleUpcomingTool(tool.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-[10px]",
                            settings.upcomingTools?.includes(tool.id) 
                              ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.15)]" 
                              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750"
                          )}
                        >
                          {settings.upcomingTools?.includes(tool.id) ? (
                            <><Clock size={12} className="text-violet-400 animate-pulse" /> Upcoming On</>
                          ) : (
                            <><Clock size={12} /> Upcoming Off</>
                          )}
                        </button>
                        <button 
                          onClick={() => toggleComingSoonTool(tool.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-[10px]",
                            settings.comingSoonTools?.includes(tool.id) 
                              ? "bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_12px_rgba(236,72,153,0.15)]" 
                              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750"
                          )}
                        >
                          {settings.comingSoonTools?.includes(tool.id) ? (
                            <><Rocket size={12} className="text-pink-400 animate-pulse" /> Coming Soon On</>
                          ) : (
                            <><Rocket size={12} /> Coming Soon Off</>
                          )}
                        </button>
                        <button 
                          onClick={() => toggleTool(tool.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-[10px]",
                            settings.visibleTools.includes(tool.id) 
                              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          )}
                        >
                          {settings.visibleTools.includes(tool.id) ? (
                            <><Eye size={12} /> Visible</>
                          ) : (
                            <><EyeOff size={12} /> Hidden</>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                         <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">Display Label</label>
                         <input 
                           type="text"
                           value={settings.toolLabels?.[tool.id] || ''}
                           onChange={e => {
                             const newLabels = { ...settings.toolLabels, [tool.id]: e.target.value };
                             updateSettings({ toolLabels: newLabels });
                           }}
                           className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                           placeholder="Tool Display Name"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">Short Description</label>
                         <input 
                           type="text"
                           value={settings.toolDescriptions?.[tool.id] || ''}
                           onChange={e => {
                             const newDescs = { ...settings.toolDescriptions, [tool.id]: e.target.value };
                             updateSettings({ toolDescriptions: newDescs });
                           }}
                           className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                           placeholder="Tool Description"
                         />
                      </div>
                    </div>

                    {settings.disabledTools?.includes(tool.id) && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60 animate-in slide-in-from-top-2 duration-300">
                         <label className="text-[9px] text-rose-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-1">
                           <Zap size={10} className="animate-bounce" /> Maintenance Notice / Under Management Alert Text
                         </label>
                         <input 
                           type="text"
                           value={settings.toolNotices?.[tool.id] || ''}
                           onChange={e => {
                             const newNotices = { ...settings.toolNotices, [tool.id]: e.target.value };
                             updateSettings({ toolNotices: newNotices });
                           }}
                           className="w-full px-3 py-2 bg-rose-500/5 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder-rose-500/30"
                           placeholder="e.g. This tool is under management. Please check back later!"
                         />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
                    Template <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Library</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Manage custom canvases and dynamic layers for the Design Editor.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('api-systems')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                   Bulk Import
                </button>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">
                      Create New Base Template
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">Provision new raster/vector size configurations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Template Name</label>
                    <input 
                      type="text" 
                      value={newTemplate.name}
                      onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white transition-all placeholder:text-slate-700"
                      placeholder="E.g. Professional Business Card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Category</label>
                    <input 
                      type="text" 
                      value={newTemplate.category}
                      onChange={e => setNewTemplate({...newTemplate, category: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white transition-all placeholder:text-slate-700"
                      placeholder="E.g. Cards, Social, Invites"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Width (px)</label>
                    <input 
                      type="number" 
                      value={newTemplate.width}
                      onChange={e => setNewTemplate({...newTemplate, width: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Height (px)</label>
                    <input 
                      type="number" 
                      value={newTemplate.height}
                      onChange={e => setNewTemplate({...newTemplate, height: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white transition-all"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">SVG Code (Optional Overlay)</label>
                    <textarea 
                      value={newTemplate.svg}
                      onChange={e => setNewTemplate({...newTemplate, svg: e.target.value})}
                      className="w-full bg-slate-950 text-slate-200 border border-slate-800 p-3 rounded-xl h-24 font-mono text-[10px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                      placeholder="<svg viewBox='0 0 800 600'>...</svg>"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddTemplate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                  <Plus size={14} /> Create Library Template
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.templates.map(t => (
                  <div key={t.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex justify-between items-start hover:border-blue-500/30 transition-all duration-300 group/item relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    <div className="space-y-1 relative z-10">
                      <span className="text-[8px] font-black uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                        {t.category || 'Custom'}
                      </span>
                      <h4 className="text-sm font-black uppercase tracking-tight text-white pt-1">{t.name}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                        <Layers size={10} className="text-slate-600" />
                        Resolution: {t.width} x {t.height} px
                      </div>
                    </div>
                    <button 
                      onClick={() => removeTemplate(t.id)}
                      className="text-slate-650 hover:text-red-550 transition-colors p-1 hover:bg-red-500/10 rounded-lg cursor-pointer relative z-10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
                    Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Manager</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Provision APK builds, manage accounts, and configure storefront properties.</p>
                </div>
                <button 
                  onClick={handleSyncSettings} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
                >
                  <Save size={14} /> DEPLOY STORE
                </button>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group space-y-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />
                
                {/* Store Message Config */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <MessageSquare size={12} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                      Store Front Configuration
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Public Display Banner Message</label>
                      <input 
                        type="text" 
                        value={settings.apkStorePublicMessage}
                        onChange={e => updateSettings({ apkStorePublicMessage: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-white transition-all placeholder:text-slate-700"
                        placeholder="E.g. Download High-Precision Premium Apps & Tools"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Active Channels</label>
                      <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                        <button 
                          onClick={() => updateSettings({ storeEnableApks: !settings.storeEnableApks })}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer",
                            settings.storeEnableApks ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:text-slate-400"
                          )}
                        >
                          APKs
                        </button>
                        <button 
                          onClick={() => updateSettings({ storeEnableAccounts: !settings.storeEnableAccounts })}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer",
                            settings.storeEnableAccounts ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:text-slate-400"
                          )}
                        >
                          MARKET
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List New Resource Form */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2.5 pb-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Package size={12} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                      Provision New Store Resource
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    {[
                      { id: 'apk', label: 'Free APK', color: 'blue', icon: Package },
                      { id: 'premium_apk', label: 'Premium APK', color: 'amber', icon: Star },
                      { id: 'account', label: 'Social Account', color: 'indigo', icon: Users }
                    ].map(type => {
                      const isActive = newStoreItem.type === type.id;
                      return (
                        <button 
                          key={type.id}
                          type="button"
                          onClick={() => setNewStoreItem({...newStoreItem, type: type.id as any})}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-[10px] border cursor-pointer",
                            isActive 
                              ? (
                                  type.id === 'apk' ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" :
                                  type.id === 'premium_apk' ? "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20" :
                                  "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                )
                              : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-900/50"
                          )}
                        >
                          <type.icon size={13} /> {type.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(newStoreItem.type === 'apk' || newStoreItem.type === 'premium_apk') && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Hero Thumbnail (Image URL)</label>
                        <div className="flex gap-3 items-center">
                          {newStoreItem.thumbnail && (
                            <img src={newStoreItem.thumbnail} className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" alt="Preview" />
                          )}
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text" 
                              value={newStoreItem.thumbnail}
                              onChange={e => setNewStoreItem({...newStoreItem, thumbnail: e.target.value})}
                              className="flex-1 bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white focus:border-indigo-500/50"
                              placeholder="https://images.unsplash.com/photo-... or custom uploaded link"
                            />
                            <label className={cn(
                              "cursor-pointer px-4 flex items-center justify-center rounded-xl font-black text-[10px] transition-all border shrink-0",
                              imgUploading ? "bg-slate-900 border-slate-800 text-slate-600" : "bg-white text-slate-900 hover:bg-slate-100"
                            )}>
                              {imgUploading ? 'UPLOADING...' : 'SELECT IMAGE'}
                              <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={imgUploading} />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">
                        {newStoreItem.type === 'account' ? 'Platform Display Name' : 'Resource Application Title'}
                      </label>
                      <input 
                        type="text" 
                        value={newStoreItem.title}
                        onChange={e => setNewStoreItem({...newStoreItem, title: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:border-indigo-500/50 outline-none text-white transition-all placeholder:text-slate-700"
                        placeholder="Enter direct Title..."
                      />
                    </div>
                    
                    {newStoreItem.type === 'account' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Target Platform</label>
                        <select 
                          value={newStoreItem.platform}
                          onChange={e => setNewStoreItem({...newStoreItem, platform: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none text-xs font-semibold cursor-pointer text-white"
                        >
                          <option value="facebook">Facebook Network</option>
                          <option value="instagram">Instagram Account</option>
                          <option value="tiktok">TikTok Stream</option>
                          <option value="youtube">YouTube Channel</option>
                          <option value="other">Other System</option>
                        </select>
                      </div>
                    )}

                    <div className={cn("space-y-1.5", newStoreItem.type === 'apk' ? "sm:col-span-2" : "col-span-1")}>
                      <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Short Summary Details</label>
                      <input 
                        type="text"
                        value={newStoreItem.description}
                        onChange={e => setNewStoreItem({...newStoreItem, description: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 px-3.5 py-3 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-white"
                        placeholder="Brief informational tag summary..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">
                        {newStoreItem.type === 'apk' ? 'Video Tutorial Link (YouTube)' : 'Direct Contact Parameter'}
                      </label>
                      <input 
                        type="text" 
                        value={newStoreItem.tutorial}
                        onChange={e => setNewStoreItem({...newStoreItem, tutorial: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:border-indigo-500/50 inline-block text-white"
                        placeholder="E.g. Link to guide, or WhatsApp URL"
                      />
                    </div>

                    {(newStoreItem.type === 'premium_apk' || newStoreItem.type === 'account') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block text-amber-500">Value Fee Requirement (Price/BDT)</label>
                        <input 
                          type="text" 
                          value={newStoreItem.price}
                          onChange={e => setNewStoreItem({...newStoreItem, price: e.target.value})}
                          className="w-full bg-slate-950 border border-amber-900/30 px-3.5 py-2.5 rounded-xl text-amber-400 outline-none font-bold text-xs"
                          placeholder="E.g. $10 or 1200 BDT"
                        />
                      </div>
                    )}

                    {newStoreItem.type === 'apk' ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Direct Target Binary Link</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newStoreItem.apkUrl}
                            onChange={e => setNewStoreItem({...newStoreItem, apkUrl: e.target.value})}
                            className="flex-1 bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-mono text-white focus:border-indigo-500/50"
                            placeholder="https://drive.google.com/..."
                          />
                          <label className={cn(
                            "cursor-pointer px-4 flex items-center justify-center rounded-xl font-black text-[10px] transition-all border shrink-0",
                            uploading ? "bg-slate-900 border-slate-800 text-slate-650" : "bg-white text-slate-900 hover:bg-slate-100"
                          )}>
                            {uploading ? 'UPLOADING...' : 'UPLOAD APK'}
                            <input type="file" className="hidden" accept=".apk" onChange={handleUploadApk} disabled={uploading} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 block">Visual Verification URL (Proof)</label>
                        <input 
                          type="text" 
                          value={newStoreItem.apkUrl}
                          onChange={e => setNewStoreItem({...newStoreItem, apkUrl: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-white"
                          placeholder="https://imgur.com/screenshots..."
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleAddStoreItem}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 mt-4 cursor-pointer"
                >
                  <Plus size={14} /> Distribute Resource Unit
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Distributed Assets Library ({store.length})</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {store.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-900/10 border border-dashed border-white/5 rounded-2xl text-xs">
                      No distributed catalog instances found.
                    </div>
                  ) : (
                    store.map(item => (
                      <div key={item.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex justify-between items-center group hover:border-indigo-550/30 transition-all duration-300">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} className="w-12 h-12 rounded-lg object-cover border border-white/5 shrink-0" alt="Preview" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
                              <Package size={20} />
                            </div>
                          )}
                          <div className="min-w-0 space-y-0.5">
                             <div className="flex items-center gap-2 flex-wrap">
                               <h4 className="font-bold text-sm text-white truncate max-w-[200px] xs:max-w-xs">{item.title}</h4>
                               <span className={cn(
                                 "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none",
                                 item.type === 'apk' ? "bg-blue-500/10 text-blue-400 border-blue-500/25" :
                                 item.type === 'premium_apk' ? "bg-amber-500/10 text-amber-500 border-amber-500/25" :
                                 "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                               )}>
                                 {item.type === 'apk' ? 'Free APK' : item.type === 'premium_apk' ? 'Premium APK' : 'Account'}
                               </span>
                             </div>
                             <p className="text-[10px] text-slate-500 truncate max-w-[250px] sm:max-w-md font-medium">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 font-mono">
                           <div className="text-right hidden sm:block">
                              <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest">Added Date</p>
                              <p className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                           </div>
                           <button 
                             onClick={() => handleDeleteStoreItem(item.id)}
                             className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white border border-red-500/10 transition-all cursor-pointer"
                           >
                             <Trash2 size={13} />
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Registered Users</h2>
                  <p className="text-xs text-slate-500">Manage members and credentials.</p>
                </div>
                <button 
                  onClick={fetchUsers}
                  disabled={loading}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800"
                >
                  <Activity className={cn(loading && "animate-spin")} size={16} />
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-850 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <th className="px-5 py-3">Name & Email</th>
                      <th className="px-5 py-3">Password</th>
                      <th className="px-5 py-3">Registered</th>
                      <th className="px-5 py-3">Last Active</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-xs italic">No users found.</td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="text-[13px] font-bold">{user.name}</div>
                            <div className="text-[10px] text-slate-500">{user.email}</div>
                          </td>
                          <td className="px-5 py-3 font-mono text-[10px] text-yellow-500/80">{user.password}</td>
                          <td className="px-5 py-3 text-[10px] text-slate-400">{new Date(user.registeredAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-[10px] text-slate-400">
                            {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-5 py-3">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[8px] font-black uppercase",
                              user.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-500"
                            )}>
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">General Settings</h2>
                <p className="text-xs text-slate-500">Basic application configuration and identity.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">App Name</label>
                    <input 
                      type="text"
                      value={settings.appName}
                      onChange={e => updateSettings({ appName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Footer Text</label>
                    <input 
                      type="text"
                      value={settings.footerText}
                      onChange={e => updateSettings({ footerText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">NEW Badge Text</label>
                    <input 
                      type="text"
                      value={settings.newBadgeText}
                      onChange={e => updateSettings({ newBadgeText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-indigo-400 font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Default QR Code URL</label>
                    <input 
                      type="text"
                      value={settings.defaultQRUrl}
                      onChange={e => updateSettings({ defaultQRUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none font-mono text-xs"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">App Description</label>
                  <textarea 
                    value={settings.appDescription}
                    onChange={e => updateSettings({ appDescription: e.target.value })}
                    className="w-full h-24 px-3.5 py-2.5 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none resize-none text-sm transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={handleSyncSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm"
                  >
                    <Save size={18} /> Save General Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Appearance & UI</h2>
                <p className="text-xs text-slate-500">Customize the visual identity and interface labels.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Theme Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter ml-1">Primary Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={settings.primaryColor}
                          onChange={e => updateSettings({ primaryColor: e.target.value })}
                          className="w-10 h-10 rounded-lg bg-slate-950 p-1 border border-slate-800 cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={settings.primaryColor || ''}
                          onChange={e => updateSettings({ primaryColor: e.target.value })}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter ml-1">Accent Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={settings.accentColor}
                          onChange={e => updateSettings({ accentColor: e.target.value })}
                          className="w-10 h-10 rounded-lg bg-slate-950 p-1 border border-slate-800 cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={settings.accentColor || ''}
                          onChange={e => updateSettings({ accentColor: e.target.value })}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Visual Effects</h3>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-between gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer group hover:bg-slate-900 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-widest transition-colors">Show Scanlines</span>
                      <div 
                        onClick={() => updateSettings({ showScanlines: !settings.showScanlines })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative border border-slate-700",
                          settings.showScanlines ? "bg-blue-600 border-blue-500" : "bg-slate-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                          settings.showScanlines ? "left-5.5" : "left-1"
                        )} />
                      </div>
                    </label>
                    <label className="flex-1 flex items-center justify-between gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer group hover:bg-slate-900 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-widest transition-colors">Glassmorphism</span>
                      <div 
                        onClick={() => updateSettings({ enableGlassmorphism: !settings.enableGlassmorphism })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative border border-slate-700",
                          settings.enableGlassmorphism ? "bg-blue-600 border-blue-500" : "bg-slate-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                          settings.enableGlassmorphism ? "left-5.5" : "left-1"
                        )} />
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Interface Labels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'headerOperatorLabel', label: 'Header Operator' },
                      { key: 'appVersionLabel', label: 'App Version' },
                      { key: 'headerControlInterfaceLabel', label: 'Header Interface' },
                      { key: 'sidebarSystemCoreLabel', label: 'Sidebar Category' },
                      { key: 'dashboardInfrastructureLabel', label: 'Dashboard Accent' },
                      { key: 'activeLinkLabel', label: 'Active Link Label' },
                    ].map(field => (
                      <div key={field.key} className="space-y-1.5">
                         <label className="text-[10px] text-slate-500 font-bold px-1 uppercase tracking-tighter">{field.label}</label>
                         <input 
                           type="text"
                           value={(settings as any)[field.key] || ''}
                           onChange={e => updateSettings({ [field.key]: e.target.value })}
                           className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 transition-all"
                         />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={handleSyncSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm"
                  >
                    <Save size={18} /> Save Appearance Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Dashboard Config</h2>
                  <p className="text-xs text-slate-500">Manage statistics and the live user counter.</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-1.5 overflow-hidden">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-slate-800 flex items-center justify-center">
                           <Users size={10} className="text-slate-500" />
                        </div>
                      ))}
                   </div>
                   <span className="text-[10px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{(20456 + Math.floor(Math.random() * 100)).toLocaleString()} USERS ONLINE</span>
                </div>
              </div>

              {/* Stats Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                 {[
                   { label: 'Total Registered', value: '20,412', icon: Users, color: 'text-blue-500' },
                   { label: 'Cloud Storage', value: '1.4 TB', icon: Cloud, color: 'text-purple-500' },
                   { label: 'API Calls / Day', value: '85.2k', icon: Cpu, color: 'text-amber-500' },
                   { label: 'System Health', value: 'Excellent', icon: ShieldCheck, color: 'text-emerald-500' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className={cn("p-2 rounded-lg bg-slate-950 border border-slate-800", stat.color)}>
                           <stat.icon size={14} />
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-blue-500 animate-pulse" />
                      </div>
                      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                      <p className="text-lg font-black tracking-tighter mt-0.5">{stat.value}</p>
                   </div>
                 ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Configuration Sectors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => setActiveTab('dashboard-stats')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                              <Activity size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Modify Labels</p>
                              <p className="text-[10px] text-slate-500 font-medium">Edit total users, daily active, etc.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                     </button>

                     <button onClick={() => setActiveTab('dashboard-traffic')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-orange-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20">
                              <Activity size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Traffic Analysis</p>
                              <p className="text-[10px] text-slate-500 font-medium">Manage simulation traffic stats.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-500 transition-colors" />
                     </button>

                     <button onClick={() => setActiveTab('dashboard-counter')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                              <Users size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Counter Logic</p>
                              <p className="text-[10px] text-slate-500 font-medium">Configure live animation behavior.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                     </button>

                     <button onClick={() => setActiveTab('config-video')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-pink-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 ring-1 ring-pink-500/20">
                              <Download size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Video Service</p>
                              <p className="text-[10px] text-slate-500 font-medium">Configure downloader engines & API.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-pink-500 transition-colors" />
                     </button>

                     <button onClick={() => setActiveTab('config-movies')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20">
                              <Film size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Movie Engine</p>
                              <p className="text-[10px] text-slate-500 font-medium">Metadata and streaming providers.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                     </button>

                     <button onClick={() => setActiveTab('config-ai')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                              <Star size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Advanced Control</p>
                              <p className="text-[10px] text-slate-500 font-medium">Remove.bg and other advanced features.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                     </button>

                     <button onClick={() => setActiveTab('api-payment')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-orange-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20">
                              <Smartphone size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Payment Gate</p>
                              <p className="text-[10px] text-slate-500 font-medium">DesiPayBD / TukTakPay settings.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-500 transition-colors" />
                     </button>

                     <button onClick={() => setActiveTab('config-ads')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-red-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                              <MessageSquare size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">Ads Engine</p>
                              <p className="text-[10px] text-slate-500 font-medium">Manage Adsterra & AdSense scripts.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-red-500 transition-colors" />
                     </button>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6 text-center space-y-3">
                   <ShieldCheck size={32} className="text-emerald-500/50 mx-auto" />
                   <div>
                      <h3 className="text-sm font-black text-slate-400 italic font-mono uppercase tracking-widest">Sector Isolation Active</h3>
                      <p className="text-[10px] text-slate-600 mt-1 max-w-sm mx-auto font-medium">Each module is now controlled by an independent sector engine for precision configuration.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard-traffic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Intelligence Dashboard</h2>
                  <p className="text-xs text-slate-500 font-medium italic underline decoration-blue-500/30 underline-offset-4">Developed by @rafcin.b</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">DATA_FEED: ONLINE</span>
                  </div>
                </div>
              </div>

              {/* High-End Enterprise Analytics Card */}
              <div className="bg-[#0f1115] p-6 sm:p-10 xl:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative group">
                {/* Dynamic Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -mr-64 -mt-64 group-hover:bg-blue-600/10 transition-colors duration-1000" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] -ml-40 -mb-40 group-hover:bg-indigo-600/10 transition-colors duration-1000" />
                
                {/* Content */}
                <div className="space-y-4 mb-10 md:mb-16 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-1 px-1 bg-blue-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                    </div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{settings.appName} AUTHORITY_METRICS</span>
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none">
                    <span className="text-white brightness-125">{settings.trafficAnalysisUrl}</span>
                    <span className="block text-slate-600 text-2xl sm:text-3xl mt-2 font-bold tracking-tight">Ecosystem Traffic Analysis</span>
                  </h3>
                  <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent my-6" />
                  <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-medium">
                    {settings.trafficAnalysisDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-2.5 2xl:gap-4 relative z-10">
                  {/* Card 1: Daily Visitors */}
                  <div className="bg-slate-950/30 hover:bg-slate-950/60 border border-white/[0.03] hover:border-blue-500/20 rounded-xl p-4 sm:p-5 xl:p-3 min-[1400px]:p-4 2xl:p-5 transition-all duration-300 group/card relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-xl rounded-full translate-x-8 -translate-y-8 group-hover/card:bg-blue-500/10 transition-colors duration-500" />
                    <p className="text-[9px] font-semibold text-slate-500 mb-3 uppercase tracking-[0.15em] flex items-center gap-1.5">
                       <Users size={12} className="text-blue-500" />
                       Daily Visitors
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                       <p className="text-2xl sm:text-3xl xl:text-base min-[1400px]:text-lg 2xl:text-2xl min-[1700px]:text-3xl font-extrabold tracking-tight text-white leading-none font-sans whitespace-nowrap">{settings.trafficDailyValue}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold text-[9px] border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.02)]">
                      {(settings.trafficDailyTrend?.includes('%') || settings.trafficDailyTrend?.includes('+')) && <ArrowUp size={10} strokeWidth={3} />}
                      <span className="tracking-wider">{settings.trafficDailyTrend}</span>
                    </div>
                  </div>

                  {/* Card 2: Monthly Visits */}
                  <div className="bg-slate-950/30 hover:bg-slate-950/60 border border-white/[0.03] hover:border-indigo-500/20 rounded-xl p-4 sm:p-5 xl:p-3 min-[1400px]:p-4 2xl:p-5 transition-all duration-300 group/card relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full translate-x-8 -translate-y-8 group-hover/card:bg-indigo-500/10 transition-colors duration-500" />
                    <p className="text-[9px] font-semibold text-slate-500 mb-3 uppercase tracking-[0.15em] flex items-center gap-1.5">
                       <Activity size={12} className="text-indigo-500" />
                       Monthly Visits
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                       <p className="text-2xl sm:text-3xl xl:text-base min-[1400px]:text-lg 2xl:text-2xl min-[1700px]:text-3xl font-extrabold tracking-tight text-blue-400 leading-none font-sans whitespace-nowrap">{settings.trafficMonthlyValue}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold text-[9px] border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.02)]">
                      {(settings.trafficMonthlyTrend?.includes('%') || settings.trafficMonthlyTrend?.includes('+')) && <ArrowUp size={10} strokeWidth={3} />}
                      <span className="tracking-wider">{settings.trafficMonthlyTrend}</span>
                    </div>
                  </div>

                  {/* Card 3: Pages / Session */}
                  <div className="bg-slate-950/30 hover:bg-slate-950/60 border border-white/[0.03] hover:border-blue-500/20 rounded-xl p-4 sm:p-5 xl:p-3 min-[1400px]:p-4 2xl:p-5 transition-all duration-300 group/card relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-xl rounded-full translate-x-8 -translate-y-8 group-hover/card:bg-blue-500/10 transition-colors duration-500" />
                    <p className="text-[9px] font-semibold text-slate-500 mb-3 uppercase tracking-[0.15em] flex items-center gap-1.5">
                       <Layout size={12} className="text-blue-400" />
                       Pages / Session
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                       <p className="text-2xl sm:text-3xl xl:text-base min-[1400px]:text-lg 2xl:text-2xl min-[1700px]:text-3xl font-extrabold tracking-tight text-blue-400 leading-none font-sans whitespace-nowrap">{settings.trafficPagesValue}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold text-[9px] border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.02)]">
                      {(settings.trafficPagesTrend?.includes('%') || settings.trafficPagesTrend?.includes('+')) && <ArrowUp size={10} strokeWidth={3} />}
                      <span className="tracking-wider">{settings.trafficPagesTrend}</span>
                    </div>
                  </div>

                  {/* Card 4: Avg. Duration */}
                  <div className="bg-slate-950/30 hover:bg-slate-950/60 border border-white/[0.03] hover:border-indigo-500/20 rounded-xl p-4 sm:p-5 xl:p-3 min-[1400px]:p-4 2xl:p-5 transition-all duration-300 group/card relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full translate-x-8 -translate-y-8 group-hover/card:bg-indigo-500/10 transition-colors duration-500" />
                    <p className="text-[9px] font-semibold text-slate-500 mb-3 uppercase tracking-[0.15em] flex items-center gap-1.5">
                       <Clock size={12} className="text-indigo-400" />
                       Avg. Duration
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                       <p className="text-2xl sm:text-3xl xl:text-base min-[1400px]:text-lg 2xl:text-2xl min-[1700px]:text-3xl font-extrabold tracking-tight text-blue-400 leading-none font-sans whitespace-nowrap">{settings.trafficDurationValue}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold text-[9px] border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.02)]">
                      {(settings.trafficDurationTrend?.includes('%') || settings.trafficDurationTrend?.includes('+')) && <ArrowUp size={10} strokeWidth={3} />}
                      <span className="tracking-wider">{settings.trafficDurationTrend}</span>
                    </div>
                  </div>

                  {/* Card 5: Est. Revenue */}
                  <div className="bg-slate-950/30 hover:bg-slate-950/60 border border-white/[0.03] hover:border-emerald-500/20 rounded-xl p-4 sm:p-5 xl:p-3 min-[1400px]:p-4 2xl:p-5 transition-all duration-300 group/card relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full translate-x-8 -translate-y-8 group-hover/card:bg-emerald-500/10 transition-colors duration-500" />
                    <p className="text-[9px] font-semibold text-slate-500 mb-3 uppercase tracking-[0.15em] flex items-center gap-1.5">
                        <DollarSign size={12} className="text-emerald-400" />
                        Est. Revenue
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                       <p className="text-2xl sm:text-3xl xl:text-base min-[1400px]:text-lg 2xl:text-2xl min-[1700px]:text-3xl font-extrabold tracking-tight text-emerald-400 leading-none font-sans whitespace-nowrap">{settings.trafficRevenueValue || '$4,280'}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold text-[9px] border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.02)]">
                      {(settings.trafficRevenueTrend?.includes('%') || settings.trafficRevenueTrend?.includes('+')) && <ArrowUp size={10} strokeWidth={3} />}
                      <span className="tracking-wider">{settings.trafficRevenueTrend || '+28.4%'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Editor Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 ml-1">Insight Data Editor</h3>
                    <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[8px] font-black uppercase border border-blue-500/20">Simulated Analytics</div>
                 </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Target Domain</label>
                      <input 
                        type="text"
                        value={settings.trafficAnalysisUrl}
                        onChange={e => updateSettings({ trafficAnalysisUrl: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Site Description</label>
                      <input 
                        type="text"
                        value={settings.trafficAnalysisDescription}
                        onChange={e => updateSettings({ trafficAnalysisDescription: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Daily Visitors</p>
                       <input 
                          type="text"
                          value={settings.trafficDailyValue}
                          onChange={e => updateSettings({ trafficDailyValue: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs"
                          placeholder="Value (e.g. 3.2k+)"
                       />
                       <input 
                          type="text"
                          value={settings.trafficDailyTrend}
                          onChange={e => updateSettings({ trafficDailyTrend: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-green-500 font-bold"
                          placeholder="Trend"
                       />
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Monthly Visits</p>
                       <input 
                          type="text"
                          value={settings.trafficMonthlyValue}
                          onChange={e => updateSettings({ trafficMonthlyValue: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs"
                          placeholder="Value"
                       />
                       <input 
                          type="text"
                          value={settings.trafficMonthlyTrend}
                          onChange={e => updateSettings({ trafficMonthlyTrend: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-green-500 font-bold"
                          placeholder="Trend"
                       />
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Pages / Session</p>
                       <input 
                          type="text"
                          value={settings.trafficPagesValue}
                          onChange={e => updateSettings({ trafficPagesValue: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs"
                          placeholder="Value"
                       />
                       <input 
                          type="text"
                          value={settings.trafficPagesTrend}
                          onChange={e => updateSettings({ trafficPagesTrend: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-green-500 font-bold"
                          placeholder="Trend"
                       />
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Avg. Duration</p>
                       <input 
                          type="text"
                          value={settings.trafficDurationValue}
                          onChange={e => updateSettings({ trafficDurationValue: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs"
                          placeholder="Value"
                       />
                       <input 
                          type="text"
                          value={settings.trafficDurationTrend}
                          onChange={e => updateSettings({ trafficDurationTrend: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-green-500 font-bold"
                          placeholder="Trend"
                       />
                    </div>
                    <div className="space-y-3 col-span-2 lg:col-span-1">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Est. Revenue</p>
                       <input 
                          type="text"
                          value={settings.trafficRevenueValue || ''}
                          onChange={e => updateSettings({ trafficRevenueValue: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs"
                          placeholder="Value"
                       />
                       <input 
                          type="text"
                          value={settings.trafficRevenueTrend || ''}
                          onChange={e => updateSettings({ trafficRevenueTrend: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-green-500 font-bold"
                          placeholder="Trend"
                       />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-800/50">
                    <button onClick={handleSyncSettings} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm">
                      <Save size={18} /> Update Insights Engine
                    </button>
                    <p className="text-[9px] text-slate-500 text-center mt-3 uppercase tracking-widest font-black italic">This section is visible only to authorized operators via the Command Station.</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard-stats' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Dashboard Labels</h2>
                  <p className="text-xs text-slate-500">Modify the primary statistics shown on the home page.</p>
                </div>
                <button onClick={() => setActiveTab('dashboard')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg transition-colors border border-slate-700">BACK TO HUB</button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Statistics Customization</h3>
                    <button 
                      onClick={() => {
                        const newStats = [...(settings.dashboardStats || [])];
                        newStats.push({ label: 'NEW STAT', value: '0' });
                        updateSettings({ dashboardStats: newStats });
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-[9px] font-black uppercase transition-all border border-blue-500/10"
                    >
                      <Plus size={12} /> Add Label
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.dashboardStats?.map((stat, idx) => (
                      <div key={idx} className="space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-xl relative group">
                        <button 
                          onClick={() => {
                            const newStats = [...settings.dashboardStats];
                            newStats.splice(idx, 1);
                            updateSettings({ dashboardStats: newStats });
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Label</label>
                            <input 
                              type="text"
                              value={stat.label}
                              onChange={e => {
                                const newStats = [...settings.dashboardStats];
                                newStats[idx].label = e.target.value;
                                updateSettings({ dashboardStats: newStats });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Value</label>
                            <input 
                              type="text"
                              value={stat.value}
                              onChange={e => {
                                const newStats = [...settings.dashboardStats];
                                newStats[idx].value = e.target.value;
                                updateSettings({ dashboardStats: newStats });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button onClick={handleSyncSettings} className="w-full bg-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm">
                    <Save size={18} /> Update Labels
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard-counter' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Counter Engine</h2>
                  <p className="text-xs text-slate-500">Configure the animated user counter behavior.</p>
                </div>
                <button onClick={() => setActiveTab('dashboard')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg transition-colors border border-slate-700">BACK TO HUB</button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-800/50">
                    <h3 className="font-bold text-[11px] uppercase tracking-widest text-emerald-500 ml-1">Live Visibility</h3>
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <input 
                        type="checkbox" 
                        id="live-visibility-toggle" 
                        name="liveVisibility"
                        checked={settings.enableLiveUserCounter}
                        onChange={(e) => setLiveVisibilityFirebase(e.target.checked)}
                        className="hidden" 
                      />
                      <span className="text-[10px] font-bold text-slate-400">STATUS: {settings.enableLiveUserCounter ? 'ON' : 'OFF'}</span>
                      <button 
                        id="toggle-live-visibility"
                        onClick={() => setLiveVisibilityFirebase(!settings.enableLiveUserCounter)}
                        className={cn(
                          "w-9 h-5 rounded-full relative transition-colors duration-300",
                          settings.enableLiveUserCounter ? "bg-emerald-500" : "bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow",
                          settings.enableLiveUserCounter ? "left-4.5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Base Simulator Value</label>
                      <input 
                        type="number"
                        value={settings.liveUserBaseValue}
                        onChange={e => updateSettings({ liveUserBaseValue: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                      />
                      <p className="text-[9px] text-slate-600 italic">The minimum likely user count.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Randomness Range</label>
                      <input 
                        type="number"
                        value={settings.liveUserRange}
                        onChange={e => updateSettings({ liveUserRange: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                      />
                      <p className="text-[9px] text-slate-600 italic">Added randomly to the base value.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button onClick={handleSyncSettings} className="w-full bg-emerald-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm">
                    <Save size={18} /> Update Counter Logic
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">API Settings</h2>
                <p className="text-xs text-slate-500">Configure third-party service credentials.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Background Remover</h3>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Remove.bg API Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="password"
                        value={settings.bgRemoverApiKey}
                        onChange={e => updateSettings({ bgRemoverApiKey: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 text-xs font-mono outline-none transition-all"
                        placeholder="Paste API key..."
                      />
                    </div>
                    <p className="text-[9px] text-slate-600 px-1 italic">Handled securely by the server proxy.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={handleSyncSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm"
                  >
                    <Save size={18} /> Save API Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-systems' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">API Systems</h2>
                <p className="text-xs text-slate-500">Manage internal API endpoints.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Downloader Clusters</h3>
                    <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-[8px] font-black uppercase tracking-tighter border border-blue-500/10">Cobalt Engine</div>
                  </div>
                  <p className="text-[10px] text-slate-500 px-1">One URL per line.</p>
                  <textarea 
                    value={settings.downloaderApis?.join('\n')}
                    onChange={e => updateSettings({ downloaderApis: e.target.value.split('\n').filter(l => l.trim()) })}
                    className="w-full h-48 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-4 font-mono text-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="https://cobalt.instance/api/json..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={handleSyncSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm"
                  >
                    <Save size={18} /> Save API Systems
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-payment' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Payment Engine</h2>
                <p className="text-xs text-slate-500">Configure DesiPayBD (TukTakPay) integration.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <h3 className="font-bold text-[11px] uppercase tracking-widest text-emerald-500 ml-1">Currency Mode</h3>
                       <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                          <button 
                            onClick={() => updateSettings({ paybdCurrency: 'USD' })}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                              settings.paybdCurrency === 'USD' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                          >
                            USDT (USD)
                          </button>
                          <button 
                            onClick={() => updateSettings({ paybdCurrency: 'BDT' })}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                              settings.paybdCurrency === 'BDT' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                          >
                            Taka (BDT)
                          </button>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-[11px] uppercase tracking-widest text-emerald-500 ml-1">Authentication</h3>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input 
                          type="password"
                          value={settings.paybdApiKey}
                          onChange={e => updateSettings({ paybdApiKey: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs font-mono outline-none transition-all"
                          placeholder="DesiPayBD API Key"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={cn("space-y-2 transition-all", settings.paybdCurrency === 'USD' ? "opacity-30 pointer-events-none" : "opacity-100")}>
                      <h3 className="font-bold text-[11px] uppercase tracking-widest text-emerald-500 ml-1">Exchange Rate</h3>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-black uppercase ml-1">1 USD = ? BDT</label>
                        <input 
                          type="number"
                          value={settings.paybdExchangeRate}
                          onChange={e => updateSettings({ paybdExchangeRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-sm font-bold outline-none transition-all"
                          placeholder="110"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-bold text-[11px] uppercase tracking-widest text-emerald-500 ml-1">Site URL (Callback Domain)</h3>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-black uppercase ml-1">সাইটের মেইন ইউআরএল</label>
                        <input 
                          type="text"
                          value={settings.paybdSiteUrl}
                          onChange={e => updateSettings({ paybdSiteUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs font-mono outline-none transition-all"
                          placeholder="https://your-site.com"
                        />
                        <p className="text-[9px] text-slate-600 font-medium ml-1">পেমেন্ট শেষে এই ইউআরএল-এ ফিরে আসবে।</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={handleSyncSettings}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 text-sm"
                  >
                    <Save size={18} /> Deploy Payment Settings
                  </button>
                  <p className="mt-4 text-[10px] text-center text-slate-600 uppercase tracking-widest font-black leading-relaxed">
                    Changes take effect immediately on next transaction
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'config-movies' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Dih Movie Pro <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded ml-2 border border-blue-500/20">CUSTOMIZER</span></h2>
                  <p className="text-xs text-slate-500">Configure your professional movie streaming experience.</p>
                </div>
                <div className="flex gap-2">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)] self-center mr-2" />
                   <button onClick={() => updateSettings({ ...DEFAULT_SETTINGS })} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg transition-colors border border-slate-700">RESET DEFAULTS</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Hero Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                      <LayoutDashboard size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Hero Experience</h3>
                      <p className="text-[10px] text-slate-500">Control the main featured section</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">Auto-Rotate Hero</span>
                        <span className="text-[9px] text-slate-600">Switch trending movies automatically</span>
                      </div>
                      <div 
                        onClick={() => updateSettings({ movieAutoRotateHero: !settings.movieAutoRotateHero })}
                        className={cn("w-10 h-5 rounded-full relative transition-all border border-slate-700", settings.movieAutoRotateHero ? "bg-amber-500 border-amber-400" : "bg-slate-800")}
                      >
                        <div className={cn("absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all", settings.movieAutoRotateHero ? "left-5.5" : "left-1")} />
                      </div>
                    </label>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Rotation Interval (ms)</label>
                      <input 
                        type="number"
                        value={settings.movieAutoRotateInterval}
                        onChange={e => updateSettings({ movieAutoRotateInterval: parseInt(e.target.value) || 7000 })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Featured Slides Count</label>
                      <input 
                        type="number"
                        value={settings.movieHeroSlidesCount}
                        onChange={e => updateSettings({ movieHeroSlidesCount: parseInt(e.target.value) || 5 })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div className="pt-2 space-y-3">
                       <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Hero Components</label>
                       {[
                         { id: 'movieShowHeroDescription', label: 'Show Description', desc: 'Display movie overview text' },
                         { id: 'movieShowHeroScore', label: 'Show Rating Score', desc: 'Display TMDB rating on slide' },
                         { id: 'movieShowHeroDetailsButton', label: 'Show Details Link', desc: 'Display "View Details" button' },
                       ].map(feat => (
                        <label key={feat.id} className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-900 transition-all">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-tight">{feat.label}</span>
                          </div>
                          <div 
                            onClick={() => updateSettings({ [feat.id]: !(settings as any)[feat.id] })}
                            className={cn("w-8 h-4 rounded-full relative transition-all border border-slate-700", (settings as any)[feat.id] ? "bg-amber-500 border-amber-400" : "bg-slate-800")}
                          >
                            <div className={cn("absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all", (settings as any)[feat.id] ? "left-4.5" : "left-1")} />
                          </div>
                        </label>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
                      <Film size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Page Structures</h3>
                      <p className="text-[10px] text-slate-500">Enable/disable entire UI modules</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'movieShowLanguageSection', label: 'Multi-Language Hub', desc: 'Browse movies by origin' },
                      { id: 'movieShowGenreRows', label: 'Advanced Genre Rows', desc: 'Action, Sci-Fi, Comedy, etc' },
                      { id: 'movieShowCastSection', label: 'Top Cast Section', desc: 'Show actor profiles in detail' },
                      { id: 'movieShowSimilarMovies', label: 'Discovery Engine', desc: 'Show recommendations row' },
                      { id: 'movieActorProfileEnabled', label: 'Actor Portraits', desc: 'Enable full actor biography' },
                    ].map(feat => (
                      <label key={feat.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest">{feat.label}</span>
                          <span className="text-[9px] text-slate-600">{feat.desc}</span>
                        </div>
                        <div 
                          onClick={() => updateSettings({ [feat.id]: !(settings as any)[feat.id] })}
                          className={cn("w-10 h-5 rounded-full relative transition-all border border-slate-700", (settings as any)[feat.id] ? "bg-indigo-500 border-indigo-400" : "bg-slate-800")}
                        >
                          <div className={cn("absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all", (settings as any)[feat.id] ? "left-5.5" : "left-1")} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Horizontal Rows Control */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                      <LayoutDashboard size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Home Categories</h3>
                      <p className="text-[10px] text-slate-500">Toggle individual movie shelves</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'movieShowWeeklyTrending', label: 'Trending' },
                      { id: 'movieShowNowPlaying', label: 'Now Playing' },
                      { id: 'movieShowPopular', label: 'Popular' },
                      { id: 'movieShowComingSoon', label: 'Upcoming' },
                      { id: 'movieShowTopRated', label: 'All-Time' },
                    ].map(feat => (
                      <label key={feat.id} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest">{feat.label}</span>
                        <div 
                          onClick={() => updateSettings({ [feat.id]: !(settings as any)[feat.id] })}
                          className={cn("w-8 h-4 rounded-full relative transition-all border border-slate-700", (settings as any)[feat.id] ? "bg-emerald-500 border-emerald-400" : "bg-slate-800")}
                        >
                          <div className={cn("absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all", (settings as any)[feat.id] ? "left-4.5" : "left-1")} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section Visibility */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                      <Eye size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Global Visibility</h3>
                      <p className="text-[10px] text-slate-500">Toggle sections and features</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'movieShowLanguageSection', label: 'Language Section', desc: 'Show browse by language grid' },
                      { id: 'movieActorProfileEnabled', label: 'Actor Profiles', desc: 'Enable detailed actor pages' },
                      { id: 'movieBrowseByGenreEnabled', label: 'Genre Browsing', desc: 'Show genre selection tags' },
                      { id: 'movieSearchEnabled', label: 'Search Engine', desc: 'Global movie search functionality' },
                      { id: 'movieShowTrendingBadge', label: 'Trending Badge', desc: 'Show #1 TRENDING badge on hero' },
                      { id: 'movieShowWeeklyTrending', label: 'Weekly Trending Row', desc: 'Toggle the trending movies section' },
                      { id: 'movieShowNowPlaying', label: 'Now Playing Row', desc: 'Toggle current cinema releases' },
                      { id: 'movieShowPopular', label: 'Popular Movies Row', desc: 'Toggle popular movies section' },
                      { id: 'movieShowComingSoon', label: 'Coming Soon Row', desc: 'Toggle upcoming movies section' },
                      { id: 'movieShowGenreRows', label: 'Categorized Genre Rows', desc: 'Toggle Action, Sci-Fi, Comedy etc.' },
                      { id: 'movieShowTopRated', label: 'Top Rated Movies Row', desc: 'Toggle all-time hits section' },
                      { id: 'movieShowCastSection', label: 'Detailed Cast List', desc: 'Show cast section in movie details' },
                      { id: 'movieShowSimilarMovies', label: 'Similar Suggestions', desc: 'Show recommendations row' },
                    ].map(feat => (
                      <label key={feat.id} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest">{feat.label}</span>
                          <span className="text-[9px] text-slate-600">{feat.desc}</span>
                        </div>
                        <div 
                          onClick={() => updateSettings({ [feat.id]: !(settings as any)[feat.id] })}
                          className={cn("w-10 h-5 rounded-full relative transition-all border border-slate-700", (settings as any)[feat.id] ? "bg-emerald-500 border-emerald-400" : "bg-slate-800")}
                        >
                          <div className={cn("absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all", (settings as any)[feat.id] ? "left-5.5" : "left-1")} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Infrastructure Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Metadata Infrastructure</h3>
                      <p className="text-[10px] text-slate-500">Global provider and gateway keys</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">TMDB API Key (Global)</label>
                      <div className="flex gap-2">
                        <div className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 truncate break-all">
                          {settings.tmdbApiKey}
                        </div>
                        <button 
                          onClick={() => {
                            const newKey = prompt('Enter new TMDB API Key:', settings.tmdbApiKey);
                            if (newKey) updateSettings({ tmdbApiKey: newKey });
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-black"
                        >
                          EDIT
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Default Movie Server</label>
                      <select 
                        value={settings.moviePlayerServer}
                        onChange={e => updateSettings({ moviePlayerServer: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="vidsrc.to">vidsrc.to (Primary)</option>
                        <option value="vidsrc.me">vidsrc.me</option>
                        <option value="embed.su">embed.su</option>
                        <option value="superembed.stream">superembed.stream</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/50">
                    <button onClick={handleSyncSettings} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-sm">
                      <Save size={18} /> Synchronize Movie Ecosystem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config-utility' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Utility Pro <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded ml-2 border border-emerald-500/20">CONFIG</span></h2>
                  <p className="text-xs text-slate-500">Manage advanced functional tools and calculation engines.</p>
                </div>
                <button onClick={handleSyncSettings} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                  <Save size={14} /> SAVE CHANGES
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                      <Calculator size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Compound Pro</h3>
                      <p className="text-[10px] text-slate-500">Daily interest calculator settings</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">Enable Tool</span>
                        <span className="text-[9px] text-slate-600">Show on public dashboard</span>
                      </div>
                      <div 
                        onClick={() => updateSettings({ toolDailyCompoundEnabled: !settings.toolDailyCompoundEnabled })}
                        className={cn("w-10 h-5 rounded-full relative transition-all border border-slate-700", settings.toolDailyCompoundEnabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800")}
                      >
                        <div className={cn("absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all", settings.toolDailyCompoundEnabled ? "left-5.5" : "left-1")} />
                      </div>
                    </label>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                       <p className="text-[10px] text-blue-400 leading-relaxed font-medium">
                         The Daily Compound Calculator uses a high-precision recursive engine to simulate multi-year growth with daily contributions.
                       </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-500/10 text-slate-500 rounded-xl border border-slate-500/20">
                      <RefreshCcw size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">More Tools</h3>
                      <p className="text-[10px] text-slate-500">Upcoming utility modules</p>
                    </div>
                  </div>
                  <div className="mt-8 text-center py-10">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Expansion slot available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config-video' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Video Downloader Config</h2>
                <p className="text-xs text-slate-500">Configure premium engines and public nodes.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                   <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">RapidAPI (Priority Engine)</h3>
                   <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">RapidAPI Key</label>
                      <input 
                        type="password"
                        value={settings.rapidApiKey}
                        onChange={e => updateSettings({ rapidApiKey: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                        placeholder="Social Download All In One Key"
                      />
                      <p className="text-[9px] text-slate-600 italic">This engine supports YouTube, Facebook, Instagram, Twitter, and more.</p>
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Public Nodes (Fallback)</h3>
                  <textarea 
                    value={settings.downloaderApis?.join('\n')}
                    onChange={e => updateSettings({ downloaderApis: e.target.value.split('\n').filter(l => l.trim()) })}
                    className="w-full h-40 bg-slate-950 text-slate-200 border border-slate-800 p-4 rounded-xl font-mono text-[10px] resize-none"
                    placeholder="https://apiUrl/api/json..."
                  />
                  <p className="text-[9px] text-slate-600">Enter one URL per line. These are used as backups if RapidAPI fails or if no key is provided.</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                   <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500 ml-1">Toggle Platforms</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'downloaderEnableFacebook', label: 'Facebook' },
                        { id: 'downloaderEnableYouTube', label: 'YouTube' },
                        { id: 'downloaderEnableTikTok', label: 'TikTok' },
                        { id: 'downloaderEnableInstagram', label: 'Instagram' },
                        { id: 'downloaderEnablePornhub', label: 'Pornhub' },
                        { id: 'downloaderEnableTwitter', label: 'Twitter/X' },
                        { id: 'downloaderEnableVimeo', label: 'Vimeo' },
                        { id: 'downloaderEnablePinterest', label: 'Pinterest' },
                        { id: 'downloaderEnableLinkedIn', label: 'LinkedIn' },
                        { id: 'downloaderEnableReddit', label: 'Reddit' },
                        { id: 'downloaderEnableSnapchat', label: 'Snapchat' },
                        { id: 'downloaderEnableTwitch', label: 'Twitch' },
                        { id: 'downloaderEnableThreads', label: 'Threads' },
                      ].map(feat => (
                        <label key={feat.id} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-all">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest">{feat.label}</span>
                            <span className="text-[9px] text-slate-600">Toggle Access</span>
                          </div>
                          <div 
                            onClick={() => updateSettings({ [feat.id]: !(settings as any)[feat.id] })}
                            className={cn("w-10 h-5 rounded-full relative transition-all border border-slate-700", (settings as any)[feat.id] ? "bg-blue-500 border-blue-400" : "bg-slate-800")}
                          >
                            <div className={cn("absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all", (settings as any)[feat.id] ? "left-5.5" : "left-1")} />
                          </div>
                        </label>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button onClick={handleSyncSettings} className="w-full bg-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm">
                    <Save size={18} /> Update Downloader Config
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config-bachelor-point' && (
            <div className="animate-in fade-in duration-300">
              <BachelorPointManager />
            </div>
          )}

          {activeTab === 'config-movies' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Movie Service Config</h2>
                <p className="text-xs text-slate-500">Manage streaming providers and metadata sources.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-indigo-500 ml-1">The Movie Database (TMDB)</h3>
                  <div className="space-y-1.5">
                     <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">TMDB API Key</label>
                     <input 
                        type="text"
                        value={settings.tmdbApiKey}
                        onChange={e => updateSettings({ tmdbApiKey: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                        placeholder="Enter TMDB API Key"
                      />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-indigo-500 ml-1">Streaming Embed (VidSrc)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Default Player Mirror</label>
                       <select 
                          value={settings.moviePlayerServer}
                          onChange={e => updateSettings({ moviePlayerServer: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 text-xs font-bold"
                        >
                          <option value="vidsrc.to">VidSrc.to (Best)</option>
                          <option value="vidsrc.cc">VidSrc.cc</option>
                          <option value="vidsrc.me">VidSrc.me</option>
                          <option value="vidsrc.online">VidSrc.online</option>
                          <option value="vidsrc.pro">VidSrc.pro</option>
                          <option value="vidsrc.net">VidSrc.net</option>
                          <option value="vidsrc.pm">VidSrc.pm</option>
                          <option value="moviesapi.club">MoviesAPI.club</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">VidSrc / Mirror API Key</label>
                       <input 
                          type="text"
                          value={settings.vidsrcApiKey}
                          onChange={e => updateSettings({ vidsrcApiKey: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                          placeholder="API Key (If required)"
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-indigo-500 ml-1">Streaming Availability API</h3>
                  <div className="space-y-1.5">
                     <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">RapidAPI Key (Streaming-Availability)</label>
                     <input 
                        type="password"
                        value={settings.movieApiKey}
                        onChange={e => updateSettings({ movieApiKey: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                        placeholder="Enter RapidAPI Key"
                      />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button onClick={handleSyncSettings} className="w-full bg-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 text-sm">
                    <Save size={18} /> Save Movie Config
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config-ads' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Ads Synergy System</h2>
                  <p className="text-xs text-slate-500">Manage multiple monetization engines simultaneously.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-500">Global Ads Master</span>
                    <button 
                      onClick={() => updateSettings({ enableAds: !settings.enableAds })}
                      className={cn(
                        "w-10 h-5 rounded-full transition-all relative border",
                        settings.enableAds ? "bg-indigo-600 border-indigo-400" : "bg-slate-800 border-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all",
                        settings.enableAds ? "right-0.5" : "left-0.5 shadow-sm"
                      )} />
                    </button>
                  </div>
                  <button onClick={() => setActiveTab('dashboard')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg transition-colors border border-slate-700">BACK TO HUB</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className={cn("p-4 rounded-2xl border text-left transition-all", settings.enableAdsterra ? "bg-red-500/10 border-red-500/50" : "bg-slate-900 border-slate-800")}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-tighter text-red-500">Adsterra Engine</span>
                       <button onClick={() => updateSettings({ enableAdsterra: !settings.enableAdsterra })} className={cn("px-2 py-0.5 rounded text-[8px] font-black", settings.enableAdsterra ? "bg-red-500 text-white" : "bg-slate-800 text-slate-500")}>
                          {settings.enableAdsterra ? 'ONLINE' : 'OFFLINE'}
                       </button>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">Pop-unders, Social Bars, and Native Banners.</p>
                 </div>

                 <div className={cn("p-4 rounded-2xl border text-left transition-all", settings.enableAdsense ? "bg-blue-500/10 border-blue-500/50" : "bg-slate-900 border-slate-800")}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-tighter text-blue-500">Google AdSense</span>
                       <button onClick={() => updateSettings({ enableAdsense: !settings.enableAdsense })} className={cn("px-2 py-0.5 rounded text-[8px] font-black", settings.enableAdsense ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500")}>
                          {settings.enableAdsense ? 'ONLINE' : 'OFFLINE'}
                       </button>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">Enable Google Auto-Ads and Verification scripts.</p>
                 </div>

                 <div className={cn("p-4 rounded-2xl border text-left transition-all", settings.enableManualAds ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-900 border-slate-800")}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500">Manual Ads</span>
                       <button onClick={() => updateSettings({ enableManualAds: !settings.enableManualAds })} className={cn("px-2 py-0.5 rounded text-[8px] font-black", settings.enableManualAds ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500")}>
                          {settings.enableManualAds ? 'ONLINE' : 'OFFLINE'}
                       </button>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">Direct image/link banners for your own sponsors.</p>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-8">
                {/* Adsterra Configuration */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Adsterra Script Integration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Header Script (Pop-under/Global)</label>
                      <textarea 
                        value={settings.adsterraHeader}
                        onChange={e => updateSettings({ adsterraHeader: e.target.value })}
                        className="w-full h-24 bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[9px] focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                        placeholder="Paste script..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Footer Script (Social Bar)</label>
                      <textarea 
                        value={settings.adsterraFooter}
                        onChange={e => updateSettings({ adsterraFooter: e.target.value })}
                        className="w-full h-24 bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[9px] focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                        placeholder="Paste script..."
                      />
                    </div>
                  </div>
                </div>

                {/* AdSense Configuration */}
                <div className="space-y-4 pt-8 border-t border-slate-800/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    AdSense Auto-Ads Engine
                  </h3>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Global AdSense Script (InHead)</label>
                    <textarea 
                      value={settings.adsenseHeader}
                      onChange={e => updateSettings({ adsenseHeader: e.target.value })}
                      className="w-full h-24 bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[9px] focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbydata.js?client=ca-pub-...' crossorigin='anonymous'></script>"
                    />
                  </div>
                </div>

                {/* Manual Ads Configuration */}
                <div className="space-y-4 pt-8 border-t border-slate-800/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Manual Banner Hub
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Banner Image URL</label>
                      <input 
                        type="text"
                        value={settings.manualAdImage}
                        onChange={e => updateSettings({ manualAdImage: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Target Link URL</label>
                      <input 
                        type="text"
                        value={settings.manualAdLink}
                        onChange={e => updateSettings({ manualAdLink: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="https://t.me/..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Ad Title / Text</label>
                      <input 
                        type="text"
                        value={settings.manualAdTitle}
                        onChange={e => updateSettings({ manualAdTitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Sponsor Banner"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button onClick={handleSyncSettings} className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 py-3 rounded-2xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all">
                    <Save size={16} /> Sync All Ad Engines
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config-ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Advanced Engine Config</h2>
                <p className="text-xs text-slate-500">Customize advanced tool behavior.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest text-amber-500 ml-1">Background Removal</h3>
                  <div className="space-y-1.5">
                     <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Remove.bg API Key</label>
                     <input 
                        type="password"
                        value={settings.bgRemoverApiKey}
                        onChange={e => updateSettings({ bgRemoverApiKey: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                      />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <button onClick={handleSyncSettings} className="w-full bg-amber-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-sm">
                    <Save size={18} /> Save Config
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config-maintenance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Firebase Realtime Maintenance</h2>
                  <p className="text-xs text-slate-500">Enable, disable, and monitor global website status on your real Firestore.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold uppercase",
                    maintenanceConnectionStatus === 'connected' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    maintenanceConnectionStatus === 'connecting' ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      maintenanceConnectionStatus === 'connected' ? "bg-emerald-500" :
                      maintenanceConnectionStatus === 'connecting' ? "bg-amber-500 animate-ping" :
                      "bg-rose-500"
                    )} />
                    {maintenanceConnectionStatus === 'connected' ? "DB Connected" :
                     maintenanceConnectionStatus === 'connecting' ? "Connecting DB..." : "DB Connection Error"}
                  </div>
                </div>
              </div>

              {/* Toggle Status Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -right-16 -bottom-16 w-36 h-36 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Current Status Mode</span>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {maintenanceModeLive === true ? (
                            <span className="text-amber-500 flex items-center gap-2">
                              <ShieldAlert className="w-5 h-5" /> Maintenance Active
                            </span>
                          ) : maintenanceModeLive === false ? (
                            <span className="text-emerald-500 flex items-center gap-2">
                              <Rocket className="w-5 h-5" /> Website Live
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-2 animate-pulse">
                              Retrieving State...
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                      {maintenanceModeLive === true 
                        ? "The public-facing GitHub Pages website is currently locked. External visitors will see a beautiful full-screen maintenance page."
                        : "Nominal operational state. All modules are online and available to visitors."}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-slate-800/40 mt-4">
                    <input 
                      type="checkbox" 
                      id="maintenance-toggle" 
                      name="maintenance"
                      checked={!!maintenanceModeLive}
                      onChange={(e) => setMaintenanceModeFirebase(e.target.checked)}
                      className="hidden" 
                    />
                    <button
                      onClick={() => setMaintenanceModeFirebase(true)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border active:scale-95",
                        maintenanceModeLive === true
                          ? "bg-amber-500/25 text-amber-400 border-amber-500/30 cursor-not-allowed"
                          : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300"
                      )}
                      disabled={maintenanceModeLive === true}
                    >
                      <ShieldAlert size={14} /> Force Maintenance
                    </button>
                    
                    <button
                      onClick={() => setMaintenanceModeFirebase(false)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border active:scale-95 shadow-lg",
                        maintenanceModeLive === false
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-not-allowed shadow-none"
                          : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500/35 text-white shadow-indigo-600/20"
                      )}
                      disabled={maintenanceModeLive === false}
                    >
                      <Rocket size={14} /> Restore Website
                    </button>
                  </div>
                </div>

                {/* DB Info Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Firebase Resource</h4>
                  <div className="space-y-4 text-xs font-mono">
                    <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-600 uppercase font-black">Project Identifier</div>
                      <div className="text-slate-300 truncate font-semibold">dih-hub</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-600 uppercase font-black">Target Location</div>
                      <div className="text-indigo-400 font-semibold">/maintenance/config</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-600 uppercase font-black">Field Target</div>
                      <div className="text-amber-400 font-semibold">{"{ maintenanceMode: boolean }"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration snippet instructions */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">GitHub Pages HTML+JS Wrapper Code</h3>
                    <p className="text-xs text-slate-500">Ready to copy and host immediately in static, serverless environments.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const codeElement = document.getElementById("github-pages-code-snippet");
                      if (codeElement) {
                        navigator.clipboard.writeText(codeElement.textContent || "");
                        setIsCopiedHtmlCode(true);
                        setTimeout(() => setIsCopiedHtmlCode(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 transition-colors"
                  >
                    {isCopiedHtmlCode ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> Copied!</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy size={12} /> Copy Code</span>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl relative p-4 max-h-96 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed select-all">
                  <pre id="github-pages-code-snippet">{`<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DIH HUB - System Status</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(1.1); opacity: 0.35; } }
    .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
  </style>
</head>
<body class="h-full bg-[#030712] text-white">
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div class="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
    <div class="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-pink-600/15 rounded-full blur-[140px] animate-pulse-slow"></div>
  </div>
  <div class="relative z-10 min-h-screen flex flex-col justify-between p-6">
    <header class="w-full max-w-7xl mx-auto flex items-center justify-between py-4 border-b border-white/5">
      <span class="font-bold tracking-tight text-white uppercase">DIH HUB</span>
      <div id="status-badge" class="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-xs font-mono font-bold animate-pulse">
        CONNECTING...
      </div>
    </header>
    <!-- View Panels -->
    <main class="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full">
      <div id="maintenance-view" class="text-center space-y-6" style="display: none;">
        <h1 class="text-4xl font-extrabold uppercase tracking-tight text-white">Under Maintenance</h1>
        <p class="text-slate-400 text-sm max-w-md mx-auto">DIH HUB is currently undergoing scheduled backend operations and visual modifications. Please check back shortly!</p>
      </div>
      <div id="normal-view" class="text-center space-y-6" style="display: none;">
        <h1 class="text-4xl font-black uppercase text-indigo-400">Website is Live!</h1>
        <p class="text-slate-300 text-sm">Welcome back to DIH HUB. Systems nominal.</p>
      </div>
    </main>
  </div>
  <!-- Firebase SDK Modular Connection -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    const firebaseConfig = {
      apiKey: "AIzaSyA1y75cejRurTaKOCnOKEN-eeJTTwcn5oU",
      authDomain: "daddy-here-33965.firebaseapp.com",
      projectId: "daddy-here-33965",
      storageBucket: "daddy-here-33965.firebasestorage.app",
      messagingSenderId: "41004496145",
      appId: "1:41004496145:web:4bdca5026ebf6d333148b0"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Listen to standard 'site/settings' with fallback to 'maintenance/config'
    const siteDocRef = doc(db, "site", "settings");
    const maintDocRef = doc(db, "maintenance", "config");
    
    onSnapshot(siteDocRef, (snapshot) => {
      let isMaintenance = false;
      if (snapshot.exists()) {
        const data = snapshot.data();
        isMaintenance = data.maintenance === true || data.maintenanceMode === true;
        applyMode(isMaintenance);
      } else {
        onSnapshot(maintDocRef, (mSnap) => {
          if (mSnap.exists()) {
            const mData = mSnap.data();
            isMaintenance = mData.maintenanceMode === true || mData.maintenance === true;
            applyMode(isMaintenance);
          } else {
            applyMode(false);
          }
        });
      }
    });

    function applyMode(isMaintenance) {
      document.getElementById("maintenance-view").style.display = isMaintenance ? "block" : "none";
      document.getElementById("normal-view").style.display = isMaintenance ? "none" : "block";
      const badge = document.getElementById("status-badge");
      badge.className = isMaintenance ? "px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-xs font-mono font-bold" : "px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold";
      badge.innerText = isMaintenance ? "MAINTENANCE ACTIVE" : "SYSTEM ONLINE";
    }
  </script>
</body>
</html>`}</pre>
                </div>
              </div>
            </div>
          )}
          
          {/* Hidden inputs to guarantee robust support for the admin-panel.js script selectors */}
          <input 
            type="checkbox" 
            id="upcoming-toggle" 
            name="upcoming" 
            checked={settings.upcomingTools !== undefined && settings.upcomingTools.length > 0} 
            onChange={(e) => {
              if (e.target.checked) {
                updateSettings({ upcomingTools: ['some-upcoming-id'] });
              } else {
                updateSettings({ upcomingTools: [] });
              }
            }}
            className="hidden" 
          />
          <input 
            type="checkbox" 
            id="visible-toggle" 
            name="visible" 
            checked={settings.visibleTools !== undefined && settings.visibleTools.length > 0} 
            onChange={(e) => {
              if (e.target.checked) {
                updateSettings({ visibleTools: ['tenmin-ai', 'qr', 'encryption', 'to-base64', 'bg-remover', 'auto-passport', 'video', 'dex-protector', 'lib-encryptor', 'apk-store', 'dih-movies', 'temp-mail', 'mobile-bypass', 'hosted-admin'] });
              } else {
                updateSettings({ visibleTools: [] });
              }
            }}
            className="hidden" 
          />
        </div>
      </main>
    </div>
  );
}
