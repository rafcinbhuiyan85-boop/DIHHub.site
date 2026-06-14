import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from './tmdb';
import { MovieCard, MovieCardSkeleton } from './MovieCard';

interface MovieRowProps { title: string; movies?: Movie[]; isLoading: boolean; accent?: string; icon?: React.ReactNode; onNavigate: (path: string) => void; }

export function MovieRow({ title, movies, isLoading, accent='#F59E0B', icon, onNavigate }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left'|'right') => { if (!rowRef.current) return; rowRef.current.scrollBy({ left: dir==='left' ? -rowRef.current.clientWidth*0.75 : rowRef.current.clientWidth*0.75, behavior:'smooth' }); };
  return (
    <div style={{ padding:'4px 0 16px' }}>
      {title && (
        <div style={{ padding:'0 20px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {icon && <div style={{ width:34, height:34, borderRadius:9, background:`${accent}18`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>}
            <span style={{ fontSize:19, fontWeight:800, color:'#fff', letterSpacing:'-0.3px' }}>{title}</span>
          </div>
          <div style={{ display:'flex', gap:5 }}>
            {(['left','right'] as const).map(dir => (
              <button key={dir} onClick={() => scroll(dir)} style={{ width:30, height:30, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {dir==='left' ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:32, background:'linear-gradient(to right,#07090f,transparent)', zIndex:10, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:32, background:'linear-gradient(to left,#07090f,transparent)', zIndex:10, pointerEvents:'none' }} />
        <div ref={rowRef} style={{ display:'grid', gridAutoFlow:'column', gridAutoColumns:'clamp(120px,38vw,175px)', gap:10, overflowX:'auto', padding:'6px 20px 12px', scrollbarWidth:'none' }}>
          {isLoading ? Array.from({length:10}).map((_,i) => <MovieCardSkeleton key={i}/>) : movies?.map(m => <MovieCard key={m.id} movie={m} onNavigate={onNavigate}/>)}
        </div>
      </div>
    </div>
  );
}
