import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function UserAuthModal({ isOpen, onClose, onSuccess }: UserAuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear states when opening/closing
  useEffect(() => {
    if (isOpen) {
      setError('');
      setFormData({ name: '', email: '', password: '' });
    }
  }, [isOpen, isLogin]);

  // Read password strength parameters
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-800' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User'
        })
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Failed to synchronize account');
      }
    } catch (err: any) {
      console.warn("Google authentication exception:", err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      setError(err?.message || 'Google Auth aborted or restricted. Make sure popups are allowed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Superuser Bypass: logs in automatically as Admin in User panel
    if (isLogin && formData.email === 'rafcin.b' && formData.password === '201347') {
      setTimeout(() => {
        setLoading(false);
        onSuccess({
          id: 'rafcin_admin',
          name: 'Rafcin Bhuiyan',
          email: 'rafcin.b',
          role: 'admin',
          isAdmin: true
        });
        onClose();
      }, 500);
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Incorrect email or password combination.');
      }
    } catch (err) {
      setError('Network request timed out. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop screen with premium micro-blur blur and subtle color gradient */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md"
          />
          
          {/* Decorative ambient background glows */}
          <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px] pointer-events-none z-0" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[80px] pointer-events-none z-0 translate-x-20 -translate-y-20" />

          {/* Main Modal Box with ultra-smooth spring mechanics */}
          <motion.div 
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.25rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-100 dark:border-slate-800 z-50 p-6 md:p-8"
          >
            {/* Elegant glassmorphic Close button */}
            <button 
              onClick={onClose} 
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-full transition-all duration-200 active:scale-90"
            >
              <X size={15} />
            </button>

            {/* Header Area */}
            <div className="text-center pt-2 pb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-medium">
                {isLogin ? 'Provide credentials or continue with Google' : 'Join of premium tools workspace'}
              </p>
            </div>

            {/* Error System with custom card styling */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2.5 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed font-semibold">{error}</p>
              </div>
            )}

            {/* Custom Sliding Tab Controls with Perfect Visual Polish */}
            <div className="flex bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-2xl mb-5 border border-slate-200/50 dark:border-slate-800 relative">
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={cn(
                  "flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer select-none",
                  isLogin ? "text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={cn(
                  "flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer select-none",
                  !isLogin ? "text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                Register
              </button>
              
              {/* Perfect sliding highlight in full vivid gradient */}
              <motion.div 
                layoutId="auth-tab-active"
                className="absolute top-1.5 bottom-1.5 rounded-[10px] bg-gradient-to-r from-indigo-600 to-violet-600 shadow-sm pointer-events-none"
                style={{ 
                  left: isLogin ? '6px' : 'calc(50% + 1.5px)',
                  right: isLogin ? 'calc(50% + 1.5px)' : '6px'
                }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors pointer-events-none">
                      <User size={15} />
                    </div>
                    <input 
                      type="text"
                      required
                      placeholder="Rafcin Bhuiyan"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 text-slate-950 dark:text-white border border-slate-200/80 dark:border-slate-800 rounded-xl focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-xs font-medium"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                  {isLogin ? 'Email or Username' : 'Email Address'}
                </label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors pointer-events-none">
                    <Mail size={15} />
                  </div>
                    <input 
                      type={isLogin ? "text" : "email"}
                      required
                      placeholder={isLogin ? "rafcin.bhuiyan or email" : "member@dihhub.site"}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 text-slate-950 dark:text-white border border-slate-200/80 dark:border-slate-800 rounded-xl focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-xs font-medium"
                    />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1 leading-none">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
                  {!isLogin && formData.password && (
                    <span className={cn("text-[9px] font-bold uppercase tracking-wide", strength.color.replace('bg-', 'text-'))}>
                      {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors pointer-events-none">
                    <Lock size={15} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950/40 text-slate-950 dark:text-white border border-slate-200/80 dark:border-slate-800 rounded-xl focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors duration-200 flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password strength dynamic indicators */}
                {!isLogin && formData.password && (
                  <div className="flex gap-1 px-1 pt-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-1 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors duration-300",
                          strength.score >= i && strength.color
                        )} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Action submission button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white py-3 md:py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-6 shadow-md shadow-indigo-600/15 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-white" size={15} />
                ) : (
                  <>
                    <span>{isLogin ? 'Log In Securely' : 'Create Account'}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800/80"></div>
              <span className="flex-shrink mx-3 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none select-none">Or continue with</span>
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800/80"></div>
            </div>

            {/* Exquisite elegant Google Sign In button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all border border-slate-200 dark:border-slate-800 group/google cursor-pointer active:scale-[0.97] shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4 group-hover/google:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.61 0 3.05.55 4.19 1.63L19.4 3.51C17.43 1.67 14.96.6 12 .6 7.69.6 3.99 3.07 2.18 6.66l3.66 2.84C6.71 6.9 9.14 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                </svg>
                <span>Google Account</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

