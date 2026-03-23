import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { apiResponseState } from '../utils/atoms';
import API_BASE_URL from '../config';

const CARD_DATA = {
  card_number: '4111111111111111',
  card_exp_month: '03',
  card_exp_year: '30',
  card_cvc: '737',
  card_holder_name: 'John Doe',
};

const RelayRefund = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [adyenTransactionId, setAdyenTransactionId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);
  const setApiResponse = useSetRecoilState(apiResponseState);

  const handleStep1 = async () => {
    setHasClicked(true);
    setIsLoading(true);
    setError(null);

    try {
      const authRes = await fetch(`${API_BASE_URL}/api/adyen/authorize-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 10000,
          card_data: CARD_DATA,
        }),
      });
      const authData = await authRes.json();

      if (authData.error) {
        throw new Error(authData.error.message || 'Adyen auth+capture failed');
      }

      setAdyenTransactionId(authData.adyenTransactionId);
      setStep(2);
      setHasClicked(false);

      setApiResponse({
        steps: [
          {
            title: 'Step 1: Adyen Direct Authorization + Capture',
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
                captureDelayHours: 0,
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
      const relayRes = await fetch(`${API_BASE_URL}/api/relay/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adyen_transaction_id: adyenTransactionId,
          amount: 10000,
        }),
      });
      const relayData = await relayRes.json();

      if (relayData.error) {
        throw new Error(relayData.error.message || 'Relay refund failed');
      }

      setResult(relayData);
      setStep(3);

      setApiResponse((prev) => ({
        steps: [
          ...prev.steps,
          {
            title: 'Step 2: Hyperswitch Relay - Refund',
            request: {
              method: 'POST',
              url: '/relay',
              headers: {
                'X-Profile-Id': 'pro_N6tqlbSOXjTN42Go3dgL',
              },
              body: {
                connector_id: 'mca_zaNgRbqSDoFFEyDDamoj',
                connector_resource_id: adyenTransactionId,
                type: 'refund',
                data: {
                  refund: {
                    amount: 10000,
                    currency: 'USD',
                    reason: 'Customer request',
                  },
                },
              },
            },
            response: {
              relay_id: relayData.relayId,
              status: relayData.status,
              type: relayData.type,
              adyen_transaction_id: relayData.adyenTransactionId,
            },
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
          Relay - Refund
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Two-step flow: Adyen Auth+Capture → Relay Refund
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
{isLoading ? 'Processing...' : 'Step 1: Adyen Auth + Capture ($100)'}
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
{isLoading ? 'Processing...' : 'Step 2: Relay Refund via Hyperswitch'}
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
          <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Relay Refund Complete!</h4>
          <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <p><strong>Relay ID:</strong> {result.relayId}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Type:</strong> {result.type}</p>
            <p><strong>Adyen Transaction ID:</strong> {result.adyenTransactionId}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelayRefund;
