import { atom } from 'recoil';

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

export const themeState = atom({
  key: 'themeState',
  default: 'light',
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
