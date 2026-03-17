import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import PaymentForm from './components/PaymentForm';
import APIResponsePanel from './components/APIResponsePanel';
import { useRecoilState } from 'recoil';
import { currentFlowState, apiResponseState, hyperState } from './utils/atoms';

const App = () => {
  const [currentFlow, setCurrentFlow] = useRecoilState(currentFlowState);
  const [apiResponse, setApiResponse] = useRecoilState(apiResponseState);
  const [hyper, setHyper] = useRecoilState(hyperState);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [initError, setInitError] = useState(null);

  // Load HyperLoader and initialize
  useEffect(() => {
    const loadHyper = async () => {
      try {
        console.log('Fetching config and URLs...');
        // Fetch config and URLs
        const [configRes, urlsRes] = await Promise.all([
          fetch('http://localhost:5252/config'),
          fetch('http://localhost:5252/urls'),
        ]);

        const configData = await configRes.json();
        const urlsData = await urlsRes.json();
        console.log('Config loaded:', configData);
        console.log('URLs loaded:', urlsData);
        setConfig(configData);

        // Load HyperLoader script
        const script = document.createElement('script');
        script.src = `${urlsData.clientUrl}/HyperLoader.js`;
        script.async = true;

        script.onload = () => {
          console.log('HyperLoader loaded successfully');
          // Wait a moment for window.Hyper to be available
          setTimeout(() => {
            if (!window.Hyper) {
              console.error('window.Hyper not available after script load');
              setInitError('Hyperswitch SDK not loaded properly. Please check browser console.');
              setIsLoading(false);
              return;
            }
            try {
              const hyperInstance = window.Hyper(
                {
                  publishableKey: configData.publishableKey,
                  profileId: configData.profileId,
                },
                {
                  customBackendUrl: urlsData.serverUrl,
                }
              );
              console.log('Hyper instance created:', hyperInstance);
              setHyper(hyperInstance);
              setIsLoading(false);
            } catch (err) {
              console.error('Error creating Hyper instance:', err);
              setInitError(err.message);
              setIsLoading(false);
            }
          }, 100);
        };

        script.onerror = (e) => {
          console.error('Failed to load HyperLoader:', e);
          setInitError('Failed to load Hyperswitch SDK');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error initializing:', error);
        setInitError(error.message);
        setIsLoading(false);
      }
    };

    loadHyper();
  }, [setHyper]);

  const handleFlowSelect = (flow) => {
    setCurrentFlow(flow);
    setApiResponse({ steps: [], currentStep: 0 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading Hyperswitch SDK...</div>
        <div className="mt-4 text-sm text-gray-500">Make sure backend server is running on port 5252</div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="text-red-600 text-xl mb-4">⚠️ Initialization Error</div>
        <div className="text-gray-700 dark:text-gray-300 text-center max-w-md">
          {initError}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Layout onFlowSelect={handleFlowSelect} currentFlow={currentFlow}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {currentFlow?.name || 'Select a Flow'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {currentFlow?.description || 'Choose a payment flow from the sidebar to begin'}
          </p>
        </div>

        {currentFlow && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <PaymentForm flow={currentFlow} />
            </div>

            <APIResponsePanel />
          </>
        )}

        {!currentFlow && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to Hyperswitch Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select a payment flow from the sidebar to see it in action
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
