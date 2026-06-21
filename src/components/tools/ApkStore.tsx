import React, { useState, useEffect } from 'react';
import { 
  Download, Play, Info, Search, Filter, 
  ExternalLink, ChevronRight, Star, Clock, 
  ShieldCheck, Package, Layout, Users, CreditCard,
  Smartphone, Wallet, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';

interface StoreItem {
  id: string;
  type: 'apk' | 'premium_apk' | 'account';
  title: string;
  description: string;
  tutorial: string;
  apkUrl: string;
  createdAt: string;
  platform?: string;
  price?: string;
  thumbnail?: string;
}

import { useAppSettings } from '@/src/hooks/useAppSettings';

export default function ApkStore() {
  const { settings } = useAppSettings();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'apk' | 'premium_apk' | 'account'>('all');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'checkout' | 'verifying' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'binance' | 'card' | null>(null);
  const [trxId, setTrxId] = useState('');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchStore();
    const savedPurchases = localStorage.getItem('dihhub_purchases');
    if (savedPurchases) setPurchasedItems(JSON.parse(savedPurchases));
    
    const savedDownloads = localStorage.getItem('dihhub_downloads');
    if (savedDownloads) setDownloadedItems(JSON.parse(savedDownloads));
  }, []);

  const handlePurchase = async (itemId: string) => {
    setPaymentStep('verifying');
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trxId, 
          itemId, 
          amount: selectedItem?.price,
          method: selectedMethod 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const newPurchases = [...purchasedItems, itemId];
        setPurchasedItems(newPurchases);
        localStorage.setItem('dihhub_purchases', JSON.stringify(newPurchases));
        setPaymentStep('success');
      } else {
        alert(data.error || 'Payment verification failed. Check TRX ID.');
        setPaymentStep('checkout');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Verification server is offline or busy.');
      setPaymentStep('checkout');
    }
  };

  const handleDownload = (item: StoreItem) => {
    if ((item.type === 'premium_apk' || item.type === 'account') && downloadedItems.includes(item.id)) {
      alert('This resource has already been accessed/downloaded. Single-access limit reached.');
      return;
    }

    window.open(item.apkUrl, '_blank');
    
    if (item.type === 'premium_apk' || item.type === 'account') {
      const newDownloads = [...downloadedItems, item.id];
      setDownloadedItems(newDownloads);
      localStorage.setItem('dihhub_downloads', JSON.stringify(newDownloads));
    }
  };

  const fetchStore = async () => {
    try {
      const res = await fetch('/api/store');
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error('Failed to fetch store:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiateBanglaEpayCheckout = async (itemId: string, method: string) => {
    const userStr = localStorage.getItem('dihhub_user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    
    if (!userObj) {
      alert('Please log in first before checking out.');
      return;
    }

    setPaymentStep('verifying');
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userObj.id || userObj.uid,
          amount: selectedItem?.price,
          method: method
        })
      });
      const data = await res.json();
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert(data.message || 'Unable to start automated checkout. Switching to manual mode.');
        setSelectedMethod(method as any);
        setPaymentStep('checkout');
      }
    } catch (err) {
      console.error('BanglaEpay initiation error:', err);
      setSelectedMethod(method as any);
      setPaymentStep('checkout');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    
    // Feature toggles
    if (item.type === 'account' && !settings.storeEnableAccounts) return false;
    if ((item.type === 'apk' || item.type === 'premium_apk') && !settings.storeEnableApks) return false;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-5 sm:p-6 md:p-8 text-white border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-blue-600/20 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-4 md:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
              <Package size={14} /> Official App & Account Repository
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-[0.9]">
              DIH TEMPLATE <br/><span className="text-blue-500">Pro</span> Store
            </h1>
            <p className="text-sm md:text-lg text-slate-400 max-w-xl font-medium leading-relaxed">
              Access premium APK resources and social media account inventory. Complete with tutorials and verified status.
            </p>
            <div className="flex flex-wrap gap-2 md:gap-4 pt-2 md:pt-4">
              {[
                { icon: ShieldCheck, label: 'Secure', color: 'text-green-500' },
                { icon: Package, label: 'Premium', color: 'text-blue-500' },
                { icon: Users, label: 'Accounts', color: 'text-indigo-500' }
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-md">
                   <b.icon size={14} className={b.color} />
                   <span className="text-[10px] font-bold uppercase tracking-wider">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browser Section */}
        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search resources, accounts, versions..."
                className="w-full pl-12 pr-6 py-4 md:py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl md:rounded-[24px] border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
               {[
                 { id: 'all' as const, label: 'All', visible: true },
                 { id: 'apk' as const, label: 'Free', visible: settings.storeEnableApks },
                 { id: 'premium_apk' as const, label: 'Premium', visible: settings.storeEnableApks },
                 { id: 'account' as const, label: 'Accounts', visible: settings.storeEnableAccounts }
               ].filter(c => c.visible).map(cat => (
                 <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    cat.id === activeCategory ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600"
                  )}
                 >
                   {cat.label}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-[40px] bg-slate-200 dark:bg-slate-900 animate-pulse" />
                ))
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full py-24 text-center">
                   <Package size={64} className="mx-auto text-slate-300 dark:text-slate-800 mb-6" />
                   <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Nothing found</h3>
                   <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Try a different search term</p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedItem(item)}
                    className="group relative cursor-pointer"
                  >
                    <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/50 relative overflow-hidden">
                      {/* New Badge for recent items */}
                      {new Date(item.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                        <div className="absolute top-4 right-4 badge-new text-white text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full shadow-lg z-20">
                          NEW
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                         <div className={cn(
                           "w-16 h-16 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 overflow-hidden",
                           item.type === 'apk' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : 
                           item.type === 'premium_apk' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                           "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                         )}>
                           {item.thumbnail && (item.type === 'apk' || item.type === 'premium_apk') ? (
                             <img src={item.thumbnail} className="w-full h-full object-cover" alt="icon" />
                           ) : (
                             item.type === 'account' ? <Users size={32} /> : <Package size={32} />
                           )}
                         </div>
                         <div className={cn(
                           "p-2 rounded-xl text-[10px] font-black font-mono uppercase",
                           item.type === 'apk' ? "bg-slate-100 dark:bg-slate-800" :
                           item.type === 'premium_apk' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" :
                           "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                         )}>
                           {item.type === 'apk' ? 'Free Tool' : 
                            item.type === 'premium_apk' ? 'Premium' : 
                            item.platform || 'Account'}
                         </div>
                      </div>
                      
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        
                        {(item.type === 'account' || item.type === 'premium_apk') && (
                          <div className="flex flex-col gap-2">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                              item.type === 'premium_apk' ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                            )}>
                              Price: {item.price || item.tutorial || 'Inquire'}
                            </div>
                            {purchasedItems.includes(item.id) && (
                              <div className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1">
                                <ShieldCheck size={10} /> Purchased
                              </div>
                            )}
                          </div>
                        )}

                      <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-500">
                           <ShieldCheck size={14} className="text-green-500" />
                           <span className="text-[10px] font-black uppercase tracking-tighter">Verified Provider</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !showPaymentModal && setSelectedItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            
            <motion.div 
              layoutId={selectedItem.id}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
            >
               <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-10 md:p-14 space-y-10">
                     <div className="space-y-6">
                        <div className={cn(
                          "w-20 h-20 rounded-[24px] flex items-center justify-center text-white shadow-xl overflow-hidden",
                          selectedItem.type === 'apk' ? "bg-blue-500 shadow-blue-500/20" : 
                          selectedItem.type === 'premium_apk' ? "bg-amber-500 shadow-amber-500/20" :
                          "bg-indigo-500 shadow-indigo-500/20"
                        )}>
                          {selectedItem.thumbnail && (selectedItem.type === 'apk' || selectedItem.type === 'premium_apk') ? (
                            <img src={selectedItem.thumbnail} className="w-full h-full object-cover" alt="logo" />
                          ) : (
                            selectedItem.type === 'account' ? <Users size={40} /> : <Package size={40} />
                          )}
                        </div>
                        <div className="space-y-2">
                           <h2 className="text-4xl font-black tracking-tight">{selectedItem.title}</h2>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                             {selectedItem.type === 'apk' ? 'Free Resource Tool' : 
                              selectedItem.type === 'premium_apk' ? 'Premium Paid Resource' :
                              `${selectedItem.platform} Account Sale`} • {new Date(selectedItem.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                           {selectedItem.description}
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        {((selectedItem.type === 'premium_apk' || selectedItem.type === 'account') && !purchasedItems.includes(selectedItem.id)) ? (
                          <button 
                            onClick={() => {
                              setSelectedMethod(null);
                              setPaymentStep('method');
                              setTrxId('');
                              setShowPaymentModal(true);
                            }}
                            className={cn(
                              "col-span-2 flex flex-col items-center gap-3 p-8 text-white rounded-3xl transition-all font-black text-[12px] uppercase tracking-widest shadow-xl",
                              selectedItem.type === 'premium_apk' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
                            )}
                          >
                            <CreditCard className="animate-bounce" size={28} /> Buy Now ({selectedItem.price || selectedItem.tutorial || 'Premium'})
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleDownload(selectedItem)}
                              disabled={downloadedItems.includes(selectedItem.id) && (selectedItem.type === 'premium_apk' || selectedItem.type === 'account')}
                              className={cn(
                                "flex flex-col items-center gap-3 p-6 text-white rounded-3xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg",
                                selectedItem.type === 'apk' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" : 
                                selectedItem.type === 'premium_apk' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" :
                                "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
                                (downloadedItems.includes(selectedItem.id) && (selectedItem.type === 'premium_apk' || selectedItem.type === 'account')) && "opacity-50 grayscale cursor-not-allowed"
                              )}
                            >
                              <Download size={24} /> 
                              {downloadedItems.includes(selectedItem.id) ? 'Access Revoked' : 
                               (selectedItem.type === 'account' ? 'View Account Info' : 'Download APK')}
                            </button>
                            <button 
                              onClick={() => {
                                if (selectedItem.type === 'apk') window.open(selectedItem.tutorial, '_blank');
                                else {
                                   alert(`Support: ${selectedItem.tutorial}`);
                                }
                              }}
                              className="flex flex-col items-center gap-3 p-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                              {selectedItem.type === 'apk' ? (
                                <><Play size={24} /> Watch Tutorial</>
                              ) : (
                                <><Info size={24} /> Get Support</>
                              )}
                            </button>
                          </>
                        )}
                     </div>

                     {/* Single Access Note */}
                     {(selectedItem.type === 'premium_apk' || selectedItem.type === 'account') && purchasedItems.includes(selectedItem.id) && (
                        <p className="col-span-2 text-[9px] text-red-500 font-bold uppercase tracking-wider text-center bg-red-500/5 py-2 rounded-xl border border-red-500/10">
                          Note: You can only access this link once. Do not close the tab after opening.
                        </p>
                     )}
                  </div>

                  <div className="hidden md:block bg-slate-50 dark:bg-slate-850 p-14 border-l border-slate-200 dark:border-slate-800">
                    <div className="h-full flex flex-col justify-between">
                       <div className="space-y-8">
                          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-blue-500">Security Insights</h4>
                          <div className="space-y-6">
                             {[
                               { icon: ShieldCheck, label: 'Malware Scanned', val: 'Passed' },
                               { icon: Info, label: 'Min Android Ver', val: '6.0+' },
                               { icon: Star, label: 'Source Integrity', val: 'Verified' },
                               { icon: Clock, label: 'Last Updated', val: 'Today' }
                             ].map((insight, i) => (
                               <div key={i} className="flex items-center justify-between group">
                                  <div className="flex items-center gap-3">
                                     <insight.icon size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                     <span className="text-xs font-bold text-slate-500">{insight.label}</span>
                                  </div>
                                  <span className="text-[10px] font-black font-mono">{insight.val}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                          <p className="text-[10px] font-bold text-blue-600 leading-relaxed italic">
                            "This resource was manually reviewed by our security researchers for maximum performance and privacy."
                          </p>
                       </div>
                    </div>
                  </div>
               </div>
               
               <button 
                 onClick={() => setSelectedItem(null)}
                 className="absolute top-6 right-6 w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
               >
                 <ExternalLink size={20} className="rotate-45" />
               </button>

               {/* Overlay Payment Modal inside Detail Modal to keep context */}
               <AnimatePresence>
                 {showPaymentModal && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 20 }}
                     className="absolute inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 md:p-14"
                   >
                     <div className="w-full max-w-md space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-3xl font-black tracking-tight">Checkout</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Autopay Gateway</p>
                          </div>
                          <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <X size={24} />
                          </button>
                        </div>

                        {paymentStep === 'method' && (
                          <div className="grid grid-cols-1 gap-4">
                            {[
                              { 
                                id: 'binance', 
                                label: 'Binance Pay', 
                                tag: 'Official',
                                logo: (
                                  <svg viewBox="0 0 24 24" className="w-14 h-14 pointer-events-none rounded-3xl shadow-lg" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="5.5" fill="#12161A" stroke="#252930" strokeWidth="0.25"/>
                                    <g transform="translate(3.6, 3.6) scale(0.7)">
                                      <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z" fill="#F0B90B"/>
                                    </g>
                                  </svg>
                                )
                              },
                              { 
                                id: 'bkash', 
                                label: 'bKash Checkout', 
                                tag: 'Official',
                                logo: (
                                  <svg viewBox="0 0 100 100" className="w-14 h-14 pointer-events-none rounded-3xl shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100" height="100" rx="22" fill="#E2125A"/>
                                    {/* Back Wing */}
                                    <path d="M65 52 L55 68 L45 20 Z" fill="#FFFFFF" fillOpacity="0.75"/>
                                    {/* Head */}
                                    <path d="M72 42 L80 40 L74 46 Z" fill="#FFFFFF" fillOpacity="1"/>
                                    {/* Neck */}
                                    <path d="M72 42 L74 46 L65 52 Z" fill="#FFFFFF" fillOpacity="0.95"/>
                                    {/* Chest */}
                                    <path d="M65 52 L74 46 L68 62 Z" fill="#FFFFFF" fillOpacity="0.85"/>
                                    {/* Front Wing */}
                                    <path d="M65 52 L58 25 L68 62 Z" fill="#FFFFFF" fillOpacity="0.9"/>
                                    {/* Center Body */}
                                    <path d="M65 52 L68 62 L55 68 Z" fill="#FFFFFF" fillOpacity="0.95"/>
                                    {/* Lower Belly */}
                                    <path d="M55 68 L68 62 L52 75 Z" fill="#FFFFFF" fillOpacity="0.85"/>
                                    {/* Tail */}
                                    <path d="M55 68 L52 75 L20 75 Z" fill="#FFFFFF" fillOpacity="0.8"/>
                                    {/* Tail Fold */}
                                    <path d="M35 38 L55 68 L20 75 Z" fill="#FFFFFF" fillOpacity="0.9"/>
                                  </svg>
                                )
                              },
                              { 
                                id: 'nagad', 
                                label: 'Nagad Checkout', 
                                tag: 'Official',
                                logo: (
                                  <svg viewBox="0 0 100 100" className="w-14 h-14 pointer-events-none rounded-3xl shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                      <linearGradient id="nagadGradApk" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#F2351E" />
                                        <stop offset="60%" stopColor="#FA5A1E" />
                                        <stop offset="100%" stopColor="#FF8B24" />
                                      </linearGradient>
                                    </defs>
                                    <rect width="100" height="100" rx="22" fill="url(#nagadGradApk)"/>
                                    <circle cx="50" cy="50" r="28" fill="#FFFFFF" fillOpacity="0.15"/>
                                    <circle cx="52" cy="33" r="4.5" fill="#FFFFFF"/>
                                    <path d="M48 38 L54 44 L50 56 L55 68 L50 71 L45 58 L41 48 L47 38 Z" fill="#FFFFFF"/>
                                    <path d="M54 36 C59 36 62 42 59 47 C56 50 51 50 49 45 Z" fill="#FFFFFF" fillOpacity="0.9"/>
                                    <path d="M44 52 L36 51 L39 48 L46 49 Z" fill="#FFFFFF" fillOpacity="0.85"/>
                                    <path d="M25 52 L75 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M71 52 L73 47 L75 52 L73 57 L71 52 Z" fill="#FFFFFF"/>
                                    <rect x="34" y="52" width="4.5" height="6.5" rx="1" fill="#FFFFFF"/>
                                  </svg>
                                )
                              }
                            ].map(method => (
                              <button
                                key={method.id}
                                onClick={() => {
                                  if (method.id === 'bkash' || method.id === 'nagad') {
                                    initiateBanglaEpayCheckout(selectedItem!.id, method.id);
                                  } else {
                                    setSelectedMethod(method.id as any);
                                    setPaymentStep('checkout');
                                  }
                                }}
                                className={cn(
                                  "flex items-center gap-4 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all group",
                                  "hover:scale-[1.02] active:scale-95"
                                )}
                              >
                                <div className="flex-shrink-0">
                                  {method.logo}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-black text-base">{method.label}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">{method.tag} Verification</p>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-slate-900 transition-colors" size={24} />
                              </button>
                            ))}
                          </div>
                        )}

                        {paymentStep === 'checkout' && (
                          <div className="space-y-6">
                            <div className="p-8 bg-slate-50 dark:bg-slate-850 rounded-[40px] border border-dashed border-slate-300 dark:border-slate-700">
                              <div className="flex justify-between items-center mb-6">
                                <span className="text-xs font-black uppercase text-slate-500">Payable Amount</span>
                                <div className="text-right">
                                  <span className="text-3xl font-black text-blue-500">{selectedItem.price || selectedItem.tutorial}</span>
                                  <p className="text-[8px] font-black text-slate-400 uppercase mt-1">incl. all taxes</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                {(selectedMethod === 'bkash' || selectedMethod === 'nagad') && (
                                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4 text-center">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">Automated Instant Checkout Available</p>
                                    <button 
                                      onClick={() => initiateBanglaEpayCheckout(selectedItem!.id, selectedMethod!)}
                                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-lg shadow-emerald-500/20 mb-2 flex items-center justify-center gap-2"
                                    >
                                      <span>⚡ PAY VIA {selectedMethod.toUpperCase()} (AUTOPAY)</span>
                                    </button>
                                    <p className="text-[9px] font-bold text-slate-400">Or manually pay to merchant account and insert TRX ID below:</p>
                                  </div>
                                )}
                                {selectedMethod === 'binance' && (
                                  <div className="p-5 bg-[#F3BA2F]/10 border border-[#F3BA2F]/20 rounded-2xl mb-4 text-center">
                                    <p className="text-[10px] font-black text-[#F3BA2F] uppercase mb-1">Binance Pay Instructions</p>
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                      Please send the exact amount to Binance Pay ID: <br/>
                                      <span className="text-lg font-black text-slate-900 dark:text-white select-all">495331860</span>
                                      <br/>Then enter your 10-digit TRX ID below.
                                    </p>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Transaction ID (TRX)</label>
                                  <input 
                                    type="text"
                                    placeholder="Enter 10-digit TRX ID"
                                    value={trxId}
                                    onChange={e => setTrxId(e.target.value.toUpperCase())}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl font-mono text-center tracking-[0.3em] text-xl font-black outline-none focus:ring-4 focus:ring-blue-500/20"
                                  />
                                </div>
                                <button 
                                  disabled={trxId.length < 5}
                                  onClick={() => handlePurchase(selectedItem.id)}
                                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl disabled:opacity-50"
                                >
                                  {selectedMethod === 'binance' ? 'Confirm Binance Payment' : 'Verify Payment'}
                                </button>
                              </div>
                            </div>
                            <button onClick={() => setPaymentStep('method')} className="w-full text-center text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Back to Methods</button>
                          </div>
                        )}

                        {paymentStep === 'verifying' && (
                          <div className="py-20 text-center space-y-8">
                            <div className="relative w-32 h-32 mx-auto">
                              <div className="absolute inset-0 border-8 border-blue-500/10 rounded-full" />
                              <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-spin" />
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-3xl font-black">Validating TRX</h4>
                              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Connecting to API Gateway...</p>
                            </div>
                          </div>
                        )}

                        {paymentStep === 'success' && (
                          <div className="py-20 text-center space-y-10">
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-32 h-32 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto"
                            >
                              <CheckCircle2 size={72} className="animate-bounce" />
                            </motion.div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="text-4xl font-black text-green-500">Resource Unlocked</h4>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Payment verified successfully</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setShowPaymentModal(false);
                                }}
                                className="px-14 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl"
                              >
                                Continue to Resource
                              </button>
                            </div>
                          </div>
                        )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
