import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { apiResponseState, demoModeState, debugCredentialsState } from '../utils/atoms';
import { makeAuthenticatedRequest } from '../utils/api';

const HSSDKExternalVault = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);

  const handlePayment = async () => {
    setHasClicked(true);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await makeAuthenticatedRequest('/api/create-external-vault-payment', {
        method: 'POST',
        body: JSON.stringify({
          amount: 10000,
          currency: 'USD',
          description: 'Default value',
        }),
      }, mode, debugCreds);

      if (data.error) {
        throw new Error(data.error.message || 'Payment failed');
      }

      setResult(data);

      // Update API response panel
      setApiResponse({
        steps: [
          {
            title: 'Step 1: Create Payment with External Vault',
            request: {
              method: 'POST',
              url: '/payments',
              headers: {
                'X-Profile-Id': 'pro_ukJVFiPH0bzYFZwBPi9j',
              },
              body: {
                amount: 10000,
                currency: 'USD',
                profile_id: 'pro_ukJVFiPH0bzYFZwBPi9j',
                customer_id: 'hyperswitch_sdk_demo_id',
                description: 'Default value',
                capture_method: 'automatic',
                email: 'guest@example.com',
                setup_future_usage: 'on_session',
                request_external_three_ds_authentication: false,
                billing: {
                  address: {
                    line1: '1600',
                    line2: 'Amphitheatre Parkway',
                    city: 'Mountain View',
                    state: 'California',
                    zip: '94043',
                    country: 'US',
                    first_name: 'John',
                    last_name: 'Doe',
                  },
                  phone: {
                    number: '6502530000',
                    country_code: '+1',
                  },
                },
                shipping: {
                  address: {
                    line1: '1600',
                    line2: 'Amphitheatre Parkway',
                    city: 'Mountain View',
                    state: 'California',
                    zip: '94043',
                    country: 'US',
                    first_name: 'John',
                    last_name: 'Doe',
                  },
                  phone: {
                    number: '6502530000',
                    country_code: '+1',
                  },
                },
              },
            },
            response: {
              payment_id: data.payment_id,
              status: data.status,
              client_secret: data.client_secret,
              amount: data.amount,
              currency: data.currency,
            },
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
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
          HS SDK + External Vault Storage
        </h3>
        <p className="text-sm text-purple-700 dark:text-purple-400">
          Payment with external vault storage integration.
          <br />
          <strong>Profile ID:</strong> pro_ukJVFiPH0bzYFZwBPi9j
          <br />
          <strong>Amount:</strong> $100.00 USD
        </p>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading || hasClicked}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
      >
        Create Payment with External Vault
      </button>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
          <h4 className="font-medium text-green-900 dark:text-green-300">Payment Created!</h4>
          <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <p><strong>Payment ID:</strong> {result.payment_id}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Amount:</strong> ${(result.amount / 100).toFixed(2)} {result.currency}</p>
            {result.client_secret && (
              <p><strong>Client Secret:</strong> <span className="font-mono text-xs">{result.client_secret.substring(0, 30)}...</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HSSDKExternalVault;
