import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { apiResponseState, captureCompleteState, demoModeState, debugCredentialsState } from '../utils/atoms';
import { makeAuthenticatedRequest } from '../utils/api';
import { filters } from '../utils/fieldMappings';
import API_BASE_URL from '../config';

const ServerButton = ({ paymentId, flow }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [error, setError] = useState(null);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const setCaptureComplete = useSetRecoilState(captureCompleteState);
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);

  const isPartialCapture = flow?.id === 'manual_partial';
  const captureAmount = isPartialCapture ? 5000 : 10000;
  const captureAmountDollars = isPartialCapture ? 50 : 100;

  const handleCapture = async () => {
    if (!paymentId || hasClicked) return;

    setHasClicked(true);
    setIsLoading(true);
    setError(null);

    try {
      const data = await makeAuthenticatedRequest(`/api/capture-payment/${paymentId}`, {
        method: 'POST',
        body: JSON.stringify({
          amount_to_capture: captureAmount,
        }),
      }, mode, debugCreds);

      if (data.error) {
        throw new Error(data.error.message);
      }

      setCaptureComplete(true);
      setShowRetrieve(true);

      setApiResponse((prev) => ({
        ...prev,
        steps: [
          ...prev.steps,
          {
            title: isPartialCapture ? 'Step 4: Server Partial Capture' : 'Step 4: Server Capture',
            request: {
              method: 'POST',
              url: `/payments/${paymentId}/capture`,
              body: {
                amount_to_capture: captureAmount,
              },
            },
            response: filters.capture(data, isPartialCapture),
          },
        ],
        currentStep: 4,
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrieve = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/${paymentId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      setApiResponse((prev) => ({
        ...prev,
        steps: [
          ...prev.steps,
          {
            title: 'Step 5: Retrieve Payment Status',
            request: {
              method: 'GET',
              url: `/payments/${paymentId}`,
            },
            response: isPartialCapture
              ? filters.filterApiResponse(data, 'payment', 'step5_retrieve_partial')
              : filters.filterApiResponse(data, 'payment', 'step5_retrieve'),
          },
        ],
        currentStep: 5,
      }));

      setShowRetrieve(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!showRetrieve ? (
        <button
          type="button"
          onClick={handleCapture}
          disabled={isLoading || hasClicked}
          className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {isPartialCapture ? `Capture $${captureAmountDollars}` : 'Complete on Server'}
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRetrieve}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Retrieving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retrieve Payment Status (Step 5)
            </>
          )}
        </button>
      )}

      {isPartialCapture && !showRetrieve && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Will capture ${captureAmountDollars} of $100 authorized
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ServerButton;
