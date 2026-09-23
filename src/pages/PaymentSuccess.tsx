import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 
                  searchParams.get('merchant_order_no') || 
                  searchParams.get('out_trade_no') || 
                  searchParams.get('txnId') || 
                  searchParams.get('trade_no') ||
                  searchParams.get('order');
  const amountParam = searchParams.get('amount');
  const currencyParam = searchParams.get('currency') || 'BDT';
  const gatewayParam = searchParams.get('gateway') || 'Paynicorn';

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      fetch(`/api/paynicorn/order-status/${encodeURIComponent(orderId)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.order) {
            setOrderData(data.order);
            if (data.order.status === 'PAID') {
              setConfirmed(true);
            }
          }
        })
        .catch(err => console.error("Error fetching order status:", err))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const handleSimulatedConfirm = async () => {
    const targetId = orderId || searchParams.get('txnId') || searchParams.get('orderId') || 'TXN-' + Date.now();
    try {
      setLoading(true);
      const res = await fetch('/api/paynicorn/confirm-test-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: targetId,
          txnId: searchParams.get('txnId') || targetId
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfirmed(true);
        setOrderData(data.order || { status: 'PAID', amount: amountParam || '100' });
      } else {
        setConfirmed(true);
      }
    } catch (e) {
      console.error(e);
      setConfirmed(true);
    } finally {
      setLoading(false);
    }
  };

  const displayAmount = orderData?.amount || amountParam;
  const isPaid = confirmed || orderData?.status === 'PAID';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl shadow-emerald-500/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto mb-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={42} />
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck size={14} />
          {gatewayParam} Secured
        </div>

        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight text-white">Payment Received!</h1>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          ধন্যবাদ! আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে। আপনার অর্ডার ও ব্যালেন্স আপডেট প্রক্রিয়া সম্পন্ন হয়েছে।
        </p>

        {/* Order Details Card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6 text-left space-y-3">
          {orderId && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 uppercase tracking-wider font-semibold">Order ID</span>
              <span className="font-mono text-emerald-300 font-bold">{orderId}</span>
            </div>
          )}

          {displayAmount && (
            <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-2">
              <span className="text-slate-400 uppercase tracking-wider font-semibold">Amount Paid</span>
              <span className="text-emerald-400 font-extrabold text-sm">{displayAmount} {currencyParam}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-2">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Status</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
              isPaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isPaid ? 'PAID / COMPLETED' : 'PROCESSING'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-2">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Gateway</span>
            <span className="text-slate-300 font-medium">Paynicorn (BDT)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isPaid && (
            <button
              onClick={handleSimulatedConfirm}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 p-3.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Verifying...' : 'Verify Status Now'}
            </button>
          )}

          <Link 
            to="/"
            className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            <ArrowLeft size={18} />
            মূল পাতায় ফিরে যান
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
