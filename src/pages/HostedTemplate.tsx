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

  const getCleanHtml = () => {
    let cleanHtml = template.htmlContent || '';
    let cleanCss = template.cssContent || '';
    let cleanJs = template.jsContent || '';

    if (template.assets) {
      Object.entries(template.assets).forEach(([fileName, dataUrl]) => {
        const escapedName = fileName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        // 1. Standard quotes or parentheses with optional leading ./ or /
        const regex1 = new RegExp(`(["'\\(])(?:\\./|/)?${escapedName}(["'\\)])`, 'g');
        cleanHtml = cleanHtml.replace(regex1, `$1${dataUrl}$2`);
        cleanCss = cleanCss.replace(regex1, `$1${dataUrl}$2`);
        cleanJs = cleanJs.replace(regex1, `$1${dataUrl}$2`);

        // 2. CSS url() with optional leading ./ or / without quotes
        const regex2 = new RegExp(`url\\((?:\\./|/)?${escapedName}\\)`, 'g');
        cleanHtml = cleanHtml.replace(regex2, `url(${dataUrl})`);
        cleanCss = cleanCss.replace(regex2, `url(${dataUrl})`);
        cleanJs = cleanJs.replace(regex2, `url(${dataUrl})`);

        // 3. HTML src= or href= attributes with optional leading ./ or / without quotes
        const regex3 = new RegExp(`(=)(?:\\./|/)?${escapedName}(\\s|>)`, 'g');
        cleanHtml = cleanHtml.replace(regex3, `$1"${dataUrl}"$2`);
      });
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${template.name || 'DIH Template'}</title>
          <style>
            ${cleanCss}
          </style>
        </head>
        <body style="margin: 0; padding: 0;">
          ${cleanHtml}
          <script>
            ${cleanJs}
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div id="template-root" className="fixed inset-0 w-screen h-screen bg-black overflow-hidden z-[999999]">
      <iframe
        srcDoc={getCleanHtml()}
        className="w-full h-full border-none m-0 p-0"
        title={template.name}
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-modals"
      />
    </div>
  );
}
