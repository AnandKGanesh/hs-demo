import React, { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { hyperState, apiResponseState, paymentStatusState, themeState } from '../utils/atoms';
import API_BASE_URL from '../config';

const TEST_CARD_DATA = {
  card_number: '4242424242424242',
  card_exp_month: '02',
  card_exp_year: '27',
  card_cvc: '737',
  card_holder_name: 'John Doe',
};

const TestDataPrompt = () => (
  <div className="relative sm:absolute sm:top-20 sm:right-6 mb-4 sm:mb-0 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 shadow-lg sm:max-w-xs z-10">
    <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-2">
      Test Data
    </h4>
    <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
      <p><span className="font-medium">Card:</span> {TEST_CARD_DATA.card_number}</p>
      <p><span className="font-medium">Expiry:</span> {TEST_CARD_DATA.card_exp_month}/{TEST_CARD_DATA.card_exp_year}</p>
      <p><span className="font-medium">CVC:</span> {TEST_CARD_DATA.card_cvc}</p>
      <p><span className="font-medium">Name:</span> {TEST_CARD_DATA.card_holder_name}</p>
    </div>
  </div>
);

const SplitSettlement = ({ flow }) => {
  const hyper = useRecoilValue(hyperState);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const setPaymentStatus = useSetRecoilState(paymentStatusState);
  const theme = useRecoilValue(themeState);
  
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  
  const [chargeType, setChargeType] = useState('direct');
  const [applicationFees, setApplicationFees] = useState(100);
  const [transferAccountId, setTransferAccountId] = useState('acct_1RWCjbRT4izcUWmO');

  useEffect(() => {
    if (!hyper || !flow) return;

    const createIntent = async () => {
      setIsLoading(true);
      setError(null);
      setClientSecret(null);
      setPaymentId(null);
      setStatus(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/create-split-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 15000,
            currency: 'USD',
            capture_method: 'automatic',
            routing: { type: 'single', data: 'stripe' },
            split_payments: {
              stripe_split_payment: {
                charge_type: chargeType,
                application_fees: applicationFees,
                transfer_account_id: transferAccountId
              }
            }
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'Unknown error from server');
        }

        if (!data.client_secret) {
          throw new Error('No client secret returned from server');
        }

        setClientSecret(data.client_secret);
        setPaymentId(data.payment_id);
        setStatus(data.status);

        setApiResponse({
          steps: [
            {
              title: 'Step 1: Create Split Settlement Payment Intent',
              request: {
                method: 'POST',
                url: '/payments',
                body: {
                  amount: 15000,
                  currency: 'USD',
                  confirm: false,
                  capture_method: 'automatic',
                  routing: { type: 'single', data: 'stripe' },
                  split_payments: {
                    stripe_split_payment: {
                      charge_type: chargeType,
                      application_fees: applicationFees,
                      transfer_account_id: transferAccountId
                    }
                  }
                },
              },
              response: {
                payment_id: data.payment_id,
                client_secret: data.client_secret,
                status: data.status,
                amount: data.amount,
                currency: data.currency,
              },
            },
            {
              title: 'Step 2: SDK Payment Confirmation',
              request: '[SDK Placeholder - User enters card details]',
              response: 'Waiting for user...',
            }
          ],
          currentStep: 1,
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [hyper, flow, chargeType, applicationFees, transferAccountId, setApiResponse]);

  useEffect(() => {
    if (!hyper || !clientSecret) return;

    const isDark = theme === 'dark';
    
    const elements = hyper.elements({
      clientSecret,
      appearance: {
        theme: isDark ? 'night' : 'default',
        labels: 'floating',
        variables: isDark ? {
          colorBackground: '#1f2937',
          colorText: '#f9fafb',
          colorPrimary: '#3b82f6',
          colorSurface: '#374151',
        } : undefined,
      },
    });

    const paymentElement = elements.create('payment');
    paymentElement.mount('#split-payment-element');

    return () => {
      paymentElement.destroy();
    };
  }, [hyper, clientSecret, theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hyper || !clientSecret || hasClicked) return;

    setHasClicked(true);
    setIsProcessing(true);
    setError(null);

    try {
      const { error: confirmError, status: paymentStatus } = await hyper.confirmPayment({
        elements: hyper.elements({ clientSecret }),
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      setStatus(paymentStatus);
      setPaymentStatus(paymentStatus);

      const paymentDetailsRes = await fetch(`${API_BASE_URL}/api/payment/${paymentId}`);
      const paymentDetails = await paymentDetailsRes.json();

      setApiResponse((prev) => {
        const steps = [...prev.steps];
        
        steps[1] = {
          title: 'Step 2: SDK Payment Confirmation',
          request: 'hyper.confirmPayment()',
          response: {
            payment_id: paymentId,
            status: paymentStatus,
            split_payments: paymentDetails.split_payments
          }
        };

        return { steps, currentStep: 2 };
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Creating split payment intent...</span>
      </div>
    );
  }

  return (
    <>
      <TestDataPrompt />
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            Split Settlement
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            Distribute funds between accounts using Stripe Connect.
            <br />
            <strong>Amount:</strong> $150.00 USD
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Split Payment Configuration
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Charge Type
              </label>
              <select
                value={chargeType}
                onChange={(e) => setChargeType(e.target.value)}
                disabled={isProcessing || hasClicked}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              >
                <option value="direct">Direct</option>
                <option value="destination">Destination</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Direct: Main merchant owns the charge. Destination: Connected account receives funds.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Application Fee (in cents)
              </label>
              <input
                type="number"
                value={applicationFees}
                onChange={(e) => setApplicationFees(parseInt(e.target.value))}
                disabled={isProcessing || hasClicked}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fee deducted from the charge. Current: ${(applicationFees / 100).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transfer Account ID
              </label>
              <input
                type="text"
                value={transferAccountId}
                onChange={(e) => setTransferAccountId(e.target.value)}
                disabled={isProcessing || hasClicked}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Stripe Connect account ID to receive funds
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Details
            </label>
            <div 
              id="split-payment-element" 
              className="p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-x-auto min-h-[60px]"
            >
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !clientSecret || hasClicked}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Pay $150.00 (${chargeType})`}
          </button>
        </form>

        {status && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`font-medium ${
              status === 'succeeded' ? 'text-green-600' : 
              status === 'failed' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {status}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default SplitSettlement;
