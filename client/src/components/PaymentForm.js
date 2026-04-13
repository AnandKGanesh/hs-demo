import React, { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { hyperState, apiResponseState, paymentStatusState, customerState, captureCompleteState, demoModeState, debugCredentialsState, themeState } from '../utils/atoms';
import ServerButton from './ServerButton';
import API_BASE_URL from '../config';
import { createCustomer, createPaymentIntent } from '../utils/api';
import { filters } from '../utils/fieldMappings';

// Test card data for all SDK flows
const TEST_CARD_DATA = {
  card_number: '4111111111111111',
  card_exp_month: '03',
  card_exp_year: '30',
  card_cvc: '737',
  card_holder_name: 'John Doe',
};

const captureApiCall = (request, response, setApiResponse, stepTitle) => {
  setApiResponse(prev => {
    const steps = [...(prev.steps || [])];
    const existingIndex = steps.findIndex(s => s.title.includes(stepTitle));
    
    const newStep = {
      title: stepTitle,
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.body,
      },
    };
    
    if (existingIndex >= 0) {
      steps[existingIndex] = newStep;
    } else {
      steps.push(newStep);
    }
    
    return { steps, currentStep: steps.length };
  });
};



// Test data display component
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
        payment_type: 'setup_mandate',
        mandate_data: {
          customer_acceptance: { acceptance_type: 'offline' },
        },
      };
    case 'setup_and_charge':
      return {
        ...base,
        amount: 10000,
        setup_future_usage: 'off_session',
        customer_acceptance: { acceptance_type: 'offline' },
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
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);
  
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const theme = useRecoilValue(themeState);

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
        let customerId = 'cus_demo_001';
        let customerRequestDetails = null;
        let customerResponseDetails = null;

        const onCustomerApiCall = (req, res) => {
          customerRequestDetails = req;
          customerResponseDetails = filters.customer(res);
        };

        const onPaymentIntentApiCall = (req, res) => {
          const steps = [];
          
          if (customerRequestDetails) {
            steps.push({
              title: 'Step 1: Create Customer',
              request: customerRequestDetails,
              response: customerResponseDetails,
            });
          }
          
          steps.push({
            title: customerRequestDetails ? 'Step 2: Create Payment Intent' : 'Step 1: Create Payment Intent',
            request: {
              method: req.method,
              url: req.url,
              headers: req.headers,
              body: getRequestBodyForFlow(flow),
            },
            response: filters.paymentIntent(res),
          });

          steps.push({
            title: customerRequestDetails ? 'Step 3: SDK Payment Confirmation' : 'Step 2: SDK Payment Confirmation',
            request: '[SDK Placeholder - User enters card details]',
            response: 'Waiting for user...',
          });

          setApiResponse({ steps, currentStep: 1 });
        };

        if (['automatic', 'manual', 'manual_partial', 'three_ds_psp', 'frm_pre', 'vault_3'].includes(flow.id)) {
          const customerData = await createCustomer(mode, debugCreds, onCustomerApiCall);
          customerId = customerData.customer_id;
        } else if (flow.id === 'repeat_user') {
          customerId = 'cus_RT2Uq7JI8Z8fRcg8lDOo';
        } else if (flow.id === 'zero_setup' || flow.id === 'setup_and_charge') {
          const customerData = await createCustomer(mode, debugCreds, onCustomerApiCall);
          customerId = customerData.customer_id;
        }

        const data = await createPaymentIntent(flow.id, flow.id === 'zero_setup' ? 0 : 10000, customerId, mode, debugCreds, onPaymentIntentApiCall);

        if (data.error) {
          throw new Error(data.error.message || 'Unknown error from server');
        }

        // Ensure client secret exists
        if (!data.client_secret) {
          console.error('Server response missing client_secret:', data);
          throw new Error('No client secret returned from server - the customer may not exist in Hyperswitch');
        }

        setClientSecret(data.client_secret);
        setPaymentId(data.payment_id);
        setStatus(data.status);

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
    paymentElement.mount('#payment-element');

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

      // Fetch full payment details to get all important IDs
      const paymentDetailsRes = await fetch(`${API_BASE_URL}/api/payment/${paymentId}`);
      const paymentDetails = await paymentDetailsRes.json();

      // Update API response with SDK result - preserve all steps
      setApiResponse((prev) => {
        const steps = [...prev.steps];
        const hasStep1 = ['automatic', 'manual', 'manual_partial', 'repeat_user', 'three_ds_psp', 'frm_pre', 'vault_3', 'zero_setup', 'setup_and_charge'].includes(flow.id);
        const sdkStepIndex = hasStep1 ? 2 : 1;
        
        // Build response object based on flow type - matching FLOW_MAPPINGS_V1.md exactly
        let responseData;

        // Payment Flows (Automatic, Manual, Manual Partial, Repeat User): Show ONLY key fields per FLOW_MAPPINGS_V1.md
        if (['automatic', 'manual', 'manual_partial', 'repeat_user'].includes(flow.id)) {
          responseData = {
            status: paymentStatus,
            payment_id: paymentId,
          };
        }
        // Vault Flow: Show specific fields for external vault storage
        else if (flow.id === 'vault_3') {
          responseData = {
            status: paymentStatus,
            payment_id: paymentId,
            customer_id: paymentDetails.customer_id,
            connector_transaction_id: paymentDetails.connector_transaction_id,
            network_transaction_id: paymentDetails.network_transaction_id,
          };
        }
        // Recurring Flows: Show mandate fields
        else if (['zero_setup', 'setup_and_charge'].includes(flow.id)) {
          responseData = {
            status: paymentStatus,
            payment_id: paymentId,
            payment_method_id: paymentDetails.payment_method_id,
            mandate_id: paymentDetails.mandate_id,
            connector_mandate_id: paymentDetails.connector_mandate_id,
            network_transaction_id: paymentDetails.network_transaction_id,
          };
        }
        // 3DS Flows: Show authentication_type
        else if (flow.id === 'three_ds_psp') {
          responseData = {
            status: paymentStatus,
            payment_id: paymentId,
            authentication_type: paymentDetails.authentication_type,
          };
        }
        // FRM Flows: Show frm_message with specific fields
        else if (flow.id === 'frm_pre') {
          responseData = {
            status: paymentStatus,
            payment_id: paymentId,
            frm_message: paymentDetails.frm_message ? {
              frm_name: paymentDetails.frm_message.frm_name,
              frm_transaction_id: paymentDetails.frm_message.frm_transaction_id,
              frm_transaction_type: paymentDetails.frm_message.frm_transaction_type,
              frm_status: paymentDetails.frm_message.frm_status,
              frm_score: paymentDetails.frm_message.frm_score,
              frm_reason: paymentDetails.frm_message.frm_reason,
              frm_error: paymentDetails.frm_message.frm_error,
            } : undefined,
          };
        }
        // Default fallback
        else {
          responseData = {
            status: paymentStatus,
            payment_id: paymentId,
          };
        }
        
        steps[sdkStepIndex] = {
          title: ['manual', 'manual_partial', 'zero_setup', 'setup_and_charge', 'three_ds_psp', 'frm_pre', 'vault_3'].includes(flow.id) ? 'Step 3: SDK Payment Confirmation' : 'Step 2: SDK Payment Confirmation',
          subTitle: flow.id === 'vault_3' ? 'Card stored in VGS vault (sandbox)' : undefined,
          request: 'hyper.confirmPayment()',
          response: responseData,
        };

        return { steps, currentStep: sdkStepIndex + 1 };
      });

      if (['zero_setup', 'setup_and_charge'].includes(flow.id)) {
        const retrieveResponse = await fetch(`${API_BASE_URL}/api/payment/${paymentId}`);
        const retrieveData = await retrieveResponse.json();
        
        setApiResponse((prev) => {
          const steps = [...prev.steps];
          steps.push({
            title: 'Step 4: Retrieve Payment',
            request: {
              method: 'GET',
              url: `/payments/${paymentId}`,
            },
            response: filters.recurringRetrieve(retrieveData),
          });
          return { steps, currentStep: steps.length };
        });
      }

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

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
