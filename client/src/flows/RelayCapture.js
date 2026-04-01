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

const RelayCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [adyenTransactionId, setAdyenTransactionId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
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

      setAdyenTransactionId(authData.adyen_transaction_id);
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
              adyen_transaction_id: authData.adyen_transaction_id,
              resultCode: authData.adyen_response?.resultCode,
              authCode: authData.adyen_response?.authCode,
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
      // Step 2: Relay Capture using Adyen Transaction ID
      const relayData = await makeAuthenticatedRequest('/api/relay/capture', {
        method: 'POST',
        body: JSON.stringify({
          adyen_transaction_id: adyenTransactionId,
          amount: 10000,
        }),
      }, mode, debugCreds);

      if (relayData.error) {
        throw new Error(relayData.error.message || 'Relay capture failed');
      }

      setResult(relayData);
      setStep(3);

      // Update API response panel
      setApiResponse((prev) => ({
        steps: [
          ...prev.steps,
          {
            title: 'Step 2: Hyperswitch Relay - Capture',
            request: {
              method: 'POST',
              url: '/relay',
              headers: {
                'X-Profile-Id': 'pro_N6tqlbSOXjTN42Go3dgL',
              },
              body: {
                connector_id: 'mca_zaNgRbqSDoFFEyDDamoj',
                connector_resource_id: adyenTransactionId,
                type: 'capture',
                data: {
                  capture: {
                    authorized_amount: 10000,
                    amount_to_capture: 10000,
                    currency: 'USD',
                    capture_method: 'automatic',
                  },
                },
              },
            },
            response: filters.relay({
              relay_id: relayData.relay_id,
              status: relayData.status,
              type: relayData.type,
              connector_id: relayData.connector_id,
              connector_resource_id: relayData.connector_resource_id,
              adyen_transaction_id: relayData.adyen_transaction_id,
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
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          Relay - Capture
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Two-step flow: Adyen Authorization → Relay Capture
          <br />
          <strong>Card:</strong> {CARD_DATA.card_number} | Exp: {CARD_DATA.card_exp_month}/{CARD_DATA.card_exp_year}
        </p>
      </div>

      {step === 1 && (
        <button
          onClick={handleStep1}
          disabled={isLoading || hasClicked}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Step 1: Adyen Authorization ($100)'}
        </button>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Adyen Transaction ID (Key Resource):</strong>
            </p>
            <p className="text-lg font-mono text-yellow-700 dark:text-yellow-400 mt-1 break-all">
              {adyenTransactionId}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              This Transaction ID is used in the Relay API call to Hyperswitch
            </p>
          </div>
          <button
            onClick={handleStep2}
            disabled={isLoading || hasClicked}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Step 2: Relay Capture via Hyperswitch'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Relay Capture Complete!</h4>
          <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <p><strong>Relay ID:</strong> {result.relay_id}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Type:</strong> {result.type}</p>
            <p><strong>Adyen Transaction ID:</strong> {result.adyen_transaction_id}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelayCapture;
