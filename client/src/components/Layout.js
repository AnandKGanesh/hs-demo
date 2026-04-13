import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DebugModeBanner from './DebugModeBanner';

const Layout = ({ children, onFlowSelect, currentFlow }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Close sidebar on route/flow change (mobile UX)
  useEffect(() => {
    closeSidebar();
  }, [currentFlow, closeSidebar]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSidebar]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <DebugModeBanner />
      <div className="flex pt-16">
        <Sidebar
          onFlowSelect={onFlowSelect}
          currentFlow={currentFlow}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ml-0 lg:ml-80 transition-[margin] duration-300 ${document.querySelector('[data-debug-banner]') ? 'pt-12' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
