import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, onFlowSelect, currentFlow }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="flex pt-16">
        <Sidebar onFlowSelect={onFlowSelect} currentFlow={currentFlow} />
        <main className="flex-1 ml-80 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
