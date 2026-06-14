import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] p-10 text-center shadow-2xl shadow-emerald-500/10"
      >
        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-8 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Payment Received!</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          ধন্যবাদ! আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। আপনার ব্যালেন্স কিছুক্ষণের মধ্যেই আপডেট হয়ে যাবে।
        </p>

        {orderId && (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 mb-8">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Order ID</p>
            <p className="font-mono text-sm text-emerald-200">{orderId}</p>
          </div>
        )}

        <Link 
          to="/"
          className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
        >
          <ArrowLeft size={18} />
          ফিরে যান
        </Link>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
