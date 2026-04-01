import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { themeState, demoModeState, debugCredentialsState } from '../utils/atoms';
import { Sun, Moon } from 'lucide-react';
import juspayLogo from '../assets/juspay-logo.png';
import DebugCredentialsModal from './DebugCredentialsModal';

const ComingSoonTooltip = ({ children }) => (
  <div className="group relative">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
      Coming Soon
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const Header = () => {
  const [theme, setTheme] = useRecoilState(themeState);
  const [demoMode, setDemoMode] = useRecoilState(demoModeState);
  const [debugCredentials, setDebugCredentials] = useRecoilState(debugCredentialsState);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleModeChange = (mode) => {
    if (mode === 'debug') {
      if (!debugCredentials) {
        setShowCredentialsModal(true);
      } else {
        setDemoMode('debug');
        localStorage.setItem('hyperswitch_demo_mode', 'debug');
        window.location.reload();
      }
    } else {
      setDemoMode('demo');
      localStorage.setItem('hyperswitch_demo_mode', 'demo');
      window.location.reload();
    }
  };

  const handleCredentialsSave = (credentials) => {
    setDebugCredentials(credentials);
    localStorage.setItem('hyperswitch_debug_credentials', JSON.stringify(credentials));
    setDemoMode('debug');
    localStorage.setItem('hyperswitch_demo_mode', 'debug');
    setShowCredentialsModal(false);
    window.location.reload();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={juspayLogo} 
              alt="Juspay" 
              className="h-8 w-auto object-contain"
              style={{ maxWidth: '120px' }}
            />
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Hyperswitch Demo
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {demoMode === 'debug' && (
            <button
              onClick={() => setShowCredentialsModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              Edit Credentials
            </button>
          )}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleModeChange('demo')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                demoMode === 'demo'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Demo
            </button>
            <ComingSoonTooltip>
              <button
                disabled
                className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                Debug
              </button>
            </ComingSoonTooltip>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {showCredentialsModal && (
        <DebugCredentialsModal
          initialCredentials={debugCredentials}
          onSave={handleCredentialsSave}
          onCancel={() => setShowCredentialsModal(false)}
        />
      )}
    </>
  );
};

export default Header;