import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { apiResponseState } from '../utils/atoms';

// Static values for Network Transaction ID flow
const STATIC_CUSTOMER_ID = 'cus_1773486075830';
const STATIC_NTID = '728051028160682';

const RecurringChargeNTID = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const setApiResponse = useSetRecoilState(apiResponseState);

  const handleRecurringCharge = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create recurring charge using NTID (server-side, no SDK)
      const chargeRes = await fetch('http://localhost:5252/api/create-recurring-charge-ntid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: STATIC_CUSTOMER_ID,
          network_transaction_id: STATIC_NTID,
          amount: 10000,
          card_data: {
            card_number: '4111111111111111',
            card_exp_month: '03',
            card_exp_year: '30',
          },
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
            title: 'Step 2: Server Recurring Charge with NTID',
            request: {
              method: 'POST',
              url: '/payments',
              body: {
                amount: 10000,
                currency: 'USD',
                customer_id: STATIC_CUSTOMER_ID,
                off_session: true,
                recurring_details: {
                  type: 'network_transaction_id_and_card_details',
                  data: {
                    network_transaction_id: STATIC_NTID,
                    card_number: '4111111111111111',
                    card_exp_month: '03',
                    card_exp_year: '30',
                  },
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
          Server-Side Recurring Charge with Network Transaction ID
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          This flow charges using a Network Transaction ID (NTID) with card details.
          <br />
          <strong>Customer ID:</strong> {STATIC_CUSTOMER_ID}
          <br />
          <strong>Network Transaction ID:</strong> {STATIC_NTID}
          <br />
          <strong>Card:</strong> 4111111111111111 | Exp: 03/30 | CVC: 737
        </p>
      </div>

      <button
        onClick={handleRecurringCharge}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Execute Recurring Charge with NTID ($100)'}
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

export default RecurringChargeNTID;
