import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
  disabledTools?: string[];
  toolNotices?: Record<string, string>;
  upcomingTools?: string[];
  comingSoonTools?: string[];
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
  visibleTools: ['qr', 'encryption', 'to-base64', 'auto-passport', 'video', 'dex-protector', 'lib-encryptor', 'dih-movies', 'mobile-bypass', 'hosted-admin'],
  newTools: ['qr', 'encryption', 'to-base64', 'auto-passport', 'video', 'dex-protector', 'lib-encryptor', 'dih-movies', 'mobile-bypass', 'hosted-admin'],
  newBadgeText: 'NEW',
  toolLabels: {
    'tenmin-ai': '10Min AI Voice',
    'qr': 'QR Code Tools',
    'encryption': 'Secure Encryption',
    'to-base64': 'Base64 Converter',
    'bg-remover': 'Background Remover',
    'passport': 'Passport Photo',
    'auto-passport': 'Auto Passport',
    'nid': 'NID Card Maker',
    'video': 'Video Downloader',
    'cut-downloader': 'Cut Downloader',
    'design-editor': 'Design Editor',
    'lib-encryptor': 'Lib Protector',
    'dex-protector': 'DEX Protector',
    'apk-store': 'APK Store',
    'dih-movies': 'Dih Movies',
    'bachelor-point': 'Bachelor Point S-5',
    'temp-mail': 'Temp Mail',
    'temp-sms': 'Temp SMS',
    'mobile-bypass': 'Mobile Bypass Pro',
    'hosted-admin': 'DIH TEMPLATE'
  },
  toolDescriptions: {
    'tenmin-ai': 'Practice speaking Bengali, English, and Japanese on real-time voice calls.',
    'qr': 'Create custom QR codes for links or text.',
    'encryption': 'Lock your messages with a secure password.',
    'to-base64': 'Convert text or files to Base64 code.',
    'bg-remover': 'Remove image backgrounds in one click.',
    'passport': 'Create passport size photos for printing.',
    'auto-passport': 'Professional passport photo generation.',
    'nid': 'Generate printable copies of NID cards.',
    'video': 'Save videos from Facebook or YouTube.',
    'cut-downloader': 'Trim and download specific parts of any video.',
    'design-editor': 'Edit and design your photos easily.',
    'lib-encryptor': 'Protect your files with encryption.',
    'dex-protector': 'Secure your Android app files.',
    'apk-store': 'Download premium apps and resources.',
    'dih-movies': 'Watch free movies and shows online.',
    'bachelor-point': 'Manually manage, upload, and stream high fidelity exclusive video contents.',
    'temp-mail': 'Get a temporary email for private registrations.',
    'temp-sms': 'Temporary phone numbers for OTP verification.',
    'mobile-bypass': '100% Working Mobile FRP, MDM & Bootloader Bypass solution.',
    'hosted-admin': 'Share your favorite DIH templates with your favorite people.'
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
  disabledTools: ['mobile-bypass'],
  toolNotices: {},
  upcomingTools: [],
  comingSoonTools: ['auto-passport']
};

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
      
      const parsedVisibleTools = Array.isArray(parsed.visibleTools) ? parsed.visibleTools : [];
      const healedVisibleTools = [...new Set([...parsedVisibleTools, ...DEFAULT_SETTINGS.visibleTools])];
      
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
        upcomingTools: parsed.upcomingTools ?? DEFAULT_SETTINGS.upcomingTools,
        comingSoonTools: parsed.comingSoonTools ?? DEFAULT_SETTINGS.comingSoonTools,
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
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const globalSettings = await res.json();
          if (globalSettings) {
             const serverVisibleTools = Array.isArray(globalSettings.visibleTools) ? globalSettings.visibleTools : [];
             const healedVisibleTools = [...new Set([...serverVisibleTools, ...DEFAULT_SETTINGS.visibleTools])];

             setSettings(prev => ({
               ...prev,
               ...globalSettings,
               visibleTools: healedVisibleTools,
               newTools: [...new Set([...(globalSettings.newTools || Array.isArray(globalSettings.visibleTools) ? globalSettings.newTools : []), ...DEFAULT_SETTINGS.newTools])],
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
    if (!isLoaded) return;

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

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addTemplate = (template: Template) => {
    setSettings(prev => ({ ...prev, templates: [...prev.templates, template] }));
  };

  const removeTemplate = (id: string) => {
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
