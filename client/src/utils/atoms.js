import { atom } from 'recoil';

const getStoredMode = () => {
  try {
    const stored = localStorage.getItem('hyperswitch_demo_mode');
    return stored === 'debug' ? 'debug' : 'demo';
  } catch {
    return 'demo';
  }
};

const getStoredDebugCredentials = () => {
  try {
    const stored = localStorage.getItem('hyperswitch_debug_credentials');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const demoModeState = atom({
  key: 'demoModeState',
  default: getStoredMode(),
});

export const debugCredentialsState = atom({
  key: 'debugCredentialsState',
  default: getStoredDebugCredentials(),
});

export const currentFlowState = atom({
  key: 'currentFlowState',
  default: null,
});

export const apiResponseState = atom({
  key: 'apiResponseState',
  default: {
    steps: [],
    currentStep: 0,
  },
});

export const hyperState = atom({
  key: 'hyperState',
  default: null,
});

const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem('hyperswitch_demo_theme');
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const themeState = atom({
  key: 'themeState',
  default: getStoredTheme(),
});

export const paymentStatusState = atom({
  key: 'paymentStatusState',
  default: null,
});

export const captureCompleteState = atom({
  key: 'captureCompleteState',
  default: false,
});

export const customerState = atom({
  key: 'customerState',
  default: null,
});
