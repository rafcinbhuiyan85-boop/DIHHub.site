import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Play, ChevronLeft } from 'lucide-react';
import { useMovieDetail } from '../use-tmdb';
import { IMAGE_BASE_BACKDROP, IMAGE_BASE_POSTER } from '../tmdb';
import { MovieRow } from '../MovieRow';
import { useAppSettings } from '@/src/hooks/useAppSettings';

const ratingColor = (r: number) => r >= 8 ? '#4ade80' : r >= 6.5 ? '#F59E0B' : '#f87171';

export function MoviesDetail({ movieId, onNavigate, onBack }: { movieId: string; onNavigate: (path: string) => void; onBack: () => void }) {
  const { settings } = useAppSettings();
  const { data: movie, isLoading } = useMovieDetail(movieId);
  if (isLoading) return <div style={{ minHeight:'100vh', background:'#07090f', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(245,158,11,0.3)', borderTopColor:'#F59E0B', animation:'spin 1s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!movie) return <div style={{ minHeight:'100vh', background:'#07090f', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>Movie not found.</div>;
  const runtimeStr = movie.runtime ? `${Math.floor(movie.runtime/60)}h ${movie.runtime%60>0?`${movie.runtime%60}m`:''}` : '';
  return (
    <div style={{ minHeight:'100vh', background:'#07090f', color:'#fff' }}>
      <div className="movie-backdrop-container" style={{ position:'relative', overflow:'hidden' }}>
        {movie.backdrop_path ? <img src={`${IMAGE_BASE_BACKDROP}${movie.backdrop_path}`} alt={movie.title} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 20%' }}/> : <div style={{ width:'100%', height:'100%', background:'#111' }}/>}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#07090f 0%,rgba(7,9,15,0.5) 60%,rgba(7,9,15,0.3) 100%)' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,#07090f 0%,rgba(7,9,15,0.3) 60%,transparent 100%)' }}/>
        <button onClick={onBack} style={{ position:'absolute', top:24, left:24, display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <ChevronLeft size={16}/> Back
        </button>
      </div>
      <div className="movie-content-container" style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:10 }}>
        <div style={{ flex:1, paddingTop:16 }}>
          <h1 style={{ fontSize:'clamp(30px,6vw,68px)', fontWeight:900, letterSpacing:'-2px', lineHeight:1.05, marginBottom:10, color:'#fff' }}>{movie.title}</h1>
          {movie.tagline && <p style={{ fontSize:15, fontWeight:400, color:'#F59E0B', fontStyle:'italic', marginBottom:20 }}>"{movie.tagline}"</p>}
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', fontSize:13, fontWeight:700, color:ratingColor(movie.vote_average) }}><Star size={13} fill="currentColor"/>{movie.vote_average.toFixed(1)} / 10</div>
            {runtimeStr && <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', fontSize:13, color:'rgba(255,255,255,0.8)' }}><Clock size={13}/>{runtimeStr}</div>}
            {movie.release_date && <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', fontSize:13, color:'rgba(255,255,255,0.8)' }}><Calendar size={13}/>{movie.release_date.substring(0,4)}</div>}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
            {movie.genres?.map(g => <span key={g.id} onClick={() => settings.movieBrowseByGenreEnabled && onNavigate(`/genre/${g.id}`)} style={{ padding:'4px 14px', borderRadius:20, border:'1px solid rgba(245,158,11,0.3)', background:'rgba(245,158,11,0.07)', color:'#F59E0B', fontSize:12, fontWeight:600, cursor:settings.movieBrowseByGenreEnabled?'pointer':'default' }}>{g.name}</span>)}
          </div>
          <p style={{ fontSize:15, fontWeight:400, lineHeight:1.75, color:'rgba(255,255,255,0.75)', marginBottom:28, maxWidth:640 }}>{movie.overview}</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={() => onNavigate(`/watch/${movie.id}`)} style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 32px', borderRadius:12, background:'#F59E0B', color:'#000', border:'none', cursor:'pointer', fontSize:15, fontWeight:800, boxShadow:'0 8px 30px rgba(245,158,11,0.4)' }}><Play size={18} fill="#000"/>Watch Now</button>
          </div>
          {settings.movieShowCastSection && movie.credits?.cast && movie.credits.cast.length > 0 && (
            <div style={{ marginTop:52 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}><div style={{ width:4, height:22, borderRadius:2, background:'#a78bfa' }}/><h3 style={{ fontSize:19, fontWeight:800, color:'#fff', margin:0, fontFamily:"'Poppins', sans-serif" }}>Top Cast</h3></div>
              <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:16, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
                {movie.credits.cast.slice(0,12).map(person => (
                  <div key={person.id} onClick={() => settings.movieActorProfileEnabled && onNavigate(`/actor/${person.id}`)} style={{ flexShrink:0, width:100, textAlign:'center', cursor:settings.movieActorProfileEnabled?'pointer':'default' }}>
                    <div style={{ width:80, height:80, borderRadius:'50%', overflow:'hidden', margin:'0 auto 10px', border:'2px solid rgba(167,139,250,0.3)', background:'#1a1a2e' }}>
                      {person.profile_path ? <img src={`${IMAGE_BASE_POSTER}${person.profile_path}`} alt={person.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'rgba(255,255,255,0.3)' }}>{person.name.charAt(0)}</div>}
                    </div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2 }}>{person.name}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {settings.movieShowSimilarMovies && movie.similar?.results && movie.similar.results.length > 0 && (
        <div style={{ marginTop:48 }}><MovieRow title="More Like This" movies={movie.similar.results} isLoading={false} accent="#34d399" onNavigate={onNavigate}/></div>
      )}
      <div style={{ height:60 }}/>
      <style>{`
        .movie-backdrop-container {
          height: 35vh;
          min-height: 240px;
        }
        .movie-content-container {
          padding: 0 16px;
          margin-top: -60px !important;
        }
        @media (min-width: 640px) {
          .movie-backdrop-container {
            height: 50vh;
            min-height: 340px;
          }
          .movie-content-container {
            padding: 0 24px;
            margin-top: -140px !important;
          }
        }
        @media (min-width: 1024px) {
          .movie-backdrop-container {
            height: 65vh;
            min-height: 420px;
          }
          .movie-content-container {
            margin-top: -220px !important;
          }
        }
      `}</style>
    </div>
  );
}
