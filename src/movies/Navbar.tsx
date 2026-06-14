import { useState, useEffect } from 'react';
import { Search, Clapperboard, Home, Flame } from 'lucide-react';
import { useAppSettings } from '@/src/hooks/useAppSettings';

export function MoviesNavbar({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const { settings } = useAppSettings();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{ position:'sticky', top:0, zIndex:50, transition:'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)', background:scrolled?'rgba(7,9,15,0.7)':'transparent', backdropFilter:scrolled?'blur(24px) contrast(1.1) brightness(1.2)':'none', borderBottom:scrolled?'1px solid rgba(255,255,255,0.08)':'none' }}>
      <div style={{ maxWidth:1500, margin:'0 auto', padding:'0 24px', height:72, display:'flex', alignItems:'center', gap:24 }}>
        <div onClick={() => onNavigate('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#F59E0B 0%,#D97706 100%)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 16px rgba(245,158,11,0.25)' }}>
            <Clapperboard size={20} color="#000" strokeWidth={2.5}/>
          </div>
          <span style={{ fontSize:20, fontWeight:900, letterSpacing:'-1px', color:'#fff', fontFamily:"'Poppins', sans-serif" }}>DIH<span style={{ color:'#F59E0B' }}>MOVIES</span></span>
        </div>
        <div style={{ display:'flex', gap:4, flex:1 }}>
          {[{ href:'/', icon:<Home size={14}/>, label:'Home' }, { href:'/genre/28', icon:<Flame size={14}/>, label:'Action' }].map(({ href, icon, label }) => (
            <div key={href} onClick={() => onNavigate(href)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 13px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, color:currentPath===href?'#F59E0B':'rgba(255,255,255,0.6)', background:currentPath===href?'rgba(245,158,11,0.1)':'transparent' }}>
              {icon}{label.toUpperCase()}
            </div>
          ))}
        </div>
        {settings.movieSearchEnabled && (
          <div onClick={() => onNavigate('/search')} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 16px', borderRadius:24, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:13 }}>
            <Search size={14}/> Search movies…
          </div>
        )}
      </div>
    </nav>
  );
}
