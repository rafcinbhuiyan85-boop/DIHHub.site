import { useState, useEffect } from 'react';
import { Search, Clapperboard, Home, Flame } from 'lucide-react';
import { useAppSettings } from '@/src/hooks/useAppSettings';

export function MoviesNavbar({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const { settings } = useAppSettings();
  const [scrolled, setScrolled] = useState(false);
  const [sector, setSector] = useState<'movie' | 'tv' | 'anime'>(() => {
    const saved = localStorage.getItem('dih_movies_sector');
    return (saved === 'movie' || saved === 'tv' || saved === 'anime') ? (saved as any) : 'movie';
  });
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleSectorChanged = () => {
      const saved = localStorage.getItem('dih_movies_sector');
      if (saved === 'movie' || saved === 'tv' || saved === 'anime') {
        setSector(saved as any);
      }
    };
    window.addEventListener('dih-movies-sector-changed', handleSectorChanged);
    return () => {
      window.removeEventListener('dih-movies-sector-changed', handleSectorChanged);
    };
  }, []);

  const actionGenreId = sector === 'tv' ? '10759' : sector === 'anime' ? '16' : '28';

  return (
    <nav style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 50, 
      transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)', 
      background: scrolled ? 'rgba(7,9,15,0.85)' : 'transparent', 
      backdropFilter: scrolled ? 'blur(24px) contrast(1.1) brightness(1.2)' : 'none', 
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none' 
    }}>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 md:h-[72px] flex items-center justify-between gap-2 md:gap-6">
        
        {/* Brand / Logo */}
        <div onClick={() => onNavigate('/')} className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0 select-none">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Clapperboard size={16} className="sm:w-[18px] sm:h-[18px]" color="#000" strokeWidth={2.5}/>
          </div>
          <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white font-sans">
            DIH<span className="text-[#F59E0B]">MOVIES</span>
          </span>
        </div>

        {/* Navigation Items (Home / Action) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { href: '/', icon: <Home size={13} />, label: 'Home' }, 
            { href: `/genre/${actionGenreId}`, icon: <Flame size={13} />, label: 'Action' }
          ].map(({ href, icon, label }) => {
            const isActive = currentPath === href;
            return (
              <button 
                key={href} 
                onClick={() => onNavigate(href)} 
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 text-[11px] sm:text-[13px] py-1.5 sm:py-2 rounded-lg font-extrabold uppercase transition-all ${
                  isActive 
                    ? 'text-[#F59E0B] bg-amber-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {icon}
                <span className="hidden xs:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input Indicator */}
        {settings.movieSearchEnabled && (
          <button 
            onClick={() => onNavigate('/search')} 
            className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search movies…</span>
          </button>
        )}
      </div>
    </nav>
  );
}
