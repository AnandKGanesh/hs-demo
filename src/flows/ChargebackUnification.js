import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { apiResponseState } from '../utils/atoms';

const ChargebackUnification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState(null);
  const setApiResponse = useSetRecoilState(apiResponseState);

  const handleListDisputes = async () => {
    setIsLoading(true);
    setError(null);
    setDisputes([]);

    try {
      const response = await fetch('http://localhost:5252/api/list-disputes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch disputes');
      }

      // API returns array directly, not wrapped in data object
      const disputesArray = Array.isArray(data) ? data : (data.data || []);
      setDisputes(disputesArray);

      // Update API response panel
      setApiResponse({
        steps: [
          {
            title: 'Step 1: List Disputes',
            request: {
              method: 'GET',
              url: '/disputes/list',
              headers: {
                'api-key': '***'
              }
            },
            response: {
              disputes_count: disputesArray.length,
              disputes: disputesArray.map(d => ({
                dispute_id: d.dispute_id,
                payment_id: d.payment_id,
                amount: d.amount,
                currency: d.currency,
                status: d.dispute_status,
                stage: d.dispute_stage,
                connector: d.connector,
                reason: d.connector_reason,
                reason_code: d.connector_reason_code,
                created_at: d.created_at,
              })),
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
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <h3 className="font-medium text-orange-900 dark:text-orange-300 mb-2">
          Chargeback Unification
        </h3>
        <p className="text-sm text-orange-700 dark:text-orange-400">
          List and view all disputes and chargebacks for your merchant account.
        </p>
      </div>

      <button
        onClick={handleListDisputes}
        disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Fetching Disputes...' : 'List All Disputes'}
      </button>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {disputes.length > 0 && (
        <div className="space-y-4 -mx-6">
          <h4 className="font-medium text-gray-900 dark:text-white px-6">
            Found {disputes.length} Dispute(s)
          </h4>
          
          <div className="overflow-x-auto px-6">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dispute ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Connector</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {disputes.map((dispute) => (
                  <tr key={dispute.dispute_id}>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900 dark:text-white">
                      {dispute.dispute_id}
                    </td>
                    <td className="px-4 py-2 text-sm font-mono text-gray-500 dark:text-gray-400">
                      {dispute.payment_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white capitalize">
                      {dispute.connector}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {(parseInt(dispute.amount) / 100).toFixed(2)} {dispute.currency}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        dispute.dispute_status === 'dispute_opened' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : dispute.dispute_status === 'dispute_accepted'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : dispute.dispute_status === 'dispute_lost'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {dispute.dispute_status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {dispute.dispute_stage?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {dispute.connector_reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {disputes.length === 0 && !isLoading && !error && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No disputes found. Click "List All Disputes" to fetch.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChargebackUnification;
