import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { apiResponseState } from '../utils/atoms';
import API_BASE_URL from '../config';

// Static values from Setup Recurring and Charge flow
const STATIC_CUSTOMER_ID = 'cus_1773486075830';
const STATIC_PAYMENT_METHOD_ID = 'pm_tP3aIuMShtgohSEJnslE';

const RecurringCharge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);
  const setApiResponse = useSetRecoilState(apiResponseState);

  const handleRecurringCharge = async () => {
    setHasClicked(true);
    setIsLoading(true);
    setError(null);

    try {
      // Create recurring charge (server-side, no SDK)
      const chargeRes = await fetch(`${API_BASE_URL}/api/create-recurring-charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: STATIC_CUSTOMER_ID,
          payment_method_id: STATIC_PAYMENT_METHOD_ID,
          amount: 10000,
        }),
      });
      const chargeData = await chargeRes.json();

      if (chargeData.error) {
        throw new Error(chargeData.error.message);
      }

      setResult(chargeData);

      // Update API response panel - Step 2 only (no Step 1 for Recurring Charge)
      setApiResponse({
        steps: [
          {
            title: 'Step 2: Server Recurring Charge',
            request: {
              method: 'POST',
              url: '/payments',
              body: {
                amount: 10000,
                currency: 'USD',
                customer_id: STATIC_CUSTOMER_ID,
                off_session: true,
                recurring_details: {
                  type: 'payment_method_id',
                  data: STATIC_PAYMENT_METHOD_ID,
                },
              },
            },
            response: {
              payment_id: chargeData.payment_id,
              status: chargeData.status,
              payment_method_id: chargeData.payment_method_id,
              connector_mandate_id: chargeData.connector_mandate_id,
              network_transaction_id: chargeData.network_transaction_id,
              customer_id: STATIC_CUSTOMER_ID,
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
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          Server-Side Recurring Charge
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          This flow charges using a saved payment method from a previous "Setup Recurring and Charge" flow.
          <br />
          <strong>Customer ID:</strong> {STATIC_CUSTOMER_ID}
          <br />
          <strong>Payment Method ID:</strong> {STATIC_PAYMENT_METHOD_ID}
        </p>
      </div>

      <button
        onClick={handleRecurringCharge}
        disabled={isLoading || hasClicked}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
      >
        Execute Recurring Charge ($100)
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
            <p><strong>Payment ID:</strong> {result.payment_id}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Payment Method ID:</strong> {result.payment_method_id || 'N/A'}</p>
            <p><strong>Connector Mandate ID:</strong> {result.connector_mandate_id || 'N/A'}</p>
            <p><strong>Network Transaction ID:</strong> {result.network_transaction_id || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringCharge;
