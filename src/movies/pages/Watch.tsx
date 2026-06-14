import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Zap, Minimize2 } from 'lucide-react';
import { useMovieDetail } from '../use-tmdb';

export function MoviesWatch({ movieId, onNavigate, onBack }: { movieId: string; onNavigate: (path: string) => void; onBack: () => void }) {
  const { data: movie } = useMovieDetail(movieId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  return (
    <div ref={containerRef} style={{ position:'fixed', inset:0, background:'#000', display:'flex', flexDirection:'column', zIndex:9999 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, height:48, padding:'0 12px', background:'rgba(7,9,15,0.97)', borderBottom:'1px solid rgba(245,158,11,0.12)' }}>
        {!isFullscreen && <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:7, border:'none', cursor:'pointer', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600 }}><ChevronLeft size={15}/>Back</button>}
        <span style={{ color:'#fff', fontWeight:700, fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{movie?.title ?? ''}</span>
        <button onClick={toggleFullscreen} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:20, background:'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(245,158,11,0.07))', border:'1px solid rgba(245,158,11,0.35)', fontSize:12, fontWeight:800, color:'#F59E0B', cursor:'pointer' }}>
          {isFullscreen ? <><Minimize2 size={12}/>Exit Fullscreen</> : <><Zap size={11} fill="#F59E0B"/>Ultra Server</>}
        </button>
      </div>
      <div style={{ flex:1, position:'relative', background:'#000' }}>
        <iframe src={`https://vidsrc.pm/embed/movie/${movieId}`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} allow="autoplay; picture-in-picture; encrypted-media" title={movie?.title ?? 'Movie'} referrerPolicy="no-referrer"/>
        <div style={{ position:'absolute', top:8, right:0, width:100, height:34, background:'#000', zIndex:30, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12 }}>
          <span style={{ fontSize:10, fontWeight:900, color:'rgba(255,255,255,0.85)' }}>DIH <span style={{ color:'#F59E0B' }}>MOVIE</span></span>
        </div>
      </div>
    </div>
  );
}
