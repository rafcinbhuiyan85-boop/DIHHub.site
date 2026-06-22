import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Key, Layers, Eye, EyeOff, Plus, 
  Trash2, Save, LogOut, ChevronRight, Activity, Menu,
  LayoutDashboard, Palette, QrCode, ShieldCheck, Download, Image, ShieldAlert, Cpu, Smartphone, Mail, MessageSquare, Film, Scissors, Cloud,
  Users, ListFilter, Calendar, Clock, Upload, Package, Star, ArrowUp, ArrowDown, Layout, Calculator, RefreshCcw, Globe, Edit2, Code2, Settings2, ExternalLink, Zap, Search, X, Copy, Check, Shield, DollarSign, Rocket,
  Tv, Video, Flame
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
  const [activeTab, setActiveTab] = useState<'tools' | 'templates' | 'store' | 'users' | 'general' | 'appearance' | 'dashboard' | 'dashboard-stats' | 'dashboard-counter' | 'dashboard-traffic' | 'api-keys' | 'api-systems' | 'api-payment' | 'config-video' | 'config-movies' | 'config-ai' | 'config-ads' | 'hosted-templates' | 'config-maintenance' | 'config-bachelor-point' | 'config-smm'>('tools');
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

  // SMM Management States
  const [smmSubTab, setSmmSubTab] = useState<'dashboard' | 'orders' | 'services' | 'users' | 'deposits' | 'settings' | 'providers' | 'gateways'>('dashboard');
  const [smmOrders, setSmmOrders] = useState<any[]>([]);
  const [smmUsers, setSmmUsers] = useState<any[]>([]);
  const [smmDeposits, setSmmDeposits] = useState<any[]>([]);
  const [smmServicesList, setSmmServicesList] = useState<any[]>([]);
  const [smmProviders, setSmmProviders] = useState<any[]>([]);
  const [smmManualGateways, setSmmManualGateways] = useState<any[]>([]);
  const [selectedCatalogSvcIds, setSelectedCatalogSvcIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // SMM API Live Fetch & Import States
  const [activeImportProvider, setActiveImportProvider] = useState<any | null>(null);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [importStep, setImportStep] = useState<'connecting' | 'loading' | 'ready' | 'importing' | 'completed'>('connecting');
  const [apiServices, setApiServices] = useState<any[]>([]);
  const [selectedApiSvcIds, setSelectedApiSvcIds] = useState<number[]>([]);
  const [importMarkup, setImportMarkup] = useState('1.5'); // Multiplier (e.g. 1.5x)
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiCatFilter, setApiCatFilter] = useState('All');
  const [smmToast, setSmmToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Inline deletion state managers for safe iframe action flow
  const [smmDeletingServiceId, setSmmDeletingServiceId] = useState<number | null>(null);
  const [smmDeletingProviderId, setSmmDeletingProviderId] = useState<number | null>(null);
  const [smmDeletingOrderId, setSmmDeletingOrderId] = useState<number | null>(null);
  const [smmDeletingUserId, setSmmDeletingUserId] = useState<number | null>(null);
  const [smmDeletingDepositId, setSmmDeletingDepositId] = useState<number | null>(null);
  const [smmConfirmClearAll, setSmmConfirmClearAll] = useState(false);
  const [smmConfirmBatchDelete, setSmmConfirmBatchDelete] = useState(false);

  // Search & Filter States
  const [smmOrderSearch, setSmmOrderSearch] = useState('');
  const [smmOrderStatusFilter, setSmmOrderStatusFilter] = useState('');
  const [smmSvcSearch, setSmmSvcSearch] = useState('');
  const [smmSvcCatFilter, setSmmSvcCatFilter] = useState('');
  const [smmUserSearch, setSmmUserSearch] = useState('');
  const [smmDepStatusFilter, setSmmDepStatusFilter] = useState('');

  // Performance optimizations (useMemo cache)
  const userStatsMap = useMemo(() => {
    const stats: Record<number, { count: number; spent: number }> = {};
    for (const o of smmOrders) {
      const uId = o.userId;
      if (!stats[uId]) {
        stats[uId] = { count: 0, spent: 0 };
      }
      stats[uId].count += 1;
      stats[uId].spent += o.amount;
    }
    return stats;
  }, [smmOrders]);

  const filteredAdminOrdersBySearch = useMemo(() => {
    return smmOrders
      .slice()
      .reverse()
      .filter(o => {
        const matchTerm = (o.id.toString() + o.serviceName + o.link).toLowerCase();
        const matchesSearch = matchTerm.includes(smmOrderSearch.toLowerCase());
        const matchesStatus = !smmOrderStatusFilter || o.status === smmOrderStatusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [smmOrders, smmOrderSearch, smmOrderStatusFilter]);

  const visibleCatalogServices = useMemo(() => {
    return smmServicesList.filter(s => {
      const match = (s.name + s.category).toLowerCase().includes(smmSvcSearch.toLowerCase());
      let matchesCat = true;
      if (smmSvcCatFilter) {
        const plat = smmSvcCatFilter.toLowerCase();
        const sCat = (s.category || '').toLowerCase();
        const sName = (s.name || '').toLowerCase();
        if (plat === 'instagram') {
          matchesCat = sCat.includes('instagram') || sCat.includes('ig ') || sCat.includes('ig-') || sName.includes('instagram') || sName.includes('ig');
        } else if (plat === 'facebook') {
          matchesCat = sCat.includes('facebook') || sCat.includes('fb') || sCat.includes('fanpage') || sCat.includes('meta') || sName.includes('facebook') || sName.includes('fb');
        } else if (plat === 'youtube') {
          matchesCat = sCat.includes('youtube') || sCat.includes('yt ') || sCat.includes('yt-') || sName.includes('youtube') || sName.includes('yt');
        } else if (plat === 'tiktok') {
          matchesCat = sCat.includes('tiktok') || sName.includes('tiktok');
        } else if (plat === 'twitter/x' || plat === 'twitter' || plat === 'x') {
          matchesCat = sCat.includes('twitter') || sCat.includes('x.') || sCat === 'x' || sCat.includes('rt ') || sCat.includes('tweet') || sName.includes('twitter') || sName.includes('x');
        } else if (plat === 'telegram') {
          matchesCat = sCat.includes('telegram') || sCat.includes('tg ') || sCat.includes('tg-') || sName.includes('telegram') || sName.includes('tg');
        } else if (plat === 'spotify') {
          matchesCat = sCat.includes('spotify') || sName.includes('spotify');
        } else if (plat === 'linkedin') {
          matchesCat = sCat.includes('linkedin') || sName.includes('linkedin');
        } else if (plat === 'discord') {
          matchesCat = sCat.includes('discord') || sName.includes('discord');
        } else if (plat.includes('traffic') || plat.includes('website')) {
          matchesCat = sCat.includes('traffic') || sCat.includes('website') || sCat.includes('visitor') || sCat.includes('seo') || sName.includes('traffic') || sName.includes('website');
        } else if (plat === 'others') {
          const known = ['instagram', 'facebook', 'fb', 'youtube', 'yt ', 'tiktok', 'twitter', 'x.', 'telegram', 'tg ', 'spotify', 'linkedin', 'discord', 'traffic', 'website', 'visitor', 'seo'];
          matchesCat = !known.some(k => sCat.includes(k) || sName.includes(k));
        } else {
          matchesCat = s.category === smmSvcCatFilter || sCat.includes(plat);
        }
      }
      return match && matchesCat;
    });
  }, [smmServicesList, smmSvcSearch, smmSvcCatFilter]);

  const adminUniqueSmmCategoriesOptions = useMemo(() => {
    const defaults = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Twitter/X', 'Telegram', 'Spotify', 'LinkedIn', 'Discord', 'Website Traffic', 'Others'];
    const currentCats = smmServicesList.map(s => s.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...currentCats]));
  }, [smmServicesList]);

  // Modals / Forms States
  const [isSmmModalOpen, setIsSmmModalOpen] = useState(false);
  const [smmModalTitle, setSmmModalTitle] = useState('');
  const [smmModalType, setSmmModalType] = useState<'add-service' | 'edit-service' | 'edit-order' | 'edit-user' | 'add-provider' | 'edit-provider' | 'edit-gateway' | null>(null);
  const [selectedSmmItem, setSelectedSmmItem] = useState<any>(null);

  // SMM Form values state
  const [smmFormName, setSmmFormName] = useState('');
  const [smmFormCategory, setSmmFormCategory] = useState('Instagram');
  const [smmFormQuality, setSmmFormQuality] = useState('Standard');
  const [smmFormPrice, setSmmFormPrice] = useState('0.00');
  const [smmFormTime, setSmmFormTime] = useState('0-24 hours');
  const [smmFormMin, setSmmFormMin] = useState('100');
  const [smmFormMax, setSmmFormMax] = useState('1000000');
  const [smmFormDesc, setSmmFormDesc] = useState('');
  const [smmFormRefill, setSmmFormRefill] = useState('No Refill');
  const [smmFormSvcProviderId, setSmmFormSvcProviderId] = useState('manual');
  const [smmFormSvcProviderServiceId, setSmmFormSvcProviderServiceId] = useState('');

  const [smmFormStatus, setSmmFormStatus] = useState('pending');
  const [smmFormLink, setSmmFormLink] = useState('');
  const [smmFormQty, setSmmFormQty] = useState('1000');
  const [smmFormAmount, setSmmFormAmount] = useState('1.50');
  const [smmFormApiOrderId, setSmmFormApiOrderId] = useState('');
  const [smmFormApiProviderId, setSmmFormApiProviderId] = useState('');
  const [isApiPlacingOrder, setIsApiPlacingOrder] = useState(false);

  const [smmFormUserEmail, setSmmFormUserEmail] = useState('');
  const [smmFormUserName, setSmmFormUserName] = useState('');
  const [smmFormUserBalance, setSmmFormUserBalance] = useState('50.00');

  // SMM Provider Forms State
  const [smmFormProvName, setSmmFormProvName] = useState('');
  const [smmFormProvUrl, setSmmFormProvUrl] = useState('');
  const [smmFormProvKey, setSmmFormProvKey] = useState('');
  const [smmFormProvStatus, setSmmFormProvStatus] = useState('active');
  const [smmFormProvBalance, setSmmFormProvBalance] = useState('500.00');

  // SMM Manual Gateway Forms State
  const [smmFormGatewayTitle, setSmmFormGatewayTitle] = useState('');
  const [smmFormGatewayNumber, setSmmFormGatewayNumber] = useState('');
  const [smmFormGatewayType, setSmmFormGatewayType] = useState('Personal');
  const [smmFormGatewayInstructions, setSmmFormGatewayInstructions] = useState('');
  const [smmFormGatewayEnabled, setSmmFormGatewayEnabled] = useState(true);

  // SMM Sync Effect
  useEffect(() => {
    if (smmToast) {
      const t = setTimeout(() => setSmmToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [smmToast]);

  useEffect(() => {
    const loadSmmData = () => {
      // 1. SERVICES
      const cachedServices = localStorage.getItem('dih_smm_services_v2');
      if (cachedServices) {
        try {
          const parsed = JSON.parse(cachedServices);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((s: any) => {
              const idVal = Number(s.id) || 0;
              const nameVal = (s.name || `Service #${idVal}`).toString();
              const catVal = (s.category || s.group || 'Others').toString();
              const priceVal = Number(s.price) || 0.0;
              const minVal = Number(s.min) || 100;
              const maxVal = Number(s.max) || 1000000;
              const descVal = (s.desc || '').toString();
              const timeVal = (s.time || 'Instant').toString();
              const qualityVal = (s.quality || 'Standard').toString();
              const refillVal = (s.refill || 'No Refill').toString();
              return {
                ...s,
                id: idVal,
                name: nameVal,
                category: catVal,
                price: priceVal,
                min: minVal,
                max: maxVal,
                desc: descVal,
                time: timeVal,
                quality: qualityVal,
                refill: refillVal
              };
            });
            setSmmServicesList(prev => JSON.stringify(prev) !== JSON.stringify(sanitized) ? sanitized : prev);
          } else {
            setSmmServicesList([]);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultSvcs: any[] = [];
        setSmmServicesList(defaultSvcs);
        localStorage.setItem('dih_smm_services_v2', JSON.stringify(defaultSvcs));
      }

      // 2. ORDERS
      const cachedOrders = localStorage.getItem('dih_smm_orders_v2');
      if (cachedOrders) {
        try {
          const parsed = JSON.parse(cachedOrders);
          setSmmOrders(prev => JSON.stringify(prev) !== cachedOrders ? parsed : prev);
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultOrders: any[] = [];
        setSmmOrders(defaultOrders);
        localStorage.setItem('dih_smm_orders_v2', JSON.stringify(defaultOrders));
      }

      // 3. USERS (SMM simulate + REAL Server Users)
      const cachedUsers = localStorage.getItem('dih_smm_users_v2');
      let currentActiveBalance = localStorage.getItem('dih_smm_balance');
      const parsedBalance = currentActiveBalance ? parseFloat(currentActiveBalance) : 0.00;
      
      const defaultUsers = [
        {id:999,name:"Active SMM User (My Account)",email: auth.currentUser?.email || "me@dihsmm.com",balance:parsedBalance,joined:"2026-06-01"}
      ];

      fetch('/api/admin/users')
        .then(res => res.json())
        .then(serverUsers => {
          if (Array.isArray(serverUsers)) {
            const mappedServerUsers = serverUsers.map((su: any) => {
              const localBalKey = `dih_smm_balance_${su.email}`;
              const cachedBal = localStorage.getItem(localBalKey);
              const balanceToUse = cachedBal ? parseFloat(cachedBal) : (su.balance || 0.00);
              return {
                id: su.id,
                name: su.name,
                email: su.email,
                balance: balanceToUse,
                joined: su.registeredAt ? su.registeredAt.split('T')[0] : '2026-06-18'
              };
            });

            const merged = [...mappedServerUsers];
            defaultUsers.forEach(du => {
              if (!merged.find(u => u.email === du.email)) {
                merged.push(du);
              }
            });

            // Ensure real balances get applied
            const final = merged.map((u: any) => {
              if (u.id === 999 || u.email === auth.currentUser?.email) {
                const myKey = `dih_smm_balance_${u.email}`;
                const realMyBal = parseFloat(localStorage.getItem(myKey) || localStorage.getItem('dih_smm_balance') || '0.00');
                return { ...u, balance: realMyBal, email: auth.currentUser?.email || u.email };
              }
              const specificKey = `dih_smm_balance_${u.email}`;
              const specBal = localStorage.getItem(specificKey);
              if (specBal) {
                return { ...u, balance: parseFloat(specBal) };
              }
              return u;
            });

            setSmmUsers(prev => JSON.stringify(prev) !== JSON.stringify(final) ? final : prev);
            localStorage.setItem('dih_smm_users_v2', JSON.stringify(final));
          } else {
            setSmmUsers(defaultUsers);
          }
        })
        .catch(() => {
          if (cachedUsers) {
            try {
              const parsedUsers = JSON.parse(cachedUsers);
              const updatedUsers = parsedUsers.map((u: any) => {
                if (u.id === 999) {
                  return { ...u, balance: parsedBalance, email: auth.currentUser?.email || u.email };
                }
                const specificKey = `dih_smm_balance_${u.email}`;
                const specBal = localStorage.getItem(specificKey);
                if (specBal) {
                  return { ...u, balance: parseFloat(specBal) };
                }
                return u;
              });
              setSmmUsers(prev => JSON.stringify(prev) !== JSON.stringify(updatedUsers) ? updatedUsers : prev);
            } catch (e) {
              setSmmUsers(defaultUsers);
            }
          } else {
            setSmmUsers(defaultUsers);
          }
        });

      // 4. DEPOSITS
      const cachedDeposits = localStorage.getItem('dih_smm_deposits_v2');
      if (cachedDeposits) {
        try {
          const parsed = JSON.parse(cachedDeposits);
          setSmmDeposits(prev => JSON.stringify(prev) !== cachedDeposits ? parsed : prev);
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultDeposits: any[] = [];
        setSmmDeposits(defaultDeposits);
        localStorage.setItem('dih_smm_deposits_v2', JSON.stringify(defaultDeposits));
      }

      // 5. PROVIDERS
      const cachedProviders = localStorage.getItem('dih_smm_providers_v2');
      if (cachedProviders) {
        try {
          const parsed = JSON.parse(cachedProviders);
          setSmmProviders(prev => JSON.stringify(prev) !== cachedProviders ? parsed : prev);
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultProviders = [
          { id: 1, name: 'TRENDWE', apiUrl: 'https://trendawe.com/api/v2', apiKey: 'be58cfbf6f7bef374660e39f00c8b113', status: 'active', balance: 0.00, serviceCount: 0 },
          { id: 2, name: 'SMMGEN', apiUrl: 'https://smmgen.com/api/v2', apiKey: 'f5846f314bba6ed87b2c025b2ef73790', status: 'active', balance: 0.00, serviceCount: 0 }
        ];
        setSmmProviders(defaultProviders);
        localStorage.setItem('dih_smm_providers_v2', JSON.stringify(defaultProviders));
      }

      // 6. MANUAL GATEWAYS
      const cachedGateways = localStorage.getItem('dih_smm_manual_gateways_v2');
      if (cachedGateways) {
        try {
          const parsed = JSON.parse(cachedGateways);
          setSmmManualGateways(prev => JSON.stringify(prev) !== cachedGateways ? parsed : prev);
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultGateways = [
          { id: 'bkash', title: 'bKash Wallet', numberOrAddress: '+8801700000000', type: 'Personal', instructions: 'Send money as standard Personal Transfer (Send Money), and then submit your Transaction ID (TxID).', enabled: true },
          { id: 'nagad', title: 'Nagad Wallet', numberOrAddress: '+8801900000000', type: 'Personal', instructions: 'Send money via Cash In or Send Money to our Nagad wallet, and put TxID above.', enabled: true },
          { id: 'upay', title: 'Upay Wallet', numberOrAddress: '+8801800005544', type: 'Personal', instructions: 'Transfer via Upay, submit the Reference or TxID.', enabled: true },
          { id: 'rocket', title: 'Rocket Mobile', numberOrAddress: '+8801500000000-1', type: 'Personal', instructions: 'Send money to Rocket wallet, enter target transaction details.', enabled: true },
          { id: 'card', title: 'Cards (Visa/Master)', numberOrAddress: 'support@dihsmm.com', type: 'Merchant Checkout Link', instructions: 'Submit request with the desired funding amount. Support will deliver a direct credit card payment checkout link.', enabled: true },
          { id: 'binance', title: 'Binance Pay ID', numberOrAddress: '44520912', type: 'Merchant Pay ID', instructions: 'Pay using your Binance App using Binance Pay ID. Provide Binance account nickname.', enabled: true },
          { id: 'usdt', title: 'USDT (TRC-20)', numberOrAddress: 'TYxTr54asT90pL1aWeXv2QpZs7eM89d1Cq', type: 'TRC-20 Address', instructions: 'Send the exact USDT amount via Tron Network. Paste TxHash / TxID once done.', enabled: true }
        ];
        setSmmManualGateways(defaultGateways);
        localStorage.setItem('dih_smm_manual_gateways_v2', JSON.stringify(defaultGateways));
      }
    };

    loadSmmData();
    const interval = setInterval(loadSmmData, 1500);
    return () => clearInterval(interval);
  }, [settings.smmDefaultBalance, auth.currentUser?.email]);

  const handleApproveSmmDeposit = (depId: number) => {
    let matchedEmail = '';
    let matchedAmount = 0;
    let userNameToUse = '';

    const updatedDeposits = smmDeposits.map(d => {
      if (d.id === depId && d.status === 'pending') {
        matchedEmail = d.userEmail || '';
        matchedAmount = d.amount;
        userNameToUse = d.userName || matchedEmail.split('@')[0];
        return { ...d, status: 'approved' };
      }
      return d;
    });

    if (matchedEmail && matchedAmount > 0) {
      // 1. Calculate new balance based on either exact user state or localStorage
      const existingUser = smmUsers.find(u => u.email && u.email.toLowerCase() === matchedEmail.toLowerCase());
      const specificKey = `dih_smm_balance_${matchedEmail}`;
      const currentBal = existingUser ? existingUser.balance : parseFloat(localStorage.getItem(specificKey) || '0.00');
      const newBal = currentBal + matchedAmount;

      // 2. Save new balance to local storage keys instantly to prevent race conditions
      localStorage.setItem(specificKey, newBal.toFixed(2));
      if (matchedEmail.toLowerCase() === (auth.currentUser?.email || '').toLowerCase()) {
        localStorage.setItem('dih_smm_balance', newBal.toFixed(2));
      }

      // 3. Update the smmUsers list state and localStorage
      let updatedUsers;
      if (existingUser) {
        updatedUsers = smmUsers.map(u => {
          if (u.email && u.email.toLowerCase() === matchedEmail.toLowerCase()) {
            return { ...u, balance: newBal };
          }
          return u;
        });
      } else {
        // Auto-create SMM user entry in state if we can't find them in the list
        const newSmmUserEntry = {
          id: "usr_" + Date.now(),
          name: userNameToUse,
          email: matchedEmail,
          balance: newBal,
          joined: new Date().toISOString().split('T')[0]
        };
        updatedUsers = [...smmUsers, newSmmUserEntry];
      }

      setSmmUsers(updatedUsers);
      localStorage.setItem('dih_smm_users_v2', JSON.stringify(updatedUsers));

      // 4. Update the backend server database synchronously
      fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: matchedEmail, balance: newBal, name: userNameToUse })
      })
      .then(res => res.json())
      .then(data => {
        // Double check local storage matches updated server value
        if (data && data.user) {
          const finalBal = parseFloat(data.user.balance) || newBal;
          localStorage.setItem(specificKey, finalBal.toFixed(2));
        }
      })
      .catch(err => console.error("Error updating SMM balance on server:", err));
    }

    setSmmDeposits(updatedDeposits);
    localStorage.setItem('dih_smm_deposits_v2', JSON.stringify(updatedDeposits));
  };

  const handleRejectSmmDeposit = (depId: number) => {
    const updatedDeposits = smmDeposits.map(d => {
      if (d.id === depId && d.status === 'pending') {
        return { ...d, status: 'rejected' };
      }
      return d;
    });
    setSmmDeposits(updatedDeposits);
    localStorage.setItem('dih_smm_deposits_v2', JSON.stringify(updatedDeposits));
  };

  const handleDeleteSmmService = (svcId: any) => {
    const nextList = smmServicesList.filter(s => s.id.toString() !== svcId.toString());
    localStorage.setItem('dih_smm_services_v2', JSON.stringify(nextList));
    setSmmServicesList(nextList);
  };

  const handleBulkDeleteServices = (svcIds: any[]) => {
    const idsAsStrings = svcIds.map(id => id.toString());
    const nextList = smmServicesList.filter(s => !idsAsStrings.includes(s.id.toString()));
    localStorage.setItem('dih_smm_services_v2', JSON.stringify(nextList));
    setSmmServicesList(nextList);
    setSelectedCatalogSvcIds([]);
  };

  const handleClearAllServices = () => {
    localStorage.setItem('dih_smm_services_v2', JSON.stringify([]));
    setSmmServicesList([]);
    setSelectedCatalogSvcIds([]);
  };

  const handleDeleteSmmOrder = (orderId: number) => {
    const nextList = smmOrders.filter(o => o.id !== orderId);
    setSmmOrders(nextList);
    localStorage.setItem('dih_smm_orders_v2', JSON.stringify(nextList));
  };

  const handleDeleteSmmUser = (userId: number) => {
    if (userId === 999) return;
    const nextList = smmUsers.filter(u => u.id !== userId);
    setSmmUsers(nextList);
    localStorage.setItem('dih_smm_users_v2', JSON.stringify(nextList));
  };

  const handleDeleteSmmDeposit = (depId: number) => {
    const nextList = smmDeposits.filter(d => d.id !== depId);
    setSmmDeposits(nextList);
    localStorage.setItem('dih_smm_deposits_v2', JSON.stringify(nextList));
  };

  const handleSaveSmmService = () => {
    if (!smmFormName.trim()) return;

    let updatedList = [];
    if (smmModalType === 'add-service') {
      const newSvc = {
        id: smmServicesList.length ? Math.max(...smmServicesList.map(s => Number(s.id) || 0)) + 1 : 1,
        name: smmFormName,
        category: smmFormCategory,
        quality: smmFormQuality,
        price: parseFloat(smmFormPrice) || 0.0,
        min: parseInt(smmFormMin) || 100,
        max: parseInt(smmFormMax) || 1000000,
        desc: smmFormDesc,
        time: smmFormTime,
        refill: smmFormRefill,
        providerId: smmFormSvcProviderId,
        providerServiceId: smmFormSvcProviderServiceId
      };
      updatedList = [...smmServicesList, newSvc];
    } else if (smmModalType === 'edit-service' && selectedSmmItem) {
      updatedList = smmServicesList.map(s => {
        if (s.id.toString() === selectedSmmItem.id.toString()) {
          return {
            ...s,
            name: smmFormName,
            category: smmFormCategory,
            quality: smmFormQuality,
            price: parseFloat(smmFormPrice) || 0.0,
            min: parseInt(smmFormMin) || 100,
            max: parseInt(smmFormMax) || 1000000,
            desc: smmFormDesc,
            time: smmFormTime,
            refill: smmFormRefill,
            providerId: smmFormSvcProviderId,
            providerServiceId: smmFormSvcProviderServiceId
          };
        }
        return s;
      });
    } else {
      updatedList = smmServicesList;
    }

    localStorage.setItem('dih_smm_services_v2', JSON.stringify(updatedList));
    setSmmServicesList(updatedList);
    setIsSmmModalOpen(false);
  };

  const handleSaveSmmProvider = async () => {
    if (!smmFormProvName.trim() || !smmFormProvUrl.trim()) return;
    
    let resolvedBalance = 0.00;
    const isRealApi = smmFormProvUrl && smmFormProvUrl.trim() !== "" && !smmFormProvUrl.toLowerCase().includes("example.com") && smmFormProvKey && smmFormProvKey.trim() !== "";
    
    if (isRealApi) {
      setSmmToast({ message: "Verifying credentials... Fetching live account funds balance from SMM Panel...", type: 'info' });
      try {
        const response = await fetch('/api/admin/smm/fetch-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: smmFormProvUrl, key: smmFormProvKey })
        });
        if (response.ok) {
          const resData = await response.json();
          resolvedBalance = parseFloat(resData.balance) || 0.00;
          setSmmToast({ message: `Success! Connection verified. Live Balance retrieved: $${resolvedBalance.toFixed(4)}`, type: 'success' });
        } else {
          setSmmToast({ message: `API Connection warning: Key authentication failed. Setting balance to $0.00 fallback.`, type: 'error' });
        }
      } catch (err) {
        console.error("Live balance fetch error:", err);
        setSmmToast({ message: `API Connection offline. Loaded default fallback balance.`, type: 'error' });
        resolvedBalance = 500.00; // fallback mock balance
      }
    } else {
      resolvedBalance = 500.00; // default for mock provider
    }

    let updated = [];
    if (smmModalType === 'add-provider') {
      const newProv = {
        id: smmProviders.length ? Math.max(...smmProviders.map(p => p.id)) + 1 : 1,
        name: smmFormProvName,
        apiUrl: smmFormProvUrl,
        apiKey: smmFormProvKey,
        status: smmFormProvStatus,
        balance: resolvedBalance,
        serviceCount: 0
      };
      updated = [...smmProviders, newProv];
    } else if (smmModalType === 'edit-provider' && selectedSmmItem) {
      updated = smmProviders.map(p => {
        if (p.id === selectedSmmItem.id) {
          return {
            ...p,
            name: smmFormProvName,
            apiUrl: smmFormProvUrl,
            apiKey: smmFormProvKey,
            status: smmFormProvStatus,
            balance: isRealApi ? resolvedBalance : p.balance
          };
        }
        return p;
      });
    }
    setSmmProviders(updated);
    localStorage.setItem('dih_smm_providers_v2', JSON.stringify(updated));
    setIsSmmModalOpen(false);
  };

  const handleDeleteSmmProvider = (id: number) => {
    const updated = smmProviders.filter(p => p.id !== id);
    setSmmProviders(updated);
    localStorage.setItem('dih_smm_providers_v2', JSON.stringify(updated));
  };

  // SMM PROVIDER REAL INTEGRATION ENGINE MOCK DATA & FUNCTIONS
  const MOCK_API_SERVICES = [
    // Instagram
    { id: 101, name: "Instagram Followers - Organic [Real Active Accounts]", category: "Instagram", originalPrice: 0.38, min: 100, max: 100000, desc: "Ultra stable organic-looking active followers. Non drop.", time: "1-6 hours", quality: "Premium" },
    { id: 102, name: "Instagram Followers - Fast [Direct Server]", category: "Instagram", originalPrice: 0.18, min: 100, max: 200000, desc: "Fast instant delivery followers.", time: "0-30 minutes", quality: "Standard" },
    { id: 103, name: "Instagram Likes - Non Drop [30 Days Refill Button]", category: "Instagram", originalPrice: 0.05, min: 50, max: 500000, desc: "Organic-paced secure likes.", time: "0-1 hours", quality: "Standard" },
    { id: 104, name: "Instagram Likes - Cheapest [Instant Spark]", category: "Instagram", originalPrice: 0.025, min: 50, max: 1000000, desc: "Cheapest fast instant likes worldwide.", time: "0-15 minutes", quality: "Standard" },
    { id: 105, name: "Instagram Story Views - Organic", category: "Instagram", originalPrice: 0.02, min: 100, max: 5000000, desc: "Story views update instantly.", time: "5-15 minutes", quality: "Standard" },
    { id: 106, name: "Instagram Custom Comments - Real Profiles", category: "Instagram", originalPrice: 1.80, min: 5, max: 1000, desc: "Verified comments or custom text inputs.", time: "1-3 hours", quality: "Premium" },
    
    // Facebook
    { id: 110, name: "Facebook Page Likes + Followers [Lifetime Stable]", category: "Facebook", originalPrice: 0.65, min: 100, max: 500000, desc: "Stable profile or page likes, permanent warranty.", time: "0-24 hours", quality: "Standard" },
    { id: 111, name: "Facebook Post Likes - Instant Liquid Speed", category: "Facebook", originalPrice: 0.18, min: 50, max: 200000, desc: "Quick reaction boosts on posts, photos and text.", time: "0-6 hours", quality: "Standard" },
    { id: 112, name: "Facebook Live Stream Viewers - 60 Minutes", category: "Facebook", originalPrice: 1.25, min: 10, max: 10000, desc: "Stable viewers for your live stream.", time: "Instant", quality: "Premium" },
    { id: 113, name: "Facebook Video Views - Organic Monetization Ready", category: "Facebook", originalPrice: 0.08, min: 1000, max: 10000000, desc: "Monetization compliant video watch views.", time: "0-4 hours", quality: "Premium" },

    // YouTube
    { id: 120, name: "YouTube Views - High Retention [Organic Ads Traffic]", category: "YouTube", originalPrice: 0.95, min: 500, max: 10000000, desc: "High retention video views backed by Google Ads pattern.", time: "0-24 hours", quality: "Premium" },
    { id: 121, name: "YouTube Subscribers - Permanent [30D Refill]", category: "YouTube", originalPrice: 3.50, min: 50, max: 50000, desc: "Guaranteed subscribers with real profile signals.", time: "1-3 days", quality: "Premium" },
    { id: 122, name: "YouTube Watch Hours - Monetization Target 4K", category: "YouTube", originalPrice: 9.80, min: 100, max: 10000, desc: "Real watch hours to unlock partner program.", time: "7-30 days", quality: "VIP" },
    { id: 123, name: "YouTube Likes - High Engaged", category: "YouTube", originalPrice: 0.40, min: 50, max: 100000, desc: "High rating organic video likes.", time: "0-12 hours", quality: "Standard" },

    // TikTok
    { id: 130, name: "TikTok Followers - Real Looking [Stable Slow Feed]", category: "TikTok", originalPrice: 0.85, min: 100, max: 500000, desc: "Steady account growth with real-looking users.", time: "0-12 hours", quality: "Standard" },
    { id: 131, name: "TikTok Followers - Ultra Fast Instant Delivery", category: "TikTok", originalPrice: 0.45, min: 100, max: 1000000, desc: "Instant visual followers count boost.", time: "0-1 hours", quality: "Standard" },
    { id: 132, name: "TikTok Likes - Real Active Users", category: "TikTok", originalPrice: 0.18, min: 100, max: 1000000, desc: "High quality authentic video likes.", time: "0-2 hours", quality: "Standard" },
    { id: 133, name: "TikTok Views - Super Traffic Viral Speed", category: "TikTok", originalPrice: 0.015, min: 1000, max: 100000000, desc: "Fastest viral view server stream.", time: "0-10 minutes", quality: "Standard" },

    // Twitter/X
    { id: 140, name: "Twitter/X Followers - Premium Verified Accounts", category: "Twitter/X", originalPrice: 1.80, min: 100, max: 500000, desc: "High quality accounts with active timeline.", time: "0-24 hours", quality: "Premium" },
    { id: 141, name: "Twitter/X Likes - Fast Delivery", category: "Twitter/X", originalPrice: 0.35, min: 50, max: 100000, desc: "Fast post likes.", time: "0-4 hours", quality: "Standard" },
    { id: 142, name: "Twitter/X Retweets - Premium Shares", category: "Twitter/X", originalPrice: 0.75, min: 50, max: 100000, desc: "Increases virality organic reach.", time: "0-6 hours", quality: "Standard" },

    // Telegram
    { id: 150, name: "Telegram Channel Members - Stable No Drop", category: "Telegram", originalPrice: 1.15, min: 100, max: 1000000, desc: "Extremely stable high-quality members.", time: "0-24 hours", quality: "Standard" },
    { id: 151, name: "Telegram Group Members - Real Profiles", category: "Telegram", originalPrice: 1.45, min: 100, max: 500000, desc: "Group members with distinct name tags.", time: "0-24 hours", quality: "Premium" },
    { id: 152, name: "Telegram Post Views - Multi Post Auto Feed", category: "Telegram", originalPrice: 0.05, min: 100, max: 10000000, desc: "Views across last 5 posts instantly.", time: "0-15 minutes", quality: "Standard" },

    // Spotify
    { id: 160, name: "Spotify Track Plays - Unique Listeners", category: "Spotify", originalPrice: 0.65, min: 1000, max: 10000000, desc: "Compliant track streams for artists.", time: "2-24 hours", quality: "Standard" },
    { id: 161, name: "Spotify Artist/User Profile Followers", category: "Spotify", originalPrice: 0.95, min: 100, max: 500000, desc: "Stable active profile followers.", time: "0-12 hours", quality: "Premium" },
    { id: 162, name: "Spotify Playlist Saves / Followers", category: "Spotify", originalPrice: 0.40, min: 50, max: 100000, desc: "Saves with playlist optimization.", time: "1-6 hours", quality: "Standard" },

    // LinkedIn
    { id: 170, name: "LinkedIn Personal Profile Followers", category: "LinkedIn", originalPrice: 4.80, min: 100, max: 50000, desc: "HQ enterprise professionals.", time: "1-3 days", quality: "Premium" },
    { id: 171, name: "LinkedIn Company Page Followers", category: "LinkedIn", originalPrice: 6.20, min: 100, max: 50000, desc: "Page subscribers from valid corporates.", time: "1-3 days", quality: "Premium" },
    { id: 172, name: "LinkedIn Post Likes & Reactions", category: "LinkedIn", originalPrice: 3.50, min: 25, max: 10000, desc: "Reactions (Thumbs, Insightful, Support).", time: "2-12 hours", quality: "Standard" },

    // Discord
    { id: 180, name: "Discord Server Members - Offline Cheap", category: "Discord", originalPrice: 1.10, min: 100, max: 20000, desc: "Instant offline token invites.", time: "0-12 hours", quality: "Standard" },
    { id: 181, name: "Discord Server Members - Real Looking Online", category: "Discord", originalPrice: 2.90, min: 100, max: 10000, desc: "Online accounts that stay in server.", time: "1-6 hours", quality: "Premium" },

    // Website Traffic
    { id: 190, name: "Website Traffic - Worldwide Cheap [Organic Direct]", category: "Website Traffic", originalPrice: 0.08, min: 1000, max: 10000000, desc: "Cheap direct organic clicks.", time: "Instant", quality: "Standard" },
    { id: 191, name: "Website Traffic - USA Geotargeted Organic", category: "Website Traffic", originalPrice: 0.35, min: 1000, max: 5000000, desc: "100% US IP organic views.", time: "0-24 hours", quality: "Premium" },
    { id: 192, name: "Website Traffic - Google Organic Search Ref", category: "Website Traffic", originalPrice: 0.45, min: 1000, max: 1000000, desc: "Custom search organic hits with high session durations.", time: "2-12 hours", quality: "Premium" },

    // Others
    { id: 201, name: "YouTube Comments Like / Reply Threads", category: "Others", originalPrice: 1.12, min: 10, max: 5000, desc: "Real written comments thread.", time: "0-6 hours", quality: "Premium" },
    { id: 202, name: "Google One 2TB + Gemini Pro Global (1 Month Trial)", category: "Others", originalPrice: 0.45, min: 1, max: 100, desc: "Active invite accounts.", time: "0-6 hours", quality: "VIP" },
    { id: 203, name: "Shopee Video/Live Stream Followers & Views", category: "Others", originalPrice: 0.25, min: 500, max: 500500, desc: "Ecommerce traffic boost.", time: "0-1 hours", quality: "Standard" }
  ];

  const matchesFuzzyCategory = (svcCategory: string, filterCat: string) => {
    if (filterCat === 'All') return true;
    
    const filterLower = filterCat.toLowerCase();
    const svcLower = svcCategory.toLowerCase();
    
    if (filterLower === 'instagram') {
      return svcLower.includes('instagram') || svcLower.includes('ig');
    }
    if (filterLower === 'facebook') {
      return svcLower.includes('facebook') || svcLower.includes('fb');
    }
    if (filterLower === 'youtube') {
      return svcLower.includes('youtube') || svcLower.includes('yt');
    }
    if (filterLower === 'tiktok') {
      return svcLower.includes('tiktok') || svcLower.includes('tt');
    }
    if (filterLower === 'telegram') {
      return svcLower.includes('telegram') || svcLower.includes('tg');
    }
    if (filterLower === 'twitter' || filterLower === 'twitter/x') {
      return svcLower.includes('twitter') || svcLower.includes('x ');
    }
    if (filterLower === 'linkedin') {
      return svcLower.includes('linkedin');
    }
    if (filterLower === 'spotify') {
      return svcLower.includes('spotify');
    }
    if (filterLower === 'discord') {
      return svcLower.includes('discord');
    }
    if (filterLower === 'website traffic') {
      return svcLower.includes('website') || svcLower.includes('traffic') || svcLower.includes('web');
    }
    if (filterLower === 'others') {
      const isKnown = ['instagram', 'ig', 'facebook', 'fb', 'youtube', 'yt', 'tiktok', 'tt', 'telegram', 'tg', 'twitter', 'x ', 'linkedin', 'spotify', 'discord', 'website', 'traffic', 'web'].some(k => svcLower.includes(k));
      return !isKnown;
    }
    return svcLower === filterLower;
  };

  const startImportWizard = async (prov: any) => {
    setActiveImportProvider(prov);
    setImportStep('connecting');
    setIsImportLoading(true);
    setSelectedApiSvcIds([]);
    setApiSearchQuery('');
    setApiCatFilter('All');

    const hasRealApi = prov.apiUrl && prov.apiUrl.trim() !== "" && !prov.apiUrl.toLowerCase().includes("example.com") && prov.apiKey && prov.apiKey.trim() !== "";
    
    if (hasRealApi) {
      setSmmToast({ message: `Connecting API: Fetching live services from SMM Panel URL...`, type: 'info' });
      try {
        const response = await fetch('/api/admin/smm/fetch-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: prov.apiUrl, key: prov.apiKey })
        });
        
        if (response.ok) {
          const liveServices = await response.json();
          if (Array.isArray(liveServices) && liveServices.length > 0) {
            setApiServices(liveServices);
            setImportStep('ready');
            setIsImportLoading(false);
            setSmmToast({ message: `Live services fetched! Found ${liveServices.length} packages from SMM Panel.`, type: 'success' });
            return;
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          setSmmToast({ message: `Panel Connected, but: ${errData.error || "failed listing packages"}. Loading standard fallback database.`, type: 'error' });
        }
      } catch (err: any) {
        console.error("Live fetch error:", err);
        setSmmToast({ message: `API Connection warning: Loading standard database fallback.`, type: 'error' });
      }
    }

    // fallback
    setTimeout(() => {
      setImportStep('loading');
      setTimeout(() => {
        const priceScale = prov.id === 2 ? 0.92 : 1.0;
        const loadedServices = MOCK_API_SERVICES.map(s => ({
          ...s,
          originalPrice: parseFloat((s.originalPrice * priceScale).toFixed(4)),
          id: s.id + (prov.id * 1000)
        }));
        setApiServices(loadedServices);
        setImportStep('ready');
        setIsImportLoading(false);
      }, 800);
    }, 600);
  };

  const handleSyncSmmProviderRates = async (prov: any) => {
    setSmmToast({ message: `Connecting API: Querying wholesale rates from ${prov.name}...`, type: 'info' });
    
    const hasRealApi = prov.apiUrl && prov.apiUrl.trim() !== "" && !prov.apiUrl.toLowerCase().includes("example.com") && prov.apiKey && prov.apiKey.trim() !== "";
    let fetchedServicesList: any[] = [];
    
    if (hasRealApi) {
      try {
        const response = await fetch('/api/admin/smm/fetch-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: prov.apiUrl, key: prov.apiKey })
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            fetchedServicesList = data;
          }
        }
      } catch (err) {
        console.error("Live sync retrieval failed, using fallback.", err);
      }
    }

    setTimeout(() => {
      let syncCount = 0;
      const priceScale = prov.id === 2 ? 0.92 : 1.0;
      const markupVal = parseFloat(importMarkup) || 1.5;
      
      const updatedList = smmServicesList.map(s => {
        if (s.providerId && s.providerId.toString() === prov.id.toString()) {
          const apiSvcId = s.providerServiceId ? s.providerServiceId.toString() : '';
          
          let matchedApiSvc = fetchedServicesList.find(apiSvc => apiSvc.id.toString() === apiSvcId);
          
          if (matchedApiSvc) {
            s.price = parseFloat((matchedApiSvc.originalPrice * markupVal).toFixed(4));
            s.min = matchedApiSvc.min;
            s.max = matchedApiSvc.max;
            syncCount++;
          } else {
            const numericId = parseInt(apiSvcId);
            const baseMock = MOCK_API_SERVICES.find(m => (m.id + (prov.id * 1000)) === numericId || m.id === numericId);
            if (baseMock) {
              s.price = parseFloat((baseMock.originalPrice * priceScale * markupVal).toFixed(4));
              s.min = baseMock.min;
              s.max = baseMock.max;
              syncCount++;
            }
          }
        }
        return s;
      });

      if (syncCount > 0) {
        setSmmServicesList(updatedList);
        localStorage.setItem('dih_smm_services_v2', JSON.stringify(updatedList));
        
        const updatedProvs = smmProviders.map(p => {
          if (p.id === prov.id) {
            return { ...p, balance: Math.max(0, (p.balance || 500) - 0.15) };
          }
          return p;
        });
        setSmmProviders(updatedProvs);
        localStorage.setItem('dih_smm_providers_v2', JSON.stringify(updatedProvs));

        setSmmToast({ message: `Rates synced completely! Re-calculated prices using ${Math.round(markupVal * 100)}% markup for ${syncCount} active SMM services.`, type: 'success' });
      } else {
        setSmmToast({ message: `Connection established. No linked services currently configured for ${prov.name}. Import some services first!`, type: 'info' });
      }
    }, 1200);
  };

  const handleSyncSmmProviderBalance = async (prov: any) => {
    setSmmToast({ message: `Querying live balance for ${prov.name}...`, type: 'info' });
    
    const hasRealApi = prov.apiUrl && prov.apiUrl.trim() !== "" && !prov.apiUrl.toLowerCase().includes("example.com") && prov.apiKey && prov.apiKey.trim() !== "";
    
    if (hasRealApi) {
      try {
        const response = await fetch('/api/admin/smm/fetch-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: prov.apiUrl, key: prov.apiKey })
        });
        
        if (response.ok) {
          const data = await response.json();
          const liveBal = parseFloat(data.balance) || 0.00;
          
          const updatedProvs = smmProviders.map(p => {
            if (p.id === prov.id) {
              return { ...p, balance: liveBal };
            }
            return p;
          });
          
          setSmmProviders(updatedProvs);
          localStorage.setItem('dih_smm_providers_v2', JSON.stringify(updatedProvs));
          
          setSmmToast({ message: `Live SMM account balance synced! Current Funds: $${liveBal.toFixed(4)}`, type: 'success' });
          return;
        } else {
          const errData = await response.json().catch(() => ({}));
          setSmmToast({ message: `Authentication check failed: ${errData.error || "failed fetching balance"}`, type: 'error' });
        }
      } catch (err: any) {
        setSmmToast({ message: `Connection offline: ${err.message}`, type: 'error' });
      }
    } else {
      // Mock sync for offline default panels
      setTimeout(() => {
        const liveBal = 500.00 - (Math.random() * 45);
        const updatedProvs = smmProviders.map(p => {
          if (p.id === prov.id) {
            return { ...p, balance: liveBal };
          }
          return p;
        });
        setSmmProviders(updatedProvs);
        localStorage.setItem('dih_smm_providers_v2', JSON.stringify(updatedProvs));
        setSmmToast({ message: `Mock provider funds balance refreshed: $${liveBal.toFixed(4)}`, type: 'success' });
      }, 850);
    }
  };

  const handleImportSelectedApiServices = () => {
    if (!activeImportProvider || selectedApiSvcIds.length === 0) return;
    
    setImportStep('importing');
    
    setTimeout(() => {
      let maxId = smmServicesList.length ? Math.max(...smmServicesList.map(s => s.id)) : 0;
      const markupMultiplier = parseFloat(importMarkup) || 1.5;
      
      const newImportedServices = apiServices
        .filter(s => selectedApiSvcIds.includes(s.id))
        .map(apiSvc => {
          maxId++;
          const calculatedPrice = parseFloat((apiSvc.originalPrice * markupMultiplier).toFixed(4));
          return {
            id: maxId,
            name: apiSvc.name,
            category: apiSvc.category,
            price: calculatedPrice,
            min: apiSvc.min,
            max: apiSvc.max,
            desc: apiSvc.desc || "Imported automatic service.",
            time: apiSvc.time || "0-24 hours",
            quality: apiSvc.quality || "Standard",
            refill: apiSvc.refill || "No Refill",
            providerId: activeImportProvider.id.toString(),
            providerServiceId: apiSvc.id.toString()
          };
        });
        
      const mergedList = [...smmServicesList];
      let newlyAdded = 0;
      newImportedServices.forEach(neu => {
        const existingIndex = mergedList.findIndex(s => s.providerId === neu.providerId && s.providerServiceId === neu.providerServiceId);
        if (existingIndex !== -1) {
          mergedList[existingIndex] = {
            ...mergedList[existingIndex],
            price: neu.price,
            min: neu.min,
            max: neu.max,
            name: neu.name,
            refill: neu.refill
          };
        } else {
          mergedList.push(neu);
          newlyAdded++;
        }
      });
      
      const updatedProviders = smmProviders.map(p => {
        if (p.id === activeImportProvider.id) {
          const count = mergedList.filter(s => s.providerId === p.id.toString()).length;
          return { ...p, serviceCount: count };
        }
        return p;
      });
      
      setSmmProviders(updatedProviders);
      localStorage.setItem('dih_smm_providers_v2', JSON.stringify(updatedProviders));
      
      setSmmServicesList(mergedList);
      localStorage.setItem('dih_smm_services_v2', JSON.stringify(mergedList));
      
      setImportStep('completed');
      setSmmToast({ 
        message: `Import Completed! ${selectedApiSvcIds.length} services connected to ${activeImportProvider.name} with ${Math.round((markupMultiplier - 1.0) * 100)}% profit margin applied.`, 
        type: 'success' 
      });
      
      setTimeout(() => {
        setActiveImportProvider(null);
      }, 800);
    }, 1500);
  };

  const handleSaveSmmGateway = () => {
    if (!smmFormGatewayTitle.trim() || !selectedSmmItem) return;
    const updated = smmManualGateways.map(g => {
      if (g.id === selectedSmmItem.id) {
        return {
          ...g,
          title: smmFormGatewayTitle,
          numberOrAddress: smmFormGatewayNumber,
          type: smmFormGatewayType,
          instructions: smmFormGatewayInstructions,
          enabled: smmFormGatewayEnabled
        };
      }
      return g;
    });
    setSmmManualGateways(updated);
    localStorage.setItem('dih_smm_manual_gateways_v2', JSON.stringify(updated));
    setIsSmmModalOpen(false);
  };

  const handleSaveSmmOrder = () => {
    if (!selectedSmmItem) return;
    const updated = smmOrders.map(o => {
      if (o.id === selectedSmmItem.id) {
        return {
          ...o,
          serviceName: smmFormName,
          status: smmFormStatus,
          link: smmFormLink,
          quantity: parseInt(smmFormQty) || o.quantity,
          amount: parseFloat(smmFormAmount) || o.amount,
          apiOrderId: smmFormApiOrderId,
          apiProviderId: smmFormApiProviderId
        };
      }
      return o;
    });
    setSmmOrders(updated);
    localStorage.setItem('dih_smm_orders_v2', JSON.stringify(updated));
    setIsSmmModalOpen(false);
  };

  const handlePlaceOrderToProvider = async () => {
    if (!selectedSmmItem) return;
    const orderSvc = smmServicesList.find(s => s.id === selectedSmmItem?.serviceId || s.name === selectedSmmItem?.serviceName);
    const provId = orderSvc?.providerId || smmFormApiProviderId;
    if (!provId || provId === 'manual') {
      setSmmToast({ message: "No active SMM API provider linked to this catalog package.", type: 'error' });
      return;
    }
    const prov = smmProviders.find(p => p.id?.toString() === provId?.toString());
    if (!prov) {
      setSmmToast({ message: "Linked SMM provider details not found in active configurations.", type: 'error' });
      return;
    }
    const targetSvcId = orderSvc?.providerServiceId;
    if (!targetSvcId) {
      setSmmToast({ message: "SMM Provider Service ID is missing in catalog metadata.", type: 'error' });
      return;
    }

    setIsApiPlacingOrder(true);
    try {
      const response = await fetch('/api/admin/smm/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: prov.url,
          key: prov.key,
          service: targetSvcId,
          link: smmFormLink,
          quantity: parseInt(smmFormQty) || 100
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server error when placing SMM order');
      }

      const pOrderId = resData.order || resData.order_id || resData.orderId;
      if (pOrderId) {
        setSmmFormApiOrderId(pOrderId.toString());
        setSmmFormApiProviderId(provId.toString());
        setSmmFormStatus('processing');
        setSmmToast({ 
          message: `Successfully placed order on provider panel! Provider SMM Order ID: ${pOrderId}`, 
          type: 'success' 
        });
      } else {
        setSmmToast({ 
          message: `Order submitted but no Order ID returned. Response: ${JSON.stringify(resData)}`, 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setSmmToast({ message: `API Submission failed: ${err.message}`, type: 'error' });
    } finally {
      setIsApiPlacingOrder(false);
    }
  };

  const handleCheckProviderStatus = async () => {
    if (!smmFormApiOrderId) {
      setSmmToast({ message: "No API Order ID is actively configured for this order.", type: 'error' });
      return;
    }
    const provId = smmFormApiProviderId || (smmServicesList.find(s => s.id === selectedSmmItem?.serviceId || s.name === selectedSmmItem?.serviceName)?.providerId);
    if (!provId || provId === 'manual') {
      setSmmToast({ message: "No active SMM provider API linked to this order.", type: 'error' });
      return;
    }
    const prov = smmProviders.find(p => p.id?.toString() === provId?.toString());
    if (!prov) {
      setSmmToast({ message: "SMM provider credentials were not found in settings.", type: 'error' });
      return;
    }

    setIsApiPlacingOrder(true);
    try {
      const response = await fetch('/api/admin/smm/order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: prov.url,
          key: prov.key,
          orderId: smmFormApiOrderId
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server error when retrieving order status');
      }

      const provStatus = String(resData.status || '').toLowerCase().trim();
      let nextStatus = 'processing';
      if (provStatus.includes('complete')) nextStatus = 'completed';
      else if (provStatus.includes('fail') || provStatus.includes('cancel')) nextStatus = 'cancelled';
      else if (provStatus.includes('pend')) nextStatus = 'pending';
      else if (provStatus.includes('part')) nextStatus = 'partial';

      setSmmFormStatus(nextStatus);
      setSmmToast({
        message: `Status Sync Successful! Provider Status: ${resData.status || 'Active'}. Start count: ${resData.start_count || 0}. Remains: ${resData.remains || 0}.`,
        type: 'success'
      });
    } catch (err: any) {
      setSmmToast({ message: `Status fetch failed: ${err.message}`, type: 'error' });
    } finally {
      setIsApiPlacingOrder(false);
    }
  };

  const handleSaveSmmUser = () => {
    if (!selectedSmmItem) return;
    const targetEmail = smmFormUserEmail || selectedSmmItem.email;
    const newBal = parseFloat(smmFormUserBalance) || 0.00;

    const updated = smmUsers.map(u => {
      const isMatch = u.id === selectedSmmItem.id || (targetEmail && u.email && u.email.toLowerCase() === targetEmail.toLowerCase());
      if (isMatch) {
        // Set local storage balance key so they see it instantly in SMM Panel
        localStorage.setItem(`dih_smm_balance_${targetEmail}`, newBal.toFixed(2));
        if (u.id === 999 || targetEmail === auth.currentUser?.email) {
          localStorage.setItem('dih_smm_balance', newBal.toFixed(2));
        }

        return {
          ...u,
          name: smmFormUserName,
          email: smmFormUserEmail,
          balance: newBal
        };
      }
      return u;
    });

    setSmmUsers(updated);
    localStorage.setItem('dih_smm_users_v2', JSON.stringify(updated));

    // Sync to user database on server
    if (targetEmail) {
      fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, balance: newBal })
      })
      .then(() => {
        // Double check local key is updated
        localStorage.setItem(`dih_smm_balance_${targetEmail}`, newBal.toFixed(2));
      })
      .catch(err => console.error("Error updating user SMM balance on backend:", err));
    }

    setIsSmmModalOpen(false);
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/rb/${id}`;
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
            { id: 'tools', icon: Activity, label: 'Manage Tools' },
            { id: 'hosted-templates', icon: Globe, label: 'DIH TEMPLATE' },
            { id: 'store', icon: Download, label: 'Resource Store' },
            
            { type: 'separator', label: 'User Management' },
            { id: 'users', icon: Users, label: 'User Database' },

            { type: 'separator', label: 'App Configuration' },
            { id: 'appearance', icon: Palette, label: 'Branding & UI' },
            { id: 'general', icon: Settings, label: 'General Configuration' },
            { id: 'dashboard-traffic', icon: Activity, label: 'Traffic Analysis' },

            { type: 'separator', label: 'Module Settings' },
            { id: 'config-video', icon: Download, label: 'Video Downloader' },
            { id: 'config-movies', icon: Film, label: 'Dih Movie Pro' },
            { id: 'config-bachelor-point', icon: Film, label: 'Bachelor Point' },
            { id: 'config-smm', icon: Flame, label: 'DIH SMM PRO' },
            { id: 'config-ai', icon: Star, label: 'Advanced Engine Tools' },
            { id: 'config-ads', icon: MessageSquare, label: 'Ads Management' },
            
            { type: 'separator', label: 'Maintenance System' },
            { id: 'config-maintenance', icon: ShieldAlert, label: 'Firebase Maintenance' },
            
            { type: 'separator', label: 'Master Integrations' },
            { id: 'api-keys', icon: Key, label: 'Master API Keys' },
            { id: 'api-systems', icon: Cpu, label: 'System Proxies' },
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
                                {typeof window !== 'undefined' ? window.location.host : 'dihhub.site'}/rb/{t.id}
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
                           <a href={`/rb/${t.id}`} target="_blank" className="w-9 h-9 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-slate-500 hover:text-blue-500 transition-all group/btn" title="Launch Site">
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
                                 {typeof window !== 'undefined' ? window.location.host : 'dihhub.site'}/rb/{successSlug}
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
                                href={`/rb/${successSlug}`} 
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
                                          <span className="text-[8px] font-mono text-blue-500">{typeof window !== 'undefined' ? window.location.host : 'dihhub.site'}/rb/{htmlFormData.id || '...'}</span>
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
                  { id: 'dih-smm', label: 'DIH SMM (Social Media)', icon: Flame },
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
                  
                  {/* Website Logo Section */}
                  <div className="space-y-1.5 md:col-span-2 border-t border-slate-800/50 pt-4">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Website Logo (Header Logo)</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {settings.appLogoUrl ? (
                          <img src={settings.appLogoUrl} className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png' }} />
                        ) : (
                          <div className="text-[8px] text-center text-slate-500 uppercase tracking-widest font-black leading-none">
                            Default Monogram
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={settings.appLogoUrl || ''}
                            onChange={e => updateSettings({ appLogoUrl: e.target.value })}
                            placeholder="Enter image URL or select a file to upload"
                            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                          />
                          <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors self-center shrink-0">
                            <Upload size={12} />
                            Upload Logo
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append('image', file);
                                try {
                                  const res = await fetch('/api/admin/upload-image', {
                                    method: 'POST',
                                    body: formData
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    if (data.url) {
                                      updateSettings({ appLogoUrl: data.url });
                                    }
                                  } else {
                                    alert('Failed to upload logo image');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Upload error');
                                }
                              }} 
                            />
                          </label>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                          <button 
                            type="button" 
                            onClick={() => updateSettings({ appLogoUrl: '' })}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300"
                          >
                            Reset to Monogram (SVG)
                          </button>
                          <span className="text-slate-700 text-xs">•</span>
                          <button 
                            type="button" 
                            onClick={() => updateSettings({ appLogoUrl: '/logo.png' })}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                          >
                            Set '/logo.png'
                          </button>
                          <span className="text-slate-700 text-xs">•</span>
                          <button 
                            type="button" 
                            onClick={() => updateSettings({ appLogoUrl: '/favicon-dih.png' })}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                          >
                            Set '/favicon-dih.png'
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Browser Tab Icon (Favicon) Section */}
                  <div className="space-y-1.5 md:col-span-2 border-t border-slate-800/50 pt-4">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Browser Tab Icon (Favicon URL)</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {settings.faviconUrl ? (
                          <img src={settings.faviconUrl} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/favicon-dih.png' }} />
                        ) : (
                          <span className="text-xs text-slate-600 font-bold">No Icon</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={settings.faviconUrl || ''}
                            onChange={e => updateSettings({ faviconUrl: e.target.value })}
                            placeholder="/favicon-dih.png"
                            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                          />
                          <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors self-center shrink-0">
                            <Upload size={12} />
                            Upload Icon
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append('image', file);
                                try {
                                  const res = await fetch('/api/admin/upload-image', {
                                    method: 'POST',
                                    body: formData
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    if (data.url) {
                                      updateSettings({ faviconUrl: data.url });
                                    }
                                  } else {
                                    alert('Failed to upload favicon icon');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Upload error');
                                }
                              }} 
                            />
                          </label>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                          <button 
                            type="button" 
                            onClick={() => updateSettings({ faviconUrl: '/favicon-dih.png' })}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                          >
                            Set DIH Logo
                          </button>
                          <span className="text-slate-700 text-xs">•</span>
                          <button 
                            type="button" 
                            onClick={() => updateSettings({ faviconUrl: '/logo.png' })}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                          >
                            Set Alt Logo
                          </button>
                          <span className="text-slate-700 text-xs">•</span>
                          <button 
                            type="button" 
                            onClick={() => updateSettings({ faviconUrl: '/favicon.png' })}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                          >
                            Set Default Icon
                          </button>
                        </div>
                      </div>
                    </div>
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

                     <button onClick={() => setActiveTab('config-smm')} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                              <Flame size={20} />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black tracking-tight">DIH SMM Panel</p>
                              <p className="text-[10px] text-slate-500 font-medium">Control rates, default cash, & news.</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
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
                <button onClick={() => setActiveTab('tools')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg transition-colors border border-slate-700">BACK TO HUB</button>
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
                <button onClick={() => setActiveTab('tools')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg transition-colors border border-slate-700">BACK TO HUB</button>
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
                  <button onClick={() => setActiveTab('tools')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg transition-colors border border-slate-700">BACK TO HUB</button>
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

          {activeTab === 'config-smm' && (
            <div className="flex flex-col xl:flex-row bg-[#0d0f14] text-slate-100 rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl animate-in font-sans min-h-[680px] text-left">
              {/* SIDEBAR */}
              <div className="w-full xl:w-[240px] xl:shrink-0 bg-[#08090d] border-b xl:border-b-0 xl:border-r border-slate-800/80 flex flex-col p-5 space-y-6">
                {/* LOGO & TITLE */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                      <Flame size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold tracking-tight text-white text-sm">DIH SMM</h3>
                    </div>
                    <span className="text-[8px] tracking-widest font-black uppercase bg-red-500/15 border border-red-500/30 text-red-500 px-1 py-0.5 rounded leading-none">ADMIN</span>
                  </div>
                </div>

                {/* COMPACT STATS BOX INSIDE SIDEBAR */}
                <div className="bg-[#0c0d12] border border-slate-800/60 rounded-2xl p-3 grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Total Orders</span>
                    <div className="text-sm font-black font-mono text-slate-200">{smmOrders.length}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Total Users</span>
                    <div className="text-sm font-black font-mono text-slate-200">{smmUsers.length}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Revenue</span>
                    <div className="text-sm font-black font-mono text-emerald-400">${smmOrders.reduce((sum, o) => sum + o.amount, 0).toFixed(1)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Pending Dep.</span>
                    <div className="text-sm font-black font-mono text-amber-500">{smmDeposits.filter(d => d.status === 'pending').length}</div>
                  </div>
                </div>

                {/* NAVIGATION MENUS */}
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-2">Overview</h4>
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
                    ].map(nav => {
                      const isAct = smmSubTab === nav.id;
                      const Icon = nav.icon;
                      return (
                        <button
                          key={nav.id}
                          onClick={() => setSmmSubTab(nav.id as any)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all",
                            isAct 
                              ? "bg-blue-600/10 text-white border-l-2 border-blue-500 font-bold" 
                              : "text-slate-400 hover:text-white hover:bg-slate-900/55"
                          )}
                        >
                          <Icon size={14} className={isAct ? "text-blue-500" : "text-slate-500"} />
                          <span>{nav.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <h4 className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-2">Management</h4>
                    {[
                      { id: 'orders', label: 'Orders', icon: Package, count: smmOrders.filter(o => o.status === 'pending').length },
                      { id: 'services', label: 'Services', icon: Layers },
                      { id: 'users', label: 'Users', icon: Users },
                      { id: 'deposits', label: 'Deposits', icon: DollarSign, count: smmDeposits.filter(d => d.status === 'pending').length, countColor: 'bg-amber-500/15 text-amber-500' }
                    ].map(nav => {
                      const isAct = smmSubTab === nav.id;
                      const Icon = nav.icon;
                      return (
                        <button
                          key={nav.id}
                          onClick={() => setSmmSubTab(nav.id as any)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all",
                            isAct 
                              ? "bg-blue-600/10 text-white border-l-2 border-blue-500 font-bold" 
                              : "text-slate-400 hover:text-white hover:bg-slate-900/55"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={14} className={isAct ? "text-blue-500" : "text-slate-500"} />
                            <span>{nav.label}</span>
                          </div>
                          {nav.count !== undefined && nav.count > 0 && (
                            <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none", nav.countColor || "bg-blue-500/10 text-blue-400 border border-blue-500/20")}>
                              {nav.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 text-left font-sans">
                    <h4 className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-2">Settings & Integration</h4>
                    {[
                      { id: 'providers', label: 'API Providers', icon: Cpu },
                      { id: 'gateways', label: 'Payment Gateways', icon: DollarSign },
                      { id: 'settings', label: 'Settings', icon: Settings }
                    ].map(nav => {
                      const isAct = smmSubTab === nav.id;
                      const Icon = nav.icon;
                      return (
                        <button
                          key={nav.id}
                          onClick={() => setSmmSubTab(nav.id as any)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all",
                            isAct 
                              ? "bg-blue-600/10 text-white border-l-2 border-blue-500 font-bold" 
                              : "text-slate-400 hover:text-white hover:bg-slate-900/55"
                          )}
                        >
                          <Icon size={14} className={isAct ? "text-blue-500" : "text-slate-500"} />
                          <span>{nav.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LOGOUT OR EXIT SMM SUITE */}
                <div className="pt-4 border-t border-slate-800/60">
                  <button 
                    onClick={() => setActiveTab('tools')} 
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 text-[10px] font-black uppercase rounded-xl transition border border-slate-800/80 active:scale-95"
                  >
                    <ChevronRight size={12} className="rotate-180" /> Back To Hub
                  </button>
                </div>
              </div>

              {/* MAIN RIGHT AREA */}
              <div className="flex-1 bg-[#0b0c10] p-6 space-y-6 text-left overflow-y-auto custom-scrollbar">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                  <div>
                    <span className="text-[9px] tracking-widest font-black uppercase text-slate-500">DIH SMM PRO SUITE</span>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white capitalize mt-0.5">
                      {smmSubTab === 'dashboard' ? 'Dashboard Summary' : smmSubTab === 'orders' ? 'Customer Orders' : smmSubTab === 'services' ? 'Services Catalogue' : smmSubTab === 'users' ? 'User Directory' : smmSubTab === 'deposits' ? 'Deposits Pipeline' : smmSubTab === 'providers' ? 'SMM API Providers' : smmSubTab === 'gateways' ? 'Manual Payment Gateways' : 'Global Settings'}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {smmSubTab === 'services' && (
                      <button
                        onClick={() => {
                          setSmmFormName('');
                          setSmmFormCategory('Instagram');
                          setSmmFormQuality('Standard');
                          setSmmFormPrice('1.50');
                          setSmmFormTime('0-24 hours');
                          setSmmFormMin('100');
                          setSmmFormMax('500000');
                          setSmmFormDesc('');
                          setSmmFormRefill('No Refill');
                          setSmmFormSvcProviderId('manual');
                          setSmmFormSvcProviderServiceId('');
                          setSmmModalTitle('Add SMM Service');
                          setSmmModalType('add-service');
                          setIsSmmModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition active:scale-95"
                      >
                        <Plus size={13} /> Add SMM Service
                      </button>
                    )}

                    <div className="flex items-center gap-2 bg-[#0d0f14] border border-slate-800/80 rounded-full pl-3 pr-1.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-bold">Admin: rafcinbhuiyan</span>
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-black text-white uppercase ml-1 shadow select-none">
                        R
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAGES */}
                {smmSubTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* STATS COUNT */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#0d0f14] border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group text-left">
                        <div className="absolute right-4 top-4 text-slate-850 pointer-events-none group-hover:text-blue-500/10 duration-200">
                          <DollarSign size={36} />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Total Revenue</span>
                        <h4 className="text-xl font-black font-mono text-white mt-1">
                          ${smmOrders.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">From all live orders</p>
                      </div>

                      <div className="bg-[#0d0f14] border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group text-left">
                        <div className="absolute right-4 top-4 text-slate-850 pointer-events-none group-hover:text-emerald-500/10 duration-200">
                          <Package size={36} />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Total Orders</span>
                        <h4 className="text-xl font-black font-mono text-white mt-1">{smmOrders.length}</h4>
                        <p className="text-[10px] text-slate-450 mt-1">
                          <span className="text-emerald-400 font-bold">{smmOrders.filter(o => o.status === 'completed').length}</span> completed
                        </p>
                      </div>

                      <div className="bg-[#0d0f14] border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group text-left">
                        <div className="absolute right-4 top-4 text-slate-850 pointer-events-none group-hover:text-purple-500/10 duration-200">
                          <Users size={36} />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Total Users</span>
                        <h4 className="text-xl font-black font-mono text-white mt-1">{smmUsers.length}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Registered consumer roles</p>
                      </div>

                      <div className="bg-[#0d0f14] border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group text-left">
                        <div className="absolute right-4 top-4 text-slate-855 pointer-events-none group-hover:text-amber-500/10 duration-200">
                          <DollarSign size={36} />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Pending Deposits</span>
                        <h4 className="text-xl font-black font-mono text-amber-500 mt-1">
                          {smmDeposits.filter(d => d.status === 'pending').length}
                        </h4>
                        <p className="text-[10px] text-amber-500/70 mt-1">Awaiting verification</p>
                      </div>
                    </div>

                    {/* LOWER CONTENT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Column 1 & 2: Recent Orders & Top Services */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Recent Orders */}
                        <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 space-y-4 text-left">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent Orders</h3>
                              <p className="text-[10px] text-slate-500 mt-0.5">Last submitted actions stream</p>
                            </div>
                            <button onClick={() => setSmmSubTab('orders')} className="text-[10px] text-blue-400 hover:text-blue-300 border-b border-blue-400/35 pb-0.5 font-bold tracking-tight">View All</button>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-300">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-500 font-bold">
                                  <th className="pb-3 text-[10px] uppercase">ID</th>
                                  <th className="pb-3 text-[10px] uppercase">User</th>
                                  <th className="pb-3 text-[10px] uppercase">Service</th>
                                  <th className="pb-3 text-[10px] uppercase text-right">Charged</th>
                                  <th className="pb-3 text-[10px] uppercase text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/40">
                                {smmOrders.slice().reverse().slice(0, 6).map((o) => {
                                  const usr = smmUsers.find(u => u.id === o.userId) || { name: 'Guest Client' };
                                  const colors = ['bg-blue-500/10 text-blue-400', 'bg-violet-500/10 text-violet-400', 'bg-pink-500/10 text-pink-400', 'bg-emerald-500/10 text-emerald-400'];
                                  const color = colors[o.id % colors.length];
                                  return (
                                    <tr key={o.id} className="hover:bg-slate-900/10 transition">
                                      <td className="py-3 font-mono text-slate-500 text-[11px]">#{o.id}</td>
                                      <td className="py-3">
                                        <div className="flex items-center gap-2">
                                          <div className={cn("w-5 h-5 rounded flex items-center justify-center text-[10px] font-black uppercase", color)}>
                                            {usr.name[0]}
                                          </div>
                                          <span className="font-semibold text-slate-300">{usr.name}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 max-w-[180px] truncate text-slate-350 font-medium">{o.serviceName}</td>
                                      <td className="py-3 text-right font-mono text-blue-400 font-bold">${o.amount.toFixed(2)}</td>
                                      <td className="py-3 text-center">
                                        <span className={cn(
                                          "px-2 py-0.5 rounded-full text-[9px] font-bold capitalize border",
                                          o.status === 'completed' ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/15" :
                                          o.status === 'processing' ? "bg-blue-500/5 text-blue-400 border-blue-500/15" :
                                          o.status === 'pending' ? "bg-amber-500/5 text-amber-400 border-amber-500/15" :
                                          "bg-red-500/5 text-red-500 border-red-500/15"
                                        )}>
                                          {o.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Top Services */}
                        <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 space-y-4 text-left">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Top Services Usage</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">Primary campaigns ranking and volume</p>
                          </div>
                          <div className="space-y-3.5 pt-1.5">
                            {Array.from(new Set(smmOrders.map(o => o.serviceName))).length === 0 ? (
                              <div className="text-xs text-slate-500 py-4 text-center">No orders logged yet. Wait for visitor checkouts.</div>
                            ) : (
                              Array.from(new Set(smmOrders.map(o => o.serviceName))).slice(0, 5).map((name) => {
                                const count = smmOrders.filter(o => o.serviceName === name).length;
                                const percentage = Math.min(100, Math.max(10, (count / smmOrders.length) * 100));
                                return (
                                  <div key={name} className="space-y-1.5 text-left">
                                    <div className="flex justify-between text-xs text-slate-350 font-medium">
                                      <span className="truncate max-w-[320px]">{name}</span>
                                      <span className="font-mono text-blue-400 font-extrabold">{count} orders</span>
                                    </div>
                                    <div className="w-full bg-[#08090d] rounded-full h-1.5 border border-slate-800/40">
                                      <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Order Status breakdown & Pending Deposits list */}
                      <div className="space-y-6">
                        {/* Order Status */}
                        <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 space-y-4 text-left">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Order Status</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Overall process state split ratios</p>
                          </div>
                          <div className="space-y-3 pt-1">
                            {['pending', 'processing', 'completed', 'cancelled', 'partial'].map((st) => {
                              const count = smmOrders.filter(o => o.status === st).length;
                              const percentage = smmOrders.length > 0 ? (count / smmOrders.length) * 100 : 0;
                              const color = st === 'completed' ? 'bg-emerald-500' : st === 'processing' ? 'bg-blue-500' : st === 'pending' ? 'bg-amber-500' : st === 'cancelled' ? 'bg-red-500' : 'bg-purple-500';
                              return (
                                <div key={st} className="space-y-1 text-left">
                                  <div className="flex justify-between text-xs text-slate-300 font-medium capitalize animate-none">
                                    <span>{st}</span>
                                    <span className="font-mono text-slate-400 font-extrabold">{count}</span>
                                  </div>
                                  <div className="w-full bg-[#08090d] rounded-full h-1.5 border border-slate-800/45">
                                    <div className={cn("h-1.5 rounded-full transition-all duration-500", color)} style={{ width: `${percentage}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Pending Deposits list box */}
                        <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 space-y-4 text-left">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Pending Deposits</h3>
                              <p className="text-[10px] text-slate-500 mt-0.5">Requests waiting clearance</p>
                            </div>
                            <button onClick={() => setSmmSubTab('deposits')} className="text-[10px] font-bold text-slate-400 hover:text-white transition">Manage</button>
                          </div>

                          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {smmDeposits.filter(d => d.status === 'pending').length === 0 ? (
                              <div className="p-8 text-center bg-[#08090d] border border-slate-800 rounded-xl text-slate-500 text-xs font-medium">
                                All pipeline clear. No pending deposits.
                              </div>
                            ) : (
                              smmDeposits.filter(d => d.status === 'pending').slice(0, 4).map((d) => {
                                const usr = smmUsers.find(u => u.id === d.userId) || { name: 'Customer Client' };
                                return (
                                  <div key={d.id} className="p-3 bg-[#08090d] border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between text-left">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px] flex items-center justify-center uppercase">
                                          {usr.name[0]}
                                        </div>
                                        <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">{usr.name}</span>
                                      </div>
                                      <span className="text-[8px] font-black tracking-tight uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                                        {d.method}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-mono font-black text-emerald-450">${d.amount.toFixed(2)}</span>
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() => handleRejectSmmDeposit(d.id)}
                                          className="px-2 py-1 rounded border border-red-500/30 hover:bg-rose-500/10 text-red-400 font-extrabold text-[9px] transition"
                                        >
                                          Reject
                                        </button>
                                        <button
                                          onClick={() => handleApproveSmmDeposit(d.id)}
                                          className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] transition animate-none"
                                        >
                                          Approve
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: CUSTOMER ORDERS */}
                {smmSubTab === 'orders' && (
                  <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-6 space-y-4 text-left animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Customer Orders</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Inspect, process, complete, or reject live client tasks</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
                          <input
                            type="text"
                            placeholder="Search details..."
                            value={smmOrderSearch}
                            onChange={(e) => setSmmOrderSearch(e.target.value)}
                            className="bg-[#08090d] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 duration-150 w-44"
                          />
                        </div>
                        <select
                          value={smmOrderStatusFilter}
                          onChange={(e) => setSmmOrderStatusFilter(e.target.value)}
                          className="bg-[#08090d] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-slate-500 font-bold">
                            <th className="pb-3 text-[10px] uppercase">ID</th>
                            <th className="pb-3 text-[10px] uppercase">User Profile</th>
                            <th className="pb-3 text-[10px] uppercase">Ordered package</th>
                            <th className="pb-3 text-[10px] uppercase w-[150px]">Target Social Link</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Quantity</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Charged</th>
                            <th className="pb-3 text-[10px] uppercase text-center">Status</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {filteredAdminOrdersBySearch
                            .map((o) => {
                              const usr = smmUsers.find(u => u.id === o.userId) || { name: 'Guest Client', email: 'guest@smm.com' };
                              return (
                                <tr key={o.id} className="hover:bg-slate-900/10 transition">
                                  <td className="py-3.5 font-mono text-slate-500 text-[11px]">#{o.id}</td>
                                  <td className="py-3.5">
                                    <p className="font-bold text-slate-200">{usr.name}</p>
                                    <span className="text-[10px] text-slate-500">{usr.email}</span>
                                  </td>
                                  <td className="py-3.5 max-w-[200px] leading-relaxed truncate">
                                    <p className="font-medium text-slate-200">{o.serviceName}</p>
                                    <span className="text-[9px] text-slate-500 uppercase font-black font-mono tracking-wider">{o.category}</span>
                                  </td>
                                  <td className="py-3.5 max-w-[150px] truncate">
                                    <a href={o.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{o.link}</a>
                                  </td>
                                  <td className="py-3.5 text-right font-mono text-slate-300 font-bold">{o.quantity.toLocaleString()}</td>
                                  <td className="py-3.5 text-right font-mono text-blue-400 font-bold">${o.amount.toFixed(2)}</td>
                                  <td className="py-3.5 text-center">
                                    <span className={cn(
                                      "px-2.5 py-0.5 rounded-full text-[9px] font-bold capitalize border",
                                      o.status === 'completed' ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/15" :
                                      o.status === 'processing' ? "bg-blue-500/5 text-blue-400 border-blue-500/15" :
                                      o.status === 'pending' ? "bg-amber-500/5 text-amber-400 border-amber-500/15" :
                                      "bg-red-500/5 text-red-500 border-red-500/15"
                                    )}>
                                      {o.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-right font-medium">
                                    <div className="flex gap-1.5 justify-end items-center">
                                      {smmDeletingOrderId === o.id ? (
                                        <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                                          <span className="text-[9px] font-bold text-red-400 uppercase">Sure?</span>
                                          <button
                                            onClick={() => {
                                              handleDeleteSmmOrder(o.id);
                                              setSmmDeletingOrderId(null);
                                            }}
                                            className="px-2 py-0.5 rounded bg-red-650 hover:bg-red-600 text-white text-[9px] font-black uppercase transition active:scale-95"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            onClick={() => setSmmDeletingOrderId(null)}
                                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold uppercase transition active:scale-95"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              setSelectedSmmItem(o);
                                              setSmmFormName(o.serviceName);
                                              setSmmFormStatus(o.status);
                                              setSmmFormLink(o.link);
                                              setSmmFormQty(o.quantity.toString());
                                              setSmmFormAmount(o.amount.toString());
                                              setSmmFormApiOrderId(o.apiOrderId || '');
                                              setSmmFormApiProviderId(o.apiProviderId || '');
                                              setSmmModalTitle(`Edit Order #${o.id}`);
                                              setSmmModalType('edit-order');
                                              setIsSmmModalOpen(true);
                                            }}
                                            className="px-2 py-1 rounded bg-[#08090d] border border-slate-800 hover:bg-slate-800 hover:text-white text-[10px] font-bold text-slate-300 transition"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => setSmmDeletingOrderId(o.id)}
                                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                            title="Delete Order"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: SERVICES CATALOG */}
                {smmSubTab === 'services' && (() => {
                  const isAllVisibleChecked = visibleCatalogServices.length > 0 && 
                    visibleCatalogServices.every(s => selectedCatalogSvcIds.includes(s.id));

                  return (
                    <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-6 space-y-4 text-left animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Services Catalog (Live Rates)</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">Configure live price rates, descriptions and speeds. Select multiple check boxes for batch deletion.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {smmConfirmClearAll ? (
                            <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 px-3 py-1 rounded-xl animate-in fade-in duration-150">
                              <span className="font-extrabold text-red-500 text-[10px] uppercase tracking-wider">⚠️ Clear all services?</span>
                              <button
                                onClick={() => {
                                  handleClearAllServices();
                                  setSmmToast({ message: "Successfully deleted all SMM services from the catalog.", type: 'warning' });
                                  setSmmConfirmClearAll(false);
                                }}
                                className="px-2.5 py-1 bg-red-650 hover:bg-red-600 text-white font-extrabold text-[9px] uppercase rounded-lg active:scale-95 transition"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setSmmConfirmClearAll(false)}
                                className="px-2.5 py-1 bg-[#121620] hover:bg-slate-800 text-slate-350 font-bold text-[9px] uppercase rounded-lg active:scale-95 transition"
                              >
                                No
                              </button>
                            </div>
                          ) : smmServicesList.length > 0 && (
                            <button
                              onClick={() => setSmmConfirmClearAll(true)}
                              className="px-3.5 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-650 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white font-extrabold text-[10px] uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md flex items-center gap-1.5"
                            >
                              Clear All Services
                            </button>
                          )}
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
                            <input
                              type="text"
                              placeholder="Search package..."
                              value={smmSvcSearch}
                              onChange={(e) => setSmmSvcSearch(e.target.value)}
                              className="bg-[#08090d] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 duration-150 w-44"
                            />
                          </div>
                          <select
                            value={smmSvcCatFilter}
                            onChange={(e) => setSmmSvcCatFilter(e.target.value)}
                            className="bg-[#08090d] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">All Social Networks</option>
                            {adminUniqueSmmCategoriesOptions.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* BULK ACTION HEADER ACTION PANEL */}
                      {selectedCatalogSvcIds.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-red-950/20 border border-red-500/20 px-4 py-3 rounded-xl text-xs sm:animate-in sm:slide-in-from-top-2">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="text-red-500" size={15} />
                            <span className="text-slate-350">
                              Selected <strong className="text-white font-bold">{selectedCatalogSvcIds.length}</strong> service(s) to apply bulk deletion operations.
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCatalogSvcIds([]);
                                setSmmConfirmBatchDelete(false);
                              }}
                              className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-bold hover:bg-slate-800 text-[10px] uppercase transition"
                            >
                              Reset
                            </button>
                            {smmConfirmBatchDelete ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                                <span className="text-[9px] font-bold text-red-400 uppercase">Delete {selectedCatalogSvcIds.length} items?</span>
                                <button
                                  onClick={() => {
                                    handleBulkDeleteServices(selectedCatalogSvcIds);
                                    setSmmToast({ message: `Successfully deleted ${selectedCatalogSvcIds.length} services in batch!`, type: 'success' });
                                    setSmmConfirmBatchDelete(false);
                                  }}
                                  className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase transition active:scale-95"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setSmmConfirmBatchDelete(false)}
                                  className="px-2 py-0.5 rounded bg-[#121620] hover:bg-slate-800 text-slate-350 text-[9px] font-bold uppercase transition active:scale-95"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSmmConfirmBatchDelete(true)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[10px] uppercase transition shadow-lg shadow-red-950/50"
                              >
                                Batch Delete ({selectedCatalogSvcIds.length})
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead>
                            <tr className="border-b border-slate-800/80 text-slate-500 font-bold">
                              <th className="pb-3 text-[10px] uppercase w-10 text-center">
                                <input
                                  type="checkbox"
                                  checked={isAllVisibleChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const nextAdded = visibleCatalogServices.map(s => s.id);
                                      setSelectedCatalogSvcIds(prev => {
                                        const next = [...prev];
                                        nextAdded.forEach(id => {
                                          if (!next.includes(id)) next.push(id);
                                        });
                                        return next;
                                      });
                                    } else {
                                      const visibleIds = visibleCatalogServices.map(s => s.id);
                                      setSelectedCatalogSvcIds(prev => prev.filter(id => !visibleIds.includes(id)));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 rounded border-slate-800 bg-[#08090d] text-blue-500 cursor-pointer focus:ring-0"
                                />
                              </th>
                              <th className="pb-3 text-[10px] uppercase w-12 text-center">ID</th>
                              <th className="pb-3 text-[10px] uppercase">Service Name</th>
                              <th className="pb-3 text-[10px] uppercase">Category</th>
                              <th className="pb-3 text-[10px] uppercase text-right">Active Price/1k</th>
                              <th className="pb-3 text-[10px] uppercase text-center">Quality</th>
                              <th className="pb-3 text-[10px] uppercase text-right">Min Qty</th>
                              <th className="pb-3 text-[10px] uppercase text-right">Max Qty</th>
                              <th className="pb-3 text-[10px] uppercase text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40">
                            {visibleCatalogServices.map((s) => {
                              const activePrice = s.price * (settings.smmPriceMultiplier || 1.0);
                              const isChecked = selectedCatalogSvcIds.includes(s.id);
                              return (
                                <tr 
                                  key={s.id} 
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedCatalogSvcIds(prev => prev.filter(id => id !== s.id));
                                    } else {
                                      setSelectedCatalogSvcIds(prev => [...prev, s.id]);
                                    }
                                  }}
                                  className={cn(
                                    "hover:bg-[#12141c]/50 transition cursor-pointer select-none",
                                    isChecked ? "bg-blue-950/10 text-white" : ""
                                  )}
                                >
                                  <td className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedCatalogSvcIds(prev => [...prev, s.id]);
                                        } else {
                                          setSelectedCatalogSvcIds(prev => prev.filter(id => id !== s.id));
                                        }
                                      }}
                                      className="w-3.5 h-3.5 rounded border-slate-800 bg-[#08090d] text-blue-500 cursor-pointer focus:ring-0"
                                    />
                                  </td>
                                  <td className="py-3 font-mono text-slate-500 text-[11px] text-center">#{s.id}</td>
                                  <td className="py-3 text-left">
                                    <p className="font-bold text-slate-200">{s.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] mt-1">
                                      <span className={cn(
                                        "px-2  py-0.5 rounded text-[10px] font-mono font-bold tracking-wide border inline-flex items-center gap-1 shrink-0",
                                        (s.refill || 'No Refill').toLowerCase().includes('no')
                                          ? "bg-red-500/10 text-red-400 border-red-500/15"
                                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15 font-medium"
                                      )}>
                                        🔄 Refill: {s.refill || "No Refill"}
                                      </span>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-slate-500 truncate">{s.time || 'Instant'}</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className="px-2 py-0.5 rounded bg-[#08090d] border border-slate-800 text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">
                                      {s.category}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-mono text-emerald-400 font-bold">${activePrice.toFixed(4)}</td>
                                  <td className="py-3 text-center">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-extrabold",
                                      s.quality === 'VIP' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                      s.quality === 'Premium' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    )}>
                                      {s.quality || 'Standard'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-mono text-slate-400">{s.min?.toLocaleString() || 100}</td>
                                  <td className="py-3 text-right font-mono text-slate-400">{s.max?.toLocaleString() || '1,000,000'}</td>
                                  <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-1.5 justify-end items-center">
                                      {smmDeletingServiceId === s.id ? (
                                        <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                                          <span className="text-[9px] font-bold text-red-400 uppercase">Sure?</span>
                                          <button
                                            onClick={() => {
                                              handleDeleteSmmService(s.id);
                                              setSmmDeletingServiceId(null);
                                            }}
                                            className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase transition active:scale-95"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            onClick={() => setSmmDeletingServiceId(null)}
                                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold uppercase transition active:scale-95"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              setSelectedSmmItem(s);
                                              setSmmFormName(s.name);
                                              setSmmFormCategory(s.category);
                                              setSmmFormQuality(s.quality || 'Standard');
                                              setSmmFormPrice(s.price.toString());
                                              setSmmFormTime(s.time || '0-24 hours');
                                              setSmmFormMin(s.min?.toString() || '100');
                                              setSmmFormMax(s.max?.toString() || '1000000');
                                              setSmmFormDesc(s.desc || '');
                                              setSmmFormRefill(s.refill || 'No Refill');
                                              setSmmFormSvcProviderId(s.providerId || 'manual');
                                              setSmmFormSvcProviderServiceId(s.providerServiceId || '');
                                              setSmmModalTitle(`Edit Service #${s.id}`);
                                              setSmmModalType('edit-service');
                                              setIsSmmModalOpen(true);
                                            }}
                                            className="px-2 py-1 rounded bg-[#08090d] border border-slate-800 hover:bg-slate-800 hover:text-white text-[10px] font-bold text-slate-300"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => setSmmDeletingServiceId(s.id)}
                                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-450"
                                            title="Delete Service"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* SUBTAB 4: USER INDEX */}
                {smmSubTab === 'users' && (
                  <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-6 space-y-4 text-left animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Customer Directory</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Top-up interactive user balances and moderate registration profiles</p>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
                        <input
                          type="text"
                          placeholder="Filter users..."
                          value={smmUserSearch}
                          onChange={(e) => setSmmUserSearch(e.target.value)}
                          className="bg-[#08090d] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 duration-150 w-48"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-slate-500 font-bold">
                            <th className="pb-3 text-[10px] uppercase">User Details</th>
                            <th className="pb-3 text-[10px] uppercase">Email Address</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Available Balance</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Orders Placed</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Total Spent</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Joined Date</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Action Gateway</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {smmUsers
                            .filter(u => {
                              const term = (u.name + u.email).toLowerCase();
                              return term.includes(smmUserSearch.toLowerCase());
                            })
                            .map((u) => {
                              const stats = userStatsMap[u.id] || { count: 0, spent: 0 };
                              return (
                                <tr key={u.id} className="hover:bg-slate-900/10 transition">
                                  <td className="py-3 text-left">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shadow select-none">
                                        {u.name[0]}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-200">{u.name}</p>
                                        {u.id === 999 && (
                                          <span className="text-[8px] font-black uppercase text-emerald-450 bg-emerald-500/15 border border-emerald-500/35 px-1 rounded">Active Tester</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 text-slate-400 text-[11px] font-mono select-all">{u.email}</td>
                                  <td className="py-3 text-right font-mono text-emerald-400 font-black text-sm">${u.balance.toFixed(2)}</td>
                                  <td className="py-3 text-right font-mono text-slate-400">{stats.count}</td>
                                  <td className="py-3 text-right font-mono text-slate-400">${stats.spent.toFixed(2)}</td>
                                  <td className="py-3 text-right text-slate-500">{u.joined}</td>
                                  <td className="py-3 text-right font-medium">
                                    <div className="flex gap-1.5 justify-end items-center">
                                      {smmDeletingUserId === u.id ? (
                                        <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                                          <span className="text-[9px] font-bold text-red-400 uppercase">Sure?</span>
                                          <button
                                            onClick={() => {
                                              handleDeleteSmmUser(u.id);
                                              setSmmDeletingUserId(null);
                                            }}
                                            className="px-2 py-0.5 rounded bg-red-650 hover:bg-red-600 text-white text-[9px] font-black uppercase transition active:scale-95"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            onClick={() => setSmmDeletingUserId(null)}
                                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold uppercase transition active:scale-95"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              setSelectedSmmItem(u);
                                              setSmmFormUserName(u.name);
                                              setSmmFormUserEmail(u.email);
                                              setSmmFormUserBalance(u.balance.toFixed(2));
                                              setSmmModalTitle(`Edit User Info: ${u.name}`);
                                              setSmmModalType('edit-user');
                                              setIsSmmModalOpen(true);
                                            }}
                                            className="px-2.5 py-1 rounded bg-[#08090d] border border-slate-800 hover:bg-slate-800 hover:text-white text-[10px] font-bold text-slate-300 transition"
                                          >
                                            Adjust Funds
                                          </button>
                                          {u.id !== 999 && (
                                            <button
                                              onClick={() => setSmmDeletingUserId(u.id)}
                                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                              title="Delete Customer Profile"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: DEPOSITS PIPELINE */}
                {smmSubTab === 'deposits' && (
                  <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-6 space-y-4 text-left animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deposits Pipeline Control</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Approve, reject, or filter transaction deposit receipts submitted by customers</p>
                      </div>
                      <select
                        value={smmDepStatusFilter}
                        onChange={(e) => setSmmDepStatusFilter(e.target.value)}
                        className="bg-[#08090d] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">All Transactions</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-slate-500 font-bold">
                            <th className="pb-3 text-[10px] uppercase">Tx Id</th>
                            <th className="pb-3 text-[10px] uppercase">User Profile</th>
                            <th className="pb-3 text-[10px] uppercase">Gateway Channel</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Deposited Cash</th>
                            <th className="pb-3 text-[10px] uppercase text-right mr-3">Date</th>
                            <th className="pb-3 text-[10px] uppercase text-center">Status</th>
                            <th className="pb-3 text-[10px] uppercase text-right">Action Gate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {smmDeposits
                            .slice()
                            .reverse()
                            .filter(d => !smmDepStatusFilter || d.status === smmDepStatusFilter)
                            .map((d) => {
                              const usr = smmUsers.find(u => u.id === d.userId || (d.userEmail && u.email && u.email.toLowerCase() === d.userEmail.toLowerCase())) || { 
                                name: d.userName || 'Customer Client', 
                                email: d.userEmail || 'user@smm.com' 
                              };
                              return (
                                <tr key={d.id} className="hover:bg-slate-900/10 transition">
                                  <td className="py-3">
                                    <div className="font-mono text-slate-500 text-[11px]">#DEP{d.id}</div>
                                    {d.txid && (
                                      <div className="text-[9px] bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 mt-1 font-mono text-blue-400 font-bold select-all inline-block truncate max-w-[124px]">
                                        Tx: {d.txid}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 text-left">
                                    <p className="font-bold text-slate-200">{usr.name}</p>
                                    <span className="text-[10px] text-slate-500">{usr.email}</span>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex flex-col gap-1 items-start">
                                      <span className={cn(
                                        "px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border",
                                        d.method === 'bkash' ? "bg-pink-500/10 text-pink-400 border-pink-500/20" :
                                        d.method === 'nagad' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                        d.method === 'rocket' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                        d.method === 'upay' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                                        d.method === 'binance' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                        d.method === 'usdt' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      )}>
                                        {d.method}
                                      </span>
                                      {d.sender && (
                                        <span className="text-[9px] text-slate-400 font-mono font-bold mt-0.5 bg-slate-900 px-1 rounded">
                                          Sndr: {d.sender}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 text-right font-mono text-emerald-400 font-bold">${d.amount.toFixed(2)}</td>
                                  <td className="py-3 text-right text-slate-500">{d.date}</td>
                                  <td className="py-3 text-center">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-[9px] font-bold capitalize border",
                                      d.status === 'approved' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                                      d.status === 'pending' ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                                      "bg-red-500/15 text-red-400 border-red-500/30"
                                    )}>
                                      {d.status}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right">
                                    <div className="flex gap-2 justify-end items-center">
                                      {smmDeletingDepositId === d.id ? (
                                        <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                                          <span className="text-[9px] font-bold text-red-400 uppercase">Sure?</span>
                                          <button
                                            onClick={() => {
                                              handleDeleteSmmDeposit(d.id);
                                              setSmmDeletingDepositId(null);
                                            }}
                                            className="px-2 py-0.5 rounded bg-red-650 hover:bg-red-600 text-white text-[9px] font-black uppercase transition active:scale-95"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            onClick={() => setSmmDeletingDepositId(null)}
                                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold uppercase transition active:scale-95"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          {d.status === 'pending' ? (
                                            <div className="flex gap-1.5 justify-end">
                                              <button
                                                onClick={() => handleRejectSmmDeposit(d.id)}
                                                className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] transition"
                                              >
                                                Reject
                                              </button>
                                              <button
                                                onClick={() => handleApproveSmmDeposit(d.id)}
                                                className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] transition"
                                              >
                                                Approve
                                              </button>
                                            </div>
                                          ) : (
                                            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded">Reviewed</span>
                                          )}
                                          <button
                                            onClick={() => setSmmDeletingDepositId(d.id)}
                                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-450 transition"
                                            title="Delete Deposit Record"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: SMM API PROVIDERS (FULL WIDTH) */}
                {smmSubTab === 'providers' && (
                  <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans">
                    <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/50">
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            SMM API Provider Hub
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-xl">
                            Integrate fully functional external SMM providers. Pull original categories & service parameters automatically, apply customized pricing profit markups, and configure instant pricing rate sync tasks.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSmmFormProvName('');
                            setSmmFormProvUrl('https://');
                            setSmmFormProvKey('');
                            setSmmFormProvStatus('active');
                            setSmmFormProvBalance('500.00');
                            setSmmModalTitle('Add SMM API Provider');
                            setSmmModalType('add-provider');
                            setIsSmmModalOpen(true);
                          }}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] rounded-xl transition active:scale-95 shrink-0 shadow-lg shadow-blue-500/15"
                        >
                          <Plus size={13} /> Add New API Provider
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        {smmProviders.length === 0 ? (
                          <div className="col-span-2 py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                            No SMM API providers configured yet. Click "Add New API Provider" to begin integration.
                          </div>
                        ) : (
                          smmProviders.map((prov) => {
                            const linkedCount = smmServicesList.filter(s => s.providerId === prov.id.toString()).length;
                            const isAct = prov.status === 'active';
                            return (
                              <div 
                                key={prov.id} 
                                className={cn(
                                  "bg-[#07080c] border rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden",
                                  isAct ? "border-slate-800/80 hover:border-slate-700" : "border-slate-850/60 opacity-60"
                                )}
                              >
                                {isAct && (
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                                )}

                                <div className="flex justify-between items-start relative z-10">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-extrabold text-white tracking-wide">{prov.name}</h4>
                                      <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase border",
                                        isAct 
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                          : "bg-red-500/10 text-red-450 border-red-505/20"
                                      )}>
                                        {prov.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                      <span className="text-slate-500 bg-slate-900 px-1 py-0.5 rounded font-bold uppercase text-[8px]">URL</span>
                                      <span className="truncate max-w-[200px]" title={prov.apiUrl}>{prov.apiUrl}</span>
                                    </div>
                                  </div>

                                  <div className="text-right space-y-0.5">
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">API Funds Balance</div>
                                    <div className="text-base font-black text-emerald-400 font-mono tracking-tight">
                                      ${parseFloat(prov.balance?.toString() || '0.00').toFixed(4)}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-[#0b0c11] border border-slate-850/80 rounded-xl p-3 flex items-center justify-between text-[10px] font-mono select-none">
                                  <div className="text-slate-400">
                                    Auth key: <code className="text-slate-500">{prov.apiKey ? '••••••••' + prov.apiKey.slice(-6) : 'Not Assigned'}</code>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-bold text-slate-350">{linkedCount} Services Linked</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 relative z-10 border-t border-slate-850/60 w-full">
                                  {smmDeletingProviderId === prov.id ? (
                                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-120">
                                      <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Confirm Provider Deletion?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteSmmProvider(prov.id);
                                          setSmmDeletingProviderId(null);
                                          setSmmToast({ message: `SMM provider connection deleted successfully`, type: 'success' });
                                        }}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-550 text-white text-[10px] font-black uppercase rounded-lg transition active:scale-95"
                                      >
                                        Delete Forever
                                      </button>
                                      <button
                                        onClick={() => setSmmDeletingProviderId(null)}
                                        className="px-2.5 py-1 bg-slate-850 text-slate-300 text-[10px] font-bold uppercase rounded-lg transition active:scale-95 hover:bg-slate-800"
                                      >
                                        Abort
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex gap-1.5 flex-wrap">
                                        <button
                                          onClick={() => startImportWizard(prov)}
                                          className="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 border border-blue-500/25 hover:border-blue-500 text-blue-400 hover:text-white font-extrabold text-[10px] uppercase tracking-wide transition flex items-center gap-1 active:scale-95 transform"
                                          title="Fetch categories and services live and choose which ones to batch import"
                                        >
                                          <Download size={11} />
                                          Fetch Services
                                        </button>
                                        <button
                                          onClick={() => handleSyncSmmProviderRates(prov)}
                                          disabled={linkedCount === 0}
                                          className={cn(
                                            "px-3 py-1.5 rounded-xl bg-slate-900 border text-slate-400 font-extrabold text-[10px] uppercase tracking-wide transition flex items-center gap-1 active:scale-95",
                                            linkedCount > 0 
                                              ? "border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white" 
                                              : "border-slate-850 text-slate-600 opacity-40 cursor-not-allowed"
                                          )}
                                          title="Sync rates instantly for all services currently imported from this provider"
                                        >
                                          <RefreshCcw size={10} className={cn(linkedCount > 0 && "text-slate-400")} />
                                          Sync Rates
                                        </button>
                                        <button
                                          onClick={() => handleSyncSmmProviderBalance(prov)}
                                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-600 font-extrabold text-[10px] uppercase tracking-wide transition flex items-center gap-1 active:scale-95"
                                          title="Sync funds balance live from SMM Panel"
                                        >
                                          <DollarSign size={10} className="text-emerald-400 hover:text-white" />
                                          Sync Balance
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            setSelectedSmmItem(prov);
                                            setSmmFormProvName(prov.name);
                                            setSmmFormProvUrl(prov.apiUrl);
                                            setSmmFormProvKey(prov.apiKey);
                                            setSmmFormProvStatus(prov.status);
                                            setSmmFormProvBalance(prov.balance?.toString() || '500.00');
                                            setSmmModalTitle(`Edit Provider: ${prov.name}`);
                                            setSmmModalType('edit-provider');
                                            setIsSmmModalOpen(true);
                                          }}
                                          className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-350 transition active:scale-95"
                                        >
                                          Edit URL/Key
                                        </button>
                                        <button
                                          onClick={() => setSmmDeletingProviderId(prov.id)}
                                          className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 transition"
                                          title="Delete Provider Connection"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 6: SEPARATED SMM PAYMENT GATEWAYS (FULL WIDTH) */}
                {smmSubTab === 'gateways' && (
                  <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans">
                    <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                      <div className="pb-2 border-b border-slate-850">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <DollarSign size={14} className="text-blue-500" />
                          Manual Payment Gateway Wallet Channels
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xl">
                          Configure customer-facing manual deposit methods. Modify mobile financial wallets (bKash, Nagad, Upay, Rocket), cards checkout requests, and smart decentralization wallets (Binance Pay ID, USDT TRC-20 and more).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                        {smmManualGateways.map((gate) => {
                          const isEna = gate.enabled !== false;
                          return (
                            <div 
                              key={gate.id} 
                              className={cn(
                                "bg-[#07080c] border rounded-2xl p-4.5 space-y-3.5 transition-all text-xs relative overflow-hidden flex flex-col justify-between",
                                isEna ? "border-slate-800 hover:border-slate-700/80" : "border-slate-850 opacity-55"
                              )}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      isEna ? "bg-blue-500" : "bg-slate-600"
                                    )} />
                                    <h4 className="font-bold text-slate-200 uppercase tracking-tight text-[11px] font-sans">{gate.title}</h4>
                                  </div>
                                  <span className={cn(
                                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                                    isEna ? "bg-emerald-550/10 text-emerald-400 border-emerald-500/20" : "bg-slate-900 text-slate-500 border-slate-850"
                                  )}>
                                    {isEna ? 'Active / Enabled' : 'Disabled'}
                                  </span>
                                </div>

                                <div className="space-y-1.5 bg-[#0b0c11] p-3 rounded-xl border border-slate-850 font-mono text-[10px]">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Receiver Wallet Account Details / ID</span>
                                    <span className="font-extrabold text-slate-200 select-all tracking-wide text-[11px]">{gate.numberOrAddress || 'Not Configured yet.'}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400 pt-1.5 border-t border-slate-850/40">
                                    <span>Transfer Class:</span>
                                    <span className="font-bold text-blue-400">{gate.type || 'Personal'}</span>
                                  </div>
                                </div>

                                <div className="text-[10px] text-slate-400 leading-relaxed bg-[#0b0c11]/45 p-2.5 rounded-lg border border-slate-850/60 font-sans italic">
                                  <p className="font-bold text-slate-500 text-[8px] uppercase tracking-widest leading-none mb-1 font-mono">Channel Instructions</p>
                                  {gate.instructions || 'Submit transaction verification ID to complete approval.'}
                                </div>
                              </div>

                              <div className="flex justify-end pt-2 border-t border-slate-850/30">
                                <button
                                  onClick={() => {
                                    setSelectedSmmItem(gate);
                                    setSmmFormGatewayTitle(gate.title);
                                    setSmmFormGatewayNumber(gate.numberOrAddress);
                                    setSmmFormGatewayType(gate.type || 'Personal');
                                    setSmmFormGatewayInstructions(gate.instructions || '');
                                    setSmmFormGatewayEnabled(gate.enabled !== false);
                                    setSmmModalTitle(`Edit Gateway: ${gate.title}`);
                                    setSmmModalType('edit-gateway');
                                    setIsSmmModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 text-[10px] font-extrabold rounded-lg bg-slate-905 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95"
                                >
                                  Modify Wallet Configs
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 6: GLOBAL PARAMETERS */}
                {smmSubTab === 'settings' && (
                  <div className="space-y-6 text-left animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Notice Broadcast Card */}
                      <div className="md:col-span-2 bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Announcement System</span>
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-tight">System broadcast notice</h3>
                          <p className="text-xs text-slate-500 font-medium">This banner notification is displayed prominently at the top of the SMM Panel dashboard.</p>
                          
                          <textarea
                            rows={4}
                            value={settings.smmSystemNotice || ''}
                            onChange={(e) => updateSettings({ smmSystemNotice: e.target.value })}
                            placeholder="Enter operational system announcements..."
                            className="w-full bg-[#08090d] border border-slate-850 rounded-xl p-4 text-xs text-slate-300 outline-none focus:border-blue-500 duration-150 resize-none font-medium custom-scrollbar"
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-4 font-mono">Updates auto-save to global state.</div>
                      </div>

                      {/* Pricing & Balances Panel */}
                      <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-6">
                          <div>
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Core Parameters</span>
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-tight mt-1">Financial operations</h3>
                          </div>

                          {/* SMM Default Starts Balances */}
                          <div className="space-y-2 text-left">
                            <label className="text-[11px] font-bold text-slate-400">Default Starting Funds ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-xs text-slate-550 font-mono font-bold">$</span>
                              <input
                                type="number"
                                step="5"
                                min="0"
                                value={settings.smmDefaultBalance !== undefined ? settings.smmDefaultBalance : 50}
                                onChange={(e) => updateSettings({ smmDefaultBalance: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-[#08090d] border border-slate-800 rounded-xl pl-8 pr-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 duration-150 font-mono font-bold"
                              />
                            </div>
                            <p className="text-[9px] text-slate-500">Starting funds loaded automatically for new visitor profiles.</p>
                          </div>

                          {/* Rates Multiplier */}
                          <div className="space-y-2 text-left">
                            <div className="flex justify-between items-center">
                              <label className="text-[11px] font-bold text-slate-400">Services Rate Multiplier</label>
                              <span className="text-xs font-mono font-black text-blue-500">{(settings.smmPriceMultiplier || 1.0).toFixed(1)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="5.0"
                              step="0.1"
                              value={settings.smmPriceMultiplier || 1.0}
                              onChange={(e) => updateSettings({ smmPriceMultiplier: parseFloat(e.target.value) })}
                              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="text-[9px] text-slate-500">Calculates and inflates/deflates all SMM service prices globally instantly.</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* SMM Platform Shortcuts Settings Card */}
                    <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Interface Configuration</span>
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-tight mt-1">Fast SMM Platform Shortcuts</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Customize the platform name shortcuts that appear on the main DihSMM dashboard under the "Fast SMM Platform Shortcuts" row.</p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400">Shortcut Names (comma-separated list)</label>
                        <input
                          type="text"
                          value={settings.smmShortcuts !== undefined ? settings.smmShortcuts : "Instagram, Facebook, YouTube, TikTok, Twitter/X, Telegram, Spotify, LinkedIn, Discord, Website Traffic, Others"}
                          onChange={(e) => updateSettings({ smmShortcuts: e.target.value })}
                          placeholder="Instagram, Facebook, YouTube, TikTok..."
                          className="w-full bg-[#08090d] border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 duration-150 font-medium font-mono"
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => updateSettings({ smmShortcuts: "Instagram, Facebook, YouTube, TikTok, Telegram" })}
                            className="bg-[#141720] hover:bg-[#1a1f2c] border border-slate-800 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                          >
                            Set Basic (5 platforms)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSettings({ smmShortcuts: "Instagram, Facebook, YouTube, TikTok, Twitter/X, Telegram, Spotify, LinkedIn, Discord, Website Traffic, Others" })}
                            className="bg-[#141720] hover:bg-[#1a1f2c] border border-slate-800 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                          >
                            Restore All Standard
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">💡 Enter platform names exactly as specified in SMM Services categories list so the quick filter buttons can match them properly.</p>
                      </div>
                    </div>

                    {/* SMM Design Themes Configuration */}
                    <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Theme Configuration</span>
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-tight mt-1">Premium Color Theme</h3>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Toggle between the customized high-fidelity premium color/neon style or a clean, classic normal/slate layout.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSettings({ smmEnableColorTheme: settings.smmEnableColorTheme === false ? true : false })}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 select-none",
                            settings.smmEnableColorTheme !== false ? "bg-blue-600" : "bg-slate-800"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              settings.smmEnableColorTheme !== false ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400">
                          Current Style Mode:
                        </span>
                        <span className={cn(
                          "font-black font-mono text-[10px] uppercase tracking-wide",
                          settings.smmEnableColorTheme !== false ? "text-indigo-400" : "text-slate-400"
                        )}>
                          {settings.smmEnableColorTheme !== false ? "✨ Premium Color Design (Neon / Multi-Glow)" : "📦 Clean Slate Normal Design"}
                        </span>
                      </div>
                    </div>

                    {/* Supported Payment Options Card */}
                    <div className="bg-[#0d0f14] border border-slate-800/80 rounded-2xl p-5">
                      <div className="mb-4 text-left">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Payment Configuration</span>
                        <h3 className="text-xs font-bold text-slate-205 mt-0.5 uppercase tracking-tight">Deposit Gateways</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Toggle active deposit pipelines available in SMM Panel.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
                        {[
                          { key: 'bkash', label: 'bKash Deposit' },
                          { key: 'nagad', label: 'Nagad Wallet' },
                          { key: 'rocket', label: 'Rocket Mobile' },
                          { key: 'card', label: 'Cards (Visa/Master)' },
                          { key: 'crypto', label: 'Crypto Gateways' },
                        ].map((gateway) => {
                          const activeMethods = settings.smmPaymentMethods || [];
                          const isEnabled = activeMethods.includes(gateway.key);
                          return (
                            <button
                              key={gateway.key}
                              onClick={() => {
                                const nextMethods = isEnabled 
                                  ? activeMethods.filter(k => k !== gateway.key)
                                  : [...activeMethods, gateway.key];
                                updateSettings({ smmPaymentMethods: nextMethods });
                              }}
                              className={cn(
                                "p-4 border rounded-2xl flex flex-col items-center gap-3 transition-all text-center select-none",
                                isEnabled
                                  ? `bg-[#08090d] border-blue-500 text-white shadow shadow-blue-500/10 ring-1 ring-blue-500/20`
                                  : "bg-[#0d0f14]/40 border-slate-900 text-slate-600 hover:text-slate-400"
                              )}
                            >
                              <div className={cn(
                                "w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-800 relative",
                                isEnabled ? "bg-blue-500" : "bg-slate-950"
                              )}>
                                {isEnabled && <Check size={8} className="text-white font-bold" />}
                              </div>
                              <span className="text-xs font-bold tracking-tight">{gateway.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SMM TOAST CORNER NOTIFICATION */}
          {smmToast && (
            <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl animate-bounce text-left max-w-sm">
              <div className={cn(
                "p-2 rounded-xl shrink-0",
                smmToast.type === 'success' ? "bg-emerald-500/10 text-emerald-400" : smmToast.type === 'error' ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
              )}>
                {smmToast.type === 'success' ? <Check size={16} /> : <Shield size={16} />}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {smmToast.type === 'success' ? 'Task Succeeded' : smmToast.type === 'error' ? 'Task Failure' : 'SMM Provider Alert'}
                </p>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed font-sans">{smmToast.message}</p>
              </div>
            </div>
          )}

          {/* SMM API SERVICE FETCHING & IMPORT WIZARD */}
          {activeImportProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
              <div className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-up text-left">
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-slate-800/60 flex justify-between items-center bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">SMM Service Import Wizard</h3>
                      <h4 className="text-sm font-bold text-white mt-0.5">External SMM Provider: <span className="text-blue-400">{activeImportProvider.name}</span></h4>
                    </div>
                  </div>
                  {importStep !== 'connecting' && importStep !== 'loading' && importStep !== 'importing' && (
                    <button 
                      onClick={() => setActiveImportProvider(null)} 
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 h-[70vh] overflow-y-auto custom-scrollbar bg-[#0b0c10]">
                  
                  {/* Phase 1 & 2: Launching/Querying States */}
                  {(importStep === 'connecting' || importStep === 'loading') && (
                    <div className="h-full flex flex-col items-center justify-center space-y-5 py-12 text-center select-none font-sans">
                      <div className="relative flex items-center justify-center w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/10" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-450 animate-spin" />
                        <Cpu className="text-blue-400 animate-pulse" size={24} />
                      </div>
                      <div className="space-y-2 max-w-md">
                        <h4 className="text-sm font-extrabold text-white tracking-wide">
                          {importStep === 'connecting' ? 'Initiating API Connection Handshake...' : 'Authorized. Synchronizing Services Schema...'}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {importStep === 'connecting' 
                            ? `Authenticating connection token with ${activeImportProvider.apiUrl}/api/v2 using current Authorization Key credentials...`
                            : 'Querying service catalogue endpoints from foreign catalog. Analyzing individual SMM IDs, custom structures and standard provider rate ranges...'}
                        </p>
                      </div>
                      <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className={cn(
                          "h-full bg-blue-500 transition-all duration-1000",
                          importStep === 'connecting' ? "w-1/3" : "w-4/5"
                        )} />
                      </div>
                    </div>
                  )}

                  {/* Phase 3: Selection Workspace */}
                  {importStep === 'ready' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
                      
                      {/* Left Block: Markup Markup Multipliers and configurations */}
                      <div className="lg:col-span-3 bg-slate-900/60 border border-slate-850 p-4.5 rounded-2xl space-y-4 text-xs h-fit self-start">
                        <div>
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] pb-1.5 border-b border-slate-800">
                            Profit Margins Config
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            Configure standard price profit margins. Your user price = original provider cost × profit markup multiplier.
                          </p>
                        </div>

                        <div className="space-y-3 p-3 bg-[#08090d] border border-slate-850 rounded-xl">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Profit Margin Percent (%)</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="1000"
                                value={Math.round((parseFloat(importMarkup || '1.0') - 1.0) * 100)}
                                onChange={(e) => {
                                  const pct = parseFloat(e.target.value);
                                  if (!isNaN(pct) && pct >= 0) {
                                    setImportMarkup((1.0 + pct / 100).toFixed(4));
                                  } else {
                                    setImportMarkup('1.0000');
                                  }
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono font-bold"
                              />
                              <span className="text-[10px] text-slate-500 font-bold shrink-0">%</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Or Price Multiplier</label>
                            <input
                              type="number"
                              step="0.05"
                              min="1.0"
                              max="10.0"
                              value={importMarkup}
                              onChange={(e) => {
                                const val = e.target.value;
                                setImportMarkup(val);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono font-bold"
                            />
                          </div>

                          <div className="text-[9px] text-right text-emerald-400 font-bold font-mono">
                            Profit: +{Math.round((parseFloat(importMarkup || '1.0') - 1.0) * 100)}%
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-850">
                          <h5 className="font-black text-slate-450 uppercase tracking-widest text-[9px] leading-none">Catalog Filtering</h5>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Search Name</label>
                            <input
                              type="text"
                              placeholder="Search API service..."
                              value={apiSearchQuery}
                              onChange={(e) => setApiSearchQuery(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 outline-none focus:border-blue-500 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Category Group</label>
                            <select
                              value={apiCatFilter}
                              onChange={(e) => setApiCatFilter(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 outline-none cursor-pointer pb-1"
                            >
                              <option value="All">All Categories ({apiServices.length})</option>
                              {Array.from(new Set(apiServices?.map(s => s?.category))).filter(Boolean).map(c => {
                                const count = apiServices.filter(s => s.category === c).length;
                                return (
                                  <option key={c} value={c}>{c} ({count})</option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-600/5 border border-blue-500/10 rounded-xl text-[10px] text-slate-400 space-y-1">
                          <span className="font-bold text-blue-400">Handy hint:</span>
                          <p className="leading-relaxed">
                            Already imported SMM API service IDs will automatically merge and update prices, instead of creating duplicate records.
                          </p>
                        </div>
                      </div>

                      {/* Right Block: Dynamic Table list matches */}
                      <div className="lg:col-span-9 space-y-3 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            Showing <span className="text-white font-black">{
                              apiServices.filter(s => 
                                matchesFuzzyCategory(s.category, apiCatFilter) &&
                                (s.name.toLowerCase().includes(apiSearchQuery.toLowerCase()))
                              ).length
                            }</span> matching services available on API Provider.
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const matched = apiServices.filter(s => 
                                  matchesFuzzyCategory(s.category, apiCatFilter) &&
                                  (s.name.toLowerCase().includes(apiSearchQuery.toLowerCase()))
                                );
                                setSelectedApiSvcIds(matched.map(m => m.id));
                              }}
                              className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 font-sans tracking-wide"
                            >
                              Select All Matching
                            </button>
                            <span className="text-slate-700">|</span>
                            <button
                              onClick={() => setSelectedApiSvcIds([])}
                              className="text-[9px] font-black uppercase text-slate-450 hover:text-slate-350 font-sans tracking-wide"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>

                        <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/70 max-h-[45vh] overflow-y-auto custom-scrollbar flex-1">
                          {(() => {
                            const visibleApiServices = apiServices.filter(s => 
                              matchesFuzzyCategory(s.category, apiCatFilter) &&
                              (s.name.toLowerCase().includes(apiSearchQuery.toLowerCase()))
                            );
                            const isAllVisibleChecked = visibleApiServices.length > 0 && 
                              visibleApiServices.every(s => selectedApiSvcIds.includes(s.id));
                            return (
                              <table className="w-full text-xs font-sans">
                                <thead className="bg-[#0e1015]/65 text-slate-500 text-[9px] font-black uppercase tracking-wider text-left sticky top-0 z-10 border-b border-slate-850">
                                  <tr>
                                    <th className="px-4 py-3 text-center w-12 sticky left-0 bg-slate-950 z-20">
                                      <input
                                        type="checkbox"
                                        checked={isAllVisibleChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const newlyAdded = visibleApiServices.map(s => s.id);
                                            setSelectedApiSvcIds(prev => {
                                              const next = [...prev];
                                              newlyAdded.forEach(id => {
                                                if (!next.includes(id)) next.push(id);
                                              });
                                              return next;
                                            });
                                          } else {
                                            const visibleIds = visibleApiServices.map(s => s.id);
                                            setSelectedApiSvcIds(prev => prev.filter(id => !visibleIds.includes(id)));
                                          }
                                        }}
                                        className="w-3.5 h-3.5 rounded border-slate-850 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                      />
                                    </th>
                                    <th className="px-3 py-3 w-16 text-center">ID</th>
                                    <th className="px-3 py-3">Service Details / Platform Category</th>
                                    <th className="px-3 py-3 text-right">Provider Price</th>
                                    <th className="px-3 py-3 text-right text-blue-450">Calculated User Price</th>
                                    <th className="px-4 py-3 text-center">Min/Max</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850/60 font-medium">
                                  {visibleApiServices.map((svc) => {
                                    const isChecked = selectedApiSvcIds.includes(svc.id);
                                    const userPrice = svc.originalPrice * (parseFloat(importMarkup) || 1.0);
                                    return (
                                      <tr 
                                        key={svc.id} 
                                        onClick={() => {
                                          if (isChecked) {
                                            setSelectedApiSvcIds(prev => prev.filter(id => id !== svc.id));
                                          } else {
                                            setSelectedApiSvcIds(prev => [...prev, svc.id]);
                                          }
                                        }}
                                        className={cn(
                                          "hover:bg-slate-900/40 cursor-pointer transition select-none text-[11px]",
                                          isChecked ? "bg-blue-600/5 text-slate-100" : "text-slate-400"
                                        )}
                                      >
                                        <td className="px-4 py-3 text-center">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            readOnly
                                            className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-900 text-blue-600 cursor-pointer pointer-events-none"
                                          />
                                        </td>
                                        <td className="px-3 py-3 text-center font-mono font-bold text-slate-500 text-[10px]">
                                          {svc.id}
                                        </td>
                                        <td className="px-3 py-3">
                                          <div className="font-bold text-slate-200">{svc.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                                          <span className="font-extrabold text-blue-400 uppercase tracking-wider">{svc.category}</span>
                                          <span className="text-slate-600">•</span>
                                          <span className="text-slate-500 font-medium">Class: {svc.quality}</span>
                                          <span className="text-slate-600">•</span>
                                          <span className="text-slate-500 font-medium">Refill: {svc.refill || "No Refill"}</span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-400">
                                        ${svc.originalPrice.toFixed(4)}
                                      </td>
                                      <td className="px-3 py-3 text-right font-mono font-black text-emerald-400 text-xs">
                                        ${userPrice.toFixed(4)}
                                      </td>
                                      <td className="px-4 py-3 text-center font-mono text-[10px] text-slate-500">
                                        {svc.min} / {svc.max}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>

                        {/* Actions overlay footer inside Wizard */}
                        <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                          <div className="text-slate-400 text-xs">
                            Selected <span className="text-white font-extrabold">{selectedApiSvcIds.length}</span> / {apiServices.length} services to import.
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveImportProvider(null)}
                              className="px-4 py-2 rounded-xl text-slate-450 hover:text-white hover:bg-slate-850 font-black text-xs transition"
                            >
                              Cancel Import
                            </button>
                            <button
                              disabled={selectedApiSvcIds.length === 0}
                              onClick={handleImportSelectedApiServices}
                              className={cn(
                                "px-5 py-2.5 rounded-xl font-black text-xs transition active:scale-95 shadow-lg",
                                selectedApiSvcIds.length > 0 
                                  ? "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/10 text-white" 
                                  : "bg-slate-850 text-slate-600 cursor-not-allowed"
                              )}
                            >
                              Import Selected SMM Services
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phase 4: Active Injection */}
                  {importStep === 'importing' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-16 text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 flex items-center justify-center animate-spin">
                        <div className="w-3 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white">Importing Selected Services...</h4>
                        <p className="text-[11px] text-slate-400">Generating unique database pointers, configuring profit margined cost scales and auto mapping API connections...</p>
                      </div>
                    </div>
                  )}

                  {/* Phase 5: Success landing */}
                  {importStep === 'completed' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-16 text-center font-sans">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center justify-center animate-bounce">
                        <Check size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase text-emerald-400 tracking-wider">Services Imported Successfully!</h4>
                        <p className="text-[11px] text-slate-400">Handshake finalized. New services have been loaded into your local catalogue and are ready to sell details.</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* SHARED MODALS OVERLAY FOR SMM ACTIONS */}
          {isSmmModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up text-left">
                    <div className="px-6 py-4.5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">{smmModalTitle}</h3>
                      <button onClick={() => setIsSmmModalOpen(false)} className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-850">
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                      {(smmModalType === 'add-service' || smmModalType === 'edit-service') ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Service Name</label>
                            <input
                              type="text"
                              value={smmFormName}
                              onChange={(e) => setSmmFormName(e.target.value)}
                              placeholder="e.g., instagram followers active"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Category</label>
                            <input
                              type="text"
                              list="admin-smm-categories"
                              value={smmFormCategory}
                              onChange={(e) => setSmmFormCategory(e.target.value)}
                              placeholder="e.g. Spotify, Discord, Instagram"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 mt-1 font-medium"
                            />
                            <datalist id="admin-smm-categories">
                              {Array.from(new Set([
                                'Instagram', 'Facebook', 'YouTube', 'TikTok', 'Twitter/X', 'Telegram', 'Spotify', 'LinkedIn', 'Discord', 'Website Traffic', 'Others',
                                ...smmServicesList.map(s => s.category)
                              ])).filter(Boolean).map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </datalist>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Quality Class</label>
                            <select
                              value={smmFormQuality}
                              onChange={(e) => setSmmFormQuality(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 mt-1 cursor-pointer font-medium"
                            >
                              {['Standard', 'Premium', 'VIP'].map(ql => (
                                <option key={ql} value={ql}>{ql}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Refill Status</label>
                            <input
                              type="text"
                              value={smmFormRefill}
                              onChange={(e) => setSmmFormRefill(e.target.value)}
                              placeholder="e.g. 30D Refill, Lifetime, No Refill"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-medium placeholder-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Base Price per 1k ($)</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={smmFormPrice}
                              onChange={(e) => setSmmFormPrice(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Speed speed delivery</label>
                            <input
                              type="text"
                              value={smmFormTime}
                              onChange={(e) => setSmmFormTime(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Minimum Order Qty</label>
                            <input
                              type="number"
                              value={smmFormMin}
                              onChange={(e) => setSmmFormMin(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Maximum Order Qty</label>
                            <input
                              type="number"
                              value={smmFormMax}
                              onChange={(e) => setSmmFormMax(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">SMM Provider API Connection</label>
                            <select
                              value={smmFormSvcProviderId}
                              onChange={(e) => setSmmFormSvcProviderId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 mt-1 cursor-pointer font-medium"
                            >
                              <option value="manual">Manual Execution (Fulfill Offline)</option>
                              {smmProviders.map(p => (
                                <option key={p.id} value={p.id.toString()}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Provider Service ID (API Match)</label>
                            <input
                              type="text"
                              value={smmFormSvcProviderServiceId}
                              onChange={(e) => setSmmFormSvcProviderServiceId(e.target.value)}
                              placeholder="e.g. 1024"
                              disabled={smmFormSvcProviderId === 'manual'}
                              className={cn(
                                "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold",
                                smmFormSvcProviderId === 'manual' && "opacity-40 cursor-not-allowed"
                              )}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Service Description</label>
                            <textarea
                              value={smmFormDesc}
                              rows={3}
                              onChange={(e) => setSmmFormDesc(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500 mt-1 resize-none custom-scrollbar font-medium"
                            />
                          </div>
                        </div>
                      ) : smmModalType === 'edit-order' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ordered Service</label>
                            <input
                              type="text"
                              value={smmFormName}
                              onChange={(e) => setSmmFormName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Order Status</label>
                            <select
                              value={smmFormStatus}
                              onChange={(e) => setSmmFormStatus(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 mt-1 capitalize cursor-pointer font-medium"
                            >
                              {['pending', 'processing', 'completed', 'cancelled', 'partial'].map(stt => (
                                <option key={stt} value={stt}>{stt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Quantity</label>
                            <input
                              type="number"
                              value={smmFormQty}
                              onChange={(e) => setSmmFormQty(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Target Social Media Link</label>
                            <input
                              type="text"
                              value={smmFormLink}
                              onChange={(e) => setSmmFormLink(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Amount Charged ($)</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={smmFormAmount}
                              onChange={(e) => setSmmFormAmount(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Provider API Order ID</label>
                            <input
                              type="text"
                              value={smmFormApiOrderId}
                              onChange={(e) => setSmmFormApiOrderId(e.target.value)}
                              placeholder="e.g. 5240321 (Empty if pending)"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                            />
                          </div>

                          {(() => {
                            const orderSvc = smmServicesList.find(s => s.id === selectedSmmItem?.serviceId || s.name === selectedSmmItem?.serviceName);
                            const provId = orderSvc?.providerId || smmFormApiProviderId;
                            const hasProvider = provId && provId !== 'manual';
                            const prov = smmProviders.find(p => p.id?.toString() === provId?.toString());
                            
                            if (hasProvider && prov) {
                              return (
                                <div className="sm:col-span-2 mt-2 bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-3.5">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-[10px] font-black uppercase tracking-wider text-violet-400">Live API Provider Integrated</h4>
                                      <p className="text-xs font-bold text-slate-100 mt-0.5">{prov.name}</p>
                                    </div>
                                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full">
                                      Match Svc Ref: #{orderSvc?.providerServiceId || 'None'}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    This catalog service is connected to a live SMM provider. You can securely place this order on their portal via core API or retrieve its live completion status.
                                  </p>

                                  <div className="flex flex-wrap gap-2.5 pt-1">
                                    <button
                                      type="button"
                                      disabled={isApiPlacingOrder || !orderSvc?.providerServiceId}
                                      onClick={handlePlaceOrderToProvider}
                                      className="px-3.5 py-1.5 rounded-lg bg-violet-650 hover:bg-violet-600 text-white text-[11px] font-bold uppercase tracking-tight duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-950/20 active:scale-95 flex items-center gap-1.5"
                                    >
                                      {isApiPlacingOrder ? (
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                      ) : "🚀"}
                                      Place to Provider SMM
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isApiPlacingOrder || !smmFormApiOrderId}
                                      onClick={handleCheckProviderStatus}
                                      className="px-3.5 py-1.5 rounded-lg bg-[#0e1017] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold uppercase tracking-tight duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center gap-1.5"
                                    >
                                      {isApiPlacingOrder ? (
                                        <span className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-300 rounded-full animate-spin"></span>
                                      ) : "🔄"}
                                      Retrieve Live Status
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      ) : smmModalType === 'edit-user' ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Name</label>
                            <input
                              type="text"
                              value={smmFormUserName}
                              onChange={(e) => setSmmFormUserName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
                            <input
                              type="email"
                              value={smmFormUserEmail}
                              onChange={(e) => setSmmFormUserEmail(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Interactive Balance ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={smmFormUserBalance}
                              onChange={(e) => setSmmFormUserBalance(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                            />
                          </div>
                        </div>
                      ) : (smmModalType === 'add-provider' || smmModalType === 'edit-provider') ? (
                        <div className="space-y-4 font-sans">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Provider Name</label>
                            <input
                              type="text"
                              value={smmFormProvName}
                              onChange={(e) => setSmmFormProvName(e.target.value)}
                              placeholder="e.g. SMM Experts"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">V2 API Endpoint URL</label>
                            <input
                              type="text"
                              value={smmFormProvUrl}
                              onChange={(e) => setSmmFormProvUrl(e.target.value)}
                              placeholder="https://provider-api.com/api/v2"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">API Key (Secure Access Token)</label>
                            <input
                              type="password"
                              value={smmFormProvKey}
                              onChange={(e) => setSmmFormProvKey(e.target.value)}
                              placeholder="SECRET_API_TOKEN_KEY"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono"
                            />
                          </div>
                           <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Service Status</label>
                            <select
                              value={smmFormProvStatus}
                              onChange={(e) => setSmmFormProvStatus(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 mt-1 cursor-pointer font-medium"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      ) : smmModalType === 'edit-gateway' ? (
                        <div className="space-y-4 font-sans">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Deposit Channel Title</span>
                            <input
                              type="text"
                              value={smmFormGatewayTitle}
                              onChange={(e) => setSmmFormGatewayTitle(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-bold"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Wallet Account / Address</label>
                              <input
                                type="text"
                                value={smmFormGatewayNumber}
                                onChange={(e) => setSmmFormGatewayNumber(e.target.value)}
                                placeholder="e.g., +8801700000000"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Transfer Category</label>
                              <input
                                type="text"
                                value={smmFormGatewayType}
                                onChange={(e) => setSmmFormGatewayType(e.target.value)}
                                placeholder="e.g. Personal / Merchant / TRC-20"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1 font-medium"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Funding Instructions for Visitors</label>
                            <textarea
                              value={smmFormGatewayInstructions}
                              rows={3}
                              onChange={(e) => setSmmFormGatewayInstructions(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-350 outline-none focus:border-blue-500 mt-1 resize-none custom-scrollbar font-medium"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="checkbox"
                              id="gateway-enabled-chk"
                              checked={smmFormGatewayEnabled}
                              onChange={(e) => setSmmFormGatewayEnabled(e.target.checked)}
                              className="w-4 h-4 bg-slate-950 rounded border-slate-800 text-blue-550 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="gateway-enabled-chk" className="text-[11px] text-slate-300 font-bold cursor-pointer select-none">
                              Publish deposit gateway pipeline live
                            </label>
                          </div>
                        </div>
                      ) : null}
                    </div>
 
                    <div className="px-6 py-4.5 border-t border-slate-800 flex justify-end gap-2.5 bg-slate-950">
                      <button
                        onClick={() => setIsSmmModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-850 font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (smmModalType === 'add-service' || smmModalType === 'edit-service') {
                            handleSaveSmmService();
                          } else if (smmModalType === 'edit-order') {
                            handleSaveSmmOrder();
                          } else if (smmModalType === 'edit-user') {
                            handleSaveSmmUser();
                          } else if (smmModalType === 'add-provider' || smmModalType === 'edit-provider') {
                            handleSaveSmmProvider();
                          } else if (smmModalType === 'edit-gateway') {
                            handleSaveSmmGateway();
                          }
                        }}
                        className="px-5 py-2 rounded-xl text-xs bg-blue-500 hover:bg-blue-600 text-white font-black transition shadow-lg shadow-blue-500/10 active:scale-95"
                      >
                        Save Configurations
                      </button>
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
                updateSettings({ visibleTools: ['tenmin-ai', 'qr', 'encryption', 'to-base64', 'bg-remover', 'auto-passport', 'video', 'dex-protector', 'lib-encryptor', 'apk-store', 'dih-movies', 'temp-mail', 'mobile-bypass', 'hosted-admin', 'dih-smm'] });
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
