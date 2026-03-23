import React from 'react';
import { useRecoilState } from 'recoil';
import { themeState } from '../utils/atoms';
import { Sun, Moon } from 'lucide-react';
import juspayLogo from '../assets/juspay-logo.png';

const Header = () => {
  const [theme, setTheme] = useRecoilState(themeState);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Juspay Logo */}
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

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
};

export default Header;
