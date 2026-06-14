import { X, ExternalLink, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppSettings } from '../../hooks/useAppSettings';

interface MoviePlayerProps {
  movieId: number | string;
  type: string;
  onClose: () => void;
}

export default function MoviePlayer({ movieId, type, onClose }: MoviePlayerProps) {
  const { settings } = useAppSettings();
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState<string>(settings.moviePlayerServer || 'vidsrc.to');

  const servers = (['vidsrc.to', 'vidsrc.cc', 'vidsrc.me', 'vidsrc.online', 'moviesapi.club', 'vidsrc.pro', 'vidsrc.net', 'vidsrc.pm'] as const);

  useEffect(() => {
    async function fetchExternalId() {
      if (!movieId) return;
      if (typeof movieId === 'string' && movieId.startsWith('tt')) {
        setImdbId(movieId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const tmdbType = type === 'series' || type === 'tv' ? 'tv' : 'movie';
        const apiKey = settings.tmdbApiKey || "821ee601f70dec43a29031c552195f19";
        const res = await fetch(`https://api.themoviedb.org/3/${tmdbType}/${movieId}/external_ids?api_key=${apiKey}`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        const id = data.imdb_id;
        if (id && id.startsWith('tt')) {
          setImdbId(id);
        } else {
          setImdbId(null);
        }
      } catch (e) {
        console.warn('[Dih Movies] IMDb lookup failed, using TMDB ID');
        setImdbId(null);
      } finally {
        setLoading(false);
      }
    }
    fetchExternalId();
  }, [movieId, type, settings.tmdbApiKey]);

  const getEmbedUrl = () => {
    const vidType = type === 'series' || type === 'tv' ? 'tv' : 'movie';
    const isMoviesApi = server.includes('moviesapi');
    
    // Server compatibility map: some prefer TMDB, some prefer IMDb
    const id = (server === 'vidsrc.to' || server === 'vidsrc.cc' || isMoviesApi || !imdbId) ? movieId : imdbId;
    
    if (isMoviesApi) {
      const baseUrl = `https://moviesapi.club/${vidType}/${id}`;
      return vidType === 'tv' ? `${baseUrl}-1-1` : baseUrl;
    }

    if (server === 'vidsrc.to') {
      return `https://vidsrc.to/embed/${vidType}/${id}${vidType === 'tv' ? '/1/1' : ''}`;
    }

    if (server === 'vidsrc.cc') {
      return `https://vidsrc.cc/v2/embed/${vidType}/${id}${vidType === 'tv' ? '?s=1&e=1' : ''}`;
    }

    const baseUrl = `https://${server}/embed/${vidType}/${id}`;
    return vidType === 'tv' ? `${baseUrl}/1/1` : baseUrl;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center bg-zinc-900 border-b border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-8 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(229,9,20,0.5)]" />
            <h2 className="text-xl font-black tracking-tighter text-white uppercase flex items-center gap-2">
              CINESTREAM <span className="text-primary italic">ULTRA</span>
            </h2>
          </div>
          
          {(!error) && (
            <div className="hidden lg:flex flex-wrap gap-1 ml-4 bg-black/40 p-1 rounded-lg border border-white/5">
              {servers.map(s => (
                <button
                  key={s}
                  onClick={() => setServer(s)}
                  className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${server === s ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  {s === 'moviesapi.club' ? 'CLUB' : s.split('.')[1]}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {!error && (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 500);
                }}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl border border-white/5 transition-all"
                title="Refresh Stream"
              >
                <RefreshCcw size={18} />
              </button>
              <a 
                href={getEmbedUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] active:scale-95"
              >
                <ExternalLink size={16} />
                <span>Play in New Tab</span>
              </a>
            </div>
          )}
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-transform active:scale-95 bg-zinc-800/50"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-black relative flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-zinc-800 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-1 text-center font-mono">
              <p className="text-white font-bold tracking-widest text-sm uppercase">Initializing Stream</p>
              <p className="text-zinc-500 text-[10px] uppercase">Connection: {server}</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-md w-full p-10 bg-zinc-900 border border-white/5 rounded-3xl text-center shadow-2xl">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <X size={40} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-tighter">Connection Fault</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 px-4">
              {error}. Please try a different mirror or play in a new tab.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors shadow-lg"
            >
              Close Player
            </button>
          </div>
        ) : (
          <iframe
            key={server + (imdbId || movieId)}
            src={getEmbedUrl()}
            className="w-full h-full border-none bg-black"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; accelerometer; clipboard-write; gyroscope"
            referrerPolicy="origin"
            title="CineStream Pro Player"
          />
        )}
      </div>

      {!loading && !error && (
        <div className="px-6 py-4 bg-zinc-900/95 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider text-zinc-500">
            <span className="uppercase font-black text-zinc-700">Source Hash:</span>
            <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-300">
              {imdbId || `TMDB-${movieId}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[9px] text-zinc-500 uppercase font-black text-right hidden lg:block max-w-xs leading-tight">
               If it's black, **Disable AdBlock** or use "Play in New Tab".
             </div>
             <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-bold uppercase py-1.5 px-4 bg-zinc-800/50 rounded-full border border-white/5">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
              Primary Node: {server}
            </div>
          </div>
        </div>
      )}
    </div>


  );
}
