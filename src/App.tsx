import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSettings } from './hooks/useAppSettings';
import { tmdb } from './services/tmdbService';
import Layout from './components/Layout';
import Dashboard from './components/tools/Dashboard';
import QRCodeTool from './components/tools/QRCodeTool';
import EncryptionTool from './components/tools/EncryptionTool';
import ImageToBase64 from './components/tools/ImageToBase64';
import BackgroundRemover from './components/tools/BackgroundRemover';
import PassportPhotoTool from './components/tools/PassportPhotoTool';
import VideoDownloader from './components/tools/VideoDownloader';
import DesignEditor from './components/tools/DesignEditor';
import AdminPanel from './components/admin/AdminPanel';
import AdminLogin from './components/admin/AdminLogin';
import LibEncryptor from './components/tools/LibEncryptor';
import DexProtector from './components/tools/DexProtector';
import ApkStore from './components/tools/ApkStore';
import TempMail from './components/tools/TempMail';
import TempSMS from './components/tools/TempSMS';
import CutDownloader from './components/tools/CutDownloader';
import AutoPassport from './components/tools/AutoPassport';
import MobileBypass from './components/tools/MobileBypass';
import UserAuthModal from './components/UserAuthModal';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import AdsController from './components/AdsController';
import Migration from './pages/Migration';
import { useNavigate, useLocation } from 'react-router-dom';
import TemplatesGallery from './pages/TemplatesGallery';
import AdminTemplates from './pages/AdminTemplates';
import HostedTemplate from './pages/HostedTemplate';
import DihMoviesApp from './movies/DihMoviesApp';
import UnderMaintenance from './components/tools/UnderMaintenance';
import TenminAI from './components/tools/TenminAI';
import BachelorPoint from './components/tools/BachelorPoint';
import DihSmm from './components/tools/DihSmm';
import StakeHub from './components/tools/StakeHub';

type ToolId = 'dashboard' | 'qr' | 'encryption' | 'to-base64' | 'bg-remover' | 'video' | 'admin-login' | 'admin-panel' | 'lib-encryptor' | 'dex-protector' | 'apk-store' | 'dih-movies' | 'bachelor-point' | 'mobile-bypass' | 'hosted-admin' | 'dih-smm' | 'migration' | 'dih-casino';

function MainApp() {
  const { settings } = useAppSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTool, setActiveTool] = useState<ToolId>(() => {
    if (typeof window !== 'undefined') {
      const rawPath = window.location.pathname;
      const cleanPath = rawPath.replace(/^\//, '').replace(/\/$/, '');
      
      try {
        const savedUser = localStorage.getItem('dihhub_user');
        if (savedUser && savedUser !== "undefined") {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser?.role === 'admin' || parsedUser?.isAdmin || parsedUser?.email === 'rafcin.b') {
            return 'admin-panel';
          }
        }
      } catch (err) {
        console.error('Failed to parse admin session:', err);
      }

      const ignorePaths = ['templates', 'movies', 'migration', 'payment'];
      if (!ignorePaths.some(p => cleanPath.startsWith(p)) && !rawPath.startsWith('/rb/')) {
        if (cleanPath === 'admin' || cleanPath === 'admin-login') {
          return 'admin-login';
        }
        if (cleanPath === 'admin-panel') {
          return 'admin-panel';
        }
        if (cleanPath === 'dih-templates') {
          return 'hosted-admin';
        }
        
        const toolIds: ToolId[] = [
          'qr', 'encryption', 'to-base64', 'bg-remover', 
          'video', 'lib-encryptor', 
          'dex-protector', 'apk-store', 
          'mobile-bypass', 'dih-movies', 'bachelor-point', 'dih-smm', 'dih-casino'
        ];
        if (toolIds.includes(cleanPath as ToolId)) {
          return cleanPath as ToolId;
        }
      }
    }
    return 'dashboard';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('dihhub_user');
        if (savedUser && savedUser !== "undefined") {
          return JSON.parse(savedUser);
        }
      }
    } catch (e) {
      console.error('Failed to parse dihhub_user on init:', e);
    }
    return null;
  });

  useEffect(() => {
    if (settings.tmdbApiKey) {
      tmdb.setApiKey(settings.tmdbApiKey);
    }
  }, [settings.tmdbApiKey]);

  useEffect(() => {
    const isReset = localStorage.getItem('smm_clean_reset_v6');
    if (!isReset) {
      // Clear out SMM services, deposits, orders, and demo users from local storage
      localStorage.removeItem('dih_smm_services_v2');
      localStorage.removeItem('dih_smm_deposits_v2');
      localStorage.removeItem('dih_smm_orders_v2');
      localStorage.removeItem('dih_smm_users_v2');

      const specificProviders = [
        { id: 1, name: 'TRENDWE', apiUrl: 'https://trendawe.com/api/v2', apiKey: 'be58cfbf6f7bef374660e39f00c8b113', status: 'active', balance: 0.00, serviceCount: 0 },
        { id: 2, name: 'SMMGEN', apiUrl: 'https://smmgen.com/api/v2', apiKey: 'f5846f314bba6ed87b2c025b2ef73790', status: 'active', balance: 0.00, serviceCount: 0 }
      ];
      localStorage.setItem('dih_smm_providers_v2', JSON.stringify(specificProviders));

      localStorage.setItem('dih_smm_services_v2', JSON.stringify([]));
      localStorage.setItem('dih_smm_deposits_v2', JSON.stringify([]));
      localStorage.setItem('dih_smm_orders_v2', JSON.stringify([]));

      // Done reset
      localStorage.setItem('smm_clean_reset_v6', 'true');
    }
  }, []);

  // Sync URL pathname -> activeTool on mount & path changes
  useEffect(() => {
    const rawPath = location.pathname;
    const cleanPath = rawPath.replace(/^\//, '').replace(/\/$/, '');
    
    // Ignore pages with their own custom routes
    const ignorePaths = ['templates', 'movies', 'migration', 'payment'];
    if (ignorePaths.some(p => cleanPath.startsWith(p)) || rawPath.startsWith('/rb/')) {
      return;
    }

    const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.email === 'rafcin.b';
    if (isAdmin) {
      if (cleanPath !== 'admin-panel') {
        setActiveTool('admin-panel');
        navigate('/admin-panel', { replace: true });
        return;
      }
      return;
    }

    if (cleanPath === 'admin' || cleanPath === 'admin-login') {
      setActiveTool('admin-login');
      return;
    }

    if (cleanPath === 'admin-panel') {
      setActiveTool('admin-panel');
      return;
    }

    if (cleanPath === 'dih-templates') {
      setActiveTool('hosted-admin');
      return;
    }

    if (cleanPath === 'hosted-admin') {
      navigate('/dih-templates', { replace: true });
      return;
    }

    const toolIds: ToolId[] = [
      'qr', 'encryption', 'to-base64', 'bg-remover', 
      'video', 'lib-encryptor', 
      'dex-protector', 'apk-store', 
      'mobile-bypass', 'dih-movies', 'bachelor-point', 'dih-smm', 'dih-casino'
    ];

    if (toolIds.includes(cleanPath as ToolId)) {
      if (activeTool !== cleanPath) {
        setActiveTool(cleanPath as ToolId);
      }
    } else if (cleanPath === '') {
      if (activeTool !== 'dashboard') {
        setActiveTool('dashboard');
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('dihhub_user');
    setCurrentUser(null);
    setActiveToolWithNavigation('dashboard');
  };

  const setActiveToolWithNavigation = (id: ToolId) => {
    if (id === 'migration') {
      navigate('/migration');
    } else if (id === 'dih-movies') {
      setActiveTool('dih-movies');
      navigate('/dih-movies');
    } else if (id === 'hosted-admin') {
      setActiveTool('hosted-admin');
      navigate('/dih-templates');
    } else if (id === 'dashboard') {
      setActiveTool('dashboard');
      navigate('/');
    } else {
      setActiveTool(id);
      navigate('/' + id);
    }
  };

  const renderTool = () => {
    const isSpecialTester = currentUser?.email === 'rafcinbhuiyan85@gmail.com' || currentUser?.email === 'rafcin.b' || currentUser?.role === 'admin' || currentUser?.isAdmin;

    // Check if the current active tool is disabled, upcoming, or coming soon by administrator
    if (activeTool !== 'admin-login' && activeTool !== 'admin-panel' && !isSpecialTester) {
      const toolName = settings.toolLabels?.[activeTool] || activeTool;
      const customNotice = settings.toolNotices?.[activeTool];

      if (settings.visibleTools && !settings.visibleTools.includes(activeTool) && activeTool !== 'dashboard') {
        return (
          <UnderMaintenance 
            toolName={toolName} 
            customNotice={customNotice || "This tool has been temporarily hidden by the administrator."} 
            statusType="offline"
            onBack={() => setActiveToolWithNavigation('dashboard')} 
          />
        );
      }
      
      if (settings.disabledTools?.includes(activeTool)) {
        return (
          <UnderMaintenance 
            toolName={toolName} 
            customNotice={customNotice} 
            statusType="offline"
            onBack={() => setActiveToolWithNavigation('dashboard')} 
          />
        );
      }
      
      if (settings.upcomingTools?.includes(activeTool)) {
        return (
          <UnderMaintenance 
            toolName={toolName} 
            customNotice={customNotice} 
            statusType="upcoming"
            onBack={() => setActiveToolWithNavigation('dashboard')} 
          />
        );
      }
      
      if (settings.comingSoonTools?.includes(activeTool)) {
        return (
          <UnderMaintenance 
            toolName={toolName} 
            customNotice={customNotice} 
            statusType="coming-soon"
            onBack={() => setActiveToolWithNavigation('dashboard')} 
          />
        );
      }
    }

    switch (activeTool as any) {
      case 'qr': return <QRCodeTool />;
      case 'encryption': return <EncryptionTool />;
      case 'to-base64': return <ImageToBase64 />;
      case 'bg-remover': return <BackgroundRemover />;
      case 'video': return <VideoDownloader />;
      case 'lib-encryptor': return <LibEncryptor />;
      case 'dex-protector': return <DexProtector />;
      case 'apk-store': return <ApkStore />;
      case 'mobile-bypass': return <MobileBypass />;
      case 'dih-movies': return <DihMoviesApp />;
      case 'bachelor-point': return <BachelorPoint />;
      case 'dih-smm': return <DihSmm currentUser={currentUser} onAuthClick={() => setIsAuthModalOpen(true)} />;
      case 'dih-casino': return <StakeHub currentUser={currentUser} />;
      case 'hosted-admin': return <TemplatesGallery onBack={() => setActiveToolWithNavigation('dashboard')} />;
      case 'admin-login': return (
        <AdminLogin onLogin={() => {
          const adminUser = { id: 'admin_rafcin', name: 'Rafcin Bhuiyan', email: 'rafcin.b', role: 'admin', isAdmin: true };
          setCurrentUser(adminUser);
          localStorage.setItem('dihhub_user', JSON.stringify(adminUser));
          setActiveToolWithNavigation('admin-panel');
        }} />
      );
      case 'admin-panel': {
        const isAdminSession = currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.email === 'rafcin.b';
        if (!isAdminSession) {
          return (
            <AdminLogin onLogin={() => {
              const adminUser = { id: 'admin_rafcin', name: 'Rafcin Bhuiyan', email: 'rafcin.b', role: 'admin', isAdmin: true };
              setCurrentUser(adminUser);
              localStorage.setItem('dihhub_user', JSON.stringify(adminUser));
              setActiveToolWithNavigation('admin-panel');
            }} />
          );
        }
        return <AdminPanel onLogout={handleLogout} />;
      }
      default: return <Dashboard onSelectTool={setActiveToolWithNavigation} />;
    }
  };

  return (
    <>
      <AdsController activeTool={activeTool} />
      <Routes>
        <Route path="/templates" element={<TemplatesGallery />} />
        <Route path="/rb/:slug" element={<HostedTemplate />} />
        <Route path="/movies" element={<DihMoviesApp />} />
        <Route path="/migration" element={<Migration />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/admin/templates" element={<Navigate to="/" replace />} />
        <Route path="*" element={
          <>
            <Layout 
              activeTool={activeTool} 
              setActiveTool={setActiveToolWithNavigation}
              currentUser={currentUser}
              onAuthClick={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
            >
              {activeTool === 'dashboard' ? (
                <Dashboard onSelectTool={setActiveToolWithNavigation} />
              ) : (
                renderTool()
              )}
            </Layout>

            <UserAuthModal 
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onSuccess={(user) => {
                setCurrentUser(user);
                localStorage.setItem('dihhub_user', JSON.stringify(user));
                if (user?.role === 'admin' || user?.isAdmin || user?.email === 'rafcin.b') {
                  setActiveToolWithNavigation('admin-panel');
                }
              }}
            />
          </>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
