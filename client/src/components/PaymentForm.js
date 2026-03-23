import React, { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { hyperState, apiResponseState, paymentStatusState, customerState, captureCompleteState } from '../utils/atoms';
import ServerButton from './ServerButton';
import API_BASE_URL from '../config';

// Test card data for all SDK flows
const TEST_CARD_DATA = {
  card_number: '4111111111111111',
  card_exp_month: '03',
  card_exp_year: '30',
  card_cvc: '737',
  card_holder_name: 'John Doe',
};

// Test data display component
const TestDataPrompt = () => (
  <div className="absolute top-20 right-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg max-w-xs z-10">
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

// Helper to get request body based on flow
const getRequestBodyForFlow = (flow) => {
  const base = {
    currency: 'USD',
  };

  switch (flow.id) {
    case 'zero_setup':
      return {
        ...base,
        amount: 0,
        setup_future_usage: 'off_session',
        mandate_data: {
          customer_acceptance: { acceptance_type: 'offline' },
          mandate_type: {
            multi_use: {
              amount: 10000,
              currency: 'USD',
            },
          },
        },
      };
    case 'setup_and_charge':
      return {
        ...base,
        amount: 10000,
        setup_future_usage: 'off_session',
        mandate_data: {
          customer_acceptance: { acceptance_type: 'offline' },
          mandate_type: {
            multi_use: {
              amount: 10000,
              currency: 'USD',
            },
          },
        },
      };
    case 'recurring_charge':
      return {
        ...base,
        amount: 10000,
        off_session: true,
        recurring_details: {
          type: 'payment_method_id',
          data: 'pm_default_saved',
        },
      };
    case 'manual':
    case 'manual_partial':
      return {
        ...base,
        amount: 10000,
        capture_method: 'manual',
      };
    case 'repeat_user':
      return {
        ...base,
        amount: 10000,
        capture_method: 'automatic',
      };
    case 'three_ds_psp':
      return {
        ...base,
        amount: 10000,
        capture_method: 'automatic',
        authentication_type: 'three_ds',
      };
    case 'frm_pre':
      return {
        ...base,
        amount: 10000,
        capture_method: 'automatic',
      };
    default:
      return {
        ...base,
        amount: 10000,
        capture_method: 'automatic',
      };
  }
};

const PaymentForm = ({ flow }) => {
  const hyper = useRecoilValue(hyperState);
  const setApiResponse = useSetRecoilState(apiResponseState);
  const setPaymentStatus = useSetRecoilState(paymentStatusState);
  const setCustomer = useSetRecoilState(customerState);
  const captureComplete = useRecoilValue(captureCompleteState);
  
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  // Create payment intent on mount or when flow changes
  useEffect(() => {
    if (!hyper || !flow) return;

    const createIntent = async () => {
      setIsLoading(true);
      setError(null);
      setClientSecret(null);
      setPaymentId(null);
      setStatus(null);

      try {
        let customerId = 'cus_demo_001'; // Default customer for non-recurring flows

        // For Payment Flows and Recurring flows, create a new customer first
        if (['automatic', 'manual', 'manual_partial', 'three_ds_psp', 'frm_pre', 'vault_3'].includes(flow.id)) {
          // Payment flows: Create new customer
          const customerRes = await fetch(`${API_BASE_URL}/api/create-customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const customerData = await customerRes.json();
          customerId = customerData.customer_id;
        } else if (flow.id === 'repeat_user') {
          // Repeat User: Use static customer ID
          customerId = 'cus_RT2Uq7JI8Z8fRcg8lDOo';
        } else if (flow.id === 'zero_setup' || flow.id === 'setup_and_charge') {
          // Recurring flows: Create new customer
          const customerRes = await fetch(`${API_BASE_URL}/api/create-customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const customerData = await customerRes.json();
          customerId = customerData.customer_id;
        }

        const response = await fetch(`${API_BASE_URL}/api/create-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flowType: flow.id,
            amount: flow.id === 'zero_setup' ? 0 : 10000,
            customer_id: customerId,
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

        // Ensure client secret exists
        if (!data.clientSecret) {
          console.error('Server response missing client_secret:', data);
          throw new Error('No client secret returned from server - the customer may not exist in Hyperswitch');
        }

        setClientSecret(data.clientSecret);
        setPaymentId(data.paymentId);
        setStatus(data.status);

        // Build steps array
        const steps = [];
        
        // Add customer creation step for flows that create new customers
        if (['automatic', 'manual', 'manual_partial', 'three_ds_psp', 'frm_pre', 'vault_3', 'zero_setup', 'setup_and_charge'].includes(flow.id)) {
          steps.push({
            title: 'Step 1: Create Customer',
            request: {
              method: 'POST',
              url: '/customers',
            },
            response: {
              customer_id: customerId,
            },
          });
        }

        // Calculate step numbers based on whether Step 1 exists
        const hasStep1 = ['automatic', 'manual', 'manual_partial', 'repeat_user', 'three_ds_psp', 'frm_pre', 'vault_3', 'zero_setup', 'setup_and_charge'].includes(flow.id);
        const step2Number = hasStep1 ? 2 : 2; // Repeat user starts at Step 2
        const step3Number = hasStep1 ? 3 : 3;
        
        steps.push({
          title: `Step ${step2Number}: Create Payment Intent`,
          request: {
            method: 'POST',
            url: '/payments',
            body: {
              ...getRequestBodyForFlow(flow),
              ...(flow.id === 'vault_3' && { profile_id: 'pro_ukJVFiPH0bzYFZwBPi9j' }),
            },
          },
          response: {
            payment_id: data.paymentId,
            client_secret: data.clientSecret,
            status: data.status,
            capture_method: data.captureMethod,
            amount: data.amount,
            customer_id: data.customerId,
            profile_id: data.profileId || (flow.id === 'vault_3' ? 'pro_ukJVFiPH0bzYFZwBPi9j' : 'default'),
          },
        });

        steps.push({
          title: `Step ${step3Number}: SDK Payment Confirmation`,
          request: '[SDK Placeholder - User enters card details]',
          response: 'Waiting for user...',
        });

        setApiResponse({
          steps,
          currentStep: 1,
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [hyper, flow, setApiResponse]);

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
    paymentElement.mount('#payment-element');

    return () => {
      paymentElement.destroy();
    };
  }, [hyper, clientSecret]);

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

      // Fetch full payment details to get all important IDs
      const paymentDetailsRes = await fetch(`${API_BASE_URL}/api/payment/${paymentId}`);
      const paymentDetails = await paymentDetailsRes.json();

        // Update API response with SDK result - preserve all steps
      setApiResponse((prev) => {
        const steps = [...prev.steps];
        const hasStep1 = ['automatic', 'manual', 'manual_partial', 'repeat_user', 'three_ds_psp', 'frm_pre', 'vault_3', 'zero_setup', 'setup_and_charge'].includes(flow.id);
        const sdkStepIndex = hasStep1 ? 2 : 1;
        
        // Build response object based on flow type - matching FLOW_MAPPINGS_V1.md exactly
        let responseData = {
          status: paymentStatus,
          payment_id: paymentId,
        };
        
        // Vault Flow: Show specific fields for external vault storage
        if (flow.id === 'vault_3') {
          responseData = {
            status: paymentStatus,
            payment_id: paymentId,
            customer_id: paymentDetails.customer_id,
            connector_transaction_id: paymentDetails.connector_transaction_id,
            network_transaction_id: paymentDetails.network_transaction_id,
          };
        }
        
        // Recurring Flows: Show mandate fields
        if (['zero_setup', 'setup_and_charge'].includes(flow.id)) {
          responseData.payment_method_id = paymentDetails.payment_method_id;
          responseData.mandate_id = paymentDetails.mandate_id;
          responseData.connector_mandate_id = paymentDetails.connector_mandate_id;
          responseData.network_transaction_id = paymentDetails.network_transaction_id;
        }
        
        // 3DS Flows: Show authentication_type
        if (flow.id === 'three_ds_psp') {
          responseData.authentication_type = paymentDetails.authentication_type;
        }
        
        // FRM Flows: Show frm_message
        if (flow.id === 'frm_pre') {
          responseData.frm_message = paymentDetails.frm_message;
        }
        
        steps[sdkStepIndex] = {
          title: ['manual', 'manual_partial', 'zero_setup', 'setup_and_charge', 'three_ds_psp', 'frm_pre', 'vault_3'].includes(flow.id) ? 'Step 3: SDK Payment Confirmation' : 'Step 2: SDK Payment Confirmation',
          subTitle: flow.id === 'vault_3' ? 'Card stored in VGS vault (sandbox)' : undefined,
          request: 'hyper.confirmPayment()',
          response: responseData,
        };

        return { steps, currentStep: sdkStepIndex + 1 };
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
        <span className="ml-3 text-gray-600 dark:text-gray-400">Creating payment intent...</span>
      </div>
    );
  }

  return (
    <>
      <TestDataPrompt />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Card Details
          </label>
          <div 
            id="payment-element" 
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            {/* PaymentElement mounts here */}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isProcessing || !clientSecret || hasClicked}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? 'Processing...' 
              : flow.id === 'zero_setup' 
                ? 'Setup Recurring ($0)' 
                : flow.id === 'manual' || flow.id === 'manual_partial' 
                  ? 'Authorize $100' 
                  : 'Pay $100.00'
            }
          </button>

          {(flow.id === 'manual' || flow.id === 'manual_partial') && status === 'requires_capture' && (
            <ServerButton paymentId={paymentId} flow={flow} />
          )}
        </div>

        {status && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`font-medium ${
              captureComplete || status === 'succeeded' ? 'text-green-600' : 
              status === 'requires_capture' ? 'text-yellow-600' : 
              'text-gray-600'
            }`}>
              {captureComplete ? 'succeeded' : status.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </form>
    </>
  );
};

export default PaymentForm;
