import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { apiResponseState, captureCompleteState, demoModeState, debugCredentialsState } from '../utils/atoms';
import { makeAuthenticatedRequest } from '../utils/api';

const ServerButton = ({ paymentId, flow }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [error, setError] = useState(null);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const setCaptureComplete = useSetRecoilState(captureCompleteState);
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);
  
  const isPartialCapture = flow?.id === 'manual_partial';
  const captureAmount = isPartialCapture ? 5000 : 10000; // $50 or $100
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

      // Calculate remaining amount
      const totalAuthorized = 10000; // $100
      const amountCaptured = data.amount_captured || captureAmount;
      const remainingCapturable = totalAuthorized - amountCaptured;

      // Mark capture as complete
      setCaptureComplete(true);
      
      // Update API response panel
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
            response: {
              payment_id: data.payment_id,
              status: data.status,
              amount_captured: amountCaptured,
              ...(isPartialCapture && {
                remaining_capturable: remainingCapturable,
              }),
            },
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

  return (
    <div className="flex flex-col gap-2">
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
              <path strokeLinecap="round" stroke-linejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            {isPartialCapture ? `Capture $${captureAmountDollars}` : 'Complete on Server'}
          </>
        )}
      </button>

      {isPartialCapture && (
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
