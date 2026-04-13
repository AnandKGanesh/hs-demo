import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { demoModeState, debugCredentialsState } from '../utils/atoms';

const DebugModeBanner = () => {
  const demoMode = useRecoilValue(demoModeState);
  const setDemoMode = useSetRecoilState(demoModeState);
  const setDebugCredentials = useSetRecoilState(debugCredentialsState);

  if (demoMode !== 'debug') return null;

  const handleSwitchToDemo = () => {
    setDemoMode('demo');
    localStorage.setItem('hyperswitch_demo_mode', 'demo');
    window.location.reload();
  };

  const handleClearCredentials = () => {
    setDebugCredentials(null);
    localStorage.removeItem('hyperswitch_debug_credentials');
    setDemoMode('demo');
    localStorage.setItem('hyperswitch_demo_mode', 'demo');
    window.location.reload();
  };

  return (
    <div data-debug-banner className="fixed top-16 left-0 right-0 h-8 bg-amber-500 text-white flex items-center justify-center text-xs sm:text-sm font-medium z-40 px-3">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
        <span>Debug Mode</span>
        <button
          onClick={handleClearCredentials}
          className="text-xs underline hover:text-amber-100"
        >
          Clear & Reset
        </button>
      </div>
    </div>
  );
};

export default DebugModeBanner;