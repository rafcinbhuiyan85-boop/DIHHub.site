import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  RefreshCcw, 
  Copy, 
  Trash2, 
  Inbox, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  Eye, 
  X,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  bodyPreview: string;
  bodyHtml?: string;
  bodyText?: string;
}

const API_URL_TM = '/api/tempmail/tm';
const API_URL_1SEC = '/api/tempmail/1sec';

const NAMES = ['pavel', 'shuvo', 'tamim', 'joy', 'fahim', 'sifat', 'rahin', 'sakib', 'nabil', 'asif', 'faysal'];
const SURNAMES = ['hossain', 'ahmed', 'khan', 'chowdhury', 'islam', 'rahman', 'mahmud', 'bhuiyan'];

export default function TempMail() {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [inbox, setInbox] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMail, setSelectedMail] = useState<EmailMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'online' | 'offline'>('online');
  const [isMailLoading, setIsMailLoading] = useState(false);
  const [use1Sec, setUse1Sec] = useState(true);
  const refreshInterval = useRef<any>(null);

  // Initialize and check inbox periodically
  useEffect(() => {
    const savedData = localStorage.getItem('dih_temp_mail_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setEmail(data.email);
        setToken(data.token);
        setUse1Sec(data.is1Sec ?? true);
        
        if (data.is1Sec) {
          fetchInbox1Sec(data.email);
        } else {
          fetchInboxTM(data.token);
        }
      } catch (e) {
        generateEmail();
      }
    } else {
      generateEmail();
    }

    // Auto-refresh every 5 seconds
    refreshInterval.current = setInterval(() => {
      const stored = localStorage.getItem('dih_temp_mail_data');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.is1Sec) {
            fetchInbox1Sec(data.email, true);
          } else {
            fetchInboxTM(data.token, true);
          }
        } catch (e) {}
      }
    }, 5000);

    return () => clearInterval(refreshInterval.current);
  }, []);

  const generateEmail = async () => {
    setIsLoading(true);
    setStatus('online');
    
    // Pick a realistic name
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomSurname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const randomNum = Math.floor(100 + Math.random() * 899);
    const username = `${randomName}.${randomSurname}${randomNum}`;

    try {
      // Try 1secmail first (stateless, faster)
      const domainsRes = await fetch(`${API_URL_1SEC}?action=getDomainsList`);
      const domains = await domainsRes.json();
      
      const domain = (Array.isArray(domains) && domains.length > 0) 
        ? domains[Math.floor(Math.random() * domains.length)]
        : '1secmail.com';
      
      const address = `${username}@${domain}`;
      setEmail(address);
      setUse1Sec(true);
      setToken(null);
      setInbox([]);
      
      localStorage.setItem('dih_temp_mail_data', JSON.stringify({
        email: address,
        is1Sec: true
      }));

    } catch (error) {
      console.error('[TempMail] 1SecMail Error, falling back to Mail.tm:', error);
      // Fallback to Mail.tm
      await generateEmailTM(username);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmailTM = async (username: string) => {
    try {
      const domainsRes = await fetch(`${API_URL_TM}/domains`);
      const domains = await domainsRes.json();
      const domain = domains['hydra:member']?.[0]?.domain;

      if (!domain) throw new Error('No Mail.tm domains available');

      const address = `${username}@${domain}`;
      const password = Math.random().toString(36).substring(2, 12);

      const createRes = await fetch(`${API_URL_TM}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });

      if (!createRes.ok) throw new Error('Account creation failed');

      const tokenRes = await fetch(`${API_URL_TM}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.token) {
        setEmail(address);
        setToken(tokenData.token);
        setUse1Sec(false);
        localStorage.setItem('dih_temp_mail_data', JSON.stringify({
          email: address,
          token: tokenData.token,
          is1Sec: false
        }));
        setInbox([]);
        setStatus('online');
      }
    } catch (err) {
      console.error('[TempMail] TM Fallback Failed:', err);
      setStatus('offline');
    }
  };

  const fetchInbox1Sec = async (addr: string, silent = false) => {
    if (!addr) return;
    const [login, domain] = addr.split('@');
    if (!silent) setIsRefreshing(true);
    
    try {
      const res = await fetch(`${API_URL_1SEC}?action=getMessages&login=${login}&domain=${domain}`);
      const messages = await res.json();
      
      const formatted = messages.map((msg: any) => ({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        date: msg.date,
        bodyPreview: 'Click to read full message'
      }));
      
      setInbox(formatted);
      setStatus('online');
    } catch (e) {
      setStatus('offline');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const fetchInboxTM = async (authToken: string, silent = false) => {
    if (!authToken) return;
    if (!silent) setIsRefreshing(true);
    try {
      const response = await fetch(`${API_URL_TM}/messages`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const messages = data['hydra:member'] || [];
        
        const formattedData = messages.map((msg: any) => ({
          id: msg.id,
          from: msg.from?.address || msg.from?.name || 'Unknown Sender',
          subject: msg.subject || '(No Subject)',
          date: msg.createdAt || new Date().toISOString(),
          bodyPreview: msg.intro || 'No preview available',
        }));
        
        setInbox(formattedData);
        setStatus('online');
      } else if (response.status === 401) {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const fetchMessageDetail = async (msgId: string) => {
    if (!email) return;
    setIsMailLoading(true);
    
    try {
      if (use1Sec) {
        const [login, domain] = email.split('@');
        const res = await fetch(`${API_URL_1SEC}?action=readMessage&login=${login}&domain=${domain}&id=${msgId}`);
        const data = await res.json();
        
        setSelectedMail({
          id: data.id,
          from: data.from,
          subject: data.subject,
          date: data.date,
          bodyPreview: '',
          bodyHtml: data.body, // 1secmail body can be html
          bodyText: data.textBody
        });
      } else {
        if (!token) return;
        const response = await fetch(`${API_URL_TM}/messages/${msgId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        setSelectedMail({
          id: data.id,
          from: data.from?.address || 'Unknown',
          subject: data.subject || '(No Subject)',
          date: data.createdAt || new Date().toISOString(),
          bodyPreview: data.intro || '',
          bodyHtml: data.html?.[0] || data.html || '',
          bodyText: data.text
        });
      }
    } catch (error) {
      console.error('[TempMail] Detail Error:', error);
    } finally {
      setIsMailLoading(false);
    }
  };

  const refreshCurrentInbox = (silent = false) => {
    if (use1Sec && email) {
      fetchInbox1Sec(email, silent);
    } else if (token) {
      fetchInboxTM(token, silent);
    }
  };

  const deleteMailbox = () => {
    localStorage.removeItem('dih_temp_mail_data');
    setEmail(null);
    setToken(null);
    setInbox([]);
    generateEmail();
  };

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header Section */}
      <div className="relative overflow-hidden group rounded-[2rem] p-6 md:p-8 border border-white/5 bg-slate-950 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
            <Zap size={80} className="text-primary rotate-12" />
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-xl shadow-primary/30">
              <Mail size={20} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic">Temp Mail <span className="text-primary font-light">Pro</span></h1>
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status === 'online' ? "bg-green-500" : "bg-red-500")} />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">System {status}</span>
                <span className="bg-emerald-500/10 text-emerald-500 text-[8px] px-2 py-0.5 rounded-full font-black border border-emerald-500/20">REAL & WORKING</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8 group/mail">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within/mail:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-black/40 border border-white/10 p-1.5 pl-5 rounded-xl backdrop-blur-xl transition-all group-hover/mail:border-primary/50">
                  <div className="flex-1 truncate">
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-0">Your Temporary ID</p>
                    {isLoading ? (
                      <div className="h-5 w-40 bg-white/5 animate-pulse rounded-md" />
                    ) : (
                      <span className="text-sm md:text-lg font-bold text-white tracking-tight">{email || 'Generating address...'}</span>
                    )}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    disabled={!email}
                    className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    {copied ? <CheckCircle2 className="text-green-500" size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-4 flex gap-2">
              <button 
                onClick={generateEmail}
                className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
                Regenerate
              </button>
              <button 
                onClick={deleteMailbox}
                className="w-12 h-12 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Inbox Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12 space-y-4">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
                <Inbox size={20} className="text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Inbox</h3>
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">Live</span>
             </div>
             <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock size={12} /> Syncing every 5s</span>
                <button onClick={() => refreshCurrentInbox()} className="text-primary hover:underline">Refresh Now</button>
             </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {inbox.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-20 flex flex-col items-center justify-center space-y-4 text-center"
                >
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary/40">
                    <Globe size={32} className="animate-spin-slow" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold">Waiting for incoming signals...</p>
                    <p className="text-zinc-500 text-xs italic">Use the email address above to receive messages.</p>
                  </div>
                </motion.div>
              ) : (
                inbox.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    layoutId={msg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedMail(msg);
                      fetchMessageDetail(msg.id);
                    }}
                    className="group bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-primary/30 rounded-2xl p-4 md:p-6 flex items-center gap-4 cursor-pointer transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:border-primary/50 transition-all">
                      {isMailLoading ? <RefreshCcw size={20} className="animate-spin text-primary" /> : <Mail size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[150px]">{msg.from}</span>
                        <span className="text-[9px] font-medium text-zinc-600">{new Date(msg.date).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate mb-1">{msg.subject}</h4>
                      <p className="text-xs text-zinc-500 truncate">{msg.bodyPreview}</p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-primary/20 text-zinc-600 group-hover:text-primary transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Email View Modal */}
      <AnimatePresence>
        {selectedMail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-md bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-950 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-3xl overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight">{selectedMail.subject}</h3>
                    <p className="text-[10px] font-medium text-zinc-500">From: <span className="text-primary">{selectedMail.from}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMail(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                {isMailLoading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                    <RefreshCcw size={48} className="animate-spin text-primary" />
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Decrypting Message Content...</p>
                  </div>
                ) : selectedMail.bodyHtml ? (
                  <div 
                    className="bg-white rounded-2xl p-6 text-slate-900 prose prose-slate max-w-none shadow-inner"
                    dangerouslySetInnerHTML={{ __html: selectedMail.bodyHtml }}
                  />
                ) : (
                  <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/5 text-zinc-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {selectedMail.bodyText}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                <button 
                  onClick={() => setSelectedMail(null)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Close Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}} />
    </div>
  );
}
