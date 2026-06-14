import React, { useState } from 'react';
import { Play, Star } from 'lucide-react';
import { Movie, IMAGE_BASE_POSTER } from './tmdb';

interface MovieCardProps { movie: Movie; onNavigate: (path: string) => void; key?: React.Key; }
const ratingColor = (r: number) => r >= 8 ? '#4ade80' : r >= 6.5 ? '#F59E0B' : '#f87171';

export function MovieCard({ movie, onNavigate }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(`/movie/${movie.media_type === 'tv' ? 'tv-' + movie.id : movie.id}`)}
      style={{
        position:'relative', width:'100%', cursor:'pointer', borderRadius:12,
        overflow:'hidden', background:'#111',
        transform: hovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
        transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.7), 0 0 0 2px rgba(245,158,11,0.5)' : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ aspectRatio:'2/3', position:'relative', overflow:'hidden' }}>
        {movie.poster_path ? (
          <img src={`${IMAGE_BASE_POSTER}${movie.poster_path}`} alt={movie.title} loading="lazy"
            style={{ width:'100%', height:'100%', objectFit:'cover', transform: hovered?'scale(1.08)':'scale(1)', transition:'transform 0.5s ease' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', background:'#1a1a2e', display:'flex', alignItems:'center', justifyContent:'center', padding:16, textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:12 }}>{movie.title}</div>
        )}
        <div style={{ position:'absolute', top:8, left:8, display:'flex', alignItems:'center', gap:3, padding:'3px 7px', borderRadius:6, background:'rgba(0,0,0,0.75)', fontSize:11, fontWeight:800, color:ratingColor(movie.vote_average) }}>
          <Star size={10} fill="currentColor" />{movie.vote_average.toFixed(1)}
        </div>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.3) 60%,transparent 100%)', opacity:hovered?1:0, transition:'opacity 0.3s ease', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'12px 10px' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:hovered?'translate(-50%,-50%) scale(1)':'translate(-50%,-50%) scale(0.7)', transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', width:48, height:48, borderRadius:'50%', background:'rgba(245,158,11,0.95)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px rgba(245,158,11,0.6)' }}>
            <Play size={20} fill="#000" color="#000" />
          </div>
          <h3 style={{ color:'#fff', fontWeight:700, fontSize:13, lineHeight:1.3, marginBottom:4 }}>{movie.title}</h3>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>{movie.release_date?.substring(0,4)}</span>
        </div>
      </div>
    </div>
  );
}
export function MovieCardSkeleton() {
  return <div style={{ borderRadius:12, overflow:'hidden' }}><div style={{ width:'100%', aspectRatio:'2/3', background:'rgba(255,255,255,0.08)', animation:'pulse 1.5s infinite' }} /></div>;
}
