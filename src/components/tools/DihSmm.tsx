import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, PlusCircle, List, ArrowDownToLine, 
  CreditCard, Search, Link2, ChevronDown, CheckCircle2, 
  AlertCircle, RefreshCw, X, HelpCircle, Activity, Star,
  TrendingUp, Users, CheckCircle, ExternalLink, Sparkles
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
}

const SERVICES: SMMService[] = [
  {id:1,name:"Instagram Followers - Real & Active",category:"Instagram",price:1.50,min:100,max:100000,desc:"High quality real-looking followers. Guaranteed delivery.",time:"0-12 hours",quality:"Standard"},
  {id:2,name:"Instagram Followers - Premium Quality",category:"Instagram",price:3.20,min:100,max:50000,desc:"Premium quality followers with profile pictures.",time:"0-6 hours",quality:"Premium"},
  {id:3,name:"Instagram Likes - Fast Delivery",category:"Instagram",price:0.80,min:50,max:500000,desc:"Instant likes from active accounts.",time:"0-1 hours",quality:"Standard"},
  {id:4,name:"Instagram Views - Reels & Videos",category:"Instagram",price:0.20,min:500,max:10000000,desc:"Fast views for Reels and videos.",time:"0-30 minutes",quality:"Standard"},
  {id:5,name:"Instagram Comments - Custom",category:"Instagram",price:12.00,min:5,max:500,desc:"Real custom comments on your posts.",time:"1-6 hours",quality:"Premium"},
  {id:6,name:"Instagram Story Views",category:"Instagram",price:0.15,min:100,max:5000000,desc:"Fast story views delivery.",time:"0-15 minutes",quality:"Standard"},
  {id:7,name:"Facebook Page Likes",category:"Facebook",price:1.20,min:100,max:500000,desc:"Real-looking page likes with stable drop rate.",time:"0-24 hours",quality:"Standard"},
  {id:8,name:"Facebook Post Likes",category:"Facebook",price:0.60,min:50,max:200000,desc:"Fast likes on your Facebook posts.",time:"0-6 hours",quality:"Standard"},
  {id:9,name:"Facebook Video Views",category:"Facebook",price:0.10,min:1000,max:50000000,desc:"Boost your video view count instantly.",time:"0-30 minutes",quality:"Standard"},
  {id:10,name:"Facebook Followers - Premium",category:"Facebook",price:2.50,min:100,max:100000,desc:"Premium quality Facebook followers.",time:"0-12 hours",quality:"Premium"},
  {id:11,name:"YouTube Views - High Retention",category:"YouTube",price:1.80,min:500,max:10000000,desc:"High retention views that boost your rankings.",time:"0-24 hours",quality:"Premium"},
  {id:12,name:"YouTube Subscribers - Real",category:"YouTube",price:8.50,min:50,max:50000,desc:"Real subscribers that stick around.",time:"1-3 days",quality:"Premium"},
  {id:13,name:"YouTube Likes",category:"YouTube",price:1.20,min:100,max:500000,desc:"Fast YouTube likes delivery.",time:"0-6 hours",quality:"Standard"},
  {id:14,name:"YouTube Watch Hours",category:"YouTube",price:18.00,min:100,max:10000,desc:"Real watch hours for monetization.",time:"7-30 days",quality:"VIP"},
  {id:15,name:"TikTok Followers",category:"TikTok",price:2.00,min:100,max:500000,desc:"Fast TikTok followers from real accounts.",time:"0-12 hours",quality:"Standard"},
  {id:16,name:"TikTok Likes",category:"TikTok",price:0.50,min:100,max:1000000,desc:"Boost your TikTok post engagement.",time:"0-2 hours",quality:"Standard"},
  {id:17,name:"TikTok Views",category:"TikTok",price:0.12,min:1000,max:100000000,desc:"Viral-boost your TikTok videos with views.",time:"0-30 minutes",quality:"Standard"},
  {id:18,name:"TikTok Comments - Custom",category:"TikTok",price:15.00,min:5,max:200,desc:"Custom comments on your TikTok videos.",time:"1-12 hours",quality:"Premium"},
  {id:19,name:"Twitter/X Followers",category:"Twitter/X",price:2.80,min:100,max:500000,desc:"Real-looking X followers.",time:"0-24 hours",quality:"Standard"},
  {id:20,name:"Twitter/X Likes",category:"Twitter/X",price:0.70,min:50,max:500000,desc:"Fast post likes on X/Twitter.",time:"0-6 hours",quality:"Standard"},
  {id:21,name:"Twitter/X Retweets",category:"Twitter/X",price:1.50,min:50,max:100000,desc:"Boost post reach with retweets.",time:"0-12 hours",quality:"Standard"},
  {id:22,name:"Telegram Channel Members",category:"Telegram",price:3.50,min:100,max:1000000,desc:"Add real-looking members to your channel.",time:"0-24 hours",quality:"Standard"},
  {id:23,name:"Telegram Post Views",category:"Telegram",price:0.08,min:500,max:100000000,desc:"Boost post views on Telegram channels.",time:"0-15 minutes",quality:"Standard"},
  {id:24,name:"Telegram Group Members",category:"Telegram",price:4.00,min:100,max:500000,desc:"Add members to your Telegram group.",time:"0-24 hours",quality:"Premium"},
];

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
  'Others'
];

interface DihSmmProps {
  currentUser?: any;
  onAuthClick?: () => void;
}

export default function DihSmm({ currentUser, onAuthClick }: DihSmmProps) {
  const { settings } = useAppSettings();

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
  const userEmail = userToUse?.email || 'guest@dihsmm.com';
  const userName = userToUse?.name || 'Guest User';
  const isLoggedIn = !!userToUse;

  // Scoped localStorage keys
  const balanceKey = isLoggedIn ? `dih_smm_balance_${userEmail}` : `dih_smm_balance_guest`;
  const ordersKey = isLoggedIn ? `dih_smm_orders_v2_${userEmail}` : `dih_smm_orders_v2_guest`;

  // Dynamically managed services list
  const [servicesList, setServicesList] = useState<SMMService[]>([]);

  // Dynamically map SERVICES and scale by multiplier
  const activeServices = servicesList.map(s => ({
    ...s,
    price: s.price * (settings.smmPriceMultiplier || 1.0)
  }));
  
  // States
  const [balance, setBalance] = useState<number>(0.00);
  const [activePage, setActivePage] = useState<'dashboard' | 'new-order' | 'services' | 'orders' | 'deposit'>('dashboard');
  const [activeCat, setActiveCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // New Order Form States
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [ddSearchQuery, setDdSearchQuery] = useState<string>('');
  const [orderLink, setOrderLink] = useState<string>('');
  const [orderQty, setOrderQty] = useState<string>('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Deposit Form States
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card' | 'crypto' | 'upay' | 'binance' | 'usdt'>('bkash');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [senderDetails, setSenderDetails] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [depError, setDepError] = useState<string | null>(null);
  const [depSuccess, setDepSuccess] = useState<string | null>(null);

  // Dynamic Gateway configuration sync from admin settings
  const [manualGateways, setManualGateways] = useState<any[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('dih_smm_manual_gateways_v2');
    if (cached) {
      try {
        setManualGateways(JSON.parse(cached));
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
      setManualGateways(defaultGateways);
    }
  }, [activePage]);

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
        const initialBalance = 0.00; // Always start with 0.00 balance unless a deposit is verified/approved
        setBalance(initialBalance);
        localStorage.setItem(balanceKey, initialBalance.toFixed(2));
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
          setServicesList(prev => JSON.stringify(prev) !== cachedServices ? parsed : prev);
        } catch (err) {
          console.error(err);
        }
      } else {
        localStorage.setItem('dih_smm_services_v2', defaultServices);
        setServicesList(SERVICES);
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
    const interval = setInterval(fetchBalanceObj, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn, userEmail, balanceKey]);

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

  const saveOrders = (updatedOrders: SMMOrder[]) => {
    setOrders(updatedOrders);
    localStorage.setItem(ordersKey, JSON.stringify(updatedOrders));
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
      case 'VIP': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const navigate = (page: 'dashboard' | 'new-order' | 'services' | 'orders' | 'deposit', serviceId?: number) => {
    setActivePage(page);
    if (page === 'new-order' && serviceId) {
      setSelectedServiceId(serviceId);
      const s = activeServices.find(x => x.id === serviceId);
      if (s) {
        setOrderQty(s.min.toString());
      }
    }
    setOrderError(null);
    setOrderSuccess(null);
    setDepError(null);
    setDepSuccess(null);
    setDropdownOpen(false);
  };

  // Calculations
  const selectedService = activeServices.find(s => s.id === selectedServiceId);
  const currentQuantity = parseInt(orderQty) || 0;
  const currentTotal = selectedService ? (currentQuantity / 1000) * selectedService.price : 0;

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
      setOrderError('Insufficient balance. Please add funds.');
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
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveOrders([newOrder, ...orders]);
    setNextId(nextOrderId + 1);

    setOrderLink('');
    setOrderQty('');
    setOrderSuccess(`Order #${newOrder.id} placed successfully!`);
    
    setTimeout(() => setOrderSuccess(null), 4000);
  };

  const handleDeposit = () => {
    setDepError(null);
    setDepSuccess(null);

    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setDepError('Please enter a valid amount.');
      return;
    }

    if (!senderDetails.trim()) {
      setDepError('Please enter Sender account details (e.g. your sending mobile number).');
      return;
    }

    if (!transactionId.trim()) {
      setDepError('Please enter the manual Transaction ID (TxID) or Referer Hash.');
      return;
    }

    const methodStr = selectedMethod || 'bkash';

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

    const newDeposit = {
      id: nextDepId,
      userId: userToUse?.id || 999,
      userEmail: userEmail,
      userName: userName,
      amount: amt,
      method: methodStr,
      sender: senderDetails.trim(),
      txid: transactionId.trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };

    const updatedDeps = [...currentDeps, newDeposit];
    localStorage.setItem('dih_smm_deposits_v2', JSON.stringify(updatedDeps));

    setDepositAmount('');
    setSenderDetails('');
    setTransactionId('');
    setDepSuccess(`Manual Deposit of $${fmtAmt(amt)} via ${methodStr.toUpperCase()} submitted! Ref ID: ${newDeposit.txid}. Open SMM Admin Panel to verify and approve.`);
    setTimeout(() => setDepSuccess(null), 8000);
  };

  // Filtering
  const filteredServices = activeServices.filter(s => {
    const activeCatLower = activeCat.toLowerCase();
    const svcCatLower = s.category.toLowerCase();
    
    let matchesCat = false;
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

    const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'all') return true;
    return o.status === activeFilter;
  });

  const completedCount = orders.filter(o => o.status === 'completed').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);

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
      case 'crypto': return "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-500/20";
      default: return "";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0f14] text-[#e2e8f0] font-sans antialiased select-none">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-60 min-w-60 bg-[#0a0c10] border-r border-[#1e2336] relative z-20">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[#1e2336] font-bold text-white text-lg tracking-tight">
          <Activity className="text-blue-500" size={20} />
          DIH SMM
        </div>

        <div className="p-4 border-b border-[#1e2336] bg-blue-500/[0.03] space-y-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Current Balance</div>
          <div className="text-2xl font-mono font-bold text-white">
            <span className="text-blue-500">$</span>{fmtAmt(balance)}
          </div>
          <button 
            onClick={() => navigate('deposit')} 
            className="text-xs text-blue-500 font-medium hover:underline focus:outline-none mt-1"
          >
            + Add Funds
          </button>
        </div>

        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => navigate('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative text-left outline-none",
              activePage === 'dashboard'
                ? "text-white bg-blue-500/10 border border-blue-500/15 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-500 before:rounded-r"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <LayoutDashboard size={18} className={activePage === 'dashboard' ? "text-blue-500" : "text-slate-400"} />
            Dashboard
          </button>

          <button
            onClick={() => navigate('new-order')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative text-left outline-none",
              activePage === 'new-order'
                ? "text-white bg-blue-500/10 border border-blue-500/15 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-500 before:rounded-r"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <PlusCircle size={18} className={activePage === 'new-order' ? "text-blue-500" : "text-slate-400"} />
            New Order
          </button>

          <button
            onClick={() => navigate('services')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative text-left outline-none",
              activePage === 'services'
                ? "text-white bg-blue-500/10 border border-blue-500/15 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-500 before:rounded-r"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <List size={18} className={activePage === 'services' ? "text-blue-500" : "text-slate-400"} />
            Services
          </button>

          <button
            onClick={() => navigate('orders')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative text-left outline-none",
              activePage === 'orders'
                ? "text-white bg-blue-500/10 border border-blue-500/15 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-500 before:rounded-r"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <ArrowDownToLine size={18} className={activePage === 'orders' ? "text-blue-500" : "text-slate-400"} />
            My Orders
          </button>

          <button
            onClick={() => navigate('deposit')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative text-left outline-none",
              activePage === 'deposit'
                ? "text-white bg-blue-500/10 border border-blue-500/15 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-500 before:rounded-r"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <CreditCard size={18} className={activePage === 'deposit' ? "text-blue-500" : "text-slate-400"} />
            Add Funds
          </button>
        </nav>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-16 border-b border-[#1e2336] flex items-center justify-between px-6 bg-[#0d0f14]/80 backdrop-blur-md sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-white capitalize md:block hidden">
              {activePage === 'new-order' ? 'Place New Order' : activePage === 'orders' ? 'My Orders' : activePage === 'deposit' ? 'Add Funds' : activePage}
            </h1>
            
            {/* Mobile Header indicator */}
            <div className="flex md:hidden items-center gap-2 font-bold text-white text-base">
              <Activity className="text-blue-500" size={18} />
              DIH SMM
              <span className="text-slate-500 ml-1 font-medium text-xs">|</span>
              <span className="text-[#3b82f6] text-xs font-mono">${fmtAmt(balance)}</span>
            </div>
          </div>

          {/* Desktop User Status Gate */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-[#141720] border border-[#1e2336] px-3.5 py-1.5 rounded-xl text-xs">
                <div className="w-5 h-5 rounded bg-blue-500 text-white font-bold flex items-center justify-center uppercase truncate">
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
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg transition shadow-md shadow-blue-500/10 active:scale-95 animate-pulse"
              >
                Log In / Register
              </button>
            )}
          </div>

          {/* Mobile Bottom-Like Nav bar inside header */}
          <div className="flex md:hidden items-center gap-1.5">
            <button 
              onClick={() => navigate('dashboard')}
              className={cn("p-1.5 rounded-md", activePage === 'dashboard' ? "bg-blue-500/15 text-blue-500" : "text-slate-400")}
              title="Dashboard"
            >
              <LayoutDashboard size={16} />
            </button>
            <button 
              onClick={() => navigate('new-order')}
              className={cn("p-1.5 rounded-md", activePage === 'new-order' ? "bg-blue-500/15 text-blue-500" : "text-slate-400")}
              title="New Order"
            >
              <PlusCircle size={16} />
            </button>
            <button 
              onClick={() => navigate('services')}
              className={cn("p-1.5 rounded-md", activePage === 'services' ? "bg-blue-500/15 text-blue-500" : "text-slate-400")}
              title="Services"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => navigate('orders')}
              className={cn("p-1.5 rounded-md", activePage === 'orders' ? "bg-blue-500/15 text-blue-500" : "text-slate-400")}
              title="My Orders"
            >
              <ArrowDownToLine size={16} />
            </button>
            <button 
              onClick={() => navigate('deposit')}
              className={cn("p-1.5 rounded-md", activePage === 'deposit' ? "bg-blue-500/15 text-blue-500" : "text-slate-400")}
              title="Add Funds"
            >
              <CreditCard size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">

            {!isLoggedIn && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 select-none animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Guest Mode (Actions Not Saved)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Please log in to your account. SMM user profiles get $0.00 default balance until approved deposits are made!</p>
                  </div>
                </div>
                <button
                  onClick={onAuthClick}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition shrink-0 select-none shadow active:scale-95"
                >
                  🔑 Log In / Register
                </button>
              </div>
            )}

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
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold tracking-wide shadow-md shadow-blue-500/10 duration-150 self-start sm:self-auto"
                  >
                    Place New Order
                  </button>
                </div>

                {settings.smmSystemNotice && (
                  <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 shrink-0">
                      <Sparkles size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 font-mono">Notice from Admin</h4>
                      <p className="text-[12px] text-slate-300 leading-relaxed mt-1 font-medium">{settings.smmSystemNotice}</p>
                    </div>
                  </div>
                )}

                {/* STATS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#141720] border border-[#1e2336] rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">Total Spent</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <CreditCard size={15} className="text-blue-500" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">${fmtAmt(totalSpent)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Lifetime spending</div>
                  </div>

                  <div className="bg-[#141720] border border-[#1e2336] rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">Total Orders</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Activity size={15} className="text-blue-500" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{orders.length}</div>
                    <div className="text-[11px] text-slate-500 mt-1">0 orders today</div>
                  </div>

                  <div className="bg-[#141720] border border-[#1e2336] rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">Completed</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <CheckCircle2 size={15} className="text-blue-500" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{completedCount}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Successfully delivered</div>
                  </div>

                  <div className="bg-[#141720] border border-[#1e2336] rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-slate-400 font-medium">In Progress</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <RefreshCw size={14} className="text-blue-500 animate-spin-reverse" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{pendingCount + processingCount}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Pending &amp; processing</div>
                  </div>
                </div>

                {/* RECENT ORDERS */}
                <div className="bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-[#1e2336] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Your latest activity.</p>
                    </div>
                    <button onClick={() => navigate('orders')} className="px-3 py-1.5 border border-[#1e2336] hover:border-blue-500/20 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all">
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
                        {orders.slice(0, 5).map(o => (
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
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        "px-4.5 py-2.5 rounded-full text-xs font-semibold border tracking-wider transition-all duration-150 select-none",
                        c === activeCategory()
                          ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10 font-bold"
                          : "bg-[#141720] text-slate-400 border-[#1e2336] hover:text-white hover:border-[#3b82f6]/40"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredServices.map(s => (
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
                              <span className="bg-[#1c2135]/50 px-1.5 py-0.5 rounded text-[9px] text-[#38bdf8] border border-[#38bdf8]/15 font-bold">
                                {s.refill}
                              </span>
                            )}
                            <span>{s.time}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#1e2336] shrink-0">
                          <div className="text-lg font-mono font-bold text-blue-500">
                            ${s.price.toFixed(2)} <span className="text-xs font-sans text-slate-400 font-normal">/ 1000</span>
                          </div>
                          <button 
                            onClick={() => goOrder(s.id)}
                            className="bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white hover:shadow-md hover:shadow-blue-500/10 px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                          >
                            Order &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NEW ORDER PAGE */}
            {activePage === 'new-order' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-[#141720] border border-[#1e2336] rounded-xl overflow-hidden shadow-xl">
                  <div className="px-5 py-4 border-b border-[#1e2336]">
                    <h3 className="text-sm font-semibold text-white">Place New Order</h3>
                  </div>
                  <div className="p-5.5 space-y-5">
                    
                    {/* CUSTOM DROPDOWN */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Select Service</label>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => toggleDropdown()}
                          className={cn(
                            "w-full px-4 py-3 bg-[#141720] border text-left flex justify-between items-center text-[13px] rounded-lg focus:border-blue-500 transition-all outline-none",
                            selectedService
                              ? "border-[#1e2336] text-white font-semibold"
                              : "border-[#1e2336] text-slate-400"
                          )}
                        >
                          <span className="truncate">{selectedService ? selectedService.name : "Choose a service..."}</span>
                          <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-150", dropdownOpen ? "rotate-180" : "")} />
                        </button>

                        <AnimatePresence>
                          {dropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.12 }}
                              className="absolute top-full left-0 right-0 mt-1 dark:bg-[#1a1f2e] border border-[#1e2336] rounded-lg overflow-hidden shadow-2xl z-50 origin-top"
                            >
                              <div className="p-2 border-b border-[#1e2336]">
                                <input 
                                  type="text"
                                  placeholder="Search services..."
                                  value={ddSearchQuery}
                                  onChange={(e) => setDdSearchQuery(e.target.value)}
                                  className="w-full bg-[#141720] text-xs px-3 py-2 text-white border border-[#1e2336] rounded-md outline-none focus:border-blue-500"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {CATEGORIES.slice(1).map(cat => {
                                  const filtered = activeServices.filter(s => {
                                    const catLower = cat.toLowerCase();
                                    const svcCatLower = s.category.toLowerCase();
                                    
                                    let matchesCat = false;
                                    if (catLower === 'youtube') {
                                      matchesCat = svcCatLower.includes('youtube');
                                    } else if (catLower === 'tiktok') {
                                      matchesCat = svcCatLower.includes('tiktok');
                                    } else if (catLower === 'twitter' || catLower === 'twitter/x') {
                                      matchesCat = svcCatLower.includes('twitter') || svcCatLower.includes('x');
                                    } else if (catLower === 'linkedin') {
                                      matchesCat = svcCatLower.includes('linkedin');
                                    } else {
                                      matchesCat = svcCatLower === catLower;
                                    }
                                    
                                    const matchesQuery = s.name.toLowerCase().includes(ddSearchQuery.toLowerCase());
                                    return matchesCat && matchesQuery;
                                  });
                                  if (filtered.length === 0) return null;
                                  return (
                                    <React.Fragment key={cat}>
                                      <div className="px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#64748b] bg-white/[0.01] sticky top-0">{cat}</div>
                                      {filtered.map(s => (
                                        <div
                                          key={s.id}
                                          onClick={() => {
                                            setSelectedServiceId(s.id);
                                            setOrderQty(s.min.toString());
                                            setDropdownOpen(false);
                                          }}
                                          className={cn(
                                            "px-4 py-2.5 text-xs text-white hover:bg-blue-500/10 cursor-pointer flex justify-between items-center transition-colors border-l-2 border-transparent",
                                            s.id === selectedServiceId ? "bg-blue-500/10 border-blue-500 font-semibold text-blue-400" : ""
                                          )}
                                        >
                                          <span className="truncate pr-4">{s.name}</span>
                                          <span className="font-mono text-blue-500 font-bold shrink-0">${s.price.toFixed(2)}/1k</span>
                                        </div>
                                      ))}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {selectedService && (
                        <div className="bg-blue-500/[0.03] border border-blue-500/10 rounded-lg p-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400">
                          {selectedService.quality && (
                            <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] border font-black uppercase tracking-wider", getQualityBadgeClass(selectedService.quality))}>
                              {selectedService.quality}
                            </span>
                          )}
                          <span>Min: <strong className="text-white font-mono">{fmt(selectedService.min)}</strong></span>
                          <span>Max: <strong className="text-white font-mono">{fmt(selectedService.max)}</strong></span>
                          <span>Delivery: <strong className="text-white">{selectedService.time}</strong></span>
                          <span>Refill: <strong className="text-[#38bdf8]">{selectedService.refill || "No Refill"}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* TARGET URL LINK */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Link</label>
                      <div className="relative">
                        <Link2 size={15} className="absolute left-3 w-4 h-4 text-slate-400 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input 
                          type="url" 
                          placeholder="https://..." 
                          value={orderLink}
                          onChange={(e) => setOrderLink(e.target.value)}
                          className="w-full bg-[#141720] border border-[#1e2336] pl-9.5 pr-4 py-3 text-sm text-white rounded-lg outline-none focus:border-blue-500 placeholder-[#64748b] transition-colors"
                        />
                      </div>
                    </div>

                    {/* QUANTITY */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-0.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                        {selectedService && (
                          <span className="text-[11px] text-slate-500 font-mono font-medium">
                            {fmt(selectedService.min)} – {fmt(selectedService.max)}
                          </span>
                        )}
                      </div>
                      <input 
                        type="number" 
                        placeholder="Enter quantity" 
                        value={orderQty}
                        onChange={(e) => setOrderQty(e.target.value)}
                        className="w-full bg-[#141720] border border-[#1e2336] px-4 py-3 text-sm text-white rounded-lg outline-none focus:border-blue-500 transition-colors font-mono"
                      />
                    </div>

                    {/* ESTIMATE CHARGE & BALLANCE PILL */}
                    <div className="bg-[#3b82f6]/[0.02] border border-blue-500/10 rounded-xl px-5 py-4.5 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-medium">Order Total</div>
                        <div className="text-3xl font-bold font-mono text-white leading-tight mt-0.5">
                          <span className="text-blue-500">$</span>{currentTotal.toFixed(4)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-medium">Your Balance</div>
                        <div className="text-sm font-bold font-mono text-emerald-500 mt-1">
                          ${fmtAmt(balance)}
                        </div>
                      </div>
                    </div>

                    {/* ALERTS */}
                    {orderError && (
                      <div className="flex items-center gap-2.5 px-4 py-3 border border-red-500/20 bg-red-500/[0.04] text-red-400 rounded-lg text-xs leading-relaxed">
                        <AlertCircle size={15} className="shrink-0" />
                        {orderError}
                      </div>
                    )}

                    {orderSuccess && (
                      <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400 rounded-lg text-xs leading-relaxed">
                        <CheckCircle2 size={15} className="shrink-0" />
                        {orderSuccess}
                      </div>
                    )}

                    <button 
                      onClick={() => handlePlaceOrder()}
                      className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide rounded-lg hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-150 active:scale-[0.982]"
                    >
                      Place Order
                    </button>

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
                    <h3 className="text-sm font-semibold text-white">Add Funds</h3>
                  </div>
                  <div className="p-5.5 space-y-5.5">
                    
                    {/* METHODS */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Payment Method</label>
                      {(!manualGateways || manualGateways.length === 0) ? (
                        <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-center text-xs text-red-400 font-medium font-sans">
                          Deposits are currently disabled by the administrator. Please try again later.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-sans">
                          {manualGateways.filter(gate => gate.enabled !== false).map(gate => (
                            <button
                              key={gate.id}
                              type="button"
                              onClick={() => {
                                setSelectedMethod(gate.id);
                                setDepError(null);
                                setDepSuccess(null);
                              }}
                              className={cn(
                                "py-2 px-1 rounded-lg border text-[11px] font-black uppercase text-center transition-all duration-150 scale-100 outline-none select-none",
                                selectedMethod === gate.id
                                  ? "bg-blue-500 text-white border-blue-500 font-extrabold shadow-lg shadow-blue-550/10"
                                  : "border-[#1e2336] bg-white/5 text-slate-400 hover:text-white"
                              )}
                            >
                              {gate.id === 'bkash' ? 'bKash' : gate.id === 'nagad' ? 'Nagad' : gate.id === 'upay' ? 'Upay' : gate.id === 'rocket' ? 'Rocket' : gate.id === 'card' ? 'Card' : gate.id === 'binance' ? 'Binance' : gate.id === 'usdt' ? 'USDT' : gate.title.split(' ')[0]}
                            </button>
                          ))}
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

                          <div className="bg-[#0c0e14] border border-[#1e2336]/60 rounded-lg p-3 flex justify-between items-center font-mono text-xs">
                            <span className="text-slate-400">Account:</span>
                            <span className="text-white font-extrabold select-all flex items-center gap-1.5">
                              {activeGate.numberOrAddress}
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(activeGate.numberOrAddress);
                                  alert('Account details copied to clipboard!');
                                }}
                                className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/5 px-1.5 py-0.5 rounded font-sans cursor-pointer active:scale-95 transition-all"
                              >
                                Copy
                              </button>
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 italic leading-relaxed bg-[#0c0e14]/40 border border-[#1e2336]/30 p-2 rounded">
                            <span className="font-bold text-blue-400 not-italic block mb-0.5 text-[10px] uppercase">Instruction:</span>
                            {activeGate.instructions}
                          </div>
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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Amount (USD)</label>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans pt-1">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Your Sender Account Details</label>
                        <input
                          type="text"
                          placeholder="Sender No. or Name"
                          value={senderDetails}
                          onChange={(e) => setSenderDetails(e.target.value)}
                          className="w-full bg-[#141720] border border-[#1e2336] px-3.5 py-2.5 text-xs text-white rounded-lg outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transaction ID (TxID) / Ref</label>
                        <input
                          type="text"
                          placeholder="TxID or Ref Number"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full bg-[#141720] border border-[#1e2336] px-3.5 py-2.5 text-xs text-white rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
                        />
                      </div>
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
                      onClick={() => handleDeposit()}
                      className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm tracking-wide rounded-lg hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-150 active:scale-[0.982]"
                    >
                      Add Funds
                    </button>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>

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
