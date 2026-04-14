import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { apiResponseState, demoModeState, debugCredentialsState } from '../utils/atoms';
import { makeAuthenticatedRequest } from '../utils/api';
import { filters } from '../utils/fieldMappings';

// Static card data
const CARD_DATA = {
  card_number: '4111111111111111',
  card_exp_month: '03',
  card_exp_year: '30',
  card_cvc: '737',
  card_holder_name: 'John Doe',
};

const RelayIncrementalAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [adyenTransactionId, setAdyenTransactionId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [additionalAmount, setAdditionalAmount] = useState('5000');
  const [hasClicked, setHasClicked] = useState(false);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);

  const handleStep1 = async () => {
    setHasClicked(true);
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create Adyen Authorization (authorize only)
      const authData = await makeAuthenticatedRequest('/api/adyen/authorize', {
        method: 'POST',
        body: JSON.stringify({
          amount: 10000,
          card_data: CARD_DATA,
        }),
      }, mode, debugCreds);

      if (authData.error) {
        throw new Error(authData.error.message || 'Adyen authorization failed');
      }

      setAdyenTransactionId(authData.adyenTransactionId);
      setStep(2);
      setHasClicked(false);

      // Update API response panel
      setApiResponse({
        steps: [
          {
            title: 'Step 1: Adyen Direct Authorization',
            request: {
              method: 'POST',
              url: '/pal/servlet/Payment/v68/authorise',
              body: {
                amount: { currency: 'USD', value: 10000 },
                merchantAccount: 'JuspayDEECOM',
                paymentMethod: {
                  type: 'scheme',
                  number: CARD_DATA.card_number,
                  expiryMonth: CARD_DATA.card_exp_month,
                  expiryYear: CARD_DATA.card_exp_year,
                  cvc: CARD_DATA.card_cvc,
                  holderName: CARD_DATA.card_holder_name,
                },
              },
            },
            response: {
              adyen_transaction_id: authData.adyenTransactionId,
              resultCode: authData.adyenResponse.resultCode,
              authCode: authData.adyenResponse.authCode,
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

  const handleStep2 = async () => {
    setHasClicked(true);
    setIsLoading(true);
    setError(null);

    try {
      // Step 2: Relay Incremental Authorization using Adyen Transaction ID
      const relayData = await makeAuthenticatedRequest('/api/relay/incremental-auth', {
        method: 'POST',
        body: JSON.stringify({
          adyen_transaction_id: adyenTransactionId,
          additional_amount: parseInt(additionalAmount, 10),
          currency: 'USD',
        }),
      }, mode, debugCreds);

      if (relayData.error) {
        throw new Error(relayData.error.message || 'Relay incremental auth failed');
      }

      setResult(relayData);
      setStep(3);

      // Update API response panel
      setApiResponse((prev) => ({
        steps: [
          ...prev.steps,
          {
            title: 'Step 2: Hyperswitch Relay - Incremental Authorization',
            request: {
              method: 'POST',
              url: '/relay',
              headers: {
                'X-Profile-Id': 'pro_N6tqlbSOXjTN42Go3dgL',
              },
              body: {
                connector_id: 'mca_zaNgRbqSDoFFEyDDamoj',
                connector_resource_id: adyenTransactionId,
                type: 'incremental_authorization',
                data: {
                  amount: parseInt(additionalAmount, 10),
                },
              },
            },
            response: filters.relay({
              payment_id: relayData.relayId,
              status: relayData.status,
              amount: parseInt(additionalAmount, 10),
              amount_capturable: parseInt(additionalAmount, 10),
              amount_received: 0,
            }),
          },
        ],
        currentStep: 2,
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 sm:p-4">
        <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-1 sm:mb-2 text-base sm:text-lg">
          Relay - Incremental Authorization
        </h3>
        <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-400">
          Two-step flow: Adyen Authorization → Relay Incremental Auth
        </p>
        <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-400 mt-1 font-mono break-all">
          <strong>Card:</strong> {CARD_DATA.card_number}
          <span className="mx-1">|</span>
          <strong>Exp:</strong> {CARD_DATA.card_exp_month}/{CARD_DATA.card_exp_year}
        </p>
      </div>

      {step === 1 && (
        <button
          onClick={handleStep1}
          disabled={isLoading || hasClicked}
          className="w-full min-h-[44px] bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          {isLoading ? 'Processing...' : 'Step 1: Adyen Authorization ($100)'}
        </button>
      )}

      {step === 2 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Adyen Transaction ID (Key Resource):</strong>
            </p>
            <p className="text-base sm:text-lg font-mono text-yellow-700 dark:text-yellow-400 mt-1 break-all">
              {adyenTransactionId}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1.5 sm:mt-2">
              This Transaction ID is used in the Relay API call to Hyperswitch
            </p>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Additional Amount (cents)
            </label>
            <input
              type="number"
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(e.target.value)}
              className="w-full min-h-[44px] px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              placeholder="Enter additional amount in cents"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: ${parseInt(additionalAmount) / 100}
            </p>
          </div>

          <button
            onClick={handleStep2}
            disabled={isLoading || hasClicked}
            className="w-full min-h-[44px] bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading ? 'Processing...' : 'Step 2: Relay Incremental Auth via Hyperswitch'}
          </button>
        </div>
      )}

      {step === 3 && result && (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-900 dark:text-green-300 mb-2 text-sm sm:text-base">Incremental Authorization Successful!</h4>
          <div className="text-xs sm:text-sm text-green-700 dark:text-green-400 space-y-1 break-all">
            <p><strong>Relay ID:</strong> {result.relayId}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Adyen Transaction ID:</strong> {result.adyenTransactionId}</p>
            <p><strong>Additional Amount:</strong> ${parseInt(additionalAmount) / 100}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">{error}</p>
        </div>
      )}
    </div>
  );
};

export default RelayIncrementalAuth;
