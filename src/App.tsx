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
import { useNavigate } from 'react-router-dom';
import TemplatesGallery from './pages/TemplatesGallery';
import AdminTemplates from './pages/AdminTemplates';
import HostedTemplate from './pages/HostedTemplate';
import DihMoviesApp from './movies/DihMoviesApp';
import UnderMaintenance from './components/tools/UnderMaintenance';
import TenminAI from './components/tools/TenminAI';

type ToolId = 'dashboard' | 'tenmin-ai' | 'qr' | 'encryption' | 'to-base64' | 'img-to-base64' | 'bg-remover' | 'passport' | 'auto-passport' | 'video' | 'design-editor' | 'admin-login' | 'admin-panel' | 'lib-encryptor' | 'dex-protector' | 'apk-store' | 'temp-mail' | 'temp-sms' | 'cut-downloader' | 'mobile-bypass' | 'migration' | 'dih-movies' | 'hosted-admin';

function MainApp() {
  const { settings } = useAppSettings();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<ToolId>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (settings.tmdbApiKey) {
      tmdb.setApiKey(settings.tmdbApiKey);
    }
  }, [settings.tmdbApiKey]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('dihhub_user');
      if (savedUser && savedUser !== "undefined") {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse dihhub_user:', e);
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin-login') {
      setActiveTool('admin-login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dihhub_user');
    setCurrentUser(null);
    setActiveToolWithNavigation('dashboard');
  };

  const setActiveToolWithNavigation = (id: ToolId) => {
    if (id === 'migration') {
      navigate('/migration');
    } else if (id === 'hosted-admin') {
      setActiveTool('hosted-admin');
      navigate('/');
    } else {
      setActiveTool(id);
      if (id === 'dashboard') navigate('/');
    }
  };

  const renderTool = () => {
    // Check if the current active tool is disabled, upcoming, or coming soon by administrator
    if (activeTool !== 'admin-login' && activeTool !== 'admin-panel') {
      const toolName = settings.toolLabels?.[activeTool] || activeTool;
      const customNotice = settings.toolNotices?.[activeTool];
      
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

    switch (activeTool) {
      case 'tenmin-ai': return <TenminAI />;
      case 'qr': return <QRCodeTool />;
      case 'encryption': return <EncryptionTool />;
      case 'to-base64': return <ImageToBase64 />;
      case 'bg-remover': return <BackgroundRemover />;
      case 'passport': return <PassportPhotoTool />;
      case 'auto-passport': return <AutoPassport />;
      case 'video': return <VideoDownloader />;
      case 'cut-downloader': return <CutDownloader />;
      case 'design-editor': return <DesignEditor />;
      case 'lib-encryptor': return <LibEncryptor />;
      case 'dex-protector': return <DexProtector />;
      case 'apk-store': return <ApkStore />;
      case 'temp-mail': return <TempMail />;
      case 'temp-sms': return <TempSMS />;
      case 'img-to-base64': return <ImageToBase64 />;
      case 'mobile-bypass': return <MobileBypass />;
      case 'dih-movies': return <DihMoviesApp />;
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
      <AdsController />
      <Routes>
        <Route path="/templates" element={<TemplatesGallery />} />
        <Route path="/t/:slug" element={<HostedTemplate />} />
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
