import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, PlusCircle, List, ArrowDownToLine, Upload,
  CreditCard, Search, Link2, ChevronDown, CheckCircle2, 
  AlertCircle, RefreshCw, X, HelpCircle, Activity, Star, Menu, Trash2,
  TrendingUp, Users, CheckCircle, ExternalLink,
  Instagram, Facebook, Youtube, Twitter, Linkedin, Layers,
  Send, Globe, Music, MessageSquare, Video, Zap, FileText,
  Gamepad2, ShieldCheck, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAppSettings } from '../../hooks/useAppSettings';

interface SMMService {
  id: number;
  name: string;
  category: string;
  price: number;
  min: number;
  max: number;
  desc: string;
  time: string;
  quality: string;
  refill?: string;
  providerId?: string | number;
  providerServiceId?: string | number;
}

export function getCleanRefill(refill: any): string {
  if (refill === undefined || refill === null) return 'No Refill';
  const rawStr = String(refill).trim();
  const str = rawStr.toLowerCase();
  
  if (!str || str === '0' || str === 'false' || str.includes('no refill') || str.includes('non') || str === 'no' || str === 'na') {
    return 'No Refill';
  }
  
  if (str.includes('life') || str.includes('lifetime') || str.includes('permanent')) {
    return 'Lifetime Refill';
  }

  const numbersOnly = str.replace(/[^0-9]/g, '');
  if (numbersOnly && !str.includes('yes')) {
    return `Refill ${numbersOnly} Days`;
  }
  
  if (str === '1' || str === 'true' || str === 'yes') {
    return 'Yes Refill';
  }

  return rawStr;
}

interface SMMOrder {
  id: number;
  serviceId: number;
  serviceName: string;
  category: string;
  link: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'partial';
  startCount: number;
  remains: number;
  createdAt: string;
  apiOrderId?: string | number;
  error?: string;
  userEmail?: string;
  isQueued?: boolean;
}

const SERVICES: SMMService[] = [];

const CATEGORIES = [
  'All', 
  'Instagram', 
  'Facebook', 
  'YouTube', 
  'TikTok', 
  'Twitter/X', 
  'Telegram', 
  'Spotify', 
  'LinkedIn', 
  'Discord', 
  'Website Traffic', 
  'GAME',
  'Fb/Insta {OLD/ACC}',
  'Others'
];

interface DihSmmProps {
  currentUser?: any;
  onAuthClick?: () => void;
}

export default function DihSmm({ currentUser, onAuthClick }: DihSmmProps) {
  const { settings } = useAppSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle active user dynamic synchronization
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem('dihhub_user');
      if (savedUser && savedUser !== 'undefined') {
        try {
          const parsed = JSON.parse(savedUser);
          setLocalUser(parsed);
        } catch (e) {
          setLocalUser(null);
        }
      } else {
        setLocalUser(null);
      }
    };
    
    checkUser();
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  const userToUse = currentUser || localUser;
  const userEmail = userToUse?.email || 'contact@dihhub.site';
  const userName = userToUse?.name || 'Guest User';
  const isLoggedIn = !!userToUse;
  const isAdmin = userToUse?.role === 'admin' || userToUse?.isAdmin || userToUse?.email === 'rafcin.b';

  // Scoped localStorage keys
  const balanceKey = isLoggedIn ? `dih_smm_balance_${userEmail}` : `dih_smm_balance_guest`;
  const ordersKey = isLoggedIn ? `dih_smm_orders_v2_${userEmail}` : `dih_smm_orders_v2_guest`;

  // Dynamically managed services list
  const [servicesList, setServicesList] = useState<SMMService[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  // States
  const [balance, setBalance] = useState<number>(0.00);
  const [activePage, setActivePage] = useState<'dashboard' | 'new-order' | 'services' | 'orders' | 'deposit'>('dashboard');
  const [activeCat, setActiveCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [smmCatalogPage, setSmmCatalogPage] = useState<number>(1);
  const smmCatalogPerPage = 50;

  useEffect(() => {
    setSmmCatalogPage(1);
  }, [searchQuery, activeCat]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // New Order Form States
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [orderActivePlatform, setOrderActivePlatform] = useState<string>('All');
  const [orderActiveCat, setOrderActiveCat] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [ddSearchQuery, setDdSearchQuery] = useState<string>('');
  const [ddRefillFilter, setDdRefillFilter] = useState<'all' | 'refill' | 'non-refill'>('all');
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const [catDropdownOpen, setCatDropdownOpen] = useState<boolean>(false);
  const [catSearchQuery, setCatSearchQuery] = useState<string>('');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderLink, setOrderLink] = useState<string>('');
  const [orderQty, setOrderQty] = useState<string>('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderTab, setOrderTab] = useState<'single' | 'mass'>('single');
  const [massOrderText, setMassOrderText] = useState<string>('');

  // Deposit Form States
  const [depositType, setDepositType] = useState<'automatic' | 'manual'>('manual');
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card' | 'crypto' | 'upay' | 'binance' | 'usdt'>('bkash');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [senderDetails, setSenderDetails] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [depError, setDepError] = useState<string | null>(null);
  const [depSuccess, setDepSuccess] = useState<string | null>(null);

  // Dynamic Gateway configuration sync from admin settings
  const [manualGateways, setManualGateways] = useState<any[]>([]);
  const [localDeposits, setLocalDeposits] = useState<any[]>([]);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // Step-by-Step Payment Screenshot OCR Verification States
  const [depositStep, setDepositStep] = useState<'form' | 'verify'>('form');
  const [depositScreenshot, setDepositScreenshot] = useState<string | null>(null);
  const [isVerifyingScreenshot, setIsVerifyingScreenshot] = useState<boolean>(false);
  const [verifyResponseMsg, setVerifyResponseMsg] = useState<string | null>(null);

  // High quality image compression to prevent exceeding localStorage quota (resizes to 800px width max)
  const resizeAndCompressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  // Dynamically map SERVICES and scale by multiplier
  const activeServices = useMemo(() => {
    return Array.isArray(servicesList)
      ? servicesList.map(s => {
          const priceVal = (Number(s?.price) || 0.0) * (settings.smmPriceMultiplier || 1.0);
          return {
            ...s,
            name: String(s?.name || `Service #${s?.id || ''}`),
            category: String(s?.category || s?.group || 'Others'),
            price: priceVal,
            min: Number(s?.min) || 50,
            max: Number(s?.max) || 100000
          };
        })
      : [];
  }, [servicesList, settings.smmPriceMultiplier]);

  // Dynamic categories configured from admin dashboard
  const mappedCategories = useMemo(() => {
    let list = [
      'All', 
      'Instagram', 
      'Facebook', 
      'YouTube', 
      'TikTok', 
      'Twitter/X', 
      'Telegram', 
      'Spotify', 
      'LinkedIn', 
      'Discord', 
      'Website Traffic', 
      'GAME',
      'Fb/Insta {OLD/ACC}',
      'Others'
    ];

    if (settings.smmShortcuts && typeof settings.smmShortcuts === 'string') {
      try {
        const custom = settings.smmShortcuts.split(',').map(s => s.trim()).filter(Boolean);
        if (custom.length > 0) {
          if (!custom.includes('All')) {
            custom.unshift('All');
          }
          list = custom;
        }
      } catch (e) {
        // Fallback
      }
    }

    // Filter out or inject GAME and Fb/Insta {OLD/ACC} depending on admin configurations
    if (settings.smmEnableGameShortcut === false) {
      list = list.filter(item => item.toLowerCase() !== 'game' && item.toLowerCase() !== 'games');
    } else {
      const normalizedCurrent = list.map(item => item.toLowerCase());
      if (!normalizedCurrent.includes('game') && !normalizedCurrent.includes('games')) {
        const othersIdx = list.findIndex(item => item.toLowerCase() === 'others');
        if (othersIdx !== -1) {
          list.splice(othersIdx, 0, 'GAME');
        } else {
          list.push('GAME');
        }
      }
    }

    if (settings.smmEnableFbInstaShortcut === false) {
      list = list.filter(item => item.toLowerCase() !== 'fb/insta {old/acc}' && item.toLowerCase() !== 'fb/insta [old/acc]');
    } else {
      const normalizedCurrent = list.map(item => item.toLowerCase());
      if (!normalizedCurrent.includes('fb/insta {old/acc}') && !normalizedCurrent.includes('fb/insta [old/acc]')) {
        const othersIdx = list.findIndex(item => item.toLowerCase() === 'others');
        if (othersIdx !== -1) {
          list.splice(othersIdx, 0, 'Fb/Insta {OLD/ACC}');
        } else {
          list.push('Fb/Insta {OLD/ACC}');
        }
      }
    }

    return list;
  }, [settings?.smmShortcuts, settings?.smmEnableGameShortcut, settings?.smmEnableFbInstaShortcut]);

  const serviceMatchesPlatform = (s: any, platform: string) => {
    if (!platform || !s) return false;
    const plat = platform.toLowerCase();
    if (plat === 'all' || plat.includes('every')) return true;

    const sName = (s.name || '').toLowerCase();
    const sCat = (s.category || '').toLowerCase();

    const isInstagram = sName.includes('instagram') || sName.includes('ig ') || sName.includes('ig-') || sCat.includes('instagram') || sCat.includes('ig ');
    const isFacebook = sName.includes('facebook') || sName.includes('fb') || sName.includes('fanpage') || sCat.includes('facebook') || sCat.includes('fb') || sCat.includes('fanpage');
    const isYoutube = sName.includes('youtube') || sName.includes('yt ') || sName.includes('yt-') || sCat.includes('youtube') || sCat.includes('yt ');
    const isTiktok = sName.includes('tiktok') || sCat.includes('tiktok');
    const isTwitter = sName.includes('twitter') || sName.includes('x.') || sName === 'x' || sName.includes('rt ') || sCat.includes('twitter') || sCat.includes('x.') || sCat === 'x' || sCat.includes('rt ');
    const isTelegram = sName.includes('telegram') || sName.includes('tg ') || sName.includes('tg-') || sCat.includes('telegram') || sCat.includes('tg ');
    const isSpotify = sName.includes('spotify') || sCat.includes('spotify');
    const isLinkedin = sName.includes('linkedin') || sCat.includes('linkedin');
    const isDiscord = sName.includes('discord') || sCat.includes('discord');
    const isTraffic = (sName.includes('traffic') || sName.includes('website') || sName.includes('visitor') || sName.includes('seo') || sCat.includes('traffic') || sCat.includes('website') || sCat.includes('visitor') || sCat.includes('seo')) && !isInstagram && !isFacebook && !isYoutube && !isTiktok && !isTwitter && !isTelegram && !isSpotify && !isLinkedin && !isDiscord;
    const isGame = sName.includes('game') || sName.includes('hack') || sName.includes('pubg') || sName.includes('free fire') || sName.includes('freefire') || sName.includes('clash') || sName.includes('gaming') || sName.includes('diamonds') || sName.includes('mlbb') || sName.includes('recharge') || sCat.includes('game') || sCat.includes('hack') || sCat.includes('pubg') || sCat.includes('free fire') || sCat.includes('freefire') || sCat.includes('gaming') || sCat.includes('diamonds') || sCat.includes('mlbb') || sCat.includes('recharge');
    const isOldAcc = sName.includes('{old/acc}') || sName.includes('old account') || sName.includes('old acc') || sName.includes('acc}') || sCat.includes('{old/acc}') || sCat.includes('old account') || sCat.includes('old acc') || sCat.includes('acc}');

    if (plat === 'instagram') return isInstagram;
    if (plat === 'facebook') return isFacebook;
    if (plat === 'youtube') return isYoutube;
    if (plat === 'tiktok') return isTiktok;
    if (plat === 'twitter/x' || plat === 'twitter' || plat === 'x') return isTwitter;
    if (plat === 'telegram') return isTelegram;
    if (plat === 'spotify') return isSpotify;
    if (plat === 'linkedin') return isLinkedin;
    if (plat === 'discord') return isDiscord;
    if (plat.includes('traffic') || plat.includes('website')) return isTraffic;
    if (plat === 'game' || plat === 'games' || plat === 'game hacks') return isGame;
    if (plat === 'fb/insta {old/acc}' || plat.includes('old') || plat.includes('acc') || plat.includes('{old/acc}')) return isOldAcc;

    if (plat === 'others') {
      return !isInstagram && !isFacebook && !isYoutube && !isTiktok && !isTwitter && !isTelegram && !isSpotify && !isLinkedin && !isDiscord && !isTraffic && !isGame && !isOldAcc;
    }

    return sName.includes(plat) || sCat.includes(plat);
  };

  const serviceCategoryBelongsToPlatform = (serviceCategory: string, platform: string) => {
    if (!serviceCategory || !platform) return false;
    const plat = platform.toLowerCase();
    
    if (plat === 'all' || plat.includes('every')) return true;

    const sCat = serviceCategory.toLowerCase();
    
    if (plat === 'instagram') return sCat.includes('instagram') || sCat.includes('ig ') || sCat.includes('ig-');
    if (plat === 'facebook') return sCat.includes('facebook') || sCat.includes('fb') || sCat.includes('fanpage') || sCat.includes('meta');
    if (plat === 'youtube') return sCat.includes('youtube') || sCat.includes('yt ') || sCat.includes('yt-');
    if (plat === 'tiktok') return sCat.includes('tiktok');
    if (plat === 'twitter/x' || plat === 'twitter' || plat === 'x') {
      return sCat.includes('twitter') || sCat.includes('x.') || sCat === 'x' || sCat.includes('rt ') || sCat.includes('tweet');
    }
    if (plat === 'telegram') return sCat.includes('telegram') || sCat.includes('tg ') || sCat.includes('tg-');
    if (plat === 'spotify') return sCat.includes('spotify');
    if (plat === 'linkedin') return sCat.includes('linkedin');
    if (plat === 'discord') return sCat.includes('discord');
    if (plat.includes('traffic') || plat.includes('website')) {
      const isOtherPlat = sCat.includes('instagram') || sCat.includes('ig ') || sCat.includes('ig-') ||
                          sCat.includes('facebook') || sCat.includes('fb') || sCat.includes('fanpage') || sCat.includes('meta') ||
                          sCat.includes('youtube') || sCat.includes('yt ') || sCat.includes('yt-') ||
                          sCat.includes('tiktok') ||
                          sCat.includes('twitter') || sCat.includes('x.') || sCat === 'x' || sCat.includes('rt ') || sCat.includes('tweet') ||
                          sCat.includes('telegram') || sCat.includes('tg ') || sCat.includes('tg-') ||
                          sCat.includes('spotify') ||
                          sCat.includes('linkedin') ||
                          sCat.includes('discord');
      if (isOtherPlat) return false;
      return sCat.includes('traffic') || sCat.includes('website') || sCat.includes('visitor') || sCat.includes('seo');
    }
    if (plat === 'game' || plat === 'games' || plat === 'game hacks') {
      return sCat.includes('game') || sCat.includes('hack') || sCat.includes('pubg') || sCat.includes('free fire') || sCat.includes('freefire') || sCat.includes('gaming') || sCat.includes('diamonds') || sCat.includes('mlbb') || sCat.includes('recharge');
    }
    if (plat === 'fb/insta {old/acc}' || plat.includes('old') || plat.includes('acc') || plat.includes('{old/acc}')) {
      return sCat.includes('old') || sCat.includes('acc') || sCat.includes('{old/acc}');
    }
    
    // Fallback: Dynamically test if any active service inside this category belongs to target platform
    const hasMatchingSvc = activeServices.some(s => s.category === serviceCategory && serviceMatchesPlatform(s, platform));
    if (hasMatchingSvc) return true;

    if (plat === 'others') {
      const known = ['instagram', 'facebook', 'fb', 'youtube', 'yt ', 'tiktok', 'twitter', 'x.', 'telegram', 'tg ', 'spotify', 'linkedin', 'discord', 'traffic', 'website', 'visitor', 'seo', 'game', 'hack', 'gaming', 'pubg', 'free fire', 'freefire', 'diamonds', 'mlbb', 'recharge', 'old', 'acc', '{old/acc}'];
      return !known.some(k => sCat.includes(k));
    }
    
    return sCat.includes(plat);
  };

  const orderFilteredServices = useMemo(() => {
    return activeServices.filter(s => {
      if (orderActiveCat === 'All') return true;
      return s.category === orderActiveCat;
    });
  }, [activeServices, orderActiveCat]);

  const filteredServicesForDropdown = useMemo(() => {
    let result = orderFilteredServices;
    if (ddSearchQuery) {
      const query = ddSearchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(query) || s.id.toString().includes(query));
    }
    if (ddRefillFilter === 'refill') {
      result = result.filter(s => s.refill && !s.refill.toLowerCase().includes('no') && !s.refill.toLowerCase().includes('non'));
    } else if (ddRefillFilter === 'non-refill') {
      result = result.filter(s => !s.refill || s.refill.toLowerCase().includes('no') || s.refill.toLowerCase().includes('non'));
    }
    return result;
  }, [orderFilteredServices, ddSearchQuery, ddRefillFilter]);

  useEffect(() => {
    if (settings.smmManualGateways && Array.isArray(settings.smmManualGateways) && settings.smmManualGateways.length > 0) {
      setManualGateways(settings.smmManualGateways);
      return;
    }
    const cached = localStorage.getItem('dih_smm_manual_gateways_v2');
    if (cached) {
      try {
        setManualGateways(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultGateways = [
        { id: 'bkash', title: 'bKash Merchant', numberOrAddress: '+8801835313433', type: 'Merchant', instructions: 'Send payment using bKash Merchant Pay, then submit your Transaction ID (TxID).', enabled: true, minDeposit: 5 },
        { id: 'nagad', title: 'Nagad Wallet', numberOrAddress: '+8801602469609', type: 'Personal', instructions: 'Send money to our Personal Nagad wallet, and put TxID above.', enabled: true, minDeposit: 5 },
        { id: 'upay', title: 'Upay Wallet', numberOrAddress: '+8801800005544', type: 'Personal', instructions: 'Transfer via Upay, submit the Reference or TxID.', enabled: false, minDeposit: 2.5 },
        { id: 'rocket', title: 'Rocket Mobile', numberOrAddress: '+8801500000000-1', type: 'Personal', instructions: 'Send money to Rocket wallet, enter target transaction details.', enabled: false, minDeposit: 2.5 },
        { id: 'card', title: 'Cards (Visa/Master)', numberOrAddress: 'contact@dihhub.site', type: 'Merchant Checkout Link', instructions: 'Submit request with the desired funding amount. Support will deliver a credit card payment checkout link.', enabled: true, minDeposit: 20 },
        { id: 'binance', title: 'Binance Pay ID', numberOrAddress: '495331860', type: 'Merchant Pay ID', instructions: 'Pay using your Binance App using Binance Pay ID. Provide Binance account nickname.', enabled: true, minDeposit: 2.5 },
        { id: 'usdt', title: 'USDT (BSC - BEP20)', numberOrAddress: '0x09cb303036f305407df1e74614fbd894b988cdd4', type: 'BSC Address', instructions: 'Send the exact USDT amount via BSC (BNB Smart Chain / BEP20) Network. Paste TxHash / TxID once done.', enabled: true, minDeposit: 2.5 }
      ];
      setManualGateways(defaultGateways);
    }
  }, [activePage, settings.smmManualGateways]);

  // Orders default list
  const [orders, setOrders] = useState<SMMOrder[]>([]);
  const [nextOrderId, setNextOrderId] = useState<number>(6);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync to/from localStorage for persistence
  useEffect(() => {
    const defaultServices = JSON.stringify(SERVICES);
    const syncData = () => {
      const cachedBalance = localStorage.getItem(balanceKey);
      const cachedOrders = localStorage.getItem(ordersKey);
      const cachedNextId = localStorage.getItem('dih_smm_next_id');
      const cachedServices = localStorage.getItem('dih_smm_services_v2');

      if (cachedBalance) {
        setBalance(parseFloat(cachedBalance));
      } else {
        if (isLoggedIn) {
          // If logged in, wait for server response to fetch real balance instead of defaulting to $50
          setBalance(0.00);
        } else {
          const initialBalance = 0.00;
          setBalance(initialBalance);
          localStorage.setItem(balanceKey, initialBalance.toFixed(2));
        }
      }

      if (cachedOrders) {
        try {
          const parsed = JSON.parse(cachedOrders);
          setOrders(prev => JSON.stringify(prev) !== cachedOrders ? parsed : prev);
        } catch (err) {
          console.error(err);
        }
      } else {
        setOrders([]);
      }

      if (cachedNextId) {
        setNextOrderId(parseInt(cachedNextId, 10));
      }

      if (cachedServices) {
        try {
          const parsed = JSON.parse(cachedServices);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((s: any) => {
              const idVal = Number(s.id) || 0;
              const nameVal = (s.name || `Service #${idVal}`).toString();
              const catVal = (s.category || s.group || 'Others').toString();
              const priceVal = Number(s.price) || 0.0;
              const minVal = Number(s.min) || 50;
              const maxVal = Number(s.max) || 100000;
              const descVal = (s.desc || '').toString();
              const timeVal = (s.time || '').toString();
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
            setServicesList(prev => JSON.stringify(prev) !== JSON.stringify(sanitized) ? sanitized : prev);
          } else {
            setServicesList(SERVICES);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        localStorage.setItem('dih_smm_services_v2', defaultServices);
        setServicesList(SERVICES);
      }

      // Load and sync user deposits
      const cachedDeps = localStorage.getItem('dih_smm_deposits_v2');
      if (cachedDeps) {
        try {
          const parsedDeps = JSON.parse(cachedDeps);
          if (Array.isArray(parsedDeps)) {
            setLocalDeposits(prev => JSON.stringify(prev) !== cachedDeps ? parsedDeps : prev);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setLocalDeposits([]);
      }
    };

    syncData();
    const interval = setInterval(syncData, 1000);
    window.addEventListener('storage', syncData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncData);
    };
  }, [balanceKey, ordersKey]);

  // Periodically fetch balance from server to stay 100% in sync
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchBalanceObj = async () => {
      try {
        const res = await fetch(`/api/smm/balance/${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
          localStorage.setItem(balanceKey, data.balance.toFixed(2));
          // Keep main dih_smm_balance key synchronized too so older components don't drift
          localStorage.setItem('dih_smm_balance', data.balance.toFixed(2));
        }
      } catch (err) {
        console.error("Failed to fetch balance from server:", err);
      }
    };

    fetchBalanceObj();
    const interval = setInterval(fetchBalanceObj, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn, userEmail, balanceKey]);

  // Periodic server synchronization to load any newly added/synced services, orders, or deposits from Admin
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        // 1. Services
        const resSvcs = await fetch(`/api/smm/services?t=${Date.now()}`);
        if (resSvcs.ok) {
          const svcs = await resSvcs.json();
          if (Array.isArray(svcs)) {
            localStorage.setItem('dih_smm_services_v2', JSON.stringify(svcs));
            setServicesList(svcs);
          }
        }
        
        // 2. Orders
        const resOrders = await fetch(`/api/smm/orders?t=${Date.now()}`);
        if (resOrders.ok) {
          const ordersVal = await resOrders.json();
          if (Array.isArray(ordersVal)) {
            localStorage.setItem(ordersKey, JSON.stringify(ordersVal));
            setOrders(ordersVal);
          }
        }

        // 3. Deposits
        const resDeps = await fetch(`/api/smm/deposits?t=${Date.now()}`);
        if (resDeps.ok) {
          const deps = await resDeps.json();
          if (Array.isArray(deps)) {
            localStorage.setItem('dih_smm_deposits_v2', JSON.stringify(deps));
            setLocalDeposits(deps);
          }
        }

        // 4. Providers
        const resProvs = await fetch('/api/smm/providers');
        if (resProvs.ok) {
          const provs = await resProvs.json();
          if (Array.isArray(provs)) {
            setProviders(provs);
          }
        }
      } catch (err) {
        console.error("Error fetching SMM data from server:", err);
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 10000); // sync every 10 seconds
    return () => clearInterval(interval);
  }, [ordersKey]);

  const updateBalance = (newBal: number) => {
    setBalance(newBal);
    localStorage.setItem(balanceKey, newBal.toFixed(2));
    localStorage.setItem('dih_smm_balance', newBal.toFixed(2));
    
    if (isLoggedIn) {
      // Sync update back to server in real-time
      fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, balance: newBal })
      }).catch(err => console.error("Error updating balance on server:", err));
    }
  };

  const setNextId = (id: number) => {
    setNextOrderId(id);
    localStorage.setItem('dih_smm_next_id', id.toString());
  };

  const saveOrders = async (updatedOrders: SMMOrder[]) => {
    setOrders(updatedOrders);
    localStorage.setItem(ordersKey, JSON.stringify(updatedOrders));
    try {
      const res = await fetch('/api/smm/orders');
      let globalOrders = [];
      if (res.ok) {
        globalOrders = await res.json();
      }
      if (!Array.isArray(globalOrders)) globalOrders = [];
      const mergedOrders = [...globalOrders];
      updatedOrders.forEach(uo => {
        const idx = mergedOrders.findIndex(go => go.id === uo.id);
        if (idx !== -1) {
          mergedOrders[idx] = uo;
        } else {
          mergedOrders.push(uo);
        }
      });
      await fetch('/api/smm/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedOrders)
      });
    } catch (e) {
      console.error("Error syncing orders with server:", e);
    }
  };

  const saveDeposits = async (updatedDeps: any[]) => {
    setLocalDeposits(updatedDeps);
    localStorage.setItem('dih_smm_deposits_v2', JSON.stringify(updatedDeps));
    try {
      const res = await fetch('/api/smm/deposits');
      let globalDeps = [];
      if (res.ok) {
        globalDeps = await res.json();
      }
      if (!Array.isArray(globalDeps)) globalDeps = [];
      const mergedDeps = [...globalDeps];
      updatedDeps.forEach(ud => {
        const idx = mergedDeps.findIndex(gd => gd.id === ud.id);
        if (idx !== -1) {
          mergedDeps[idx] = ud;
        } else {
          mergedDeps.push(ud);
        }
      });
      await fetch('/api/smm/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedDeps)
      });
    } catch (e) {
      console.error("Error syncing deposits with server:", e);
    }
  };

  const getGatewayBrandInfo = (gateId: string, defaultName: string, logoUrl?: string) => {
    const id = (gateId || '').trim().toLowerCase();
    const title = (defaultName || '').trim().toLowerCase();

    const isBkash = id.includes('bkash') || title.includes('bkash');
    const isNagad = id.includes('nagad') || title.includes('nagad');
    const isUpay = id.includes('upay') || title.includes('upay');
    const isRocket = id.includes('rocket') || title.includes('rocket');
    const isCard = id.includes('card') || title.includes('card') || title.includes('visa') || title.includes('master');
    const isBinance = id.includes('binance') || id.includes('binace') || title.includes('binance') || title.includes('binace');
    const isUsdt = id.includes('usdt') || id.includes('tether') || title.includes('usdt') || title.includes('tether');

    let baseColorClass = '';
    if (isBkash) {
      baseColorClass = selectedMethod === 'bkash'
        ? 'bg-pink-600/10 text-pink-400 border-pink-500 shadow-lg shadow-pink-600/15'
        : 'border-[#1e2336] bg-pink-500/5 text-pink-400 hover:text-white hover:bg-pink-550/10 hover:border-pink-500/30';
    } else if (isNagad) {
      baseColorClass = selectedMethod === 'nagad'
        ? 'bg-orange-600/10 text-orange-400 border-orange-500 shadow-lg shadow-orange-600/15'
        : 'border-[#1e2336] bg-orange-500/5 text-orange-400 hover:text-white hover:bg-orange-550/10 hover:border-orange-500/30';
    } else if (isUsdt) {
      baseColorClass = selectedMethod === 'usdt'
        ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-600/15'
        : 'border-[#1e2336] bg-emerald-500/5 text-emerald-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30';
    } else {
      baseColorClass = selectedMethod === gateId
        ? 'bg-slate-700/20 text-white border-slate-600 shadow-md'
        : 'border-[#1e2336] bg-[#141720]/50 text-slate-400 hover:text-white hover:border-[#2d3748]';
    }

    if (logoUrl && logoUrl.trim() !== '') {
      return {
        label: defaultName || gateId,
        logo: (
          <img 
            src={logoUrl} 
            alt={defaultName} 
            className="w-full h-full object-contain rounded" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ),
        colorClass: baseColorClass || (selectedMethod === gateId
          ? 'bg-blue-600/10 text-blue-400 border-blue-500 shadow-lg shadow-blue-600/15'
          : 'border-[#1e2336] bg-[#141720]/50 text-slate-400 hover:text-white hover:border-[#2d3748]')
      };
    }

    if (isBkash) {
      return {
        label: 'bKash',
        logo: (
          <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#E2125A"/>
            <g transform="translate(10, 8) scale(0.8)">
              {/* Authentic bKash origami bird */}
              <path d="M 45 42 L 20 54 L 38 72 Z" fill="#FFFFFF" fillOpacity="0.9" />
              <path d="M 45 42 L 38 72 L 58 78 Z" fill="#FFFFFF" />
              <path d="M 45 42 L 58 78 L 65 52 Z" fill="#FFFFFF" fillOpacity="0.95" />
              <path d="M 45 42 L 65 52 L 58 22 L 45 42 Z" fill="#FFFFFF" fillOpacity="0.85" />
              <path d="M 65 52 L 85 45 L 75 35 Z" fill="#FFFFFF" />
              <path d="M 85 45 L 82 48 L 75 35 Z" fill="#FFFFFF" fillOpacity="0.9" />
              <path d="M 45 42 L 58 22 L 35 38 Z" fill="#FFFFFF" fillOpacity="0.75" />
              <path d="M 38 72 L 20 75 L 58 78 Z" fill="#FFFFFF" fillOpacity="0.85" />
            </g>
            <text x="50" y="86" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="0.02em">bKash</text>
          </svg>
        ),
        colorClass: selectedMethod === 'bkash'
          ? 'bg-pink-600/10 text-pink-400 border-pink-500 shadow-lg shadow-pink-600/15'
          : 'border-[#1e2336] bg-pink-500/5 text-pink-400 hover:text-white hover:bg-pink-550/10 hover:border-pink-500/30'
      };
    }
    if (isNagad) {
      return {
        label: 'Nagad',
        logo: (
          <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nagadRealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F15A22" />
                <stop offset="100%" stopColor="#D8232A" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="22" fill="url(#nagadRealGrad)"/>
            <g transform="translate(10, 8) scale(0.8)">
              {/* Authentic Nagad hand/sun swirl with silhouette */}
              <path d="M40,20 C55,10 75,18 80,35 C85,50 78,65 65,72 C50,80 30,75 22,60 C15,48 18,32 30,22 C40,15 55,18 62,28 C68,36 65,48 55,52 C48,55 38,50 36,42 C34,35 38,28 45,26 C50,25 55,28 56,32 C57,36 55,40 50,41" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" fill="none" />
              <path d="M48,34 C50,34 52,36 52,38 C52,40 50,42 48,42 C46,42 44,40 44,38 C44,36 46,34 48,34" fill="#FFFFFF" />
              <path d="M46,43 L52,41 L53,50 L47,51 Z" fill="#FFFFFF" />
              <path d="M47,51 L43,62 L46,63 L49,53 L51,53 L54,62 L57,61 L53,51 Z" fill="#FFFFFF" />
              <path d="M42,43 L55,43" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="41" cy="45" r="2" fill="#FFFFFF" />
            </g>
            <text x="50" y="87" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="900" fontFamily="system-ui, -apple-system, 'Noto Sans Bengali', sans-serif">নগদ</text>
          </svg>
        ),
        colorClass: selectedMethod === 'nagad'
          ? 'bg-orange-500/10 text-orange-400 border-orange-500 shadow-lg shadow-orange-500/15'
          : 'border-[#1e2336] bg-orange-500/5 text-orange-400 hover:text-white hover:bg-orange-500/10 hover:border-orange-500/30'
      };
    }
    if (isUpay) {
      return {
        label: 'Upay',
        logo: (
          <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1"/>
            <circle cx="34" cy="34" r="8" fill="#FFC300"/>
            <circle cx="66" cy="34" r="8" fill="#0A79DF"/>
            <path d="M24 46 C24 64 35 73 50 73" stroke="#FFC300" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <path d="M50 73 C65 73 76 64 76 46" stroke="#0A79DF" strokeWidth="10" strokeLinecap="round" fill="none"/>
          </svg>
        ),
        colorClass: selectedMethod === 'upay'
          ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/15'
          : 'border-[#1e2336] bg-[#141720] text-slate-400 hover:text-white hover:border-blue-500/30'
      };
    }
    if (isRocket) {
      return {
        label: 'Rocket',
        logo: (
          <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#8C288E"/>
            <path d="M78 22 L22 52 L48 58 L78 22 Z" fill="#FFFFFF"/>
            <path d="M78 22 L48 58 L54 78 L78 22 Z" fill="#E1BEE7" fillOpacity="0.95"/>
            <path d="M48 58 L38 68 L42 59 L48 58 Z" fill="#D1C4E9" fillOpacity="0.9"/>
            <path d="M15 78 C25 76 35 68 42 61" stroke="#E1BEE7" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M22 84 C30 82 38 76 44 70" stroke="#D1C4E9" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        colorClass: selectedMethod === 'rocket'
          ? 'bg-purple-600/10 text-purple-400 border-purple-500 shadow-lg shadow-purple-600/15'
          : 'border-[#1e2336] bg-[#141720] text-slate-400 hover:text-white hover:border-purple-500/30'
      };
    }
    if (isCard) {
      return {
        label: 'Card',
        logo: (
          <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#1C1F2A" stroke="#2A2E3D" strokeWidth="1.5"/>
            <rect x="18" y="32" width="64" height="40" rx="6" fill="#12141D" stroke="#3A4055" strokeWidth="1"/>
            <rect x="26" y="44" width="11" height="9" rx="1.5" fill="#ECC94B"/>
            <circle cx="59" cy="52" r="10" fill="#EB001B"/>
            <circle cx="67" cy="52" r="10" fill="#F79E1B" fillOpacity="0.85"/>
            <line x1="18" y1="38" x2="82" y2="38" stroke="#3A4055" strokeWidth="1" />
          </svg>
        ),
        colorClass: selectedMethod === 'card'
          ? 'bg-blue-600/10 text-blue-400 border-blue-500 shadow-lg shadow-blue-600/15'
          : 'border-[#1e2336] bg-[#141720] text-slate-400 hover:text-white hover:border-blue-500/30'
      };
    }
    if (isBinance) {
      return {
        label: 'Binance',
        logo: (
          <svg viewBox="0 0 24 24" className="w-full h-full pointer-events-none rounded-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="5.5" fill="#12161A" stroke="#252930" strokeWidth="0.25"/>
            <g transform="translate(3.6, 3.6) scale(0.7)">
              <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z" fill="#F0B90B"/>
            </g>
          </svg>
        ),
        colorClass: selectedMethod === 'binance'
          ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/15'
          : 'border-[#1e2336] bg-[#141720] text-slate-400 hover:text-white hover:border-blue-500/30'
      };
    }
    if (isUsdt) {
      return {
        label: 'USDT',
        logo: (
          <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#26A17B"/>
            <circle cx="50" cy="50" r="40" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3, 3" fill="none" fillOpacity="0.1"/>
            <ellipse cx="50" cy="53" rx="25" ry="9" stroke="#FFFFFF" strokeWidth="4.5" fill="none"/>
            <rect x="44.5" y="32" width="11" height="34" fill="#FFFFFF"/>
            <rect x="29.5" y="27" width="41" height="8.5" rx="1.5" fill="#FFFFFF"/>
          </svg>
        ),
        colorClass: selectedMethod === 'usdt'
          ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-600/15'
          : 'border-[#1e2336] bg-emerald-500/5 text-emerald-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30'
      };
    }
    return {
      label: defaultName || gateId,
      logo: (
        <span className="text-xl">🏦</span>
      ),
      colorClass: selectedMethod === gateId
        ? 'bg-slate-700/20 text-white border-slate-600 shadow-md'
        : 'border-[#1e2336] bg-[#141720]/50 text-slate-400 hover:text-white hover:border-[#2d3748]'
    };
  };

  // Helper formats
  const fmt = (n: number) => n.toLocaleString();
  const fmtAmt = (n: number) => n.toFixed(2);

  const getBadgeClass = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'partial': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getQualityBadgeClass = (quality: string) => {
    switch(quality) {
      case 'Standard': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Premium': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'VIP': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === 'all' || c.includes('every')) return <Layers size={13} className="text-blue-500" />;
    if (c.includes('instagram')) return <Instagram size={13} className="text-pink-500" />;
    if (c.includes('facebook')) return <Facebook size={13} className="text-blue-500" />;
    if (c.includes('youtube')) return <Youtube size={13} className="text-red-500" />;
    if (c.includes('tiktok')) return <Video size={13} className="text-teal-400" />;
    if (c.includes('twitter') || c === 'x') return <Twitter size={13} className="text-sky-400" />;
    if (c.includes('telegram')) return <Send size={13} className="text-[#229ED9]" />;
    if (c.includes('spotify')) return <Music size={13} className="text-emerald-500" />;
    if (c.includes('linkedin')) return <Linkedin size={13} className="text-blue-600" />;
    if (c.includes('discord')) return <MessageSquare size={13} className="text-indigo-400" />;
    if (c.includes('traffic') || c.includes('website')) return <Globe size={13} className="text-emerald-400" />;
    if (c.includes('game') || c.includes('gaming') || c.includes('pubg') || c.includes('free fire')) return <Gamepad2 size={13} className="text-amber-500" />;
    if (c.includes('old/acc') || c.includes('old') || c.includes('acc') || c.includes('aged')) return <ShieldCheck size={13} className="text-cyan-400" />;
    return <Layers size={13} className="text-slate-400" />;
  };

  const navigate = (page: 'dashboard' | 'new-order' | 'services' | 'orders' | 'deposit', serviceId?: number) => {
    if (!isLoggedIn && (page === 'new-order' || page === 'orders' || page === 'deposit')) {
      onAuthClick?.();
      return;
    }
    setActivePage(page);
    setMobileMenuOpen(false);
    if (page === 'new-order' && serviceId) {
      setSelectedServiceId(serviceId);
      const s = activeServices.find(x => x.id === serviceId);
      if (s) {
        setOrderQty(s.min.toString());
        setOrderActiveCat(s.category);
      }
    }
    setOrderError(null);
    setOrderSuccess(null);
    setDepError(null);
    setDepSuccess(null);
    setDropdownOpen(false);
  };

  const deleteOrder = async (orderId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order permanently?");
    if (!confirmDelete) return;

    const updatedLocalOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedLocalOrders);
    localStorage.setItem(ordersKey, JSON.stringify(updatedLocalOrders));

    try {
      const res = await fetch('/api/smm/orders');
      if (res.ok) {
        const globalOrders = await res.json();
        if (Array.isArray(globalOrders)) {
          const updatedGlobalOrders = globalOrders.filter(o => o.id !== orderId);
          await fetch('/api/smm/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedGlobalOrders)
          });
        }
      }
    } catch (e) {
      console.error("Error deleting SMM order:", e);
    }
  };

  // Calculations
  const selectedService = activeServices.find(s => s.id === selectedServiceId);
  const currentQuantity = parseInt(orderQty) || 0;
  const currentTotal = selectedService ? (currentQuantity / 1000) * selectedService.price : 0;

  // Dynamic categories list from activeServices
  const uniqueOrderCategories = React.useMemo(() => {
    const cats = activeServices.map(s => s.category);
    return Array.from(new Set(cats)).filter(Boolean);
  }, [activeServices]);

  // Handle default selection when landing on new order directly or category changes
  useEffect(() => {
    if (activePage === 'new-order') {
      const currentSelected = activeServices.find(s => s.id === selectedServiceId);
      if (!currentSelected && uniqueOrderCategories.length > 0) {
        // Only run default auto-selection if we have no active platform set or are on 'All'
        if (orderActivePlatform === 'All') {
          const defaultCat = uniqueOrderCategories[0];
          setOrderActiveCat(defaultCat);
          
          // Auto-detect and sync top platform shortcut highlight
          const catLower = defaultCat.toLowerCase();
          let matchedPlat = 'All';
          if (catLower.includes('instagram') || catLower.includes('ig ')) matchedPlat = 'Instagram';
          else if (catLower.includes('facebook') || catLower.includes('fb') || catLower.includes('fanpage')) matchedPlat = 'Facebook';
          else if (catLower.includes('youtube') || catLower.includes('yt ')) matchedPlat = 'YouTube';
          else if (catLower.includes('tiktok')) matchedPlat = 'TikTok';
          else if (catLower.includes('twitter') || catLower.includes('x.') || catLower === 'x' || catLower.includes('rt ')) matchedPlat = 'Twitter/X';
          else if (catLower.includes('telegram') || catLower.includes('tg ')) matchedPlat = 'Telegram';
          else if (catLower.includes('spotify')) matchedPlat = 'Spotify';
          else if (catLower.includes('linkedin')) matchedPlat = 'LinkedIn';
          else if (catLower.includes('discord')) matchedPlat = 'Discord';
          else if (catLower.includes('traffic') || catLower.includes('website') || catLower.includes('visitor') || catLower.includes('seo')) matchedPlat = 'Website Traffic';
          else if (catLower.includes('game') || catLower.includes('hack') || catLower.includes('gaming') || catLower.includes('pubg') || catLower.includes('free fire') || catLower.includes('freefire') || catLower.includes('diamonds') || catLower.includes('mlbb') || catLower.includes('recharge')) matchedPlat = 'GAME';
          else if (catLower.includes('old') || catLower.includes('acc') || catLower.includes('{old/acc}')) matchedPlat = 'Fb/Insta {OLD/ACC}';
          setOrderActivePlatform(matchedPlat);

          const svcsOfCat = activeServices.filter(s => s.category === defaultCat);
          if (svcsOfCat.length > 0) {
            setSelectedServiceId(svcsOfCat[0].id);
            setOrderQty(svcsOfCat[0].min.toString());
          }
        }
      } else if (currentSelected) {
        if (orderActiveCat !== currentSelected.category) {
          setOrderActiveCat(currentSelected.category);
        }
      }
    }
  }, [activePage, uniqueOrderCategories, activeServices, selectedServiceId, orderActivePlatform]);

  // Auto-detect SMM platform from pasted Link URL
  useEffect(() => {
    if (!orderLink) return;
    const url = orderLink.toLowerCase();
    
    let detectedPlat: string | null = null;
    if (url.includes('instagram.com')) {
      detectedPlat = 'Instagram';
    } else if (url.includes('facebook.com') || url.includes('fb.com') || url.includes('fb.watch')) {
      detectedPlat = 'Facebook';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      detectedPlat = 'YouTube';
    } else if (url.includes('tiktok.com')) {
      detectedPlat = 'TikTok';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      detectedPlat = 'Twitter/X';
    } else if (url.includes('t.me') || url.includes('telegram.org') || url.includes('telegram.me')) {
      detectedPlat = 'Telegram';
    } else if (url.includes('spotify.com')) {
      detectedPlat = 'Spotify';
    } else if (url.includes('linkedin.com')) {
      detectedPlat = 'LinkedIn';
    } else if (url.includes('discord.gg') || url.includes('discord.com')) {
      detectedPlat = 'Discord';
    }
    
    if (detectedPlat && orderActivePlatform !== detectedPlat) {
      handlePlatformChange(detectedPlat);
    }
  }, [orderLink]);

  // Helpers for category icons/styling
  const getCategoryStyledName = (cat: string) => {
    if (!cat) return '';
    const c = cat.toLowerCase();
    
    let icon = '📦';
    let basePlatformName = '';
    
    if (c.includes('instagram')) { icon = '📷'; basePlatformName = 'Instagram'; }
    else if (c.includes('facebook')) { icon = '👥'; basePlatformName = 'Facebook'; }
    else if (c.includes('youtube')) { icon = '🎥'; basePlatformName = 'YouTube'; }
    else if (c.includes('tiktok')) { icon = '🎵'; basePlatformName = 'TikTok'; }
    else if (c.includes('twitter') || c === 'x') { icon = '🐦'; basePlatformName = 'Twitter/X'; }
    else if (c.includes('telegram')) { icon = '📢'; basePlatformName = 'Telegram'; }
    else if (c.includes('spotify')) { icon = '🎵'; basePlatformName = 'Spotify'; }
    else if (c.includes('linkedin')) { icon = '💼'; basePlatformName = 'LinkedIn'; }
    else if (c.includes('discord')) { icon = '💬'; basePlatformName = 'Discord'; }
    else if (c.includes('traffic') || c.includes('website')) { icon = '🌐'; basePlatformName = 'Website Traffic'; }
    else if (c.includes('game') || c.includes('hack') || c.includes('gaming') || c.includes('pubg') || c.includes('free fire') || c.includes('freefire') || c.includes('diamonds') || c.includes('mlbb') || c.includes('recharge')) { icon = '🎮'; basePlatformName = 'GAME'; }
    else if (c.includes('old') || c.includes('acc') || c.includes('{old/acc}')) { icon = '🔑'; basePlatformName = 'Fb/Insta {OLD/ACC}'; }
    
    if (basePlatformName) {
      if (cat.trim().toLowerCase() === basePlatformName.toLowerCase()) {
        return `${icon} ${basePlatformName}`;
      }
      
      let displaySuffix = cat;
      const regex = new RegExp(`^${basePlatformName}\\s*[-|:|\\s]*\\s*`, 'i');
      displaySuffix = displaySuffix.replace(regex, '').trim();
      
      if (displaySuffix) {
        return `${icon} ${basePlatformName} - ${displaySuffix}`;
      } else {
        return `${icon} ${basePlatformName}`;
      }
    }
    
    return `${icon} ${cat}`;
  };

  const handlePlatformChange = (platformName: string) => {
    setOrderActivePlatform(platformName);
    
    // Find categories of services for this platform
    const validCats = uniqueOrderCategories.filter(cat => 
      serviceCategoryBelongsToPlatform(cat, platformName)
    );
    
    if (validCats.length > 0) {
      const targetCat = validCats[0];
      setOrderActiveCat(targetCat);
      
      const svcsOfCat = activeServices.filter(s => s.category === targetCat);
      if (svcsOfCat.length > 0) {
        setSelectedServiceId(svcsOfCat[0].id);
        setOrderQty(svcsOfCat[0].min.toString());
      } else {
        setSelectedServiceId(null);
        setOrderQty('');
      }
    } else {
      const svcsOfPlat = activeServices.filter(s => serviceCategoryBelongsToPlatform(s.category, platformName));
      if (svcsOfPlat.length > 0) {
        setOrderActiveCat(svcsOfPlat[0].category);
        setSelectedServiceId(svcsOfPlat[0].id);
        setOrderQty(svcsOfPlat[0].min.toString());
      } else {
        setOrderActiveCat('Others');
        setSelectedServiceId(null);
        setOrderQty('');
      }
    }
  };

  const handleCategoryChange = (catName: string) => {
    setOrderActiveCat(catName);
    
    // Auto-detect and sync the active platform shortcut highlight based on the selected category's platform
    const catLower = catName.toLowerCase();
    let matchedPlat = 'All';
    if (catLower.includes('instagram') || catLower.includes('ig ')) {
      matchedPlat = 'Instagram';
    } else if (catLower.includes('facebook') || catLower.includes('fb') || catLower.includes('fanpage')) {
      matchedPlat = 'Facebook';
    } else if (catLower.includes('youtube') || catLower.includes('yt ')) {
      matchedPlat = 'YouTube';
    } else if (catLower.includes('tiktok')) {
      matchedPlat = 'TikTok';
    } else if (catLower.includes('twitter') || catLower.includes('x.') || catLower === 'x' || catLower.includes('rt ')) {
      matchedPlat = 'Twitter/X';
    } else if (catLower.includes('telegram') || catLower.includes('tg ')) {
      matchedPlat = 'Telegram';
    } else if (catLower.includes('spotify')) {
      matchedPlat = 'Spotify';
    } else if (catLower.includes('linkedin')) {
      matchedPlat = 'LinkedIn';
    } else if (catLower.includes('discord')) {
      matchedPlat = 'Discord';
    } else if (catLower.includes('traffic') || catLower.includes('website') || catLower.includes('visitor') || catLower.includes('seo')) {
      matchedPlat = 'Website Traffic';
    } else if (catLower.includes('game') || catLower.includes('hack') || catLower.includes('gaming') || catLower.includes('pubg') || catLower.includes('free fire') || catLower.includes('freefire') || catLower.includes('diamonds') || catLower.includes('mlbb') || catLower.includes('recharge')) {
      matchedPlat = 'GAME';
    } else if (catLower.includes('old') || catLower.includes('acc') || catLower.includes('{old/acc}')) {
      matchedPlat = 'Fb/Insta {OLD/ACC}';
    } else {
      matchedPlat = 'Others';
    }
    setOrderActivePlatform(matchedPlat);

    // Auto-select first service belonging to this exact category
    const svcsOfCat = activeServices.filter(s => s.category === catName);
    if (svcsOfCat.length > 0) {
      setSelectedServiceId(svcsOfCat[0].id);
      setOrderQty(svcsOfCat[0].min.toString());
    } else {
      setSelectedServiceId(null);
      setOrderQty('');
    }
  };

  const getAverageTimeText = (timeStr?: string, svcId?: number, categoryName?: string) => {
    const fallbackId = svcId || 7;
    const cat = (categoryName || '').toLowerCase();
    
    // Fallback categories speed pattern
    const getFallbackTime = () => {
      const seedVal = (fallbackId % 10) + 1; // 1 to 10
      if (cat.includes('like') || cat.includes('reaction')) {
        return `${seedVal * 3 + 2} minutes`; // 5 to 32 minutes
      }
      if (cat.includes('view') || cat.includes('play') || cat.includes('traffic')) {
        return `${seedVal * 2 + 1} minutes`; // 3 to 21 minutes
      }
      if (cat.includes('comment')) {
        const hrs = (seedVal * 0.4 + 1.2).toFixed(1);
        return `${hrs.endsWith('.0') ? parseInt(hrs) : hrs} hours`; // 1.6 to 5.2 hours
      }
      if (cat.includes('follower') || cat.includes('subscriber') || cat.includes('member')) {
        const hrs = (seedVal * 1.5 + 2).toFixed(1);
        return `${hrs.endsWith('.0') ? parseInt(hrs) : hrs} hours`; // 3.5 to 17 hours
      }
      const hrs = (seedVal * 2 + 3).toFixed(1);
      return `${hrs.endsWith('.0') ? parseInt(hrs) : hrs} hours`; // 5 to 23 hours
    };

    if (!timeStr) return getFallbackTime();

    const t = timeStr.trim().toLowerCase();
    
    // Check if it's already a well-formatted string with a precise value (like "2.5 hours" or "10 minutes") rather than a general range
    const isRange = t.includes('-') || t.includes('/') || t.includes('to');
    
    if (!isRange) {
      if (t === 'instant') {
        const seedVal = (fallbackId % 4) + 1; // 1 to 4
        return `${seedVal} minutes`;
      }
      // Return custom non-range string as is
      return timeStr;
    }

    // Is a range. Let's parse numbers from it!
    const numbers = t.match(/\d+/g);
    if (!numbers || numbers.length === 0) {
      return getFallbackTime();
    }

    const firstNum = parseFloat(numbers[0]);
    const secondNum = numbers[1] ? parseFloat(numbers[1]) : firstNum;
    
    // For range starting with 0, adjust starting low bound to be non-zero
    const low = firstNum === 0 ? secondNum * 0.1 : firstNum;
    const high = secondNum;
    
    // Seed-based deterministic interpolation
    const seedMultiplier = ((fallbackId * 17) % 100) / 100; // 0.0 to 0.99
    const calculatedValue = low + (high - low) * (0.3 + seedMultiplier * 0.6); // interp between 30% and 90% of range

    // Detect unit
    let unit = 'minutes';
    if (t.includes('day') || t.includes('dy')) {
      unit = 'days';
    } else if (t.includes('hour') || t.includes('hr') || t.includes('h')) {
      unit = 'hours';
    } else if (t.includes('minute') || t.includes('min') || t.includes('m')) {
      unit = 'minutes';
    } else {
      if (high <= 5) unit = 'days';
      else if (high <= 24) unit = 'hours';
    }

    if (unit === 'days') {
      const val = calculatedValue.toFixed(1);
      return `${val.endsWith('.0') ? parseInt(val) : val} days`;
    }
    if (unit === 'hours') {
      if (calculatedValue < 1.0) {
        return `${Math.round(calculatedValue * 60)} minutes`;
      }
      const val = calculatedValue.toFixed(1);
      return `${val.endsWith('.0') ? parseInt(val) : val} hours`;
    }
    
    return `${Math.max(1, Math.round(calculatedValue))} minutes`;
  };

  // Actions
  const handlePlaceOrder = () => {
    setOrderError(null);
    setOrderSuccess(null);
    
    if (!selectedService) {
      setOrderError('Please select a service.');
      return;
    }
    const link = orderLink.trim();
    if (!link) {
      setOrderError('Please enter a link.');
      return;
    }
    const qty = parseInt(orderQty) || 0;
    if (qty < selectedService.min || qty > selectedService.max) {
      setOrderError(`Quantity must be between ${fmt(selectedService.min)} and ${fmt(selectedService.max)}.`);
      return;
    }
    if (currentTotal > balance) {
      setOrderError('Insufficient balance. Redirecting to Add Funds...');
      setTimeout(() => navigate('deposit'), 1500);
      return;
    }

    const nextBal = balance - currentTotal;
    updateBalance(nextBal);

    const newOrder: SMMOrder = {
      id: nextOrderId,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      link: link,
      quantity: qty,
      amount: currentTotal,
      status: 'pending',
      startCount: 0,
      remains: qty,
      createdAt: new Date().toISOString().split('T')[0],
      userEmail: userEmail
    };

    const updatedOrdersList = [newOrder, ...orders];
    saveOrders(updatedOrdersList);
    setNextId(nextOrderId + 1);

    setOrderLink('');
    setOrderQty('');
    setOrderSuccess(`Order #${newOrder.id} placed locally. Connecting SMM Provider to deliver...`);

    // SMM Provider Real-Time Placement Proxy
    const provId = selectedService.providerId;
    const prov = providers.find(p => p.id?.toString() === provId?.toString());
    const providerBalance = prov ? (parseFloat(prov.balance) || 0) : 0;
    const providerCost = (qty / 1000) * (selectedService.originalPrice || selectedService.price * 0.7);
    const isProviderLowBalance = prov && providerBalance < providerCost;
    const hasRealApi = prov && prov.apiUrl && prov.apiUrl.trim() !== "" && !prov.apiUrl.toLowerCase().includes("example.com") && prov.apiKey && prov.apiKey.trim() !== "";

    if (isProviderLowBalance) {
      // SMM Provider has low balance! Queue it as pending instead of placing live
      const queuedOrders = updatedOrdersList.map(o => {
        if (o.id === newOrder.id) {
          return { ...o, error: `Queued: SMM Provider has insufficient funds. Will auto-retry.`, isQueued: true, status: 'pending' as const };
        }
        return o;
      });
      saveOrders(queuedOrders);
      setOrderSuccess(`Order #${newOrder.id} is queued as PENDING because SMM Provider ${prov.name} has insufficient balance. It will be placed automatically once funds are topped up.`);
      setOrderError(null);
    } else if (hasRealApi) {
      fetch('/api/admin/smm/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: prov.apiUrl,
          key: prov.apiKey,
          service: selectedService.providerServiceId || selectedService.id,
          link: link,
          quantity: qty
        })
      })
      .then(async (res) => {
        if (res.ok) {
          const apiData = await res.json();
          if (apiData.order) {
            // Success! Update order with apiOrderId and set status to processing
            const successOrders = updatedOrdersList.map(o => {
              if (o.id === newOrder.id) {
                return { ...o, apiOrderId: apiData.order, status: 'processing' as const };
              }
              return o;
            });
            saveOrders(successOrders);
            setOrderSuccess(`Order #${newOrder.id} successfully placed on provider! External Order ID: #${apiData.order}`);
          } else if (apiData.isLowBalance) {
            // Insufficient SMM balance reported by external SMM panel! Queue it as pending
            const queuedOrders = updatedOrdersList.map(o => {
              if (o.id === newOrder.id) {
                return { ...o, error: `Queued: SMM Provider reported insufficient funds. Will auto-retry.`, isQueued: true, status: 'pending' as const };
              }
              return o;
            });
            saveOrders(queuedOrders);
            setOrderSuccess(`Order #${newOrder.id} is queued as PENDING because the SMM Provider returned an insufficient balance error. It will be placed automatically once funds are topped up.`);
            setOrderError(null);
          } else if (apiData.error) {
            // Failed. Void order, mark as cancelled, refund balance
            const failedOrders = updatedOrdersList.map(o => {
              if (o.id === newOrder.id) {
                return { ...o, error: apiData.error, status: 'cancelled' as const };
              }
              return o;
            });
            saveOrders(failedOrders);
            updateBalance(balance); // Refund
            setOrderError(`SMM Provider Error: ${apiData.error}`);
            setOrderSuccess(null);
          } else {
            const unknownMsg = apiData.response || JSON.stringify(apiData);
            const failedOrders = updatedOrdersList.map(o => {
              if (o.id === newOrder.id) {
                return { ...o, error: `Invalid provider response: ${unknownMsg}`, status: 'cancelled' as const };
              }
              return o;
            });
            saveOrders(failedOrders);
            updateBalance(balance); // Refund
            setOrderError(`SMM Provider response was not structured: ${unknownMsg}`);
            setOrderSuccess(null);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData.isLowBalance) {
            // Queue on HTTP error indicating insufficient funds
            const queuedOrders = updatedOrdersList.map(o => {
              if (o.id === newOrder.id) {
                return { ...o, error: `Queued: SMM Provider has insufficient funds. Will auto-retry.`, isQueued: true, status: 'pending' as const };
              }
              return o;
            });
            saveOrders(queuedOrders);
            setOrderSuccess(`Order #${newOrder.id} is queued as PENDING because SMM Provider reported low balance. It will be placed automatically.`);
            setOrderError(null);
          } else {
            const failedOrders = updatedOrdersList.map(o => {
              if (o.id === newOrder.id) {
                return { ...o, error: errData.error || 'Server error placing order', status: 'cancelled' as const };
              }
              return o;
            });
            saveOrders(failedOrders);
            updateBalance(balance); // Refund
            setOrderError(`Provider failed to accept order: ${errData.error || 'Connection error'}`);
            setOrderSuccess(null);
          }
        }
      })
      .catch((err) => {
        const failedOrders = updatedOrdersList.map(o => {
          if (o.id === newOrder.id) {
            return { ...o, error: err.message, status: 'cancelled' as const };
          }
          return o;
        });
        saveOrders(failedOrders);
        updateBalance(balance); // Refund
        setOrderError(`Connection failed: ${err.message}`);
        setOrderSuccess(null);
      });
    } else {
      // Offline/Manual mock flow completes instantly
      setTimeout(() => {
        setOrderSuccess(`Order #${newOrder.id} placed successfully!`);
        setTimeout(() => setOrderSuccess(null), 4000);
      }, 1000);
    }
  };

  const handlePlaceMassOrder = () => {
    setOrderError(null);
    setOrderSuccess(null);
    
    const lines = massOrderText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setOrderError('Please enter mass order text.');
      return;
    }
    
    let processedCount = 0;
    let failedCount = 0;
    let errors: string[] = [];
    let nextId = nextOrderId;
    let currentBalance = balance;
    let newOrdersList: SMMOrder[] = [];
    
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 3) {
        failedCount++;
        errors.push(`Invalid format on line: "${line}". Expected: Service ID|Link|Qty`);
        continue;
      }
      
      const sId = parseInt(parts[0]);
      const link = parts[1];
      const qty = parseInt(parts[2]);
      
      if (isNaN(sId) || isNaN(qty)) {
        failedCount++;
        errors.push(`Invalid numbers on line: "${line}"`);
        continue;
      }
      
      const svc = activeServices.find(s => s.id === sId);
      if (!svc) {
        failedCount++;
        errors.push(`Service ID ${sId} not found`);
        continue;
      }
      
      if (qty < svc.min || qty > svc.max) {
        failedCount++;
        errors.push(`Qty ${qty} for Service #${sId} is out of bounds (${svc.min}-${svc.max})`);
        continue;
      }
      
      const rate = svc.price;
      const charge = (qty / 1000) * rate;
      
      if (charge > currentBalance) {
        failedCount++;
        errors.push(`Insufficient balance for Service #${sId} of qty ${qty} (Required: $${charge.toFixed(4)})`);
        continue;
      }
      
      currentBalance -= charge;
      
      const newOrder: SMMOrder = {
        id: nextId,
        serviceId: svc.id,
        serviceName: svc.name,
        category: svc.category,
        link: link,
        quantity: qty,
        amount: charge,
        status: 'pending',
        startCount: 0,
        remains: qty,
        createdAt: new Date().toISOString().split('T')[0],
        userEmail: userEmail
      };
      
      newOrdersList.push(newOrder);
      nextId++;
      processedCount++;
    }
    
    if (newOrdersList.length > 0) {
      updateBalance(currentBalance);
      saveOrders([...newOrdersList, ...orders]);
      setNextId(nextId);
    }
    
    setMassOrderText('');
    
    if (processedCount > 0 && failedCount === 0) {
      setOrderSuccess(`Successfully placed ${processedCount} orders!`);
    } else if (processedCount > 0 && failedCount > 0) {
      setOrderSuccess(`Placed ${processedCount} orders. Failed ${failedCount} orders. Check alert message.`);
      setOrderError(errors.slice(0, 3).join('\n'));
    } else {
      setOrderError(`Mass Order failed:\n` + errors.slice(0, 3).join('\n'));
    }
    
    setTimeout(() => {
      setOrderSuccess(null);
    }, 6000);
  };

  const handleInitiateDeposit = async () => {
    setDepError(null);
    setDepSuccess(null);

    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setDepError('Please enter a valid amount.');
      return;
    }

    // Enforce dynamic active gateway's minimum deposit limit
    const activeGate = manualGateways.find(g => g.id === selectedMethod);
    const minLimit = activeGate && activeGate.minDeposit !== undefined ? activeGate.minDeposit : 2.5;
    if (amt < minLimit) {
      setDepError(`Deposit amount must be at least $${minLimit.toFixed(2)} for ${activeGate?.title || 'this gateway'}.`);
      return;
    }

    // Clean spaces from transactionId and convert to uppercase for standard matching
    const cleanTxId = transactionId.replace(/\s+/g, '').trim();

    if (!cleanTxId) {
      setDepError('Please enter the manual Transaction ID (TxID) or Referer Hash.');
      return;
    }

    // Save cleaned version back
    setTransactionId(cleanTxId);

    // Advance to verification screenshot upload step
    setDepositStep('verify');
    setDepositScreenshot(null);
    setVerifyResponseMsg(null);
  };

  const handleCompleteDeposit = async () => {
    if (!depositScreenshot) {
      setDepError('Please upload/provide a payment confirmation screenshot (SS).');
      return;
    }

    setIsVerifyingScreenshot(true);
    setDepError(null);
    setVerifyResponseMsg('System scanning screenshot for Transaction ID...');

    const amt = parseFloat(depositAmount);
    const methodStr = selectedMethod || 'bkash';
    const cleanTxId = transactionId.replace(/\s+/g, '').trim();

    const activeGate = manualGateways.find(g => g.id === selectedMethod);
    const expectedBdt = amt * (settings.smmUsdToBdtRate !== undefined ? settings.smmUsdToBdtRate : 120);

    try {
      // Call backend API to verify the screenshot using Gemini
      const res = await fetch('/api/smm/verify-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: depositScreenshot,
          txid: cleanTxId,
          amount: amt,
          gatewayId: activeGate?.id || methodStr,
          gatewayTitle: activeGate?.title || methodStr,
          gatewayType: activeGate?.type || 'Personal',
          gatewayNumber: activeGate?.numberOrAddress || '',
          expectedBdt: expectedBdt
        })
      });

      let verification = { isMatch: false, reason: "Verification API connection error.", detectedTxId: null };
      if (res.ok) {
        verification = await res.json();
      }

      // Parse current deposits tracking logs
      const cached = localStorage.getItem('dih_smm_deposits_v2');
      let currentDeps = [];
      if (cached) {
        try {
          currentDeps = JSON.parse(cached);
        } catch (e) {
          console.error(e);
        }
      }

      // Fixed ID calculations to prevent Math.max in empty arrays or NaN
      const nextDepId = currentDeps.length 
        ? Math.max(...currentDeps.map((d: any) => d.id || 0)) + 1 
        : 1;

      // Determine status based on verification result
      const isAutoApprove = verification.isMatch === true;
      const status = isAutoApprove ? 'approved' : 'pending';

      const newDeposit = {
        id: nextDepId,
        userId: userToUse?.id || 999,
        userEmail: userEmail,
        userName: userName,
        amount: amt,
        method: methodStr,
        sender: 'N/A',
        txid: cleanTxId,
        status: status,
        screenshot: depositScreenshot, // Store compressed base64 screenshot
        aiReason: verification.reason,
        detectedTxId: verification.detectedTxId,
        date: new Date().toISOString().split('T')[0]
      };

      const updatedDeps = [...currentDeps, newDeposit];
      saveDeposits(updatedDeps);

      // If auto-approved, credit the user's balance immediately!
      if (isAutoApprove) {
        const newBal = balance + amt;
        updateBalance(newBal);
        
        setDepSuccess(`✨ AUTO-CREDITED: Screenshot verified successfully! $${fmtAmt(amt)} has been automatically added to your balance.`);
      } else {
        setDepSuccess(`Deposit of $${fmtAmt(amt)} submitted as PENDING! ${verification.reason || 'System could not match TxID.'} An admin will review your screenshot manually.`);
      }

      // Clean up states and go back to form
      setDepositAmount('');
      setSenderDetails('');
      setTransactionId('');
      setDepositScreenshot(null);
      setDepositStep('form');
    } catch (err: any) {
      console.error(err);
      setDepError('Failed to verify screenshot. Please try again or submit anyway.');
    } finally {
      setIsVerifyingScreenshot(false);
      setVerifyResponseMsg(null);
    }
  };

  // Filtering
  const filteredServices = useMemo(() => {
    // Check if there is an explicit manual service linkage mapping
    const manualIds = settings.smmShortcutMappings?.[activeCat];
    const hasManualLinks = Array.isArray(manualIds) && manualIds.length > 0;

    return activeServices.filter(s => {
      let matchesCat = false;
      
      if (hasManualLinks) {
        matchesCat = manualIds.includes(s.id);
      } else {
        const activeCatLower = activeCat.toLowerCase();
        const svcCatLower = s.category.toLowerCase();
        
        if (activeCat === 'All') {
          matchesCat = true;
        } else if (activeCatLower === 'instagram') {
          matchesCat = svcCatLower.includes('instagram') || svcCatLower.includes('ig');
        } else if (activeCatLower === 'facebook') {
          matchesCat = svcCatLower.includes('facebook') || svcCatLower.includes('fb');
        } else if (activeCatLower === 'youtube') {
          matchesCat = svcCatLower.includes('youtube') || svcCatLower.includes('yt');
        } else if (activeCatLower === 'tiktok') {
          matchesCat = svcCatLower.includes('tiktok') || svcCatLower.includes('tt');
        } else if (activeCatLower === 'telegram') {
          matchesCat = svcCatLower.includes('telegram') || svcCatLower.includes('tg');
        } else if (activeCatLower === 'twitter' || activeCatLower === 'twitter/x') {
          matchesCat = svcCatLower.includes('twitter') || svcCatLower.includes('x ');
        } else if (activeCatLower === 'linkedin') {
          matchesCat = svcCatLower.includes('linkedin');
        } else if (activeCatLower === 'spotify') {
          matchesCat = svcCatLower.includes('spotify');
        } else if (activeCatLower === 'discord') {
          matchesCat = svcCatLower.includes('discord');
        } else if (activeCatLower === 'website traffic') {
          matchesCat = svcCatLower.includes('website') || svcCatLower.includes('traffic') || svcCatLower.includes('web');
        } else if (activeCatLower === 'others') {
          // Anything that doesn't explicitly match the primary main ones
          const isKnown = ['instagram', 'ig', 'facebook', 'fb', 'youtube', 'yt', 'tiktok', 'tt', 'telegram', 'tg', 'twitter', 'x ', 'linkedin', 'spotify', 'discord', 'website', 'traffic', 'web'].some(k => svcCatLower.includes(k));
          matchesCat = !isKnown;
        } else {
          matchesCat = svcCatLower === activeCatLower;
        }
      }

      const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [activeServices, activeCat, searchQuery, settings.smmShortcutMappings]);

  const paginatedCatalogServices = useMemo(() => {
    const startIdx = (smmCatalogPage - 1) * smmCatalogPerPage;
    return filteredServices.slice(startIdx, startIdx + smmCatalogPerPage);
  }, [filteredServices, smmCatalogPage]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Filter by the currently active logged-in user
      const belongsToUser = o.userEmail?.toLowerCase() === userEmail?.toLowerCase() || (!o.userEmail && userEmail === 'contact@dihhub.site');
      if (!belongsToUser) return false;

      if (activeFilter === 'all') return true;
      return o.status === activeFilter;
    });
  }, [orders, activeFilter, userEmail]);

  const recentUserOrders = useMemo(() => {
    return orders
      .filter(o => o.userEmail?.toLowerCase() === userEmail?.toLowerCase() || (!o.userEmail && userEmail === 'contact@dihhub.site'))
      .slice(0, 5);
  }, [orders, userEmail]);

  const userOrdersCount = useMemo(() => orders.filter(o => o.userEmail?.toLowerCase() === userEmail?.toLowerCase()).length, [orders, userEmail]);
  const completedCount = useMemo(() => orders.filter(o => o.status === 'completed' && o.userEmail?.toLowerCase() === userEmail?.toLowerCase()).length, [orders, userEmail]);
  const pendingCount = useMemo(() => orders.filter(o => o.status === 'pending' && o.userEmail?.toLowerCase() === userEmail?.toLowerCase()).length, [orders, userEmail]);
  const processingCount = useMemo(() => orders.filter(o => o.status === 'processing' && o.userEmail?.toLowerCase() === userEmail?.toLowerCase()).length, [orders, userEmail]);
  const totalSpent = useMemo(() => orders.filter(o => o.userEmail?.toLowerCase() === userEmail?.toLowerCase()).reduce((sum, o) => sum + o.amount, 0), [orders, userEmail]);

  // Method Classes helper
  const getMethodClass = (method: string) => {
    if (selectedMethod !== method) {
      return "border-[#1e2336] bg-white/5 text-slate-400 hover:text-white";
    }
    switch(method) {
      case 'bkash': return "bg-gradient-to-r from-[#e91e8c] to-[#c2185b] border-[#e91e8c] text-white shadow-lg shadow-pink-500/20";
      case 'nagad': return "bg-gradient-to-r from-orange-500 to-orange-700 border-orange-500 text-white shadow-lg shadow-orange-500/20";
      case 'rocket': return "bg-gradient-to-r from-purple-500 to-purple-700 border-purple-500 text-white shadow-lg shadow-purple-500/20";
      case 'card': return "bg-gradient-to-r from-blue-500 to-blue-700 border-blue-500 text-white shadow-lg shadow-blue-500/20";
      case 'crypto': return "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-550 text-white shadow-lg shadow-blue-500/20";
      default: return "";
    }
  };

  const isColorTheme = settings.smmEnableColorTheme !== false;

  const getSidebarBtnClass = (page: string) => {
    const isActive = activePage === page;
    if (isActive) {
      return isColorTheme
        ? "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-bold duration-150 relative text-left outline-none text-white bg-blue-500/10 border border-blue-500/15 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-500 before:rounded-r"
        : "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-bold duration-150 relative text-left outline-none text-white bg-slate-800 border-slate-700 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-slate-400 before:rounded-r";
    }
    return "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium duration-150 relative text-left outline-none text-slate-400 hover:text-white hover:bg-white/5 border border-transparent";
  };

  const getSidebarIconColor = (page: string) => {
    return activePage === page
      ? (isColorTheme ? "text-blue-500" : "text-white")
      : "text-slate-400";
  };

  return (
    <div className={cn(
      "flex h-full overflow-x-hidden overflow-y-hidden w-full text-[#e2e8f0] font-sans antialiased select-none",
      isColorTheme ? "bg-[#0d0f14]" : "bg-slate-950"
    )}>
      <div className="flex flex-1 min-w-0 w-full h-full overflow-hidden relative">
      
      {/* MOBILE DARK BACKDROP */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in cursor-pointer"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* SIDEBAR */}
      <aside className={cn(
        "flex flex-col w-60 min-w-60 fixed md:relative inset-y-0 left-0 z-50 md:z-20 md:flex transition-transform duration-300 shrink-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isColorTheme ? "bg-[#0a0c10] border-r border-[#1e2336]" : "bg-slate-900 border-r border-slate-800"
      )}>
        <div className={cn(
          "h-16 flex items-center gap-2.5 px-5 font-bold text-white text-lg tracking-tight",
          isColorTheme ? "border-b border-[#1e2336]" : "border-b border-slate-800"
        )}>
          <Activity className={isColorTheme ? "text-blue-500" : "text-slate-400"} size={20} />
          DIH SMM
        </div>

        <div className={cn(
          "p-4 space-y-1",
          isColorTheme
            ? "border-b border-[#1e2336] bg-blue-500/[0.03]"
            : "border-b border-slate-800 bg-slate-950/20"
        )}>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Current Balance</div>
          <div className="text-2xl font-mono font-bold text-white">
            <span className={isColorTheme ? "text-blue-500" : "text-slate-400"}>$</span>{fmtAmt(balance)}
          </div>
          <button 
            onClick={() => navigate('deposit')} 
            className={cn(
              "text-xs font-semibold hover:underline focus:outline-none mt-1",
              isColorTheme ? "text-blue-500" : "text-slate-400"
            )}
          >
            + Add Funds
          </button>
        </div>

        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => navigate('dashboard')}
            className={getSidebarBtnClass('dashboard')}
          >
            <LayoutDashboard size={18} className={getSidebarIconColor('dashboard')} />
            Dashboard
          </button>

          <button
            onClick={() => navigate('new-order')}
            className={getSidebarBtnClass('new-order')}
          >
            <PlusCircle size={18} className={getSidebarIconColor('new-order')} />
            New Order
          </button>

          <button
            onClick={() => navigate('services')}
            className={getSidebarBtnClass('services')}
          >
            <List size={18} className={getSidebarIconColor('services')} />
            Services
          </button>

          <button
            onClick={() => navigate('orders')}
            className={getSidebarBtnClass('orders')}
          >
            <ArrowDownToLine size={18} className={getSidebarIconColor('orders')} />
            My Orders
          </button>

          <button
            onClick={() => navigate('deposit')}
            className={getSidebarBtnClass('deposit')}
          >
            <CreditCard size={18} className={getSidebarIconColor('deposit')} />
            Add Funds
          </button>
        </nav>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className={cn(
          "h-16 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-10 w-full",
          isColorTheme 
            ? "border-b border-[#1e2336] bg-[#0d0f14]/80"
            : "border-b border-slate-800 bg-slate-900/80"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className={cn(
                "p-2 rounded-xl md:hidden text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 focus:outline-none transition-all mr-1",
                isColorTheme ? "bg-[#141720]/50 border border-[#1e2336]/60" : "bg-slate-900 border border-slate-800"
              )}
            >
              <Menu size={18} />
            </button>
            <h1 className="text-base font-semibold text-white capitalize block">
              {activePage === 'new-order' ? 'Place New Order' : activePage === 'orders' ? 'My Orders' : activePage === 'deposit' ? 'Add Funds' : activePage}
            </h1>
            
            {/* Mobile Header indicator - hidden in desktop design */}
            <div className="hidden items-center gap-2 font-bold text-white text-base">
              <Activity className={isColorTheme ? "text-blue-500" : "text-slate-400"} size={18} />
              DIH SMM
              <span className="text-slate-500 ml-1 font-medium text-xs">|</span>
              <span className={cn("text-xs font-mono font-bold", isColorTheme ? "text-blue-500" : "text-slate-100")}>${fmtAmt(balance)}</span>
            </div>
          </div>

          {/* User Status Gate - always visible */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs",
                isColorTheme ? "bg-[#141720] border border-[#1e2336]" : "bg-slate-950 border border-slate-850"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded text-white font-black flex items-center justify-center uppercase truncate",
                  isColorTheme ? "bg-blue-500" : "bg-slate-700"
                )}>
                  {userName[0]}
                </div>
                <div className="text-left font-sans">
                  <p className="text-white font-semibold leading-tight">{userName}</p>
                  <p className="text-[9px] text-slate-400 font-mono select-all">{userEmail}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className={cn(
                  "px-4 py-1.5 text-white text-xs font-black rounded-lg transition active:scale-95 cursor-pointer",
                  isColorTheme 
                    ? "bg-gradient-to-r from-blue-650 via-blue-600 to-indigo-600 shadow-md shadow-blue-500/10 animate-pulse" 
                    : "bg-slate-800 hover:bg-slate-700 border border-slate-705"
                )}
              >
                Log In / Register
              </button>
            )}
          </div>

          {/* Mobile Bottom-Like Nav bar inside header - hidden in desktop design */}
          <div className="hidden items-center gap-1.5">
            <button 
              onClick={() => navigate('dashboard')}
              className={cn("p-1.5 rounded-md", activePage === 'dashboard' ? (isColorTheme ? "bg-blue-500/15 text-blue-500" : "bg-slate-800 text-white") : "text-slate-400")}
              title="Dashboard"
            >
              <LayoutDashboard size={16} />
            </button>
            <button 
              onClick={() => navigate('new-order')}
              className={cn("p-1.5 rounded-md", activePage === 'new-order' ? (isColorTheme ? "bg-blue-500/15 text-blue-500" : "bg-slate-800 text-white") : "text-slate-400")}
              title="New Order"
            >
              <PlusCircle size={16} />
            </button>
            <button 
              onClick={() => navigate('services')}
              className={cn("p-1.5 rounded-md", activePage === 'services' ? (isColorTheme ? "bg-blue-500/15 text-blue-500" : "bg-slate-800 text-white") : "text-slate-400")}
              title="Services"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => navigate('orders')}
              className={cn("p-1.5 rounded-md", activePage === 'orders' ? (isColorTheme ? "bg-blue-500/15 text-blue-500" : "bg-slate-800 text-white") : "text-slate-400")}
              title="My Orders"
            >
              <ArrowDownToLine size={16} />
            </button>
            <button 
              onClick={() => navigate('deposit')}
              className={cn("p-1.5 rounded-md", activePage === 'deposit' ? (isColorTheme ? "bg-blue-500/15 text-blue-500" : "bg-slate-800 text-white") : "text-slate-400")}
              title="Add Funds"
            >
              <CreditCard size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* DASHBOARD PAGE */}
            {activePage === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back, {userName}</h2>
                    <p className="text-sm text-slate-400">Here is your account overview.</p>
                  </div>
                  <button 
                    onClick={() => navigate('new-order')} 
                    className={cn(
                      "flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-white text-xs font-black tracking-wide duration-150 self-start sm:self-auto cursor-pointer hover:brightness-110",
                      isColorTheme 
                        ? "bg-gradient-to-r from-blue-650 via-blue-600 to-indigo-600 shadow-md shadow-blue-500/10" 
                        : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    )}
                  >
                    Place New Order
                  </button>
                </div>

                {settings.smmSystemNotice && (
                  <div className={cn(
                    "rounded-2xl p-4 shadow-sm animate-in fade-in duration-300",
                    isColorTheme 
                      ? "bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/10"
                      : "bg-slate-900 border border-slate-800"
                  )}>
                    <p className="text-[12px] text-slate-300 leading-relaxed font-medium">
                      {(settings.smmSystemNotice || "").replace(/Bangladesh/g, "World")}
                    </p>
                  </div>
                )}

                {/* STATS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={cn(
                    "rounded-xl p-5 relative overflow-hidden group transition-all",
                    isColorTheme 
                      ? "bg-[#141720] border border-[#1e2336] hover:border-blue-500/20" 
                      : "bg-slate-900 border border-slate-800 hover:border-slate-700"
                  )}>
                    {isColorTheme && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">Total Spent</span>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isColorTheme ? "bg-blue-500/10" : "bg-slate-800"
                      )}>
                        <CreditCard size={15} className={isColorTheme ? "text-blue-500" : "text-slate-400"} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">${fmtAmt(totalSpent)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Lifetime spending</div>
                  </div>

                  <div className={cn(
                    "rounded-xl p-5 relative overflow-hidden group transition-all",
                    isColorTheme 
                      ? "bg-[#141720] border border-[#1e2336] hover:border-blue-500/20" 
                      : "bg-slate-900 border border-slate-800 hover:border-slate-700"
                  )}>
                    {isColorTheme && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">Total Orders</span>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isColorTheme ? "bg-blue-500/10" : "bg-slate-800"
                      )}>
                        <Activity size={15} className={isColorTheme ? "text-blue-500" : "text-slate-400"} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{userOrdersCount}</div>
                    <div className="text-[11px] text-slate-500 mt-1">0 orders today</div>
                  </div>

                  <div className={cn(
                    "rounded-xl p-5 relative overflow-hidden group transition-all",
                    isColorTheme 
                      ? "bg-[#141720] border border-[#1e2336] hover:border-blue-500/20" 
                      : "bg-slate-900 border border-slate-800 hover:border-slate-700"
                  )}>
                    {isColorTheme && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">Completed</span>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isColorTheme ? "bg-blue-500/10" : "bg-slate-800"
                      )}>
                        <CheckCircle2 size={15} className={isColorTheme ? "text-blue-500" : "text-slate-400"} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{completedCount}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Successfully delivered</div>
                  </div>

                  <div className={cn(
                    "rounded-xl p-5 relative overflow-hidden group transition-all",
                    isColorTheme 
                      ? "bg-[#141720] border border-[#1e2336] hover:border-blue-500/20" 
                      : "bg-slate-900 border border-slate-800 hover:border-slate-700"
                  )}>
                    {isColorTheme && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">In Progress</span>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isColorTheme ? "bg-blue-500/10" : "bg-slate-800"
                      )}>
                        <RefreshCw size={14} className={cn(isColorTheme ? "text-blue-500" : "text-slate-400", "animate-spin-reverse")} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{pendingCount + processingCount}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Pending &amp; processing</div>
                  </div>
                </div>

                {/* RECENT ORDERS */}
                <div className={cn(
                  "rounded-xl overflow-hidden",
                  isColorTheme ? "bg-[#141720] border border-[#1e2336]" : "bg-slate-900 border border-slate-800"
                )}>
                  <div className={cn(
                    "p-5 flex items-center justify-between",
                    isColorTheme ? "border-b border-[#1e2336]" : "border-b border-slate-800"
                  )}>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Your latest activity.</p>
                    </div>
                    <button onClick={() => navigate('orders')} className="px-3 py-1.5 border border-[#1e2336] hover:border-blue-500/20 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.01] border-b border-[#1e2336]">
                          <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">ID</th>
                          <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Service</th>
                          <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Link</th>
                          <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Qty</th>
                          <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Charge</th>
                          <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2336]/60">
                        {recentUserOrders.map(o => (
                          <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4.5 py-3 font-mono text-[11px] text-slate-400">#{o.id}</td>
                            <td className="px-4.5 py-3 text-[13px] font-semibold text-slate-200">{o.serviceName}</td>
                            <td className="px-4.5 py-3">
                              <a href={o.link} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1 max-w-[180px] truncate font-mono">
                                {o.link} <ExternalLink size={10} className="shrink-0" />
                              </a>
                            </td>
                            <td className="px-4.5 py-3 text-right font-mono text-[13px] text-slate-300">{fmt(o.quantity)}</td>
                            <td className="px-4.5 py-3 text-right text-blue-500 font-semibold font-mono text-[13px]">${fmtAmt(o.amount)}</td>
                            <td className="px-4.5 py-3 text-right">
                              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide", getBadgeClass(o.status))}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SERVICES PAGE */}
            {activePage === 'services' && (
              <div className="space-y-6">
                {/* SEARCH */}
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search services..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#141720] border border-[#1e2336] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500 duration-150 placeholder-[#64748b]"
                  />
                </div>

                {/* CATEGORIES */}
                <div className="flex flex-wrap gap-2">
                  {mappedCategories.map(c => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        "px-4.5 py-2.5 rounded-full text-xs font-semibold border tracking-wider transition-all duration-150 select-none cursor-pointer",
                        c === activeCategory()
                          ? "bg-blue-650 text-white border-blue-650 shadow-md shadow-blue-500/10 font-black"
                          : "bg-[#141720] text-slate-400 border-[#1e2336] hover:text-white hover:border-blue-500/40"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* SERVICES GRID */}
                {filteredServices.length === 0 ? (
                  <div className="p-12 text-center rounded-xl border border-[#1e2336] bg-[#141720]/50 space-y-2">
                    <Search className="text-slate-500 mx-auto opacity-40" size={32} />
                    <p className="text-sm font-semibold text-slate-400">No services found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedCatalogServices.map(s => (
                        <div key={s.id} className="bg-[#141720] border border-[#1e2336] rounded-xl p-4.5 flex flex-col justify-between hover:border-blue-500/20 duration-150">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.category}</span>
                                <h4 className="text-[13px] font-bold text-white leading-snug mt-0.5">{s.name}</h4>
                              </div>
                              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider shrink-0", getQualityBadgeClass(s.quality))}>
                                {s.quality}
                              </span>
                            </div>
                            
                            <p className="text-slate-400 text-[11.5px] leading-relaxed">{s.desc}</p>
                            
                            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500">
                              <span>Min: {fmt(s.min)}</span>
                              {s.refill && (
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide border shrink-0",
                                  getCleanRefill(s.refill).toLowerCase().includes('no')
                                    ? "bg-red-500/10 text-red-400 border-red-500/15"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                                )}>
                                  🔄 Refill: {getCleanRefill(s.refill)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#1e2336] shrink-0">
                            <div className="text-[15px] font-mono font-bold text-blue-500">
                              ${s.price.toFixed(4)} <span className="text-xs font-sans text-slate-400 font-normal">/ 1000</span>
                            </div>
                            <button 
                              onClick={() => goOrder(s.id)}
                              className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-605 hover:text-white hover:shadow-md hover:shadow-blue-500/10 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Order &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Catalog Pagination Controls */}
                    {filteredServices.length > smmCatalogPerPage && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#141720] border border-[#1e2336] p-3 rounded-xl text-xs">
                        <span className="text-slate-400">
                          Showing <span className="font-bold text-white">{(smmCatalogPage - 1) * smmCatalogPerPage + 1}</span> to <span className="font-bold text-white">{Math.min(filteredServices.length, smmCatalogPage * smmCatalogPerPage)}</span> of <span className="font-bold text-white">{filteredServices.length}</span> SMM services
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={smmCatalogPage === 1}
                            onClick={() => setSmmCatalogPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 bg-[#0c0e15] hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-30 disabled:cursor-not-allowed border border-[#1e2336] transition"
                          >
                            Prev
                          </button>
                          <span className="text-slate-500 font-mono font-bold">
                            Page {smmCatalogPage} of {Math.ceil(filteredServices.length / smmCatalogPerPage)}
                          </span>
                          <button
                            disabled={smmCatalogPage >= Math.ceil(filteredServices.length / smmCatalogPerPage)}
                            onClick={() => setSmmCatalogPage(p => p + 1)}
                            className="px-3 py-1 bg-[#0c0e15] hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-30 disabled:cursor-not-allowed border border-[#1e2336] transition"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NEW ORDER PAGE */}
            {activePage === 'new-order' && (
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Visual Category Platforms Selector */}
                <div className="bg-[#141720] border border-[#1e2336] rounded-xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider">Fast SMM Platform Shortcuts</span>
                    </div>
                    {orderActivePlatform !== 'All' && (
                      <button 
                        type="button"
                        onClick={() => navigate('services')}
                        className="text-[11px] font-bold text-blue-500 hover:text-white transition-colors cursor-pointer select-none"
                      >
                        Show All
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:gap-2.5">
                    {mappedCategories.map((cat) => {
                       const isSelected = orderActivePlatform === cat;
                       return (
                         <button
                           key={cat}
                           type="button"
                           onClick={() => handlePlatformChange(cat)}
                           className={cn(
                             "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none border",
                             isSelected
                               ? "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/15 font-black"
                               : "bg-[#0d0f17]/60 text-slate-300 border-[#1e2336] hover:bg-white/[0.03] hover:text-white"
                           )}
                         >
                           {getCategoryIcon(cat)}
                           <span>{cat}</span>
                         </button>
                       );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  <div className="lg:col-span-7 bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden shadow-xl">
                    <div className="px-5 py-3.5 border-b border-[#1e2336] flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#141720]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-200">New SMM Order Form</span>
                      </div>
                      
                      <div className="bg-blue-950/40 text-blue-400 border border-blue-500/30 px-2.5 py-0.8 rounded text-[9px] font-black tracking-widest uppercase font-mono">
                        Instant Proc
                      </div>
                    </div>
                    
                    <div className="p-5.5 space-y-4">
                      
                      {/* Fallback to restore defaults if empty */}
                      {activeServices.length === 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4.5 text-xs text-blue-400 space-y-2.5">
                          <p className="font-bold flex items-center gap-1.5">⚠️ SMM Catalog is currently empty!</p>
                          <p className="text-slate-300 leading-relaxed">
                            It looks like all SMM services were cleared or not initialized. Press the button below to instantly populate your browser storage with our high-speed default catalog of 24 SMM services.
                          </p>
                          <button 
                            type="button" 
                            onClick={() => {
                              localStorage.setItem('dih_smm_services_v2', JSON.stringify(SERVICES));
                              setServicesList(SERVICES);
                            }}
                            className="bg-blue-550 hover:bg-blue-600 text-white font-black px-4 py-2 rounded-lg transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md inline-flex items-center gap-2"
                          >
                            Restore Default 24 Services
                          </button>
                        </div>
                      )}

                      {true ? (
                        <>
                          {/* Search Bar */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-0.5">Search Service</label>
                            <div className="relative">
                              <Search size={14} className="absolute left-3 w-4 h-4 text-slate-400 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                placeholder="Type to search service globally..."
                                value={orderSearchQuery}
                                onChange={(e) => {
                                  const query = e.target.value;
                                  setOrderSearchQuery(query);
                                  
                                  if (query) {
                                    const match = activeServices.find(s => 
                                      s.name.toLowerCase().includes(query.toLowerCase()) || 
                                      s.id.toString().includes(query)
                                    );
                                    if (match) {
                                      setOrderActiveCat(match.category);
                                      setSelectedServiceId(match.id);
                                      setOrderQty(match.min.toString());
                                    }
                                  }
                                }}
                                className="w-full bg-[#0d0f17] border border-[#1e2336] pl-[#2.4rem] pr-8 py-3 text-xs text-white rounded-lg outline-none focus:border-blue-500 placeholder-[#64748b] transition-colors h-11"
                              />
                              {orderSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOrderSearchQuery('');
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Category Selector */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-0.5">Category</label>
                            <div className="relative" ref={catDropdownRef}>
                              <button
                                type="button"
                                onClick={() => {
                                  setCatDropdownOpen(!catDropdownOpen);
                                  setDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 bg-[#0d0f17] border border-[#1e2336] text-left flex justify-between items-center text-xs rounded-lg focus:border-blue-500 hover:border-slate-800 text-white font-medium transition-all outline-none h-11 cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  {getCategoryStyledName(orderActiveCat)}
                                </span>
                                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-150", catDropdownOpen ? "rotate-180" : "")} />
                              </button>
                              
                              <AnimatePresence>
                                {catDropdownOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden shadow-2xl z-50 origin-top"
                                  >
                                    <div className="p-2 border-b border-[#1e2336] bg-[#0d0f17]">
                                      <input
                                        type="text"
                                        placeholder="Search category..."
                                        value={catSearchQuery}
                                        onChange={(e) => setCatSearchQuery(e.target.value)}
                                        className="w-full bg-[#141720] text-xs px-3 py-2 text-white border border-[#1e2336] rounded-lg outline-none focus:border-blue-500"
                                        autoFocus
                                      />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                      {uniqueOrderCategories
                                        .filter(cat => serviceCategoryBelongsToPlatform(cat, orderActivePlatform))
                                        .filter(cat => cat.toLowerCase().includes(catSearchQuery.toLowerCase()))
                                        .map(cat => {
                                          const isSelected = orderActiveCat === cat;
                                          return (
                                            <div
                                              key={cat}
                                              onClick={() => {
                                                handleCategoryChange(cat);
                                                setCatDropdownOpen(false);
                                                setCatSearchQuery('');
                                              }}
                                              className={cn(
                                                "px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.03] cursor-pointer rounded-lg flex items-center justify-between transition-colors",
                                                isSelected ? "bg-blue-500/10 text-blue-500 font-extrabold border-l-2 border-blue-500" : ""
                                              )}
                                            >
                                              <span>{getCategoryStyledName(cat)}</span>
                                              {isSelected && <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-500 uppercase tracking-widest font-black">Active</span>}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Service Selector */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-0.5">Service</label>
                            <div className="relative" ref={dropdownRef}>
                              <button
                                type="button"
                                onClick={() => {
                                  setDropdownOpen(!dropdownOpen);
                                  setCatDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 bg-[#0d0f17] border border-[#1e2336] text-left flex justify-between items-center text-xs rounded-lg focus:border-blue-500 hover:border-slate-800 text-white font-medium transition-all outline-none h-11 cursor-pointer"
                              >
                                <span className="truncate pr-4 flex items-center gap-1.5 w-full">
                                  {selectedService ? (
                                    <>
                                      <span className="bg-blue-500/15 text-blue-500 text-[10px] font-black px-1.5 py-0.5 rounded border border-blue-500/25 font-mono">
                                        {selectedService.id}
                                      </span>
                                      <span className="truncate font-semibold">{selectedService.name}</span>
                                      {selectedService.refill && (
                                        <span className={cn(
                                          "px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 font-mono tracking-wider border",
                                          getCleanRefill(selectedService.refill).toLowerCase().includes('no') 
                                            ? "bg-red-500/10 text-red-400 border-red-500/10" 
                                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
                                        )}>
                                          🔄 {getCleanRefill(selectedService.refill)}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span>Choose a service...</span>
                                  )}
                                </span>
                                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-150", dropdownOpen ? "rotate-180" : "")} />
                              </button>
                              
                              <AnimatePresence>
                                {dropdownOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden shadow-2xl z-50 origin-top"
                                  >
                                    <div className="p-2 border-b border-[#1e2336] bg-[#0d0f17] flex flex-col gap-2">
                                      <input
                                        type="text"
                                        placeholder="Search service by name or ID..."
                                        value={ddSearchQuery}
                                        onChange={(e) => setDdSearchQuery(e.target.value)}
                                        className="w-full bg-[#141720] text-xs px-3 py-2 text-white border border-[#1e2336] rounded-lg outline-none focus:border-blue-500"
                                        autoFocus
                                      />
                                      {/* Quick Refill & Non-Refill Tabs */}
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDdRefillFilter('all');
                                          }}
                                          className={cn(
                                            "flex-1 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all text-center cursor-pointer",
                                            ddRefillFilter === 'all'
                                              ? "bg-blue-500/15 text-blue-500 border-blue-500/35"
                                              : "bg-[#141720] text-slate-500 border-slate-800/80 hover:text-slate-350"
                                          )}
                                        >
                                          All
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDdRefillFilter('refill');
                                          }}
                                          className={cn(
                                            "flex-1 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all text-center flex items-center justify-center gap-0.5 cursor-pointer",
                                            ddRefillFilter === 'refill'
                                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/35"
                                              : "bg-[#141720] text-slate-500 border-slate-800/80 hover:text-slate-350"
                                          )}
                                        >
                                          🔄 Refill
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDdRefillFilter('non-refill');
                                          }}
                                          className={cn(
                                            "flex-1 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all text-center flex items-center justify-center gap-0.5 cursor-pointer",
                                            ddRefillFilter === 'non-refill'
                                              ? "bg-red-500/15 text-red-400 border-red-500/35"
                                              : "bg-[#141720] text-slate-500 border-slate-800/80 hover:text-slate-350"
                                          )}
                                        >
                                          ⚠️ No Refill
                                        </button>
                                      </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                                      {filteredServicesForDropdown.length === 0 ? (
                                        <div className="text-center py-5 text-xs text-slate-500">No services match your search</div>
                                      ) : (
                                        filteredServicesForDropdown.map(s => {
                                          const isSelected = s.id === selectedServiceId;
                                          return (
                                            <div
                                              key={s.id}
                                              onClick={() => {
                                                setSelectedServiceId(s.id);
                                                setOrderQty(s.min.toString());
                                                setDropdownOpen(false);
                                                setDdSearchQuery('');
                                              }}
                                              className={cn(
                                                "px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-[#0d0f17] cursor-pointer rounded-lg flex flex-col gap-1 transition-colors",
                                                isSelected ? "bg-blue-500/10 text-blue-500 font-bold border-l-2 border-blue-500 bg-[#0d0f17]/30" : ""
                                              )}
                                            >
                                              <div className="flex items-center justify-between gap-1.5">
                                                <span className="font-semibold truncate">
                                                  <span className="text-blue-500 font-mono font-black border border-blue-500/20 bg-blue-500/10 px-1 py-0.2 rounded text-[10px] mr-1.5">{s.id}</span>
                                                  {s.name}
                                                </span>
                                                <span className="font-mono text-emerald-400 font-extrabold shrink-0">
                                                  ${s.price.toFixed(4)}/1k
                                                </span>
                                              </div>
                                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pl-8 font-mono">
                                                <span>Min: {fmt(s.min)}</span>
                                                <span>•</span>
                                                <span>Max: {fmt(s.max)}</span>
                                                {s.refill && (
                                                  <>
                                                    <span>•</span>
                                                    <span className={cn(
                                                      "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 transition-colors duration-150",
                                                      getCleanRefill(s.refill).toLowerCase().includes('no') 
                                                        ? "bg-red-500/10 text-red-400 border border-red-500/10" 
                                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                                    )}>
                                                      🔄 {getCleanRefill(s.refill)}
                                                    </span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Link Input */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-0.5">Link</label>
                            <div className="relative border border-[#1e2336] rounded-lg">
                              <Link2 size={14} className="absolute left-3 w-4 h-4 text-slate-500 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input 
                                type="url" 
                                placeholder="Enter destination link (URL)" 
                                value={orderLink}
                                onChange={(e) => setOrderLink(e.target.value)}
                                className="w-full bg-[#0d0f17] border border-[#1e2336] pl-9.5 pr-4 py-3 text-xs text-white rounded-lg outline-none focus:border-blue-500 placeholder-[#64748b] transition-colors h-11"
                              />
                            </div>
                          </div>

                          {/* Quantity Input with help text UNDERNEATH */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-0.5">Quantity</label>
                            <input 
                              type="number" 
                              placeholder="Enter desired amount" 
                              value={orderQty}
                              onChange={(e) => setOrderQty(e.target.value)}
                              className="w-full bg-[#0d0f17] border border-[#1e2336] px-4 py-3 text-xs text-white rounded-lg outline-none focus:border-blue-500 transition-colors font-mono h-11"
                            />
                            {selectedService && (
                              <div className="text-[10px] text-slate-500 pl-1 font-mono">
                                Min: {fmt(selectedService.min)} – Max: {fmt(selectedService.max)}
                              </div>
                            )}
                          </div>

                          {/* Charge (Readonly input showing total price) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-0.5">Charge</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                readOnly 
                                disabled
                                value={`$${currentTotal.toFixed(4)}`}
                                className="w-full bg-[#0d0f17]/40 border border-[#1e2336] px-4 py-3 text-xs text-emerald-400 font-extrabold rounded-lg outline-none font-mono tracking-wide h-11"
                              />
                            </div>
                          </div>

                          {/* Balance & Success/Error Details */}
                          <div className="bg-[#1c2132]/45 border border-[#1e2336] rounded-lg px-4.5 py-3.5 flex justify-between items-center text-xs shrink-0 font-mono">
                            <div className="text-slate-400">Your Current Balance:</div>
                            <div className="text-emerald-400 font-extrabold text-sm">${fmtAmt(balance)}</div>
                          </div>

                          {/* Alerts */}
                          {orderError && (
                            <div className="flex items-center gap-2.5 px-4 py-3.5 border border-red-500/20 bg-red-500/[0.04] text-red-400 rounded-lg text-xs leading-relaxed">
                              <AlertCircle size={15} className="shrink-0" />
                              {orderError}
                            </div>
                          )}

                          {orderSuccess && (
                            <div className="flex items-center gap-2.5 px-4 py-3.5 border border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400 rounded-lg text-xs leading-relaxed">
                              <CheckCircle2 size={15} className="shrink-0" />
                              {orderSuccess}
                            </div>
                          )}

                          {/* Submit Button */}
                          <button 
                            type="button"
                            onClick={() => handlePlaceOrder()}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-550 hover:brightness-110 active:scale-[0.985] text-white font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-150 h-12 cursor-pointer mt-2 shadow-md border border-blue-500/10"
                          >
                            Submit
                          </button>
                        </>
                      ) : null}

                    </div>
                  </div>

                  {/* RIGHT: SERVICE DESCRIPTION / BULLET PREVIEW CARD */}
                  <div className="lg:col-span-5 space-y-5">
                    {selectedService ? (
                      <div className="bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden shadow-xl">
                        
                        {/* ID Badge Gradient Header */}
                        <div className="p-5.5 bg-gradient-to-r from-blue-950/60 via-blue-950/20 to-[#141720] border-b border-[#1e2336]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-550 text-white shadow-md font-mono">
                              # {selectedService.id}
                            </span>
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/15 border border-blue-500/25 px-2 py-0.5 rounded">
                              Active Service
                            </span>
                          </div>
                          <h4 className="text-[13px] font-black text-white leading-normal tracking-wide">
                            {selectedService.id} - {selectedService.name}
                          </h4>
                           <p className="text-[11px] text-emerald-400 font-extrabold mt-1.5 font-mono">
                            ${selectedService.price.toFixed(4)} per 1000
                          </p>
                        </div>

                        {/* Detailed Specification and warnings */}
                        <div className="p-5.5 space-y-5">
                          {/* Parameter & Specification list */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-[#1e2336] pb-1.5">Specifications</h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                {/* Refill Status Prominent Card */}
                                <div className={cn(
                                  "p-3 rounded-lg border flex flex-col gap-1 transition-colors duration-200",
                                  getCleanRefill(selectedService.refill).toLowerCase().includes('no')
                                    ? "bg-red-500/5 border-red-500/10 text-red-400"
                                    : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                                )}>
                                  <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Refill Guarantee</span>
                                  <span className="text-xs font-black flex items-center gap-1.5">
                                    {getCleanRefill(selectedService.refill).toLowerCase().includes('no') ? '❌' : '🔄'}
                                    {getCleanRefill(selectedService.refill)}
                                  </span>
                                </div>

                                {/* Target Link Type Card */}
                                <div className="p-3 bg-[#0d0f17]/40 border border-[#1e2336]/80 rounded-lg flex flex-col gap-1 text-slate-200">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Destination URL</span>
                                  <span className="text-xs font-bold leading-none truncate mt-0.5">
                                    {orderActiveCat.toLowerCase().includes('followers') ? '🔗 Profile / Channel Link' : '🔗 Video / Post / Photo link'}
                                  </span>
                                </div>

                                {/* Min / Max Range */}
                                <div className="p-3 bg-[#0d0f17]/40 border border-[#1e2336]/80 rounded-lg flex flex-col gap-1 text-slate-200">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Min / Max Bounds</span>
                                  <span className="text-xs font-mono font-bold leading-none mt-0.5">
                                    {fmt(selectedService.min)} to {fmt(selectedService.max)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Important notes / Alerts list */}
                          <div className="space-y-3 border-t border-[#1e2336] pt-4.5">
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-white">Important Notes:</h5>
                            <div className="border-l-2 border-blue-500 pl-3.5 py-1.5 bg-blue-500/[0.02] rounded-r-lg">
                              <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed list-none">
                                <li className="relative pl-3.5">
                                  <span className="absolute left-0 text-blue-500 font-black">•</span>
                                  When the service is experiencing high demand, the starting speed may vary.
                                </li>
                                <li className="relative pl-3.5">
                                  <span className="absolute left-0 text-blue-500 font-black">•</span>
                                  Please avoid placing a second order on the same link until the current order is fully completed.
                                </li>
                                <li className="relative pl-3.5">
                                  <span className="absolute left-0 text-blue-500 font-black">•</span>
                                  If you encounter any issues with the service, kindly reach out to our support team for assistance.
                                </li>
                                <li className="relative pl-3.5">
                                  <span className="absolute left-0 text-blue-500 font-black">•</span>
                                  <strong className="text-red-400 font-semibold">Do not place orders for private accounts or private links.</strong> Orders for private content won't be processed and may not be refunded.
                                </li>
                              </ul>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#141720]/50 border border-[#1e2336] border-dashed rounded-xl p-8 text-center space-y-3">
                        <HelpCircle size={32} className="text-slate-600 mx-auto opacity-40 animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-slate-400">No Service Selected</p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1">
                            Choose a platform and service from the order panel to load dynamic specifications, details, and guidelines.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* MY ORDERS PAGE */}
            {activePage === 'orders' && (
              <div className="space-y-6">
                
                {/* FILTER HEADERS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {['all', 'pending', 'processing', 'completed', 'cancelled', 'partial'].map(status => (
                      <button
                        key={status}
                        onClick={() => filterOrders(status)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-150 select-none",
                          status === activeFilter
                            ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10"
                            : "bg-[#141720] text-slate-400 border-[#1e2336] hover:text-white hover:border-[#3b82f6]/40"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => navigate('new-order')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider shadow duration-150 shrink-0 self-start sm:self-auto"
                  >
                    + New Order
                  </button>
                </div>

                {/* MY ORDERS TABLE */}
                <div className="bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden">
                  <div className="p-4.5 border-b border-[#1e2336]">
                    <h3 className="text-sm font-semibold text-white capitalize">
                      {activeFilter === 'all' ? 'All Orders' : `${activeFilter} Orders`}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    {filteredOrders.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 space-y-1">
                        <HelpCircle size={32} className="mx-auto text-slate-600 opacity-40 mb-1" />
                        <p className="text-xs font-bold uppercase tracking-wider">No orders found.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/[0.01] border-b border-[#1e2336]">
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">ID</th>
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Service</th>
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Link</th>
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Qty</th>
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Remains</th>
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Charge</th>
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Date</th>
                            <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Status</th>
                            {isAdmin && <th className="px-4.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2336]/60">
                          {filteredOrders.map(o => (
                            <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-4.5 py-3 font-mono text-[11px] text-slate-400">#{o.id}</td>
                              <td className="px-4.5 py-3 text-slate-200">
                                <div className="text-[13px] font-semibold leading-tight">{o.serviceName}</div>
                                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide block mt-0.5">{o.category}</span>
                              </td>
                              <td className="px-4.5 py-3">
                                <a href={o.link} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1 max-w-[150px] truncate font-mono">
                                  {o.link} <ExternalLink size={10} className="shrink-0" />
                                </a>
                              </td>
                              <td className="px-4.5 py-3 text-right font-mono text-[13px] text-slate-300">{fmt(o.quantity)}</td>
                              <td className="px-4.5 py-3 text-right font-mono text-[13px] text-slate-500">
                                {o.remains != null ? fmt(o.remains) : '—'}
                              </td>
                              <td className="px-4.5 py-3 text-right text-blue-500 font-semibold font-mono text-[13px]">${fmtAmt(o.amount)}</td>
                              <td className="px-4.5 py-3 text-right text-[11px] text-slate-500 whitespace-nowrap">{o.createdAt}</td>
                              <td className="px-4.5 py-3 text-right">
                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide", getBadgeClass(o.status))}>
                                  {o.status}
                                </span>
                              </td>
                              {isAdmin && (
                                <td className="px-4.5 py-3 text-right">
                                  <button
                                    onClick={() => deleteOrder(o.id)}
                                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer inline-flex items-center justify-center"
                                    title="Delete Order Permanently"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* DEPOSIT PAGE */}
            {activePage === 'deposit' && (
              <div className="max-w-md mx-auto space-y-5">
                
                {/* HERO BALANCE */}
                <div className="bg-[#141720] border border-[#1e2336] rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <CreditCard size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Current Balance</div>
                    <div className="text-3xl font-bold font-mono text-white leading-tight mt-0.5">
                      <span className="text-blue-500">$</span>{fmtAmt(balance)}
                    </div>
                  </div>
                </div>

                {/* FORM PANEL */}
                <div className="bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden shadow-xl">
                  <div className="px-5 py-4 border-b border-[#1e2336]">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <FileText size={15} className="text-blue-400" />
                      <span>Instant Wallet Receipt Verification</span>
                    </h3>
                  </div>
                  <div className="p-5.5 space-y-5.5">
                    {depositStep === 'form' ? (
                      <>
                        {/* METHODS */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Payment Method</label>
                          {(!manualGateways || manualGateways.length === 0) ? (
                            <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-center text-xs text-red-400 font-medium font-sans">
                              Deposits are currently disabled by the administrator. Please try again later.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans">
                              {manualGateways.filter(gate => gate.enabled !== false).map(gate => {
                                const brand = getGatewayBrandInfo(gate.id, gate.title, gate.logoUrl);
                                return (
                                  <button
                                    key={gate.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedMethod(gate.id);
                                      setDepError(null);
                                      setDepSuccess(null);
                                    }}
                                    className={cn(
                                      "py-3.5 px-2 rounded-xl border text-[11px] font-bold uppercase transition-all duration-200 scale-100 outline-none select-none flex flex-col items-center justify-center gap-1.5 cursor-pointer min-h-[84px] hover:scale-[1.03] active:scale-[0.97]",
                                      brand.colorClass
                                    )}
                                  >
                                    <div className="flex items-center justify-center w-8 h-8 transition-transform duration-200 hover:scale-110">
                                      {brand.logo}
                                    </div>
                                    <span className="tracking-wider text-[10px] font-bold mt-0.5">{brand.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* SELECTED METHOD DETAILS */}
                        {(() => {
                          const activeGate = manualGateways.find(g => g.id === selectedMethod);
                          if (!activeGate) return null;
                          return (
                            <div className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/[0.02] space-y-2.5 font-sans animate-in fade-in duration-200">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-white text-[11px] uppercase tracking-wide">Wallet details:</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-black text-[9px] uppercase">{activeGate.type || 'Personal'}</span>
                              </div>

                              <div className="space-y-1.5 font-sans">
                                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Account / Address</span>
                                <div className="bg-[#0c0e14] border border-[#1e2336]/60 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs overflow-hidden">
                                  <span className="text-white font-extrabold select-all break-all text-left bg-black/40 p-2.5 rounded border border-white/5 flex-1 tracking-wide leading-relaxed">
                                    {activeGate.numberOrAddress}
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(activeGate.numberOrAddress);
                                      setCopiedAddress(true);
                                      setTimeout(() => setCopiedAddress(false), 2000);
                                    }}
                                    className={cn(
                                      "w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 active:scale-95",
                                      copiedAddress 
                                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                                        : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/15"
                                    )}
                                  >
                                    {copiedAddress ? (
                                      <>
                                        <Check size={13} strokeWidth={3} />
                                        <span>Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={13} strokeWidth={2.5} />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="text-[11px] text-slate-400 italic leading-relaxed bg-[#0c0e14]/40 border border-[#1e2336]/30 p-2 rounded">
                                <span className="font-bold text-blue-400 not-italic block mb-0.5 text-[10px] uppercase">Instruction:</span>
                                {activeGate.instructions}
                              </div>

                              {/* BD Mobile Payments Conversion UI */}
                              {['bkash', 'nagad', 'upay', 'rocket'].includes(activeGate.id) && (
                                <div className="bg-amber-500/5 border border-amber-500/15 text-amber-400 p-3 rounded-lg text-xs space-y-1 mt-2 font-sans">
                                  <div className="flex justify-between items-center font-bold">
                                    <span>Exchange Rate:</span>
                                    <span>1 USD = ৳{settings.smmUsdToBdtRate !== undefined ? settings.smmUsdToBdtRate : 120} BDT</span>
                                  </div>
                                  {parseFloat(depositAmount) > 0 && (
                                    <div className="flex justify-between items-center font-black text-[13px] border-t border-amber-500/10 pt-1.5 mt-1.5">
                                      <span>Total to Send:</span>
                                      <span>৳{((parseFloat(depositAmount) || 0) * (settings.smmUsdToBdtRate !== undefined ? settings.smmUsdToBdtRate : 120)).toFixed(2)} BDT</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* QUICK SELECT */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Quick Select</label>
                          <div className="grid grid-cols-6 gap-1.5">
                            {[5, 10, 20, 50, 100, 200].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleQuickSelect(val)}
                                className={cn(
                                  "py-2 rounded-lg border text-xs font-semibold font-mono text-center transition-all duration-150 select-none outline-none",
                                  parseFloat(depositAmount) === val
                                    ? "bg-blue-500 text-white border-blue-500 font-bold shadow-md shadow-blue-500/10"
                                    : "border-[#1e2336] bg-white/5 text-slate-400 hover:text-white hover:border-[#3b82f6]/40"
                                )}
                              >
                                ${val}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* AMOUNT */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center pr-1 pl-0.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (USD)</label>
                            <span className="text-[10px] text-slate-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10">
                              Min: ${(manualGateways.find(g => g.id === selectedMethod)?.minDeposit !== undefined ? manualGateways.find(g => g.id === selectedMethod)?.minDeposit : 2.5).toFixed(2)} USD
                            </span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-20px text-blue-500 font-bold pointer-events-none">$</span>
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              placeholder="0.00"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              className="w-full bg-[#141720] border border-[#1e2336] pl-8.5 pr-4 py-3.5 text-xl font-mono font-semibold text-white rounded-lg outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>

                        {/* USER DEPOSIT TRADING PROOF INPUTS */}
                        <div className="space-y-1.5 text-left font-sans pt-1 animate-in fade-in duration-200">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transaction ID (TxID) / Ref</label>
                          <input
                            type="text"
                            placeholder="Enter Transaction ID (TxID) or Ref Number"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full bg-[#141720] border border-[#1e2336] px-3.5 py-2.5 text-xs text-white rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
                          />
                        </div>

                        {/* DEPOSIT ALERTS */}
                        {depError && (
                          <div className="flex items-center gap-2.5 px-4 py-3 border border-red-500/20 bg-red-500/[0.04] text-red-400 rounded-lg text-xs leading-relaxed">
                            <AlertCircle size={15} className="shrink-0" />
                            {depError}
                          </div>
                        )}

                        {depSuccess && (
                          <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400 rounded-lg text-xs leading-relaxed">
                            <CheckCircle2 size={15} className="shrink-0" />
                            {depSuccess}
                          </div>
                        )}

                        <button 
                          onClick={() => handleInitiateDeposit()}
                          disabled={isVerifyingScreenshot}
                          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm tracking-wide rounded-lg hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-150 active:scale-[0.982] flex items-center justify-center gap-2"
                        >
                          <span>Proceed to Upload Screenshot</span>
                        </button>
                      </>
                    ) : (
                      <div className="space-y-5 text-left animate-in fade-in duration-200">
                        {/* SCREENSHOT UPLOAD STEP */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-400">Upload payment screenshot (SS)</label>
                            <button
                              type="button"
                              onClick={() => {
                                setDepositStep('form');
                                setDepError(null);
                              }}
                              className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer transition"
                            >
                              ← Change Info
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Please upload a screenshot of your payment confirmation receipt showing your Transaction ID (<span className="font-mono text-blue-400 font-bold font-semibold">{transactionId}</span>).
                          </p>
                        </div>

                        {/* DRAG & DROP OR CHOOSE IMAGE */}
                        <div className="border-2 border-dashed border-[#1e2336] hover:border-blue-500/40 rounded-xl p-5 bg-[#0c0e14]/50 text-center transition-all relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="deposit-screenshot-file"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  const result = event.target?.result as string;
                                  if (result) {
                                    setVerifyResponseMsg("Compressing receipt image for scan...");
                                    const compressed = await resizeAndCompressImage(result);
                                    setDepositScreenshot(compressed);
                                    setVerifyResponseMsg(null);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {!depositScreenshot ? (
                            <label htmlFor="deposit-screenshot-file" className="cursor-pointer flex flex-col items-center justify-center gap-3 py-3">
                              <div className="w-12 h-12 rounded-full bg-blue-500/5 flex items-center justify-center border border-blue-500/10 text-blue-400 transition hover:bg-blue-500/10">
                                <Upload size={20} />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-200 block">Click to upload screenshot</span>
                                <span className="text-[10px] text-slate-500 mt-1 block">Supports bKash, Nagad, Rocket receipt images</span>
                              </div>
                            </label>
                          ) : (
                            <div className="space-y-4">
                              <div className="relative rounded-lg overflow-hidden border border-[#1e2336] max-h-[220px] bg-slate-950 flex items-center justify-center">
                                <img
                                  src={depositScreenshot}
                                  alt="Payment Screenshot Preview"
                                  className="max-h-[210px] object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() => setDepositScreenshot(null)}
                                  className="absolute top-2 right-2 bg-red-650 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors cursor-pointer shadow-md"
                                  title="Remove Image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-mono font-black block bg-emerald-500/5 py-1 rounded border border-emerald-500/10">
                               ✓ Screenshot loaded and ready for verification
                              </span>
                            </div>
                          )}
                        </div>

                        {verifyResponseMsg && (
                          <div className="text-xs text-blue-400 bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                            <span className="font-semibold font-mono">{verifyResponseMsg}</span>
                          </div>
                        )}

                        {depError && (
                          <div className="flex items-center gap-2.5 px-4 py-3 border border-red-500/20 bg-red-500/[0.04] text-red-400 rounded-lg text-xs leading-relaxed">
                            <AlertCircle size={15} className="shrink-0" />
                            {depError}
                          </div>
                        )}

                        {/* COMPLETED ACTIONS */}
                        <div className="space-y-2">
                          <button
                            onClick={() => handleCompleteDeposit()}
                            disabled={!depositScreenshot || isVerifyingScreenshot}
                            className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                          >
                            {isVerifyingScreenshot ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying Screenshot...
                              </>
                            ) : (
                              "Verify & Auto-Add Balance"
                            )}
                          </button>

                          <button
                            onClick={async () => {
                              // Skip OCR and submit directly for manual review
                              setIsVerifyingScreenshot(true);
                              setDepError(null);
                              setVerifyResponseMsg('Submitting deposit for manual review...');
                              const amt = parseFloat(depositAmount);
                              const methodStr = selectedMethod || 'bkash';

                              try {
                                const cached = localStorage.getItem('dih_smm_deposits_v2');
                                let currentDeps = [];
                                if (cached) {
                                  try { currentDeps = JSON.parse(cached); } catch (e) { console.error(e); }
                                }
                                const nextDepId = currentDeps.length ? Math.max(...currentDeps.map((d: any) => d.id || 0)) + 1 : 1;

                                const newDeposit = {
                                  id: nextDepId,
                                  userId: userToUse?.id || 999,
                                  userEmail: userEmail,
                                  userName: userName,
                                  amount: amt,
                                  method: methodStr,
                                  sender: 'N/A',
                                  txid: transactionId.replace(/\s+/g, '').trim(),
                                  status: 'pending',
                                  screenshot: depositScreenshot || undefined,
                                  aiReason: "Requested manual review directly.",
                                  date: new Date().toISOString().split('T')[0]
                                };

                                const updatedDeps = [...currentDeps, newDeposit];
                                saveDeposits(updatedDeps);

                                setDepositAmount('');
                                setSenderDetails('');
                                setTransactionId('');
                                setDepositScreenshot(null);
                                setDepositStep('form');
                                setDepSuccess(`Deposit of $${fmtAmt(amt)} via ${methodStr.toUpperCase()} submitted to pending list! SMM admin will verify manually.`);
                              } catch (err) {
                                setDepError('Failed to submit. Please try again.');
                              } finally {
                                setIsVerifyingScreenshot(false);
                                setVerifyResponseMsg(null);
                              }
                            }}
                            disabled={isVerifyingScreenshot}
                            className="w-full py-2 bg-slate-900 border border-[#1e2336] hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                          >
                            Submit Directly for Manual Review
                          </button>
                        </div>
                      </div>
                    )}

                    {/* USER DEPOSIT TRANSACTIONS LOG */}
                    <div className="mt-8 border-t border-[#1e2336]/60 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Your Deposit Transactions History
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Email: {userEmail}
                        </span>
                      </div>

                      {(() => {
                        const myDeps = localDeposits.filter((d: any) => d.userEmail === userEmail || d.userId === userToUse?.id);

                        if (myDeps.length === 0) {
                          return (
                            <div className="text-center py-6 border border-dashed border-[#1e2336] rounded-xl text-xs text-slate-500 bg-[#0d0f16]/30">
                              No deposit transactions submitted yet for <span className="font-mono text-slate-400 font-medium">{userEmail}</span>.
                            </div>
                          );
                        }

                        return (
                          <div className="overflow-x-auto rounded-xl border border-[#1e2336] bg-[#0d0f16]/50">
                            <table className="w-full text-left text-[11px] text-slate-300">
                              <thead>
                                <tr className="bg-[#121622] border-b border-[#1e2336] text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                                  <th className="px-3.5 py-2.5">Date</th>
                                  <th className="px-3.5 py-2.5">Gateway</th>
                                  <th className="px-3.5 py-2.5">TxID</th>
                                  <th className="px-3.5 py-2.5 text-right">Amount</th>
                                  <th className="px-3.5 py-2.5 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#1e2336]/40">
                                {myDeps.slice().reverse().map((d: any) => (
                                  <tr key={d.id} className="hover:bg-[#151926]/30 transition-colors">
                                    <td className="px-3.5 py-3 text-slate-400">{d.date || 'Pending'}</td>
                                    <td className="px-3.5 py-3 font-semibold uppercase">{d.method}</td>
                                    <td className="px-3.5 py-3 font-mono text-[10px] text-slate-500 truncate max-w-[100px]" title={d.txid}>
                                      {d.txid}
                                    </td>
                                    <td className="px-3.5 py-3 text-right font-bold text-emerald-400">
                                      ${parseFloat(d.amount).toFixed(2)}
                                    </td>
                                    <td className="px-3.5 py-3 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                        d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        d.status === 'rejected' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                                        'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                      }`}>
                                        {d.status || 'pending'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* Elegant Mobile-Accessible Footer */}
            <div className="mt-12 pt-6 border-t border-[#1e2336]/30 text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                © 2026 DIH HUB OFFICIAL - ALL RIGHTS RESERVED
              </p>
            </div>

          </div>
        </div>
      </main>

      </div>
    </div>
  );

  // Private helpers
  function selectMethodTab(m: 'bkash' | 'nagad' | 'rocket' | 'card' | 'crypto') {
    setSelectedMethod(m);
    setDepError(null);
    setDepSuccess(null);
  }

  function handleQuickSelect(v: number) {
    setDepositAmount(v.toString());
    setDepError(null);
    setDepSuccess(null);
  }

  function activeCategory() {
    return activeCat;
  }

  function setCat(c: string) {
    setActiveCat(c);
  }

  function goOrder(id: number) {
    navigate('new-order', id);
  }

  function filterOrders(status: string) {
    setActiveFilter(status);
  }

  function toggleDropdown() {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) {
      setDdSearchQuery('');
    }
  }
}
