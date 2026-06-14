import { ChevronLeft, Calendar, MapPin, User } from 'lucide-react';
import { usePersonMovies, usePersonDetail } from '../use-tmdb';
import { MovieCard, MovieCardSkeleton } from '../MovieCard';
import { IMAGE_BASE_POSTER } from '../tmdb';

export function MoviesActor({ personId, onNavigate, onBack }: { personId: string; onNavigate: (path: string) => void; onBack: () => void }) {
  const { data: person } = usePersonDetail(personId);
  const { data: credits, isLoading: loadingMovies } = usePersonMovies(personId);
  const movies = credits?.cast?.filter(m => m.poster_path).sort((a,b) => b.vote_average - a.vote_average) ?? [];
  return (
    <div style={{ minHeight:'100vh', background:'#07090f', color:'#fff', paddingTop:60 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, marginBottom:32, marginTop:16, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600, cursor:'pointer' }}><ChevronLeft size={16}/>Back</button>
        <div style={{ display:'flex', gap:32, alignItems:'flex-start', marginBottom:52, flexWrap:'wrap' }}>
          <div style={{ flexShrink:0, width:160, height:160, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(245,158,11,0.4)', background:'#1a1a2e' }}>
            {person?.profile_path ? <img src={`${IMAGE_BASE_POSTER}${person.profile_path}`} alt={person.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={48} color="rgba(255,255,255,0.2)"/></div>}
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <h1 style={{ fontSize:'clamp(26px,5vw,52px)', fontWeight:900, letterSpacing:'-1.5px', color:'#fff', marginBottom:12 }}>{person?.name}</h1>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:16 }}>
              {person?.birthday && <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.55)' }}><Calendar size={13}/>{person.birthday}</div>}
              {person?.place_of_birth && <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.55)' }}><MapPin size={13}/>{person.place_of_birth}</div>}
            </div>
            {person?.biography && <p style={{ fontSize:15, fontWeight:400, lineHeight:1.75, color:'rgba(255,255,255,0.6)', maxWidth:640, display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{person.biography}</p>}
          </div>
        </div>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}><div style={{ width:4, height:24, borderRadius:2, background:'#F59E0B' }}/><h2 style={{ fontSize:19, fontWeight:800, color:'#fff', margin:0 }}>{loadingMovies?'Loading…':`${movies.length} Movies`}</h2></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:16 }}>
            {loadingMovies ? Array.from({length:12}).map((_,i) => <MovieCardSkeleton key={i}/>) : movies.map(m => <MovieCard key={m.id} movie={m} onNavigate={onNavigate}/>)}
          </div>
        </div>
        <div style={{ height:60 }}/>
      </div>
    </div>
  );
}
