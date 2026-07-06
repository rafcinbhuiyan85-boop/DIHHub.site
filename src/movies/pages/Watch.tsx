import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Tv, List } from 'lucide-react';
import { useMovieDetail } from '../use-tmdb';

export function MoviesWatch({ movieId, onNavigate, onBack }: { movieId: string; onNavigate: (path: string) => void; onBack: () => void }) {
  const isTV = movieId.startsWith('tv-');
  const realId = isTV ? movieId.replace('tv-', '') : movieId;
  const { data: movie } = useMovieDetail(movieId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // TV specific states
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [activeServer, setActiveServer] = useState('vidsrc.pm');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const isFs = !!(document.fullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    document.addEventListener('mozfullscreenchange', onChange);
    document.addEventListener('MSFullscreenChange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      document.removeEventListener('mozfullscreenchange', onChange);
      document.removeEventListener('MSFullscreenChange', onChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  const getEmbedUrlForServer = (srv: string, isTvShow: boolean, id: string, s: number, e: number) => {
    if (srv === 'vidsrc.cc') {
      return `https://vidsrc.cc/v2/embed/${isTvShow ? 'tv' : 'movie'}/${id}${isTvShow ? `?s=${s}&e=${e}` : ''}`;
    }
    if (srv === 'vidsrc.to') {
      return `https://vidsrc.to/embed/${isTvShow ? 'tv' : 'movie'}/${id}${isTvShow ? `/${s}/${e}` : ''}`;
    }
    return `https://${srv}/embed/${isTvShow ? 'tv' : 'movie'}/${id}${isTvShow ? `/${s}/${e}` : ''}`;
  };

  const getEmbedUrl = () => {
    return getEmbedUrlForServer(activeServer, isTV, realId, season, episode);
  };

  const embedUrl = getEmbedUrl();

  useEffect(() => {
    let active = true;
    const checkAvailability = async () => {
      setIsChecking(true);
      const SERVERS = ['vidsrc.pm', 'vidsrc.to', 'vidsrc.cc', 'vidsrc.me'];
      
      let foundServer = null;
      for (const srv of SERVERS) {
        if (!active) return;
        try {
          const checkUrl = getEmbedUrlForServer(srv, isTV, realId, season, episode);
          const res = await fetch(`/api/movies/check-available?url=${encodeURIComponent(checkUrl)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.available !== false) {
              foundServer = srv;
              break;
            }
          }
        } catch (err) {
          // Ignore error and check next server
        }
      }

      if (active) {
        if (foundServer) {
          setActiveServer(foundServer);
          setIsAvailable(true);
        } else {
          setActiveServer('vidsrc.pm');
          setIsAvailable(false);
        }
        setIsChecking(false);
      }
    };

    checkAvailability();
    return () => {
      active = false;
    };
  }, [realId, season, episode, isTV]);

  // Find current season's episodes
  // Filter out season 0 (specials) usually, or include them if selected.
  const seasons = movie?.seasons ? movie.seasons.filter(s => s.season_number > 0) : [];
  const currentSeasonData = seasons.find(s => s.season_number === season) || seasons[0];
  const episodeCount = currentSeasonData?.episode_count || 20;

  return (
    <div ref={containerRef} style={{ position:'fixed', inset:0, background:'#000', display:'flex', flexDirection:'column', zIndex:9999 }}>
      {/* Top bar with controls */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', flexShrink:0, padding:'8px 16px', background:'rgba(7,9,15,0.97)', borderBottom:'1px solid rgba(245,158,11,0.12)', minHeight:48 }}>
        {!isFullscreen && (
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:7, border:'none', cursor:'pointer', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600 }}>
            <ChevronLeft size={15}/>Back
          </button>
        )}
        
        <span style={{ color:'#fff', fontWeight:700, fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
          {isTV ? <Tv size={14} style={{ color:'#F59E0B' }}/> : null}
          {movie?.title ?? ''} {isTV ? `(S${season} E${episode})` : ''}
        </span>

        {/* Season & Episode Selector for TV Shows */}
        {isTV && seasons.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.04)', padding:'4px 8px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>S:</span>
              <select 
                value={season} 
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1); // Reset to ep 1 on season change
                }}
                style={{ background:'#111', color:'#fff', border:'1px solid rgba(245,158,11,0.3)', borderRadius:6, padding:'2px 6px', fontSize:11, fontWeight:700, outline:'none', cursor:'pointer' }}
              >
                {seasons.map(s => (
                  <option key={s.season_number} value={s.season_number}>
                    {s.name || `Season ${s.season_number}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>EP:</span>
              <select 
                value={episode} 
                onChange={(e) => setEpisode(Number(e.target.value))}
                style={{ background:'#111', color:'#fff', border:'1px solid rgba(245,158,11,0.3)', borderRadius:6, padding:'2px 6px', fontSize:11, fontWeight:700, outline:'none', cursor:'pointer' }}
              >
                {Array.from({ length: episodeCount }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Episode {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Fullscreen button for DIH watermark mode */}
        <button 
          onClick={toggleFullscreen} 
          style={{ 
            display:'flex', 
            alignItems:'center', 
            gap:6, 
            padding:'6px 12px', 
            borderRadius:7, 
            background:'rgba(245,158,11,0.15)', 
            border:'1px solid rgba(245,158,11,0.3)', 
            fontSize:11, 
            fontWeight:700, 
            color:'#fff', 
            cursor:'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (DIH Mode)'}
        </button>
      </div>

      {/* Embedded Iframe */}
      <div style={{ flex:1, position:'relative', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {isChecking ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, color:'rgba(255,255,255,0.7)', fontFamily:'sans-serif' }}>
            <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin" />
            <span style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>Connecting Stream...</span>
          </div>
        ) : !isAvailable ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center', gap:12 }}>
            <span style={{ color:'#ef4444', fontSize:18, fontWeight:800, fontFamily:'sans-serif', letterSpacing:'1px' }}>
              404 CONTENT NOT FOUND / DIH MOVIE
            </span>
            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontFamily:'sans-serif', maxWidth:400 }}>
              This movie/show is currently unavailable on this server. Please try switching the Server or check other titles.
            </span>
          </div>
        ) : (
          <iframe 
            key={`${activeServer}-${season}-${episode}-${realId}`}
            src={getEmbedUrl()} 
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} 
            allow="autoplay; encrypted-media; picture-in-picture; accelerometer; clipboard-write; gyroscope; fullscreen" 
            allowFullScreen
            title={movie?.title ?? 'Player'} 
            referrerPolicy="no-referrer"
          />
        )}
        <div style={{ 
          position:'absolute', 
          top:0, 
          right:0, 
          width:130, 
          height:40, 
          background:'#000000', 
          zIndex:2147483647, 
          pointerEvents:'none', 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'flex-end', 
          paddingRight:12 
        }}>
          <span style={{ fontSize:10, fontWeight:900, color:'#ffffff', fontFamily:'sans-serif', letterSpacing:'0.5px' }}>
            DIH <span style={{ color:'#F59E0B' }}>MOVIE</span>
          </span>
        </div>
      </div>
    </div>
  );
}
