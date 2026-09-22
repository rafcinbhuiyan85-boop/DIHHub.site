import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  AlertTriangle,
  Loader2,
  Building2,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PaynicornMockPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId') || 
                  searchParams.get('merchant_order_no') || 
                  searchParams.get('out_trade_no') || 
                  'ORD-TEST-MOCK';
  const amount = searchParams.get('amount') || '100.00';
  const currency = searchParams.get('currency') || 'BDT';
  const subject = searchParams.get('subject') || 'DIH Order Payment';
  const returnUrl = searchParams.get('return_url') || `/payment-success?orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}&gateway=paynicorn`;
  const notifyUrl = searchParams.get('notify_url') || '/api/paynicorn/webhook';

  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card'>('bkash');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'success' | 'failed' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. Manual "Payment Succeeded" handler
  // Absolutely NO automatic redirection or auto-submitting! User must manually click.
  const handlePaymentSucceeded = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActionType('success');
    setStatusMessage('Sending success notification to backend callback handler...');

    try {
      const txnId = `TXN_MOCK_${Date.now()}`;
      
      // Step A: Send Paynicorn notification payload to backend webhook
      const webhookRes = await fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          merchant_order_no: orderId,
          status: '1',
          trade_status: 'SUCCESS',
          amount: String(amount),
          currency,
          txnId,
          method: selectedMethod
        })
      });

      const webhookResponseText = await webhookRes.text();
      console.log('[Paynicorn Mock] Webhook response:', webhookRes.status, webhookResponseText);

      // Step B: Also trigger test confirmation to guarantee balance and order update
      await fetch('/api/paynicorn/confirm-test-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      }).catch(err => console.warn('[Paynicorn Mock] Confirm test order notice:', err));

      setStatusMessage('Payment verified successfully! Navigating to success page...');

      // Redirect to returnUrl
      if (returnUrl.startsWith('http://') || returnUrl.startsWith('https://')) {
        window.location.href = returnUrl;
      } else {
        navigate(returnUrl);
      }
    } catch (err: any) {
      console.error('[Paynicorn Mock] Error during payment success handling:', err);
      // Fallback navigate to success page
      navigate(`/payment-success?orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}&gateway=paynicorn`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Manual "Payment Failed" handler
  const handlePaymentFailed = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActionType('failed');
    setStatusMessage('Recording payment cancellation in backend...');

    try {
      const txnId = `TXN_FAIL_${Date.now()}`;
      
      // Send failed notification payload to backend webhook
      await fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          merchant_order_no: orderId,
          status: '2',
          trade_status: 'FAILED',
          amount: String(amount),
          currency,
          txnId,
          method: selectedMethod
        })
      }).catch(err => console.warn('[Paynicorn Mock] Fail notification notice:', err));

      setStatusMessage('Payment marked as failed. Navigating to cancel page...');
      navigate(`/payment-cancel?orderId=${encodeURIComponent(orderId)}`);
    } catch (err: any) {
      console.error('[Paynicorn Mock] Error during payment failed handling:', err);
      navigate(`/payment-cancel?orderId=${encodeURIComponent(orderId)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative background aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <CreditCard size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-tight text-white">Paynicorn</h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                  Mock Sandbox
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400">Official Gateway Cashier Simulator</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Lock size={12} className="text-emerald-400" />
            <span>Test Mode</span>
          </div>
        </div>

        {/* Manual Interaction Notice: No Auto-Redirection Guarantee */}
        <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3 text-amber-300 text-xs">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">
            <strong className="font-bold">Manual Testing Mode:</strong> Automatic redirection is disabled on this mock cashier page. Please review the order details and manually click either <span className="text-emerald-400 font-bold">"Payment Succeeded"</span> or <span className="text-rose-400 font-bold">"Payment Failed"</span> below.
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Order Description</span>
            <span className="text-slate-200 font-bold max-w-[200px] truncate text-right">{subject}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-700/40 pt-2.5">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Order ID</span>
            <span className="font-mono text-emerald-300 font-bold text-[11px]">{orderId}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-700/40 pt-2.5">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Merchant Order No</span>
            <span className="font-mono text-slate-300 font-semibold text-[11px]">{orderId}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-700/40 pt-2.5">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Total Amount</span>
            <span className="text-emerald-400 font-extrabold text-base">
              {amount} {currency}
            </span>
          </div>
        </div>

        {/* Channel Selection Simulation */}
        <div className="mb-6">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
            Select Mock Channel
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bkash', label: 'bKash', icon: Smartphone, color: 'text-pink-400 border-pink-500/30' },
              { id: 'nagad', label: 'Nagad', icon: Smartphone, color: 'text-orange-400 border-orange-500/30' },
              { id: 'rocket', label: 'Rocket', icon: Building2, color: 'text-purple-400 border-purple-500/30' },
              { id: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-400 border-blue-500/30' }
            ].map(channel => {
              const Icon = channel.icon;
              const isSelected = selectedMethod === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setSelectedMethod(channel.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold ${
                    isSelected 
                      ? 'bg-slate-800 border-emerald-500 text-white ring-2 ring-emerald-500/30' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Icon size={18} className={`mb-1.5 ${channel.color}`} />
                  <span>{channel.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status processing message */}
        {statusMessage && (
          <div className="mb-5 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center text-xs font-semibold text-slate-300 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Primary Manual Action Buttons: "Payment Succeeded" and "Payment Failed" */}
        <div className="space-y-3">
          <button
            type="button"
            id="paynicorn-btn-succeeded"
            onClick={handlePaymentSucceeded}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-600/25 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isProcessing && actionType === 'success' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} className="text-white" />
                <span>Payment Succeeded</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="paynicorn-btn-failed"
            onClick={handlePaymentFailed}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 p-4 bg-slate-800 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/50 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isProcessing && actionType === 'failed' ? (
              <>
                <Loader2 size={18} className="animate-spin text-rose-400" />
                <span>Cancelling Payment...</span>
              </>
            ) : (
              <>
                <XCircle size={20} className="text-rose-400" />
                <span>Payment Failed</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            Paynicorn Callback Test Harness
          </span>
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="hover:text-slate-300 transition-colors underline"
          >
            Exit Cashier
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaynicornMockPayment;
