import React, { useState } from 'react';
import { Download, Link2, Instagram, Facebook, Youtube, Play, Search, Twitter, Video, Pin, Linkedin, Ghost, Twitch, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { logEvent, LogType } from '@/src/lib/logger';

import { useAppSettings } from '@/src/hooks/useAppSettings';

export default function VideoDownloader() {
  const { settings } = useAppSettings();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [result, setResult] = useState<any>(null);

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30', visible: settings.downloaderEnableInstagram },
    { name: 'TikTok', icon: Play, color: 'text-black bg-slate-200 dark:bg-slate-800 dark:text-white', visible: settings.downloaderEnableTikTok },
    { name: 'YouTube', icon: Youtube, color: 'text-red-600 bg-red-100 dark:bg-red-900/30', visible: settings.downloaderEnableYouTube },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', visible: settings.downloaderEnableFacebook },
    { name: 'Pornhub', icon: Play, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30', visible: settings.downloaderEnablePornhub },
    { name: 'Twitter/X', icon: Twitter, color: 'text-sky-500 bg-sky-100 dark:bg-sky-900/30', visible: settings.downloaderEnableTwitter },
    { name: 'Vimeo', icon: Video, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30', visible: settings.downloaderEnableVimeo },
    { name: 'Pinterest', icon: Pin, color: 'text-red-500 bg-red-100 dark:bg-red-900/30', visible: settings.downloaderEnablePinterest },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30', visible: settings.downloaderEnableLinkedIn },
    { name: 'Reddit', icon: MessageCircle, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', visible: settings.downloaderEnableReddit },
    { name: 'Snapchat', icon: Ghost, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30', visible: settings.downloaderEnableSnapchat },
    { name: 'Twitch', icon: Twitch, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', visible: settings.downloaderEnableTwitch },
    { name: 'Threads', icon: MessageCircle, color: 'text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-white', visible: settings.downloaderEnableThreads },
  ];

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/downloader', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          videoQuality: '720',
          audioFormat: 'mp3',
          filenameStyle: 'pretty',
          downloadMode: 'auto',
          isNoTTWatermark: true
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('The service returned an unreadable response. This usually happens when all available engines are overloaded. Please try again in 5 minutes.');
      }

      if (!response.ok) {
        throw new Error(data.text || data.error?.code || `Error ${response.status}: Failed to reach service.`);
      }
      
      console.log('Downloader Response:', data);
      
      if (data.status === 'error') {
        throw new Error(data.text || (data.error && data.error.code) || 'Failed to fetch video.');
      }

      if (['redirect', 'picker', 'success', 'stream', 'tunnel'].includes(data.status)) {
        setResult(data);
        logEvent({
          type: LogType.DOWNLOAD,
          tool: 'Video Downloader',
          details: { url, status: data.status, source: data.source }
        });
      } else {
        throw new Error('All available processing engines are currently busy. Please try another link or try again in a moment.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to the downloader service. Please check your internet or try a different link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-8 px-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-red-500/20">
          <Download size={24} />
        </div>
        <h2 className="text-2xl font-black tracking-tight">Media Downloader</h2>
        <p className="text-slate-500 max-w-lg mx-auto text-sm font-medium">Download high-quality content from your favorite platforms instantly.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <form onSubmit={handleDownload} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              <Link2 size={18} />
            </div>
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste link (YouTube, Instagram, TikTok...)"
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 dark:text-slate-200 focus:border-red-500 transition-all text-sm sm:text-base outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={!url || loading}
            className="bg-primary hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-4 sm:py-0 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 shrink-0 cursor-pointer active:scale-95"
          >
            {loading ? <Search className="animate-spin" size={20} /> : <Download size={20} />}
            {loading ? 'Fetching...' : 'Download'}
          </button>
        </form>

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border-2 border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-64 aspect-video bg-black rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center relative">
                {result.thumbnail ? (
                  <img src={result.thumbnail} alt="Video Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Play className="text-white/50" size={48} />
                )}
              </div>
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h3 className="text-xl font-bold mb-2">{result.title || 'Video Ready for Download'}</h3>
                  <p className="text-sm text-slate-500 font-medium">Your content has been successfully processed and is ready to save.</p>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {result.url && (
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                    >
                      <Download size={20} />
                      Download Video
                    </a>
                  )}
                  {result.picker && result.picker.map((item: any, idx: number) => (
                    <a 
                      key={idx}
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-200 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all"
                    >
                      {item.type === 'photo' ? 'Download Image' : 'Download Video'} {result.picker.length > 1 ? idx + 1 : ''}
                    </a>
                  ))}
                </div>
                
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  Processing Engine: {result.source || 'Cobalt Infrastructure'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.filter(p => p.visible).map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", p.color)}>
                <p.icon size={28} />
              </div>
              <span className="text-sm font-bold">{p.name}</span>
            </div>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400 text-sm flex items-start gap-4"
          >
            <div className="mt-1">⚠️</div>
            <p className="leading-relaxed font-medium">{error}</p>
          </motion.div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Any Format', desc: 'Download in MP4 or MP3 format with ease.' },
          { title: 'HD Quality', desc: 'Always get the highest resolution available.' },
          { title: 'Fast & Secure', desc: 'Safe processing with premium speed.' }
        ].map((f) => (
          <div key={f.title} className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
             <h4 className="font-bold mb-2">{f.title}</h4>
             <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
