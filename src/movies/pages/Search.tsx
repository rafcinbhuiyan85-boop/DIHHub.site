import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Globe } from 'lucide-react';
import { MovieCard, MovieCardSkeleton } from '../MovieCard';
import { useSearchMovies, useGenres, useDiscoverByLanguage } from '../use-tmdb';
import { useDebounce } from '../use-debounce';

export function MoviesSearch({ onNavigate, initialParams }: { onNavigate: (path: string) => void; initialParams?: Record<string, string> }) {
  const [query, setQuery] = useState('');
  const [searchTV, setSearchTV] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const { data: genres } = useGenres();
  
  const langFilter = initialParams?.with_original_language;
  const { data: searchResults, isLoading: searching } = useSearchMovies(debouncedQuery, searchTV);
  const { data: languageResults, isLoading: loadingLang } = useDiscoverByLanguage(langFilter || '');

  const results = debouncedQuery ? searchResults : (langFilter ? languageResults : null);
  const isLoading = searching || loadingLang;

  const languages = { en: 'English', hi: 'Hindi', bn: 'Bengali', es: 'Spanish', fr: 'French', ja: 'Japanese', ko: 'Korean' };
  const currentLangName = langFilter ? (languages[langFilter as keyof typeof languages] || langFilter) : '';

  return (
    <div style={{ minHeight:'100vh', background:'#07090f', color:'#fff', paddingTop:80, paddingBottom:60 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h1 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:900, letterSpacing:'-1px', color:'#fff', marginBottom:8 }}>Find Your Next <span style={{ color:'#F59E0B' }}>Favorites</span></h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Search from thousands of movies, TV shows, anime, and characters</p>
        </div>
        <div style={{ position:'relative', maxWidth:680, margin:'0 auto 20px' }}>
          <SearchIcon style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)', pointerEvents:'none' }} size={20}/>
          <input type="text" placeholder={searchTV ? "Search TV shows, series, animation…" : "Search movies, films, anime…"} value={query} onChange={e => setQuery(e.target.value)} autoFocus style={{ width:'100%', padding:'18px 48px 18px 56px', borderRadius:16, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'#fff', fontSize:17, outline:'none', boxSizing:'border-box', backdropFilter:'blur(20px)', transition:'all 0.3s ease', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}/>
          {query && <button onClick={() => setQuery('')} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.8)' }}><X size={15}/></button>}
        </div>

        {/* Toggle between Movies and TV Series search */}
        <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:40 }}>
          <button 
            onClick={() => setSearchTV(false)}
            style={{
              padding: '8px 20px',
              borderRadius: 24,
              border: '1px solid',
              borderColor: !searchTV ? '#F59E0B' : 'rgba(255,255,255,0.06)',
              background: !searchTV ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
              color: !searchTV ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.5,
              transition: 'all 0.3s ease'
            }}
          >
            🎥 SEARCH MOVIES
          </button>
          <button 
            onClick={() => setSearchTV(true)}
            style={{
              padding: '8px 20px',
              borderRadius: 24,
              border: '1px solid',
              borderColor: searchTV ? '#F59E0B' : 'rgba(255,255,255,0.06)',
              background: searchTV ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
              color: searchTV ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.5,
              transition: 'all 0.3s ease'
            }}
          >
            📺 SEARCH TV SHOWS
          </button>
        </div>

        {langFilter && !debouncedQuery && (
          <div style={{ marginBottom:40, textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 24px', borderRadius:24, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', color:'#F59E0B', fontWeight:700 }}>
              <Globe size={18}/> {currentLangName} Movies
              <button onClick={() => onNavigate('/search')} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', padding:0, display:'flex', marginLeft:6 }}><X size={16}/></button>
            </div>
          </div>
        )}

        {!debouncedQuery && !langFilter && genres && (
          <div style={{ marginBottom:48 }}>
            <h2 style={{ fontSize:13, fontWeight:800, color:'rgba(255,255,255,0.3)', letterSpacing:3, textTransform:'uppercase', marginBottom:20, textAlign:'center' }}>Browse by Genre</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center' }}>
              {genres.genres.map(g => <button key={g.id} onClick={() => onNavigate(`/genre/${g.id}`)} style={{ padding:'10px 22px', borderRadius:24, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.3s ease' }}>{g.name}</button>)}
            </div>
          </div>
        )}

        {(debouncedQuery || langFilter) && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
              <div style={{ width:4, height:24, borderRadius:2, background:'#F59E0B' }}/>
              <h2 style={{ fontSize:19, fontWeight:800, color:'#fff', margin:0, letterSpacing:'-0.5px' }}>
                {debouncedQuery ? <>Results for <span style={{ color:'#F59E0B' }}>"{debouncedQuery}"</span></> : <><span style={{ color:'#F59E0B' }}>{currentLangName}</span> Movies</>}
              </h2>
              {results && !isLoading && <span style={{ fontSize:14, color:'rgba(255,255,255,0.3)', marginLeft:'auto' }}>{results.results.length} results</span>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:20 }}>
              {isLoading ? Array.from({length:12}).map((_,i) => <MovieCardSkeleton key={i}/>) : results?.results.length === 0 ? <div style={{ gridColumn:'1/-1', padding:'100px 0', textAlign:'center', color:'rgba(255,255,255,0.2)' }}>No results found</div> : results?.results.map(m => <MovieCard key={m.id} movie={m} onNavigate={onNavigate}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
