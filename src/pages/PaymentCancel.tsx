import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-[2.5rem] p-10 text-center shadow-2xl shadow-red-500/10"
      >
        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/30 shadow-lg shadow-red-500/10">
          <XCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Payment Cancelled</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          পেমেন্টটি বাতিল করা হয়েছে। যদি কোন সমস্যা হয়ে থাকে তবে আবার চেষ্টা করুন।
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            to="/"
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-600/20 active:scale-95"
          >
            <RefreshCcw size={18} />
            আবার চেষ্টা করুন
          </Link>
          
          <Link 
            to="/"
            className="w-full flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            ফিরে যান
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
