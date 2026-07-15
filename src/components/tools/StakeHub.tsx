import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trophy, Zap, Coins, Flame, ExternalLink, 
  Play, Info, Sparkles, MessageSquare, Send, 
  Smartphone, ArrowRight, Laptop, Globe, Dices,
  Copy, Check, Star, RefreshCw, Volume2, VolumeX, ShieldCheck, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSettings } from '../../hooks/useAppSettings';

interface StakeHubProps {
  currentUser?: any;
}

type LangKey = 'bn' | 'en' | 'hi' | 'ar';

interface CasinoPlatform {
  id: string;
  name: string;
  referralLink: string;
  promoCode: string;
  badge: string;
  categoryBn: string;
  categoryEn: string;
  categoryHi: string;
  categoryAr: string;
  themeColor: string; // 'emerald' | 'orange' | 'blue' | 'cyan' | 'amber' | 'green'
  bgGradient: string;
  borderGlow: string;
}

const platforms: CasinoPlatform[] = [
  {
    id: 'stake',
    name: 'STAKE',
    referralLink: 'https://stake.com/?c=0Fq8I4Z9',
    promoCode: '0Fq8I4Z9',
    badge: 'INTERNATIONAL',
    categoryBn: 'আন্তর্জাতিক প্রিমিয়াম ক্যাসিনো',
    categoryEn: 'International Premium Casino',
    categoryHi: 'अंतर्राष्ट्रीय प्रीमियम कैसीनो',
    categoryAr: 'كازينو بريميوم عالمي',
    themeColor: 'emerald',
    bgGradient: 'from-emerald-950/45 via-slate-950 to-emerald-950/45',
    borderGlow: 'shadow-[0_0_50px_rgba(16,185,129,0.15)] border-emerald-500/30'
  },
  {
    id: 'playtok',
    name: 'PLAYTOK',
    referralLink: 'https://playtok.win/app_bd.html?userId=6542945&currency=BDT&from=earncash',
    promoCode: 'DIH777',
    badge: 'BANGLADESHI',
    categoryBn: 'জনপ্রিয় বাংলাদেশী ক্যাসিনো গেম',
    categoryEn: 'Popular Bangladeshi Casino Game',
    categoryHi: 'लोकप्रिय बांग्लादेशी कैसीनो गेम',
    categoryAr: 'لعبة كازينو بنغلاديشية شهيرة',
    themeColor: 'rose',
    bgGradient: 'from-rose-950/45 via-slate-950 to-rose-950/45',
    borderGlow: 'shadow-[0_0_50px_rgba(244,63,94,0.15)] border-rose-500/30'
  },
  {
    id: '77bd',
    name: '77BD',
    referralLink: 'https://77bd.tv/?dl=cpl5yi',
    promoCode: 'DIH777',
    badge: 'BANGLADESHI',
    categoryBn: 'জনপ্রিয় বাংলাদেশী ক্যাসিনো গেম',
    categoryEn: 'Popular Bangladeshi Casino Game',
    categoryHi: 'लोकप्रिय बांग्लादेशी कैसीनो गेम',
    categoryAr: 'لعبة كازينو بنغلاديشية شهيرة',
    themeColor: 'violet',
    bgGradient: 'from-violet-950/45 via-slate-950 to-violet-950/45',
    borderGlow: 'shadow-[0_0_50px_rgba(139,92,246,0.15)] border-violet-500/30'
  },
  {
    id: '99xo',
    name: '99XO',
    referralLink: 'https://www.99xo.ltd/?dl=f967o9',
    promoCode: 'DIH777',
    badge: 'BANGLADESHI',
    categoryBn: 'জনপ্রিয় বাংলাদেশী ক্যাসিনো গেম',
    categoryEn: 'Popular Bangladeshi Casino Game',
    categoryHi: 'लोकप्रिय बांग्लादेशी कैसीनो गेम',
    categoryAr: 'لعبة كازينو بنغلاديشية شهيرة',
    themeColor: 'amber',
    bgGradient: 'from-amber-950/45 via-slate-950 to-amber-950/45',
    borderGlow: 'shadow-[0_0_50px_rgba(245,158,11,0.15)] border-amber-500/30'
  },
  {
    id: '678bd',
    name: '678BD',
    referralLink: 'https://678bd.vip/?dl=evfnil',
    promoCode: 'DIH777',
    badge: 'BANGLADESHI',
    categoryBn: 'জনপ্রিয় বাংলাদেশী ক্যাসিনো গেম',
    categoryEn: 'Popular Bangladeshi Casino Game',
    categoryHi: 'लोकप्रिय बांग्लादेशी कैसीनो गेम',
    categoryAr: 'لعبة كازينو بنغلاديشية شهيرة',
    themeColor: 'blue',
    bgGradient: 'from-blue-950/45 via-slate-950 to-blue-950/45',
    borderGlow: 'shadow-[0_0_50px_rgba(59,130,246,0.15)] border-blue-500/30'
  }
];

const themeColorMap: Record<string, {
  hoverBorder: string;
  hoverBg: string;
  iconBg: string;
  iconText: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  activeLangBg: string;
  accentGlow: string;
  mainBtnBg: string;
  liveIndicatorBg: string;
  liveIndicatorPing: string;
}> = {
  emerald: {
    hoverBorder: 'hover:border-emerald-500/40 shadow-emerald-950/25 hover:shadow-2xl',
    hoverBg: 'hover:bg-emerald-950/20',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/25',
    iconText: 'text-emerald-400 group-hover:text-emerald-300',
    accentText: 'text-emerald-400 group-hover:text-emerald-300',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    activeLangBg: 'bg-emerald-600 text-white',
    accentGlow: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    mainBtnBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20',
    liveIndicatorBg: 'bg-emerald-500',
    liveIndicatorPing: 'bg-emerald-400'
  },
  rose: {
    hoverBorder: 'hover:border-rose-500/40 shadow-rose-950/25 hover:shadow-2xl',
    hoverBg: 'hover:bg-rose-950/20',
    iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/25',
    iconText: 'text-rose-400 group-hover:text-rose-300',
    accentText: 'text-rose-400 group-hover:text-rose-300',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/20',
    activeLangBg: 'bg-rose-600 text-white',
    accentGlow: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    mainBtnBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-slate-950 shadow-rose-500/20',
    liveIndicatorBg: 'bg-rose-500',
    liveIndicatorPing: 'bg-rose-400'
  },
  violet: {
    hoverBorder: 'hover:border-violet-500/40 shadow-violet-950/25 hover:shadow-2xl',
    hoverBg: 'hover:bg-violet-950/20',
    iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/25',
    iconText: 'text-violet-400 group-hover:text-violet-300',
    accentText: 'text-violet-400 group-hover:text-violet-300',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-400',
    badgeBorder: 'border-violet-500/20',
    activeLangBg: 'bg-violet-600 text-white',
    accentGlow: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    mainBtnBg: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white shadow-violet-500/20',
    liveIndicatorBg: 'bg-violet-500',
    liveIndicatorPing: 'bg-violet-400'
  },
  amber: {
    hoverBorder: 'hover:border-amber-500/40 shadow-amber-950/25 hover:shadow-2xl',
    hoverBg: 'hover:bg-amber-950/20',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/25',
    iconText: 'text-amber-400 group-hover:text-amber-300',
    accentText: 'text-amber-400 group-hover:text-amber-300',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    activeLangBg: 'bg-amber-600 text-slate-950',
    accentGlow: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    mainBtnBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20',
    liveIndicatorBg: 'bg-amber-500',
    liveIndicatorPing: 'bg-amber-400'
  },
  blue: {
    hoverBorder: 'hover:border-blue-500/40 shadow-blue-950/25 hover:shadow-2xl',
    hoverBg: 'hover:bg-blue-950/20',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/25',
    iconText: 'text-blue-400 group-hover:text-blue-300',
    accentText: 'text-blue-400 group-hover:text-blue-300',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/20',
    activeLangBg: 'bg-blue-600 text-white',
    accentGlow: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    mainBtnBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-500/20',
    liveIndicatorBg: 'bg-blue-500',
    liveIndicatorPing: 'bg-blue-400'
  }
};

// Synth Sound Effects via Web Audio API
const playSimulatedSound = (type: 'click' | 'diamond' | 'bomb' | 'win' | 'start') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'start') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'diamond') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'bomb') {
      // Create lower explosion rumble
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'win') {
      // Arpeggio sound
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + idx * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.18);
      });
    }
  } catch (e) {
    // Fail silently if audio context is blocked
  }
};

export default function StakeHub({ currentUser }: StakeHubProps) {
  const { settings } = useAppSettings();
  const [lang, setLang] = useState<LangKey>('bn');
  const [activePlatformId, setActivePlatformId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Embedded Web Player State
  const [embeddedUrl, setEmbeddedUrl] = useState<string | null>(null);

  // Lock/Unlock body scroll when embedded player is active
  useEffect(() => {
    if (embeddedUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [embeddedUrl]);

  // Mines Game State
  const [minesCount, setMinesCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dih_casino_balance');
      return saved ? parseInt(saved) : 1000;
    } catch {
      return 1000;
    }
  });
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [grid, setGrid] = useState<Array<{ id: number; isMine: boolean; isRevealed: boolean; isMineRevealed: boolean }>>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [revealedDiamonds, setRevealedDiamonds] = useState<number>(0);

  // Auto-save balance
  useEffect(() => {
    try {
      localStorage.setItem('dih_casino_balance', balance.toString());
    } catch (e) {
      // Silent catch
    }
  }, [balance]);

  // Auto-detect user language based on browser locale on first mount
  useEffect(() => {
    try {
      const browserLang = navigator.language || (navigator as any).userLanguage || '';
      const cleanLang = browserLang.toLowerCase();
      if (cleanLang.startsWith('bn')) {
        setLang('bn');
      } else if (cleanLang.startsWith('hi')) {
        setLang('hi');
      } else if (cleanLang.startsWith('ar')) {
        setLang('ar');
      } else {
        setLang('en');
      }
    } catch (e) {
      setLang('bn');
    }
  }, []);

  const activePlatform = platforms.find(p => p.id === activePlatformId) || platforms[0];

  // Helper to dynamically build translation variables for the active platform
  const getTranslations = (p: CasinoPlatform, language: LangKey) => {
    const name = p.name;
    const promo = p.promoCode;
    
    const trans = {
      bn: {
        partnerBadge: `অফিসিয়াল ${name} গেমিং পোর্টাল`,
        title: `DIH ${name} PORTAL`,
        description: `${name}-এর অফিশিয়াল পার্টনার পোর্টাল। কোনো প্রকার ভিপিএন বা জটিলতা ছাড়াই খেলুন সরাসরি এবং যেকোনো সমস্যায় পান ২৪/৭ তাৎক্ষণিক কাস্টমার সাপোর্ট সুবিধা।`,
        playBtn: `${name}-এ খেলুন`,
        telegramBtn: "টেলিগ্রাম এজেন্ট",
        messengerBtn: "মেসেঞ্জার এজেন্ট",
        depositTitle: `বাংলাদেশী ম্যানুয়াল এজেন্ট ডিপোজিট প্রসেস (বিকাশ/নগদ/রকেট)`,
        depositSteps: [
          `১. এজেন্টের মেসেঞ্জার বা টেলিগ্রাম চ্যাটে গিয়ে আপনার ${name} জিমেইল/ইউজারনেম এবং যত টাকা ডিপোজিট করতে চান তা জানান।`,
          `২. এজেন্ট আপনাকে আমাদের একটি সক্রিয় মার্চেন্ট বিকাশ নম্বর অথবা নগদ নম্বর প্রদান করবেন।`,
          `৩. নির্ধারিত নম্বরে ক্যাশ-আউট বা মার্চেন্ট পেমেন্ট সম্পন্ন করে ট্রানজেকশন আইডির (TxID) স্ক্রিনশট এজেন্টের কাছে পাঠান।`,
          `৪. ৫ মিনিটের মধ্যে সমপরিমাণ ডলার (USDT/LTC/TRX) সরাসরি আপনার ${name} একাউন্টে যুক্ত করে দেওয়া হবে।`
        ],
        benefitsTitle: `${name} গেমিং পোর্টালের সুবিধা`,
        benefitsList: [
          `কোনোপ্রকার ক্রিপ্টো ওয়ালেট (Binance/TrustWallet) থাকার প্রয়োজন নেই।`,
          `১০০% নিরাপদ এবং বাংলাদেশের সবচেয়ে নির্ভরযোগ্য এজেন্ট প্যানেল।`,
          `রেজিস্ট্রেশনের সময় প্রোমো কোড ব্যবহার করুন: ${promo} (২০০% বোনাস পান)।`,
          `আমাদের পোর্টাল ব্যবহার করে যেকোনো সমস্যায় পাবেন ২৪/৭ কাস্টমার সাপোর্ট সুবিধা।`
        ],
        previewTitle: `${name} অরিজিনাল মাইনস গেম সিমুলেটর`,
        previewDesc: `রিয়েল ক্যাসিনো খেলার আগে আমাদের সিমুলেটরে ফ্রিতে মাইনস প্র্যাকটিস করে নিন।`,
        fullscreenBtn: `সরাসরি রিয়েল ক্যাসিনো খেলুন`,
        launchersTitle: `বাংলাদেশী ওয়ান-ক্লিক কুইক এন্ট্রি পোর্টাল`,
        games: ["Mines (খেলুন)", "Dice (খেলুন)", "Plinko (খেলুন)", "Limbo (খেলুন)"],
        minesLabel: "মাইনের সংখ্যা:",
        betLabel: "বেট এমাউন্ট (কয়েন):",
        startLabel: "গেম শুরু করুন",
        cashoutLabel: "ক্যাশ আউট",
        winTitle: "অভিনন্দন! আপনি জিতেছেন!",
        loseTitle: "ওহ নো! মাইন বিস্ফোরণ ঘটেছে!",
        balanceLabel: "ব্যালেন্স:",
        freeCoinsLabel: "ফ্রি কয়েন নিন"
      },
      en: {
        partnerBadge: `OFFICIAL ${name} GAMING PORTAL`,
        title: `DIH ${name} PORTAL`,
        description: `Official ${name} gaming and partner portal. Enjoy smooth gameplay without any VPN restrictions and experience 24/7 dedicated support for all your inquiries.`,
        playBtn: `PLAY ON ${name}`,
        telegramBtn: "Telegram Agent",
        messengerBtn: "Messenger Agent",
        depositTitle: `Bangladeshi Manual Agent Deposit Process (bKash/Nagad/Rocket)`,
        depositSteps: [
          `1. Go to the agent's Messenger or Telegram chat and provide your ${name} email/username and the deposit amount.`,
          `2. The agent will provide you with an active merchant bKash or Nagad number.`,
          `3. Complete cash-out or merchant payment and send the transaction ID (TxID) screenshot to the agent.`,
          `4. The equivalent USD (USDT/LTC/TRX) will be credited directly to your ${name} account within 5 minutes.`
        ],
        benefitsTitle: `Advantages of ${name} Gaming Portal`,
        benefitsList: [
          `No crypto wallet (Binance/TrustWallet) required for ${name}.`,
          `100% secure and the most reliable agent panel in Bangladesh.`,
          `Use Promo Code: ${promo} during registration to get a 200% first-time deposit bonus!`,
          `Access round-the-clock instant assistance and prompt support for all gameplay concerns.`
        ],
        previewTitle: `${name} Original Mines Game Simulator`,
        previewDesc: `Practice Mines for free on our interactive emulator before playing real casino games.`,
        fullscreenBtn: `PLAY REAL CASINO DIRECT`,
        launchersTitle: `Bangladeshi One-Click Quick Entry Portals`,
        games: [`Play Mines`, `Play Dice`, `Play Plinko`, `Play Limbo`],
        minesLabel: "Mines Count:",
        betLabel: "Bet Amount (Coins):",
        startLabel: "Start Game",
        cashoutLabel: "Cash Out",
        winTitle: "Congratulations! You Won!",
        loseTitle: "Oh No! You Hit a Mine!",
        balanceLabel: "Balance:",
        freeCoinsLabel: "Claim Free Coins"
      },
      hi: {
        partnerBadge: `आधिकारिक ${name} गेमिंग पोर्टल`,
        title: `DIH ${name} पोर्टल`,
        description: `आधिकारिक ${name} गेमिंग पोर्टल। बिना किसी वीपीएन प्रतिबंध के सहज गेमप्ले का आनंद लें और अपनी सभी पूछताछ के लिए 24/7 समर्पित सहायता प्राप्त करें।`,
        playBtn: `${name} पर खेलें`,
        telegramBtn: "टेलीग्राम एजेंट",
        messengerBtn: "मैसेंजर एजेंट",
        depositTitle: `बांग्लादेशी मैनुअल एजेंट जमा प्रक्रिया (bKash/Nagad/Rocket)`,
        depositSteps: [
          `1. एजेंट के मैसेंजर या टेलीग्राम चैट पर जाएं और अपना ${name} ईमेल/यूज़रनेम और जमा राशि प्रदान करें।`,
          `2. एजेंट आपको एक सक्रिय मर्चेंट bKash या Nagad नंबर प्रदान करेगा।`,
          `3. कैश-आउट या मर्चेंट भुगतान पूरा करें और ट्रांजैक्शन आईडी (TxID) का स्क्रीनशॉट एजेंट को भेजें।`,
          `4. समकक्ष यूएसडी (USDT/LTC/TRX) 5 मिनट के भीतर सीधे आपके ${name} खाते में जमा कर दिया जाएगा।`
        ],
        benefitsTitle: `${name} गेमिंग पोर्टल के लाभ`,
        benefitsList: [
          `${name} के लिए किसी क्रिप्टो वॉलेट की आवश्यकता नहीं है।`,
          "100% सुरक्षित और सबसे विश्वसनीय एजेंट पैनल।",
          `पंजीकरण के दौरान प्रोमो कोड का उपयोग करें: ${promo} (200% बोनस प्राप्त करें)।`,
          "सभी गेमप्ले चिंताओं के लिए चौबीसों घंटे त्वरित सहायता और त्वरित समर्थन प्राप्त करें।"
        ],
        previewTitle: `${name} ओरिजिनल माइंस गेम सिम्युलेटर`,
        previewDesc: `असली केंटिन खेलने से पहले हमारे सिम्युलेटर पर माइंस का मुफ्त अभ्यास करें।`,
        fullscreenBtn: `सीधे रियल कैसीनो खेलें`,
        launchersTitle: `बांग्लादेशी वन-क्लिक क्विक एंट्री पोर्टल`,
        games: ["माइंस खेलें", "डाइस खेलें", "प्लिंको खेलें", "लिम्बो खेलें"],
        minesLabel: "माइंस संख्या:",
        betLabel: "बेट राशि (सिक्के):",
        startLabel: "खेल शुरू करें",
        cashoutLabel: "कैश आउट",
        winTitle: "बधाई हो! आप जीत गए!",
        loseTitle: "ओह नहीं! माइंस ब्लास्ट हो गया!",
        balanceLabel: "बैलेंस:",
        freeCoinsLabel: "फ्री सिक्के लें"
      },
      ar: {
        partnerBadge: `بوابة ألعاب ${name} الرسمية`,
        title: `منصة دي آي إتش ${name}`,
        description: `بوابة ألعاب ${name} الرسمية ومنصة اللعب الفوري. استمتع بتجربة ألعاب سلسة دون قيود الشبكة الافتراضية الخاصة واحصل على دعم مخصص على مدار الساعة لجميع استفساراتك.`,
        playBtn: `العب على ${name}`,
        telegramBtn: "عميل تليجرام",
        messengerBtn: "عميل ماسنجر",
        depositTitle: "عملية الإيداع اليدوي عبر الوكيل البنغلاديشي (bKash/Nagad/Rocket)",
        depositSteps: [
          `1. انتقل إلى دردشة الوكيل على ماسنجر أو تليجرام وقدم بريدك الإلكتروني/اسم المستخدم في ${name} ومبلغ الإيداع.`,
          `2. سيقوم الوكيل بتزويدك برقم bKash أو Nagad نشط للتاجر.`,
          `3. أكمل عملية السحب النقدي أو دفع التاجر وأرسل لقطة شاشة لمعرف المعاملة (TxID) إلى الوكيل.`,
          `4. سيتم إضافة ما يعادله بالدولار (USDT/LTC/TRX) مباشرة إلى حساب ${name} الخاص بك في غضون 5 دقائق.`
        ],
        benefitsTitle: `مزايا منصة ألعاب ${name}`,
        benefitsList: [
          `لا حاجة لمحفظة مشفرة لـ ${name}.`,
          "آمن بنسبة 100% ولوحة الوكلاء الأكثر موثوقية في بنغلاديش.",
          `استخدم الرمز الترويجي: ${promo} أثناء التسجيل للحصول على مكافأة إيداع بنسبة 200%!`,
          "احصل على دعم فوري وحل سريع لجميع استفسارات الألعاب على مدار الساعة."
        ],
        previewTitle: `محاكي لعبة الألغام ${name} الأصلي`,
        previewDesc: `تدرب على لعبة الألغام مجانًا على محاكينا التفاعلي قبل اللعب الحقيقي.`,
        fullscreenBtn: `دخول الكازينو المباشر فوراً`,
        launchersTitle: `بوابة الدخول السريع بنقرة واحدة`,
        games: ["العب ماينز", "العب دايس", "العب بلينكو", "العب ليمبو"],
        minesLabel: "عدد الألغام:",
        betLabel: "قيمة الرهان (العملات):",
        startLabel: "بدء اللعبة",
        cashoutLabel: "سحب الأرباح",
        winTitle: "تهانينا! لقد فزت!",
        loseTitle: "يا للهول! لقد انفجر لغم!",
        balanceLabel: "الرصيد:",
        freeCoinsLabel: "الحصول على عملات مجانية"
      }
    };
    return trans[language];
  };

  const t = getTranslations(activePlatform, lang);

  const handleCopyPromo = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy promo code', err);
    }
  };

  const startTriggerRedirect = (type: 'current' | 'new') => {
    if (soundEnabled) playSimulatedSound('click');
    
    const targetPlatform = platforms.find(p => p.id === activePlatformId) || platforms[0];
    if (targetPlatform) {
      if (type === 'current') {
        if (targetPlatform.id === 'stake') {
          try {
            // Open as a beautiful standalone fullscreen-like popup window.
            const width = window.screen.availWidth || 1200;
            const height = window.screen.availHeight || 800;
            const features = `width=${width},height=${height},top=0,left=0,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=yes`;
            const win = window.open(targetPlatform.referralLink, '_blank', features);
            if (!win) {
              window.open(targetPlatform.referralLink, '_blank', 'noopener,noreferrer');
            }
          } catch (e) {
            window.open(targetPlatform.referralLink, '_blank', 'noopener,noreferrer');
          }
        } else {
          // For non-stake platforms (77BD, PlayTok, etc.), if 'current' (full screen here) is requested,
          // open it directly inside our embedded iframe player right in the app!
          setEmbeddedUrl(targetPlatform.referralLink);
        }
      } else {
        try {
          window.open(targetPlatform.referralLink, '_blank', 'noopener,noreferrer');
        } catch (e) {
          window.location.href = targetPlatform.referralLink;
        }
      }
    }
  };

  // MINES GAME LOGIC ENGINE
  const initializeMinesGame = () => {
    if (balance < betAmount) {
      alert(lang === 'bn' ? 'দুঃখিত! আপনার ব্যালেন্স অপর্যাপ্ত।' : 'Insufficient balance!');
      return;
    }
    
    if (soundEnabled) playSimulatedSound('start');
    setBalance(prev => prev - betAmount);
    setGameActive(true);
    setGameOver(false);
    setGameWon(false);
    setRevealedDiamonds(0);

    // Initialize 5x5 grid (25 cells)
    const newGrid = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      isMine: false,
      isRevealed: false,
      isMineRevealed: false
    }));

    // Randomly distribute mines
    let placedMines = 0;
    while (placedMines < minesCount) {
      const randIdx = Math.floor(Math.random() * 25);
      if (!newGrid[randIdx].isMine) {
        newGrid[randIdx].isMine = true;
        placedMines++;
      }
    }

    setGrid(newGrid);
  };

  // Handle cell click in mines
  const handleCellClick = (id: number) => {
    if (!gameActive || gameOver || gameWon) return;

    const cell = grid[id];
    if (cell.isRevealed) return;

    // Reveal cell
    const updatedGrid = [...grid];
    updatedGrid[id].isRevealed = true;

    if (cell.isMine) {
      // Hit a mine! GAME OVER LOSS
      if (soundEnabled) playSimulatedSound('bomb');
      updatedGrid[id].isMineRevealed = true;
      
      // Reveal all other mines
      updatedGrid.forEach(c => {
        if (c.isMine) c.isRevealed = true;
      });

      setGrid(updatedGrid);
      setGameOver(true);
      setGameActive(false);
    } else {
      // Safe cell! Reveal Diamond
      if (soundEnabled) playSimulatedSound('diamond');
      const newRevealed = revealedDiamonds + 1;
      setRevealedDiamonds(newRevealed);
      
      const totalDiamonds = 25 - minesCount;
      if (newRevealed === totalDiamonds) {
        // Revealed all diamonds! AUTO CASH OUT WIN
        handleCashOut(newRevealed);
      } else {
        setGrid(updatedGrid);
      }
    }
  };

  // Calculate game multiplier
  const calculateMultiplier = (revealed: number) => {
    if (revealed === 0) return 1;
    let mult = 1;
    // Simple custom multiplier formula that mirrors realistic betting ratios
    for (let i = 0; i < revealed; i++) {
      mult *= (25 - i) / (25 - minesCount - i);
    }
    return Math.round(mult * 100) / 100;
  };

  const currentMultiplier = calculateMultiplier(revealedDiamonds);
  const potentialWin = Math.round(betAmount * currentMultiplier);

  // Cash out simulated game
  const handleCashOut = (revealedValue = revealedDiamonds) => {
    if (!gameActive || gameOver) return;
    
    if (soundEnabled) playSimulatedSound('win');
    const multiplier = calculateMultiplier(revealedValue);
    const payout = Math.round(betAmount * multiplier);
    
    setBalance(prev => prev + payout);
    setGameWon(true);
    setGameActive(false);

    // Show all mine locations nicely
    const updatedGrid = [...grid];
    updatedGrid.forEach(c => {
      if (c.isMine) c.isRevealed = true;
    });
    setGrid(updatedGrid);
  };

  const getFreeCoins = () => {
    if (soundEnabled) playSimulatedSound('win');
    setBalance(prev => prev + 1000);
  };

  if (embeddedUrl) {
    const activePlatform = platforms.find(p => p.id === activePlatformId) || platforms[0];
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-[#07090e] flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-300">
        {/* Premium Full-Width Header Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#090b11] border-b border-slate-900/80 gap-2 backdrop-blur-md shrink-0 h-11 select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (soundEnabled) playSimulatedSound('click');
                setEmbeddedUrl(null);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border border-rose-500/20 cursor-pointer active:scale-95"
            >
              <X size={11} className="text-rose-400" />
              <span>{lang === 'bn' ? 'বন্ধ করুন' : 'Exit'}</span>
            </button>
            <span className="h-3.5 w-px bg-slate-800/60" />
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider truncate max-w-[100px] sm:max-w-none">
                {activePlatform.name}
              </span>
            </div>
          </div>

          {/* Promo code & reload controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (soundEnabled) playSimulatedSound('click');
                const iframe = document.getElementById('embedded-game-frame') as HTMLIFrameElement;
                if (iframe) {
                  iframe.src = iframe.src;
                }
              }}
              className="p-1.5 bg-[#07090e] hover:bg-slate-900 border border-slate-800/60 text-slate-400 hover:text-slate-200 rounded-lg transition-all active:scale-95 cursor-pointer"
              title="Reload Game"
            >
              <RefreshCw size={11} />
            </button>
          </div>
        </div>

        {/* Beautiful full-bleed responsive iframe canvas container */}
        <div className="flex-1 w-full h-full bg-[#07090e] relative overflow-hidden">
          <iframe
            id="embedded-game-frame"
            src={embeddedUrl}
            className="w-full h-full border-0 relative z-10 bg-transparent"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads allow-modals allow-popups-to-escape-sandbox"
            loading="lazy"
          />
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 space-y-4 sm:space-y-6 pb-12 sm:pb-20 animate-in fade-in duration-500">

      {/* RENDER VIEW 1: LOBBY SELECTOR (if activePlatformId is null) */}
      <AnimatePresence mode="wait">
        {activePlatformId === null ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Header Banner */}
            <div className="text-center space-y-1.5 sm:space-y-2.5 py-3 sm:py-6 px-2 sm:px-4 relative overflow-hidden rounded-xl sm:rounded-3xl bg-slate-900/40 border border-slate-800/80">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-wider rounded-full select-none">
                {lang === 'bn' 
                  ? 'ডাবল ইনকাম হাব - অফিসিয়াল ক্যাসিনো পোর্টাল' 
                  : lang === 'hi'
                  ? 'डबल इनकम हब - आधिकारिक कैसीनो पोर्टल'
                  : lang === 'ar'
                  ? 'دبل إنكام هاب - بوابة الكازينو الرسمية'
                  : 'DOUBLE INCOME HUB - OFFICIAL CASINO HUB'}
              </div>
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-white uppercase select-none">
                DIH CASINO PORTAL
              </h1>

              {/* Lang switcher in Lobby */}
              <div className="pt-1 flex justify-center items-center gap-1 flex-wrap">
                {[
                  { key: 'bn', label: '🇧🇩 বাংলা' },
                  { key: 'en', label: '🇺🇸 English' },
                  { key: 'hi', label: '🇮🇳 हिंदी' },
                  { key: 'ar', label: '🇸🇦 العربية' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setLang(item.key as LangKey)}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer ${
                      lang === item.key 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORIZED CASINO PLATFORMS */}
            <div className="space-y-4 sm:space-y-8">
              {/* INTERNATIONAL CASINO PLATFORMS */}
              <div className="space-y-2.5 sm:space-y-4">
                {/* INTERNATIONAL SECTION HEADER */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 sm:pb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-black tracking-widest text-emerald-400 uppercase select-none">
                    <Globe size={12} className="text-emerald-400 animate-pulse sm:w-4 sm:h-4" />
                    <span>
                      {lang === 'bn' 
                        ? 'আন্তর্জাতিক ক্যাসিনো প্ল্যাটফর্ম (International Casino)' 
                        : lang === 'hi'
                        ? 'अंतर्राष्ट्रीय कैसीनो प्लेटफॉर्म'
                        : lang === 'ar'
                        ? 'منصات الكازينو العالمية'
                        : 'International Casino Platforms'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  {platforms.filter(p => p.badge === 'INTERNATIONAL' && !settings?.disabledCasinoPlatforms?.includes(p.id)).map((p) => {
                    const tc = themeColorMap[p.themeColor] || themeColorMap.emerald;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (soundEnabled) playSimulatedSound('click');
                          setActivePlatformId(p.id);
                          if (p.id !== 'stake') {
                            setLang('bn');
                          }
                        }}
                        className={`relative overflow-hidden p-3.5 sm:p-6 rounded-xl sm:rounded-3xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col gap-2.5 sm:gap-4 cursor-pointer group bg-slate-950/60 border-slate-800 ${tc.hoverBorder} ${tc.hoverBg}`}
                      >
                        {/* Corner Ribbon for featured */}
                        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4">
                          <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[7px] sm:text-[9px] font-black tracking-wider uppercase rounded-full ${tc.badgeBg} ${tc.badgeText} border ${tc.badgeBorder}`}>
                            {lang === 'bn' 
                              ? p.categoryBn 
                              : lang === 'hi'
                              ? p.categoryHi
                              : lang === 'ar'
                              ? p.categoryAr
                              : p.categoryEn}
                          </span>
                        </div>

                        {/* Dice Icon */}
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${tc.iconBg} ${tc.iconText}`}>
                          <Dices className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>

                        {/* Platform details */}
                        <div className="space-y-0.5 sm:space-y-1">
                          <h3 className="font-black text-sm sm:text-xl text-white tracking-tight">{p.name}</h3>
                          <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {p.id === 'stake' ? (
                              lang === 'bn' 
                                ? 'বিশ্বসেরা আন্তর্জাতিক প্রিমিয়াম ক্যাসিনো প্ল্যাটফর্ম, লাইভ গেমপ্লে এবং ২৪/৭ সুরক্ষিত পেমেন্ট সুবিধা।'
                                : lang === 'hi'
                                ? 'विश्व स्तरीय अंतर्राष्ट्रीय प्रीमियम कैसीनो प्लेटफॉर्म, लाइव गेमप्ले और 24/7 सुरक्षित भुगतान के साथ।'
                                : lang === 'ar'
                                ? 'منصة كازينو بريميوم عالمية رائدة مع أسلوب لعب مباشر ومدفوعات آمنة على مدار الساعة.'
                                : 'World-class international premium casino platform with live simulated gameplay and 24/7 secure payments.'
                            ) : (
                              lang === 'bn'
                                ? 'বাংলাদেশের অন্যতম জনপ্রিয় ক্যাসিনো গেম প্ল্যাটফর্ম, বিকাশ/নগদ/রকেটে দ্রুত ও সহজ ডিপোজিট সুবিধা।'
                                : lang === 'hi'
                                ? 'बांग्लादेश के सबसे लोकप्रिय कैसीनो गेम प्लेटफॉर्मों में से एक, तेज़ स्थानीय भुगतान विधियों के साथ।'
                                : lang === 'ar'
                                ? 'واحدة من أشهر منصات الكازينو البنغلاديشية مع طرق دفع محلية سريعة وسهلة.'
                                : 'One of the most popular Bangladeshi casino platforms with fast local payment methods like bKash/Nagad/Rocket.'
                            )}
                          </p>
                        </div>

                        <div className={`pt-0.5 sm:pt-2 flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${tc.accentText}`}>
                          <span>
                            {lang === 'bn' 
                              ? 'পোর্টালে প্রবেশ করুন' 
                              : lang === 'hi'
                              ? 'पोर्टल में प्रवेश करें'
                              : lang === 'ar'
                              ? 'دخول البوابة'
                              : 'ENTER PORTAL'}
                          </span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BANGLADESHI CASINO PLATFORMS */}
              <div className="space-y-2.5 sm:space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 sm:pb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-black tracking-widest text-amber-400 uppercase select-none">
                    <Flame size={12} className="text-amber-500 animate-pulse sm:w-4 sm:h-4" />
                    <span>
                      {lang === 'bn' 
                        ? 'বাংলাদেশী ক্যাসিনো প্ল্যাটফর্ম (BD Casino)' 
                        : lang === 'hi'
                        ? 'बांग्लादेशी कैसीनो प्लेटफॉर्म'
                        : lang === 'ar'
                        ? 'منصات الكازينو البنغلاديشية'
                        : 'Bangladeshi Casino Platforms'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  {platforms.filter(p => p.badge === 'BANGLADESHI' && !settings?.disabledCasinoPlatforms?.includes(p.id)).map((p) => {
                    const tc = themeColorMap[p.themeColor] || themeColorMap.emerald;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (soundEnabled) playSimulatedSound('click');
                          setActivePlatformId(p.id);
                          if (p.id !== 'stake') {
                            setLang('bn');
                          }
                        }}
                        className={`relative overflow-hidden p-3.5 sm:p-6 rounded-xl sm:rounded-3xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col gap-2.5 sm:gap-4 cursor-pointer group bg-slate-950/60 border-slate-800 ${tc.hoverBorder} ${tc.hoverBg}`}
                      >
                        {/* Dice Icon */}
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${tc.iconBg} ${tc.iconText}`}>
                          <Dices className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>

                        {/* Platform details */}
                        <div className="space-y-0.5 sm:space-y-1">
                          <h3 className="font-black text-sm sm:text-xl text-white tracking-tight">{p.name}</h3>
                          <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {p.id === 'stake' ? (
                              lang === 'bn' 
                                ? 'বিশ্বসেরা আন্তর্জাতিক প্রিমিয়াম ক্যাসিনো প্ল্যাটফর্ম, লাইভ গেমপ্লে এবং ২৪/৭ সুরক্ষিত পেমেন্ট সুবিধা।'
                                : lang === 'hi'
                                ? 'विश्व स्तरीय अंतर्राष्ट्रीय प्रीमियम कैसीनो प्लेटफॉर्म, लाइव गेमप्ले और 24/7 सुरक्षित भुगतान के साथ।'
                                : lang === 'ar'
                                ? 'منصة كازينو بريميوم عالمية رائدة مع أسلوب لعب مباشر ومدفوعات آمنة على مدار الساعة.'
                                : 'World-class international premium casino platform with live simulated gameplay and 24/7 secure payments.'
                            ) : (
                              lang === 'bn'
                                ? 'বাংলাদেশের অন্যতম জনপ্রিয় ক্যাসিনো গেম প্ল্যাটফর্ম, বিকাশ/নগদ/রকেটে দ্রুত ও সহজ ডিপোজিট সুবিধা।'
                                : lang === 'hi'
                                ? 'बांग्लादेश के सबसे लोकप्रिय कैसीनो गेम प्लेटफॉर्मों में से एक, तेज़ स्थानीय भुगतान विधियों के साथ।'
                                : lang === 'ar'
                                ? 'واحدة من أشهر منصات الكازينو البنغلاديشية مع طرق دفع محلية سريعة وسهلة.'
                                : 'One of the most popular Bangladeshi casino platforms with fast local payment methods like bKash/Nagad/Rocket.'
                            )}
                          </p>
                        </div>

                        <div className={`pt-0.5 sm:pt-2 flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${tc.accentText}`}>
                          <span>
                            {lang === 'bn' 
                              ? 'পোর্টালে প্রবেশ করুন' 
                              : lang === 'hi'
                              ? 'पोर्टल में प्रवेश करें'
                              : lang === 'ar'
                              ? 'دخول البوابة'
                              : 'ENTER PORTAL'}
                          </span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* RENDER VIEW 2: SINGLE CASINO FOCUS PLATFORM VIEW (everything else is hidden) */
          <motion.div
            key="focus-platform"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Top Toolbar Bar with Back and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl gap-2.5">
              <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (soundEnabled) playSimulatedSound('click');
                    setActivePlatformId(null);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-slate-950 hover:bg-slate-800 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg sm:rounded-xl transition-all border border-slate-800 cursor-pointer"
                >
                  <ArrowRight size={12} className="rotate-180 sm:w-3.5 sm:h-3.5" />
                  <span>{lang === 'bn' ? 'লবি' : 'Lobby'}</span>
                </button>
                <span className="hidden sm:inline h-4 w-px bg-slate-800" />
                <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  {activePlatform.name} Portal Active
                </span>
              </div>

              {/* Sound and Lang Controls */}
              <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto">
                {/* Platform Lang Selector */}
                <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                  {[
                    { key: 'bn', label: '🇧🇩' },
                    { key: 'en', label: '🇺🇸' },
                    { key: 'hi', label: '🇮🇳' },
                    { key: 'ar', label: '🇸🇦' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setLang(item.key as LangKey)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                        lang === item.key 
                          ? 'bg-emerald-600 text-white shadow' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform floating banner */}
            <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border ${activePlatform.borderGlow} bg-gradient-to-r ${activePlatform.bgGradient} p-4 sm:p-6 md:p-8`}>
              <div className="absolute -right-24 -top-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="text-center md:text-left space-y-2 sm:space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-wider rounded-full select-none">
                    {t.partnerBadge}
                  </div>
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-white uppercase select-none">
                    {t.title}
                  </h1>
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 leading-relaxed font-medium select-none">
                    {t.description}
                  </p>
                </div>

                {/* Social agent buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto md:min-w-[240px]">
                  <button 
                    onClick={() => startTriggerRedirect('current')}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all cursor-pointer text-center w-full shadow-lg"
                  >
                    <Smartphone size={14} className="sm:w-3.5 sm:h-3.5" />
                    <span>{lang === 'bn' ? 'গেম খেলুন' : 'PLAY GAME'}</span>
                  </button>

                  {activePlatform.id === 'stake' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <a 
                        href="https://t.me/stake020"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-2 py-2 sm:px-3 sm:py-3 bg-[#0088cc]/90 hover:bg-[#0088cc] text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                      >
                        <Send size={12} fill="currentColor" className="sm:w-3.5 sm:h-3.5" />
                        {t.telegramBtn}
                      </a>

                      <a 
                        href="https://m.me/rafcin.b"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-2 py-2 sm:px-3 sm:py-3 bg-[#006aff]/90 hover:bg-[#006aff] text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                      >
                        <MessageSquare size={12} fill="currentColor" className="sm:w-3.5 sm:h-3.5" />
                        {t.messengerBtn}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BDT Merchant Agent Deposit */}
            {activePlatform.id === 'stake' && (
              <div className="max-w-3xl mx-auto w-full">
                
                {/* Local BDT Merchant agent deposit module */}
                <div className="p-4 sm:p-6 bg-slate-900/40 border border-slate-800 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl text-left">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm select-none">
                      <Smartphone size={14} className="text-emerald-400 sm:w-4 sm:h-4" />
                      {t.depositTitle}
                    </h4>
                    <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider select-none">100% SECURE MANUAL DEPOSIT VIA ACTIVE MERCHANTS</p>
                  </div>

                  <div className="text-[11px] sm:text-xs text-slate-300 space-y-2 sm:space-y-3 leading-relaxed font-medium select-none">
                    {t.depositSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0 mt-0.5">{idx + 1}</span>
                        <p className="text-slate-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
