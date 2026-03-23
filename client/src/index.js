import React from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </ErrorBoundary>
  </React.StrictMode>
);
