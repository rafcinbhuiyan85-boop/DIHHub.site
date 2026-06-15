import { useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MoviesHome } from './pages/Home';
import { MoviesDetail } from './pages/MovieDetail';
import { MoviesSearch } from './pages/Search';
import { MoviesGenre } from './pages/Genre';
import { MoviesWatch } from './pages/Watch';
import { MoviesActor } from './pages/Actor';
import { MoviesNavbar } from './Navbar';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 3*60*1000, retry: 1 } }
});

type Route =
  | { page: 'home' }
  | { page: 'detail'; id: string }
  | { page: 'search'; params?: Record<string, string> }
  | { page: 'genre'; id: string }
  | { page: 'watch'; id: string }
  | { page: 'actor'; id: string };

function parseRoute(path: string): Route {
  const url = new URL(path, 'http://localhost');
  const pathname = url.pathname;
  const searchParams = Object.fromEntries(url.searchParams.entries());

  if (pathname.startsWith('/movie/')) return { page:'detail', id:pathname.replace('/movie/','') };
  if (pathname.startsWith('/watch/')) return { page:'watch', id:pathname.replace('/watch/','') };
  if (pathname.startsWith('/genre/')) return { page:'genre', id:pathname.replace('/genre/','') };
  if (pathname.startsWith('/actor/')) return { page:'actor', id:pathname.replace('/actor/','') };
  if (pathname === '/search') return { page:'search', params: searchParams };
  return { page:'home' };
}

function DihMoviesInner() {
  const [history, setHistory] = useState<string[]>(['/']);
  const currentPath = history[history.length - 1];
  const route = parseRoute(currentPath);

  useEffect(() => {
    const handleSectorChanged = () => {
      setHistory(['/']);
    };
    window.addEventListener('dih-movies-sector-changed', handleSectorChanged);
    return () => {
      window.removeEventListener('dih-movies-sector-changed', handleSectorChanged);
    };
  }, []);
  
  const onNavigate = useCallback((path: string) => {
    if (path === history[history.length - 1]) return;
    setHistory(prev => [...prev, path]);
  }, [history]);

  const onBack = useCallback(() => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : ['/']);
  }, []);

  const isWatch = route.page === 'watch';

  return (
    <div style={{ minHeight:'100vh', background:'#07090f', color:'#fff', fontFamily:"'Poppins', sans-serif" }}>
      {!isWatch && <MoviesNavbar currentPath={currentPath} onNavigate={onNavigate}/>}

      {route.page === 'home'   && <MoviesHome onNavigate={onNavigate}/>}
      {route.page === 'detail' && <MoviesDetail movieId={route.id} onNavigate={onNavigate} onBack={onBack}/>}
      {route.page === 'search' && <MoviesSearch onNavigate={onNavigate} initialParams={route.params}/>}
      {route.page === 'genre'  && <MoviesGenre genreId={route.id} onNavigate={onNavigate} onBack={onBack}/>}
      {route.page === 'watch'  && <MoviesWatch movieId={route.id} onNavigate={onNavigate} onBack={onBack}/>}
      {route.page === 'actor'  && <MoviesActor personId={route.id} onNavigate={onNavigate} onBack={onBack}/>}

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

export default function DihMoviesApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <DihMoviesInner/>
    </QueryClientProvider>
  );
}
