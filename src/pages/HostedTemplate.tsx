import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, AlertCircle } from 'lucide-react';

export default function HostedTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplate() {
      if (!slug) return;
      try {
        const docRef = doc(db, 'templates', slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setTemplate(docSnap.data());
        } else {
          setError('Template not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [slug]);

  useEffect(() => {
    if (template) {
      document.title = template.name;
      
      // Inject CSS
      if (template.cssContent) {
        const style = document.createElement('style');
        style.textContent = template.cssContent;
        document.head.appendChild(style);
        return () => {
          document.head.removeChild(style);
        };
      }
    }
  }, [template]);

  useEffect(() => {
    if (template && template.jsContent) {
      try {
        const script = document.createElement('script');
        script.textContent = template.jsContent;
        document.body.appendChild(script);
        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        console.error("Template JS Error:", err);
      }
    }
  }, [template]);

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-8">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  if (error || !template) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-8 text-center space-y-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.1),transparent_60%)]" />
      <div className="relative">
        <div className="w-32 h-32 bg-red-500/10 rounded-[3rem] border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_80px_rgba(239,68,68,0.15)] relative z-10">
          <AlertCircle size={64} strokeWidth={1} />
        </div>
        <div className="absolute inset-0 bg-red-500/30 blur-[60px] rounded-full opacity-60" />
      </div>
      <div className="space-y-4 relative z-10">
        <div className="text-red-500 font-black uppercase tracking-[0.6em] text-[10px]">Critical Failure</div>
        <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-[calc(-0.06em)] uppercase leading-none">404 <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-transparent opacity-50">Offline</span></h1>
        <p className="text-slate-500 font-medium tracking-wide max-w-sm mx-auto">{error || "Requested architecture is not registered in our global directory."}</p>
      </div>
      <a href="/" className="relative group px-12 py-5 bg-white text-black font-black uppercase text-xs tracking-[0.4em] rounded-full hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-colors" />
        <span className="relative z-10">Emergency Exit</span>
      </a>
    </div>
  );

  const getCleanHtml = (html: string) => {
    return html || '';
  };

  return (
    <div id="template-root" className="w-full min-h-screen">
      {/* 
        WARNING: dangerouslySetInnerHTML is used to render user-uploaded HTML. 
        In a production environment with public uploads, this should be sanitized 
        or rendered in a sandboxed iframe. For this admin-only context, it's 
        the requested hosting behavior.
      */}
      <div dangerouslySetInnerHTML={{ __html: getCleanHtml(template.htmlContent) }} />
    </div>
  );
}
