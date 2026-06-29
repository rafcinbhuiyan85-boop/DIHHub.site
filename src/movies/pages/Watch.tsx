import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Zap, Minimize2, Tv, List } from 'lucide-react';
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
  const [server, setServer] = useState('vidsrc.pm');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  const getEmbedUrl = () => {
    if (isTV) {
      if (server === 'vidsrc.to') {
        return `https://vidsrc.to/embed/tv/${realId}/${season}/${episode}`;
      }
      if (server === 'vidsrc.cc') {
        return `https://vidsrc.cc/v2/embed/tv/${realId}?s=${season}&e=${episode}`;
      }
      return `https://${server}/embed/tv/${realId}/${season}/${episode}`;
    }
    return `https://${server}/embed/movie/${realId}`;
  };

  const embedUrl = getEmbedUrl();

  useEffect(() => {
    let active = true;
    const checkAvailability = async () => {
      setIsChecking(true);
      try {
        const checkUrl = `/api/movies/check-available?url=${encodeURIComponent(embedUrl)}`;
        const res = await fetch(checkUrl);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setIsAvailable(data.available !== false);
          }
        } else {
          if (active) setIsAvailable(true);
        }
      } catch (err) {
        if (active) setIsAvailable(true); // default to true on error so we don't block
      } finally {
        if (active) setIsChecking(false);
      }
    };

    checkAvailability();
    return () => {
      active = false;
    };
  }, [embedUrl]);

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

        {/* Server Selector hidden completely per request */}

        <button onClick={toggleFullscreen} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:20, background:'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(245,158,11,0.07))', border:'1px solid rgba(245,158,11,0.35)', fontSize:12, fontWeight:800, color:'#F59E0B', cursor:'pointer' }}>
          {isFullscreen ? <><Minimize2 size={12}/>Exit Fullscreen</> : <><Zap size={11} fill="#F59E0B"/>Ultra Server</>}
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
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
            <span style={{ color:'#ffffff', fontSize:15, fontWeight:600, letterSpacing:'0.2px', fontFamily:'sans-serif' }}>
              This media is unavailable at the moment.
            </span>
          </div>
        ) : (
          <iframe 
            key={`${server}-${season}-${episode}-${realId}`}
            src={getEmbedUrl()} 
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} 
            allow="autoplay; picture-in-picture; encrypted-media" 
            title={movie?.title ?? 'Player'} 
            referrerPolicy="no-referrer"
          />
        )}
        <div style={{ position:'absolute', top:8, right:0, width:110, height:34, background:'#000', zIndex:30, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12 }}>
          <span style={{ fontSize:10, fontWeight:900, color:'rgba(255,255,255,0.85)' }}>DIH <span style={{ color:'#e5173f' }}>HUB</span></span>
        </div>
      </div>
    </div>
  );
}
