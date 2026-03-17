import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { apiResponseState } from '../utils/atoms';

// Static 3DS data
const THREE_DS_DATA = {
  authentication_cryptogram: {
    cavv: {
      authentication_cryptogram: "3q2+78r+ur7erb7vyv66vv////8="
    }
  },
  ds_trans_id: "c4e59ceb-a382-4d6a-bc87-385d591fa09d",
  version: "2.1.0",
  eci: "05",
  transaction_status: "Y",
  exemption_indicator: "low_value"
};

const Import3DSResults = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const setApiResponse = useSetRecoilState(apiResponseState);

  const handleImport3DS = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create Customer
      const customerRes = await fetch('http://localhost:5252/api/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const customerData = await customerRes.json();
      const customerId = customerData.customer_id;

      // Step 2: Create Payment with 3DS Data and Card Details (server-side only, confirm: true)
      const response = await fetch('http://localhost:5252/api/import-3ds-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 10000,
          customer_id: customerId,
          three_ds_data: THREE_DS_DATA,
          card_data: {
            card_number: '4111111111111111',
            card_exp_month: '03',
            card_exp_year: '30',
            card_cvc: '737',
            card_holder_name: 'John Doe',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Unknown error from server');
      }

      setResult(data);

      // Update API response panel - Step 2 only (no Step 3 SDK for Import 3DS)
      setApiResponse({
        steps: [
          {
            title: 'Step 1: Create Customer',
            request: {
              method: 'POST',
              url: '/customers',
            },
            response: {
              customer_id: customerId,
            },
          },
          {
            title: 'Step 2: Server Payment with Imported 3DS Results',
            request: {
              method: 'POST',
              url: '/payments',
              body: {
                amount: 10000,
                currency: 'USD',
                capture_method: 'automatic',
                customer_id: customerId,
                confirm: true,
                payment_method: 'card',
                payment_method_type: 'credit',
                payment_method_data: {
                  card: {
                    card_number: '4111111111111111',
                    card_exp_month: '03',
                    card_exp_year: '30',
                    card_cvc: '737',
                    card_holder_name: 'John Doe',
                  },
                },
                three_ds_data: THREE_DS_DATA,
              },
            },
            response: {
              payment_id: data.paymentId,
              status: data.status,
              authentication_type: data.authenticationType || 'three_ds',
              capture_method: data.captureMethod,
              amount: data.amount,
              customer_id: data.customerId,
            },
          },
        ],
        currentStep: 2,
      });

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
          Import 3D Secure Results
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          This flow processes a payment with pre-authenticated 3DS results (server-side only).
          <br />
          <strong>3DS Version:</strong> 2.1.0 | <strong>ECI:</strong> 05 | <strong>Status:</strong> Y
        </p>
      </div>

      <button
        onClick={handleImport3DS}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Execute Import 3DS Results ($100)'}
      </button>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Success!</h4>
          <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <p><strong>Payment ID:</strong> {result.paymentId}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Authentication Type:</strong> {result.authenticationType || 'three_ds'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Import3DSResults;
