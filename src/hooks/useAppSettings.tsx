import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { OFFICIAL_LETTERHEAD_SVG } from '../templates/officialLetterhead';
import { NID_FRONT_SVG, NID_BACK_SVG } from '../templates/nidTemplate';

export interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
  elements: any[];
  svg?: string;
}

export interface AppSettings {
  appName: string;
  appDescription: string;
  footerText: string;
  visibleTools: string[];
  newTools: string[];
  newBadgeText: string;
  faviconUrl?: string;
  appLogoUrl?: string;
  toolLabels: Record<string, string>;
  toolDescriptions: Record<string, string>;
  bgRemoverApiKey: string;
  templates: Template[];
  downloaderApis: string[];
  primaryColor: string;
  accentColor: string;
  showScanlines: boolean;
  enableGlassmorphism: boolean;
  headerOperatorLabel: string;
  sidebarSystemCoreLabel: string;
  headerControlInterfaceLabel: string;
  dashboardInfrastructureLabel: string;
  appVersionLabel: string;
  activeLinkLabel: string;
  dashboardStats: { label: string; value: string }[];
  enableLiveUserCounter: boolean;
  liveUserBaseValue: number;
  liveUserRange: number;
  defaultQRUrl: string;
  paybdApiKey: string;
  paybdExchangeRate: number;
  paybdSiteUrl: string;
  paybdCurrency: 'BDT' | 'USD';
  movieApiKey: string;
  tmdbApiKey: string;
  moviePlayerServer: string;
  vidsrcApiKey: string;
  rapidApiKey: string;
  tempSmsApiKey: string;
  apkStorePublicMessage: string;
  enableAds: boolean;
  adsterraHeader: string;
  adsterraFooter: string;
  adsenseHeader: string;
  manualAdLink: string;
  manualAdImage: string;
  manualAdTitle: string;
  enableAdsterra: boolean;
  enableAdsense: boolean;
  enableManualAds: boolean;
  adScriptInContent: string;
  adScriptInContent2: string;
  trafficAnalysisUrl: string;
  trafficAnalysisDescription: string;
  trafficDailyValue: string;
  trafficDailyTrend: string;
  trafficMonthlyValue: string;
  trafficMonthlyTrend: string;
  trafficPagesValue: string;
  trafficPagesTrend: string;
  trafficDurationValue: string;
  trafficDurationTrend: string;
  trafficRevenueValue: string;
  trafficRevenueTrend: string;
  // Movie App Customization
  movieAutoRotateHero: boolean;
  movieAutoRotateInterval: number;
  movieShowLanguageSection: boolean;
  movieHeroSlidesCount: number;
  movieActorProfileEnabled: boolean;
  movieBrowseByGenreEnabled: boolean;
  movieSearchEnabled: boolean;
  movieShowTrendingBadge: boolean;
  movieShowWeeklyTrending: boolean;
  movieShowPopular: boolean;
  movieShowNowPlaying: boolean;
  movieShowComingSoon: boolean;
  movieShowGenreRows: boolean;
  movieShowTopRated: boolean;
  movieShowHeroDescription: boolean;
  movieShowHeroScore: boolean;
  movieShowHeroDetailsButton: boolean;
  movieShowCastSection: boolean;
  movieShowSimilarMovies: boolean;
  toolDailyCompoundEnabled: boolean;
  downloaderEnableFacebook: boolean;
  downloaderEnableYouTube: boolean;
  downloaderEnableTikTok: boolean;
  downloaderEnableInstagram: boolean;
  downloaderEnablePornhub: boolean;
  downloaderEnableTwitter: boolean;
  downloaderEnableVimeo: boolean;
  downloaderEnablePinterest: boolean;
  downloaderEnableLinkedIn: boolean;
  downloaderEnableReddit: boolean;
  downloaderEnableSnapchat: boolean;
  downloaderEnableTwitch: boolean;
  downloaderEnableThreads: boolean;
  storeEnableApks: boolean;
  storeEnableAccounts: boolean;
  smmDefaultBalance: number;
  smmPriceMultiplier: number;
  smmSystemNotice: string;
  smmPaymentMethods: string[];
  smmEnableColorTheme?: boolean;
  bachelorEnableColorTheme?: boolean;
  bachelorShowStarring?: boolean;
  smmUsdToBdtRate?: number;
  smmShortcutMappings?: Record<string, number[]>;
  disabledTools?: string[];
  toolNotices?: Record<string, string>;
  upcomingTools?: string[];
  comingSoonTools?: string[];
  smmManualGateways?: any[];
  showDevelopedBy?: boolean;
  smmGameDeliveryNote?: string;
  smmOldFbDeliveryNote?: string;
  enableMemberAccess?: boolean;
}

const DEFAULT_TEMPLATES: Template[] = [
  { 
    id: '3', 
    name: 'Official Letterhead', 
    width: 595, 
    height: 842, 
    category: 'Letterhead', 
    elements: [],
    svg: OFFICIAL_LETTERHEAD_SVG
  },
  { 
    id: 'nid-front', 
    name: 'NID Front (Old)', 
    width: 500, 
    height: 320, 
    category: 'NID', 
    elements: [],
    svg: NID_FRONT_SVG
  },
  { 
    id: 'nid-back', 
    name: 'NID Back (Old)', 
    width: 500, 
    height: 320, 
    category: 'NID', 
    elements: [],
    svg: NID_BACK_SVG
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'DIH HUB',
  appDescription: 'Digital Innovation House Hub — Next-Gen Professional Utility & Multimedia Suite',
  footerText: '© 2024 DIH HUB (Digital Innovation House Hub). All rights reserved.',
  visibleTools: ['qr', 'encryption', 'to-base64', 'bg-remover', 'video', 'dex-protector', 'lib-encryptor', 'apk-store', 'dih-movies', 'bachelor-point', 'mobile-bypass', 'hosted-admin', 'dih-smm'],
  newTools: ['qr', 'encryption', 'to-base64', 'bg-remover', 'video', 'dex-protector', 'lib-encryptor', 'apk-store', 'dih-movies', 'bachelor-point', 'mobile-bypass', 'hosted-admin', 'dih-smm'],
  newBadgeText: 'NEW',
  faviconUrl: '/favicon-dih.png',
  appLogoUrl: '',
  toolLabels: {
    'qr': 'QR Code Tools',
    'encryption': 'Secure Encryption',
    'to-base64': 'Base64 Converter',
    'bg-remover': 'Background Remover',
    'nid': 'NID Card Maker',
    'video': 'Video Downloader',
    'lib-encryptor': 'Lib Protector',
    'dex-protector': 'DEX Protector',
    'apk-store': 'APK Store',
    'dih-movies': 'Dih Movies',
    'bachelor-point': 'Bachelor Point S-5',
    'mobile-bypass': 'Mobile Bypass Pro',
    'hosted-admin': 'DIH Templates'
  },
  toolDescriptions: {
    'qr': 'Create custom QR codes for links or text.',
    'encryption': 'Lock your messages with a secure password.',
    'to-base64': 'Convert text or files to/from Base64 strings.',
    'bg-remover': 'Remove image backgrounds in one click.',
    'nid': 'Generate printable copies of NID cards.',
    'video': 'Save videos from Facebook or YouTube.',
    'lib-encryptor': 'Protect your files with encryption.',
    'dex-protector': 'Secure your Android app files.',
    'apk-store': 'Download premium apps and resources.',
    'dih-movies': 'Watch free movies and shows online.',
    'bachelor-point': 'Manually manage, upload, and stream high fidelity exclusive video contents.',
    'mobile-bypass': '100% Working Mobile FRP, MDM & Bootloader Bypass solution.',
    'hosted-admin': 'Premium quality landing page showcase and live deployment portal.'
  },
  bgRemoverApiKey: 'DIHTEMPLATE_FREE_KEY',
  templates: DEFAULT_TEMPLATES,
  downloaderApis: [
    'https://cobalt.hyrax.ink/api/json',
    'https://cobalt.crichly.com/api/json',
    'https://api.cobalt.best/api/json'
  ],
  primaryColor: '#3b82f6',
  accentColor: '#6366f1',
  showScanlines: false,
  enableGlassmorphism: true,
  headerOperatorLabel: 'Admin',
  sidebarSystemCoreLabel: 'Options',
  headerControlInterfaceLabel: 'Status',
  dashboardInfrastructureLabel: 'System',
  appVersionLabel: 'v1.0',
  activeLinkLabel: 'Online',
  dashboardStats: [
    { label: 'Total Users', value: '20.4k+' },
    { label: 'Daily Users', value: '5.2k+' },
    { label: 'Uptime', value: '100% Core' },
  ],
  enableLiveUserCounter: true,
  liveUserBaseValue: 20245,
  liveUserRange: 450,
  defaultQRUrl: 'https://dihhub.site',
  paybdApiKey: '',
  paybdExchangeRate: 110,
  paybdSiteUrl: 'https://ais-dev-nfwyd43crdrwbpwg3sdssy-663044304859.asia-east1.run.app',
  paybdCurrency: 'USD',
  movieApiKey: '',
  tmdbApiKey: 'aa53c992e50edfd89401fdf7f394dae4',
  moviePlayerServer: 'vidsrc.to',
  vidsrcApiKey: '',
  rapidApiKey: '',
  tempSmsApiKey: '',
  apkStorePublicMessage: 'Download Premium Apps & Tools',
  enableAds: false,
  adsterraHeader: '',
  adsterraFooter: '',
  adsenseHeader: '',
  manualAdLink: '',
  manualAdImage: '',
  manualAdTitle: '',
  enableAdsterra: false,
  enableAdsense: false,
  enableManualAds: false,
  adScriptInContent: '',
  adScriptInContent2: '',
  trafficAnalysisUrl: 'DIH.HUB.SYSTEM',
  trafficAnalysisDescription: 'DIH HUB (Digital Innovation House Hub) is currently ranked in the top tier of utility services providing secure multimedia and document processing to millions of users worldwide.',
  trafficDailyValue: '3.2k+',
  trafficDailyTrend: '+12.4%',
  trafficMonthlyValue: '96.4k',
  trafficMonthlyTrend: '+14.8%',
  trafficPagesValue: '375',
  trafficPagesTrend: 'Active',
  trafficDurationValue: '100%',
  trafficDurationTrend: 'Core',
  trafficRevenueValue: '$4,280',
  trafficRevenueTrend: '+28.4%',
  // Movie App Defaults
  movieAutoRotateHero: true,
  movieAutoRotateInterval: 7000,
  movieShowLanguageSection: true,
  movieHeroSlidesCount: 5,
  movieActorProfileEnabled: true,
  movieBrowseByGenreEnabled: true,
  movieSearchEnabled: true,
  movieShowTrendingBadge: true,
  movieShowWeeklyTrending: true,
  movieShowPopular: true,
  movieShowNowPlaying: true,
  movieShowComingSoon: true,
  movieShowGenreRows: true,
  movieShowTopRated: true,
  movieShowHeroDescription: true,
  movieShowHeroScore: true,
  movieShowHeroDetailsButton: true,
  movieShowCastSection: true,
  movieShowSimilarMovies: true,
  toolDailyCompoundEnabled: true,
  downloaderEnableFacebook: true,
  downloaderEnableYouTube: true,
  downloaderEnableTikTok: true,
  downloaderEnableInstagram: true,
  downloaderEnablePornhub: true,
  downloaderEnableTwitter: true,
  downloaderEnableVimeo: true,
  downloaderEnablePinterest: true,
  downloaderEnableLinkedIn: true,
  downloaderEnableReddit: true,
  downloaderEnableSnapchat: true,
  downloaderEnableTwitch: true,
  downloaderEnableThreads: true,
  storeEnableApks: true,
  storeEnableAccounts: true,
  smmDefaultBalance: 0.00,
  smmPriceMultiplier: 1.0,
  smmSystemNotice: 'Welcome to DIH SMM Panel! Enjoy safe, fast SMM panel services at the best rates in World.',
  smmPaymentMethods: ['bkash', 'nagad', 'rocket', 'card', 'crypto'],
  smmEnableColorTheme: true,
  bachelorEnableColorTheme: true,
  bachelorShowStarring: true,
  smmUsdToBdtRate: 120,
  smmShortcutMappings: {},
  disabledTools: ['mobile-bypass'],
  toolNotices: {},
  upcomingTools: [],
  comingSoonTools: [],
  showDevelopedBy: true,
  enableMemberAccess: true,
  smmGameDeliveryNote: "Since this is a game recharge or custom accounts order, there is no automatic system delivery. Once you submit your order, we will reach out to you directly at your email address to provide full account credentials or recharge details.",
  smmOldFbDeliveryNote: "Since this is a custom or old social accounts order, there is no automatic system delivery. Once you submit your order, we will reach out to you directly at your email address to deliver full account credentials.",
  smmManualGateways: [
    { id: 'bkash', title: 'bKash Merchant', numberOrAddress: '+8801835313433', type: 'Merchant', instructions: 'Send payment using bKash Merchant Pay, then submit your Transaction ID (TxID).', enabled: true, minDeposit: 5 },
    { id: 'nagad', title: 'Nagad Wallet', numberOrAddress: '+8801602469609', type: 'Personal', instructions: 'Send money to our Personal Nagad wallet, and put TxID above.', enabled: true, minDeposit: 5 },
    { id: 'upay', title: 'Upay Wallet', numberOrAddress: '+8801800005544', type: 'Personal', instructions: 'Transfer via Upay, submit the Reference or TxID.', enabled: false, minDeposit: 2.5 },
    { id: 'rocket', title: 'Rocket Mobile', numberOrAddress: '+8801500000000-1', type: 'Personal', instructions: 'Send money to Rocket wallet, enter target transaction details.', enabled: false, minDeposit: 2.5 },
    { id: 'card', title: 'Cards (Visa/Master)', numberOrAddress: 'contact@dihhub.site', type: 'Merchant Checkout Link', instructions: 'Submit request with the desired funding amount. Support will deliver a credit card payment checkout link.', enabled: true, minDeposit: 20 },
    { id: 'binance', title: 'Binance Pay ID', numberOrAddress: '495331860', type: 'Merchant Pay ID', instructions: 'Pay using your Binance App using Binance Pay ID. Provide Binance account nickname.', enabled: true, minDeposit: 2.5 },
    { id: 'usdt', title: 'USDT (BSC - BEP20)', numberOrAddress: '0x09cb303036f305407df1e74614fbd894b988cdd4', type: 'BSC Address', instructions: 'Send the exact USDT amount via BSC (BNB Smart Chain / BEP20) Network. Paste TxHash / TxID once done.', enabled: true, minDeposit: 2.5 }
  ]
};

const DELETED_TOOLS = [
  'temp-mail', 'temp-sms', 'tenmin-ai', 
  'passport', 'auto-passport', 'design-editor', 'cut-downloader', 'migration'
];

export interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('dh_v3_settings');
      if (!saved) return DEFAULT_SETTINGS;
      
      const parsed = JSON.parse(saved);
      if (!parsed) return DEFAULT_SETTINGS;
      
      const parsedVisibleTools = (Array.isArray(parsed.visibleTools) ? parsed.visibleTools : DEFAULT_SETTINGS.visibleTools)
        .filter((t: string) => !DELETED_TOOLS.includes(t));
      const healedVisibleTools = parsedVisibleTools;
      
      // Ensure all default templates are present
      const existingIds = new Set(parsed.templates?.map((t: any) => t.id) || []);
      const mergedTemplates = [
        ...(parsed.templates || []),
        ...DEFAULT_TEMPLATES.filter(t => !existingIds.has(t.id))
      ];

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        primaryColor: parsed.primaryColor || DEFAULT_SETTINGS.primaryColor,
        toolLabels: { ...DEFAULT_SETTINGS.toolLabels, ...(parsed.toolLabels || {}) },
        toolDescriptions: { ...DEFAULT_SETTINGS.toolDescriptions, ...(parsed.toolDescriptions || {}) },
        appName: parsed.appName || DEFAULT_SETTINGS.appName,
        footerText: parsed.footerText || DEFAULT_SETTINGS.footerText,
        dashboardStats: parsed.dashboardStats || DEFAULT_SETTINGS.dashboardStats,
        templates: mergedTemplates,
        visibleTools: healedVisibleTools,
        upcomingTools: (parsed.upcomingTools ?? DEFAULT_SETTINGS.upcomingTools).filter((t: string) => !DELETED_TOOLS.includes(t)),
        comingSoonTools: (parsed.comingSoonTools ?? DEFAULT_SETTINGS.comingSoonTools).filter((t: string) => !DELETED_TOOLS.includes(t)),
        disabledTools: parsed.disabledTools ?? DEFAULT_SETTINGS.disabledTools
      };
    } catch (e) {
      console.error('Failed to safe-parse saved app settings, falling back to default:', e);
      return DEFAULT_SETTINGS;
    }
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Sync with server on mount
    const fetchGlobalSettings = async () => {
      try {
        const res = await fetch(`/api/admin/settings?t=${Date.now()}`);
        if (res.ok) {
          const globalSettings = await res.json();
          if (globalSettings) {
             const serverVisibleTools = (Array.isArray(globalSettings.visibleTools) ? globalSettings.visibleTools : DEFAULT_SETTINGS.visibleTools)
               .filter((t: string) => !DELETED_TOOLS.includes(t));
             const healedVisibleTools = serverVisibleTools;

             setSettings(prev => ({
               ...prev,
               ...globalSettings,
               visibleTools: healedVisibleTools,
               newTools: (Array.isArray(globalSettings.newTools) ? globalSettings.newTools : DEFAULT_SETTINGS.newTools).filter((t: string) => !DELETED_TOOLS.includes(t)),
               // Merge templates to avoid losing local ones if needed, 
               // but typically admin wants total control
               templates: globalSettings.templates || prev.templates
             }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch global settings:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('dh_v3_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    let faviconUrl = settings.faviconUrl || '/favicon-dih.png';
    if (faviconUrl === '/favicon.png' || faviconUrl === '/favicon.ico' || faviconUrl === 'favicon.png' || faviconUrl === 'favicon.ico') {
      faviconUrl = '/favicon-dih.png';
    }
    if (faviconUrl && !faviconUrl.startsWith('/') && !faviconUrl.startsWith('http') && !faviconUrl.startsWith('data:')) {
      faviconUrl = '/' + faviconUrl;
    }
    const links = document.querySelectorAll("link[rel*='icon']");
    links.forEach((link: any) => {
      link.href = faviconUrl;
    });
    const appleLink = document.querySelector("link[rel='apple-touch-icon']") as any;
    if (appleLink) {
      appleLink.href = faviconUrl;
    }
  }, [settings.faviconUrl]);

  const lastLocalUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isLoaded) return;

    let isAdmin = false;
    try {
      const savedUser = localStorage.getItem('dihhub_user');
      if (savedUser && savedUser !== "undefined") {
        const parsedUser = JSON.parse(savedUser);
        isAdmin = !!(parsedUser?.role === 'admin' || parsedUser?.isAdmin || parsedUser?.email?.toLowerCase() === 'rafcin.b' || parsedUser?.email?.toLowerCase() === 'contact@dihhub.site' || parsedUser?.email?.toLowerCase() === 'rafcinbhuiyan85@gmail.com');
      }
    } catch (e) {}

    if (!isAdmin) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      console.log('💾 Auto-saving updated settings to server...');
      fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }).catch(err => {
        console.error('Failed to auto-save settings to server:', err);
      });
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [settings, isLoaded]);

  // Broadcast settings updates in real-time
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const channel = new BroadcastChannel('dh_settings_sync');
      channel.postMessage({ type: 'SETTINGS_UPDATE', settings });
      channel.close();
    } catch (e) {
      // BroadcaseChannel fallback
    }
  }, [settings, isLoaded]);

  // Real-time synchronization across same-browser tabs/iframes via BroadcastChannel
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('dh_settings_sync');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SETTINGS_UPDATE') {
          const incoming = event.data.settings;
          setSettings(prev => {
            const prevStr = JSON.stringify(prev);
            const incomingStr = JSON.stringify(incoming);
            if (prevStr !== incomingStr) {
              return incoming;
            }
            return prev;
          });
        }
      };
      return () => {
        channel.close();
      };
    } catch (e) {
      // Degrade gracefully
    }
  }, []);

  // Real-time synchronization across same-browser tabs/iframes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dh_v3_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            setSettings(prev => {
              const prevStr = JSON.stringify(prev);
              const newStr = JSON.stringify({ ...prev, ...parsed });
              if (prevStr !== newStr) {
                return { ...prev, ...parsed };
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Failed to sync settings from storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Real-time synchronization across different devices/browsers via polling
  useEffect(() => {
    const syncWithServer = async () => {
      // Avoid overwriting settings if recently modified locally (idle time of 4 seconds)
      if (Date.now() - lastLocalUpdateRef.current < 4000) return;

      try {
        const res = await fetch(`/api/admin/settings?t=${Date.now()}`);
        if (res.ok) {
          const globalSettings = await res.json();
          if (globalSettings) {
            setSettings(prev => {
              const prevStr = JSON.stringify({ ...prev, templates: [] });
              const globalStr = JSON.stringify({ ...globalSettings, templates: [] });
              if (prevStr !== globalStr) {
                const serverVisibleTools = (Array.isArray(globalSettings.visibleTools) ? globalSettings.visibleTools : DEFAULT_SETTINGS.visibleTools)
                  .filter((t: string) => !DELETED_TOOLS.includes(t));
                return {
                  ...prev,
                  ...globalSettings,
                  visibleTools: serverVisibleTools,
                  newTools: (Array.isArray(globalSettings.newTools) ? globalSettings.newTools : DEFAULT_SETTINGS.newTools).filter((t: string) => !DELETED_TOOLS.includes(t)),
                  templates: globalSettings.templates || prev.templates
                };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('Failed to query global settings during polling:', err);
      }
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncWithServer();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    lastLocalUpdateRef.current = Date.now();
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addTemplate = (template: Template) => {
    lastLocalUpdateRef.current = Date.now();
    setSettings(prev => ({ ...prev, templates: [...prev.templates, template] }));
  };

  const removeTemplate = (id: string) => {
    lastLocalUpdateRef.current = Date.now();
    setSettings(prev => ({ ...prev, templates: prev.templates.filter(t => t.id !== id) }));
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, addTemplate, removeTemplate }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
