import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, ShieldCheck, DollarSign, ArrowRight, Smartphone, Send, 
  MessageSquare, Calculator, Activity, Star, Clock, AlertCircle, Coins,
  ChevronRight, Sparkles, Award, Wallet, ArrowUpRight, HelpCircle, CheckCircle2,
  X, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSettings } from '../../hooks/useAppSettings';

interface InvestmentPlan {
  id: string;
  nameEn: string;
  nameBn: string;
  nameHi: string;
  nameAr: string;
  tagEn: string;
  tagBn: string;
  tagHi: string;
  tagAr: string;
  minAmount: number; // in USD base
  maxAmount: number; // in USD base
  dailyRoi: number; // percentage
  periodDays: number;
  badgeColor: string;
  glowColor: string;
  gradient: string;
  icon: any;
  featuresEn: string[];
  featuresBn: string[];
  featuresHi: string[];
  featuresAr: string[];
}

const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    nameEn: 'Silver Starter',
    nameBn: 'সিলভার স্টার্টার',
    nameHi: 'सिल्वर स्टार्टर',
    nameAr: 'سيلفر ستارتر',
    tagEn: 'Entry Level Yields',
    tagBn: 'নতুনদের জন্য সেরা',
    tagHi: 'शुरुआती स्तर का रिटर्न',
    tagAr: 'عوائد للمبتدئين',
    minAmount: 100,
    maxAmount: 500,
    dailyRoi: 2.0,
    periodDays: 30,
    badgeColor: 'border-slate-400/30 text-slate-300 bg-slate-500/10',
    glowColor: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
    gradient: 'from-slate-900/90 via-[#0a0d14] to-slate-950/90 border-slate-800 hover:border-slate-500/40',
    icon: Coins,
    featuresEn: [
      'Daily returns credited instantly',
      'Capital returned after 30 days',
      'Standard automated withdrawals',
      '24/7 support channel access'
    ],
    featuresBn: [
      'প্রতিদিন মুনাফা সরাসরি জমা',
      '৩০ দিন পর মূলধন ফেরত যোগ্য',
      'স্বয়ংক্রিয় সাধারণ উইথড্রয়াল',
      '২৪/৭ কাস্টমার সাপোর্ট অ্যাক্সেস'
    ],
    featuresHi: [
      'दैनिक रिटर्न तुरंत जमा',
      '30 दिनों के बाद पूंजी वापसी',
      'मानक स्वचालित निकासी',
      '24/7 सहायता चैनल पहुंच'
    ],
    featuresAr: [
      'تُضاف العوائد اليومية فوراً',
      'استرداد رأس المال بعد 30 يوماً',
      'سحب تلقائي قياسي',
      'الوصول إلى قنوات الدعم 24/7'
    ]
  },
  {
    id: 'standard',
    nameEn: 'Gold Standard',
    nameBn: 'গোল্ড স্ট্যান্ডার্ড',
    nameHi: 'गोल्ड स्टैंडर्ड',
    nameAr: 'جولد ستاندرد',
    tagEn: 'Most Popular Choice',
    tagBn: 'সবচেয়ে জনপ্রিয়',
    tagHi: 'सबसे लोकप्रिय विकल्प',
    tagAr: 'الخيار الأكثر شعبية',
    minAmount: 500,
    maxAmount: 2000,
    dailyRoi: 3.0,
    periodDays: 60,
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    gradient: 'from-[#0d1017] via-[#101420] to-[#0a0d14] border-amber-500/30 hover:border-amber-500/60',
    icon: Star,
    featuresEn: [
      'Compounding daily profit',
      'Capital returned after 60 days',
      'Priority express withdrawals',
      'Dedicated manager guidance',
      'High priority support ticket processing'
    ],
    featuresBn: [
      'প্রতিদিন চক্রবৃদ্ধি হারে প্রফিট',
      '৬০ দিন পর মূলধন ফেরত যোগ্য',
      'এক্সপ্রেস উইথড্রয়াল সুবিধা',
      'ডেডিকেটেড ইনভেস্টমেন্ট ম্যানেজার',
      'অগ্রাধিকার কাস্টমার সাপোর্ট টিকেট'
    ],
    featuresHi: [
      'चक्रवृद्धि दैनिक लाभ',
      '60 दिनों के बाद पूंजी वापसी',
      'प्राथमिकता एक्सप्रेस निकासी',
      'समर्पित प्रबंधक मार्गदर्शन',
      'उच्च प्राथमिकता सहायता टिकट प्रसंस्करण'
    ],
    featuresAr: [
      'أرباح يومية تراكمية',
      'استرداد رأس المال بعد 60 يوماً',
      'سحوبات سريعة وذات أولوية',
      'إرشادات من مدير مخصص',
      'معالجة تذاكر الدعم بأولوية عالية'
    ]
  },
  {
    id: 'premium',
    nameEn: 'Diamond Premium',
    nameBn: 'ডায়মন্ড প্রিমিয়াম',
    nameHi: 'डायमंड प्रीमियम',
    nameAr: 'دايموند بريميوم',
    tagEn: 'High Yield VIP Tiers',
    tagBn: 'উচ্চ রিটার্ন ভিআইপি',
    tagHi: 'उच्च रिटर्न वीआईपी श्रेणी',
    tagAr: 'فئة VIP العالية',
    minAmount: 2000,
    maxAmount: 10000,
    dailyRoi: 4.0,
    periodDays: 90,
    badgeColor: 'border-blue-400/30 text-blue-400 bg-blue-500/10',
    glowColor: 'shadow-[0_0_40px_rgba(59,130,246,0.25)]',
    gradient: 'from-[#0b0f19] via-[#0e172a] to-[#070a12] border-blue-500/30 hover:border-blue-500/60',
    icon: Award,
    featuresEn: [
      'Premium daily return rate',
      'Capital returned after 90 days',
      'Instant direct-to-wallet withdrawals',
      'Personal financial advisor assignment',
      'Exclusive insider investment pools'
    ],
    featuresBn: [
      'সর্বোচ্চ প্রিমিয়াম দৈনিক প্রফিট',
      '৯০ দিন পর মূলধন ফেরত যোগ্য',
      'তাত্ক্ষণিক ডিরেক্ট ওয়ালেট উইথড্র',
      'ব্যক্তিগত কাস্টম ফিন্যান্সিয়াল এডভাইজার',
      'এক্সক্লুসিভ ইনসাইডার ইনভেস্টমেন্ট পুল'
    ],
    featuresHi: [
      'प्रीमियम दैनिक रिटर्न दर',
      '90 दिनों के बाद पूंजी वापसी',
      'तुरंत सीधे वॉलेट में निकासी',
      'व्यक्तिगत वित्तीय सलाहकार आवंटन',
      'विशेष आंतरिक निवेश पूल'
    ],
    featuresAr: [
      'معدل عائد يومي متميز',
      'استرداد رأس المال بعد 90 يوماً',
      'سحب فوري مباشر إلى المحفظة',
      'تعيين مستشار مالي شخصي',
      'محافظ استثمارية داخلية حصرية'
    ]
  },
  {
    id: 'ultimate',
    nameEn: 'Crown Ultimate',
    nameBn: 'ক্রাউন আল্টিমেট',
    nameHi: 'क्राउन अल्टीमेट',
    nameAr: 'كراون ألتيميت',
    tagEn: 'Institutional VIP Tier',
    tagBn: 'ইনস্টিটিউশনাল ভিআইপি',
    tagHi: 'संस्थागत वीआईपी श्रेणी',
    tagAr: 'فئة المؤسسات VIP',
    minAmount: 10000,
    maxAmount: 30000,
    dailyRoi: 5.5,
    periodDays: 120,
    badgeColor: 'border-purple-400/30 text-purple-400 bg-purple-500/10',
    glowColor: 'shadow-[0_0_50px_rgba(168,85,247,0.3)]',
    gradient: 'from-[#0a0d14] via-[#110d1c] to-[#07090e] border-purple-500/30 hover:border-purple-500/70',
    icon: Sparkles,
    featuresEn: [
      'Elite institutional payout rates',
      'Capital returned after 120 days',
      'Zero fee instant VIP withdrawals',
      'Quarterly executive profit share',
      'One-on-one video support sessions'
    ],
    featuresBn: [
      'এলিট ইনস্টিটিউশনাল পে-আউট রেট',
      '১২০ দিন পর মূলধন ফেরত যোগ্য',
      'শূণ্য চার্জে তাত্ক্ষণিক ভিআইপি উইথড্র',
      'ত্রৈমাসিক এক্সিকিউটিভ প্রফিট শেয়ারিং',
      'ভিডিও কনফারেন্সে ওয়ান-অন-ওয়ান সাপোর্ট'
    ],
    featuresHi: [
      'अभिजात वर्ग संस्थागत भुगतान दरें',
      '120 दिनों के बाद पूंजी वापसी',
      'शून्य शुल्क तत्काल वीआईपी निकासी',
      'त्रैमासिक कार्यकारी लाभ साझाकरण',
      'वन-ऑन-वन वीडियो सहायता सत्र'
    ],
    featuresAr: [
      'معدلات دفع مؤسسية متميزة',
      'استرداد رأس المال بعد 120 يوماً',
      'سحوبات VIP فورية بدون رسوم',
      'حصص أرباح تنفيذية ربع سنوية',
      'جلسات دعم بالفيديو شخصية مباشرة'
    ]
  }
];

interface CurrencyConfig {
  symbol: string;
  rate: number; // exchange rate relative to USD (which acts as 1.0)
  label: string;
}

const CURRENCIES: Record<'USD' | 'BDT' | 'INR' | 'AED', CurrencyConfig> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD' },
  BDT: { symbol: '৳', rate: 120.0, label: 'BDT' },
  INR: { symbol: '₹', rate: 84.0, label: 'INR' },
  AED: { symbol: 'د.إ', rate: 3.67, label: 'AED' }
};

interface LangStrings {
  portalTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  officialPlans: string;
  calculatorTitle: string;
  calculatorSubtitle: string;
  investmentAmount: string;
  dailyRate: string;
  dailyProfit: string;
  weeklyProfit: string;
  monthlyProfit: string;
  totalPeriodProfit: string;
  maturityTotal: string;
  investNow: string;
  depositTitle: string;
  withdrawTitle: string;
  walletBalance: string;
  activeInvested: string;
  totalEarned: string;
  depositBtn: string;
  withdrawBtn: string;
  activationGuide: string;
  advisorTelegram: string;
  advisorMessenger: string;
  warningText: string;
  liveFeedTitle: string;
  noInvestments: string;
  activePortfolios: string;
  durationLabel: string;
  payoutTime: string;
  daysLabel: string;
  selectPlan: string;
  calculateBtn: string;
  paymentMethod: string;
  phoneOrAddress: string;
  amountLabel: string;
  cancel: string;
  submit: string;
  processing: string;
  depositSuccess: string;
  withdrawSuccess: string;
  insufficientFunds: string;
  activePlansCount: string;
  allRightsReserved: string;
}

const TRANSLATIONS: Record<'en' | 'bn' | 'hi' | 'ar', LangStrings> = {
  en: {
    portalTitle: 'DIH HUB - PREMIUM INVESTMENT PORTAL',
    heroTitle: 'DIH WEALTH MULTIPLIER',
    heroSubtitle: 'Grow your idle funds with our highly-secured AI-powered automated trading and financial pools. Daily payouts with premium assurance.',
    officialPlans: 'OFFICIAL INVESTMENT PLANS',
    calculatorTitle: 'PROFIT CALCULATOR',
    calculatorSubtitle: 'ESTIMATE YOUR DAILY YIELDS',
    investmentAmount: 'Investment Amount',
    dailyRate: 'DAILY RATE',
    dailyProfit: 'Daily Profit',
    weeklyProfit: 'Weekly Profit',
    monthlyProfit: 'Monthly Profit',
    totalPeriodProfit: 'Total Period Profit',
    maturityTotal: 'Maturity Total Payout',
    investNow: 'ACTIVATE PORTFOLIO',
    depositTitle: 'Deposit / Add Funds',
    withdrawTitle: 'Withdraw Profits',
    walletBalance: 'MY WALLET BALANCE',
    activeInvested: 'ACTIVE INVESTED VOLUME',
    totalEarned: 'TOTAL ACCRUED EARNINGS',
    depositBtn: 'Deposit Funds',
    withdrawBtn: 'Withdraw Cash',
    activationGuide: 'BIDIRECT ACTIVATION & DEPOSIT PROCESS',
    advisorTelegram: 'OFFICIAL TELEGRAM VIP SUPPORT',
    advisorMessenger: 'MESSENGER DIRECT ADVISOR',
    warningText: 'WARNING: To avoid fraud and guarantee safe transactions, always initiate contact exclusively by clicking the verified support buttons below.',
    liveFeedTitle: 'LIVE GLOBAL PAYOUTS & DEPOSITS FEED',
    noInvestments: 'No Active Investments Yet',
    activePortfolios: 'YOUR ACTIVE PORTFOLIOS',
    durationLabel: 'Duration',
    payoutTime: 'Every 2 Seconds Live Income Ticking',
    daysLabel: 'Days',
    selectPlan: 'SELECT PLAN',
    calculateBtn: 'CALCULATE ROI',
    paymentMethod: 'Payment Channel',
    phoneOrAddress: 'Account Phone / Wallet Address',
    amountLabel: 'Amount',
    cancel: 'Cancel',
    submit: 'Submit Request',
    processing: 'Processing transaction securely...',
    depositSuccess: 'Deposit of {amount} received! Funds added instantly to your simulated wallet.',
    withdrawSuccess: 'Withdrawal of {amount} processed! Will be dispatched to your account shortly.',
    insufficientFunds: 'Insufficient wallet balance to perform this operation.',
    activePlansCount: 'Active Investments',
    allRightsReserved: '© 2024 DIH HUB. All rights reserved.'
  },
  bn: {
    portalTitle: 'ডিআইএইচ হাব - প্রিমিয়াম ইনভেস্টমেন্ট পোর্টাল',
    heroTitle: 'ডিআইএইচ ওয়েলথ মাল্টিপ্লায়ার',
    heroSubtitle: 'আমাদের উচ্চ সুরক্ষা সম্পন্ন ডিজিটাল অ্যাসেট ও এআই ফিন্যান্সিয়াল অ্যালগরিদমে আপনার অলস তহবিল বিনিয়োগ করে প্রতিদিন নিশ্চিত প্রফিট অর্জন করুন।',
    officialPlans: 'অফিসিয়াল ইনভেস্টমেন্ট প্ল্যান',
    calculatorTitle: 'প্রফিট ক্যালকুলেটর',
    calculatorSubtitle: 'আপনার দৈনিক রিটার্ন পরীক্ষা করুন',
    investmentAmount: 'বিনিয়োগের পরিমাণ',
    dailyRate: 'দৈনিক রেট',
    dailyProfit: 'দৈনিক রিটার্ন',
    weeklyProfit: 'সাপ্তাহিক প্রফিট',
    monthlyProfit: 'মাসিক প্রফিট',
    totalPeriodProfit: 'মোট মেয়াদ প্রফিট',
    maturityTotal: 'মেয়াদ শেষে মোট পে-আউট',
    investNow: 'বিনিয়োগ সক্রিয় করুন',
    depositTitle: 'তহবিল ডিপোজিট করুন',
    withdrawTitle: 'প্রফিট উইথড্র করুন',
    walletBalance: 'আমার ওয়ালেট ব্যালেন্স',
    activeInvested: 'সক্রিয় বিনিয়োগের পরিমাণ',
    totalEarned: 'মোট উপার্জিত লাভ',
    depositBtn: 'ডিপোজিট করুন',
    withdrawBtn: 'উইথড্র করুন',
    activationGuide: 'বিনিয়োগ ও ডিপোজিট সক্রিয় করার প্রক্রিয়া',
    advisorTelegram: 'অফিসিয়াল টেলিগ্রাম ভিআইপি এজেন্ট',
    advisorMessenger: 'ফেসবুক মেসেঞ্জার ডিরেক্ট এডভাইজার',
    warningText: 'সতর্কতা: অযাচিত জাল স্ক্যামারদের থেকে বাঁচতে এবং আপনার লেনদেন সম্পূর্ণ নিরাপদ রাখতে কেবল নিচে উল্লেখিত অফিশিয়াল ডিরেক্ট সাপোর্ট লিঙ্কে ক্লিক করেই মেসেজ দিন।',
    liveFeedTitle: 'লাইভ বিনিয়োগকারী ও উত্তোলন ফিড',
    noInvestments: 'কোনো সক্রিয় বিনিয়োগের প্ল্যান পাওয়া যায়নি',
    activePortfolios: 'আপনার সক্রিয় পোর্টফোলিও সমূহ',
    durationLabel: 'মেয়াদকাল',
    payoutTime: 'প্রতি ২ সেকেন্ড পর লাইভ ব্যালেন্স বাড়ছে',
    daysLabel: 'দিন',
    selectPlan: 'প্ল্যান নির্বাচন করুন',
    calculateBtn: 'ক্যালকুলেট করুন',
    paymentMethod: 'পেমেন্ট চ্যানেল',
    phoneOrAddress: 'একাউন্ট নম্বর / ওয়ালেট ঠিকানা',
    amountLabel: 'পরিমাণ',
    cancel: 'বাতিল',
    submit: 'অনুরোধ পাঠান',
    processing: 'নিরাপদ লেনদেন প্রক্রিয়াধীন রয়েছে...',
    depositSuccess: '{amount} ডিপোজিট সফলভাবে জমা হয়েছে! ফান্ডটি আপনার ওয়ালেটে যোগ করা হয়েছে।',
    withdrawSuccess: '{amount} উইথড্র অনুরোধ গৃহীত হয়েছে! খুব শীঘ্রই আপনার একাউন্টে পাঠানো হবে।',
    insufficientFunds: 'এই কাজটি সম্পন্ন করার জন্য ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।',
    activePlansCount: 'চলমান বিনিয়োগ',
    allRightsReserved: '© ২০২৪ ডিআইএইচ হাব। সর্বস্বত্ব সংরক্ষিত।'
  },
  hi: {
    portalTitle: 'डीआईएच हब - प्रीमियम निवेश पोर्टल',
    heroTitle: 'डीआईएच वेल्थ मल्टीप्लायर',
    heroSubtitle: 'हमारे अत्यधिक सुरक्षित एआई-संचालित स्वचालित ट्रेडिंग और वित्तीय पूल के साथ अपने निष्क्रिय धन को बढ़ाएं। प्रीमियम आश्वासन के साथ दैनिक भुगतान।',
    officialPlans: 'आधिकारिक निवेश योजनाएं',
    calculatorTitle: 'लाभ कैलकुलेटर',
    calculatorSubtitle: 'अपने दैनिक रिटर्न का अनुमान लगाएं',
    investmentAmount: 'निवेश की राशि',
    dailyRate: 'दैनिक दर',
    dailyProfit: 'दैनिक लाभ',
    weeklyProfit: 'साप्ताहिक लाभ',
    monthlyProfit: 'मासिक लाभ',
    totalPeriodProfit: 'कुल अवधि लाभ',
    maturityTotal: 'परिपक्वता कुल भुगतान',
    investNow: 'निवेश सक्रिय करें',
    depositTitle: 'फंड जमा करें',
    withdrawTitle: 'लाभ निकालें',
    walletBalance: 'मेरा वॉलेट बैलेंस',
    activeInvested: 'सक्रिय निवेश राशि',
    totalEarned: 'कुल अर्जित लाभ',
    depositBtn: 'जमा करें',
    withdrawBtn: 'निकासी करें',
    activationGuide: 'निवेश और जमा सक्रिय करने की प्रक्रिया',
    advisorTelegram: 'आधिकारिक टेलीग्राम वीआईपी एजेंट',
    advisorMessenger: 'फेसबुक मैसेंजर डायरेक्ट सलाहकार',
    warningText: 'चेतावनी: धोखाधड़ी से बचने और सुरक्षित लेनदेन सुनिश्चित करने के लिए, हमेशा नीचे दिए गए सत्यापित सहायता बटनों पर क्लिक करके ही संपर्क करें।',
    liveFeedTitle: 'लाइव वैश्विक भुगतान और जमा फीड',
    noInvestments: 'अभी तक कोई सक्रिय निवेश नहीं है',
    activePortfolios: 'आपके सक्रिय पोर्टफोलियो',
    durationLabel: 'अवधि',
    payoutTime: 'हर २ सेकंड में लाइव आय बढ़ रही है',
    daysLabel: 'दिन',
    selectPlan: 'योजना चुनें',
    calculateBtn: 'गणना करें',
    paymentMethod: 'भुगतान चैनल',
    phoneOrAddress: 'खाता फोन / वॉलेट पता',
    amountLabel: 'राशि',
    cancel: 'रद्द करें',
    submit: 'अनुरोध भेजें',
    processing: 'लेनदेन को सुरक्षित रूप से संसाधित किया जा रहा है...',
    depositSuccess: '{amount} का जमा प्राप्त हुआ! राशि आपके वॉलेट में तुरंत जोड़ दी गई है।',
    withdrawSuccess: '{amount} की निकासी संसाधित हो गई है! जल्द ही आपके खाते में भेजी जाएगी।',
    insufficientFunds: 'इस कार्य को पूरा करने के लिए वॉलेट में अपर्याप्त राशि है।',
    activePlansCount: 'सक्रिय निवेश',
    allRightsReserved: '© 2024 डीआईएच हब। सर्वाधिकार सुरक्षित।'
  },
  ar: {
    portalTitle: 'دي إي إتش هاب - بوابة الاستثمار المتميزة',
    heroTitle: 'مضاعف الثروة دي إي إتش',
    heroSubtitle: 'نمِّ أموالك غير المستخدمة من خلال برامج التداول الآلي والمحافظ المالية المدعومة بالذكاء الاصطناعي عالية الأمان. عوائد يومية مع ضمان متميز.',
    officialPlans: 'خطط الاستثمار الرسمية',
    calculatorTitle: 'حاسبة الأرباح',
    calculatorSubtitle: 'تقدير عوائدك اليومية',
    investmentAmount: 'مبلغ الاستثمار',
    dailyRate: 'المعدل اليومي',
    dailyProfit: 'الربح اليومي',
    weeklyProfit: 'الربح الأسبوعي',
    monthlyProfit: 'الربح الشهري',
    totalPeriodProfit: 'إجمالي أرباح الفترة',
    maturityTotal: 'إجمالي العائد عند الاستحقاق',
    investNow: 'تفعيل الاستثمار',
    depositTitle: 'إيداع الأموال',
    withdrawTitle: 'سحب الأرباح',
    walletBalance: 'رصيد محفظتي',
    activeInvested: 'حجم الاستثمار النشط',
    totalEarned: 'إجمالي الأرباح المتراكمة',
    depositBtn: 'إيداع أموال',
    withdrawBtn: 'سحب الأرباح',
    activationGuide: 'دليل عملية التفعيل والإيداع المباشر',
    advisorTelegram: 'وكيل دعم تيليجرام الرسمي VIP',
    advisorMessenger: 'مستشار فيسبوك ماسنجر المباشر',
    warningText: 'تحذير: لتجنب الاحتيال وضمان المعاملات الآمنة، تواصل دائماً حصرياً من خلال النقر على أزرار الدعم المعتمدة أدناه.',
    liveFeedTitle: 'خلاصة عمليات السحب والإيداع العالمية المباشرة',
    noInvestments: 'لا توجد استثمارات نشطة بعد',
    activePortfolios: 'محافظك الاستثمارية النشطة',
    durationLabel: 'المدة',
    payoutTime: 'يتم تحديث الأرباح مباشرة كل ثانيتين',
    daysLabel: 'يوم',
    selectPlan: 'اختر الخطة',
    calculateBtn: 'احسب الأرباح',
    paymentMethod: 'قناة الدفع',
    phoneOrAddress: 'هاتف الحساب / عنوان المحفظة',
    amountLabel: 'المبلغ',
    cancel: 'إلغاء',
    submit: 'إرسال الطلب',
    processing: 'جاري معالجة المعاملة بشكل آمن...',
    depositSuccess: 'تم استلام إيداع بقيمة {amount}! تم إضافته فوراً إلى محفظتك الاستثمارية.',
    withdrawSuccess: 'تمت معالجة سحب بقيمة {amount}! سيتم إرساله إلى حسابك قريباً.',
    insufficientFunds: 'رصيد المحفظة غير كافٍ لإتمام هذه العملية.',
    activePlansCount: 'الاستثمارات النشطة',
    allRightsReserved: 'جميع الحقوق محفوظة © دي إي إتش هاب ٢٠٢٤.'
  }
};

const getPlanName = (plan: InvestmentPlan, l: 'en' | 'bn' | 'hi' | 'ar') => {
  if (l === 'bn') return plan.nameBn;
  if (l === 'hi') return plan.nameHi;
  if (l === 'ar') return plan.nameAr;
  return plan.nameEn;
};

const getPlanTag = (plan: InvestmentPlan, l: 'en' | 'bn' | 'hi' | 'ar') => {
  if (l === 'bn') return plan.tagBn;
  if (l === 'hi') return plan.tagHi;
  if (l === 'ar') return plan.tagAr;
  return plan.tagEn;
};

const getPlanFeatures = (plan: InvestmentPlan, l: 'en' | 'bn' | 'hi' | 'ar') => {
  if (l === 'bn') return plan.featuresBn;
  if (l === 'hi') return plan.featuresHi;
  if (l === 'ar') return plan.featuresAr;
  return plan.featuresEn;
};

interface DihInvestProps {
  currentUser?: any;
  onAuthClick?: () => void;
  onUserUpdate?: (user: any) => void;
}

export default function DihInvest({ currentUser, onAuthClick, onUserUpdate }: DihInvestProps) {
  const [lang, setLang] = useState<'en' | 'bn' | 'hi' | 'ar'>(() => {
    try {
      const browserLang = navigator.language || (navigator as any).userLanguage || '';
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const cleanLang = browserLang.toLowerCase();
      if (cleanLang.startsWith('bn') || tz.includes('Dhaka')) return 'bn';
      if (cleanLang.startsWith('hi') || tz.includes('Kolkata')) return 'hi';
      if (cleanLang.startsWith('ar') || tz.includes('Asia/Riyadh') || tz.includes('Asia/Dubai') || tz.includes('Africa/Cairo')) return 'ar';
      return 'en';
    } catch {
      return 'en';
    }
  });
  const [currency, setCurrency] = useState<'USD' | 'BDT' | 'INR' | 'AED'>('USD');
  const [calcPlan, setCalcPlan] = useState<string>('standard');
  const [calcAmount, setCalcAmount] = useState<number>(250);
  
  // Simulated balance and investment states stored in LocalStorage
  const [simBalance, setSimBalance] = useState<number>(() => {
    const saved = localStorage.getItem('dih_sim_balance_v2');
    return saved ? parseFloat(saved) : 0.0;
  });
  const [simInvestments, setSimInvestments] = useState<any[]>(() => {
    const saved = localStorage.getItem('dih_sim_invests_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // KYC Verification States
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  // React refs for programmatic file upload trigger
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [kycForm, setKycForm] = useState({
    documentType: 'NID' as 'NID' | 'Passport' | 'Driving License',
    documentNumber: '',
    fullName: '',
    dob: '',
    frontImage: null as string | null,
    backImage: null as string | null
  });
  const [kycError, setKycError] = useState('');
  const [isKycSubmitting, setIsKycSubmitting] = useState(false);

  // KYC Drag & Drop and File Selection Handlers
  const [isFrontDragging, setIsFrontDragging] = useState(false);
  const [isBackDragging, setIsBackDragging] = useState(false);

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setKycError(lang === 'bn' ? 'ফাইল সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না' : 'File size cannot exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycForm(p => ({ ...p, frontImage: reader.result as string }));
        setKycError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setKycError(lang === 'bn' ? 'ফাইল সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না' : 'File size cannot exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycForm(p => ({ ...p, backImage: reader.result as string }));
        setKycError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFrontDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFrontDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setKycError(lang === 'bn' ? 'ফাইল সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না' : 'File size cannot exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycForm(p => ({ ...p, frontImage: reader.result as string }));
        setKycError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBackDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setKycError(lang === 'bn' ? 'ফাইল সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না' : 'File size cannot exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycForm(p => ({ ...p, backImage: reader.result as string }));
        setKycError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // State controls for Deposit/Withdraw Forms
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (isDepositOpen || isWithdrawOpen || isKycModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDepositOpen, isWithdrawOpen, isKycModalOpen]);
  const [transAmount, setTransAmount] = useState<number>(500);
  const [paymentChannel, setPaymentChannel] = useState<string>('BKASH');
  const [accountDetail, setAccountDetail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDepTab, setActiveDepTab] = useState<'POPULAR' | 'EPAY' | 'BANKS' | 'CRYPTO'>('POPULAR');
  const [selectedDepMethod, setSelectedDepMethod] = useState<any | null>(null);
  const [firstName, setFirstName] = useState('MD BAREK');
  const [lastName, setLastName] = useState('Bhuiyan');
  const [receiveType, setReceiveType] = useState('Binance account ID');
  const [binanceAccountId, setBinanceAccountId] = useState('495331860');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Track the last used deposit details
  const [lastDepMethodId, setLastDepMethodId] = useState<string | null>(() => {
    return localStorage.getItem('dih_last_deposit_method_id');
  });
  const [lastDepName, setLastDepName] = useState<string | null>(() => {
    return localStorage.getItem('dih_last_deposit_name');
  });
  const [lastDepAmountUsd, setLastDepAmountUsd] = useState<number | null>(() => {
    const saved = localStorage.getItem('dih_last_deposit_amount_usd');
    return saved ? parseFloat(saved) : null;
  });

  // Automatically pre-fill First and Last name in withdrawal from verified NID/KYC details
  useEffect(() => {
    if (currentUser?.kycStatus === 'verified' && currentUser.kycDetails) {
      try {
        const details = JSON.parse(currentUser.kycDetails);
        if (details && details.fullName) {
          const parts = details.fullName.trim().split(/\s+/);
          if (parts.length > 1) {
            setFirstName(parts.slice(0, parts.length - 1).join(' '));
            setLastName(parts[parts.length - 1]);
          } else {
            setFirstName(details.fullName);
            setLastName('');
          }
        }
      } catch (e) {
        if (currentUser.name) {
          const parts = currentUser.name.trim().split(/\s+/);
          if (parts.length > 1) {
            setFirstName(parts.slice(0, parts.length - 1).join(' '));
            setLastName(parts[parts.length - 1]);
          } else {
            setFirstName(currentUser.name);
            setLastName('');
          }
        }
      }
    } else if (currentUser) {
      if (currentUser.name) {
        const parts = currentUser.name.trim().split(/\s+/);
        if (parts.length > 1) {
          setFirstName(parts.slice(0, parts.length - 1).join(' '));
          setLastName(parts[parts.length - 1]);
        } else {
          setFirstName(currentUser.name);
          setLastName('');
        }
      }
    }
  }, [currentUser?.id, currentUser?.kycStatus, currentUser?.kycDetails, currentUser?.name]);

  // Helper to map deposit method names to withdrawal payment options
  const getWithdrawalChannelFromDeposit = (depName: string): string => {
    const nameClean = depName.toLowerCase();
    if (nameClean.includes('binance')) return 'BINANCE';
    if (nameClean.includes('bkash')) return 'BKASH';
    if (nameClean.includes('nagad')) return 'NAGAD';
    if (nameClean.includes('usdt')) return 'CRYPTO_USDT';
    if (nameClean.includes('litecoin') || nameClean.includes('ltc') || nameClean.includes('doge') || nameClean.includes('tron') || nameClean.includes('kucoin')) return 'LITECOIN';
    return 'BINANCE';
  };

  // Automatically pre-select and restrict withdrawal channel based on the user's last deposit payment method
  useEffect(() => {
    if (isWithdrawOpen && lastDepName) {
      const channel = getWithdrawalChannelFromDeposit(lastDepName);
      setPaymentChannel(channel);
      if (channel === 'BKASH') {
        setReceiveType('bKash Personal Number');
      } else if (channel === 'NAGAD') {
        setReceiveType('Nagad Personal Number');
      } else if (channel === 'CRYPTO_USDT') {
        setReceiveType('TRC20 Wallet Address');
      } else if (channel === 'LITECOIN') {
        setReceiveType('TRC20 Wallet Address');
      } else {
        setReceiveType('Binance account ID');
      }
    }
  }, [isWithdrawOpen, lastDepName]);

  // Synchronize simInvestments with currentUser portfolio when logged in or out
  useEffect(() => {
    if (currentUser) {
      if (Array.isArray(currentUser.investments)) {
        setSimInvestments(currentUser.investments);
      } else {
        setSimInvestments([]);
      }
    } else {
      const saved = localStorage.getItem('dih_sim_invests_v2');
      setSimInvestments(saved ? JSON.parse(saved) : []);
    }
  }, [currentUser?.id, JSON.stringify(currentUser?.investments || [])]);

  // Live ticking effect for investments - updates values every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (simInvestments.length === 0) return;
      
      setSimInvestments(prev => {
        let earningsAdded = 0;
        const updated = prev.map(inv => {
          const plan = INVESTMENT_PLANS.find(p => p.id === inv.planId) || INVESTMENT_PLANS[0];
          // Accelerated multiplier rate for engaging UI ticking feedback: 50x faster
          const tickRate = (inv.amount * (plan.dailyRoi / 100)) / (24 * 30); 
          const nextEarned = inv.earned + tickRate;
          earningsAdded += tickRate;
          return {
            ...inv,
            earned: parseFloat(nextEarned.toFixed(4)),
            totalReturn: parseFloat((inv.amount + nextEarned).toFixed(4))
          };
        });
        
        localStorage.setItem('dih_sim_invests_v2', JSON.stringify(updated));
        
        const curr = CURRENCIES[currency];
        if (currentUser) {
          const earningsUsd = earningsAdded / curr.rate;
          const updatedUser = {
            ...currentUser,
            balance: parseFloat(((currentUser.balance || 0) + earningsUsd).toFixed(4)),
            investments: updated
          };
          if (onUserUpdate) {
            onUserUpdate(updatedUser);
          }
        } else {
          // Accumulate returns directly into wallet balance
          setSimBalance(b => {
            const nextBal = b + earningsAdded;
            localStorage.setItem('dih_sim_balance_v2', nextBal.toFixed(2));
            return nextBal;
          });
        }
        
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [simInvestments.length, currentUser?.id, currency]);

  // Auto-save investments and balance to the server periodically (every 10 seconds)
  useEffect(() => {
    if (!currentUser) return;

    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/users/investments/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            investments: currentUser.investments || [],
            balance: currentUser.balance || 0
          })
        });
        if (!res.ok) {
          console.error('Failed to auto-sync investments and balance to cloud');
        }
      } catch (err) {
        console.error('Error auto-syncing to cloud:', err);
      }
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [currentUser?.id, currentUser?.balance, JSON.stringify(currentUser?.investments || [])]);

  // Adjust calculator default value when plan or currency shifts
  useEffect(() => {
    const plan = INVESTMENT_PLANS.find(p => p.id === calcPlan) || INVESTMENT_PLANS[1];
    const curr = CURRENCIES[currency];
    const min = Math.round(plan.minAmount * curr.rate);
    const max = Math.round(plan.maxAmount * curr.rate);
    
    // Smooth boundary lock
    if (calcAmount < min) {
      setCalcAmount(min);
    } else if (calcAmount > max) {
      setCalcAmount(max);
    }
  }, [calcPlan, currency]);

  // Form helpers
  const t = TRANSLATIONS[lang];
  const curr = CURRENCIES[currency];

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const currentBalance = currentUser ? (currentUser.balance || 0) * curr.rate : simBalance;

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerAlert('error', 'Please login to submit verification');
      return;
    }
    if (!kycForm.documentNumber || !kycForm.fullName || !kycForm.dob) {
      setKycError('All fields are required');
      return;
    }
    if (!kycForm.frontImage || !kycForm.backImage) {
      setKycError(lang === 'bn' ? 'দয়া করে সামনের এবং পেছনের ছবি আপলোড করুন' : 'Please upload both front and back side images');
      return;
    }
    setKycError('');
    setIsKycSubmitting(true);

    try {
      const res = await fetch('/api/auth/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          kycType: kycForm.documentType,
          kycDocumentNumber: kycForm.documentNumber,
          kycDetails: JSON.stringify({ fullName: kycForm.fullName, dob: kycForm.dob }),
          kycFrontImage: kycForm.frontImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500',
          kycBackImage: kycForm.backImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500'
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (onUserUpdate) onUserUpdate(data.user);
        setIsKycModalOpen(false);
        triggerAlert('success', lang === 'bn' 
          ? 'ভেরিফিকেশন সফলভাবে সাবমিট করা হয়েছে! পর্যালোচনা সাধারণত ৫-১০ মিনিট সময় নেয়।' 
          : 'Verification submitted successfully! Review usually takes 5-10 minutes.');
      } else {
        setKycError(data.error || 'Failed to submit verification');
      }
    } catch (err) {
      setKycError('Network error. Please try again.');
    } finally {
      setIsKycSubmitting(false);
    }
  };

  const handleInstantKycBypass = async (action: 'approve' | 'reject') => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/auth/kyc/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          action
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (onUserUpdate) onUserUpdate(data.user);
        triggerAlert('success', action === 'approve' 
          ? (lang === 'bn' ? 'অ্যাকাউন্ট সফলভাবে ভেরিফাই করা হয়েছে!' : 'Account verified successfully!') 
          : (lang === 'bn' ? 'অ্যাকাউন্ট ভেরিফিকেশন বাতিল করা হয়েছে!' : 'Account verification rejected!'));
      } else {
        triggerAlert('error', 'Failed to update verification status');
      }
    } catch (err) {
      triggerAlert('error', 'Network error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transAmount <= 0) return;
    setIsProcessing(true);

    if (currentUser) {
      // Real transaction: convert local currency amount to USD for storage
      const amountUsd = transAmount / curr.rate;
      try {
        const res = await fetch('/api/users/balance/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            amountChangeUsd: amountUsd
          })
        });
        const data = await res.json();
        if (res.ok) {
          if (onUserUpdate) onUserUpdate(data.user);
          setIsDepositOpen(false);
          const formattedAmount = `${curr.symbol}${transAmount.toLocaleString()} ${curr.label}`;
          triggerAlert('success', t.depositSuccess.replace('{amount}', formattedAmount));

          // Save last deposit details in state and localStorage
          if (selectedDepMethod) {
            localStorage.setItem('dih_last_deposit_method_id', selectedDepMethod.id);
            localStorage.setItem('dih_last_deposit_name', selectedDepMethod.name);
            localStorage.setItem('dih_last_deposit_amount_usd', amountUsd.toString());
            setLastDepMethodId(selectedDepMethod.id);
            setLastDepName(selectedDepMethod.name);
            setLastDepAmountUsd(amountUsd);
          }

          setTransAmount(500);
          setAccountDetail('');
        } else {
          triggerAlert('error', data.error || 'Failed to deposit');
        }
      } catch (err) {
        triggerAlert('error', 'Network error. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        setIsDepositOpen(false);
        
        const addedAmount = transAmount; // Added directly in user currency
        setSimBalance(b => {
          const next = b + addedAmount;
          localStorage.setItem('dih_sim_balance_v2', next.toFixed(2));
          return next;
        });

        // Save last deposit details in state and localStorage
        if (selectedDepMethod) {
          const amountUsd = transAmount / curr.rate;
          localStorage.setItem('dih_last_deposit_method_id', selectedDepMethod.id);
          localStorage.setItem('dih_last_deposit_name', selectedDepMethod.name);
          localStorage.setItem('dih_last_deposit_amount_usd', amountUsd.toString());
          setLastDepMethodId(selectedDepMethod.id);
          setLastDepName(selectedDepMethod.name);
          setLastDepAmountUsd(amountUsd);
        }

        const formattedAmount = `${curr.symbol}${transAmount.toLocaleString()} ${curr.label}`;
        triggerAlert('success', t.depositSuccess.replace('{amount}', formattedAmount));
        setTransAmount(500);
        setAccountDetail('');
      }, 1500);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transAmount <= 0) return;
    
    if (currentBalance < transAmount) {
      triggerAlert('error', t.insufficientFunds);
      return;
    }

    setIsProcessing(true);

    if (currentUser) {
      const amountUsd = -(transAmount / curr.rate);
      try {
        const res = await fetch('/api/users/balance/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            amountChangeUsd: amountUsd
          })
        });
        const data = await res.json();
        if (res.ok) {
          if (onUserUpdate) onUserUpdate(data.user);
          setIsWithdrawOpen(false);
          const formattedAmount = `${curr.symbol}${transAmount.toLocaleString()} ${curr.label}`;
          triggerAlert('success', t.withdrawSuccess.replace('{amount}', formattedAmount));
          setTransAmount(500);
          setAccountDetail('');
        } else {
          triggerAlert('error', data.error || 'Failed to withdraw');
        }
      } catch (err) {
        triggerAlert('error', 'Network error. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        setIsWithdrawOpen(false);

        setSimBalance(b => {
          const next = b - transAmount;
          localStorage.setItem('dih_sim_balance_v2', next.toFixed(2));
          return next;
        });

        const formattedAmount = `${curr.symbol}${transAmount.toLocaleString()} ${curr.label}`;
        triggerAlert('success', t.withdrawSuccess.replace('{amount}', formattedAmount));
        setTransAmount(500);
        setAccountDetail('');
      }, 1500);
    }
  };

  const handleInvestPortfolio = async (planId: string, customAmountUsd?: number) => {
    const plan = INVESTMENT_PLANS.find(p => p.id === planId) || INVESTMENT_PLANS[0];
    
    // Compute required amount in the selected currency
    const finalAmount = customAmountUsd 
      ? customAmountUsd * curr.rate 
      : plan.minAmount * curr.rate;

    if (currentBalance < finalAmount) {
      triggerAlert('error', `${t.insufficientFunds} ${t.investNow} requires ${curr.symbol}${finalAmount.toFixed(0)} ${curr.label}.`);
      return;
    }

    if (currentUser) {
      // Check KYC verification first
      if (currentUser.kycStatus !== 'verified') {
        triggerAlert('error', lang === 'bn'
          ? 'কেওয়াইসি ভেরিফিকেশন প্রয়োজন! ইনভেস্ট করতে অনুগ্রহ করে আপনার অ্যাকাউন্টটি NID/পাসপোর্ট/ড্রাইভিং লাইসেন্স দিয়ে ভেরিফাই করুন।'
          : 'KYC Verification Required! Please verify your account with NID/Passport/Driving License to invest.');
        setIsKycModalOpen(true);
        return;
      }

      // Deduct from real account
      const finalAmountUsd = finalAmount / curr.rate;
      setIsProcessing(true);
      try {
        const res = await fetch('/api/users/balance/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            amountChangeUsd: -finalAmountUsd
          })
        });
        const data = await res.json();
        setIsProcessing(false);
        if (res.ok) {
          const newInv = {
            id: Date.now(),
            planId: plan.id,
            planName: getPlanName(plan, lang),
            amount: finalAmount,
            currency: currency,
            earned: 0,
            periodDays: plan.periodDays,
            createdAt: new Date().toLocaleTimeString(),
            userId: currentUser.id
          };

          const nextInvests = [newInv, ...simInvestments];
          setSimInvestments(nextInvests);
          localStorage.setItem('dih_sim_invests_v2', JSON.stringify(nextInvests));

          // Sync immediately to the database
          fetch('/api/users/investments/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              investments: nextInvests,
              balance: data.user.balance
            })
          }).then(syncRes => {
            if (syncRes.ok) return syncRes.json();
          }).then(syncData => {
            if (syncData && onUserUpdate) {
              onUserUpdate(syncData.user);
            } else if (onUserUpdate) {
              onUserUpdate({
                ...data.user,
                investments: nextInvests
              });
            }
          }).catch(err => {
            console.error('Error syncing package purchase to database:', err);
            if (onUserUpdate) onUserUpdate({ ...data.user, investments: nextInvests });
          });

          triggerAlert('success', lang === 'bn' 
            ? `অভিনন্দন! ${getPlanName(plan, lang)} পোর্টফোলিও সফলভাবে সক্রিয় করা হয়েছে।`
            : `Success! Your ${getPlanName(plan, lang)} portfolio is now actively yielding daily profits.`
          );
        } else {
          triggerAlert('error', data.error || 'Failed to deduct investment balance');
        }
      } catch (err) {
        setIsProcessing(false);
        triggerAlert('error', 'Network error');
      }
    } else {
      // Deduct principal
      setSimBalance(b => {
        const next = b - finalAmount;
        localStorage.setItem('dih_sim_balance_v2', next.toFixed(2));
        return next;
      });

      const newInv = {
        id: Date.now(),
        planId: plan.id,
        planName: getPlanName(plan, lang),
        amount: finalAmount,
        currency: currency,
        earned: 0,
        periodDays: plan.periodDays,
        createdAt: new Date().toLocaleTimeString()
      };

      const nextInvests = [newInv, ...simInvestments];
      setSimInvestments(nextInvests);
      localStorage.setItem('dih_sim_invests_v2', JSON.stringify(nextInvests));

      triggerAlert('success', lang === 'bn' 
        ? `অভিনন্দন! ${getPlanName(plan, lang)} পোর্টফোলিও সফলভাবে সক্রিয় করা হয়েছে।`
        : `Success! Your ${getPlanName(plan, lang)} portfolio is now actively yielding daily profits.`
      );
    }
  };

  const handleResetWallet = () => {
    localStorage.removeItem('dih_sim_balance_v2');
    localStorage.removeItem('dih_sim_invests_v2');
    setSimBalance(5000.0);
    setSimInvestments([]);

    if (currentUser) {
      // Clear database record too!
      fetch('/api/users/investments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          investments: [],
          balance: 5000.0
        })
      }).then(res => res.json())
        .then(data => {
          if (data.status === 'ok' && onUserUpdate) {
            onUserUpdate(data.user);
          }
        }).catch(err => console.error('Error resetting cloud investments:', err));
    }

    triggerAlert('success', lang === 'bn' ? 'সিমুলেটর ওয়ালেট সফলভাবে রিসেট করা হয়েছে।' : 'Simulator wallet database reset successfully.');
  };

  // Calculator computations
  const selectedCalcPlan = INVESTMENT_PLANS.find(p => p.id === calcPlan) || INVESTMENT_PLANS[1];
  const currentDailyRate = selectedCalcPlan.dailyRoi;
  const dailyProfit = calcAmount * (currentDailyRate / 100);
  const weeklyProfit = dailyProfit * 7;
  const monthlyProfit = dailyProfit * 30;
  const totalPeriodProfit = dailyProfit * selectedCalcPlan.periodDays;
  const grandTotalPayout = calcAmount + totalPeriodProfit;

  // Active plans total stats
  const activeInvestmentsTotal = simInvestments.reduce((sum, item) => sum + item.amount, 0);
  const totalEarningsAccrued = simInvestments.reduce((sum, item) => sum + item.earned, 0);

  // Simulated live feed of world investors (combining new languages & currencies)
  const LIVE_FEEDS = {
    en: [
      { name: 'Aarav S.', plan: 'Gold Standard', amount: '₹85,000', time: 'Just now', type: 'Deposit' },
      { name: 'Fatima A.', plan: 'Crown Ultimate', amount: 'د.إ45,000', time: '2m ago', type: 'Payout' },
      { name: 'Rafsan K.', plan: 'Diamond Premium', amount: '৳2,50,000', time: '4m ago', type: 'Deposit' },
      { name: 'Liam O.', plan: 'Silver Starter', amount: '$350', time: '7m ago', type: 'Payout' }
    ],
    bn: [
      { name: 'আরাভ এস.', plan: 'গোল্ড স্ট্যান্ডার্ড', amount: '₹৮৫,০০০', time: 'এইমাত্র', type: 'Deposit' },
      { name: 'ফাতিমা এ.', plan: 'ক্রাউন আল্টিমেট', amount: 'د.إ৪৫,০০০', time: '২ মিনিট আগে', type: 'Payout' },
      { name: 'রাফসান কে.', plan: 'ডায়মন্ড প্রিমিয়াম', amount: '৳২,৫০,০০০', time: '৪ মিনিট আগে', type: 'Deposit' },
      { name: 'লিয়াম ও.', plan: 'সিলভার স্টার্টার', amount: '$৩৫০', time: '৭ মিনিট আগে', type: 'Payout' }
    ],
    hi: [
      { name: 'आरव एस.', plan: 'गोल्ड स्टैंडर्ड', amount: '₹85,000', time: 'अभी-अभी', type: 'Deposit' },
      { name: 'फातिमा ए.', plan: 'क्राउन अल्टीमेट', amount: 'د.إ45,000', time: '2 मिनट पहले', type: 'Payout' },
      { name: 'रफ़सान के.', plan: 'डायमंड प्रीमियम', amount: '৳2,50,000', time: '4 मिनट पहले', type: 'Deposit' },
      { name: 'लियाम ओ.', plan: 'सिल्वर स्टार्टर', amount: '$350', time: '7 मिनट पहले', type: 'Payout' }
    ],
    ar: [
      { name: 'آراف س.', plan: 'جولد ستاندرد', amount: '₹85,000', time: 'الآن', type: 'Deposit' },
      { name: 'فاطمة أ.', plan: 'كراون ألتيميت', amount: 'د.إ45,000', time: 'منذ دقيقتين', type: 'Payout' },
      { name: 'رافسان ك.', plan: 'دايموند بريميوم', amount: '৳2,50,000', time: 'منذ 4 دقائق', type: 'Deposit' },
      { name: 'ليام أو.', plan: 'سيلفر ستارتر', amount: '$350', time: 'منذ 7 دقائق', type: 'Payout' }
    ]
  };

  // Helper to render high-fidelity deposit methods with dynamic Repeat functionality
  const renderDepositMethod = (method: any, idx: number) => {
    return (
      <div 
        key={method.id || idx}
        onClick={() => {
          setSelectedDepMethod(method);
          setPaymentChannel(method.name);
          setTransAmount(method.min * curr.rate);
        }}
        className="p-3 bg-[#161a2b] border border-slate-800/80 rounded-xl hover:border-emerald-500/40 hover:bg-[#1a1f35] transition-all cursor-pointer flex items-center justify-between group select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${method.logoBg}`}>
            {method.name.includes('Binance') ? 'B' : method.name.includes('Bkash') ? 'bK' : method.name.includes('Nagad') ? 'Ng' : method.name.charAt(0)}
          </div>
          <div className="text-left">
            <span className="font-bold text-xs text-white block group-hover:text-emerald-400 transition-colors">
              {method.name}
            </span>
            <span className="text-[10px] text-slate-500 block font-medium">
              Min. {curr.symbol}{Math.round(method.min * curr.rate)} ({method.min} USD)
            </span>
          </div>
        </div>
        
        {method.isLastUsed && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock size={8} />
              {lang === 'bn' ? 'সর্বশেষ ব্যবহৃত' : 'Last used'}
            </span>
            {method.hasRepeat && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const lastAmtUsd = lastDepAmountUsd || method.min;
                  const amountInCurr = Math.round(lastAmtUsd * curr.rate);
                  setSelectedDepMethod(method);
                  setPaymentChannel(method.name);
                  setTransAmount(amountInCurr);
                }}
                className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-md hover:bg-emerald-500 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                {lang === 'bn' ? 'রিপিট' : 'Repeat'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 space-y-5 sm:space-y-6 pb-12 sm:pb-20 animate-in fade-in duration-500 relative overflow-hidden">
      {/* Decorative Drifting Neon Cyber Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none bg-drift-1 z-0" />
      <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none bg-drift-2 z-0" />

      {/* High-visibility Custom Scrollbars and Premium Cyber Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #090c15;
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222941;
          border-radius: 99px;
          border: 1px solid #090c15;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
        @keyframes drift-slow-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.92); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift-slow-2 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-50px, 40px) scale(0.9); }
          66% { transform: translate(50px, -30px) scale(1.2); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .bg-drift-1 {
          animation: drift-slow-1 22s infinite ease-in-out;
        }
        .bg-drift-2 {
          animation: drift-slow-2 26s infinite ease-in-out;
        }
        .cyber-card {
          background: rgba(13, 17, 30, 0.55);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
        }
        .cyber-card-glow {
          box-shadow: 0 0 35px rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.15);
        }
        .cyber-glow-btn {
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.22);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cyber-glow-btn:hover {
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.45);
          transform: translateY(-1px);
        }
      `}</style>
      
      {/* Premium Dynamic Alerts */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 p-4 rounded-2xl border text-sm font-bold shadow-2xl flex items-start gap-3 max-w-md ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950 border-red-500/30 text-red-300'
            }`}
          >
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p>{alertMsg.text}</p>
            </div>
            <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Hero Header Block */}
      <div className="text-center space-y-2.5 py-5 sm:py-8 px-3 sm:px-6 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0f1322]/50 backdrop-blur-md border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.6)] z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-full select-none">
          <Sparkles size={11} className="animate-pulse" />
          <span>{t.portalTitle}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white select-none">
          {t.heroTitle}
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Dynamic Global Configuration Panel */}
        <div className="pt-3 flex justify-center items-center gap-3.5 flex-wrap">
          
          {/* 4 Language Switches */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                lang === 'bn' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇧🇩 বাংলা
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                lang === 'en' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                lang === 'hi' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 हिन्दी
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-2.5 py-1 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                lang === 'ar' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇸🇦 العربية
            </button>
          </div>
        </div>
      </div>

      {/* Premium Simulator Wallet Dashboard (Fully Consolidated at top) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
        
        {/* Core Wallet Dashboard Stats card */}
        <div className="lg:col-span-8 p-5 rounded-2xl sm:rounded-3xl cyber-card border border-white/5 space-y-5 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="text-amber-400 shrink-0" size={18} />
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-slate-400">
                {t.walletBalance}
              </span>
            </div>
            <button 
              onClick={handleResetWallet}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] sm:text-[10px] font-black uppercase rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>Reset Simulator</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Wallet Balance */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wide block">
                {currentUser ? 'SECURE ACCOUNT WALLET' : 'SIMULATOR WALLET (GUEST)'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight glow-text">
                {curr.symbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center gap-1.5 pt-1.5">
                <button 
                  onClick={() => setIsDepositOpen(true)}
                  className="flex-1 py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 active:scale-95 text-slate-950 font-black uppercase tracking-wider text-[10px] rounded-lg transition-all text-center cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  + {t.depositBtn}
                </button>
                <button 
                  onClick={() => setIsWithdrawOpen(true)}
                  className="flex-1 py-1.5 px-3 bg-slate-900/60 hover:bg-slate-800/80 active:scale-95 text-white font-black uppercase tracking-wider text-[10px] rounded-lg transition-all text-center border border-white/5 cursor-pointer"
                >
                  - {t.withdrawBtn}
                </button>
              </div>
            </div>

            {/* Total Invested Volume */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 flex flex-col justify-center">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wide block">{t.activeInvested}</span>
              <h4 className="text-xl font-black text-white font-mono">
                {curr.symbol}{activeInvestmentsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <p className="text-[10px] text-amber-500 font-bold uppercase font-mono">{simInvestments.length} {t.activePlansCount}</p>
            </div>

            {/* Accumulated Ticking Earnings */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] text-emerald-400 uppercase font-black tracking-wide block">{t.totalEarned}</span>
              <h4 className="text-xl font-black text-emerald-400 font-mono">
                +{curr.symbol}{totalEarningsAccrued.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              </h4>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-sans">{t.payoutTime}</p>
            </div>
          </div>
        </div>

        {/* User Account Verification / Security Status */}
        <div className="lg:col-span-4 p-5 rounded-2xl sm:rounded-3xl cyber-card border border-white/5 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-amber-500" />
              <span>{lang === 'bn' ? 'অ্যাকাউন্ট সিকিউরিটি এবং কেওয়াইসি' : 'SECURITY & ACCOUNT VERIFICATION'}</span>
            </h4>

            {!currentUser ? (
              <div className="space-y-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {lang === 'bn'
                    ? 'আসল বিনিয়োগ এবং পোর্টফোলিও সক্রিয় করতে এবং রিয়েল-টাইম ডিপোজিট করতে অনুগ্রহ করে লগইন করুন।'
                    : 'To track live portfolio, access deposits, and activate investments, please log in first.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'bn' ? 'কেওয়াইসি স্ট্যাটাস' : 'KYC Verification'}</span>
                  {currentUser.kycStatus === 'verified' ? (
                    <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-black tracking-widest uppercase flex items-center gap-1">
                      <ShieldCheck size={11} /> {lang === 'bn' ? 'ভেরিফাইড' : 'Verified'}
                    </span>
                  ) : currentUser.kycStatus === 'pending' ? (
                    <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 font-black tracking-widest uppercase flex items-center gap-1">
                      <RefreshCw size={10} className="animate-spin" /> {lang === 'bn' ? 'পেন্ডিং' : 'Pending'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] bg-rose-500/10 text-rose-400 font-black tracking-widest uppercase">
                      {lang === 'bn' ? 'আনভেরিফাইড' : 'Unverified'}
                    </span>
                  )}
                </div>
                {currentUser.kycStatus !== 'verified' && (
                  <button
                    onClick={() => setIsKycModalOpen(true)}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-110 text-white font-black uppercase tracking-wider text-[10px] rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 shadow shadow-blue-500/15 active:scale-[0.98]"
                  >
                    <ShieldCheck size={12} />
                    <span>{lang === 'bn' ? 'কেওয়াইসি ভেরিফাই করুন' : 'Verify Identity Now'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDepositOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 overflow-hidden">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0e17] border border-white/5 rounded-2xl w-full max-w-md text-left shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header with balance display built in */}
              <div className="p-3 sm:p-4 flex justify-between items-center relative border-b border-white/5 shrink-0 bg-[#070910]">
                <div className="flex items-center gap-1.5 select-none">
                  <Wallet className="text-emerald-500" size={16} />
                  <span className="text-xs font-black text-white tracking-wider uppercase">Make a Deposit</span>
                </div>
                <button 
                  onClick={() => {
                    setIsDepositOpen(false);
                    setSelectedDepMethod(null);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {!selectedDepMethod ? (
                /* Step 1: Choose a deposit method list */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 bg-[#0a0d15] border-b border-white/5 shrink-0">
                    <div className="flex bg-[#070910] p-1 rounded-xl gap-1">
                      {(['POPULAR', 'EPAY', 'BANKS', 'CRYPTO'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveDepTab(tab)}
                          className={`flex-1 py-1 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                            activeDepTab === tab 
                              ? 'bg-slate-900 text-white shadow' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {tab === 'POPULAR' ? 'Popular' : tab === 'EPAY' ? 'E-Wallet' : tab === 'BANKS' ? 'Bank' : 'Crypto'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Methods list */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    <div className="grid grid-cols-1 gap-2">
                      {/* Popular Methods List */}
                      {activeDepTab === 'POPULAR' && [
                        { id: 'binance_pay', name: 'Binance Pay', min: 10, logoBg: 'bg-amber-500/10 text-amber-500' },
                        { id: 'bkash_p2c', name: 'Bkash (P2C)', min: 10, logoBg: 'bg-pink-500/10 text-pink-500' },
                        { id: 'nagad_p2c', name: 'Nagad (P2C)', min: 10, logoBg: 'bg-orange-500/10 text-orange-500' },
                        { id: 'usdt_bep20', name: 'USDT (BEP-20)', min: 20, logoBg: 'bg-teal-500/10 text-teal-500' },
                        { id: 'usdt_trc20', name: 'USDT (TRC-20)', min: 15, logoBg: 'bg-teal-500/10 text-teal-500' },
                        { id: 'doge', name: 'Dogecoin', min: 15, logoBg: 'bg-yellow-500/10 text-yellow-500' },
                        { id: 'tron_trx', name: 'Tron (TRX)', min: 15, logoBg: 'bg-red-500/10 text-red-500' },
                        { id: 'kucoin_pay', name: 'Kucoin Pay', min: 10, logoBg: 'bg-emerald-500/10 text-emerald-500' }
                      ].map((method) => {
                        const isActualLast = lastDepMethodId ? (method.id === lastDepMethodId || method.name === lastDepName) : false;
                        return {
                          ...method,
                          isLastUsed: isActualLast,
                          hasRepeat: isActualLast
                        };
                      }).map((method, idx) => renderDepositMethod(method, idx))}

                      {/* E-Pay Methods List */}
                      {activeDepTab === 'EPAY' && [
                        { id: 'bkash_p2c', name: 'Bkash (P2C)', min: 10, logoBg: 'bg-pink-500/10 text-pink-500' },
                        { id: 'nagad_p2c', name: 'Nagad (P2C)', min: 10, logoBg: 'bg-orange-500/10 text-orange-500' }
                      ].map((method) => {
                        const isActualLast = lastDepMethodId ? (method.id === lastDepMethodId || method.name === lastDepName) : false;
                        return {
                          ...method,
                          isLastUsed: isActualLast,
                          hasRepeat: isActualLast
                        };
                      }).map((method, idx) => renderDepositMethod(method, idx))}

                      {/* Banks List */}
                      {activeDepTab === 'BANKS' && [
                        { id: 'mastercard', name: 'Mastercard / Bank', min: 20, logoBg: 'bg-blue-500/10 text-blue-500' }
                      ].map((method) => {
                        const isActualLast = lastDepMethodId ? (method.id === lastDepMethodId || method.name === lastDepName) : false;
                        return {
                          ...method,
                          isLastUsed: isActualLast,
                          hasRepeat: isActualLast
                        };
                      }).map((method, idx) => renderDepositMethod(method, idx))}

                      {/* Crypto List */}
                      {activeDepTab === 'CRYPTO' && [
                        { id: 'usdt_bep20', name: 'USDT (BEP-20)', min: 20, logoBg: 'bg-teal-500/10 text-teal-500' },
                        { id: 'usdt_trc20', name: 'USDT (TRC-20)', min: 15, logoBg: 'bg-teal-500/10 text-teal-500' },
                        { id: 'doge', name: 'Dogecoin', min: 15, logoBg: 'bg-yellow-500/10 text-yellow-500' },
                        { id: 'tron_trx', name: 'Tron (TRX)', min: 15, logoBg: 'bg-red-500/10 text-red-500' },
                        { id: 'kucoin_pay', name: 'Kucoin Pay', min: 10, logoBg: 'bg-emerald-500/10 text-emerald-500' },
                        { id: 'btc', name: 'Bitcoin (BTC)', min: 50, logoBg: 'bg-amber-500/10 text-amber-500' },
                        { id: 'eth', name: 'Ethereum (ETH)', min: 50, logoBg: 'bg-purple-500/10 text-purple-500' },
                        { id: 'ltc', name: 'Litecoin (LTC)', min: 10, logoBg: 'bg-slate-400/10 text-slate-300' },
                        { id: 'xrp', name: 'Ripple (XRP)', min: 10, logoBg: 'bg-indigo-500/10 text-indigo-400' },
                        { id: 'sol', name: 'Solana (SOL)', min: 20, logoBg: 'bg-pink-500/10 text-pink-500' },
                        { id: 'ada', name: 'Cardano (ADA)', min: 15, logoBg: 'bg-blue-500/10 text-blue-500' },
                        { id: 'dot', name: 'Polkadot (DOT)', min: 15, logoBg: 'bg-rose-500/10 text-rose-500' },
                        { id: 'shib', name: 'Shiba Inu (SHIB)', min: 15, logoBg: 'bg-red-500/10 text-red-400' },
                        { id: 'matic', name: 'Polygon (MATIC)', min: 15, logoBg: 'bg-violet-500/10 text-violet-400' },
                        { id: 'atom', name: 'Cosmos (ATOM)', min: 15, logoBg: 'bg-indigo-600/10 text-indigo-300' },
                        { id: 'link', name: 'Chainlink (LINK)', min: 20, logoBg: 'bg-blue-600/10 text-blue-400' },
                        { id: 'uni', name: 'Uniswap (UNI)', min: 20, logoBg: 'bg-pink-600/10 text-pink-400' },
                        { id: 'xlm', name: 'Stellar (XLM)', min: 10, logoBg: 'bg-slate-500/10 text-slate-300' }
                      ].map((method) => {
                        const isActualLast = lastDepMethodId ? (method.id === lastDepMethodId || method.name === lastDepName) : false;
                        return {
                          ...method,
                          isLastUsed: isActualLast,
                          hasRepeat: isActualLast
                        };
                      }).map((method, idx) => renderDepositMethod(method, idx))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Payment input form (Ultra compact) */
                <form onSubmit={handleDeposit} className="flex-1 flex flex-col overflow-hidden bg-[#070910]/20">
                  {/* Scrollable Form Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    <div className="flex items-center gap-2.5 p-2 bg-[#0d101a] border border-white/5 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedDepMethod.logoBg}`}>
                        {selectedDepMethod.name.includes('Binance') ? 'B' : selectedDepMethod.name.includes('Bkash') ? 'bK' : selectedDepMethod.name.includes('Nagad') ? 'Ng' : 'C'}
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-xs text-white">{selectedDepMethod.name}</h4>
                        <p className="text-[10px] text-slate-500">Min deposit: {curr.symbol}{Math.round(selectedDepMethod.min * curr.rate)} ({selectedDepMethod.min} USD)</p>
                      </div>
                    </div>

                    {/* Manual Instructions - Highly compact */}
                    <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-emerald-300 space-y-1 text-left leading-relaxed">
                      <p className="font-black uppercase tracking-wider text-[9px] text-emerald-400">Payment Steps:</p>
                      {selectedDepMethod.name.includes('Bkash') || selectedDepMethod.name.includes('Nagad') ? (
                        <p>Cash-out to official manual agent: <span className="font-mono text-white font-black underline">01783-999333</span>. Then submit your personal mobile & TxID below.</p>
                      ) : selectedDepMethod.name.includes('Binance') ? (
                        <p>Send simulated funds directly to Pay ID: <span className="font-mono text-white font-black underline">495331860</span>. Provide your Binance ID below to confirm.</p>
                      ) : (
                        <p>Transfer {selectedDepMethod.name} to address: <span className="font-mono text-white font-black underline">TLZqD9q5v8V5Y77Xh88N9</span>. Enter wallet address/hash below.</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Amount ({curr.label})</label>
                      <div className="flex items-center gap-2 bg-[#070910] border border-white/5 rounded-xl px-3 py-2">
                        <span className="text-emerald-400 font-black font-mono text-xs">{curr.symbol}</span>
                        <input 
                          type="number"
                          required
                          min={Math.round(selectedDepMethod.min * curr.rate)}
                          value={transAmount}
                          onChange={(e) => setTransAmount(parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-none outline-none text-white font-mono font-black text-xs flex-1"
                        />
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        Equivalent to: ${(transAmount / curr.rate).toFixed(2)} USD
                      </span>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] text-slate-500 uppercase font-black tracking-wider">
                        {selectedDepMethod.name.includes('Bkash') || selectedDepMethod.name.includes('Nagad') ? 'Your Mobile & Transaction ID' : 'Wallet Address / Pay ID'}
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder={selectedDepMethod.name.includes('Bkash') || selectedDepMethod.name.includes('Nagad') ? 'e.g., 01712345678, TxID: Ax892kJ' : 'e.g., Binance ID / TRC20 Address'}
                        value={accountDetail}
                        onChange={(e) => setAccountDetail(e.target.value)}
                        className="w-full bg-[#070910] border border-white/5 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="p-3 bg-[#070910] border-t border-white/5 shrink-0 flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setSelectedDepMethod(null)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg font-bold text-xs uppercase cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 font-black rounded-lg text-xs uppercase cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 hover:brightness-110 transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Deposit</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 overflow-hidden">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0e17] border border-white/5 rounded-2xl w-full max-w-md text-left shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header with balance display built in */}
              <div className="p-3 sm:p-4 flex justify-between items-center relative border-b border-white/5 shrink-0 bg-[#070910]">
                <div className="flex items-center gap-1.5 select-none">
                  <TrendingUp className="text-blue-500" size={16} />
                  <span className="text-xs font-black text-white tracking-wider uppercase">Withdrawal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Avail:</span>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-lg">
                    {curr.symbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer ml-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Form wrapping body and sticky footer */}
              <form onSubmit={handleWithdraw} className="flex-1 flex flex-col overflow-hidden bg-[#070910]/20">
                {/* Scrollable grid content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 text-left">
                  {/* Info card */}
                  <div className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-blue-300 space-y-1 leading-relaxed">
                    <p className="font-black uppercase tracking-wider text-[9px] text-blue-400">Security Guard:</p>
                    <p>Withdrawals are simulated immediately in sandbox mode. For real-time funds routing, ensure your ID is approved.</p>
                  </div>

                  {/* Row 1: Amount & Payment Method */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Amount */}
                    <div className="relative border border-white/5 rounded-xl bg-[#0d101a] px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                      <label className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">
                        Amount ({curr.label})
                      </label>
                      <div className="flex items-center gap-1 mt-0.5">
                        <input 
                          type="number"
                          required
                          min={10}
                          value={transAmount}
                          onChange={(e) => setTransAmount(parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-none outline-none text-white font-mono font-black text-xs flex-1"
                        />
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        Equivalent to: ${(transAmount / curr.rate).toFixed(2)} USD
                      </span>
                    </div>

                    {/* Method select */}
                    <div className="relative border border-white/5 rounded-xl bg-[#0d101a] px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                      <label className="text-[8px] text-slate-500 uppercase font-black tracking-wider block mb-0.5">
                        Payment Method
                      </label>
                      <select 
                        value={paymentChannel}
                        disabled={!!lastDepName}
                        onChange={(e) => {
                          setPaymentChannel(e.target.value);
                          if (e.target.value.includes('BKASH') || e.target.value.includes('NAGAD')) {
                            setReceiveType('bKash Personal Number');
                          } else {
                            setReceiveType('Binance account ID');
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none text-xs text-white font-bold cursor-pointer disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        <option value="BINANCE" className="bg-[#0b0e17] text-white">Binance Pay</option>
                        <option value="BKASH" className="bg-[#0b0e17] text-white">bKash Personal</option>
                        <option value="NAGAD" className="bg-[#0b0e17] text-white">Nagad Personal</option>
                        <option value="CRYPTO_USDT" className="bg-[#0b0e17] text-white">USDT (TRC-20)</option>
                        <option value="LITECOIN" className="bg-[#0b0e17] text-white">Litecoin (LTC)</option>
                      </select>
                    </div>
                  </div>

                    {/* Row 2: First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* First Name */}
                      <div className="relative border border-white/5 rounded-xl bg-[#0d101a] px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                        <label className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">
                          First Name
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="text"
                            required
                            readOnly={currentUser?.kycStatus === 'verified'}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-white font-bold text-xs mt-0.5 read-only:text-slate-400"
                          />
                          {currentUser?.kycStatus === 'verified' && (
                            <ShieldCheck size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="relative border border-white/5 rounded-xl bg-[#0d101a] px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                        <label className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">
                          Last Name
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="text"
                            required
                            readOnly={currentUser?.kycStatus === 'verified'}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-white font-bold text-xs mt-0.5 read-only:text-slate-400"
                          />
                          {currentUser?.kycStatus === 'verified' && (
                            <ShieldCheck size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Row 3: Receive Type & Detail Account ID */}
                  <div className="space-y-2">
                    {/* Receive type */}
                    <div className="relative border border-white/5 rounded-xl bg-[#0d101a] px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                      <label className="text-[8px] text-slate-500 uppercase font-black tracking-wider block mb-0.5">
                        Receive Type
                      </label>
                      <select 
                        value={receiveType}
                        onChange={(e) => setReceiveType(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs text-white font-bold cursor-pointer"
                      >
                        <option value="Binance account ID" className="bg-[#0b0e17] text-white">Binance account ID</option>
                        <option value="Binance Pay ID" className="bg-[#0b0e17] text-white">Binance Pay ID</option>
                        <option value="bKash Personal Number" className="bg-[#0b0e17] text-white">bKash Personal Number</option>
                        <option value="Nagad Personal Number" className="bg-[#0b0e17] text-white">Nagad Personal Number</option>
                        <option value="TRC20 Wallet Address" className="bg-[#0b0e17] text-white">TRC20 Wallet Address</option>
                      </select>
                    </div>

                    {/* Detail Account Number */}
                    <div className="relative border border-white/5 rounded-xl bg-[#0d101a] px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                      <label className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">
                        {receiveType}
                      </label>
                      <input 
                        type="text"
                        required
                        value={binanceAccountId}
                        onChange={(e) => setBinanceAccountId(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-white font-bold text-xs mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Red validation help text */}
                  {receiveType === 'Binance account ID' && (binanceAccountId.length < 8 || binanceAccountId.length > 10 || !/^\d+$/.test(binanceAccountId)) && (
                    <p className="text-[10px] text-red-500 font-bold leading-tight">
                      Enter a Binance account number consisting of 8 to 10 digits.
                    </p>
                  )}

                  {receiveType.includes('bKash') && (binanceAccountId.length !== 11 || !/^\d+$/.test(binanceAccountId)) && (
                    <p className="text-[10px] text-red-500 font-bold leading-tight">
                      Enter a valid 11-digit mobile number.
                    </p>
                  )}
                </div>

                {/* Sticky bottom footer containing action buttons */}
                <div className="p-3 bg-[#070910] border-t border-white/5 shrink-0 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsWithdrawOpen(false)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg font-bold text-xs uppercase cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-500 disabled:from-blue-900 disabled:to-blue-950 text-white font-black text-xs uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 hover:brightness-110 active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm</span>
                        <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isKycModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 overflow-hidden">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0e17] border border-white/5 rounded-2xl w-full max-w-md text-left shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-3 sm:p-4 flex justify-between items-center relative border-b border-white/5 shrink-0 bg-[#070910]">
                <div className="flex items-center gap-1.5 select-none">
                  <ShieldCheck className="text-blue-500" size={16} />
                  <span className="text-xs font-black text-white tracking-wider uppercase">
                    {lang === 'bn' ? 'কেওয়াইসি ভেরিফিকেশন' : 'KYC Verification'}
                  </span>
                </div>
                <button 
                  onClick={() => setIsKycModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Hidden file inputs using React Refs */}
              <input
                type="file"
                ref={frontInputRef}
                accept="image/*"
                onChange={handleFrontFileChange}
                className="hidden"
              />
              <input
                type="file"
                ref={backInputRef}
                accept="image/*"
                onChange={handleBackFileChange}
                className="hidden"
              />

              {/* Form wrapping body and footer */}
              <form onSubmit={handleKycSubmit} className="flex-1 flex flex-col overflow-hidden bg-[#070910]/20">
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 text-left">
                  {kycError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      <span>{kycError}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {/* Row 1: Document Type & Full Name */}
                    <div className="grid grid-cols-1 gap-2">
                      {/* ID Document Type */}
                      <div className="relative border border-slate-800 rounded-xl bg-[#111625] px-3 py-1.5 focus-within:border-blue-500 transition-all text-left">
                        <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
                          {lang === 'bn' ? 'ডকুমেন্ট টাইপ' : 'Document Type'}
                        </label>
                        <select 
                          value={kycForm.documentType}
                          onChange={(e) => setKycForm(p => ({ ...p, documentType: e.target.value as any }))}
                          className="w-full bg-transparent border-none outline-none text-xs text-white font-bold cursor-pointer"
                        >
                          <option value="NID" className="bg-[#111422] text-white font-bold">{lang === 'bn' ? 'জাতীয় পরিচয়পত্র (NID)' : 'National ID (NID)'}</option>
                          <option value="Passport" className="bg-[#111422] text-white font-bold">{lang === 'bn' ? 'পাসপোর্ট (Passport)' : 'Passport'}</option>
                          <option value="Driving License" className="bg-[#111422] text-white font-bold">{lang === 'bn' ? 'ড্রাইভিং লাইসেন্স' : 'Driving License'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="relative border border-slate-800 rounded-xl bg-[#111625] px-3 py-1.5">
                      <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                        {lang === 'bn' ? 'পূর্ণ নাম (NID অনুযায়ী)' : 'Full Name (As on ID)'}
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. MD BAREK"
                        value={kycForm.fullName}
                        onChange={(e) => setKycForm(p => ({ ...p, fullName: e.target.value }))}
                        className="w-full bg-transparent border-none outline-none text-white font-bold text-xs mt-0.5"
                      />
                    </div>

                    {/* Document Number */}
                    <div className="relative border border-slate-800 rounded-xl bg-[#111625] px-3 py-1.5">
                      <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                        {lang === 'bn' ? 'ডকুমেন্ট নম্বর / আইডি নম্বর' : 'Document Number / ID Number'}
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. 5542389100"
                        value={kycForm.documentNumber}
                        onChange={(e) => setKycForm(p => ({ ...p, documentNumber: e.target.value }))}
                        className="w-full bg-transparent border-none outline-none text-white font-bold text-xs mt-0.5"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="relative border border-slate-800 rounded-xl bg-[#111625] px-3 py-1.5">
                      <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                        {lang === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                      </label>
                      <input 
                        type="date"
                        required
                        value={kycForm.dob}
                        onChange={(e) => setKycForm(p => ({ ...p, dob: e.target.value }))}
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-transparent border-none outline-none text-white font-bold text-xs mt-0.5 cursor-pointer"
                      />
                    </div>

                    {/* ID Front & Back Photo Upload */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Front Side */}
                      <div 
                        className={`border border-dashed rounded-xl p-3 text-center cursor-pointer flex flex-col justify-center items-center gap-1.5 min-h-[100px] transition-all select-none ${
                          isFrontDragging 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : kycForm.frontImage 
                              ? 'border-emerald-800 bg-[#0c121e]/40' 
                              : 'border-slate-800 hover:border-slate-700 bg-[#0c0e18]'
                        }`}
                        onClick={() => frontInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragEnter={() => setIsFrontDragging(true)}
                        onDragLeave={() => setIsFrontDragging(false)}
                        onDrop={handleFrontDrop}
                      >
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">
                          {lang === 'bn' ? 'সামনের অংশ আপলোড' : 'Front Side Image'}
                        </span>
                        {kycForm.frontImage ? (
                          <div className="relative w-full h-[65px] rounded-lg overflow-hidden flex items-center justify-center bg-slate-900 group">
                            <img 
                              src={kycForm.frontImage} 
                              alt="ID Front" 
                              className="object-cover w-full h-full" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                              <CheckCircle2 className="text-emerald-500" size={14} />
                              <span className="text-[7px] text-white font-bold uppercase">
                                {lang === 'bn' ? 'পরিবর্তن করুন' : 'Change Image'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="text-slate-400 text-[10px] font-bold">+ {lang === 'bn' ? 'ফাইল নির্বাচন' : 'Choose File'}</div>
                            <span className="text-[7px] text-slate-600 uppercase font-mono">JPG, PNG (MAX 5MB)</span>
                          </div>
                        )}
                      </div>

                      {/* Back Side */}
                      <div 
                        className={`border border-dashed rounded-xl p-3 text-center cursor-pointer flex flex-col justify-center items-center gap-1.5 min-h-[100px] transition-all select-none ${
                          isBackDragging 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : kycForm.backImage 
                              ? 'border-emerald-800 bg-[#0c121e]/40' 
                              : 'border-slate-800 hover:border-slate-700 bg-[#0c0e18]'
                        }`}
                        onClick={() => backInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragEnter={() => setIsBackDragging(true)}
                        onDragLeave={() => setIsBackDragging(false)}
                        onDrop={handleBackDrop}
                      >
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">
                          {lang === 'bn' ? 'পেছনের অংশ আপলোড' : 'Back Side Image'}
                        </span>
                        {kycForm.backImage ? (
                          <div className="relative w-full h-[65px] rounded-lg overflow-hidden flex items-center justify-center bg-slate-900 group">
                            <img 
                              src={kycForm.backImage} 
                              alt="ID Back" 
                              className="object-cover w-full h-full" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                              <CheckCircle2 className="text-emerald-500" size={14} />
                              <span className="text-[7px] text-white font-bold uppercase">
                                {lang === 'bn' ? 'পরিবর্তন করুন' : 'Change Image'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="text-slate-400 text-[10px] font-bold">+ {lang === 'bn' ? 'ফাইল নির্বাচন' : 'Choose File'}</div>
                            <span className="text-[7px] text-slate-600 uppercase font-mono">JPG, PNG (MAX 5MB)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky bottom footer */}
                <div className="p-4 bg-[#0a0d15] border-t border-slate-800/80 shrink-0 flex gap-3 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsKycModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs uppercase cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isKycSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-110 disabled:bg-blue-800 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-500/20"
                  >
                    {isKycSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>{lang === 'bn' ? 'সাবমিট করা হচ্ছে...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'bn' ? 'ভেরিফিকেশনের জন্য সাবমিট করুন' : 'Submit for Verification'}</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Interactive ROI Calculator Box */}
      <div id="roi-calculator-box" className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 bg-[#090c13] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left side input panel */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1">
                <Calculator size={13} />
                {t.calculatorTitle}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                {t.calculatorSubtitle}
              </h2>
            </div>

            {/* Plan Picker Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INVESTMENT_PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setCalcPlan(plan.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer active:scale-95 ${
                    calcPlan === plan.id 
                      ? 'bg-slate-900 border-amber-500/80 text-white shadow-md' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider opacity-60 font-mono">
                    {plan.dailyRoi}% ROI
                  </p>
                  <h4 className="text-xs sm:text-sm font-black truncate">
                    {getPlanName(plan, lang)}
                  </h4>
                </button>
              ))}
            </div>

            {/* Amount Input Slider & Form */}
            <div className="space-y-2.5 p-4 bg-slate-950/60 rounded-xl border border-slate-850">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider select-none">
                  {t.investmentAmount}
                </label>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold font-mono">
                    {curr.symbol}
                  </span>
                  <input 
                    type="number"
                    value={calcAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCalcAmount(val);
                    }}
                    className="bg-transparent border-0 outline-none w-20 sm:w-28 text-white font-black font-mono text-sm sm:text-base text-right"
                  />
                </div>
              </div>

              <input 
                type="range"
                min={Math.round(selectedCalcPlan.minAmount * curr.rate)}
                max={Math.round(selectedCalcPlan.maxAmount * curr.rate)}
                step={currency === 'USD' ? 10 : 100}
                value={calcAmount}
                onChange={(e) => setCalcAmount(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold select-none">
                <span>MIN: {curr.symbol}{Math.round(selectedCalcPlan.minAmount * curr.rate).toLocaleString()}</span>
                <span>MAX: {curr.symbol}{Math.round(selectedCalcPlan.maxAmount * curr.rate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right side calculation overview */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-600/10 to-indigo-600/10 border border-slate-800 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">{t.dailyRate}</span>
                <h4 className="text-sm font-black text-white">{getPlanName(selectedCalcPlan, lang)}</h4>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">+{selectedCalcPlan.dailyRoi}%</span>
                <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">/ {lang === 'ar' ? 'يومياً' : lang === 'bn' ? 'প্রতিদিন' : 'day'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1.5">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.dailyProfit}</span>
                <p className="text-sm sm:text-base font-black text-emerald-400 font-mono">+{curr.symbol}{dailyProfit.toFixed(2)}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.weeklyProfit}</span>
                <p className="text-sm sm:text-base font-black text-emerald-400 font-mono">+{curr.symbol}{weeklyProfit.toFixed(2)}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.monthlyProfit}</span>
                <p className="text-sm sm:text-base font-black text-emerald-400 font-mono">+{curr.symbol}{monthlyProfit.toFixed(2)}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.totalPeriodProfit}</span>
                <p className="text-sm sm:text-base font-black text-amber-400 font-mono">+{curr.symbol}{totalPeriodProfit.toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.maturityTotal}</p>
                <h3 className="text-lg sm:text-xl font-black text-white font-mono">{curr.symbol}{grandTotalPayout.toFixed(2)}</h3>
              </div>
              <button 
                onClick={() => handleInvestPortfolio(selectedCalcPlan.id, calcAmount / curr.rate)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                {t.investNow}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Display Cards of Official Investment Options */}
      <div className="space-y-4 text-left">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="text-amber-400 animate-pulse" size={16} />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
            {lang === 'bn' ? 'সুপারচার্জড ভিআইপি ইনভেস্টমেন্ট নোডস' : 'SUPERCHARGED VIP INVESTMENT NODES'}
          </h2>
        </div>

        {/* Global Embedded Styles for Futuristic Theme Animations */}
        <style>{`
          @keyframes cyber-scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes cyber-grid {
            0% { background-position: 0 0; }
            100% { background-position: 20px 20px; }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .cyber-card {
            background-image: 
              radial-gradient(at 0% 0%, rgba(255, 255, 255, 0.03) 0, transparent 50%),
              radial-gradient(at 50% 0%, rgba(255, 255, 255, 0.02) 0, transparent 50%),
              linear-gradient(to bottom, #0d101e 0%, #060812 100%);
            background-size: 100% 100%;
            position: relative;
          }
          .cyber-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
            opacity: 0.15;
            z-index: 1;
          }
          .cyber-card:hover::before {
            animation: cyber-grid 4s linear infinite;
            opacity: 0.25;
          }
          .cyber-glow-amber {
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.03), inset 0 0 12px rgba(245, 158, 11, 0.05);
          }
          .cyber-glow-amber:hover {
            box-shadow: 0 0 40px rgba(245, 158, 11, 0.18), inset 0 0 16px rgba(245, 158, 11, 0.08);
          }
          .cyber-glow-blue {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.03), inset 0 0 12px rgba(59, 130, 246, 0.05);
          }
          .cyber-glow-blue:hover {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.18), inset 0 0 16px rgba(59, 130, 246, 0.08);
          }
          .cyber-glow-purple {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.03), inset 0 0 12px rgba(168, 85, 247, 0.05);
          }
          .cyber-glow-purple:hover {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.18), inset 0 0 16px rgba(168, 85, 247, 0.08);
          }
          .cyber-glow-slate {
            box-shadow: 0 0 30px rgba(148, 163, 184, 0.03), inset 0 0 12px rgba(148, 163, 184, 0.05);
          }
          .cyber-glow-slate:hover {
            box-shadow: 0 0 40px rgba(148, 163, 184, 0.18), inset 0 0 16px rgba(148, 163, 184, 0.08);
          }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {INVESTMENT_PLANS.map((plan) => {
            const IconComponent = plan.icon;
            const min = Math.round(plan.minAmount * curr.rate);
            const max = Math.round(plan.maxAmount * curr.rate);

            // Determine custom neon color themes for premium cyber layout
            let neonColor = "border-slate-800 text-slate-400 group-hover:border-slate-600";
            let lineGlow = "bg-slate-500/20";
            let customGlowClass = "cyber-glow-slate";
            let iconBoxBg = "bg-slate-950 border-slate-800 text-slate-300 group-hover:text-white";
            let graphColor = "#64748b";

            if (plan.id === 'standard') {
              neonColor = "border-amber-500/20 text-amber-500 group-hover:border-amber-500/50";
              lineGlow = "bg-amber-500/20";
              customGlowClass = "cyber-glow-amber";
              iconBoxBg = "bg-slate-950 border-amber-950 text-amber-400 group-hover:text-amber-300";
              graphColor = "#f59e0b";
            } else if (plan.id === 'premium') {
              neonColor = "border-blue-500/20 text-blue-500 group-hover:border-blue-500/50";
              lineGlow = "bg-blue-500/20";
              customGlowClass = "cyber-glow-blue";
              iconBoxBg = "bg-slate-950 border-blue-950 text-blue-400 group-hover:text-blue-300";
              graphColor = "#3b82f6";
            } else if (plan.id === 'ultimate') {
              neonColor = "border-purple-500/20 text-purple-500 group-hover:border-purple-500/50";
              lineGlow = "bg-purple-500/20";
              customGlowClass = "cyber-glow-purple";
              iconBoxBg = "bg-slate-950 border-purple-950 text-purple-400 group-hover:text-purple-300";
              graphColor = "#a855f7";
            }

            return (
              <div
                key={plan.id}
                className={`cyber-card relative overflow-hidden rounded-3xl border ${neonColor} p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between gap-4.5 group text-left ${customGlowClass}`}
              >
                {/* Neon Top Bar Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${lineGlow} opacity-60 group-hover:opacity-100 transition-opacity`} />

                {/* Cyber Scanner Animated Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent -translate-y-full group-hover:animate-[cyber-scan_2s_linear_infinite] pointer-events-none z-10" />

                <div className="space-y-4 z-10">
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-2xl border ${iconBoxBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                      <IconComponent size={18} className="animate-pulse" />
                    </div>
                    <span className={`px-2.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider rounded-lg border ${plan.badgeColor} shadow-inner`}>
                      {getPlanTag(plan, lang)}
                    </span>
                  </div>

                  {/* Name and Duration */}
                  <div className="space-y-1">
                    <h3 className="font-black text-base sm:text-lg text-white tracking-wide uppercase group-hover:text-white transition-colors flex items-center gap-1">
                      <span>{getPlanName(plan, lang)}</span>
                    </h3>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-600" />
                      <span>{t.durationLabel}: {plan.periodDays} {t.daysLabel}</span>
                    </p>
                  </div>

                  {/* High Tech Price and ROI Box */}
                  <div className="py-3 px-3.5 bg-slate-950/70 border border-slate-900/80 rounded-2xl space-y-1.5 relative overflow-hidden">
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-ping" />
                    
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block">AUTOMATED ALGORITHMIC YIELD</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                        {plan.dailyRoi}%
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">/ {lang === 'ar' ? 'يومي' : lang === 'bn' ? 'প্রতিদিন' : 'Daily'}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-900/60 font-bold">
                      <span>MIN: {curr.symbol}{min.toLocaleString()}</span>
                      <span>MAX: {curr.symbol}{max.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Animated Simulated Graph Line SVG to make it extremely alive and distinctive! */}
                  <div className="h-10 w-full flex items-end justify-center pt-2 select-none relative opacity-70 group-hover:opacity-100 transition-opacity">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`gradient-${plan.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={graphColor} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={graphColor} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={
                          plan.id === 'starter' 
                            ? "M 0 25 Q 25 22 50 18 T 100 10" 
                            : plan.id === 'standard' 
                            ? "M 0 26 Q 25 20 50 12 T 100 5" 
                            : plan.id === 'premium'
                            ? "M 0 28 T 25 18 T 50 10 T 75 8 T 100 3"
                            : "M 0 29 T 20 22 T 40 12 T 60 8 T 80 4 T 100 2"
                        }
                        fill="none"
                        stroke={graphColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <path
                        d={
                          plan.id === 'starter' 
                            ? "M 0 25 Q 25 22 50 18 T 100 10 L 100 30 L 0 30 Z" 
                            : plan.id === 'standard' 
                            ? "M 0 26 Q 25 20 50 12 T 100 5 L 100 30 L 0 30 Z" 
                            : plan.id === 'premium'
                            ? "M 0 28 T 25 18 T 50 10 T 75 8 T 100 3 L 100 30 L 0 30 Z"
                            : "M 0 29 T 20 22 T 40 12 T 60 8 T 80 4 T 100 2 L 100 30 L 0 30 Z"
                        }
                        fill={`url(#gradient-${plan.id})`}
                        className="transition-all duration-500"
                      />
                      {/* Pulse point at end */}
                      <circle cx="100" cy={plan.id === 'starter' ? "10" : plan.id === 'standard' ? "5" : plan.id === 'premium' ? "3" : "2"} r="3" fill={graphColor} />
                    </svg>
                  </div>

                  {/* Bullet checkmarks list with custom styling */}
                  <ul className="space-y-1.5 pt-1">
                    {getPlanFeatures(plan, lang).map((feat, i) => (
                      <li key={i} className="flex gap-2 items-start text-[10.5px] text-slate-300 leading-relaxed font-semibold select-none">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setCalcPlan(plan.id);
                    setCalcAmount(min);
                    // scroll beautifully to ROI calc
                    const element = document.getElementById('roi-calculator-box');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }
                  }}
                  className="w-full mt-2.5 py-2.5 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center group z-10 active:scale-95 shadow-lg flex items-center justify-center gap-1.5"
                >
                  <span className="group-hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
                    {t.selectPlan}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active simulated portfolios table list */}
      <div className="p-4 sm:p-5 bg-slate-950/60 border border-slate-900 rounded-2xl sm:rounded-3xl space-y-3.5 text-left">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={15} />
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-white">
              {t.activePortfolios}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            {t.payoutTime}
          </span>
        </div>

        {simInvestments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2 select-none">
            <HelpCircle size={32} className="mx-auto text-slate-600 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider">{t.noInvestments}</p>
            <p className="text-[10px] text-slate-600 max-w-md mx-auto">
              {lang === 'bn' 
                ? 'উপরের যেকোনো প্ল্যান নির্বাচন করে "বিনিয়োগ সক্রিয় করুন" এ ক্লিক করুন এবং আপনার মুনাফার লাইভ বৃদ্ধির ম্যাজিক দেখুন!' 
                : 'Activate any plan using the quick links above to start watching automated live earnings ticking!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-2">TIME</th>
                  <th className="py-2.5 px-2">PLAN NAME</th>
                  <th className="py-2.5 px-2 text-right">PRINCIPAL</th>
                  <th className="py-2.5 px-2 text-right text-emerald-400">ACCRUED EARNING</th>
                  <th className="py-2.5 px-2 text-right">EST. PAYOUT</th>
                  <th className="py-2.5 px-2 text-center">TERM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-mono text-[11px]">
                {simInvestments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-2.5 px-2 text-slate-500 font-bold">{inv.createdAt}</td>
                    <td className="py-2.5 px-2 text-white font-sans font-black">{inv.planName}</td>
                    <td className="py-2.5 px-2 text-right text-slate-300 font-bold">
                      {curr.symbol}{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-400 font-black">
                      +{curr.symbol}{inv.earned.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-amber-400 font-black">
                      {curr.symbol}{(inv.amount + inv.earned).toFixed(4)}
                    </td>
                    <td className="py-2.5 px-2 text-center font-sans">
                      <span className="px-1.5 py-0.5 bg-slate-900 rounded text-slate-400 font-semibold text-[9px] uppercase tracking-wider">
                        {inv.periodDays} {t.daysLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Deposits / Active Support & Live Payouts Banner (Static Guide) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Manual Deposits Instructions Guide */}
        <div className="lg:col-span-8 p-5 sm:p-6 bg-slate-900/30 border border-slate-800 rounded-2xl sm:rounded-3xl space-y-4 shadow-xl text-left flex flex-col justify-between">
          <div className="space-y-3">
            <div className="space-y-0.5">
              <h4 className="font-black text-white flex items-center gap-2 text-sm sm:text-base select-none uppercase tracking-wide">
                <Wallet size={16} className="text-amber-500 animate-pulse" />
                {t.activationGuide}
              </h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider select-none font-bold">100% Secure manual activation via direct verified advisors</p>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-300 space-y-2.5 leading-relaxed font-medium select-none">
              {[
                {
                  en: 'Choose your desired plan from the premium grid list or use the custom Profit ROI Calculator.',
                  bn: 'প্রথমে আপনার বাজেট অনুযায়ী লাভজনক প্ল্যানটি বেছে নিন বা আমাদের প্রফিট ক্যালকুলেটর ব্যবহার করুন।',
                  hi: 'प्रीमियम ग्रिड सूची से अपनी इच्छित योजना चुनें या कस्टम लाभ आरओआई कैलकुलेटर का उपयोग करें।',
                  ar: 'اختر الخطة المطلوبة من قائمة الشبكة المتميزة أو استخدم حاسبة عائد الاستثمار المخصصة.'
                },
                {
                  en: 'Contact our certified VIP Active Agents directly on Telegram or Facebook Messenger below.',
                  bn: 'নিচে দেওয়া আমাদের ভেরিফাইড ভিআইপি অ্যাক্টিভ কাস্টমার সাপোর্ট এজেন্টদের সাথে সরাসরি টেলিগ্রাম বা মেসেঞ্জারে যোগাযোগ করুন।',
                  hi: 'नीचे दिए गए टेलीग्राम या फेसबुक मैसेंजर पर सीधे हमारे प्रमाणित वीआईपी सक्रिय एजेंटों से संपर्क करें।',
                  ar: 'اتصل بوكلاء دعم VIP المعتمدين لدينا مباشرة على تيليجرام أو فيسبوك ماسنجر أدناه.'
                },
                {
                  en: 'Submit deposit via convenient local networks (bKash CashOut, Nagad/Rocket Merchant, UPI, Crypto USDT).',
                  bn: 'সুবিধাজনক লোকাল পেমেন্ট (বিকাশ, নগদ, রকেট), ইউপিআই অথবা ক্রিপ্টোকারেন্সির (USDT TRC20) মাধ্যমে আপনার ডিপোজিট ফান্ড সাবমিট করুন।',
                  hi: 'सुविधाजनक स्थानीय नेटवर्क (bKash, Nagad, UPI, Crypto USDT) के माध्यम से जमा राशि जमा करें।',
                  ar: 'أرسل الإيداع عبر الشبكات المحلية المناسبة (bKash، Nagad، UPI، Crypto USDT).'
                },
                {
                  en: 'Provide your details to the agent. Your official investment portfolio is activated instantly in under 5 minutes.',
                  bn: 'আপনার প্রয়োজনীয় তথ্যাদি প্রদান করুন। এজেন্ট আপনার অফিসিয়াল ইনভেস্টমেন্ট পোর্টফোলিও মাত্র ৫ মিনিটে সক্রিয় করে দেবে।',
                  hi: 'एजेंट को अपना विवरण प्रदान करें। आपका आधिकारिक निवेश पोर्टफोलियो 5 मिनट से कम समय में तुरंत सक्रिय हो जाता है।',
                  ar: 'قدم تفاصيلك للوكيل. يتم تفعيل محفظتك الاستثمارية الرسمية على الفور في أقل من 5 دقائق.'
                }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{idx + 1}</span>
                  <p className="text-slate-300">{step[lang] || step['en']}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification alert warning */}
          <div className="flex gap-2.5 items-start bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 mt-3 text-left">
            <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              {t.warningText}
            </p>
          </div>
        </div>

        {/* VIP Direct Agent Contact Actions */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3.5">
          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex-1 flex flex-col justify-center items-center text-center space-y-3">
            <span className="w-10 h-10 rounded-full bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center animate-bounce">
              <Send size={18} fill="currentColor" />
            </span>
            <div>
              <h5 className="font-black text-xs text-white uppercase tracking-wider">{t.advisorTelegram}</h5>
              <p className="text-[10px] text-slate-400 font-bold">{lang === 'bn' ? '৫ মিনিটে ফান্ড লোড' : 'Fund activation in 5 mins'}</p>
            </div>
            <a 
              href="https://t.me/stake020"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-[200px] py-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow active:scale-95 text-center block"
            >
              @stake020
            </a>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex-1 flex flex-col justify-center items-center text-center space-y-3">
            <span className="w-10 h-10 rounded-full bg-[#006aff]/10 text-[#006aff] flex items-center justify-center animate-bounce">
              <MessageSquare size={18} fill="currentColor" />
            </span>
            <div>
              <h5 className="font-black text-xs text-white uppercase tracking-wider">{t.advisorMessenger}</h5>
              <p className="text-[10px] text-slate-400 font-bold">{lang === 'bn' ? '২৪/৭ লাইভ এসিস্টেন্স' : '24/7 Live Assistance'}</p>
            </div>
            <a 
              href="https://m.me/61592177180590"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-[200px] py-2 bg-[#006aff] hover:bg-[#006aff]/90 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow active:scale-95 text-center block"
            >
              Messenger Page
            </a>
          </div>
        </div>

      </div>

      {/* Live Global Investor Payout Feed */}
      <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
            {t.liveFeedTitle}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {LIVE_FEEDS[lang].map((feed, idx) => (
            <div key={idx} className="p-2.5 bg-slate-900/40 border border-slate-850/60 rounded-xl text-left flex justify-between items-center text-[11px]">
              <div className="space-y-0.5">
                <p className="font-bold text-white leading-tight">{feed.name}</p>
                <p className="text-[9px] text-slate-400 leading-none">{feed.plan}</p>
              </div>
              <div className="text-right">
                <p className={`font-black leading-tight font-mono ${feed.type === 'Deposit' ? 'text-blue-400' : 'text-emerald-400'}`}>
                  {feed.type === 'Deposit' ? 'Deposit' : 'Payout'}: {feed.amount}
                </p>
                <p className="text-[8px] text-slate-500 leading-none font-mono font-bold uppercase">{feed.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notice */}
      <div className="pt-6 border-t border-slate-900 text-center select-none">
        <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase">
          {t.allRightsReserved}
        </p>
      </div>

    </div>
  );
}
