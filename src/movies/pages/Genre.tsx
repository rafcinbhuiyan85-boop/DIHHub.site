import { useDiscoverByGenre, useGenres } from '../use-tmdb';
import { MovieCard, MovieCardSkeleton } from '../MovieCard';
import { ChevronLeft } from 'lucide-react';

export function MoviesGenre({ genreId, onNavigate, onBack }: { genreId: string; onNavigate: (path: string) => void; onBack: () => void }) {
  const sector = localStorage.getItem('dih_movies_sector') || 'movie';
  const isTV = sector === 'tv' || sector === 'anime' || genreId === '10759';
  const { data: genreData } = useGenres();
  const { data: movies, isLoading } = useDiscoverByGenre(genreId, isTV);
  
  let genreName = genreData?.genres.find(g => g.id.toString() === genreId)?.name;
  if (!genreName) {
    if (genreId === '10759') genreName = 'Action & Adventure';
    else if (genreId === '16') genreName = 'Animation';
    else if (genreId === '16,10759') genreName = 'Action Animation';
    else genreName = 'Genre';
  }

  const labelSuffix = sector === 'tv' ? 'TV Shows' : sector === 'anime' ? 'Animation' : 'Movies';

  return (
    <div style={{ minHeight:'100vh', background:'#07090f', color:'#fff', paddingTop:60, paddingBottom:60 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:600, cursor:'pointer', padding:0 }}><ChevronLeft size={16}/> Back</button>
        <h1 style={{ fontSize:'clamp(30px,6vw,68px)', fontWeight:900, letterSpacing:'-2px', color:'#fff', marginBottom:32 }}>{genreName} <span style={{ color:'#F59E0B' }}>{labelSuffix}</span></h1>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:16 }}>
          {isLoading ? Array.from({length:18}).map((_,i) => <MovieCardSkeleton key={i}/>) : movies?.results.map(m => <MovieCard key={m.id} movie={m} onNavigate={onNavigate}/>)}
        </div>
      </div>
    </div>
  );
}
