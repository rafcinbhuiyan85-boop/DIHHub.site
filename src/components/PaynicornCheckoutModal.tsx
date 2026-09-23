import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, X, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaynicornCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number | string;
  orderTitle?: string;
  itemId?: string;
  userEmail?: string;
  userId?: string;
  onSuccess?: (orderId: string) => void;
}

export const PaynicornCheckoutModal: React.FC<PaynicornCheckoutModalProps> = ({
  isOpen,
  onClose,
  defaultAmount = '100',
  orderTitle = 'Digital Order Checkout',
  itemId,
  userEmail,
  userId,
  onSuccess
}) => {
  const [amount, setAmount] = useState<string>(String(defaultAmount));
  const [orderId, setOrderId] = useState<string>(() => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const countries = [
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', symbol: '৳', methods: 'bKash, Nagad' },
    { code: 'US', name: 'USA / Cards', flag: '🇺🇸', currency: 'USD', symbol: '$', methods: 'Visa, Mastercard' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'AED', methods: 'Cards / Local Pay' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', symbol: '₨', methods: 'JazzCash, Easypaisa' },
    { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹', methods: 'UPI, Paytm, Cards' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', symbol: '₩', methods: 'KakaoPay, Cards' },
    { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', symbol: '¥', methods: 'AliPay, WeChat' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', symbol: '€', methods: 'Bizum, SEPA' },
    { code: 'MM', name: 'Myanmar', flag: '🇲🇲', currency: 'MMK', symbol: 'Ks', methods: 'KBZPay, WavePay' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', symbol: 'Rp', methods: 'QRIS, DANA' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', symbol: 'RM', methods: 'FPX, Touch n Go' },
  ];
  const [selectedCountry, setSelectedCountry] = useState<string>('BD');

  if (!isOpen) return null;

  const currentCountryObj = countries.find(c => c.code === selectedCountry) || countries[0];

  const handlePayWithPaynicorn = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('দয়া করে সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isUsd = currentCountryObj.currency === 'USD';
      const response = await fetch('/api/paynicorn/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          currency: currentCountryObj.currency,
          country: currentCountryObj.code,
          countryCode: currentCountryObj.code,
          paymentMethod: isUsd ? 'card' : (currentCountryObj.code === 'BD' ? 'local' : 'auto'),
          orderId: orderId,
          subject: orderTitle,
          userEmail: userEmail || undefined,
          userId: userId || undefined,
          metadata: itemId ? { itemId, countryCode: currentCountryObj.code, currency: currentCountryObj.currency } : { countryCode: currentCountryObj.code, currency: currentCountryObj.currency }
        })
      });

      const data = await response.json();
      const paymentUrl = data.paymentUrl || data.webUrl || data.checkoutUrl || data.data?.paymentUrl || data.data?.webUrl || data.data?.checkoutUrl;

      if (paymentUrl) {
        if (onSuccess) onSuccess(orderId);
        // Immediate redirection to real payment gateway checkout page
        window.location.href = paymentUrl;
        return;
      } else {
        setError(data.error || 'পেমেন্ট গেটওয়েতে সংযোগ করতে সমস্যা হচ্ছে।');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Payment Checkout Error:', err);
      setError('সার্ভারে যোগাযোগ করা যায়নি। দয়া করে পুনরায় চেষ্টা করুন।');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-[2rem] p-6 md:p-8 text-white shadow-2xl overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Secure Checkout</h3>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Instant Automated Gateway</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Item / Service</span>
              <span className="text-slate-200 font-bold truncate max-w-[180px]">{orderTitle}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-2">
              <span className="text-slate-400 font-semibold uppercase">Order ID</span>
              <span className="font-mono text-emerald-300 font-bold text-[11px]">{orderId}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-2">
              <span className="text-slate-400 font-semibold uppercase">Currency</span>
              <span className="font-bold text-slate-300">BDT (টাকা)</span>
            </div>
          </div>

          {/* Country Selection */}
          <div className="space-y-2 mb-5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select Payment Country</span>
              <span className="text-emerald-400 font-mono text-[10px]">{currentCountryObj.methods}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {countries.map(c => {
                const isSelected = selectedCountry === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCountry(c.code)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{c.flag}</span>
                      <span className="text-[9px] font-mono font-bold uppercase">{c.currency}</span>
                    </div>
                    <div className="text-[10px] font-bold truncate mt-0.5">{c.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Payable Amount ({currentCountryObj.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-lg font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                {currentCountryObj.currency} ({currentCountryObj.symbol})
              </span>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayWithPaynicorn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-600/25 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Redirecting to Payment Gateway...</span>
              </>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaynicornCheckoutModal;
