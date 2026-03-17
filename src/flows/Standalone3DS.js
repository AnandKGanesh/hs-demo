import React, { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { hyperState, apiResponseState, paymentStatusState } from '../utils/atoms';

// Test data for Standalone 3DS
const TEST_DATA = {
  card_number: '4929251897047956',
  card_exp_month: '03',
  card_exp_year: '30',
  card_cvc: '737',
  card_holder_name: 'joseph Doe',
};

const Standalone3DS = () => {
  const hyper = useRecoilValue(hyperState);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const setPaymentStatus = useSetRecoilState(paymentStatusState);
  
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // Create customer and payment intent on mount
  useEffect(() => {
    if (!hyper) return;

    const initialize3DS = async () => {
      setIsLoading(true);
      setError(null);
      setClientSecret(null);
      setPaymentId(null);
      setStatus(null);
      setPaymentResult(null);

      try {
        // Step 1: Create Customer
        const customerRes = await fetch('http://localhost:5252/api/create-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const customerData = await customerRes.json();
        const customerId = customerData.customer_id;

        // Step 2: Create Payment Intent with 3DS via PSP
        const paymentData = {
          amount: 6500,
          currency: 'USD',
          confirm: false,
          customer_id: customerId,
          profile_id: 'pro_1ZrfdulAlyqvRf0CCROa',
          capture_method: 'automatic',
          authentication_type: 'three_ds',
          request_external_three_ds_authentication: true,
          setup_future_usage: 'on_session',
          email: 'user@gmail.com',
          description: 'Hello this is description',
          return_url: 'https://hyperswitch-demo-store.netlify.app/?isTestingMode=true',
          order_details: [
            {
              product_name: 'Apple iphone 15',
              amount: 6500,
              quantity: 1,
            },
          ],
          metadata: {
            udf1: 'value1',
            login_date: '2019-09-10T10:11:12Z',
            new_customer: 'true',
          },
          billing: {
            address: {
              city: 'San Fransico',
              country: 'US',
              line1: '1467',
              line2: 'Harrison Street',
              line3: 'Harrison Street',
              zip: '94122',
              state: 'California',
              first_name: 'joseph',
              last_name: 'Doe',
            },
            phone: {
              number: '8056594427',
              country_code: '+91',
            },
            email: null,
          },
          shipping: {
            address: {
              city: 'Banglore',
              country: 'US',
              line1: 'sdsdfsdf',
              line2: 'hsgdbhd',
              line3: 'alsksoe',
              zip: '571201',
              state: 'California',
              first_name: 'John',
              last_name: 'Doe',
            },
            phone: {
              number: '123456789',
              country_code: '+1',
            },
            email: null,
          },
        };

        const response = await fetch('http://localhost:5252/api/create-intent-3ds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'Unknown error from server');
        }

        if (!data.clientSecret) {
          throw new Error('No client secret returned from server');
        }

        setClientSecret(data.clientSecret);
        setPaymentId(data.paymentId);
        setStatus(data.status);

        // Set API response steps
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
              title: 'Step 2: Create Payment Intent (3DS via PSP)',
              request: {
                method: 'POST',
                url: '/payments',
                body: {
                  amount: 6500,
                  currency: 'USD',
                  authentication_type: 'three_ds',
                  request_external_three_ds_authentication: true,
                  profile_id: 'pro_1ZrfdulAlyqvRf0CCROa',
                },
              },
              response: {
                payment_id: data.paymentId,
                client_secret: data.clientSecret,
                status: data.status,
              },
            },
            {
              title: 'Step 3: SDK Payment Confirmation',
              request: '[SDK Placeholder - User enters test card details]',
              response: 'Waiting for user...',
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

    initialize3DS();
  }, [hyper, setApiResponse]);

  // Initialize elements when client secret is available
  useEffect(() => {
    if (!hyper || !clientSecret) return;

    const elements = hyper.elements({
      clientSecret,
      appearance: {
        theme: 'default',
        labels: 'floating',
      },
    });

    const paymentElement = elements.create('payment');
    paymentElement.mount('#standalone-3ds-payment-element');

    return () => {
      paymentElement.destroy();
    };
  }, [hyper, clientSecret]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hyper || !clientSecret) return;

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

      // Fetch full payment details
      const paymentDetailsRes = await fetch(`http://localhost:5252/api/payment/${paymentId}`);
      const paymentDetails = await paymentDetailsRes.json();

      setPaymentResult(paymentDetails);

      // Update API response
      setApiResponse((prev) => {
        const steps = [...prev.steps];
        steps[2] = {
          title: 'Step 3: SDK Payment Confirmation',
          request: 'hyper.confirmPayment()',
          response: {
            payment_id: paymentDetails.payment_id,
            status: paymentDetails.status,
            amount: paymentDetails.amount,
            merchant_id: paymentDetails.merchant_id,
            external_authentication_details: paymentDetails.external_authentication_details,
            external_3ds_authentication_attempted: paymentDetails.external_3ds_authentication_attempted,
          },
        };
        return { steps, currentStep: 3 };
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Data Box */}
      <div className="absolute top-20 right-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg max-w-xs">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-2">
          Test Data
        </h4>
        <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
          <p><span className="font-medium">Card:</span> {TEST_DATA.card_number}</p>
          <p><span className="font-medium">Expiry:</span> {TEST_DATA.card_exp_month}/{TEST_DATA.card_exp_year}</p>
          <p><span className="font-medium">CVC:</span> {TEST_DATA.card_cvc}</p>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
          Standalone 3D Secure
        </h3>
        <p className="text-sm text-purple-700 dark:text-purple-400">
          Complete 3DS authentication flow via Hyperswitch with PSP authentication enabled.
          <br />
          <strong>Amount:</strong> $65.00 | <strong>Profile:</strong> pro_1ZrfdulAlyqvRf0CCROa
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Initializing 3DS flow...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {clientSecret && !paymentResult && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div id="standalone-3ds-payment-element"></div>
          </div>
          
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing 3DS Authentication...' : 'Pay $65.00'}
          </button>
        </form>
      )}

      {paymentResult && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
          <h4 className="font-medium text-green-900 dark:text-green-300">3DS Payment Successful!</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-400">
            <div>
              <p className="font-medium">Payment ID:</p>
              <p className="font-mono">{paymentResult.payment_id}</p>
            </div>
            <div>
              <p className="font-medium">Status:</p>
              <p>{paymentResult.status}</p>
            </div>
            <div>
              <p className="font-medium">Amount:</p>
              <p>${(paymentResult.amount / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Merchant ID:</p>
              <p className="font-mono">{paymentResult.merchant_id}</p>
            </div>
          </div>

          {paymentResult.external_authentication_details && (
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
              <p className="font-medium text-green-900 dark:text-green-300 mb-2">3DS Authentication Details:</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-400">
                <div>
                  <p className="font-medium">Flow:</p>
                  <p>{paymentResult.external_authentication_details.authentication_flow}</p>
                </div>
                <div>
                  <p className="font-medium">Status:</p>
                  <p>{paymentResult.external_authentication_details.status}</p>
                </div>
                <div>
                  <p className="font-medium">ECI:</p>
                  <p>{paymentResult.external_authentication_details.electronic_commerce_indicator}</p>
                </div>
                <div>
                  <p className="font-medium">Version:</p>
                  <p>{paymentResult.external_authentication_details.version}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">DS Transaction ID:</p>
                  <p className="font-mono text-xs">{paymentResult.external_authentication_details.ds_transaction_id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Standalone3DS;
