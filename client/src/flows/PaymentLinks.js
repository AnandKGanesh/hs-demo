import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { apiResponseState, demoModeState, debugCredentialsState } from '../utils/atoms';
import { makeAuthenticatedRequest } from '../utils/api';
import { filters } from '../utils/fieldMappings';

const PaymentLinks = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);

  const handleCreatePaymentLink = async () => {
    setHasClicked(true);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await makeAuthenticatedRequest('/api/create-payment-link', {
        method: 'POST',
        body: JSON.stringify({
          amount: 10000,
          currency: 'USD',
          description: 'Payment for Order #12345',
        }),
      }, mode, debugCreds);

      if (data.error) {
        throw new Error(data.error.message || 'Failed to create payment link');
      }

      setResult(data);

      // Update API response panel
      setApiResponse({
        steps: [
          {
            title: 'Step 1: Create Payment Link',
            request: {
              method: 'POST',
              url: '/payments',
              body: {
                amount: 10000,
                currency: 'USD',
                confirm: false,
                capture_method: 'automatic',
                payment_link: true,
                description: 'Payment for Order #12345',
                customer: {
                  id: 'customer_123',
                  name: 'John Doe',
                  email: 'customer@example.com',
                },
                billing: {
                  address: {
                    line1: '1467',
                    line2: 'Harrison Street',
                    city: 'San Fransico',
                    state: 'California',
                    zip: '94122',
                    country: 'US',
                  },
                },
              },
            },
            response: filters.paymentLinks(data),
          },
        ],
        currentStep: 1,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">
          Payment Links
        </h3>
        <p className="text-sm text-green-700 dark:text-green-400">
          Generate a shareable payment link for customers to complete payment.
          <br />
          <strong>Amount:</strong> $100.00 USD
        </p>
      </div>

      <button
        onClick={handleCreatePaymentLink}
        disabled={isLoading || hasClicked}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
      >
        Generate Payment Link
      </button>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && result.payment_link && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-300">Payment Link Created!</h4>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">Payment Link:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={result.payment_link.link} 
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(result.payment_link.link)}
                  className="px-3 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <span className="font-medium">Secure Link:</span>{' '}
                <span className="text-xs text-blue-600 dark:text-blue-500">
                  These links cannot be directly opened in a browser tab & are embedded within the iframe of a trusted domain
                </span>
              </p>
            </div>

            <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>Payment ID:</strong> {result.payment_id}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>Status:</strong> {result.status}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentLinks;
