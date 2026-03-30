import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DebugModeBanner from './DebugModeBanner';

const Layout = ({ children, onFlowSelect, currentFlow }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <DebugModeBanner />
      <div className="flex pt-16">
        <Sidebar onFlowSelect={onFlowSelect} currentFlow={currentFlow} />
        <main className={`flex-1 ml-80 p-8 ${document.querySelector('[data-debug-banner]') ? 'pt-12' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
