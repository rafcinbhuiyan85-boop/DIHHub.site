import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Info, Star, Flame, Clock, Rocket, Sword, Ghost, Laugh, Tv, Sparkles, Film, Heart, Cat } from 'lucide-react';
import { 
  useTrendingMovies, 
  usePopularMovies, 
  useTopRatedMovies, 
  useNowPlaying, 
  useUpcoming, 
  useDiscoverByGenre,
  useTrendingTV,
  usePopularTV,
  useTopRatedTV,
  useDiscoverAnimationSeries,
  useDiscoverAnimeTrending,
  useDiscoverKidsAnimation
} from '../use-tmdb';
import { MovieRow } from '../MovieRow';
import { IMAGE_BASE_BACKDROP } from '../tmdb';
import { useAppSettings } from '@/src/hooks/useAppSettings';

const GENRE = { ACTION:'28', SCIFI:'878', THRILLER:'53', COMEDY:'35', ANIMATION:'16' };
const TV_GENRE = { DRAMA: '18', SCI_FI_FANTASY: '10765', COMEDY: '35' };

export function MoviesHome({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { settings } = useAppSettings();
  const [sector, setSector] = useState<'movie' | 'tv' | 'anime'>(() => {
    const saved = localStorage.getItem('dih_movies_sector');
    if (saved === 'movie' || saved === 'tv' || saved === 'anime') {
      return saved as 'movie' | 'tv' | 'anime';
    }
    return 'movie';
  });

  useEffect(() => {
    const handleSectorChanged = () => {
      const saved = localStorage.getItem('dih_movies_sector');
      if (saved === 'movie' || saved === 'tv' || saved === 'anime') {
        setSector(saved as 'movie' | 'tv' | 'anime');
      }
    };
    window.addEventListener('dih-movies-sector-changed', handleSectorChanged);
    return () => {
      window.removeEventListener('dih-movies-sector-changed', handleSectorChanged);
    };
  }, []);

  const changeSector = (newSector: 'movie' | 'tv' | 'anime') => {
    setSector(newSector);
    localStorage.setItem('dih_movies_sector', newSector);
    setHeroIndex(0);
  };

  const [heroIndex, setHeroIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Movie Queries
  const { data: trending, isLoading: l1 } = useTrendingMovies();
  const { data: popular, isLoading: l2 } = usePopularMovies();
  const { data: topRated, isLoading: l3 } = useTopRatedMovies();
  const { data: nowPlaying, isLoading: l4 } = useNowPlaying();
  const { data: upcoming, isLoading: l5 } = useUpcoming();
  const { data: action, isLoading: l6 } = useDiscoverByGenre(GENRE.ACTION);
  const { data: scifi, isLoading: l7 } = useDiscoverByGenre(GENRE.SCIFI);
  const { data: thriller, isLoading: l8 } = useDiscoverByGenre(GENRE.THRILLER);
  const { data: comedy, isLoading: l9 } = useDiscoverByGenre(GENRE.COMEDY);
  const { data: animation, isLoading: l10 } = useDiscoverByGenre(GENRE.ANIMATION);

  // TV Queries
  const { data: trendingTV, isLoading: lt1 } = useTrendingTV();
  const { data: popularTV, isLoading: lt2 } = usePopularTV();
  const { data: topRatedTV, isLoading: lt3 } = useTopRatedTV();
  const { data: tvDrama, isLoading: lt4 } = useDiscoverByGenre(TV_GENRE.DRAMA, true);
  const { data: tvSciFi, isLoading: lt5 } = useDiscoverByGenre(TV_GENRE.SCI_FI_FANTASY, true);

  // Animation / Anime Queries
  const { data: animatedSeries, isLoading: la1 } = useDiscoverAnimationSeries();
  const { data: animeTrending, isLoading: la2 } = useDiscoverAnimeTrending();
  const { data: kidsAnimation, isLoading: la3 } = useDiscoverKidsAnimation();

  // Determine hero items based on active sector
  let heroMovies = [];
  if (sector === 'movie') {
    heroMovies = trending?.results?.slice(0, settings.movieHeroSlidesCount || 5) ?? [];
  } else if (sector === 'tv') {
    heroMovies = trendingTV?.results?.slice(0, 5) ?? [];
  } else if (sector === 'anime') {
    heroMovies = animeTrending?.results?.slice(0, 5) ?? [];
  }

  const featured = heroMovies[heroIndex];

  useEffect(() => {
    if (!settings.movieAutoRotateHero || paused || heroMovies.length === 0) return;
    const t = setInterval(() => setHeroIndex(i => (i+1) % heroMovies.length), settings.movieAutoRotateInterval || 7000);
    return () => clearInterval(t);
  }, [paused, heroMovies.length, settings.movieAutoRotateHero, settings.movieAutoRotateInterval, sector]);

  // Specific Sector lists
  const movieRows = [
    { id:'trending', title:'Weekly Trending Movies', icon:<Flame size={18} color="#fbbf24"/>, movies:trending?.results, loading:l1, accent:'#fbbf24', visible: settings.movieShowWeeklyTrending },
    { id:'now', title:'Now Playing in Cinema', icon:<Tv size={18} color="#34d399"/>, movies:nowPlaying?.results, loading:l4, accent:'#34d399', visible: settings.movieShowNowPlaying },
    { id:'popular', title:'Popular Blockbusters', icon:<Flame size={18} color="#f87171"/>, movies:popular?.results, loading:l2, accent:'#f87171', visible: settings.movieShowPopular },
    { id:'upcoming', title:'Coming Soon', icon:<Clock size={18} color="#a78bfa"/>, movies:upcoming?.results?.filter(m => m.release_date > new Date().toISOString().split('T')[0]).sort((a,b) => a.release_date.localeCompare(b.release_date)), loading:l5, accent:'#a78bfa', visible: settings.movieShowComingSoon },
  ];

  const tvRows = [
    { id:'tv-trending', title:'Weekly Trending Shows', icon:<Flame size={18} color="#fbbf24"/>, movies:trendingTV?.results, loading:lt1, accent:'#fbbf24', visible: true },
    { id:'tv-popular', title:'Popular Drama & TV Series', icon:<Tv size={18} color="#34d399"/>, movies:popularTV?.results, loading:lt2, accent:'#34d399', visible: true },
    { id:'tv-toprated', title:'All-Time Masterpieces', icon:<Star size={18} color="#fbbf24" fill="#fbbf24"/>, movies:topRatedTV?.results, loading:lt3, accent:'#fbbf24', visible: true },
    { id:'tv-drama', title:'Dramas & Relationships', icon:<Heart size={18} color="#ec4899"/>, movies:tvDrama?.results, loading:lt4, accent:'#ec4899', visible: true },
    { id:'tv-scifi', title:'Sci-Fi & Fantasy Series', icon:<Rocket size={18} color="#3b82f6"/>, movies:tvSciFi?.results, loading:lt5, accent:'#3b82f6', visible: true }
  ];

  const animeRows = [
    { id:'anime-trending', title:'Weekly Trending Anime & Animations', icon:<Flame size={18} color="#f97316"/>, movies:animeTrending?.results, loading:la2, accent:'#f97316', visible: true },
    { id:'anime-popular', title:'Popular Animated Series', icon:<Tv size={18} color="#10b981"/>, movies:animatedSeries?.results, loading:la1, accent:'#10b981', visible: true },
    { id:'anime-kids', title:'Kids & Fun Cartoons', icon:<Sparkles size={18} color="#a855f7"/>, movies:kidsAnimation?.results, loading:la3, accent:'#a855f7', visible: true }
  ];

  const activeRows = sector === 'movie' ? movieRows : sector === 'tv' ? tvRows : animeRows;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  ];

  const sectorIDForWatch = (mv: any) => {
    return mv.media_type === 'tv' ? `tv-${mv.id}` : mv.id;
  };

  return (
    <div style={{ minHeight:'100vh', background:'#07090f', color:'#fff', paddingBottom:60 }}>
      
      <section style={{ position:'relative', overflow:'hidden', minHeight:'75vh' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <AnimatePresence mode="sync">
          {featured?.backdrop_path && (
            <motion.img key={`bg-${featured.id}`} src={`${IMAGE_BASE_BACKDROP}${featured.backdrop_path}`} alt={featured.title}
              initial={{ opacity:0, scale:1.15 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:1.5, ease:[0.33, 1, 0.68, 1] }}
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
          )}
        </AnimatePresence>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#07090f 0%,rgba(7,9,15,0.7) 45%,rgba(7,9,15,0.2) 100%)', zIndex:1 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,#07090f 0%,rgba(7,9,15,0.5) 45%,transparent 100%)', zIndex:1 }} />
        <div className="hero-content-container" style={{ position:'absolute', inset:0, zIndex:2, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <AnimatePresence mode="wait">
            {featured && (
              <motion.div key={`content-${featured.id}`} initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} transition={{ duration:0.8, ease:[0.22,1,0.36,1] }} style={{ maxWidth:680 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  {settings.movieShowTrendingBadge && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 13px', borderRadius:20, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.4)', fontSize:10, fontWeight:800, color:'#F59E0B', letterSpacing:2 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#F59E0B', boxShadow:'0 0 8px #F59E0B', display:'inline-block' }} />#{heroIndex+1} TRENDING {sector.toUpperCase()}
                    </div>
                  )}
                  {settings.movieShowHeroScore && (
                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:700, color:'#fff' }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B"/>{featured.vote_average ? featured.vote_average.toFixed(1) : '7.8'}<span style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>/10</span>
                    </div>
                  )}
                </div>
                <h1 style={{ fontSize:'clamp(28px,5vw,60px)', fontWeight:900, lineHeight:0.95, letterSpacing:'-2px', marginBottom:18, color:'#fff', textShadow:'0 4px 48px rgba(0,0,0,0.8)' }}>{featured.title}</h1>
                {settings.movieShowHeroDescription && <p style={{ fontSize:15, fontWeight:400, lineHeight:1.7, color:'rgba(255,255,255,0.7)', marginBottom:36, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden', maxWidth:580 }}>{featured.overview}</p>}
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                  <button onClick={() => onNavigate(`/watch/${sectorIDForWatch(featured)}`)} style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 34px', borderRadius:12, background:'#F59E0B', color:'#000', border:'none', cursor:'pointer', fontSize:15, fontWeight:800, boxShadow:'0 8px 32px rgba(245,158,11,0.4)' }}>
                    <Play size={18} fill="#000"/> Watch Now
                  </button>
                  {settings.movieShowHeroDetailsButton && (
                    <button onClick={() => onNavigate(`/movie/${sectorIDForWatch(featured)}`)} style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 28px', borderRadius:12, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', backdropFilter:'blur(10px)', cursor:'pointer', fontSize:15, fontWeight:700 }}>
                      <Info size={18}/> Details
                    </button>
                  )}
                </div>
                {heroMovies.length > 1 && (
                  <div style={{ display:'flex', gap:8, marginTop:48 }}>
                    {heroMovies.map((_,i) => <button key={i} onClick={() => setHeroIndex(i)} style={{ border:'none', cursor:'pointer', padding:0, height:4, borderRadius:2, width:i===heroIndex?40:20, background:i===heroIndex?'#F59E0B':'rgba(255,255,255,0.2)', transition:'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}/>)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div style={{ padding:'0 24px', marginTop:-40, position:'relative', zIndex:3 }}>
        
        {sector === 'movie' && settings.movieShowLanguageSection && (
          <div style={{ marginBottom:48 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:4, height:24, background:'#F59E0B', borderRadius:2 }} />
              <h2 style={{ fontSize:19, fontWeight:800, letterSpacing:'-0.5px' }}>Browse Movies by <span style={{ color:'#F59E0B' }}>Language</span></h2>
            </div>
            <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
              {languages.map(lang => (
                <button key={lang.code} onClick={() => onNavigate(`/search?with_original_language=${lang.code}`)} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'24px 32px', borderRadius:20, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', color:'#fff', cursor:'pointer', transition:'all 0.3s ease', minWidth:120 }}>
                  <span style={{ fontSize:32 }}>{lang.flag}</span>
                  <span style={{ fontSize:14, fontWeight:700 }}>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Display Rows based on active sector */}
        {activeRows.map(row => row.visible && (
          <div key={row.id} style={{ marginBottom:40 }}>
            <MovieRow title={row.title} icon={row.icon} movies={row.movies} isLoading={row.loading} accent={row.accent} onNavigate={onNavigate}/>
          </div>
        ))}

        {sector === 'movie' && settings.movieShowGenreRows && (
          <div style={{ marginTop:40 }}>
             {[
               { id:'action', title:'Action & Adventure Movies', icon:<Sword size={18} color="#fb923c"/>, movies:action?.results, loading:l6, accent:'#fb923c' },
               { id:'scifi', title:'Sci-Fi & Fantasy Movies', icon:<Rocket size={18} color="#60a5fa"/>, movies:scifi?.results, loading:l7, accent:'#60a5fa' },
               { id:'thriller', title:'Thriller & Mystery Movies', icon:<Ghost size={18} color="#e879f9"/>, movies:thriller?.results, loading:l8, accent:'#e879f9' },
               { id:'comedy', title:'Comedy Movies', icon:<Laugh size={18} color="#facc15"/>, movies:comedy?.results, loading:l9, accent:'#facc15' },
               { id:'animation', title:'Animated Movies', icon:<Star size={18} color="#2dd4bf"/>, movies:animation?.results, loading:l10, accent:'#2dd4bf' },
             ].map(row => (
               <div key={row.id} style={{ marginBottom:40 }}>
                 <MovieRow title={row.title} icon={row.icon} movies={row.movies} isLoading={row.loading} accent={row.accent} onNavigate={onNavigate}/>
               </div>
             ))}
          </div>
        )}

        {sector === 'movie' && settings.movieShowTopRated && (
           <div style={{ marginBottom:40 }}>
              <MovieRow title="All-Time Greatest Movies" icon={<Star size={18} color="#fbbf24" fill="#fbbf24"/>} movies={topRated?.results} isLoading={l3} accent="#fbbf24" onNavigate={onNavigate}/>
           </div>
        )}
      </div>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .hero-content-container {
          padding: 0 16px 36px;
        }
        @media (min-width: 640px) {
          .hero-content-container {
            padding: 0 24px 60px;
          }
        }
        @media (min-width: 1024px) {
          .hero-content-container {
            padding: 0 32px 80px;
          }
        }
      `}</style>
    </div>
  );
}
